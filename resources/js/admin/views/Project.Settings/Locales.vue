<template>
    <div class="admin__project-settings-locales relative h-full flex flex-col">
        <project-header v-if="!embedded" :project="project"></project-header>

        <div class="flex flex-1 overflow-y-auto">
            <div v-if="!embedded" class="w-72 bg-white overflow-x-hidden">
                <settings-sidebar :project="project"></settings-sidebar>
            </div>
            <div class="min-w-0 flex-1 overflow-x-hidden">
                <div class="p-4">
                    <h4 v-if="!embedded" class="mb-2 p-2 font-bold text-xl">{{ __('Localization') }}</h4>

                    <div class="w-full bg-white rounded-md p-4">
                        <div class="section">
                            <div class="w-full flex justify-between">
                                <div class="text-lg font-bold">
                                    {{ __('Available Locales') }}
                                </div>
                            </div>
                            <div class="overflow-x-auto mt-1 flex border rounded-md">
                                <!-- Loading skeleton: keeps the layout stable
                                     while the locales request is in flight. -->
                                <div v-if="loading" class="w-full p-4">
                                    <div
                                        v-for="n in 3"
                                        :key="n"
                                        class="h-10 mb-2 bg-gray-100 animate-pulse rounded-md"
                                    ></div>
                                </div>
                                <table v-else class="min-w-full divide-y divide-gray-200">
                                    <tbody class="bg-white divide-y divide-gray-200">
                                        <tr
                                            v-for="locale in localeList"
                                            :key="locale"
                                        >
                                            <td class="px-6 py-3 text-sm align-top">
                                                {{ locale }}
                                            </td>
                                            <td class="px-6 py-3 text-sm align-top">
                                                {{ getLocale(locale) }}
                                            </td>
                                            <td class="px-6 py-3 text-sm w-px text-center font-bold whitespace-nowrap">
                                                <div v-if="locale == project.default_locale">
                                                    {{ __('Default') }}
                                                </div>
                                                <div
                                                    v-else-if="!isReadonly"
                                                    class="ml-2 cursor-pointer text-indigo-500 py-1 px-3 rounded-md hover:bg-gray-100"
                                                    @click="setDefaultLocale(locale)"
                                                >
                                                    {{ __('Set as default') }}
                                                </div>
                                            </td>
                                            <td
                                                class="px-6 py-3 text-sm w-px text-center"
                                            >
                                                <div
                                                    v-if="locale != project.default_locale && !isReadonly"
                                                    class="ml-2 cursor-pointer text-red-500 py-1 px-3 rounded-md hover:bg-gray-100"
                                                    @click="deleteLocale(locale)"
                                                >
                                                    <i class="fa fa-trash-alt"></i>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div class="section mt-4">
                            <div class="w-full flex justify-between">
                                <div class="text-lg font-bold">
                                    {{ __('Add a Locale') }}
                                </div>
                            </div>

                            <div class="flex">
                                <div class="w-1/2 mr-2">
                                    <select-dropdown
                                        :options="locales.map((o) => ({ id: o.id, name: o.id + ' - ' + o.name }))"
                                        :placeholder="__('Select Locale')"
                                        :multiple="false"
                                        :clearable="false"
                                        v-model="addLocaleData"
                                    ></select-dropdown>
                                </div>

                                <ui-button
                                    color="indigo-500"
                                    padding="h-9 flex items-center px-3"
                                    v-if="!isReadonly"
                                    @click="addLocale"
                                >
                                    {{ __('+ Add') }}
                                </ui-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import UiButton from "@/components/Button.vue";
import SelectDropdown from "@/components/SelectDropdown";
import ProjectHeader from "@/admin/components/ProjectHeader.vue";
import SettingsSidebar from "@/admin/components/SettingsSidebar.vue";
import localesJson from "@/locales.json";

import { __ } from '@/admin/translations/engine';
import { LOCALES, localeDisplayName } from "@/admin/utils/locales";
import { useAdminStore } from "@/admin/store";

export default {
    props: {
        embedded: {
            type: Boolean,
            default: false,
        },
    },
    components: {
        ProjectHeader,
        SettingsSidebar,
        UiButton,
        SelectDropdown,
    },


    data() {
        const storeProject = useAdminStore().currentProject || {};
        return {
            project: storeProject,
            loading: !Object.keys(storeProject).length,
            locales: [],
            addLocaleData: null,
        };
    },

    computed: {
        isReadonly() {
            return this.project && (this.project.is_readonly || !this.project.status);
        },
        localeList() {
            const raw = this.project.locales;
            if (Array.isArray(raw)) {
                return raw;
            }
            if (raw && typeof raw === "string") {
                return raw.split(",").filter((l) => l !== "");
            }
            return [];
        },
    },

    methods: {
        getProject(options = {}) {
            if (!options.background) {
                this.loading = true;
            }
            axios
                .get(
                    "projects/settings/locales/" +
                        this.$route.params.project_id
                )
                .then((response) => {
                    this.project = response.data;
                    if (this.project.locales !== null) {
                        this.project.locales = response.data.locales.split(",");
                    }
                })
                .catch((error) => {
                    console.warn("Failed to load project locales:", error);
                })
                .finally(() => {
                    this.loading = false;
                });
        },

        getLocale(locale) {
            return localeDisplayName(locale) || locale;
        },

        addLocale() {
            axios
                .post(
                    "projects/settings/locales/add/" +
                        this.$route.params.project_id,
                    { locale: this.addLocaleData }
                )
                .then(
                    (response) => {
                        this.$toast.success(__('Locale added to the project.'));
                        this.getProject({ background: true });
                        this.addLocaleData = null;
                    },
                    (error) => {
                        if (error.response && error.response.status == 422) {
                            this.$toast.error(__('Locale has already added.'));
                        }
                    }
                );
        },

        setDefaultLocale(locale) {
            this.$swal
                .fire({
                    title: __('Are you sure'),
                    text: __('you want to change the default locale for this project?'),
                })
                .then((result) => {
                    if (result.isConfirmed) {
                        axios
                            .post(
                                "projects/settings/locales/change-default-locale/" +
                                    this.project.id,
                                { locale: locale }
                            )
                            .then((response) => {
                                this.$toast.success(
                                    __('Default locale has been changed.')
                                );
                                this.getProject({ background: true });
                            });
                    }
                });
        },

        deleteLocale(locale) {
            this.$swal
                .fire({
                    title: __('Are you sure'),
                    text: __('you want to delete this locale?'),
                })
                .then((result) => {
                    if (result.isConfirmed) {
                        axios
                            .post(
                                "projects/settings/locales/delete-locale/" +
                                    this.project.id,
                                { locale: locale }
                            )
                            .then(
                                (response) => {
                                    this.$toast.success(__('Locale deleted.'));
                                    this.getProject({ background: true });
                                },
                                (error) => {
                                    if (error.response && error.response.status == 422) {
                                        this.$toast.error(
                                            __('Default locale can not be deleted.')
                                        );
                                    }
                                }
                            );
                    }
                });
        },
    },

    mounted() {
        this.getProject();

        this.locales = LOCALES;
    },
};
</script>

