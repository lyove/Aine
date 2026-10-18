<template>
  <div class="flex h-full flex-col bg-gray-50">
    <project-header :project="project" />

    <div class="flex min-h-0 flex-1">
      <collection-sidebar :project="project" class="w-3/12 shrink-0 overflow-x-hidden bg-white" />

      <div class="min-w-0 flex-1 overflow-auto p-5">
        <!-- 标题栏 + 操作 -->
        <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
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
              />
              <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400"></i>
            </div>
            <button
              type="button"
              class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              @click="reload()"
            ><i class="fa fa-sync-alt mr-1"></i>{{ __('Refresh') }}</button>
            <router-link
              v-if="canEdit"
              :to="{ name: 'projects.collections.content.new', params: { project_id: pid, col_id: cid } }"
              class="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600"
            ><i class="fa fa-plus mr-1"></i>{{ __('Add Tag') }}</router-link>
          </div>
        </div>

        <!-- 标签胶囊墙 -->
        <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div v-if="loading" class="flex flex-wrap gap-3">
            <div v-for="n in 9" :key="n" class="h-10 w-28 animate-pulse rounded-full bg-gray-100"></div>
          </div>

          <div v-else-if="!rows.length" class="py-16 text-center text-sm text-gray-400">
            <i class="fa fa-tags mb-3 block text-3xl text-gray-300"></i>
            {{ __('No tags yet.') }}
          </div>

          <div v-else-if="!filteredTags.length" class="py-16 text-center">
            <p class="text-sm text-gray-400">
              {{ __('No tags match') }} "#{{ search }}"
            </p>
            <router-link
              v-if="canEdit"
              :to="{ name: 'projects.collections.content.new', params: { project_id: pid, col_id: cid } }"
              class="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600"
            >
              <i class="fa fa-plus mr-1"></i>{{ __('Create tag') }} "#{{ search }}"
            </router-link>
          </div>

          <div v-else class="flex flex-wrap gap-3">
            <div
              v-for="tag in filteredTags"
              :key="tag.id"
              class="flex cursor-pointer items-center gap-2 rounded-full py-1.5 pl-4 pr-2 transition hover:shadow-md"
              :style="pillStyle(tag)"
              @click="editTag(tag)"
            >
              <span class="text-sm font-bold" :style="{ color: pillColor(tag) }">#{{ tag.name }}</span>
              <span
                class="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                :style="{ background: pillColor(tag) + '26', color: pillColor(tag) }"
              >{{ tag.usage }} {{ __('links') }}</span>

              <!-- 操作按钮：常显，不依赖 hover -->
              <span class="ml-1 flex items-center gap-0.5">
                <router-link
                  v-if="canEdit"
                  :to="{ name: 'projects.collections.content.edit', params: { project_id: pid, col_id: cid, content_id: tag.id } }"
                  class="rounded-full p-1 text-indigo-400 hover:bg-indigo-100 hover:text-indigo-600"
                  :title="__('Edit')"
                  @click.stop
                ><i class="fa fa-pencil-alt text-[10px]"></i></router-link>
                <button
                  v-if="canManage"
                  type="button"
                  class="rounded-full p-1 text-orange-400 hover:bg-orange-100 hover:text-orange-600"
                  :title="__('Delete')"
                  @click.stop="moveToTrash(tag)"
                ><i class="fa fa-trash-alt text-[10px]"></i></button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { useAdminStore } from "@/admin/store";
import { __ } from "@/admin/translations/engine";
import Swal from "sweetalert2";
import { useToast } from "vue-toastification";
import ProjectHeader from "@/admin/components/ProjectHeader.vue";
import CollectionSidebar from "@/admin/components/CollectionSidebar.vue";

