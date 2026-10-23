<template>
  <div class="flex h-full flex-col bg-gray-50">
    <project-header :project="project" />

    <div class="flex min-h-0 flex-1">
      <collection-sidebar :project="project" class="w-3/12 shrink-0 overflow-x-hidden bg-white" />

      <div class="min-w-0 flex-1 overflow-auto p-6">
        <!-- Breadcrumb + save -->
        <div class="mb-5 flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm">
            <router-link
              :to="{ name: 'projects.collections.content.list', params: { project_id: pid, col_id: cid } }"
              class="text-gray-500 hover:text-indigo-500"
            >
              {{ __(collection.name || 'Links') }}
            </router-link>
            <i class="fa fa-angle-right text-gray-300"></i>
            <span class="text-gray-800">{{ __('Add New Link') }}</span>
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

        <div class="w-full space-y-5">
          <!-- Basic info -->
          <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-gray-800">
              <i class="fa fa-link text-indigo-500"></i>{{ __('Link Details') }}
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
                  :placeholder="__('Site name, e.g. GitHub')"
                />
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">
                  {{ __('URL') }} <span class="text-red-500">*</span>
                </label>
                <div class="flex items-center gap-3">
                  <input
                    v-model="form.url"
                    type="url"
                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                    :placeholder="__('https://example.com')"
                    @blur="previewFavicon"
                  />
                  <img
                    v-if="faviconPreview"
                    :src="faviconPreview"
                    alt="favicon"
                    class="h-9 w-9 shrink-0 rounded-lg border border-gray-100 bg-white object-contain p-0.5"
                    @error="faviconPreview = ''"
                  />
                  <div v-else class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-400">
                    ?
                  </div>
                </div>
                <p class="mt-1 text-xs text-gray-400">{{ __('Icon is fetched automatically from the site; no upload needed.') }}</p>
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">{{ __('Description') }}</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                  :placeholder="__('What is this site about?')"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Categories & tags -->
          <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-gray-800">
              <i class="fa fa-folder text-indigo-500"></i>{{ __('Organization') }}
            </h3>

            <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">{{ __('Category') }}</label>
                <select
                  v-model="form.category"
                  class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                >
                  <option value="">{{ __('-- Select category --') }}</option>
                  <option v-for="cat in categories" :key="cat.id" :value="String(cat.id)">
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">{{ __('Tags') }}</label>
                <div class="flex max-h-32 flex-wrap gap-2 overflow-auto rounded-lg border border-gray-200 p-3">
                  <label
                    v-for="tag in tags"
                    :key="tag.id"
                    class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition"
                    :class="selectedTags.includes(String(tag.id))
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-600'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'"
                  >
                    <input
                      v-model="selectedTags"
                      type="checkbox"
                      :value="String(tag.id)"
                      class="sr-only"
                    />
                    #{{ tag.name }}
                  </label>
                  <span v-if="!tags.length" class="text-sm text-gray-300">{{ __('No tags yet') }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Display settings -->
          <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-gray-800">
              <i class="fa fa-sliders-h text-indigo-500"></i>{{ __('Display & Behavior') }}
            </h3>

            <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">{{ __('Weight') }}</label>
                <input
                  v-model="form.weight"
                  type="number"
                  step="any"
                  class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                  :placeholder="__('Smaller shows first')"
                />
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700">{{ __('Click Behavior') }}</label>
                <div class="flex gap-3">
                  <label
                    class="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                    :class="form.click_behavior === 'detail' || !form.click_behavior
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-600'
                      : 'border-gray-200 text-gray-600'"
                  >
                    <input v-model="form.click_behavior" type="radio" value="detail" class="sr-only" />
                    <i class="fa fa-file-alt"></i>
                    {{ __('Detail page') }}
                  </label>
                  <label
                    class="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                    :class="form.click_behavior === 'direct'
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-600'
                      : 'border-gray-200 text-gray-600'"
                  >
                    <input v-model="form.click_behavior" type="radio" value="direct" class="sr-only" />
                    <i class="fa fa-external-link-alt"></i>
                    {{ __('Open directly') }}
                  </label>
                </div>
                <p class="mt-1 text-xs text-gray-400">{{ __('Detail page: open the link detail first. Direct: open the site in a new tab.') }}</p>
              </div>
            </div>

            <div class="mt-5 flex gap-6">
              <label class="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input v-model="form.featured" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-500" />
                <span class="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-600">Featured</span>
              </label>
              <label class="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input v-model="form.private" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-500" />
                <span class="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-semibold text-gray-500"><i class="fa fa-lock mr-0.5"></i>Private</span>
              </label>
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
import { useAdminStore } from "@/admin/store";
import { __ } from "@/admin/translations/engine";
import Swal from "sweetalert2";
import { useToast } from "vue-toastification";
import ProjectHeader from "@/admin/components/ProjectHeader.vue";
import CollectionSidebar from "@/admin/components/CollectionSidebar.vue";

export default {
  name: "NavigationLinksNew",
  components: { ProjectHeader, CollectionSidebar },
  setup() {
    const toast = useToast();
    const route = useRoute();
    const router = useRouter();
    const store = useAdminStore();

    const pid = route.params.project_id;
    const cid = route.params.col_id;

    const project = ref(store.currentProject || {});
    const collection = ref(store.currentCollection || { name: "Links", fields: [] });
    const categories = ref([]);
    const tags = ref([]);
    const selectedTags = ref([]);
    const faviconPreview = ref("");
    const saving = ref(false);

    const form = reactive({
      title: "",
      url: "",
      description: "",
      category: "",
      weight: "",
      featured: false,
      private: false,
      click_behavior: "detail",
    });

    // Generic: fetch id → name maps by collection id
    async function loadOptions() {
      // Find the relation targets in the current collection's fields
      let categoryTarget = null;
      let tagsTarget = null;
      (collection.value.fields || []).forEach((field) => {
        let opts = field.options;
        if (typeof opts === "string") {
          try { opts = JSON.parse(opts); } catch (e) { opts = {}; }
        }
        if (field.type === "relation" && opts && opts.relation && opts.relation.collection) {
          if (field.name === "category") categoryTarget = opts.relation.collection;
          if (field.name === "tags") tagsTarget = opts.relation.collection;
        }
      });

      if (categoryTarget) {
        const { data } = await axios.get(`projects/${pid}/collections/${categoryTarget}/entries`, {
          params: { each: 200, getItems: "all" },
        });
        categories.value = (data.content.data || []).map((row) => {
          const nameMeta = (row.meta || []).find((m) => ["name", "title", "tag"].includes(m.field_name));
          return { id: row.id, name: nameMeta ? nameMeta.value : `#${row.id}` };
        });
      }
      if (tagsTarget) {
        const { data } = await axios.get(`projects/${pid}/collections/${tagsTarget}/entries`, {
          params: { each: 200, getItems: "all" },
        });
        tags.value = (data.content.data || []).map((row) => {
          const nameMeta = (row.meta || []).find((m) => ["name", "title", "tag"].includes(m.field_name));
          return { id: row.id, name: nameMeta ? nameMeta.value : `#${row.id}` };
        });
      }
    }

    async function previewFavicon() {
      if (!form.url) return;
      try {
        const { data } = await axios.get("/api/getFavicon", {
          params: { url: form.url },
          baseURL: "",
          skipAuthRedirect: true,
        });
        if (data && data.data && data.data.favicon_url && !data.data.favicon_url.startsWith("data:")) {
          faviconPreview.value = data.data.favicon_url;
        } else {
          faviconPreview.value = "";
        }
      } catch (e) {
        faviconPreview.value = "";
      }
    }

    function buildData() {
      return {
        title: form.title,
        url: form.url,
        description: form.description,
        category: form.category,
        tags: selectedTags.value.join(","),
        weight: form.weight === "" || form.weight === null ? null : Number(form.weight),
        featured: form.featured ? "1" : "0",
        private: form.private ? "1" : "0",
        click_behavior: form.click_behavior || "detail",
      };
    }

    async function save(published) {
      if (!form.title.trim()) {
        toast.error(__("Name is required."));
        return;
      }
      if (!form.url.trim()) {
        toast.error(__("URL is required."));
        return;
      }
      saving.value = true;
      try {
        await axios.post(`projects/${pid}/collections/${cid}/entries`, {
          project_id: Number(pid),
          collection_id: Number(cid),
          locale: (project.value && project.value.default_locale) || "zh",
          published,
          data: buildData(),
        });
        toast.success(__("Link created!"));
        router.push({
          name: "projects.collections.content.list",
          params: { project_id: pid, col_id: cid },
        });
      } catch (e) {
        const msg = e.response && e.response.data && e.response.data.message;
        toast.error(msg || __("Failed to create link."));
      } finally {
        saving.value = false;
      }
    }

    onMounted(async () => {
      try {
        const { data } = await axios.get(`projects/${pid}/collections/${cid}/new`);
        if (!project.value?.id) project.value = data.project;
        if (!collection.value?.id) collection.value = data.collection || { name: "Links", fields: [] };
        await loadOptions();
      } catch (e) {
        console.error("load new form failed:", e);
      }
    });

    return {
      pid, cid, project, collection,
      categories, tags, selectedTags, faviconPreview, saving, form,
      previewFavicon, save,
    };
  },
};
</script>
