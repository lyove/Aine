<template>
    <div class="admin__project-content-media-library relative h-screen overflow-auto">
        <project-header :project="project"></project-header>

        <div class="flex flex-1 overflow-y-auto">
            <div class="w-72 bg-white overflow-x-hidden">
                <collection-sidebar :project="project"></collection-sidebar>
            </div>

            <div class="min-w-0 flex-1 p-4 overflow-x-auto">
                <media-library :project="project"></media-library>
            </div>
        </div>
    </div>
</template>

<script>
import ProjectHeader from "@/admin/components/ProjectHeader.vue";
import MediaLibrary from "@/admin/components/MediaLibrary.vue";
import CollectionSidebar from "@/admin/components/CollectionSidebar.vue";
import { useAdminStore } from "@/admin/store";

export default {
    components: {
        ProjectHeader,
        CollectionSidebar,
        MediaLibrary,
    },


    data() {
        return {
            project: useAdminStore().currentProject || {},
        };
    },
};
</script>
