/**
 * Breadcrumb composable — meta-driven, single source of truth.
 *
 * Reads route.meta.breadcrumb[] (defined in routes.js) and resolves
 * each segment into a displayable item.  The <Topbar> calls useBreadcrumb()
 * directly; page components no longer participate in breadcrumb rendering.
 *
 * Dynamic segments (e.g. form name on FormsDetail) are written by the
 * component into route.meta.dynamicBreadcrumb and read here.
 */
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAdminStore } from '../store';
import { __ } from '@/admin/translations/engine';

/**
 * Resolve a single breadcrumb segment definition into a display item.
 *
 * @param {object} seg   - segment from route.meta.breadcrumb[]
 * @param {object} route - current route (useRoute())
 * @param {object} store - admin store (useAdminStore())
 * @param {boolean} isLast - whether this is the last segment (no link)
 * @returns {object} item { name, url?, icon? }
 */
function resolveSegment(seg, route, store, isLast) {
    const item = {};

    // --- Fixed label ---
    if (seg.label !== undefined) {
        item.name = __(seg.label);
    }

    // --- Store-derived name (e.g. currentCollection.name) ---
    if (seg.fromStore) {
        const storeData = store[seg.fromStore.key];
        const field = seg.fromStore.field || 'name';
        item.name = (storeData && storeData[field]) || __(seg.label || seg.fromStore.key);
    }

    // --- Dynamic name from component (route.meta.dynamicBreadcrumb) ---
    if (seg.dynamicKey) {
        const dyn = route.meta.dynamicBreadcrumb;
        item.name = (dyn && dyn[seg.dynamicKey]) || __(seg.dynamicKey);
    }

    // --- Icon ---
    if (seg.icon) {
        item.icon = seg.icon;
    }

    // --- Clickable link (non-last segments only) ---
    if (!isLast && seg.route) {
        item.url = {
            name: seg.route,
            params: { ...route.params },
        };
    }

    return item;
}

/**
 * Build the full breadcrumb items array for the current route.
 *
 * Layout:
 *   1. "Dashboard"  → /
 *   2. "Projects"   → /projects           (only for /project/** routes)
 *   3. Project name → /project/:id        (only for /project/** routes)
 *   4..n            → from route.meta.breadcrumb[]
 *
 * @param {object} route - vue-router route object
 * @param {object} store - admin pinia store
 * @returns {Array} breadcrumb items
 */
export function buildBreadcrumb(route, store) {
    const meta = route.meta || {};
    const projectId = route.params.project_id;
    const segments = meta.breadcrumb;

    // ── Global pages (dashboard, settings, profile, etc.) ──
    if (!projectId && !segments) {
        return [
            { name: __('Dashboard'), url: '/', icon: 'fa fa-tachometer-alt' },
        ];
    }

    // ── Project pages prefix ──
    if (projectId) {
        const project = store.currentProject;
        const projectName = (project && project.name) || __('Project');
        const routeName = route.name;

        const items = [
            { name: __('Dashboard'), url: '/', icon: 'fa fa-tachometer-alt' },
            { name: __('Projects List'), url: { name: 'projects' }, icon: 'fas fa-list' },
        ];

        if (routeName === 'projects.index') {
            items.push({ name: projectName, icon: 'fa fa-cubes' });
        } else {
            items.push({
                name: projectName,
                url: { name: 'projects.index', params: { project_id: projectId } },
                icon: 'fa fa-cubes',
            });
        }

        // Append segments from meta.breadcrumb
        if (segments && segments.length) {
            segments.forEach((seg, index) => {
                const isLast = index === segments.length - 1;
                items.push(resolveSegment(seg, route, store, isLast));
            });
        }

        return items;
    }

    // ── Non-project pages with meta.breadcrumb (dashboard, settings, etc.) ──
    if (segments && segments.length) {
        const items = [
            { name: __('Dashboard'), url: '/', icon: 'fa fa-tachometer-alt' },
        ];
        segments.forEach((seg, index) => {
            const isLast = index === segments.length - 1;
            items.push(resolveSegment(seg, route, store, isLast));
        });
        return items;
    }

    // Fallback
    return [
        { name: __('Dashboard'), url: '/', icon: 'fa fa-tachometer-alt' },
    ];
}

/**
 * Composable: returns a reactive breadcrumb array for the current route.
 *
 * Used by <Topbar> to render the breadcrumb from route meta.
 * Automatically re-computes when the route or store state changes.
 */
export function useBreadcrumb() {
    const route = useRoute();
    const store = useAdminStore();

    return computed(() => buildBreadcrumb(route, store));
}
