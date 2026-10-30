import { createRouter, createWebHistory, useRoute } from 'vue-router';
import { defineComponent, ref, watch, h, onMounted } from 'vue';
import { useAdminStore } from './store';
import { resolveView, resolveContentView } from './services/viewRegistry';
import Swal from 'sweetalert2';
import { __ } from "@/admin/translations/engine";

// ── Route constants ────────────────────────────────────────────────

/**
 * Sidebar group identifiers (used by meta.group).
 * The sidebar reads these to decide which menu item is active.
 */
export const GROUP = Object.freeze({
    DASHBOARD: 'dashboard',
    PROJECTS: 'projects',
    COLLECTIONS: 'collections',
    SETTINGS: 'settings',
    MEDIA: 'media',
    LANGUAGE: 'language',
    USERS: 'users',
    PROFILE: 'profile',
    TRANSLATIONS: 'translations',
    LOCALIZATION: 'localization',
    SITE_SETTINGS: 'site_settings',
});

/**
 * Sub-kind identifiers for collection-related routes.
 * The CollectionSidebar uses these to differentiate "content" vs "fields"
 * highlighting without hard-coding route names.
 */
export const SUBKIND = Object.freeze({
    CONTENT: 'content',
    FIELDS: 'fields',
    FORMS: 'forms',
});

/**
 * Breadcrumb segment types stored in meta.breadcrumb[].
 *
 * Each segment is a plain object:
 *
 *   { label }                            → fixed label (goes through __())
 *   { label, route, icon? }              → clickable (non-last) link
 *   { fromStore, route?, icon? }         → reads store[currentCollection].name etc.
 *   { dynamicKey, icon? }               → reads route.meta.dynamicBreadcrumb[dynamicKey]
 *
 * Example:
 *   meta: {
 *     breadcrumb: [
 *       { label: 'Collections', route: 'projects.collections', icon: 'fa fa-table' },
 *       { fromStore: { key: 'currentCollection', field: 'name' }, icon: 'fa fa-folder' },
 *       { label: 'Edit Content', icon: 'fa fa-pen' },
 *     ],
 *     dynamicBreadcrumb: { Form: 'My Great Form' },  // set by component
 *   }
 */

/**
 * Route names that accept collection-aware theme view overrides.
 * viewRegistry uses this set to validate manifest keys.
 */
export const COLLECTION_CONTENT_ROUTES = Object.freeze([
    'projects.collections.content.list',
    'projects.collections.content.new',
    'projects.collections.content.edit',
]);

/**
 * All known project route names — used by viewRegistry to validate
 * manifest view_overrides keys at registration time.
 */
export const KNOWN_PROJECT_ROUTES = Object.freeze([
    'projects.index',
    'projects.collections',
    'projects.collections.fields',
    'projects.collections.content.list',
    'projects.collections.content.new',
    'projects.collections.content.edit',
    'projects.collections.content.forms',
    'projects.collections.content.forms.detail',
    'projects.media_library',
    'projects.settings',
    'projects.settings.preferences',
    'projects.settings.locales',
    'projects.settings.users',
    'projects.settings.api',
    'projects.settings.webhooks',
    'projects.settings.webhooks.logs',
    'projects.settings.translations',
    'projects.settings.language',
    'projects.settings.audit-logs',
    'projects.settings.themes',
]);

// ── Route definitions ───────────────────────────────────────────────

/**
 * Create a project-UI-aware route component.
 * collection slug from store.currentCollection and pick the matching theme
 * view override via resolveContentView.
 */
