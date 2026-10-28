<template>
    <div class="admin__localization m-3 p-3">
    <template v-if="!embedded">
        <h1 class="text-xl font-bold text-gray-900">{{ __('Localization') }}</h1>
        <p class="text-sm text-gray-500 mt-1 mb-6">
            {{ __('Admin panel languages. The default language is the source language of the UI — translations for other languages are managed in') }}
            <router-link to="/translations" class="text-indigo-600 hover:underline">{{ __('Translations') }}</router-link>.
        </p>
    </template>

        <!-- Add language -->
        <div class="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
            <select-dropdown
                :options="localesOptions.map((o) => ({ id: o.id, name: o.id + ' - ' + o.name }))"
                class="w-72"
                :placeholder="__('Select Locale')"
                :multiple="false"
                :clearable="false"
                v-model="newCode"
            ></select-dropdown>
            <button
                type="button"
                class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                @click="addLocale"
            >
                {{ __('Add language') }}
            </button>
            <span class="text-xs text-gray-500">
                {{ __('Same language list as the project Localization page.') }}
            </span>
        </div>

        <!-- Locales table -->
        <div v-if="loading" class="space-y-2">
            <div v-for="n in 4" :key="n" class="h-14 animate-pulse rounded-lg bg-gray-100"></div>
        </div>

        <div v-else class="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div
                v-for="l in locales"
                :key="l.code"
                class="flex items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0 hover:bg-gray-50"
            >
                <span class="w-16 rounded-md bg-gray-100 px-2 py-1 text-center text-sm font-bold text-gray-700">
                    {{ l.code.toUpperCase() }}
                </span>
                <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-gray-800">
                        {{ l.name || displayName(l.code) }}
                    </div>
                    <div v-if="l.code === baseLocale" class="text-xs text-indigo-600">
                        {{ __('Default language (source of the UI strings)') }}
                    </div>
                </div>

                <button
                    v-if="l.code !== baseLocale"
                    type="button"
                    class="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:border-indigo-500 hover:text-indigo-600"
                    @click="setDefault(l.code)"
                >
                    {{ __('Set as default') }}
                </button>

                <button
                    v-if="l.code !== baseLocale"
                    type="button"
                    class="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-500 transition hover:bg-red-50"
                    @click="removeLocale(l.code)"
                >
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { __ } from '@/admin/translations/engine';

import { useAdminStore } from "@/admin/store";
import { LOCALES, localeDisplayName } from "@/admin/utils/locales";
import SelectDropdown from "@/components/SelectDropdown";

export default {
    name: "Localization",
    components: {
        SelectDropdown,
    },
    props: {
        // Boolean type is required: `embedded` written as a bare attribute
        // arrives as "" and only Boolean-typed props get cast to true.
        embedded: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            baseLocale: "en",
            locales: [],
            loading: true,
            newCode: null,
            localesOptions: LOCALES,
        };
    },
    created() {
        useAdminStore().setTopbarContent({
            page: "localization",
            type: "settings",
            title: __("Localization"),
            breadcrumb: [
                { name: "Dashboard", url: "/", icon: "fa fa-tachometer-alt" },
                { name: "Localization", icon: "fas fa-globe" },
            ],
        });
    },
    async mounted() {
        await this.load();
    },
    methods: {
        displayName(code) {
            if (code === "en") return __("English");
            if (code === "zh") return __("中文");
            return __(code.toUpperCase());
        },
        async load() {
            this.loading = true;
            try {
                const { data } = await axios.get("localization");
                this.baseLocale = data.base_locale;
                this.locales = data.locales || [];
            } catch (error) {
                console.error("Failed to load localization:", error);
            } finally {
                this.loading = false;
            }
        },
        async addLocale() {
            const code = this.newCode;
            if (!code) return;

            try {
                await axios.post("localization", {
                    code,
                    name: localeDisplayName(code) || code.toUpperCase(),
                });
                this.newCode = null;
                this.$toast.success(__('Language "{languageName}" added.', { languageName: code }));
                await this.load();
            } catch (error) {
                const backendMsg = error.response?.data?.error || error.response?.data?.message;
                this.$toast.error(backendMsg ? __(backendMsg) : __('Failed to add language.'));
            }
        },
        setDefault(code) {
            this.$swal
                .fire({
                    title: __('Are you sure'),
                    text: __('you want to set "{languageName}" as the default (source) UI language?', { languageName: code }),
                })
                .then(async (result) => {
                    if (!result.isConfirmed) return;
                    try {
                        await axios.post("localization/set-default", { code });
                        this.$toast.success(__('Default language is now "{languageName}".', { languageName: code }));
                        await this.load();
                        // Apply the new default immediately — the global
                        // default is the ONLY way to change the admin's
                        // display language (the topbar switcher was removed).
                        // Passing the code skips a stale cached apply.
                        await useAdminStore().initUiLocale(code);
                    } catch (error) {
                        this.$toast.error(__('Failed to set default language.'));
                    }
                });
        },
        removeLocale(code) {
            this.$swal
                .fire({
                    title: __('Are you sure'),
                    text: __('you want to remove language "{languageName}" and all of its translations?', { languageName: code }),
                })
                .then(async (result) => {
                    if (!result.isConfirmed) return;
                    try {
                        await axios.delete(`localization/${code}`);
                        this.$toast.success(__('Language "{languageName}" removed.', { languageName: code }));
                        await this.load();
                        await useAdminStore().loadUiLocales();
                    } catch (error) {
                        const backendMsg = error.response?.data?.error;
                        this.$toast.error(backendMsg ? __(backendMsg) : __('Failed to remove language.'));
                    }
                });
        },
    },
};
</script>

