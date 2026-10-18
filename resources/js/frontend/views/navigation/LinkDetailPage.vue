<template>
    <div class="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <router-link
            :to="backTarget"
            class="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:gap-2 hover:text-indigo-600"
        >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m12 19-7-7 7-7M19 12H5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Back to navigation
        </router-link>

        <div v-if="loading" class="space-y-4">
            <div class="h-8 w-2/3 animate-pulse rounded bg-gray-200"></div>
            <div class="h-40 animate-pulse rounded-2xl bg-gray-100"></div>
        </div>

        <div v-else-if="!item" class="py-20 text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <svg class="h-8 w-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="10" r="3"/>
                </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-900">Link not found</h2>
            <p class="mt-2 text-sm text-gray-500">This link may have been unpublished or removed.</p>
            <router-link to="/navigation" class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 transition hover:gap-1.5 hover:opacity-70">
                Back to navigation
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </router-link>
        </div>

        <template v-else>
            <!-- Meta: category + tags -->
            <div class="mb-4 flex flex-wrap items-center gap-2 text-sm">
                <router-link
                    v-if="item.category"
                    :to="`/navigation/category/${item.category.slug}`"
                    class="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 font-medium text-indigo-600 transition hover:bg-indigo-100"
                >
                    {{ item.category.title }}
                </router-link>
                <span
                    v-if="item.featured"
                    class="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-amber-900 shadow-sm"
                >
                    <svg class="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                    Featured
                </span>
                <span
                    v-if="item.private"
                    class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500"
                >
                    <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Private
                </span>
            </div>

            <!-- Header: icon + title -->
            <div class="flex items-start gap-5">
                <img
                    v-if="faviconUrl"
                    :src="faviconUrl"
                    :alt="item.title"
                    class="h-20 w-20 shrink-0 rounded-2xl border border-gray-200 object-cover shadow-sm"
                    @error="onFaviconError"
                />
                <div
                    v-else
                    class="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white shadow-md"
                >
                    {{ initials }}
                </div>
                <div class="min-w-0">
                    <h1 class="text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl">
                        {{ item.title }}
                    </h1>
                    <p class="mt-2 flex items-center gap-1.5 break-all text-sm text-gray-400">
                        <svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                        {{ item.url }}
                    </p>
                </div>
            </div>

            <!-- Actions -->
            <div class="mt-6 flex flex-wrap items-center gap-3">
                <a
                    :href="item.url"
                    target="_blank"
                    rel="noopener nofollow"
                    class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500"
                >
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <path d="M15 3h6v6M10 14 21 3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Visit Website
                </a>
                <a
                    :href="item.url"
                    target="_blank"
                    rel="noopener nofollow"
                    class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:border-indigo-200 hover:text-indigo-600"
                >
                    {{ shortUrl }}
                </a>
            </div>

            <!-- Description -->
            <p v-if="item.description" class="mt-8 text-base leading-relaxed text-gray-600">
                {{ item.description }}
            </p>

            <!-- Tags -->
            <div v-if="(item.tags || []).length" class="mt-8">
                <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">Tags</h2>
                <div class="flex flex-wrap gap-2">
                    <router-link
                        v-for="tag in (item.tags || [])"
                        :key="tag.id"
                        :to="`/navigation/tag/${(tag.tag || '').toLowerCase().replace(/\s+/g, '-')}`"
                        class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                    >
                        #{{ tag.tag }}
                    </router-link>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import { api } from "../../api";

export default {
    name: "NavigationLinkDetail",
    props: {
        project: {
            type: String,
            default: "navigation",
        },
    },
    data() {
        return {
            item: null,
            loading: true,
            autoFavicon: "",
            faviconFailed: false,
        };
    },
    computed: {
        linkId() {
            return this.$route.params.id;
        },
        backTarget() {
            return this.$route.query.from || "/navigation";
        },
        faviconUrl() {
            if (this.item && this.item.favicon && this.item.favicon.full_url) {
                return this.item.favicon.full_url;
            }
            return this.autoFavicon || null;
        },
        initials() {
            return (this.item.title || "?")
                .split(/\s+/)
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase();
        },
        shortUrl() {
            return (this.item.url || "")
                .replace(/^https?:\/\//, "")
                .replace(/\/$/, "");
        },
    },
    async mounted() {
        try {
            const data = await api.getNavigationLink(this.linkId, {
                _skipLocale: true,
                timestamps: true,
            });
            this.item = data || null;
            if (this.item && this.item.url && !this.faviconUrl && !this.faviconFailed) {
                try {
                    const result = await api.getFavicon(this.item.url);
                    if (result && result.favicon_url) {
                        this.autoFavicon = result.favicon_url;
                    } else {
                        this.faviconFailed = true;
                    }
                } catch (error) {
                    this.faviconFailed = true;
                }
            }
        } catch (error) {
            console.error("Failed to load link detail:", error);
            this.item = null;
        } finally {
            this.loading = false;
        }
    },
    methods: {
        onFaviconError() {
            this.autoFavicon = "";
            this.faviconFailed = true;
        },
    },
};
</script>
