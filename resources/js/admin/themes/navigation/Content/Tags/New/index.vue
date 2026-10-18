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
              {{ __(collection.name || 'Tags') }}
            </router-link>
            <i class="fa fa-angle-right text-gray-300"></i>
            <span class="text-gray-800">{{ __('Add New Tag') }}</span>
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
            <i class="fa fa-tag text-indigo-500"></i>{{ __('Tag Details') }}
          </h3>

          <div class="space-y-5">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700">
                {{ __('Tag') }} <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.tag"
                type="text"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                :placeholder="__('e.g. Design')"
              />
              <p class="mt-1 text-xs text-gray-400">{{ __('Used on link cards as a # tag.') }}</p>
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
import ProjectHeader from "@/admin/components/ProjectHeader.vue";
import CollectionSidebar from "@/admin/components/CollectionSidebar.vue";

export default {
  name: "NavigationTagsNew",
  components: { ProjectHeader, CollectionSidebar },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const pid = route.params.project_id;
    const cid = route.params.col_id;

    const project = ref(null);
    const collection = ref({ name: "Tags" });
    const saving = ref(false);

    const form = reactive({
      tag: "",
    });

    async function save(published) {
      if (!form.tag.trim()) {
        window.$toast.error(__("Tag is required."));
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
            tag: form.tag,
          },
        });
        window.$toast.success(__("Tag created!"));
        router.push({
          name: "projects.collections.content.list",
          params: { project_id: pid, col_id: cid },
        });
      } catch (e) {
        const msg = e.response && e.response.data && e.response.data.message;
        window.$toast.error(msg || __("Failed to create tag."));
      } finally {
        saving.value = false;
      }
    }

    onMounted(async () => {
      try {
        const { data } = await axios.get(`projects/${pid}/collections/${cid}/new`);
        project.value = data.project;
        collection.value = data.collection || { name: "Tags" };
      } catch (e) {
        console.error("load new form failed:", e);
      }
    });

    return { pid, cid, project, collection, saving, form, save };
  },
};
</script>