function projectUiView(routeName) {
    return defineComponent({
        name: `ProjectUiView_${routeName.replace(/\./g, '_')}`,
        setup() {
            const store = useAdminStore();
            const route = useRoute();
            const Comp = ref(null);
            const error = ref(null);
            let loadSeq = 0;

            const load = async () => {
                const seq = ++loadSeq;
                error.value = null;
                try {
                    const uiSlug = store.currentProject?.theme?.slug || null;
                    let loader;

                    if (route.meta.collectAware) {
                        const cid = route.params.col_id;
                        let collectionSlug = null;
                        if (cid) {
                            if (!store.currentCollection || String(store.currentCollection.id) !== String(cid)) {
                                await store.setCurrentCollection({
                                    projectId: route.params.project_id,
                                    colId: cid,
                                });
                            }
                            collectionSlug = store.currentCollection?.slug || null;
                        }
                        loader = resolveContentView(routeName, uiSlug, collectionSlug);
                    } else {
                        loader = resolveView(routeName, uiSlug);
                    }
                    if (!loader) {
                        if (seq === loadSeq) {
                            Comp.value = null;
                            error.value = __('No view registered for route "{routeName}" (UI: {uiSlug})', { routeName, uiSlug: uiSlug || __('shared default') });
                        }
                        return;
                    }
                    const mod = await loader();
                    if (seq === loadSeq) {
                        Comp.value = mod.default || mod;
                    }
                } catch (e) {
                    console.error(`[projectUiView] failed to load view for "${routeName}":`, e);
                    if (seq === loadSeq) {
                        Comp.value = null;
                        error.value = (e && (e.message || String(e))) || __('Failed to load view');
                    }
                }
            };

            onMounted(load);

            watch(
                () => [store.currentProject?.theme?.slug, route.meta.collectAware ? route.params.col_id : null],
                load
            );

            return () => {
                if (error.value) {
                    return h('div', {
                        class: 'flex flex-col items-center justify-center h-full text-red-500 text-sm p-6 text-center',
                    }, [
                        h('i', { class: 'fas fa-exclamation-triangle text-2xl mb-3' }),
                        h('div', {}, error.value),
                    ]);
                }
                return Comp.value
                    ? h(Comp.value)
                    : h('div', {
                        class: 'flex items-center justify-center h-full text-gray-400 text-sm',
                    }, [h('i', { class: 'fas fa-spinner fa-spin mr-2' }), __('Loading...')]);
            };
        },
    });
}

// Non-project routes (global, not UI-aware)
const Dashboard = () => import("./views/Dashboard.vue");
const Settings = () => import("./views/Settings.vue");
const Users = () => import("./views/Users.vue");
const Language = () => import("./views/Language.vue");
const Translations = () => import("./views/Translations.vue");
const Localization = () => import("./views/Localization.vue");
const Profile = () => import("./views/Profile.vue");
const Projects = () => import("./views/Projects.vue");

/**
 * Routes
 *
 * meta fields:
 *   breadcrumb       - Segment[]   (breadcrumb trail, read by useBreadcrumb)
 *   projectRoles     - string[]    (project-level roles required)
 *   projectRedirect  - routeName   (redirect after permission pass)
 *   group            - GROUP       (sidebar active-state group)
 *   subkind          - SUBKIND     (CollectionSidebar content/fields distinction)
 *   collectAware     - boolean     (load collection context AND resolve theme view via resolveContentView)
 *   loadCollection   - boolean     (load collection context only, for breadcrumb/ProjectHeader, no theme view override)
 */
