<template>
    <div class="flex flex-col h-full bg-gray-900 relative">
        <!-- Logo section -->
        <div class="admin__brand border-b border-gray-800 py-6" :class="collapsed ? 'px-2' : 'text-center px-4'">
            <brand :size="collapsed ? 'sm' : 'md'" mode="light" :imgclass="collapsed ? 'w-8' : 'w-20'"></brand>
        </div>
        
        <!-- Main menu -->
        <nav class="admin__main-menu flex flex-col flex-1 overflow-y-auto py-4 space-y-1" :class="collapsed ? 'px-2' : 'px-3'">
            <!-- Dashboard -->
            <router-link
                :to="{ name: 'dashboard' }"
                :exact-active-class="'bg-indigo-600 text-white shadow-lg'"
                class="admin__main-menu-item flex items-center rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200 group"
                :class="collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'"
                @mouseenter="showTooltip($event, __('Dashboard'))"
                @mouseleave="hideTooltip"
            >
                <div class="w-9 h-9 flex-shrink-0 rounded-lg bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors" :class="collapsed ? '' : 'mr-3'">
                    <i class="fas fa-tachometer-alt text-indigo-400 text-sm"></i>
                </div>
                <span v-show="!collapsed" class="text-sm font-medium whitespace-nowrap">{{ __('Dashboard') }}</span>
            </router-link>
            
            <!-- Projects -->
            <div class="admin__menu-group">
                <router-link
                    :to="{ name: 'projects' }"
                    :class="['admin__main-menu-item flex items-center rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200 group', { 'bg-indigo-600 text-white shadow-lg': isProjectsActive && !isProjectPage }, collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3']"
                    @mouseenter="showTooltip($event, __('Projects'))"
                    @mouseleave="hideTooltip"
                >
                    <div class="w-9 h-9 flex-shrink-0 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors" :class="collapsed ? '' : 'mr-3'">
                        <i class="fas fa-folder text-blue-400 text-sm"></i>
                    </div>
                    <span v-show="!collapsed" class="text-sm font-medium whitespace-nowrap">{{ __('Projects') }}</span>
                </router-link>
                
                <!-- Project sub-menu - hidden when collapsed -->
                <div v-if="isProjectPage && !collapsed" class="admin__project-group mt-2 ml-4 rounded-lg bg-gray-800/50 border border-gray-700/50 overflow-hidden">
                    <div class="admin__project-name-row flex items-center px-4 py-3 border-b border-gray-700/50">
                        <router-link
                            :to="{
                                name: 'projects.index',
                                params: { project_id: $route.params.project_id },
                            }"
                            :active-class="'text-indigo-400'"
                            class="admin__project-name flex items-center flex-1 min-w-0 hover:text-indigo-400 transition-colors"
                        >
                            <div class="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mr-3">
                                <i class="fas fa-cubes text-purple-400 text-xs"></i>
                            </div>
                            <span class="text-sm font-semibold truncate" :title="currentProjectName">
                                {{ currentProjectName }}
                            </span>
                        </router-link>
                        <button
                            @click="projectExpanded = !projectExpanded"
                            class="flex-shrink-0 ml-2 w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                            :title="projectExpanded ? __('Collapse') : __('Expand')"
                        >
                            <i :class="projectExpanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="text-xs"></i>
                        </button>
                    </div>
                    <transition
                        enter-active-class="transition-all duration-200 ease-out"
                        leave-active-class="transition-all duration-150 ease-in"
                        enter-from-class="opacity-0 max-h-0"
                        leave-to-class="opacity-0 max-h-0"
                    >
                        <div v-show="projectExpanded" class="admin__project-sub-menu overflow-hidden py-2">
                            <router-link
                                v-if="canProject(['owner', 'admin'])"
                                :to="{
                                    name: 'projects.collections',
                                    params: { project_id: $route.params.project_id },
                                }"
                                :class="['admin__sub-menu-item flex items-center px-4 py-2.5 mx-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200 group', { 'text-indigo-400 bg-indigo-500/10': isCollectionsActive }]"
                            >
                                <div class="w-7 h-7 rounded-md bg-emerald-500/20 flex items-center justify-center mr-3 group-hover:bg-emerald-500/30 transition-colors">
                                    <i class="fas fa-table text-emerald-400 text-xs"></i>
                                </div>
                                <span class="text-xs font-medium">{{ __('Collections') }}</span>
                            </router-link>
                            <router-link
                                v-if="canProject(['owner', 'admin'])"
                                :to="{
                                    name: 'projects.settings',
                                    params: { project_id: $route.params.project_id },
                                }"
                                :class="['admin__sub-menu-item flex items-center px-4 py-2.5 mx-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200 group', { 'text-indigo-400 bg-indigo-500/10': isSettingsActive }]"
                            >
                                <div class="w-7 h-7 rounded-md bg-gray-500/20 flex items-center justify-center mr-3 group-hover:bg-gray-500/30 transition-colors">
                                    <i class="fas fa-cog text-gray-400 text-xs"></i>
                                </div>
                                <span class="text-xs font-medium">{{ __('Settings') }}</span>
                            </router-link>
                        </div>
                    </transition>
                </div>
                
                <!-- Project icon when collapsed -->
                <div v-if="isProjectPage && collapsed" class="mt-2 flex justify-center">
                    <router-link
                        :to="{
                            name: 'projects.index',
                            params: { project_id: $route.params.project_id },
                        }"
                        class="flex items-center justify-center w-9 h-9 flex-shrink-0 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 transition-colors group"
                        @mouseenter="showTooltip($event, currentProjectName)"
                        @mouseleave="hideTooltip"
                    >
                        <i class="fas fa-cubes text-purple-400 text-sm"></i>
                    </router-link>
                </div>
            </div>
            
            <!-- Users -->
            <router-link
                v-if="checkRole(['super_admin'])"
                :to="{ name: 'users' }"
                :active-class="'bg-indigo-600 text-white shadow-lg'"
                class="admin__main-menu-item flex items-center rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200 group cursor-pointer"
                :class="collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'"
                @mouseenter="showTooltip($event, __('Users'))"
                @mouseleave="hideTooltip"
            >
                <div class="w-9 h-9 flex-shrink-0 rounded-lg bg-pink-500/20 flex items-center justify-center group-hover:bg-pink-500/30 transition-colors" :class="collapsed ? '' : 'mr-3'">
                    <i class="fas fa-users text-pink-400 text-sm"></i>
                </div>
                <span v-show="!collapsed" class="text-sm font-medium whitespace-nowrap">{{ __('Users') }}</span>
            </router-link>
            
            <!-- Language -->
            <router-link
                :to="{ name: 'language' }"
                :class="['admin__main-menu-item flex items-center rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200 group cursor-pointer', { 'bg-indigo-600 text-white shadow-lg': isLanguageActive }, collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3']"
                @mouseenter="showTooltip($event, __('Language'))"
                @mouseleave="hideTooltip"
            >
                <div class="w-9 h-9 flex-shrink-0 rounded-lg bg-teal-500/20 flex items-center justify-center group-hover:bg-teal-500/30 transition-colors" :class="collapsed ? '' : 'mr-3'">
                    <i class="fas fa-language text-teal-400 text-sm"></i>
                </div>
                <span v-show="!collapsed" class="text-sm font-medium whitespace-nowrap">{{ __('Language') }}</span>
            </router-link>
            
            <!-- Settings -->
            <router-link
                v-if="checkRole(['super_admin'])"
                :to="{ name: 'settings' }"
                :active-class="'bg-indigo-600 text-white shadow-lg'"
                class="admin__main-menu-item flex items-center rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200 group cursor-pointer"
                :class="collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'"
                @mouseenter="showTooltip($event, __('Setting'))"
                @mouseleave="hideTooltip"
            >
                <div class="w-9 h-9 flex-shrink-0 rounded-lg bg-gray-500/20 flex items-center justify-center group-hover:bg-gray-500/30 transition-colors" :class="collapsed ? '' : 'mr-3'">
                    <i class="fas fa-cogs text-gray-400 text-sm"></i>
                </div>
                <span v-show="!collapsed" class="text-sm font-medium whitespace-nowrap">{{ __('Setting') }}</span>
            </router-link>
        </nav>
        
        <!-- Footer -->
        <div class="admin__footer flex-shrink-0 border-t border-gray-800 px-4 py-3" v-show="!collapsed">
            <div class="flex items-center justify-center">
                <div class="text-center">
                    <p class="text-xs text-gray-500">{{ __('Copyright') }} &copy; {{ appName }}</p>
                    <p class="text-xs text-gray-600 mt-0.5">v{{ appVersion }}</p>
                </div>
            </div>
        </div>
        
        <!-- Tooltip teleported to body to escape all ancestor overflow/transform clipping -->
        <Teleport to="body">
            <div
                v-if="collapsed && tooltipVisible && tooltipText"
                class="sidebar-fixed-tooltip"
                :style="{ top: tooltipTop + 'px', left: tooltipLeft + 'px' }"
            >
                {{ tooltipText }}
            </div>
        </Teleport>
    </div>
