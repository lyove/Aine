<template>
  <div class="flex h-full flex-col bg-gray-50">
    <project-header :project="project" />

    <div class="flex min-h-0 flex-1">
      <collection-sidebar :project="project" class="w-3/12 shrink-0 overflow-x-hidden bg-white" />

      <div class="min-w-0 flex-1 overflow-auto p-5">
        <!-- Toolbar + actions -->
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-bold text-gray-800">{{ __(collection.name || 'Links') }}</h2>
            <p class="mt-0.5 text-sm text-gray-400">
              {{ totalCount }} {{ __('links') }} · {{ publishedCount }} {{ __('published') }}
              <span v-if="draftCount" class="ml-2 text-amber-500">{{ draftCount }} {{ __('drafts') }}</span>
              <span v-if="trashedCount" class="ml-2 text-orange-500">{{ trashedCount }} {{ __('trashed') }}</span>
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <div class="relative">
              <input
                v-model="search"
                type="text"
                class="w-56 rounded-lg border border-gray-300 py-1.5 pl-8 pr-3 text-sm focus:border-indigo-400 focus:outline-none"
                :placeholder="__('Search links...')"
                @keyup.enter="reload(1)"
              />
              <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400"></i>
            </div>

            <button
              type="button"
              class="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-50"
              :disabled="checking || !rows.length"
              @click="checkAll"
            >
              <i class="fa fa-heartbeat mr-1"></i>{{ __('Check All') }}
            </button>
            <button
              type="button"
              class="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
              :disabled="checking || !deadRows.length"
              @click="checkDead"
            >
              <i class="fa fa-redo-alt mr-1"></i>{{ __('Re-check Dead') }}
            </button>

            <button
              type="button"
              class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              @click="reload(currentPage)"
            >
              <i class="fa fa-sync-alt mr-1"></i>{{ __('Refresh') }}
            </button>

            <router-link
              v-if="canEdit"
              :to="{ name: 'projects.collections.content.new', params: { project_id: pid, col_id: cid } }"
              class="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600"
            >
              <i class="fa fa-plus mr-1"></i>{{ __('Add Link') }}
            </router-link>
          </div>
        </div>

        <div
          v-if="checking"
          class="mb-4 flex items-center gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-2.5"
        >
          <i class="fa fa-spinner fa-spin text-sky-500"></i>
          <span class="text-sm font-medium text-sky-700">
            {{ __('Checking') }} {{ checkedCount }}/{{ checkTotal }}
          </span>
          <div class="h-2 flex-1 overflow-hidden rounded-full bg-sky-100">
            <div
              class="h-full rounded-full bg-sky-500 transition-all"
              :style="{ width: checkPercent + '%' }"
            ></div>
          </div>
          <span class="text-xs text-sky-600">
            <span class="font-semibold text-emerald-600">{{ checkOk }}</span> {{ __('ok') }}
            · <span class="font-semibold text-red-500">{{ checkDeadCount }}</span> {{ __('dead') }}
          </span>
          <button
            type="button"
            class="text-xs font-medium text-sky-500 hover:text-sky-700"
            @click="stopChecking = true"
          >{{ __('Stop') }}</button>
        </div>

        <div class="mb-4 flex items-center gap-1">
          <button
            v-for="tab in statusTabs"
            :key="tab.value"
            type="button"
            class="rounded-full px-3 py-1 text-sm"
            :class="getItems === tab.value ? 'bg-indigo-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'"
            @click="changeGetItems(tab.value)"
          >
            {{ tab.label }}
          </button>
          <button
            type="button"
            class="ml-1 rounded-full px-3 py-1 text-sm"
            :class="linkFilter === 'dead' ? 'bg-red-500 text-white' : 'bg-white text-red-500 hover:bg-red-50'"
            @click="toggleDeadFilter"
          >
            <i class="fa fa-exclamation-triangle mr-1"></i>{{ __('Dead') }}
            <span v-if="deadRows.length" class="ml-1 rounded-full bg-white/20 px-1.5 text-xs">{{ deadRows.length }}</span>
          </button>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <div v-if="loading" class="space-y-2 p-5">
            <div v-for="n in 5" :key="n" class="h-12 animate-pulse rounded-lg bg-gray-100"></div>
          </div>

          <div v-else-if="!filteredRows.length" class="p-14 text-center text-sm text-gray-400">
            <i class="fa fa-link-slash mb-3 block text-3xl text-gray-300"></i>
            {{ linkFilter === 'dead' ? __('No dead links found.') : __('No links found.') }}
          </div>

          <table v-else class="w-full min-w-[1100px] text-left text-sm">
            <thead class="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th class="px-4 py-3 font-medium">{{ __('Link') }}</th>
                <th class="px-4 py-3 font-medium">{{ __('Category') }}</th>
                <th class="px-4 py-3 font-medium">{{ __('Tags') }}</th>
                <th class="px-4 py-3 font-medium">{{ __('Weight') }}</th>
                <th class="px-4 py-3 font-medium">{{ __('Click') }}</th>
                <th class="px-4 py-3 font-medium">{{ __('Availability') }}</th>
                <th class="px-4 py-3 font-medium">{{ __('Status') }}</th>
                <th class="actions-col sticky right-0 z-20 whitespace-nowrap bg-gray-50 px-4 py-3 text-right font-medium shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.08)]">{{ __('Actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="row in filteredRows" :key="row.id" class="group hover:bg-indigo-50/40">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <img
                      v-if="row._favicon"
                      :src="row._favicon"
                      :alt="row.title"
                      class="h-9 w-9 shrink-0 rounded-lg border border-gray-100 bg-white object-contain p-0.5"
                      loading="lazy"
                      @error="row._favicon = ''"
                    />
                    <div
                      v-else
                      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-500"
                    >
                      {{ initials(row.title) }}
                    </div>
                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5">
                        <span class="truncate font-medium text-gray-800">{{ row.title }}</span>
                        <span
                          v-if="row.featured === '1' || row.featured === true"
                          class="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600"
                        >Featured</span>
                        <span
                          v-if="row.private === '1' || row.private === true"
                          class="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500"
                        ><i class="fa fa-lock mr-0.5"></i>Private</span>
                      </div>
                      <div class="truncate text-xs text-gray-400">{{ row.url }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span
                    v-if="categoryName(row.category)"
                    class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs"
                    :style="categoryStyle(row.category)"
                  >
                    <span
                      v-if="categoryColor(row.category)"
                      class="inline-block h-2 w-2 rounded-full"
                      :style="{ background: categoryColor(row.category) }"
                    ></span>
                    {{ categoryName(row.category) }}
                  </span>
                  <span v-else class="text-xs text-gray-300">—</span>
                </td>
                <td class="px-4 py-3">
                  <span class="flex flex-wrap gap-1">
                    <span
                      v-for="tag in tagNames(row.tags)"
                      :key="tag"
                      class="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600"
                    >#{{ tag }}</span>
                    <span v-if="!tagNames(row.tags).length" class="text-xs text-gray-300">—</span>
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-500">{{ row.weight || 0 }}</td>
                <td class="px-4 py-3">
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="clickBehavior(row.click_behavior) === 'direct'
                      ? 'bg-sky-100 text-sky-600'
                      : 'bg-violet-100 text-violet-600'"
                  >
                    {{ clickBehavior(row.click_behavior) === 'direct' ? __('Direct open') : __('Detail page') }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span v-if="checkingIds.has(row.id)" class="inline-flex items-center gap-1.5 text-xs text-sky-500">
                    <i class="fa fa-spinner fa-spin"></i>{{ __('Checking') }}
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold"
                    :class="availabilityClass(row)"
                  >
                    <template v-if="row.link_status === 'ok'">
                      <i class="fa fa-check-circle"></i>{{ row.http_code || 'OK' }}
                    </template>
                    <template v-else-if="row.link_status === 'dead'">
                      <i class="fa fa-exclamation-circle"></i>{{ row.http_code ? 'HTTP ' + row.http_code : __('Dead') }}
                    </template>
                    <template v-else>
                      <i class="fa fa-minus-circle"></i>{{ __('Unknown') }}
                    </template>
                  </span>
                  <div v-if="row.link_status && row.link_status !== 'unknown' && row.last_checked_at" class="mt-0.5 text-[10px] text-gray-400">
                    {{ row.last_checked_at }}
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="rounded-full px-2 py-0.5 text-xs"
                    :class="statusClass(row.status)"
                  >{{ statusLabel(row.status) }}</span>
                </td>
                <td class="actions-col sticky right-0 z-10 whitespace-nowrap bg-white px-4 py-3 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.08)]">
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

          <!-- Pagination -->
          <div v-if="rows.length" class="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
            <span class="text-xs text-gray-400">
              {{ (currentPage - 1) * each + 1 }}–{{ Math.min(currentPage * each, totalCount) }} / {{ totalCount }}
            </span>
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
  name: "NavigationLinksList",
  components: { ProjectHeader, CollectionSidebar },
  setup() {
    const toast = useToast();
    const route = useRoute();
    const store = useAdminStore();

    const pid = route.params.project_id;
    const cid = route.params.col_id;

    const project = ref(store.currentProject || {});
    const collection = ref(store.currentCollection || { name: "Links" });
    const content = ref({ data: [], total: 0 });
    const rows = ref([]);
    const loading = ref(true);

    const search = ref("");
    const each = ref(10);
    const currentPage = ref(1);
    const getItems = ref("all");
    const linkFilter = ref("all"); // "all" | "dead" (client-side availability filter)

    const checking = ref(false);
    const stopChecking = ref(false);
    const checkingIds = ref(new Set());
    const checkedCount = ref(0);
    const checkTotal = ref(0);
    const checkOk = ref(0);
    const checkDeadCount = ref(0);

    const totalCount = ref(0);
    const publishedCount = ref(0);
    const draftCount = ref(0);
    const trashedCount = ref(0);

    const categoryMap = ref({});
    const tagMap = ref({});

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

    const statusTabs = [
      { value: "all", label: __("All") },
      { value: "published", label: __("Published") },
      { value: "draft", label: __("Draft") },
      { value: "trashed", label: __("Trashed") },
    ];

    function metaValue(row, name) {
      const item = (row.meta || []).find((m) => m.field_name === name);
      return item ? item.value : null;
    }

    function initials(title) {
      return (title || "?")
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
    }

    function clickBehavior(value) {
      return value === "direct" ? "direct" : "detail";
    }

    function statusLabel(status) {
      return { published: __("Published"), draft: __("Draft"), trashed: __("Trashed"), archived: __("Archived") }[status] || status || __("Draft");
    }
    function statusClass(status) {
      if (status === "published") return "bg-emerald-100 text-emerald-600";
      if (status === "trashed") return "bg-orange-100 text-orange-600";
      return "bg-amber-100 text-amber-600";
    }

    function availabilityClass(row) {
      if (row.link_status === "ok") return "bg-emerald-100 text-emerald-600";
      if (row.link_status === "dead") return "bg-red-100 text-red-600";
      return "bg-gray-100 text-gray-400";
    }

    const deadRows = computed(() => rows.value.filter((r) => r.link_status === "dead"));
    const checkPercent = computed(() => (checkTotal.value ? Math.round((checkedCount.value / checkTotal.value) * 100) : 0));

    function categoryName(value) {
      const id = String(value || "").split(",")[0];
      return id && categoryMap.value[id] ? categoryMap.value[id].name : null;
    }
    function categoryColor(value) {
      const id = String(value || "").split(",")[0];
      return id && categoryMap.value[id] ? categoryMap.value[id].color : null;
    }
    function categoryStyle(value) {
      const color = categoryColor(value);
      if (!color) return {};
      return { backgroundColor: color + "1a", color: color };
    }
    function tagNames(value) {
      const ids = String(value || "").split(",").filter(Boolean);
      return ids.map((id) => (tagMap.value[id] ? tagMap.value[id].name : id)).filter(Boolean);
    }

    const nameMapsCache = ref({});

    async function loadNameMaps() {
      const fields = collection.value.fields || [];
      const relationTargets = [];
      fields.forEach((field) => {
        let opts = field.options;
        if (typeof opts === "string") {
          try { opts = JSON.parse(opts); } catch (e) { opts = {}; }
        }
        if (field.type === "relation" && opts && opts.relation && opts.relation.collection) {
          relationTargets.push({ field: field.name, target: opts.relation.collection });
        }
      });

      const pending = relationTargets.filter((rel) => !nameMapsCache.value[rel.target]);

      await Promise.all(
        pending.map(async (rel) => {
          try {
            const { data } = await axios.get(`projects/${pid}/collections/${rel.target}/entries`, {
              params: { each: 200, getItems: "all" },
            });
            const target = data.collection ? data.collection.slug : null;
            const names = {};
            (data.content.data || []).forEach((row) => {
              const nameMeta = (row.meta || []).find((m) =>
                ["name", "title", "tag"].includes(m.field_name)
              );
              const colorMeta = (row.meta || []).find((m) => m.field_name === "color");
              names[row.id] = {
                name: nameMeta ? nameMeta.value : `#${row.id}`,
                color: colorMeta ? colorMeta.value : null,
              };
            });
            nameMapsCache.value[rel.target] = names;
            if (target === "tags") {
              tagMap.value = names;
            } else {
              categoryMap.value = names;
            }
          } catch (e) {
            console.error("load relation map failed:", rel.target, e);
          }
        })
      );
    }

    function flattenRow(row) {
      const flat = { id: row.id };
      (row.meta || []).forEach((m) => {
        flat[m.field_name] = m.value;
      });
      flat.status = row.deleted_at ? "trashed" : (row.published_at ? "published" : "draft");
      flat._favicon = row.favicon_url_thumb || row.favicon_url || "";
      return flat;
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
            getItems: getItems.value,
          },
        });
        if (!project.value?.id) project.value = data.project;
        if (!collection.value?.id) collection.value = data.collection;
        content.value = data.content;
        totalCount.value = data.totalCount || 0;
        publishedCount.value = data.published || 0;
        draftCount.value = data.draft || 0;
        trashedCount.value = data.trashed || 0;
        rows.value = (data.content.data || []).map(flattenRow);
        loadNameMaps();
      } catch (e) {
        console.error("load links failed:", e);
      } finally {
        loading.value = false;
      }
    }

    function changeGetItems(value) {
      getItems.value = value;
      linkFilter.value = "all";
      reload(1);
    }

    async function moveToTrash(row) {
      try {
        const result = await Swal.fire({
          title: __("Move to trash?"),
          text: `"${row.title}"`,
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

    async function checkRow(row) {
      checkingIds.value.add(row.id);
      try {
        const { data } = await axios.post(`projects/${pid}/collections/${cid}/${row.id}/check-link`);
        row.link_status = data.link_status;
        row.http_code = data.http_code;
        row.last_checked_at = data.last_checked_at;
        const live = rows.value.find((r) => r.id === row.id);
        if (live) {
          live.link_status = data.link_status;
          live.http_code = data.http_code;
          live.last_checked_at = data.last_checked_at;
        }
        if (data.link_status === "ok") checkOk.value++;
        else if (data.link_status === "dead") checkDeadCount.value++;
      } catch (e) {
        // Ignore check errors
      } finally {
        checkingIds.value.delete(row.id);
        checkedCount.value++;
      }
    }

    async function runCheck(targetRows) {
      if (!targetRows.length || checking.value) return;
      checking.value = true;
      stopChecking.value = false;
      checkOk.value = 0;
      checkDeadCount.value = 0;
      checkedCount.value = 0;
      checkTotal.value = targetRows.length;

      const CONCURRENCY = 4;
      let idx = 0;
      async function worker() {
        while (!stopChecking.value && idx < targetRows.length) {
          const row = targetRows[idx++];
          if (row.url) await checkRow(row);
          else checkedCount.value++;
        }
      }
      await Promise.all(Array.from({ length: Math.min(CONCURRENCY, targetRows.length) }, worker));

      checking.value = false;
      toast.success(
        __("Check complete") + `: ${checkOk.value} ${__("ok")} · ${checkDeadCount.value} ${__("dead")}`,
        { timeout: 4000 }
      );
    }

    async function fetchAllRows() {
      try {
        const { data } = await axios.get(`projects/${pid}/collections/${cid}/entries`, {
          params: { each: 200, getItems: "all", orderBy: "weight", cr: "ASC", sbm: 1 },
        });
        return (data.content.data || []).map(flattenRow);
      } catch (e) {
        return rows.value.slice();
      }
    }

    async function checkAll() {
      const all = await fetchAllRows();
      await runCheck(all.filter((r) => r.url));
    }

    async function checkDead() {
      const all = await fetchAllRows();
      await runCheck(all.filter((r) => r.url && r.link_status === "dead"));
    }

    function toggleDeadFilter() {
      linkFilter.value = linkFilter.value === "dead" ? "all" : "dead";
    }

    const filteredRows = computed(() =>
      linkFilter.value === "dead" ? rows.value.filter((r) => r.link_status === "dead") : rows.value
    );

    onMounted(() => {
      const qf = route.query.filter;
      if (qf && ["all", "published", "draft", "trashed"].includes(qf)) {
        getItems.value = qf;
      }
      reload(1);
    });

    return {
      project, collection, rows, loading,
      search, each, currentPage, getItems, linkFilter,
      totalCount, publishedCount, draftCount, trashedCount,
      totalPages, visiblePages, statusTabs,
      canEdit, canManage,
      initials, clickBehavior, statusLabel, statusClass, availabilityClass,
      categoryName, categoryColor, categoryStyle, tagNames,
      reload, changeGetItems, moveToTrash,
      checking, stopChecking, checkingIds, checkedCount, checkTotal, checkOk, checkDeadCount, checkPercent,
      deadRows, filteredRows, checkAll, checkDead, toggleDeadFilter,
    };
  },
};
</script>

<style scoped>
td.actions-col,
th.actions-col {
  background-color: #ffffff;
}
thead th.actions-col {
  background-color: #f9fafb;
}
.group:hover td.actions-col {
  background-color: #f8faff;
}
</style>
