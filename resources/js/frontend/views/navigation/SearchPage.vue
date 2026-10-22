<template>
    <div class="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div class="mb-8">
            <h1 class="flex items-center gap-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                <span class="inline-block h-7 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500"></span>
                {{ query ? `Search results for "${query}"` : "Search" }}
            </h1>
            <p class="mt-2 text-sm text-gray-500">{{ totalLabel }}</p>
        </div>

        <div v-if="loading" class="py-20 text-center">
            <div class="relative mx-auto h-10 w-10">
                <div class="absolute inset-0 rounded-full border-2 border-gray-200"></div>
                <div class="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-indigo-500"></div>
            </div>
            <p class="mt-4 text-sm text-gray-500">Searching…</p>
        </div>

        <div v-else-if="error" class="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {{ error }}
        </div>

        <div v-else-if="!query" class="py-20 text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <svg class="h-8 w-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <p class="text-sm text-gray-500">Type at least 2 characters to search the navigation links.</p>
        </div>

        <div v-else-if="results.length === 0" class="py-20 text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <svg class="h-8 w-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35M8 11h6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h2 class="text-lg font-bold text-gray-900">No results found</h2>
            <p class="mt-2 text-sm text-gray-500">We couldn't find anything for "{{ query }}". Try a different keyword.</p>
        </div>

        <div v-else class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            <LinkCard v-for="link in results" :key="link.id" :item="link" pathPrefix="/navigation" />
        </div>
    </div>
</template>

<script>
import api from "../../api";
import LinkCard from "./components/LinkCard.vue";

export default {
    name: "NavigationSearchPage",
    components: { LinkCard },
    data() {
        return {
            query: "",
            loading: false,
            error: "",
            results: [],
        };
    },
    computed: {
        queryParam() {
            return (this.$route.query.q || "").trim();
        },
        totalLabel() {
            if (!this.query) return "";
            return `${this.results.length} result${this.results.length === 1 ? "" : "s"}`;
        },
    },
    watch: {
        queryParam(q) {
            this.search(q);
        },
    },
    mounted() {
        this.search(this.queryParam);
    },
    methods: {
        // Search only the navigation project links, not the CMS/Directory/Note
        // projects that the global /search page covers.
        async search(q) {
            this.query = q;
            this.error = "";
            if (!q || q.length < 2) {
                this.results = [];
                return;
            }
            this.loading = true;
            try {
                const data = await api.searchNavigationLinks({ query: q, limit: 50 });
                this.results = Array.isArray(data) ? data : [];
            } catch (e) {
                this.error = "Search failed, please try again.";
                this.results = [];
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>
