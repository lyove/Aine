<template>
    <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <!-- Hero: title + search -->
        <section v-if="heroEnabled" class="pt-10 pb-8">
            <div class="rounded-3xl bg-gradient-to-br from-[var(--theme-hero-bg-start,#6366f1)] via-[var(--theme-color-accent,#7c3aed)] to-[var(--theme-hero-bg-end,#8b5cf6)] px-6 py-10 text-center shadow-xl shadow-indigo-500/20 sm:px-10">
                <h1 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    {{ siteName }}
                </h1>
                <p v-if="siteDescription" class="mt-3 text-sm text-indigo-100 sm:text-base">
                    {{ siteDescription }}
                </p>
                <form v-if="searchEnabled" class="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-2xl bg-white p-1.5 shadow-lg" @submit.prevent="submitSearch">
                    <svg class="ml-3 h-5 w-5 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35" stroke-linecap="round"/>
                    </svg>
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="搜索网站，例如：GitHub、设计、学习…"
                        class="min-w-0 flex-1 bg-transparent py-2 text-sm text-gray-800 rounded-2xl border-0 outline-none placeholder:text-gray-400"
                    />
                    <button
                        type="submit"
                        class="shrink-0 rounded-xl bg-[var(--theme-color-primary,#4f46e5)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--theme-color-primary-hover,#4338ca)]"
                    >
                        Search
                    </button>
                </form>
            </div>
        </section>

        <!-- Featured links -->
        <section v-if="featuredEnabled && featuredLinks.length" class="pb-10">
            <h2 class="mb-5 flex items-center gap-3 text-xl font-bold tracking-tight text-gray-900">
                <span class="inline-block h-5 w-1.5 rounded-full bg-gradient-to-b from-amber-500 to-orange-500"></span>
                Featured
            </h2>
            <div :class="gridClass">
                <link-card v-for="item in featuredLinks" :key="item.id" :item="item" :path-prefix="pathPrefix" :from="$route.fullPath" />
            </div>
        </section>

        <!-- Category sections -->
        <section v-if="loading" class="pb-16">
            <div v-for="n in 3" :key="n" class="mb-10">
                <div class="mb-5 h-6 w-32 animate-pulse rounded bg-gray-200"></div>
                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div v-for="m in 4" :key="m" class="h-40 animate-pulse rounded-2xl border border-gray-200 bg-white shadow-sm"></div>
                </div>
            </div>
        </section>

        <section v-else-if="!sections.length && !featuredLinks.length" class="py-20 text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <svg class="h-8 w-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-900">No links yet</h2>
            <p class="mt-2 text-sm text-gray-500">Nothing has been published in this navigation.</p>
        </section>

        <section v-else class="pb-16">
            <div v-for="section in sections" :key="section.category.id" class="mb-12">
                <div class="mb-5 flex items-center gap-3">
                    <span
                        class="inline-block h-5 w-1.5 rounded-full"
                        :style="section.category.color ? { background: section.category.color } : null"
                        :class="!section.category.color ? 'bg-gradient-to-b from-indigo-500 to-purple-500' : ''"
                    ></span>
                    <h2 class="text-xl font-bold tracking-tight text-gray-900">{{ section.category.title }}</h2>
                    <span class="text-xs text-gray-400">{{ section.hasMore ? section.total + "+" : section.total }}</span>
                    <router-link
                        v-if="section.hasMore"
                        :to="`${pathPrefix}/category/${section.category.slug}`"
                        class="ml-auto inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-indigo-600 transition hover:gap-1.5 hover:opacity-70"
                    >
                        More
                        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </router-link>
                </div>

                <div :class="gridClass">
                    <link-card
                        v-for="item in section.items"
                        :key="item.id"
                        :item="item"
                        :path-prefix="pathPrefix"
                        :from="$route.fullPath"
                    />
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import { api } from "../../api";
import { PROJECTS } from "../../config";
import { useFrontendStore } from "../../store";
import LinkCard from "./components/LinkCard.vue";

