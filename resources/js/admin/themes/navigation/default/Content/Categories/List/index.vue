<template>
  <div class="flex h-full flex-col bg-gray-50">
    <project-header :project="project" />

    <div class="flex min-h-0 flex-1">
      <collection-sidebar :project="project" class="w-72 shrink-0 overflow-x-hidden bg-white" />

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

        <!-- Bulk action bar (shown when rows are selected) -->
        <div
          v-if="selectedIds.size > 0"
          class="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5"
        >
          <span class="text-sm font-semibold text-indigo-700">{{ selectedIds.size }} {{ __('items selected') }}</span>
          <button
            type="button"
            class="text-sm font-medium text-blue-600 underline decoration-blue-600 underline-offset-2 hover:text-blue-800"
            @click="clearSelection"
          >{{ __('Cancel selection') }}</button>
          <span class="flex-1"></span>

          <!-- Actions dropdown: Publish / Unpublish / Move to trash / Delete permanently -->
          <div v-if="canManage" class="relative" @click.stop>
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
              :disabled="bulkSubmitting"
              @click="actionsOpen = !actionsOpen"
            >
              <i class="fa fa-bolt mr-1"></i>{{ __('Actions') }}
              <i class="fa fa-chevron-down ml-1 text-xs"></i>
            </button>
            <div
              v-if="actionsOpen"
              class="absolute right-0 top-full z-30 mt-1.5 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-2xl"
            >
              <button
                type="button"
                class="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                :disabled="bulkSubmitting"
                @click="bulkPublish"
              >
                <i class="fa fa-check-circle w-4 text-emerald-500"></i>{{ __('Publish') }}
              </button>
              <button
                type="button"
                class="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                :disabled="bulkSubmitting"
                @click="bulkUnpublish"
              >
                <i class="fa fa-eye-slash w-4 text-amber-500"></i>{{ __('Unpublish') }}
              </button>
              <button
                type="button"
                class="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                :disabled="bulkSubmitting"
                @click="bulkMoveToTrash"
              >
                <i class="fa fa-trash-restore w-4 text-orange-500"></i>{{ __('Move to trash') }}
              </button>
              <div class="my-1 border-t border-gray-100"></div>
              <button
                type="button"
                class="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 disabled:opacity-50"
                :disabled="bulkSubmitting"
                @click="bulkDelete"
              >
                <i class="fa fa-trash w-4"></i>{{ __('Delete permanently') }}
              </button>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div v-if="loading" class="space-y-2 p-5">
            <div v-for="n in 5" :key="n" class="h-12 animate-pulse rounded-lg bg-gray-100"></div>
          </div>
          <div v-else-if="!rows.length" class="p-14 text-center text-sm text-gray-400">
            <i class="fa fa-folder-open mb-3 block text-3xl text-gray-300"></i>
            {{ __('No categories yet.') }}
          </div>
          <table v-else class="w-full min-w-[900px] text-left text-sm">
            <thead class="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th class="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    class="h-4 w-4 rounded border-gray-300 accent-indigo-500"
                    :checked="allPageSelected"
                    :disabled="!rows.length"
                    @change="toggleSelectAllPage"
                    :title="__('Select all on this page')"
                  />
                </th>
                <th class="whitespace-nowrap px-4 py-3 font-medium">{{ __('Name') }}</th>
                <th class="whitespace-nowrap px-4 py-3 font-medium">{{ __('Slug') }}</th>
                <th class="whitespace-nowrap px-4 py-3 font-medium">{{ __('Color') }}</th>
                <th class="whitespace-nowrap px-4 py-3 font-medium">{{ __('Usage') }}</th>
                <th class="px-4 py-3 font-medium">{{ __('Description') }}</th>
                <th class="whitespace-nowrap px-4 py-3 text-right font-medium">{{ __('Actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="row in rows" :key="row.id" class="hover:bg-indigo-50/40" :class="{ 'row-selected': isSelected(row.id) }">
                <td class="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    class="h-4 w-4 rounded border-gray-300 accent-indigo-500"
                    :checked="isSelected(row.id)"
                    @change="toggleSelect(row.id, $event)"
                  />
                </td>
                <td class="whitespace-nowrap px-4 py-3">
                  <div class="flex items-center gap-2.5">
                    <span
                      class="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-gray-200"
                      :style="row.color ? { background: row.color } : { background: '#e2e8f0' }"
                    ></span>
                    <span class="font-medium text-gray-800">{{ row.name }}</span>
                  </div>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-gray-500">{{ row.slug || '—' }}</td>
                <td class="whitespace-nowrap px-4 py-3">
                  <span v-if="row.color" class="inline-block whitespace-nowrap rounded bg-gray-50 px-2 py-0.5 font-mono text-xs text-gray-500">{{ row.color }}</span>
                  <span v-else class="text-xs text-gray-300">—</span>
                </td>
                <td class="whitespace-nowrap px-4 py-3">
                  <span
                    v-if="row.usage"
                    class="inline-block whitespace-nowrap rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-500"
                  >{{ row.usage }}</span>
                  <span v-else class="text-xs text-gray-300">0</span>
                </td>
                <td class="max-w-xs truncate px-4 py-3 text-gray-500">{{ row.description || '—' }}</td>
                <td class="whitespace-nowrap px-4 py-3">
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
                class="rounded-lg border border-gray-300 pl-2 pr-9 py-1 text-sm text-gray-600 focus:outline-none"
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
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
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

    // ---- Bulk selection + Actions dropdown ----
    const selectedIds = ref(new Set());
    const actionsOpen = ref(false);
    const bulkSubmitting = ref(false);

    const canEdit = computed(() => {
      const p = store.currentProject || project.value;
      return p && !(p.is_readonly || !p.status) && ["owner", "admin", "editor"].includes(p.my_role);
    });
    const canManage = computed(() => {
      const p = store.currentProject || project.value;
      return p && !(p.is_readonly || !p.status) && ["owner", "admin"].includes(p.my_role);
    });
    const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / each.value)));
    const allPageSelected = computed(() => rows.value.length > 0 && rows.value.every((r) => selectedIds.value.has(r.id)));

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
          usage: 0,
        }));
        await loadUsage(rows.value.map((r) => r.id));
      } catch (e) {
        console.error("load categories failed:", e);
      } finally {
        loading.value = false;
      }
    }

    // Fetch reference counts for the current page through the generic usage endpoint.
    async function loadUsage(ids) {
      if (!ids.length) return;
      try {
        const { data } = await axios.get(`projects/${pid}/collections/${cid}/entries/usage`, {
          params: { ids: ids.join(",") },
        });
        const u = data.usage || {};
        rows.value = rows.value.map((r) => ({ ...r, usage: u[r.id] ? u[r.id].total : 0 }));
      } catch (e) {
        // Counting failure must not block the page
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
        const msg = e.response && e.response.data && e.response.data.message;
        toast.error(msg ? __(msg, e.response.data) : __("Failed to move to trash."));
      }
    }

    function isSelected(id) {
      return selectedIds.value.has(id);
    }
    function toggleSelect(id, e) {
      if (e.target.checked) selectedIds.value.add(id);
      else selectedIds.value.delete(id);
    }
    function toggleSelectAllPage(e) {
      rows.value.forEach((r) => {
        if (e.target.checked) selectedIds.value.add(r.id);
        else selectedIds.value.delete(r.id);
      });
    }
    function clearSelection() {
      selectedIds.value.clear();
      actionsOpen.value = false;
    }
    function handleDocumentClick() {
      if (actionsOpen.value) actionsOpen.value = false;
    }

    async function bulkPublish() {
      if (!selectedIds.value.size || bulkSubmitting.value) return;
      try {
        const result = await Swal.fire({
          title: __("Publish selected categories?"),
          text: `${selectedIds.value.size} ${__("categories will be published.")}`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: __("Publish"),
          cancelButtonText: __("Cancel"),
        });
        if (!result.isConfirmed) return;
        bulkSubmitting.value = true;
        actionsOpen.value = false;
        await axios.post(`projects/${pid}/collections/${cid}/entries/publish-selected`, { selected: [...selectedIds.value] });
        toast.success(`${selectedIds.value.size} ${__("categories published.")}`);
        clearSelection();
        reload();
      } catch (e) {
        toast.error(__("Failed to publish selected categories."));
      } finally {
        bulkSubmitting.value = false;
      }
    }

    async function bulkUnpublish() {
      if (!selectedIds.value.size || bulkSubmitting.value) return;
      try {
        const result = await Swal.fire({
          title: __("Unpublish selected categories?"),
          text: `${selectedIds.value.size} ${__("categories will be unpublished.")}`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: __("Unpublish"),
          cancelButtonText: __("Cancel"),
        });
        if (!result.isConfirmed) return;
        bulkSubmitting.value = true;
        actionsOpen.value = false;
        await axios.post(`projects/${pid}/collections/${cid}/entries/unpublish-selected`, { selected: [...selectedIds.value] });
        toast.success(`${selectedIds.value.size} ${__("categories unpublished.")}`);
        clearSelection();
        reload();
      } catch (e) {
        toast.error(__("Failed to unpublish selected categories."));
      } finally {
        bulkSubmitting.value = false;
      }
    }

    async function bulkMoveToTrash() {
      if (!selectedIds.value.size || bulkSubmitting.value) return;
      try {
        const result = await Swal.fire({
          title: __("Move selected categories to trash?"),
          text: `${selectedIds.value.size} ${__("categories will be moved to the trash.")}`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: __("Move"),
          cancelButtonText: __("Cancel"),
        });
        if (!result.isConfirmed) return;
        bulkSubmitting.value = true;
        actionsOpen.value = false;
        await axios.post(`projects/${pid}/collections/${cid}/entries/move-to-trash-selected`, { selected: [...selectedIds.value] });
        toast.success(`${selectedIds.value.size} ${__("categories moved to trash.")}`);
        clearSelection();
        reload();
      } catch (e) {
        const msg = e.response && e.response.data && e.response.data.message;
        toast.error(msg ? __(msg, e.response.data) : __("Failed to move selected categories to trash."));
      } finally {
        bulkSubmitting.value = false;
      }
    }

    async function bulkDelete() {
      if (!selectedIds.value.size || bulkSubmitting.value) return;
      try {
        const result = await Swal.fire({
          title: __("Delete selected categories permanently?"),
          text: `${selectedIds.value.size} ${__("categories will be permanently deleted. This cannot be undone.")}`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: __("Delete"),
          confirmButtonColor: "#dc2626",
          cancelButtonText: __("Cancel"),
        });
        if (!result.isConfirmed) return;
        bulkSubmitting.value = true;
        actionsOpen.value = false;
        await axios.post(`projects/${pid}/collections/${cid}/entries/delete-selected`, { selected: [...selectedIds.value] });
        toast.success(`${selectedIds.value.size} ${__("categories deleted.")}`);
        clearSelection();
        reload();
      } catch (e) {
        const msg = e.response && e.response.data && e.response.data.message;
        toast.error(msg ? __(msg, e.response.data) : __("Failed to delete selected categories."));
      } finally {
        bulkSubmitting.value = false;
      }
    }

    onMounted(() => {
      document.addEventListener("click", handleDocumentClick);
      reload(1);
    });
    onBeforeUnmount(() => {
      document.removeEventListener("click", handleDocumentClick);
    });

    return {
      project, collection, rows, loading, search, each, currentPage, totalCount,
      totalPages, visiblePages, canEdit, canManage, reload, moveToTrash,
      selectedIds, actionsOpen, bulkSubmitting, allPageSelected,
      isSelected, toggleSelect, toggleSelectAllPage, clearSelection,
      bulkPublish, bulkUnpublish, bulkMoveToTrash, bulkDelete,
    };
  },
};
</script>

<style scoped>
tbody tr.row-selected {
  background-color: #eef2ff;
}
</style>
