<template>
    <article
        class="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-300/40 hover:border-indigo-200"
    >
        <component
            :is="isDirect ? 'a' : 'router-link'"
            v-bind="linkAttrs"
            class="flex flex-1 flex-col p-5"
            :title="isDirect ? `Open ${item.title} in a new tab` : `View details of ${item.title}`"
        >
            <div class="mb-3 flex items-center gap-3">
                <div class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                    <img
                        v-if="faviconUrl"
                        :src="faviconUrl"
                        :alt="item.title"
                        class="h-full w-full object-contain"
                        loading="lazy"
                        @error="onFaviconError"
                    />
                    <span v-else class="text-base font-bold text-indigo-500">{{ initials }}</span>
                </div>
                <div class="min-w-0 flex-1">
                    <h3 class="truncate text-base font-bold text-gray-900 transition group-hover:text-indigo-600">
                        {{ item.title }}
                    </h3>
                    <p class="truncate text-xs text-gray-400">{{ shortUrl }}</p>
                </div>
                <span
                    v-if="item.featured"
                    class="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-900"
                >
                    <svg class="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                    Featured
                </span>
                <span
                    v-if="item.private"
                    class="inline-flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500"
                    title="Private link — only visible when logged in"
                >
                    <svg class="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Private
                </span>
            </div>

            <p v-if="item.description" class="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-500">
                {{ item.description }}
            </p>

            <div v-if="(item.tags || []).length" class="mt-auto flex flex-wrap gap-1.5 pt-2">
                <span
                    v-for="tag in (item.tags || []).slice(0, 3)"
                    :key="tag.id"
                    class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500"
                >
                    #{{ tag.tag }}
                </span>
            </div>
        </component>

        <!-- Visit website (detail mode only): always opens the external site in a NEW tab so this site stays open -->
        <a
            v-if="!isDirect"
            :href="item.url"
            target="_blank"
            rel="noopener nofollow"
            :title="`Open ${item.title} in a new tab`"
            class="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-gray-400 opacity-0 shadow-sm ring-1 ring-gray-200 transition group-hover:opacity-100 hover:bg-indigo-50 hover:text-indigo-600"
        >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <path d="M15 3h6v6M10 14 21 3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </a>
    </article>
</template>

<script>
export default {
    name: "LinkCard",
    props: {
        item: {
            type: Object,
            required: true,
        },
        pathPrefix: {
            type: String,
            default: "/navigation",
        },
        from: {
            type: String,
            default: "",
        },
    },
    computed: {
        isDirect() {
            return this.item.click_behavior === "direct";
        },
        linkAttrs() {
            return this.isDirect
                ? { href: this.item.url, target: "_blank", rel: "noopener nofollow" }
                : { to: { path: this.detailPath, query: this.from ? { from: this.from } : {} } };
        },
        detailPath() {
            return `${this.pathPrefix}/link/${this.item.id}`;
        },
        faviconUrl() {
            return this.item.favicon && this.item.favicon.full_url
                ? this.item.favicon.full_url
                : null;
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
    methods: {
        onFaviconError() {
            // Broken favicon image: the card falls back to the initials block.
        },
    },
};
</script>