</template>

<script>
import Brand from "@/admin/components/Brand.vue";

import checkRole from "@/utils/checkrole";
import { useAdminStore } from "@/admin/store";
import { GROUP } from "@/admin/routes";

export default {
    components: {
        Brand,
    },
    data() {
        return {
            sidebarOpen: false,
            projectExpanded: true,
            tooltipText: '',
            tooltipTop: 0,
            tooltipLeft: 0,
            tooltipVisible: false,
        };
    },

    methods: {
        checkRole,

        canProject(roles) {
            return Array.isArray(roles) && roles.includes(this.currentProject && this.currentProject.my_role);
        },
        
        toggleSidebar() {
            useAdminStore().toggleSidebar();
        },

        showTooltip(event, text) {
            if (!this.collapsed) return;
            const rect = event.currentTarget.getBoundingClientRect();
            this.tooltipTop = rect.top + rect.height / 2;
            this.tooltipLeft = rect.right + 8;
            this.tooltipText = text;
            this.tooltipVisible = true;
        },

        hideTooltip() {
            this.tooltipVisible = false;
        },
    },

    computed: {
        collapsed() {
            return useAdminStore().sidebarCollapsed;
        },

        currentProject() {
            return useAdminStore().currentProject;
        },

        settings() {
            return useAdminStore().settings;
        },

        isProjectsActive() {
            const group = this.$route.meta && this.$route.meta.group;
            return group === GROUP.PROJECTS || group === GROUP.COLLECTIONS || group === GROUP.SETTINGS || group === GROUP.MEDIA;
        },

        isLanguageActive() {
            return (this.$route.meta && this.$route.meta.group) === GROUP.LANGUAGE;
        },

        isCollectionsActive() {
            return (this.$route.meta && this.$route.meta.group) === GROUP.COLLECTIONS;
        },

        isContentActive() {
            const meta = this.$route.meta || {};
            return meta.group === GROUP.COLLECTIONS && meta.subkind === 'content';
        },

        isSettingsActive() {
            return (this.$route.meta && this.$route.meta.group) === GROUP.SETTINGS;
        },

        isProjectPage() {
            const fullPath = this.$route.fullPath;
            const projectPath = "/project/";
            if (
                fullPath.includes(projectPath) &&
                fullPath.length > projectPath.length
            ) {
                return true;
            }
            return false;
        },

        currentProjectName() {
            if (this.currentProject) {
                return this.currentProject.name;
            }
            return this.__('Loading...');
        },

        appName() {
            return this.settings.name || 'Aine';
        },

        appVersion() {
            return this.settings.version || '0.0.1';
        },
    },

    watch: {
        '$route'(to) {
            const group = to.meta && to.meta.group;
            if (group === GROUP.COLLECTIONS || group === GROUP.SETTINGS || group === GROUP.MEDIA) {
                this.projectExpanded = true;
            }
        },
    },
};
</script>

<style scoped>
.sidebar-fixed-tooltip {
    position: fixed;
    transform: translateY(-50%);
    background-color: #1f2937;
    color: #fff;
    padding: 0.375rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
    z-index: 9999;
    pointer-events: none;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.sidebar-fixed-tooltip::before {
    content: '';
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 4px solid transparent;
    border-right-color: #1f2937;
}
</style>