const routes = [
  {
    path: "/",
    name: "dashboard",
    component: Dashboard,
    meta: {
      group: GROUP.DASHBOARD,
    },
  },
  {
    path: "/settings",
    name: "settings",
    component: Settings,
    meta: {
      group: GROUP.SITE_SETTINGS,
      breadcrumb: [
        { label: 'Settings', icon: 'fa fa-cog' },
      ],
    },
  },
  {
    path: "/users",
    name: "users",
    component: Users,
    meta: {
      group: GROUP.USERS,
    },
  },
  {
    path: "/language",
    name: "language",
    component: Language,
    meta: {
      group: GROUP.LANGUAGE,
      breadcrumb: [
        { label: 'Language', icon: 'fas fa-language' },
      ],
    },
  },
  {
    path: "/localization",
    name: "localization",
    component: Localization,
    meta: {
      group: GROUP.LOCALIZATION,
      breadcrumb: [
        { label: 'Localization', icon: 'fas fa-globe' },
      ],
    },
  },
  {
    path: "/translations",
    name: "translations",
    component: Translations,
    meta: {
      group: GROUP.TRANSLATIONS,
      breadcrumb: [
        { label: 'Translations', icon: 'fas fa-language' },
      ],
    },
  },
  {
    path: "/profile",
    name: "profile",
    component: Profile,
    meta: {
      group: GROUP.PROFILE,
      breadcrumb: [
        { label: 'Profile', icon: 'fa fa-user' },
      ],
    },
  },
  {
    path: "/projects/",
    name: "projects",
    component: Projects,
    meta: {
      group: GROUP.PROJECTS,
      breadcrumb: [
        { label: 'Project List', icon: 'fas fa-list' },
      ],
    },
  },

  // ── Project routes ──────────────────────────────────────────────────

  {
    path: "/project/:project_id",
    name: "projects.index",
    redirect: to => ({ name: "projects.collections", params: { project_id: to.params.project_id } }),
    meta: {
      projectRoles: ["owner", "admin", "editor", "viewer"],
    },
  },
  {
    path: "/project/:project_id/collections",
    name: "projects.collections",
    component: projectUiView('projects.collections'),
    meta: {
      projectRoles: ["owner", "admin"],
      group: GROUP.COLLECTIONS,
      breadcrumb: [
        { label: 'Collections', icon: 'fa fa-table' },
      ],
    },
  },
  {
    path: "/project/:project_id/collections/:col_id/fields",
    name: "projects.collections.fields",
    component: projectUiView('projects.collections.fields'),
    meta: {
      projectRoles: ["owner", "admin"],
      group: GROUP.COLLECTIONS,
      subkind: SUBKIND.FIELDS,
      loadCollection: true,
      breadcrumb: [
        { label: 'Collections', route: 'projects.collections', icon: 'fa fa-table' },
        { fromStore: { key: 'currentCollection', field: 'name' }, icon: 'fa fa-folder' },
        { label: 'Fields', icon: 'fa fa-list' },
      ],
    },
  },
  {
    path: "/project/:project_id/collections/:col_id/content",
    name: "projects.collections.content.list",
    component: projectUiView('projects.collections.content.list'),
    meta: {
      projectRoles: ["owner", "admin", "editor"],
      group: GROUP.COLLECTIONS,
      subkind: SUBKIND.CONTENT,
      collectAware: true,
      breadcrumb: [
        { label: 'Collections', route: 'projects.collections', icon: 'fa fa-table' },
        { fromStore: { key: 'currentCollection', field: 'name' }, icon: 'fa fa-folder' },
      ],
    },
  },
  {
    path: "/project/:project_id/collections/:col_id/content/new",
    name: "projects.collections.content.new",
    component: projectUiView('projects.collections.content.new'),
    meta: {
      projectRoles: ["owner", "admin", "editor"],
      group: GROUP.COLLECTIONS,
      subkind: SUBKIND.CONTENT,
      collectAware: true,
      breadcrumb: [
        { label: 'Collections', route: 'projects.collections', icon: 'fa fa-table' },
        { fromStore: { key: 'currentCollection', field: 'name' }, icon: 'fa fa-folder' },
        { label: 'Create Content', icon: 'fa fa-plus' },
      ],
    },
  },
  {
    path: "/project/:project_id/collections/:col_id/content/:content_id/edit",
    name: "projects.collections.content.edit",
    component: projectUiView('projects.collections.content.edit'),
    meta: {
      projectRoles: ["owner", "admin", "editor"],
      group: GROUP.COLLECTIONS,
      subkind: SUBKIND.CONTENT,
      collectAware: true,
      breadcrumb: [
        { label: 'Collections', route: 'projects.collections', icon: 'fa fa-table' },
        { fromStore: { key: 'currentCollection', field: 'name' }, icon: 'fa fa-folder' },
        { label: 'Edit Content', icon: 'fa fa-pen' },
      ],
    },
  },
  {
    path: "/project/:project_id/collections/:col_id/content/forms",
    name: "projects.collections.content.forms",
    component: projectUiView('projects.collections.content.forms'),
    meta: {
      projectRoles: ["owner", "admin", "editor"],
      group: GROUP.COLLECTIONS,
      subkind: SUBKIND.CONTENT,
      loadCollection: true,
      breadcrumb: [
        { label: 'Collections', route: 'projects.collections', icon: 'fa fa-table' },
        { fromStore: { key: 'currentCollection', field: 'name' }, icon: 'fa fa-folder' },
        { label: 'Forms', icon: 'fa fa-wpforms' },
      ],
    },
  },
  {
    path: "/project/:project_id/collections/:col_id/content/forms/:form_id",
    name: "projects.collections.content.forms.detail",
    component: projectUiView('projects.collections.content.forms.detail'),
    meta: {
      projectRoles: ["owner", "admin", "editor"],
      group: GROUP.COLLECTIONS,
      subkind: SUBKIND.CONTENT,
      loadCollection: true,
      breadcrumb: [
        { label: 'Collections', route: 'projects.collections', icon: 'fa fa-table' },
        { fromStore: { key: 'currentCollection', field: 'name' }, icon: 'fa fa-folder' },
        { label: 'Forms', route: 'projects.collections.content.forms', icon: 'fa fa-wpforms' },
        { dynamicKey: 'Form', icon: 'fa fa-file-alt' },
      ],
    },
  },
  {
    path: "/project/:project_id/settings",
    name: "projects.settings",
    meta: {
      projectRoles: ["owner", "admin"],
      projectRedirect: 'projects.settings.preferences',
      group: GROUP.SETTINGS,
      breadcrumb: [
        { label: 'Settings', icon: 'fa fa-cog' },
      ],
    },
  },
  {
    path: "/project/:project_id/settings/preferences",
    name: "projects.settings.preferences",
    component: projectUiView('projects.settings.preferences'),
    meta: {
      projectRoles: ["owner", "admin"],
      group: GROUP.SETTINGS,
      breadcrumb: [
        { label: 'Settings', route: 'projects.settings', icon: 'fa fa-cog' },
        { label: 'Preferences' },
      ],
    },
  },
  {
    path: "/project/:project_id/settings/locales",
    name: "projects.settings.locales",
    component: projectUiView('projects.settings.locales'),
    meta: {
      projectRoles: ["owner", "admin"],
      group: GROUP.SETTINGS,
      breadcrumb: [
        { label: 'Settings', route: 'projects.settings', icon: 'fa fa-cog' },
        { label: 'Localization' },
      ],
    },
  },
  {
    path: "/project/:project_id/settings/users",
    name: "projects.settings.users",
    component: projectUiView('projects.settings.users'),
    meta: {
      projectRoles: ["owner"],
      group: GROUP.SETTINGS,
      breadcrumb: [
        { label: 'Settings', route: 'projects.settings', icon: 'fa fa-cog' },
        { label: 'Users & Roles' },
      ],
    },
  },
  {
    path: "/project/:project_id/settings/api",
    name: "projects.settings.api",
    component: projectUiView('projects.settings.api'),
    meta: {
      projectRoles: ["owner", "admin"],
      group: GROUP.SETTINGS,
      breadcrumb: [
        { label: 'Settings', route: 'projects.settings', icon: 'fa fa-cog' },
        { label: 'API Access' },
      ],
    },
  },
  {
    path: "/project/:project_id/settings/webhooks",
    name: "projects.settings.webhooks",
    component: projectUiView('projects.settings.webhooks'),
    meta: {
      projectRoles: ["owner", "admin"],
      group: GROUP.SETTINGS,
      breadcrumb: [
        { label: 'Settings', route: 'projects.settings', icon: 'fa fa-cog' },
        { label: 'Webhooks' },
      ],
    },
  },
  {
    path: "/project/:project_id/settings/translations",
    name: "projects.settings.translations",
    component: projectUiView('projects.settings.translations'),
    meta: {
      projectRoles: ["owner", "admin"],
      group: GROUP.SETTINGS,
      breadcrumb: [
        { label: 'Settings', route: 'projects.settings', icon: 'fa fa-cog' },
        { label: 'Translations' },
      ],
    },
  },
  {
    path: "/project/:project_id/settings/language",
    name: "projects.settings.language",
    component: projectUiView('projects.settings.language'),
    meta: {
      projectRoles: ["owner", "admin"],
      group: GROUP.SETTINGS,
      breadcrumb: [
        { label: 'Settings', route: 'projects.settings', icon: 'fa fa-cog' },
        { label: 'Language' },
      ],
    },
  },
  {
    path: "/project/:project_id/settings/webhooks/:webhook_id/logs",
    name: "projects.settings.webhooks.logs",
    component: projectUiView('projects.settings.webhooks.logs'),
    meta: {
      projectRoles: ["owner", "admin"],
      group: GROUP.SETTINGS,
      breadcrumb: [
        { label: 'Settings', route: 'projects.settings', icon: 'fa fa-cog' },
        { label: 'Webhooks', route: 'projects.settings.webhooks' },
        { label: 'Logs' },
      ],
    },
  },
  {
    path: "/project/:project_id/settings/audit-logs",
    name: "projects.settings.audit-logs",
    component: projectUiView('projects.settings.audit-logs'),
    meta: {
      projectRoles: ["owner", "admin"],
      group: GROUP.SETTINGS,
      breadcrumb: [
        { label: 'Settings', route: 'projects.settings', icon: 'fa fa-cog' },
        { label: 'Audit Logs' },
      ],
    },
  },
  {
    path: "/project/:project_id/settings/themes",
    name: "projects.settings.themes",
    component: () => import('./views/Project.Settings/Themes.vue'),
    meta: {
      projectRoles: ["owner", "admin"],
      group: GROUP.SETTINGS,
      breadcrumb: [
        { label: 'Settings', route: 'projects.settings', icon: 'fa fa-cog' },
        { label: 'Themes' },
      ],
    },
  },
  {
    path: "/project/:project_id/media_library",
    name: "projects.media_library",
    component: projectUiView('projects.media_library'),
    meta: {
      projectRoles: ["owner", "admin", "editor"],
      group: GROUP.MEDIA,
      breadcrumb: [
        { label: 'Media Library' },
      ],
    },
  },
];

