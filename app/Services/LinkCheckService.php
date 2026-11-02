<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\RequestOptions;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Link Availability Check Service.
 *
 * Strategy: HEAD request → fall back to GET when HEAD is not supported
 * (405/501 or an empty/odd response) → decide ok/dead by status code.
 * Timeout 10s, up to 3 redirects, response body capped when using GET.
 *
 * Result cache: 1h per host (prevents hammering the same site when a whole
 * collection is re-checked).
 */
class LinkCheckService
{
    private const CACHE_TTL = 3600;   // 1h
    private const TIMEOUT = 10;
    private const MAX_REDIRECTS = 3;
    private const MAX_BODY = 2048;    // GET fallback only reads headers + a tiny body

    /** @return array{status: string, code: int|null, message: string} */
    public function check(string $url): array
    {
        $parsed = parse_url($url);
        if (empty($parsed['scheme']) || empty($parsed['host'])) {
            return ['status' => 'dead', 'code' => null, 'message' => 'Invalid URL'];
        }

        $host = $parsed['host'];
        $cacheKey = 'link_check:' . $host;
        $cached = Cache::get($cacheKey);
        if ($cached !== null) {
            return $cached;
        }

        $client = new Client([
            RequestOptions::TIMEOUT => self::TIMEOUT,
            RequestOptions::CONNECT_TIMEOUT => self::TIMEOUT,
            RequestOptions::ALLOW_REDIRECTS => [
                'max' => self::MAX_REDIRECTS,
                'strict' => false,
                'referer' => true,
                'protocols' => ['http', 'https'],
                'track_redirects' => false,
            ],
            RequestOptions::HTTP_ERRORS => false,
            RequestOptions::VERIFY => true,
        ]);

        $result = $this->probe($client, $url, 'HEAD');
        if ($result === null) {
            // HEAD rejected or errored in a way worth retrying as GET
            $result = $this->probe($client, $url, 'GET');
        }

        if ($result === null) {
            $result = ['status' => 'dead', 'code' => null, 'message' => 'Connection failed'];
        }

        Cache::put($cacheKey, $result, self::CACHE_TTL);
        return $result;
    }

    private function probe(Client $client, string $url, string $method): ?array
    {
        try {
            $options = [RequestOptions::HTTP_ERRORS => false];
            if ($method === 'GET') {
                $options[RequestOptions::STREAM] = true;
                $options[RequestOptions::HEADERS] = [
                    'Range' => 'bytes=0-0',
                ];
            }
            $response = $client->request($method, $url, $options);
            $code = $response->getStatusCode();

            if ($code >= 200 && $code < 400) {
                return ['status' => 'ok', 'code' => $code, 'message' => 'OK'];
            }

            // HEAD often returns 405/501 even though the site works.
            if ($method === 'HEAD' && ($code === 405 || $code === 501 || $code === 403)) {
                return null; // force GET fallback
            }

            $label = $this->codeLabel($code);
            return ['status' => 'dead', 'code' => $code, 'message' => $label];
        } catch (\Exception $e) {
            if ($method === 'HEAD') {
                return null; // try GET
            }
            return ['status' => 'dead', 'code' => null, 'message' => $this->friendlyError($e)];
        }
    }

    private function codeLabel(int $code): string
    {
        $map = [
            400 => 'Bad Request', 401 => 'Unauthorized', 403 => 'Forbidden',
            404 => 'Not Found', 410 => 'Gone', 429 => 'Too Many Requests',
            451 => 'Unavailable For Legal Reasons',
            500 => 'Server Error', 502 => 'Bad Gateway', 503 => 'Service Unavailable',
            504 => 'Gateway Timeout',
        ];
        return $map[$code] ?? ('HTTP ' . $code);
    }

    private function friendlyError(\Exception $e): string
    {
        $msg = $e->getMessage();
        if (stripos($msg, 'timed out') !== false || stripos($msg, 'timeout') !== false) {
            return 'Timeout';
        }
        if (stripos($msg, 'resolve') !== false || stripos($msg, 'name') !== false) {
            return 'DNS resolution failed';
        }
        if (stripos($msg, 'certificate') !== false || stripos($msg, 'SSL') !== false) {
            return 'TLS/SSL error';
        }
        return 'Connection failed';
    }
}
