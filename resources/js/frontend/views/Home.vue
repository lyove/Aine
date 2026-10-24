<template>
    <!-- Full-page skeleton while the home data is loading -->
    <template v-if="loading">
        <!-- Banner slider placeholder -->
        <section v-if="showSliderSection" class="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div class="pt-8">
                <div class="aspect-[21/9] animate-pulse rounded-2xl bg-gray-100"></div>
            </div>
        </section>

        <!-- Content area -->
        <section v-if="showCmsSection" class="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div class="pt-10">
                <div class="mb-7 flex items-center gap-4">
                    <div class="h-8 w-28 shrink-0 animate-pulse rounded bg-gray-200"></div>
                    <div class="h-4 min-w-0 flex-1 animate-pulse rounded bg-gray-200"></div>
                </div>

                <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <!-- Left: category tabs + cards -->
                    <div class="lg:col-span-2">
                        <div class="mb-4 border-b border-gray-200">
                            <div class="mb-2.5 flex items-center gap-2">
                                <div v-for="n in 3" :key="n" class="h-7 w-16 animate-pulse rounded bg-gray-200"></div>
                            </div>
                        </div>
                        <div class="mb-6 flex flex-wrap items-center gap-2">
                            <div v-for="n in 3" :key="n" class="h-5 w-16 animate-pulse rounded-full bg-gray-200"></div>
                        </div>
                        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-2">
                            <div v-for="n in 4" :key="n" class="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                                <div class="aspect-[16/9] animate-pulse bg-gray-100"></div>
                                <div class="flex flex-1 flex-col p-5">
                                    <div class="mb-3 h-3 w-24 animate-pulse rounded bg-gray-200"></div>
                                    <div class="mb-3 h-5 w-4/5 animate-pulse rounded bg-gray-200"></div>
                                    <div class="mb-2 h-4 w-full animate-pulse rounded bg-gray-100"></div>
                                    <div class="h-4 w-2/3 animate-pulse rounded bg-gray-100"></div>
                                    <div class="mt-auto pt-4">
                                        <div class="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Featured | Recommended tabs -->
                    <div class="lg:col-span-1">
                        <div class="mb-7 flex items-center border-b border-gray-200">
                            <div class="h-7 w-20 animate-pulse rounded bg-gray-200"></div>
                            <div class="ml-auto h-7 w-12 animate-pulse rounded bg-gray-200"></div>
                        </div>
                        <div class="space-y-3">
                            <div v-for="n in 3" :key="n" class="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                                <div class="h-20 w-24 shrink-0 animate-pulse rounded-lg bg-gray-100"></div>
                                <div class="flex min-w-0 flex-1 flex-col gap-2">
                                    <div class="h-4 w-4/5 animate-pulse rounded bg-gray-200"></div>
                                    <div class="h-3 w-1/2 animate-pulse rounded bg-gray-100"></div>
                                    <div class="mt-auto h-3 w-1/3 animate-pulse rounded bg-gray-100"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Directory area -->
        <section v-if="showDirectorySection" class="mx-auto w-full max-w-7xl px-4 sm:px-6 pb-16">
            <div class="pt-10">
                <div class="mb-7 h-8 w-36 animate-pulse rounded bg-gray-200"></div>

                <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <!-- Left: category tabs + cards -->
                    <div class="lg:col-span-2">
                        <div class="mb-4 border-b border-gray-200">
                            <div class="mb-2.5 flex items-center gap-2">
                                <div v-for="n in 3" :key="n" class="h-7 w-16 animate-pulse rounded bg-gray-200"></div>
                            </div>
                        </div>
                        <div class="mb-6 flex flex-wrap items-center gap-2">
                            <div v-for="n in 3" :key="n" class="h-5 w-16 animate-pulse rounded-full bg-gray-200"></div>
                        </div>
                        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-2">
                            <div v-for="n in 4" :key="n" class="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                                <div class="aspect-[16/9] animate-pulse bg-gray-100"></div>
                                <div class="flex flex-1 flex-col p-5">
                                    <div class="mb-3 h-3 w-24 animate-pulse rounded bg-gray-200"></div>
                                    <div class="mb-3 h-5 w-4/5 animate-pulse rounded bg-gray-200"></div>
                                    <div class="mb-2 h-4 w-full animate-pulse rounded bg-gray-100"></div>
                                    <div class="h-4 w-2/3 animate-pulse rounded bg-gray-100"></div>
                                    <div class="mt-auto pt-4">
                                        <div class="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right: featured listings -->
                    <div class="lg:col-span-1">
                        <div class="mb-4 flex items-center border-b border-gray-200">
                            <div class="h-7 w-20 animate-pulse rounded bg-gray-200"></div>
                            <div class="ml-auto h-7 w-12 animate-pulse rounded bg-gray-200"></div>
                        </div>
                        <div class="space-y-3">
                            <div v-for="n in 3" :key="n" class="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                                <div class="h-20 w-24 shrink-0 animate-pulse rounded-lg bg-gray-100"></div>
                                <div class="flex min-w-0 flex-1 flex-col gap-2">
                                    <div class="h-4 w-4/5 animate-pulse rounded bg-gray-200"></div>
                                    <div class="h-3 w-1/2 animate-pulse rounded bg-gray-100"></div>
                                    <div class="mt-auto h-3 w-1/3 animate-pulse rounded bg-gray-100"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Note area -->
        <section v-if="showNoteSection" class="mx-auto w-full max-w-7xl px-4 sm:px-6 pb-16">
            <div class="pt-10">
                <div class="mb-7 flex items-center gap-4">
                    <div class="h-8 w-24 shrink-0 animate-pulse rounded bg-gray-200"></div>
                    <div class="h-4 min-w-0 flex-1 animate-pulse rounded bg-gray-200"></div>
                </div>

                <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <!-- Left: category tabs + cards -->
                    <div class="lg:col-span-2">
                        <div class="mb-4 border-b border-gray-200">
                            <div class="mb-2.5 flex items-center gap-2">
                                <div v-for="n in 3" :key="n" class="h-7 w-16 animate-pulse rounded bg-gray-200"></div>
                            </div>
                        </div>
                        <div class="mb-6 flex flex-wrap items-center gap-2">
                            <div v-for="n in 3" :key="n" class="h-5 w-16 animate-pulse rounded-full bg-gray-200"></div>
                        </div>
                        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-2">
                            <div v-for="n in 4" :key="n" class="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                                <div class="aspect-[16/9] animate-pulse bg-gray-100"></div>
                                <div class="flex flex-1 flex-col p-5">
                                    <div class="mb-3 h-3 w-24 animate-pulse rounded bg-gray-200"></div>
                                    <div class="mb-3 h-5 w-4/5 animate-pulse rounded bg-gray-200"></div>
                                    <div class="mb-2 h-4 w-full animate-pulse rounded bg-gray-100"></div>
                                    <div class="h-4 w-2/3 animate-pulse rounded bg-gray-100"></div>
                                    <div class="mt-auto pt-4">
                                        <div class="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Featured | Recommended tabs -->
                    <div class="lg:col-span-1">
                        <div class="mb-7 flex items-center border-b border-gray-200">
                            <div class="h-7 w-20 animate-pulse rounded bg-gray-200"></div>
                            <div class="ml-auto h-7 w-12 animate-pulse rounded bg-gray-200"></div>
                        </div>
                        <div class="space-y-3">
                            <div v-for="n in 3" :key="n" class="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                                <div class="h-20 w-24 shrink-0 animate-pulse rounded-lg bg-gray-100"></div>
                                <div class="flex min-w-0 flex-1 flex-col gap-2">
                                    <div class="h-4 w-4/5 animate-pulse rounded bg-gray-200"></div>
                                    <div class="h-3 w-1/2 animate-pulse rounded bg-gray-100"></div>
                                    <div class="mt-auto h-3 w-1/3 animate-pulse rounded bg-gray-100"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </template>

    <!-- Real content once the data is loaded -->
    <template v-else>
        <!-- ===================== Banner slider (inline BannerSlider) ===================== -->
        <section v-if="showSliderSection" class="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div class="pt-8">
                <div v-if="cmsSlider.length" class="relative overflow-hidden rounded-2xl shadow-xl shadow-gray-300/30" style="aspect-ratio: 21 / 9;" @mouseenter="bannerStop" @mouseleave="bannerStart">
                    <div
                        class="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                        :style="{ transform: `translateX(-${bannerCurrent * 100}%)` }"
                    >
                        <div v-for="slide in cmsSlider" :key="slide.id" class="relative h-full w-full shrink-0">
                            <div
                                v-if="slide['featured-image'] && slide['featured-image'].full_url"
                                class="absolute inset-0 bg-cover bg-center"
                                :style="{ backgroundImage: `url('${slide['featured-image'].full_url}')` }"
                            ></div>
                            <div
                                v-else
                                class="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800"
                            ></div>
                            <div
                                class="absolute inset-0"
                                style="background: linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 35%, rgba(0,0,0,0.05) 65%, transparent 100%);"
                            ></div>

                            <div class="absolute inset-0 z-10 flex items-end p-6 sm:p-10 lg:p-12">
                                <div class="max-w-xl text-white">
                                    <router-link
                                        v-if="slide.category"
                                        :to="`/content/category/${slide.category.slug}`"
                                        class="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-widest backdrop-blur-sm transition hover:bg-white/20"
                                    >
                                        <span class="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
                                        {{ slide.category.title }}
                                    </router-link>
                                    <h2 class="mb-3 text-2xl font-extrabold leading-tight drop-shadow-lg sm:text-3xl lg:text-4xl">
                                        <router-link :to="slideLink(slide, '/content')" class="transition hover:opacity-90">
                                            {{ slide.title }}
                                        </router-link>
                                    </h2>
                                    <p v-if="slide.excerpt" class="mb-5 line-clamp-2 text-sm text-white/80 sm:text-base">
                                        {{ slide.excerpt }}
                                    </p>
                                    <router-link
                                        :to="slideLink(slide, '/content')"
                                        class="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 hover:shadow-indigo-500/40"
                                    >
                                        Read more
                                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </router-link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <template v-if="cmsSlider.length > 1">
                        <button
                            type="button"
                            aria-label="Previous slide"
                            class="group absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30"
                            @click="bannerPrev"
                        >
                            <svg class="h-5 w-5 transition group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <path d="m15 18-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <button
                            type="button"
                            aria-label="Next slide"
                            class="group absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/30"
                            @click="bannerNext"
                        >
                            <svg class="h-5 w-5 transition group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <path d="m9 18 6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>

                        <div class="absolute bottom-5 right-6 z-20 flex gap-2">
                            <button
                                v-for="(slide, index) in cmsSlider"
                                :key="index"
                                type="button"
                                :aria-label="`Go to slide ${index + 1}`"
                                class="h-2 rounded-full transition-all duration-300"
                                :class="index === bannerCurrent ? 'w-7 bg-white shadow-md' : 'w-2 bg-white/40 hover:bg-white/60'"
                                @click="bannerGo(index)"
                            ></button>
                        </div>
                    </template>
                </div>
            </div>
        </section>

        <!-- ===================== CMS section ===================== -->
        <section v-if="showCmsSection" class="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div class="pt-10">
                <div class="mb-7 flex items-center gap-4">
                    <h2 class="flex shrink-0 items-center gap-3 text-2xl font-bold tracking-tight text-gray-900">
                        <span class="inline-block h-6 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500"></span>
                        Content
                    </h2>
                    <!-- Pages ticker (inline PagesTicker) -->
                    <div
                        v-if="cmsPages.length"
                        class="group flex items-center gap-3"
                        @mouseenter="tickerStop"
                        @mouseleave="tickerStart"
                    >
                        <div class="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gray-400">
                            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span class="hidden sm:inline">Pages</span>
                        </div>
                        <div class="relative flex-1 overflow-hidden" style="height: 36px">
                            <div
                                class="flex flex-col transition-transform duration-500 ease-in-out"
                                :style="{ transform: `translateY(-${tickerIndex * 36}px)` }"
                            >
                                <router-link
                                    v-for="page in cmsPages"
                                    :key="page.id"
                                    :to="`/content/${page.slug}`"
                                    class="flex h-9 items-center truncate text-sm text-gray-600 transition hover:text-indigo-600"
                                >
                                    {{ page.title }}
                                </router-link>
                            </div>
                        </div>
                        <div class="flex shrink-0 items-center gap-1">
                            <button
                                type="button"
                                aria-label="Previous page"
                                class="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"
                                @click="tickerStep(-1)"
                            >
                                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <path d="m15 18-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                            <button
                                type="button"
                                aria-label="Next page"
                                class="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600"
                                @click="tickerStep(1)"
                            >
                                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <path d="m9 18 6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <!-- Left: category tabs (inline CategoryTabsSection + ArticleCard) -->
                    <div class="lg:col-span-2">
                        <section v-if="cmsSections.length" class="flex h-full flex-col">
                            <div class="mb-5 flex items-center border-b border-gray-200">
                                <div class="flex flex-1 items-center gap-1 overflow-x-auto scrollbar-none">
                                    <button
                                        v-for="section in cmsSections"
                                        :key="section.category.id"
                                        type="button"
                                        class="-mb-px flex-none whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition"
                                        :class="cmsActiveId === section.category.id
                                            ? 'border-indigo-600 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-900'"
                                        @click="cmsActiveId = section.category.id"
                                    >
                                        {{ section.category.title }}
                                    </button>
                                </div>
                                <router-link
                                    :to="`/content/category/${cmsActiveSection.category.slug}`"
                                    class="ml-auto flex-none inline-flex items-center gap-1 whitespace-nowrap pl-3 text-sm font-medium text-indigo-600 transition hover:gap-1.5 hover:opacity-70"
                                >
                                    More
                                    <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </router-link>
                            </div>

                            <div v-if="cmsActiveSection.tags.length" class="mb-6 flex flex-wrap items-center gap-2">
                                <div class="flex flex-1 flex-wrap items-center gap-2">
                                    <router-link
                                        v-for="tag in cmsActiveSection.tags"
                                        :key="tag.id"
                                        :to="tagLink(tag, '/content')"
                                        class="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                                    >
                                        #{{ tag.tag }}
                                    </router-link>
                                </div>
                                <span class="flex-1"></span>
                            </div>

                            <p v-if="!cmsActiveSection.items.length" class="py-12 text-center text-sm text-gray-400">
                                <svg class="mx-auto mb-3 h-10 w-10 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                No published items in this category yet.
                            </p>
                            <div v-else class="flex-1 auto-rows-fr grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-2">
                                <template v-for="item in cmsActiveSection.items" :key="item.id">
                                    <!-- Inline ArticleCard -->
                                    <article class="group flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-300/40 hover:border-indigo-200">
                                        <router-link
                                            v-if="item['featured-image'] && item['featured-image'].full_url"
                                            :to="articleLink(item, '/content')"
                                            class="relative block aspect-[16/9] overflow-hidden bg-gray-100"
                                        >
                                            <img
                                                :src="item['featured-image'].full_url"
                                                :alt="item.title"
                                                class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                loading="lazy"
                                            />
                                            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition group-hover:opacity-100"></div>
                                        </router-link>
                                        <div
                                            v-else
                                            class="relative block aspect-[16/9] overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-50"
                                        >
                                            <div class="flex h-full items-center justify-center text-indigo-300">
                                                <svg class="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                                    <path d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2 1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" stroke-linecap="round" stroke-linejoin="round"/>
                                                </svg>
                                            </div>
                                        </div>

                                        <div class="flex flex-1 flex-col p-5">
                                            <div class="mb-3 flex flex-wrap items-center gap-2 text-xs">
                                                <router-link
                                                    v-if="item.category"
                                                    :to="`/content/category/${item.category.slug}`"
                                                    class="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 font-medium text-indigo-600 transition hover:bg-indigo-100"
                                                >
                                                    {{ item.category.title }}
                                                </router-link>
                                                <span v-if="articleDate(item)" class="flex items-center gap-1 text-gray-400">
                                                    <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                                        <path d="M16 2v4M8 2v4M3 10h18"/>
                                                    </svg>
                                                    {{ articleDate(item) }}
                                                </span>
                                            </div>

                                            <h3 class="mb-2 text-lg font-bold leading-snug text-gray-900 transition group-hover:text-indigo-600">
                                                <router-link :to="articleLink(item, '/content')">{{ item.title }}</router-link>
                                            </h3>

                                            <p v-if="item.excerpt" class="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-500">
                                                {{ item.excerpt }}
                                            </p>

                                            <div class="mt-auto flex items-center justify-between">
                                                <router-link :to="articleLink(item, '/content')" class="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition hover:gap-2 hover:text-indigo-700">
                                                    Read more
                                                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
                                                    </svg>
                                                </router-link>
                                            </div>
                                        </div>
                                    </article>
                                </template>
                            </div>
                        </section>
                    </div>

                    <!-- Right: Featured | Recommended (inline FeaturedSidebar + FeaturedItem) -->
                    <div class="lg:col-span-1">
                        <section v-if="featuredArticles.length || recommendedArticles.length" class="rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white to-gray-50/50 p-5">
                            <div class="mb-5 flex items-center gap-1 border-b border-gray-200">
                                <button
                                    v-if="featuredArticles.length"
                                    type="button"
                                    class="group -mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition"
                                    :class="cmsFeaturedActive === 'featured'
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-900'"
                                    @click="cmsFeaturedActive = 'featured'"
                                >
                                    <span class="flex items-center gap-1.5">
                                        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                        Featured
                                    </span>
                                </button>
                                <button
                                    v-if="recommendedArticles.length"
                                    type="button"
                                    class="group -mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition"
                                    :class="cmsFeaturedActive === 'recommended'
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-900'"
                                    @click="cmsFeaturedActive = 'recommended'"
                                >
                                    <span class="flex items-center gap-1.5">
                                        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                        Recommended
                                    </span>
                                </button>
                                <router-link
                                    :to="cmsMoreLink"
                                    class="-mb-px ml-auto py-2.5 text-sm font-medium text-indigo-600 transition hover:opacity-70"
                                >
                                    More →
                                </router-link>
                            </div>

                            <div v-if="cmsFeaturedActive === 'featured'" class="space-y-3">
                                <article
                                    v-for="article in featuredArticles"
                                    :key="article.id"
                                    class="group flex gap-3.5 rounded-xl border border-gray-200/80 bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-md hover:border-indigo-200"
                                >
                                    <router-link
                                        v-if="article['featured-image'] && article['featured-image'].full_url"
                                        :to="featuredLink(article, '/content')"
                                        class="block h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100"
                                    >
                                        <img
                                            :src="article['featured-image'].full_url"
                                            :alt="article.title"
                                            class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </router-link>
                                    <router-link
                                        v-else
                                        :to="featuredLink(article, '/content')"
                                        class="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 text-lg font-bold text-white"
                                    >
                                        {{ featuredInitials(article) }}
                                    </router-link>

                                    <div class="flex min-w-0 flex-1 flex-col">
                                        <h3 class="mb-1.5 line-clamp-2 text-sm font-semibold leading-snug text-gray-900 transition group-hover:text-indigo-600">
                                            <router-link :to="featuredLink(article, '/content')">{{ article.title }}</router-link>
                                        </h3>
                                        <div class="mb-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-gray-400">
                                            <router-link
                                                v-if="article.category"
                                                :to="`/content/category/${article.category.slug}`"
                                                class="font-medium text-indigo-600 transition hover:text-indigo-700"
                                            >
                                                {{ article.category.title }}
                                            </router-link>
                                            <span v-if="article.category && featuredDate(article)">·</span>
                                            <span v-if="featuredDate(article)">{{ featuredDate(article) }}</span>
                                        </div>
                                        <div v-if="article.tags && article.tags.length" class="mt-auto flex flex-wrap gap-1">
                                            <router-link
                                                v-for="tag in article.tags.slice(0, 3)"
                                                :key="tag.id"
                                                :to="`/content/tag/${(tag.tag || '').toLowerCase().replace(/\s+/g, '-')}`"
                                                class="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                                            >
                                                #{{ tag.tag }}
                                            </router-link>
                                        </div>
                                    </div>
                                </article>
                            </div>
                            <div v-else class="space-y-3">
                                <article
                                    v-for="article in recommendedArticles"
                                    :key="article.id"
                                    class="group flex gap-3.5 rounded-xl border border-gray-200/80 bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-md hover:border-indigo-200"
                                >
                                    <router-link
                                        v-if="article['featured-image'] && article['featured-image'].full_url"
                                        :to="featuredLink(article, '/content')"
                                        class="block h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100"
                                    >
                                        <img
                                            :src="article['featured-image'].full_url"
                                            :alt="article.title"
                                            class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </router-link>
                                    <router-link
                                        v-else
                                        :to="featuredLink(article, '/content')"
                                        class="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 text-lg font-bold text-white"
                                    >
                                        {{ featuredInitials(article) }}
                                    </router-link>

                                    <div class="flex min-w-0 flex-1 flex-col">
                                        <h3 class="mb-1.5 line-clamp-2 text-sm font-semibold leading-snug text-gray-900 transition group-hover:text-indigo-600">
                                            <router-link :to="featuredLink(article, '/content')">{{ article.title }}</router-link>
                                        </h3>
                                        <div class="mb-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-gray-400">
                                            <router-link
                                                v-if="article.category"
                                                :to="`/content/category/${article.category.slug}`"
                                                class="font-medium text-indigo-600 transition hover:text-indigo-700"
                                            >
                                                {{ article.category.title }}
                                            </router-link>
                                            <span v-if="article.category && featuredDate(article)">·</span>
                                            <span v-if="featuredDate(article)">{{ featuredDate(article) }}</span>
                                        </div>
                                        <div v-if="article.tags && article.tags.length" class="mt-auto flex flex-wrap gap-1">
                                            <router-link
                                                v-for="tag in article.tags.slice(0, 3)"
                                                :key="tag.id"
                                                :to="`/content/tag/${(tag.tag || '').toLowerCase().replace(/\s+/g, '-')}`"
                                                class="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                                            >
                                                #{{ tag.tag }}
                                            </router-link>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </section>

        <!-- ===================== Directory section ===================== -->
        <section v-if="showDirectorySection" class="mx-auto w-full max-w-7xl px-4 sm:px-6 pb-16">
            <div class="pt-10">
                <h2 class="mb-7 flex items-center gap-3 text-2xl font-bold tracking-tight text-gray-900">
                    <span class="inline-block h-6 w-1.5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500"></span>
                    Directory
                </h2>

                <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <!-- Left: category tabs (inline CategoryTabsSection + ListingCard) -->
                    <div class="lg:col-span-2">
                        <section v-if="directorySections.length" class="flex h-full flex-col">
                            <div class="mb-5 flex items-center border-b border-gray-200">
                                <div class="flex flex-1 items-center gap-1 overflow-x-auto scrollbar-none">
                                    <button
                                        v-for="section in directorySections"
                                        :key="section.category.id"
                                        type="button"
                                        class="-mb-px flex-none whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition"
                                        :class="dirActiveId === section.category.id
                                            ? 'border-indigo-600 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-900'"
                                        @click="dirActiveId = section.category.id"
                                    >
                                        {{ section.category.title }}
                                    </button>
                                </div>
                                <router-link
                                    :to="`/directory/category/${dirActiveSection.category.slug}`"
                                    class="ml-auto flex-none inline-flex items-center gap-1 whitespace-nowrap pl-3 text-sm font-medium text-indigo-600 transition hover:gap-1.5 hover:opacity-70"
                                >
                                    More
                                    <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </router-link>
                            </div>

                            <div v-if="dirActiveSection.tags.length" class="mb-6 flex flex-wrap items-center gap-2">
                                <div class="flex flex-1 flex-wrap items-center gap-2">
                                    <router-link
                                        v-for="tag in dirActiveSection.tags"
                                        :key="tag.id"
                                        :to="tagLink(tag, '/directory')"
                                        class="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                                    >
                                        #{{ tag.tag }}
                                    </router-link>
                                </div>
                                <span class="flex-1"></span>
                            </div>

                            <p v-if="!dirActiveSection.items.length" class="py-12 text-center text-sm text-gray-400">
                                <svg class="mx-auto mb-3 h-10 w-10 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                No published items in this category yet.
                            </p>
                            <div v-else class="flex-1 auto-rows-fr grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-2">
                                <template v-for="item in dirActiveSection.items" :key="item.id">
                                    <!-- Inline ListingCard -->
                                    <article class="group flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-300/40 hover:border-indigo-200">
                                        <router-link
                                            :to="listingLink(item, '/directory')"
                                            class="relative block aspect-[16/9] overflow-hidden bg-gray-100"
                                        >
                                            <img
                                                v-if="item.logo && item.logo.full_url"
                                                :src="item.logo.full_url"
                                                :alt="item.title"
                                                class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                loading="lazy"
                                            />
                                            <div
                                                v-else
                                                class="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 text-3xl font-bold text-white shadow-inner"
                                            >
                                                {{ listingInitials(item) }}
                                            </div>
                                            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition group-hover:opacity-100"></div>
                                            <span
                                                v-if="item.featured"
                                                class="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-amber-900 shadow-md shadow-amber-400/30"
                                            >
                                                <svg class="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                                                </svg>
                                                Featured
                                            </span>
                                        </router-link>

                                        <div class="flex flex-1 flex-col p-5">
                                            <div class="mb-3 flex flex-wrap items-center gap-2 text-xs">
                                                <router-link
                                                    v-if="item.category"
                                                    :to="`/directory/category/${item.category.slug}`"
                                                    class="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 font-medium text-indigo-600 transition hover:bg-indigo-100"
                                                >
                                                    {{ item.category.title }}
                                                </router-link>
                                                <span v-if="item.location" class="flex items-center gap-1 text-gray-400">
                                                    <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                                        <circle cx="12" cy="10" r="3"/>
                                                    </svg>
                                                    {{ item.location.name }}
                                                </span>
                                                <span v-if="item['price-range']" class="ml-auto font-semibold text-emerald-600">
                                                    {{ item['price-range'] }}
                                                </span>
                                            </div>

                                            <h3 class="mb-2 text-lg font-bold leading-snug text-gray-900 transition group-hover:text-indigo-600">
                                                <router-link :to="listingLink(item, '/directory')">{{ item.title }}</router-link>
                                            </h3>

                                            <p v-if="item.description" class="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-500">
                                                {{ item.description }}
                                            </p>

                                            <div v-if="item.phone || item.website" class="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                                                <span v-if="item.phone" class="inline-flex items-center gap-1.5">
                                                    <svg class="h-3.5 w-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                                                    </svg>
                                                    {{ item.phone }}
                                                </span>
                                                <span v-if="item.website" class="inline-flex items-center gap-1.5">
                                                    <svg class="h-3.5 w-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <circle cx="12" cy="12" r="10"/>
                                                        <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>
                                                    </svg>
                                                    {{ shortWebsite(item) }}
                                                </span>
                                            </div>

                                            <div v-if="(item.tags || []).length" class="mb-2 flex flex-wrap gap-1.5">
                                                <router-link
                                                    v-for="tag in (item.tags || []).slice(0, 3)"
                                                    :key="tag.id"
                                                    :to="`/directory/tag/${(tag.tag || '').toLowerCase().replace(/\s+/g, '-')}`"
                                                    class="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                                                >
                                                    #{{ tag.tag }}
                                                </router-link>
                                            </div>

                                            <div class="mt-auto flex items-center">
                                                <router-link :to="listingLink(item, '/directory')" class="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition hover:gap-2 hover:text-indigo-700">
                                                    Read more
                                                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
                                                    </svg>
                                                </router-link>
                                            </div>
                                        </div>
                                    </article>
                                </template>
                            </div>
                        </section>
                    </div>

                    <!-- Right: featured listings (inline FeaturedListingsSidebar) -->
                    <div class="lg:col-span-1">
                        <section v-if="featuredListings.length" class="rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white to-gray-50/50 p-5">
                            <div class="mb-5 flex items-center border-b border-gray-200">
                                <span class="-mb-px inline-flex items-center gap-1.5 border-b-2 border-indigo-600 px-4 py-2.5 text-sm font-semibold text-indigo-600">
                                    <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    Featured
                                </span>
                                <router-link
                                    :to="'/directory/featured'"
                                    class="-mb-px ml-auto py-2.5 text-sm font-medium text-indigo-600 transition hover:opacity-70"
                                >
                                    More →
                                </router-link>
                            </div>

                            <div class="space-y-3">
                                <article
                                    v-for="item in featuredListings"
                                    :key="item.id"
                                    class="group flex gap-3.5 rounded-xl border border-gray-200/80 bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-md hover:border-indigo-200"
                                >
                                    <router-link
                                        :to="listingLink(item, '/directory')"
                                        class="block h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100"
                                    >
                                        <img
                                            v-if="item.logo && item.logo.full_url"
                                            :src="item.logo.full_url"
                                            :alt="item.title"
                                            class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                        <div
                                            v-else
                                            class="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white"
                                        >
                                            {{ listingInitials(item) }}
                                        </div>
                                    </router-link>

                                    <div class="flex min-w-0 flex-1 flex-col">
                                        <h3 class="mb-1.5 line-clamp-2 text-sm font-semibold leading-snug text-gray-900 transition group-hover:text-indigo-600">
                                            <router-link :to="listingLink(item, '/directory')">{{ item.title }}</router-link>
                                        </h3>
                                        <div class="mb-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-gray-400">
                                            <router-link
                                                v-if="item.category"
                                                :to="`/directory/category/${item.category.slug}`"
                                                class="font-medium text-indigo-600 transition hover:text-indigo-700"
                                            >
                                                {{ item.category.title }}
                                            </router-link>
                                            <span v-if="item.location">·</span>
                                            <span v-if="item.location">{{ item.location.name }}</span>
                                        </div>
                                        <div class="mt-auto flex items-center justify-between">
                                            <div v-if="item.tags && item.tags.length" class="flex flex-wrap gap-1">
                                                <router-link
                                                    v-for="tag in item.tags.slice(0, 2)"
                                                    :key="tag.id"
                                                    :to="`/directory/tag/${(tag.tag || '').toLowerCase().replace(/\s+/g, '-')}`"
                                                    class="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                                                >
                                                    #{{ tag.tag }}
                                                </router-link>
                                            </div>
                                            <span v-if="item['price-range']" class="ml-auto text-xs font-semibold text-emerald-600">
                                                {{ item['price-range'] }}
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </section>

        <!-- ===================== Note section ===================== -->
        <section v-if="showNoteSection" class="mx-auto w-full max-w-7xl px-4 sm:px-6 pb-16">
            <div class="pt-10">
                <div class="mb-7 flex items-center gap-4">
                    <h2 class="flex shrink-0 items-center gap-3 text-2xl font-bold tracking-tight text-gray-900">
                        <span class="inline-block h-6 w-1.5 rounded-full bg-gradient-to-b from-amber-500 to-orange-500"></span>
                        Note
                    </h2>
                </div>

                <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <!-- Left: category tabs (inline CategoryTabsSection + ArticleCard) -->
                    <div class="lg:col-span-2">
                        <section v-if="noteSections.length" class="flex h-full flex-col">
                            <div class="mb-5 flex items-center border-b border-gray-200">
                                <div class="flex flex-1 items-center gap-1 overflow-x-auto scrollbar-none">
                                    <button
                                        v-for="section in noteSections"
                                        :key="section.category.id"
                                        type="button"
                                        class="-mb-px flex-none whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition"
                                        :class="noteActiveId === section.category.id
                                            ? 'border-indigo-600 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-900'"
                                        @click="noteActiveId = section.category.id"
                                    >
                                        {{ section.category.title }}
                                    </button>
                                </div>
                                <router-link
                                    :to="`/note/category/${noteActiveSection.category.slug}`"
                                    class="ml-auto flex-none inline-flex items-center gap-1 whitespace-nowrap pl-3 text-sm font-medium text-indigo-600 transition hover:gap-1.5 hover:opacity-70"
                                >
                                    More
                                    <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </router-link>
                            </div>

                            <div v-if="noteActiveSection.tags.length" class="mb-6 flex flex-wrap items-center gap-2">
                                <div class="flex flex-1 flex-wrap items-center gap-2">
                                    <router-link
                                        v-for="tag in noteActiveSection.tags"
                                        :key="tag.id"
                                        :to="tagLink(tag, '/note')"
                                        class="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                                    >
                                        #{{ tag.tag }}
                                    </router-link>
                                </div>
                                <span class="flex-1"></span>
                            </div>

                            <p v-if="!noteActiveSection.items.length" class="py-12 text-center text-sm text-gray-400">
                                <svg class="mx-auto mb-3 h-10 w-10 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                No published items in this category yet.
                            </p>
                            <div v-else class="flex-1 auto-rows-fr grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-2">
                                <template v-for="item in noteActiveSection.items" :key="item.id">
                                    <!-- Inline ArticleCard (note variant) -->
                                    <article class="group flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-300/40 hover:border-indigo-200">
                                        <router-link
                                            v-if="item['featured-image'] && item['featured-image'].full_url"
                                            :to="articleLink(item, '/note')"
                                            class="relative block aspect-[16/9] overflow-hidden bg-gray-100"
                                        >
                                            <img
                                                :src="item['featured-image'].full_url"
                                                :alt="item.title"
                                                class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                loading="lazy"
                                            />
                                            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition group-hover:opacity-100"></div>
                                        </router-link>
                                        <div
                                            v-else
                                            class="relative block aspect-[16/9] overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-50"
                                        >
                                            <div class="flex h-full items-center justify-center text-indigo-300">
                                                <svg class="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                                    <path d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2 1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" stroke-linecap="round" stroke-linejoin="round"/>
                                                </svg>
                                            </div>
                                        </div>

                                        <div class="flex flex-1 flex-col p-5">
                                            <div class="mb-3 flex flex-wrap items-center gap-2 text-xs">
                                                <router-link
                                                    v-if="item.category"
                                                    :to="`/note/category/${item.category.slug}`"
                                                    class="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 font-medium text-indigo-600 transition hover:bg-indigo-100"
                                                >
                                                    {{ item.category.title }}
                                                </router-link>
                                                <span v-if="articleDate(item)" class="flex items-center gap-1 text-gray-400">
                                                    <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                                        <path d="M16 2v4M8 2v4M3 10h18"/>
                                                    </svg>
                                                    {{ articleDate(item) }}
                                                </span>
                                            </div>

                                            <h3 class="mb-2 text-lg font-bold leading-snug text-gray-900 transition group-hover:text-indigo-600">
                                                <router-link :to="articleLink(item, '/note')">{{ item.title }}</router-link>
                                            </h3>

                                            <p v-if="item.excerpt" class="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-500">
                                                {{ item.excerpt }}
                                            </p>

                                            <div class="mt-auto flex items-center justify-between">
                                                <router-link :to="articleLink(item, '/note')" class="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition hover:gap-2 hover:text-indigo-700">
                                                    Read more
                                                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
                                                    </svg>
                                                </router-link>
                                            </div>
                                        </div>
                                    </article>
                                </template>
                            </div>
                        </section>
                    </div>

                    <!-- Right: Featured | Recommended (inline FeaturedSidebar + FeaturedItem, note variant) -->
                    <div class="lg:col-span-1">
                        <section v-if="noteFeaturedPosts.length || noteRecommendedPosts.length" class="rounded-2xl border border-gray-200/80 bg-gradient-to-b from-white to-gray-50/50 p-5">
                            <div class="mb-5 flex items-center gap-1 border-b border-gray-200">
                                <button
                                    v-if="noteFeaturedPosts.length"
                                    type="button"
                                    class="group -mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition"
                                    :class="noteFeaturedActive === 'featured'
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-900'"
                                    @click="noteFeaturedActive = 'featured'"
                                >
                                    <span class="flex items-center gap-1.5">
                                        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                        Featured
                                    </span>
                                </button>
                                <button
                                    v-if="noteRecommendedPosts.length"
                                    type="button"
                                    class="group -mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition"
                                    :class="noteFeaturedActive === 'recommended'
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-900'"
                                    @click="noteFeaturedActive = 'recommended'"
                                >
                                    <span class="flex items-center gap-1.5">
                                        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                        Recommended
                                    </span>
                                </button>
                                <router-link
                                    :to="noteMoreLink"
                                    class="-mb-px ml-auto py-2.5 text-sm font-medium text-indigo-600 transition hover:opacity-70"
                                >
                                    More →
                                </router-link>
                            </div>

                            <div v-if="noteFeaturedActive === 'featured'" class="space-y-3">
                                <article
                                    v-for="post in noteFeaturedPosts"
                                    :key="post.id"
                                    class="group flex gap-3.5 rounded-xl border border-gray-200/80 bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-md hover:border-indigo-200"
                                >
                                    <router-link
                                        v-if="post['featured-image'] && post['featured-image'].full_url"
                                        :to="featuredLink(post, '/note')"
                                        class="block h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100"
                                    >
                                        <img
                                            :src="post['featured-image'].full_url"
                                            :alt="post.title"
                                            class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </router-link>
                                    <router-link
                                        v-else
                                        :to="featuredLink(post, '/note')"
                                        class="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 text-lg font-bold text-white"
                                    >
                                        {{ featuredInitials(post) }}
                                    </router-link>

                                    <div class="flex min-w-0 flex-1 flex-col">
                                        <h3 class="mb-1.5 line-clamp-2 text-sm font-semibold leading-snug text-gray-900 transition group-hover:text-indigo-600">
                                            <router-link :to="featuredLink(post, '/note')">{{ post.title }}</router-link>
                                        </h3>
                                        <div class="mb-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-gray-400">
                                            <router-link
                                                v-if="post.category"
                                                :to="`/note/category/${post.category.slug}`"
                                                class="font-medium text-indigo-600 transition hover:text-indigo-700"
                                            >
                                                {{ post.category.title }}
                                            </router-link>
                                            <span v-if="post.category && featuredDate(post)">·</span>
                                            <span v-if="featuredDate(post)">{{ featuredDate(post) }}</span>
                                        </div>
                                        <div v-if="post.tags && post.tags.length" class="mt-auto flex flex-wrap gap-1">
                                            <router-link
                                                v-for="tag in post.tags.slice(0, 3)"
                                                :key="tag.id"
                                                :to="`/note/tag/${(tag.tag || '').toLowerCase().replace(/\s+/g, '-')}`"
                                                class="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                                            >
                                                #{{ tag.tag }}
                                            </router-link>
                                        </div>
                                    </div>
                                </article>
                            </div>
                            <div v-else class="space-y-3">
                                <article
                                    v-for="post in noteRecommendedPosts"
                                    :key="post.id"
                                    class="group flex gap-3.5 rounded-xl border border-gray-200/80 bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-md hover:border-indigo-200"
                                >
                                    <router-link
                                        v-if="post['featured-image'] && post['featured-image'].full_url"
                                        :to="featuredLink(post, '/note')"
                                        class="block h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100"
                                    >
                                        <img
                                            :src="post['featured-image'].full_url"
                                            :alt="post.title"
                                            class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </router-link>
                                    <router-link
                                        v-else
                                        :to="featuredLink(post, '/note')"
                                        class="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 text-lg font-bold text-white"
                                    >
                                        {{ featuredInitials(post) }}
                                    </router-link>

                                    <div class="flex min-w-0 flex-1 flex-col">
                                        <h3 class="mb-1.5 line-clamp-2 text-sm font-semibold leading-snug text-gray-900 transition group-hover:text-indigo-600">
                                            <router-link :to="featuredLink(post, '/note')">{{ post.title }}</router-link>
                                        </h3>
                                        <div class="mb-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-gray-400">
                                            <router-link
                                                v-if="post.category"
                                                :to="`/note/category/${post.category.slug}`"
                                                class="font-medium text-indigo-600 transition hover:text-indigo-700"
                                            >
                                                {{ post.category.title }}
                                            </router-link>
                                            <span v-if="post.category && featuredDate(post)">·</span>
                                            <span v-if="featuredDate(post)">{{ featuredDate(post) }}</span>
                                        </div>
                                        <div v-if="post.tags && post.tags.length" class="mt-auto flex flex-wrap gap-1">
                                            <router-link
                                                v-for="tag in post.tags.slice(0, 3)"
                                                :key="tag.id"
                                                :to="`/note/tag/${(tag.tag || '').toLowerCase().replace(/\s+/g, '-')}`"
                                                class="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                                            >
                                                #{{ tag.tag }}
                                            </router-link>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </section>
    </template>
