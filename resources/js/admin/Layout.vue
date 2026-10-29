<template>
    <div class="admin__container flex h-screen overflow-hidden bg-gray-50">
        <div 
            :class="sidebarOpen ? 'block' : 'hidden'" 
            @click="sidebarOpen = false" 
            class="fixed z-10 inset-0 bg-black opacity-50 transition-opacity lg:hidden"
        ></div>

        <div 
            :class="[
                sidebarOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in',
                store.sidebarCollapsed ? 'w-16' : 'w-64'
            ]"
            class="admin__sidebar fixed inset-y-0 left-0 z-50 bg-gray-900 transition-all duration-300 transform lg:translate-x-0 text-white"
        >
            <sidebar></sidebar>
        </div>
        
        <!-- Collapse toggle button -->
        <button
            v-if="screenWidth >= 1024"
            @click="store.toggleSidebar()"
            class="admin__sidebar-toggle"
            :class="store.sidebarCollapsed ? 'left-[52px]' : 'left-[244px]'"
            :title="store.sidebarCollapsed ? __('Expand sidebar') : __('Collapse sidebar')"
        >
            <i :class="store.sidebarCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left'" class="text-xs"></i>
        </button>

        <div class="admin__content w-full flex flex-col flex-1 transition-all duration-300" :class="[screenWidth < 1024 ? 'sidebar-close' : '', store.sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64']">
            <Topbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
            <div class="admin__page relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
                <router-view></router-view>
                <transition name="route-fade">
                    <div v-if="routeLoadingVisible" class="admin__route-loading">
                        <div class="admin__route-loading-inner">
                            <div class="admin__route-spinner"></div>
                            <span>{{ __('Loading...') }}</span>
                        </div>
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue';
import Topbar from './components/Topbar.vue';
import { useAdminStore } from './store';

export default {
    components: {
        Sidebar,
        Topbar,
    },
    setup() {
        return {
            store: useAdminStore(),
        };
    },
    data() {
        return {
            screenWidth: document.body.clientWidth,
            sidebarOpen: document.body.clientWidth >= 1024 ? true : false,
            routeLoadingVisible: false,
            routeLoadingTimer: null,
        }
    },
    methods: {
        onResize() {
            this.screenWidth = document.body.clientWidth;
            this.sidebarOpen = document.body.clientWidth >= 1024 ? true : false;
        },
    },
    watch: {
        'store.routeLoading'(value) {
            clearTimeout(this.routeLoadingTimer);
            if (value) {
                this.routeLoadingTimer = setTimeout(() => {
                    this.routeLoadingVisible = true;
                }, 150);
            } else {
                this.routeLoadingVisible = false;
            }
        },
    },
    mounted() {
        window.addEventListener('resize', this.onResize);
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.onResize);
    },
}
</script>

<style scoped>
/* Collapse toggle button - subtle, blends with sidebar edge */
.admin__sidebar-toggle {
    position: fixed;
    top: 3.25rem;
    z-index: 60;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #1f2937;
    color: #6b7280;
    border: 1px solid #374151;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.25s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    opacity: 0.7;
}

.admin__sidebar-toggle:hover {
    background-color: #374151;
    color: #d1d5db;
    border-color: #4b5563;
    opacity: 1;
}

.admin__route-loading {
    position: absolute;
    inset: 0;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(249, 250, 251, 0.75);
    backdrop-filter: blur(2px);
}

.admin__route-loading-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    color: #6b7280;
    font-size: 0.875rem;
    font-weight: 500;
}

.admin__route-spinner {
    width: 2.25rem;
    height: 2.25rem;
    border: 3px solid #e5e7eb;
    border-top-color: #6366f1;
    border-radius: 9999px;
    animation: admin-route-spin 0.7s linear infinite;
}

@keyframes admin-route-spin {
    to {
        transform: rotate(360deg);
    }
}

.route-fade-enter-active,
.route-fade-leave-active {
    transition: opacity 0.18s ease;
}

.route-fade-enter-from,
.route-fade-leave-to {
    opacity: 0;
}
</style>