export default {
  name: "NavigationTagsList",
  components: { ProjectHeader, CollectionSidebar },
  setup() {
    const toast = useToast();
    const route = useRoute();
    const router = useRouter();
    const store = useAdminStore();
    const pid = route.params.project_id;
    const cid = route.params.col_id;

    const project = ref(null);
    const collection = ref({ name: "Tags" });
    const rows = ref([]);
    const loading = ref(true);
    const search = ref("");
    const totalCount = ref(0);

    // 预设胶囊配色（id 取模轮换）
    const PILL_COLORS = ["#4f46e5", "#dc2626", "#16a34a", "#d97706", "#0891b2", "#7c3aed", "#db2777", "#65a30d"];

    const canEdit = computed(() => {
      const p = store.currentProject || project.value;
      return p && !(p.is_readonly || !p.status) && ["owner", "admin", "editor"].includes(p.my_role);
    });
    const canManage = computed(() => {
      const p = store.currentProject || project.value;
      return p && !(p.is_readonly || !p.status) && ["owner", "admin"].includes(p.my_role);
    });

    const filteredTags = computed(() => {
      const q = search.value.trim().toLowerCase();
      if (!q) return rows.value;
      return rows.value.filter((t) => (t.name || "").toLowerCase().includes(q));
    });

    function pillColor(tag) {
      return PILL_COLORS[tag.id % PILL_COLORS.length];
    }
    function pillStyle(tag) {
      const c = pillColor(tag);
      return { background: c + "0f" };
    }

    function metaValue(row, name) {
      const item = (row.meta || []).find((m) => m.field_name === name);
      return item ? item.value : null;
    }

    async function reload() {
      loading.value = true;
      try {
        const { data } = await axios.get(`projects/${pid}/collections/${cid}/entries`, {
          params: { each: 200, getItems: "all" },
        });
        project.value = data.project;
        collection.value = data.collection || { name: "Tags" };
        totalCount.value = data.totalCount || 0;
        const tags = (data.content.data || []).map((row) => ({
          id: row.id,
          name: metaValue(row, "tag") || `#${row.id}`,
        }));
        rows.value = tags;
        await loadUsage(tags);
      } catch (e) {
        console.error("load tags failed:", e);
      } finally {
        loading.value = false;
      }
    }

    // 统计每个 tag 被多少 links 引用（links 的 tags 字段是逗号分隔的 id）
    async function loadUsage(tags) {
      const usage = {};
      tags.forEach((t) => { usage[t.id] = 0; });
      try {
        const linksCol = (project.value.collections || []).find((c) => c.slug === "links");
        if (!linksCol) return;
        const { data } = await axios.get(`projects/${pid}/collections/${linksCol.id}/entries`, {
          params: { each: 200, getItems: "all" },
        });
        (data.content.data || []).forEach((row) => {
          const v = metaValue(row, "tags");
          if (!v) return;
          String(v).split(",").filter(Boolean).forEach((id) => {
            if (usage[id] !== undefined) usage[id]++;
          });
        });
      } catch (e) {
        // 统计失败不阻塞页面
      }
      rows.value = rows.value.map((t) => ({ ...t, usage: usage[t.id] || 0 }));
    }

    function editTag(tag) {
      router.push({
        name: "projects.collections.content.edit",
        params: { project_id: pid, col_id: cid, content_id: tag.id },
      });
    }

    async function moveToTrash(tag) {
      try {
        const result = await Swal.fire({
          title: __("Delete tag?"),
          text: `"${tag.name}" ${__("will be removed from all links.")}`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: __("Delete"),
          cancelButtonText: __("Cancel"),
        });
        if (!result.isConfirmed) return;
        await axios.delete(`projects/${pid}/collections/${cid}/${tag.id}/move-to-trash`);
        toast.success(__("Tag deleted and removed from links."));
        reload();
      } catch (e) {
        toast.error(__("Failed to delete tag."));
      }
    }

    onMounted(() => reload());

    return {
      project, collection, rows, loading, search, totalCount,
      filteredTags, canEdit, canManage,
      pillColor, pillStyle, editTag, moveToTrash, reload,
    };
  },
};
</script>
