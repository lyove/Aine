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
            <span class="text-gray-800">{{ __('Add New Category') }}</span>
          </div>
          <div class="flex items-center gap-2">
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
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { __ } from "@/admin/translations/engine";
import Swal from "sweetalert2";
import { useToast } from "vue-toastification";
import { useAdminStore } from "@/admin/store";
import ProjectHeader from "@/admin/components/ProjectHeader.vue";
import CollectionSidebar from "@/admin/components/CollectionSidebar.vue";

export default {
  name: "NavigationCategoriesNew",
  components: { ProjectHeader, CollectionSidebar },
  setup() {
    const toast = useToast();
    const route = useRoute();
    const router = useRouter();
    const store = useAdminStore();
    const pid = route.params.project_id;
    const cid = route.params.col_id;

    const project = ref(store.currentProject || {});
    const collection = ref(store.currentCollection || { name: "Categories" });
    const saving = ref(false);

    const form = reactive({
      title: "",
      slug: "",
      color: "#6366f1",
    });

    async function save(published) {
      if (!form.title.trim()) {
        toast.error(__("Name is required."));
        return;
      }
      saving.value = true;
      try {
        await axios.post(`projects/${pid}/collections/${cid}/entries`, {
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
        toast.success(__("Category created!"));
        router.push({
          name: "projects.collections.content.list",
          params: { project_id: pid, col_id: cid },
        });
      } catch (e) {
        const msg = e.response && e.response.data && e.response.data.message;
        toast.error(msg || __("Failed to create category."));
      } finally {
        saving.value = false;
      }
    }

    onMounted(async () => {
      try {
        const { data } = await axios.get(`projects/${pid}/collections/${cid}/new`);
        if (!project.value?.id) project.value = data.project;
        if (!collection.value?.id) collection.value = data.collection || { name: "Categories" };
      } catch (e) {
        console.error("load new form failed:", e);
      }
    });

    return { pid, cid, project, collection, saving, form, save };
  },
};
</script>
