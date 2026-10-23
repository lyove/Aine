<template>
  <div class="flex h-full flex-col bg-gray-50">
    <project-header :project="project" />

    <div class="flex min-h-0 flex-1">
      <collection-sidebar :project="project" class="w-3/12 shrink-0 overflow-x-hidden bg-white" />

      <div class="min-w-0 flex-1 overflow-auto p-5">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-bold text-gray-800">{{ __(collection.name || 'Categories') }}</h2>
            <p class="mt-0.5 text-sm text-gray-400">{{ totalCount }} {{ __('categories') }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <div class="relative">
              <input
                v-model="search"
                type="text"
                class="w-56 rounded-lg border border-gray-300 py-1.5 pl-8 pr-3 text-sm focus:border-indigo-400 focus:outline-none"
                :placeholder="__('Search categories...')"
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
            ><i class="fa fa-plus mr-1"></i>{{ __('Add Category') }}</router-link>
          </div>
        </div>

        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div v-if="loading" class="space-y-2 p-5">
            <div v-for="n in 5" :key="n" class="h-12 animate-pulse rounded-lg bg-gray-100"></div>
          </div>
          <div v-else-if="!rows.length" class="p-14 text-center text-sm text-gray-400">
            <i class="fa fa-folder-open mb-3 block text-3xl text-gray-300"></i>
            {{ __('No categories yet.') }}
          </div>
          <table v-else class="w-full text-left text-sm">
            <thead class="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th class="px-4 py-3 font-medium">{{ __('Name') }}</th>
                <th class="px-4 py-3 font-medium">{{ __('Slug') }}</th>
                <th class="px-4 py-3 font-medium">{{ __('Color') }}</th>
                <th class="px-4 py-3 font-medium">{{ __('Description') }}</th>
                <th class="px-4 py-3 text-right font-medium">{{ __('Actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="row in rows" :key="row.id" class="hover:bg-indigo-50/40">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2.5">
                    <span
                      class="inline-block h-3.5 w-3.5 rounded-full border border-gray-200"
                      :style="row.color ? { background: row.color } : { background: '#e2e8f0' }"
                    ></span>
                    <span class="font-medium text-gray-800">{{ row.name }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-gray-500">{{ row.slug || '—' }}</td>
                <td class="px-4 py-3">
                  <span v-if="row.color" class="rounded bg-gray-50 px-2 py-0.5 font-mono text-xs text-gray-500">{{ row.color }}</span>
                  <span v-else class="text-xs text-gray-300">—</span>
                </td>
                <td class="max-w-xs truncate px-4 py-3 text-gray-500">{{ row.description || '—' }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-end gap-1">
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

          <!-- Pagination: stays visible during loading, only the table area shows a loading state -->
          <div v-if="rows.length" class="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
            <span class="text-xs text-gray-400">{{ (currentPage - 1) * each + 1 }}–{{ Math.min(currentPage * each, totalCount) }} / {{ totalCount }}</span>
            <div class="flex items-center gap-2">
              <select
                v-model="each"
                class="rounded-lg border border-gray-300 px-2 py-1 text-sm text-gray-600 focus:outline-none"
                @change="reload(1)"
              >
                <option :value="10">10 / {{ __('page') }}</option>
                <option :value="20">20 / {{ __('page') }}</option>
                <option :value="30">30 / {{ __('page') }}</option>
                <option :value="40">40 / {{ __('page') }}</option>
                <option :value="50">50 / {{ __('page') }}</option>
              </select>
              <div class="flex items-center gap-1">
              <button
                type="button"
                class="rounded-lg border border-gray-200 px-2.5 py-1 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                :disabled="loading || currentPage <= 1"
                @click="reload(currentPage - 1)"
              ><i class="fa fa-chevron-left"></i></button>
              <template v-for="(page, i) in visiblePages" :key="page === '...' ? 'ellipsis-' + i : page">
                <span v-if="page === '...'" class="px-1.5 text-sm text-gray-400">…</span>
                <button
                  v-else
                  type="button"
                  class="min-w-[32px] rounded-lg border px-2 py-1 text-sm"
                  :class="page === currentPage
                    ? 'border-indigo-500 bg-indigo-500 text-white'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40'"
                  :disabled="loading"
                  @click="reload(page)"
                >{{ page }}</button>
              </template>
              <button
                type="button"
                class="rounded-lg border border-gray-200 px-2.5 py-1 text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                :disabled="loading || currentPage >= totalPages"
                @click="reload(currentPage + 1)"
              ><i class="fa fa-chevron-right"></i></button>
              </div>
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
import Swal from "sweetalert2";
import { useToast } from "vue-toastification";
import ProjectHeader from "@/admin/components/ProjectHeader.vue";
import CollectionSidebar from "@/admin/components/CollectionSidebar.vue";

export default {
  name: "NavigationCategoriesList",
  components: { ProjectHeader, CollectionSidebar },
  setup() {
    const toast = useToast();
    const route = useRoute();
    const store = useAdminStore();
    const pid = route.params.project_id;
    const cid = route.params.col_id;

    const project = ref(store.currentProject || {});
    const collection = ref(store.currentCollection || { name: "Categories" });
    const rows = ref([]);
    const loading = ref(true);
    const search = ref("");
    const each = ref(10);
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

    // Build the visible page numbers, collapsing long ranges with ellipses
    const visiblePages = computed(() => {
      const total = totalPages.value;
      const current = currentPage.value;
      const range = 2;
      const pages = [];
      if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i);
        return pages;
      }
      pages.push(1);
      let start = Math.max(2, current - range);
      let end = Math.min(total - 1, current + range);
      if (current - range <= 2) end = Math.min(total - 1, range * 2 + 1);
      if (current + range >= total - 1) start = Math.max(2, total - range * 2 - 1);
      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < total - 1) pages.push("...");
      pages.push(total);
      return pages;
    });

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
        if (!project.value?.id) project.value = data.project;
        if (!collection.value?.id) collection.value = data.collection || { name: "Categories" };
        totalCount.value = data.totalCount || 0;
        rows.value = (data.content.data || []).map((row) => ({
          id: row.id,
          name: metaValue(row, "title"),
          slug: metaValue(row, "slug"),
          color: metaValue(row, "color"),
          description: metaValue(row, "description"),
        }));
      } catch (e) {
        console.error("load categories failed:", e);
      } finally {
        loading.value = false;
      }
    }

    async function moveToTrash(row) {
      try {
        const result = await Swal.fire({
          title: __("Move to trash?"),
          text: `"${row.name}"`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: __("Move"),
          cancelButtonText: __("Cancel"),
        });
        if (!result.isConfirmed) return;
        await axios.delete(`projects/${pid}/collections/${cid}/${row.id}/move-to-trash`);
        toast.success(__("Moved to trash."));
        reload();
      } catch (e) {
        toast.error(__("Failed to move to trash."));
      }
    }

    onMounted(() => reload(1));

    return {
      project, collection, rows, loading, search, each, currentPage, totalCount,
      totalPages, visiblePages, canEdit, canManage, reload, moveToTrash,
    };
  },
};
</script>