</template>

<script>
import { api } from "../api";
import { PROJECTS, COLLECTIONS, DEFAULT_PORTAL } from "../config";
import { formatDate } from "../../utils/filters";

const ROW_HEIGHT = 36; // must match h-9 (PagesTicker)

export default {
    name: "Home",
    data() {
        return {
            cms: PROJECTS.cms,
            directory: PROJECTS.directory,
            note: PROJECTS.note,
            loading: true,
            featuredArticles: [],
            recommendedArticles: [],
            featuredListings: [],
            cmsSlider: [],
            cmsPages: [],
            cmsSections: [],
            directorySections: [],
            noteFeaturedPosts: [],
            noteRecommendedPosts: [],
            notePages: [],
            noteSections: [],

            // Inline BannerSlider state
            bannerCurrent: 0,
            bannerTimer: null,
            // Inline PagesTicker state
            tickerIndex: 0,
            tickerTimer: null,
            // Inline CategoryTabsSection state (one per section)
            cmsActiveId: null,
            dirActiveId: null,
            noteActiveId: null,
            // Inline FeaturedSidebar state
            cmsFeaturedActive: "featured",
            noteFeaturedActive: "featured",
        };
    },
    computed: {
        showCmsSection() {
            return this.hasAnyBlock(this.cms, ["categoryTabs", "featured", "recommended", "pages"]);
        },
        showDirectorySection() {
            return this.hasAnyBlock(this.directory, ["categoryTabs", "featured"]);
        },
        showNoteSection() {
            return this.hasAnyBlock(this.note, ["categoryTabs", "featured", "recommended", "pages"]);
        },
        showSliderSection() {
            return this.hasBlock(this.cms, "slider");
        },

        // Inline CategoryTabsSection computed (one per section)
        cmsActiveSection() {
            if (!this.cmsSections.length) return { category: {}, items: [], tags: [] };
            return this.cmsSections.find((s) => s.category.id === this.cmsActiveId) || this.cmsSections[0];
        },
        dirActiveSection() {
            if (!this.directorySections.length) return { category: {}, items: [], tags: [] };
            return this.directorySections.find((s) => s.category.id === this.dirActiveId) || this.directorySections[0];
        },
        noteActiveSection() {
            if (!this.noteSections.length) return { category: {}, items: [], tags: [] };
            return this.noteSections.find((s) => s.category.id === this.noteActiveId) || this.noteSections[0];
        },

        // Inline FeaturedSidebar computed (one per section)
        cmsMoreLink() {
            return this.cmsFeaturedActive === "featured" ? "/content/featured" : "/content/recommended";
        },
        noteMoreLink() {
            return this.noteFeaturedActive === "featured" ? "/note/featured" : "/note/recommended";
        },
    },
    async mounted() {
        try {
            const cms = this.cms;
            const directory = this.directory;
            const note = this.note;

            const [cmsPortal, directoryPortal, notePortal] = await Promise.all([
                api.getCmsPortal({ collection: cms.contentCollection }).catch(() => null),
                api.getDirectoryPortal({ collection: directory.contentCollection }).catch(() => null),
                api.getNotePortal({ collection: note.contentCollection }).catch(() => null),
            ]);

            const cmsData = this.mapSections(cms, cmsPortal, true);
            this.featuredArticles = cmsData.featured;
            this.recommendedArticles = cmsData.recommended;
            this.cmsSlider = cmsData.slider;
            this.cmsPages = cmsData.pages;
            this.cmsSections = cmsData.sections;

            const directoryData = this.mapSections(directory, directoryPortal, false);
            this.featuredListings = directoryData.featured;
            this.directorySections = directoryData.sections;

            const noteData = this.mapSections(note, notePortal, true);
            this.noteFeaturedPosts = noteData.featured;
            this.noteRecommendedPosts = noteData.recommended;
            this.notePages = noteData.pages;
            this.noteSections = noteData.sections;
        } catch (error) {
            console.error("Failed to load home data:", error);
        } finally {
            this.loading = false;
        }

        // Inline BannerSlider / PagesTicker lifecycle
        this.bannerStart();
        this.tickerStart();
    },
    beforeUnmount() {
        this.bannerStop();
        this.tickerStop();
    },
    watch: {
        cmsSections(list) {
            if (list.length && !list.some((s) => s.category.id === this.cmsActiveId)) {
                this.cmsActiveId = list[0].category.id;
            }
        },
        directorySections(list) {
            if (list.length && !list.some((s) => s.category.id === this.dirActiveId)) {
                this.dirActiveId = list[0].category.id;
            }
        },
        noteSections(list) {
            if (list.length && !list.some((s) => s.category.id === this.noteActiveId)) {
                this.noteActiveId = list[0].category.id;
            }
        },
        featuredArticles(list) {
            if (!list.length && this.recommendedArticles.length) this.cmsFeaturedActive = "recommended";
        },
        noteFeaturedPosts(list) {
            if (!list.length && this.noteRecommendedPosts.length) this.noteFeaturedActive = "recommended";
        },
    },
    methods: {
        /**
         * Map the portal /portal skeleton onto the home page state.
         * Keeps the original fallback rules (featured/recommended/slider fall
         * back to latest when empty) and prunes the blocks the project does
         * not declare in its portal config.
         */
        mapSections(project, portal, fallbackToLatest = false) {
            if (!portal) {
                return { featured: [], recommended: [], slider: [], pages: [], sections: [] };
            }
            const blocks = project.portal || DEFAULT_PORTAL;

            const featuredRaw = Array.isArray(portal.featured) ? portal.featured : [];
            const recommendedRaw = Array.isArray(portal.recommended) ? portal.recommended : [];
            const sliderRaw = Array.isArray(portal.slider) ? portal.slider : [];
            const latest = Array.isArray(portal.latest) ? portal.latest : [];

            const featured = fallbackToLatest && !featuredRaw.length ? latest : featuredRaw;
            const recommended = fallbackToLatest && !recommendedRaw.length ? latest : recommendedRaw;
            const withImage = latest.filter((a) => a["featured-image"] && a["featured-image"].full_url);
            const slider =
                fallbackToLatest && !sliderRaw.length
                    ? (withImage.length ? withImage : latest).slice(0, 5)
                    : sliderRaw.slice(0, 5);

            return {
                featured: blocks.includes("featured") ? featured : [],
                recommended: blocks.includes("recommended") ? recommended : [],
                slider: blocks.includes("slider") ? slider : [],
                pages: blocks.includes("pages") && Array.isArray(portal.pages) ? portal.pages : [],
                sections: blocks.includes("categoryTabs") && Array.isArray(portal.categories) ? portal.categories : [],
            };
        },

        hasBlock(project, block) {
            return (project.portal || DEFAULT_PORTAL).includes(block);
        },

        hasAnyBlock(project, blocks) {
            return blocks.some((b) => this.hasBlock(project, b));
        },

        // --- Inline ArticleCard helpers ---
        articleLink(item, pathPrefix) {
            const category = item.category ? item.category.slug : "articles";
            const url = item.slug || item.id;
            return `${pathPrefix}/${category}/${url}`;
        },
        articleDate(item) {
            if (!item.published_at) return null;
            return formatDate(item.published_at, "MMM D, YYYY");
        },

        // --- Inline ListingCard helpers ---
        listingLink(item, pathPrefix) {
            const category = item.category ? item.category.slug : "listings";
            const url = item.slug || item.id;
            return `${pathPrefix}/${category}/${url}`;
        },
        listingInitials(item) {
            return (item.title || "?")
                .split(/\s+/)
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase();
        },
        shortWebsite(item) {
            return (item.website || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
        },

        // --- Inline FeaturedItem helpers ---
        featuredLink(item, pathPrefix) {
            const category = item.category ? item.category.slug : "articles";
            const url = item.slug || item.id;
            return `${pathPrefix}/${category}/${url}`;
        },
        featuredDate(item) {
            if (!item.published_at) return null;
            return formatDate(item.published_at, "MMM D, YYYY");
        },
        featuredInitials(item) {
            const title = item.title || "?";
            return title
                .split(/\s+/)
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase();
        },

        // --- Inline BannerSlider helpers ---
        slideLink(slide, pathPrefix) {
            const category = slide.category ? slide.category.slug : "articles";
            const url = slide.slug || slide.id;
            return `${pathPrefix || ''}/${category}/${url}`;
        },
        bannerGo(index) {
            this.bannerCurrent = (index + this.cmsSlider.length) % this.cmsSlider.length;
        },
        bannerNext() {
            this.bannerGo(this.bannerCurrent + 1);
        },
        bannerPrev() {
            this.bannerGo(this.bannerCurrent - 1);
        },
        bannerStart() {
            if (this.bannerTimer || this.cmsSlider.length <= 1) return;
            this.bannerTimer = setInterval(this.bannerNext, 5000);
        },
        bannerStop() {
            if (this.bannerTimer) {
                clearInterval(this.bannerTimer);
                this.bannerTimer = null;
            }
        },

        // --- Inline PagesTicker helpers ---
        tickerStep(dir) {
            const len = this.cmsPages.length;
            if (!len) return;
            this.tickerIndex = (this.tickerIndex + dir + len) % len;
        },
        tickerStart() {
            if (this.tickerTimer || this.cmsPages.length <= 1) return;
            this.tickerTimer = setInterval(() => this.tickerStep(1), 3000);
        },
        tickerStop() {
            if (this.tickerTimer) {
                clearInterval(this.tickerTimer);
                this.tickerTimer = null;
            }
        },

        // --- Inline CategoryTabsSection helpers ---
        tagLink(tag, pathPrefix) {
            const slug = (tag.tag || "").toLowerCase().replace(/\s+/g, "-");
            return `${pathPrefix}/tag/${slug}`;
        },
    },
};
</script>

<style scoped>
.scrollbar-none {
    scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
    display: none;
}
</style>