export default {
    name: "NavigationHome",
    components: {
        LinkCard,
    },
    props: {
        project: {
            type: String,
            default: "navigation",
        },
    },
    data() {
        return {
            projectConfig: PROJECTS.navigation,
            siteName: "Navigation",
            siteDescription: "",
            searchQuery: "",
            user: null,
            categories: [],
            links: [],
            loading: true,
            heroEnabled: true,
            searchEnabled: true,
            featuredEnabled: true,
            cardColumns: 4,
        };
    },
    computed: {
        pathPrefix() {
            return this.projectConfig.path;
        },
        gridClass() {
            const map = {
                2: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2",
                3: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
                4: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4",
                5: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5",
            };
            return map[this.cardColumns] || map[4];
        },
        visibleLinks() {
            return this.links.filter((l) => !l.private || this.user);
        },
        featuredLinks() {
            return this.visibleLinks.filter((l) => l.featured);
        },
        sections() {
            // Each category shows at most 12 links on the home page; the rest is
            // reachable via the "More" link that opens the full category page.
            const MAX_LINKS_PER_CATEGORY = 12;

            return this.categories
                .map((category) => {
                    const all = this.visibleLinks.filter(
                        (l) => l.category && l.category.id === category.id
                    );
                    return {
                        category,
                        total: all.length,
                        items: all.slice(0, MAX_LINKS_PER_CATEGORY),
                        hasMore: all.length > MAX_LINKS_PER_CATEGORY,
                    };
                })
                .filter((s) => s.items.length);
        },
    },
    async mounted() {
        const store = useFrontendStore();
        this.siteName = store.settings.name || "Navigation";

        try {
            await store.loadMe();
            this.user = store.user;

            const projectPromise = api.getProject("navigation").catch(() => null);
            const globalsPromise = api.getNavigationGlobals({ _skipLocale: true, limit: 50 }).catch(() => []);

            const [project, categories] = await Promise.all([
                projectPromise,
                this.fetchAllPages((params) =>
                    api.getNavigationCategories({ _skipLocale: true, sort: "weight:asc", ...params })
                ),
            ]);

            this.applyTheme(project);
            this.categories = categories || [];

            let firstBatchShown = false;
            const showFirstBatch = () => {
                if (!firstBatchShown) {
                    firstBatchShown = true;
                    this.loading = false;
                }
            };

            await this.fetchAllPages(
                (params) =>
                    api.getNavigationLinks({ _skipLocale: true, sort: "weight:asc", ...params }),
                (batch) => {
                    this.links = this.links.concat(batch);
                    showFirstBatch();
                }
            );

            globalsPromise
                .then((globals) => {
                    const g = (globals || []).reduce((acc, item) => {
                        acc[item.label] = item.value;
                        return acc;
                    }, {});
                    if (g["site-name"]) this.siteName = g["site-name"];
                    if (g["site-description"]) this.siteDescription = g["site-description"];
                })
                .catch(() => {});
        } catch (error) {
            console.error("Failed to load navigation home:", error);
            this.loading = false;
        }
    },
    methods: {
        async fetchAllPages(loader, onBatch) {
            const PAGE_SIZE = 100;
            const all = [];
            let offset = 0;
            for (;;) {
                const batch = (await loader({ offset, limit: PAGE_SIZE })) || [];
                all.push(...batch);
                if (onBatch) {
                    onBatch(batch);
                }
                if (batch.length < PAGE_SIZE) {
                    break;
                }
                offset += PAGE_SIZE;
            }
            return all;
        },
        applyTheme(project) {
            if (!project || !project.theme) {
                return;
            }
            const tokens = project.theme.design_tokens || {};
            const el = document.documentElement;
            Object.entries(tokens).forEach(([key, value]) => {
                if (value) {
                    el.style.setProperty(key, value);
                }
            });
            const config = project.theme.config || {};
            this.heroEnabled = config.hero_enabled !== false;
            this.searchEnabled = config.search_enabled !== false;
            this.featuredEnabled = config.featured_enabled !== false;
            if (config.columns && [2, 3, 4, 5].includes(Number(config.columns))) {
                this.cardColumns = Number(config.columns);
            }
        },
        submitSearch() {
            const q = (this.searchQuery || "").trim();
            if (q.length < 2) {
                return;
            }
            this.$router.push({ path: "/navigation/search", query: { q } });
        },
    },
};
</script>
