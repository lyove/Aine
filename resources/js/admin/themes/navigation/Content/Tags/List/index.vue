<template>
  <div class="flex h-full flex-col bg-gray-50">
    <project-header :project="project" />

    <div class="flex min-h-0 flex-1">
      <collection-sidebar :project="project" class="w-3/12 shrink-0 overflow-x-hidden bg-white" />

      <div class="min-w-0 flex-1 overflow-auto p-5">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-bold text-gray-800">{{ __(collection.name || 'Tags') }}</h2>
            <p class="mt-0.5 text-sm text-gray-400">{{ totalCount }} {{ __('tags') }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <div class="relative">
              <input
                v-model="search"
                type="text"
                class="w-56 rounded-lg border border-gray-300 py-1.5 pl-8 pr-3 text-sm focus:border-indigo-400 focus:outline-none"
                :placeholder="__('Search tags...')"
                @keyup.enter="reload(1)"
              />
              <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400"></i>
            </div>
            <button
              type="button"
              class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              @click="reload(currentPage)"
            ><i class="fa fa-sync-alt mr-1"></i>{{ __('Refresh') }}</button>
            <router-link
              v-if="canEdit"
              :to="{ name: 'projects.collections.content.new', params: { project_id: pid, col_id: cid } }"
              class="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600"
            ><i class="fa fa-plus mr-1"></i>{{ __('Add Tag') }}</router-link>
          </div>
        </div>

        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div v-if="loading" class="space-y-2 p-5">
            <div v-for="n in 5" :key="n" class="h-12 animate-pulse rounded-lg bg-gray-100"></div>
          </div>
          <div v-else-if="!rows.length" class="p-14 text-center text-sm text-gray-400">
            <i class="fa fa-tags mb-3 block text-3xl text-gray-300"></i>
            {{ __('No tags yet.') }}
          </div>
          <table v-else class="w-full text-left text-sm">
            <thead class="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th class="px-4 py-3 font-medium">{{ __('Name') }}</th>
                <th class="px-4 py-3 font-medium">{{ __('Slug') }}</th>
                <th class="px-4 py-3 font-medium">{{ __('Description') }}</th>
                <th class="px-4 py-3 text-right font-medium">{{ __('Actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="row in rows" :key="row.id" class="hover:bg-indigo-50/40">
                <td class="px-4 py-3">
                  <span class="inline-flex items-center gap-2 font-medium text-gray-800">
                    <span class="rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600">#{{ row.name }}</span>
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-500">{{ row.slug || '—' }}</td>
                <td class="max-w-xs truncate px-4 py-3 text-gray-500">{{ row.description || '—' }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-end gap-1">
                    <a
                      :href="`/navigation/tag/${encodeURIComponent(row.name)}`"
                      target="_blank"
                      rel="noopener"
                      class="rounded-lg bg-gray-50 p-2 text-gray-500 hover:bg-gray-100"
                      :title="__('Preview on frontend')"
                    ><i class="fa fa-external-link-alt"></i></a>
                    <router-link
                      v-if="canEdit"
                      :to="{ name: 'projects.collections.content.edit', params: { project_id: pid, col_id: cid, content_id: row.id } }"
                      class="rounded-lg bg-gray-50 p-2 text-indigo-500 hover:bg-indigo-50"
                      :title="__('Edit')"
                    ><i class="fa fa-pencil-alt"></i></router-link>
                    <button
                      v-if="canManage"
                      type="button"
                      class="rounded-lg bg-gray-50 p-2 text-orange-500 hover:bg-orange-50"
                      :title="__('Move to trash')"
                      @click="moveToTrash(row)"
                    ><i class="fa fa-trash-restore"></i></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="!loading && rows.length" class="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <span class="text-xs text-gray-400">{{ (currentPage - 1) * each + 1 }}–{{ Math.min(currentPage * each, totalCount) }} / {{ totalCount }}</span>
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="rounded-lg border border-gray-200 px-2.5 py-1 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                :disabled="currentPage <= 1"
                @click="reload(currentPage - 1)"
              ><i class="fa fa-chevron-left"></i></button>
              <span class="px-2 text-sm text-gray-600">{{ currentPage }} / {{ totalPages }}</span>
              <button
                type="button"
                class="rounded-lg border border-gray-200 px-2.5 py-1 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                :disabled="currentPage >= totalPages"
                @click="reload(currentPage + 1)"
              ><i class="fa fa-chevron-right"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { useAdminStore } from "@/admin/store";
import { __ } from "@/admin/translations/engine";
import ProjectHeader from "@/admin/components/ProjectHeader.vue";
import CollectionSidebar from "@/admin/components/CollectionSidebar.vue";

export default {
  name: "NavigationTagsList",
  components: { ProjectHeader, CollectionSidebar },
  setup() {
    const route = useRoute();
    const store = useAdminStore();
    const pid = route.params.project_id;
    const cid = route.params.col_id;

    const project = ref(null);
    const collection = ref({ name: "Tags" });
    const rows = ref([]);
    const loading = ref(true);
    const search = ref("");
    const each = ref(20);
    const currentPage = ref(1);
    const totalCount = ref(0);

    const canEdit = computed(() => {
      const p = store.currentProject || project.value;
      return p && !(p.is_readonly || !p.status) && ["owner", "admin", "editor"].includes(p.my_role);
    });
    const canManage = computed(() => {
      const p = store.currentProject || project.value;
      return p && !(p.is_readonly || !p.status) && ["owner", "admin"].includes(p.my_role);
    });
    const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / each.value)));

    function metaValue(row, name) {
      const item = (row.meta || []).find((m) => m.field_name === name);
      return item ? item.value : null;
    }

    async function reload(page) {
      if (typeof page === "number") currentPage.value = page;
      loading.value = true;
      try {
        const { data } = await axios.get(`projects/${pid}/collections/${cid}/entries`, {
          params: {
            page: currentPage.value,
            search: search.value,
            orderBy: "weight",
            cr: "ASC",
            sbm: 1,
            each: each.value,
            getItems: "all",
          },
        });
        project.value = data.project;
        collection.value = data.collection || { name: "Tags" };
        totalCount.value = data.totalCount || 0;
        rows.value = (data.content.data || []).map((row) => ({
          id: row.id,
          name: metaValue(row, "tag"),
          slug: metaValue(row, "slug"),
          description: metaValue(row, "description"),
        }));
      } catch (e) {
        console.error("load tags failed:", e);
      } finally {
        loading.value = false;
      }
    }

    async function moveToTrash(row) {
      try {
        const result = await window.$swal.fire({
          title: __("Move to trash?"),
          text: `"${row.name}"`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: __("Move"),
          cancelButtonText: __("Cancel"),
        });
        if (!result.isConfirmed) return;
        await axios.delete(`projects/${pid}/collections/${cid}/${row.id}/move-to-trash`);
        window.$toast.success(__("Moved to trash."));
        reload();
      } catch (e) {
        window.$toast.error(__("Failed to move to trash."));
      }
    }

    onMounted(() => reload(1));

    return {
      project, collection, rows, loading, search, each, currentPage, totalCount,
      totalPages, canEdit, canManage, reload, moveToTrash,
    };
  },
};
</script>
