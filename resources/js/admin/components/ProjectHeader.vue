<template>
    <div class="admin__project-header w-full border-b bg-white an__sticky top-0 z-10">
        <div v-if="isReadonly" class="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center">
            <i class="fas fa-exclamation-triangle text-amber-500 mr-2"></i>
            <span class="text-sm text-amber-800 font-medium">
                {{ __('This project is inactive and in read-only mode. Content can be viewed but not modified.') }}
            </span>
        </div>
        <div class="px-4 py-2">
            <div class="text-xl font-bold">
                {{ __('Project:') }} {{ project ? project.name : '' }}
                <span v-if="collectionContext" class="text-gray-400 font-normal">·</span>
                <span v-if="collectionContext" class="text-gray-600 font-normal">{{ collectionContext.name }}</span>
                <span v-if="collectionContext && collectionContext.view" class="text-gray-400 font-normal">·</span>
                <span v-if="collectionContext && collectionContext.view" class="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded ml-1">{{ collectionContext.view }}</span>
                <span v-if="isReadonly" class="text-xs font-semibold uppercase tracking-wide text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full ml-2">
                    {{ __('Read Only') }}
                </span>
            </div>
            <div class="text-sm">{{ project ? project.description : '' }}</div>
        </div>
    </div>
</template>

<script>
import { useAdminStore } from '@/admin/store';
import { __ } from '@/admin/translations/engine';

export default {
    props: ["project"],
    computed: {
        isReadonly() {
            return this.project && (this.project.is_readonly || !this.project.status);
        },
        collectionContext() {
            const store = useAdminStore();
            const collection = store.currentCollection;
            const routeName = this.$route.name;

            if (!collection || !routeName) return null;

            const viewMap = {
                'projects.collections.content.list': __('Content'),
                'projects.collections.content.new': __('New Content'),
                'projects.collections.content.edit': __('Edit Content'),
                'projects.collections.content.forms': __('Forms'),
                'projects.collections.content.forms.detail': __('Form Detail'),
                'projects.collections.fields': __('Fields'),
            };

            return {
                name: collection.name,
                view: viewMap[routeName] || null,
            };
        },
    },
};
</script>
