<template>
  <div class="flex h-full flex-col bg-gray-50">
    <project-header :project="project" />

    <div class="flex min-h-0 flex-1">
      <collection-sidebar :project="project" class="w-3/12 shrink-0 overflow-x-hidden bg-white" />

      <div class="min-w-0 flex-1 overflow-auto p-6">
        <div class="mb-5 flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm">
            <router-link
              :to="{ name: 'projects.collections.content.list', params: { project_id: pid, col_id: cid } }"
              class="text-gray-500 hover:text-indigo-500"
            >
              {{ __(collection.name || 'Categories') }}
            </router-link>
            <i class="fa fa-angle-right text-gray-300"></i>
            <span class="text-gray-800">{{ form.title || __('Edit Category') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <a
              v-if="form.slug"
              :href="`/navigation/category/${form.slug}`"
              target="_blank"
              rel="noopener"
              class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            ><i class="fa fa-external-link-alt mr-1"></i>{{ __('Preview') }}</a>
            <button
              v-if="canManage"
              type="button"
              class="rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm text-orange-600 hover:bg-orange-100"
              @click="moveToTrash"
            ><i class="fa fa-trash-restore mr-1"></i>{{ __('Trash') }}</button>
            <button
              type="button"
              class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              @click="save(false)"
            >{{ __('Save as Draft') }}</button>
            <button
              type="button"
              class="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
              :disabled="saving"
              @click="save(true)"
            >{{ saving ? __('Saving...') : __('Save & Publish') }}</button>
          </div>
        </div>

        <div class="max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 class="mb-5 flex items-center gap-2 text-base font-semibold text-gray-800">
            <i class="fa fa-folder text-indigo-500"></i>{{ __('Category Details') }}
          </h3>

          <div class="space-y-5">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">
                {{ __('Name') }} <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.title"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                :placeholder="__('e.g. Development Tools')"
              />
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">{{ __('Slug') }}</label>
              <input
                v-model="form.slug"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                :placeholder="__('e.g. dev-tools (used in the frontend URL)')"
              />
              <p class="mt-1 text-xs text-gray-400">{{ __('Leave empty to auto-generate from the name.') }}</p>
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">{{ __('Color') }}</label>
              <div class="flex items-center gap-3">
                <input
                  v-model="form.color"
                  type="color"
                  class="h-10 w-14 cursor-pointer rounded-lg border border-gray-200"
                />
                <input
                  v-model="form.color"
                  type="text"
                  class="w-32 rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-indigo-400 focus:outline-none"
                  placeholder="#6366f1"
                />
                <span
                  class="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-[10px] text-white"
                  :style="{ background: form.color || '#e2e8f0' }"
                >{{ (form.title || '?')[0] || '' }}</span>
              </div>
              <p class="mt-1 text-xs text-gray-400">{{ __('Used for the category badge and banner on the frontend.') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { useAdminStore } from "@/admin/store";
import { __ } from "@/admin/translations/engine";
import ProjectHeader from "@/admin/components/ProjectHeader.vue";
import CollectionSidebar from "@/admin/components/CollectionSidebar.vue";

export default {
  name: "NavigationCategoriesEdit",
  components: { ProjectHeader, CollectionSidebar },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useAdminStore();
    const pid = route.params.project_id;
    const cid = route.params.col_id;
    const contentId = route.params.content_id;

    const project = ref(null);
    const collection = ref({ name: "Categories" });
    const saving = ref(false);

    const form = reactive({
      title: "",
      slug: "",
      color: "#6366f1",
    });

    const canManage = computed(() => {
      const p = store.currentProject || project.value;
      return p && !(p.is_readonly || !p.status) && ["owner", "admin"].includes(p.my_role);
    });

    function metaValue(name) {
      const item = (entryMeta.value || []).find((m) => m.field_name === name);
      return item ? item.value : null;
    }
    const entryMeta = ref([]);

    async function loadEntry() {
      const { data } = await axios.get(`projects/${pid}/collections/${cid}/${contentId}/edit`);
      project.value = data.project;
      collection.value = data.collection || { name: "Categories" };
      entryMeta.value = (data.content && data.content.meta) || [];
      form.title = metaValue("title") || "";
      form.slug = metaValue("slug") || "";
      form.color = metaValue("color") || "#6366f1";
    }

    async function save(published) {
      if (!form.title.trim()) {
        window.$toast.error(__("Name is required."));
        return;
      }
      saving.value = true;
      try {
        await axios.post(`projects/${pid}/collections/${cid}/${contentId}`, {
          project_id: Number(pid),
          collection_id: Number(cid),
          locale: (project.value && project.value.default_locale) || "zh",
          published,
          data: {
            title: form.title,
            slug: form.slug,
            color: form.color,
          },
        });
        window.$toast.success(__("Category saved!"));
        router.push({
          name: "projects.collections.content.list",
          params: { project_id: pid, col_id: cid },
        });
      } catch (e) {
        const msg = e.response && e.response.data && e.response.data.message;
        window.$toast.error(msg || __("Failed to save category."));
      } finally {
        saving.value = false;
      }
    }

    async function moveToTrash() {
      try {
        const result = await window.$swal.fire({
          title: __("Move to trash?"),
          text: `"${form.title}"`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: __("Move"),
          cancelButtonText: __("Cancel"),
        });
        if (!result.isConfirmed) return;
        await axios.delete(`projects/${pid}/collections/${cid}/${contentId}/move-to-trash`);
        window.$toast.success(__("Moved to trash."));
        router.push({
          name: "projects.collections.content.list",
          params: { project_id: pid, col_id: cid },
        });
      } catch (e) {
        window.$toast.error(__("Failed to move to trash."));
      }
    }

    onMounted(async () => {
      try {
        await loadEntry();
      } catch (e) {
        console.error("load edit form failed:", e);
        window.$toast.error(__("Failed to load category."));
      }
    });

    return { pid, cid, contentId, project, collection, saving, form, canManage, save, moveToTrash };
  },
};
</script>
