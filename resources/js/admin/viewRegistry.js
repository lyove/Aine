/**
 * View Registry - Maps route names to view components with theme support.
 *
 * Theme packages: resources/js/admin/themes/{template}/{theme}/
 * Resolution priority: runtime (manifest.json) > default views
 * (the legacy config.js registration approach is deprecated and removed)
 */

// Default fallback views
const defaultViews = {
    'projects.collections':         () => import('./views/Project.Collections/Collection/Index.vue'),
    'projects.collections.fields':                  () => import('./views/Project.Collections/Collection/List.vue'),
    'projects.collections.content.list':            () => import('./views/Project.Collections/Content/List.vue'),
    'projects.collections.content.new':             () => import('./views/Project.Collections/Content/New.vue'),
    'projects.collections.content.edit':            () => import('./views/Project.Collections/Content/Edit.vue'),
    'projects.collections.content.forms':           () => import('./views/Project.Collections/Content/Forms.vue'),
    'projects.collections.content.forms.detail':    () => import('./views/Project.Collections/Content/FormsDetail.vue'),
    'projects.media_library':       () => import('./views/Project.Collections/Media/Index.vue'),
    'projects.settings':            () => import('./views/Project.Settings/Index.vue'),
    'projects.settings.preferences':() => import('./views/Project.Settings/Preferences.vue'),
    'projects.settings.locales':    () => import('./views/Project.Settings/Locales.vue'),
    'projects.settings.users':      () => import('./views/Project.Settings/Users.vue'),
    'projects.settings.api':        () => import('./views/Project.Settings/API.vue'),
    'projects.settings.webhooks':   () => import('./views/Project.Settings/Webhooks.vue'),
    'projects.settings.webhooks.logs': () => import('./views/Project.Settings/WebhookLogs.vue'),
    'projects.settings.translations':  () => import('./views/Project.Settings/Translations.vue'),
    'projects.settings.language':      () => import('./views/Project.Settings/Language.vue'),
    'projects.settings.audit-logs':    () => import('./views/Project.Settings/AuditLogs.vue'),
};

// Theme registry: from manifest.json via themeEngine (runtime)
const runtimeRegistry = {};

// Pre-resolved theme components via Vite glob
const themeModuleMap = import.meta.glob('./themes/**/*.vue');

/**
 * Register a theme at runtime (from manifest.json via themeEngine).
 */
export function registerTheme(slug, themeData) {
    const views = {};

    // Resolve paths from asset_path (after themes moved to themes/{template}/{theme}),
    // never rebuild from the slug (the slug is composite "cms-default" and has no such directory)
    const assetPath = themeData.asset_path || `themes/${slug}`;

    if (themeData.view_overrides) {
        for (const [routeName, componentPath] of Object.entries(themeData.view_overrides)) {
            const globKey = `./${assetPath}/${componentPath.replace(/^\.\//, '')}`;
            if (themeModuleMap[globKey]) {
                views[routeName] = themeModuleMap[globKey];
            } else {
                console.warn(`[viewRegistry] Theme component not found: ${globKey}`);
            }
        }
    }

    runtimeRegistry[slug] = {
        name: themeData.name || slug,
        version: themeData.version || '1.0.0',
        assetPath,
        views,
        designTokens: themeData.design_tokens || {},
    };
}

export function unregisterTheme(slug) {
    delete runtimeRegistry[slug];
}

export function isThemeRegistered(slug) {
    return slug in runtimeRegistry;
}

/**
 * Get the view loader for a route.
 * Priority: runtime > default
 */
export function resolveView(routeName, uiSlug = null) {
    if (uiSlug && runtimeRegistry[uiSlug]?.views[routeName]) {
        return runtimeRegistry[uiSlug].views[routeName];
    }
    return defaultViews[routeName] || null;
}

/**
 * Get the view loader for a content route (collection-aware).
 * Priority: per-collection > generic > default
 */
export function resolveContentView(routeName, uiSlug = null, collectionSlug = null) {
    if (collectionSlug) {
        const collectionKey = `${routeName}.${collectionSlug}`;

        if (uiSlug && runtimeRegistry[uiSlug]?.views[collectionKey]) {
            return runtimeRegistry[uiSlug].views[collectionKey];
        }
        if (uiSlug && runtimeRegistry[uiSlug]?.views[routeName]) {
            return runtimeRegistry[uiSlug].views[routeName];
        }
    }
    return resolveView(routeName, uiSlug);
}

export function getThemeDesignTokens(uiSlug) {
    if (uiSlug && runtimeRegistry[uiSlug]) {
        return { ...runtimeRegistry[uiSlug].designTokens };
    }
    return {};
}

export function getAllThemes() {
    const themes = {};

    for (const [slug, config] of Object.entries(runtimeRegistry)) {
        themes[slug] = { slug, name: config.name, version: config.version, source: 'runtime', designTokens: config.designTokens };
    }

    return themes;
}

export function getTheme(slug) {
    return runtimeRegistry[slug] || null;
}

export function getAvailableProjectUis() {
    return [...new Set(Object.keys(runtimeRegistry))];
}