const router = createRouter({
    history: createWebHistory(window.ADMIN_BASE || '/admin'),
    routes: routes,
});

router.afterEach(() => {
    const store = useAdminStore();
    store.routeLoading = false;
});

router.beforeEach(async (to, from, next) => {
    // ── Close any lingering SweetAlert modal ──
    if (Swal.isVisible()) {
        await new Promise((resolve) => {
            Swal.close();
            setTimeout(resolve, 350);
        });
    }

    const store = useAdminStore();
    store.routeLoading = true;

    // ── Ensure user roles are loaded ──
    if (!store.user.roles || store.user.roles.length === 0) {
        await store.getUser();
    }

    // ── Project context loading (③) ──
    // Must happen BEFORE permission check, because projectRoles relies on
    // store.currentProject.my_role which is only available after the project
    // data has been fetched.
    const meta = to.meta || {};
    const isProjectPage = !!to.params.project_id;
    const wasProjectPage = from && from.params && from.params.project_id;

    if (isProjectPage) {
        const currentProjectId = store.currentProject?.id;
        const projectChanged = !currentProjectId || currentProjectId != to.params.project_id;

        if (projectChanged) {
            store.currentProject = null;
            store.currentCollection = null;
            await store.setCurrentProject(to.params.project_id);
        } else {
            if (Date.now() - (store.currentProjectLoadedAt || 0) > 30000) {
                store.setCurrentProject(to.params.project_id, { silent: true });
            }
        }

        // Load collection context when meta.collectAware is set
        if ((meta.collectAware || meta.loadCollection) && to.params.col_id) {
            const currentCollectionId = store.currentCollection?.id;
            if (!currentCollectionId || currentCollectionId != to.params.col_id) {
                await store.setCurrentCollection({
                    projectId: to.params.project_id,
                    colId: to.params.col_id,
                });
            }
        } else {
            // Explicitly clear stale collection context when navigating
            // away from collection-aware routes
            store.currentCollection = null;
        }
    } else if (wasProjectPage && !isProjectPage) {
        store.setCurrentProject(null);
        store.currentCollection = null;
    }

    // ── Permission check (driven by route meta) ──
    // Runs AFTER project context is loaded so that
    // store.currentProject.my_role is available.
    const roles = store.user.roles || [];

    // super_admin bypasses all checks
    if (!roles.includes('super_admin')) {
        const projectRoles = meta.projectRoles;

        if (projectRoles && projectRoles.length > 0) {
            const myRole = store.currentProject && store.currentProject.my_role;
            if (!projectRoles.includes(myRole)) {
                return next('/');
            }
        }
    }

    // ── Handle project settings redirect (projects.settings → preferences) ──
    if (meta.projectRedirect) {
        return next({ name: meta.projectRedirect, params: { project_id: to.params.project_id } });
    }

    next();
});

export default router;
