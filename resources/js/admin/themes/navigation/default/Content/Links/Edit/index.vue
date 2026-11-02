<template>
  <div class="flex h-full flex-col bg-gray-50">
    <project-header :project="project" />

    <div class="flex min-h-0 flex-1">
      <collection-sidebar :project="project" class="w-72 shrink-0 overflow-x-hidden bg-white" />

      <div class="min-w-0 flex-1 overflow-auto p-6">
        <!-- Breadcrumb + actions -->
        <div class="mb-5 flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm">
            <router-link
              :to="{ name: 'projects.collections.content.list', params: { project_id: pid, col_id: cid } }"
              class="text-gray-500 hover:text-indigo-500"
            >
              {{ __(collection.name || 'Links') }}
            </router-link>
            <i class="fa fa-angle-right text-gray-300"></i>
            <span class="text-gray-800">{{ form.title || __('Edit Link') }}</span>
          </div>
          <div class="flex items-center gap-2">
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
                  <div class="relative shrink-0">
                    <img
                      v-if="faviconPreview"
                      :src="faviconPreview"
                      alt="favicon"
                      class="h-9 w-9 cursor-pointer rounded-lg border border-gray-100 bg-white object-contain p-0.5"
                      @error="faviconPreview = ''"
                      @click="faviconSource !== 'upload' && previewFavicon()"
                    />
                    <div
                      v-else
                      class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-400"
                      @click="faviconSource !== 'upload' && previewFavicon()"
                    >
                      ?
                    </div>
                  </div>
                </div>
                <p class="mt-1 text-xs text-gray-400">
                  {{ __('Icon is auto-fetched from the site.') }}
                  <span v-if="faviconSource === 'auto'" class="ml-1 rounded bg-blue-100 px-1.5 py-0.5 text-blue-600">{{ __('Auto-fetched') }}</span>
                </p>
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

          <!-- Icon (from media library) -->
          <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-gray-800">
              <i class="fa fa-image text-indigo-500"></i>{{ __('Icon') }}
            </h3>
            <div class="flex items-start gap-5">
              <div class="relative shrink-0">
                <img
                  v-if="faviconPreview && faviconSource === 'upload'"
                  :src="faviconPreview"
                  alt="favicon"
                  class="h-20 w-20 rounded-lg border border-gray-100 bg-white object-contain p-1"
                  @error="faviconPreview = ''"
                />
                <div
                  v-else
                  class="flex h-20 w-20 items-center justify-center rounded-lg bg-indigo-50 text-xl font-bold text-indigo-400"
                >
                  ?
                </div>
                <button
                  v-if="faviconSource === 'upload'"
                  type="button"
                  :title="__('Remove')"
                  class="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                  @click="clearUploadedFavicon"
                >
                  <i class="fa fa-times text-xs"></i>
                </button>
              </div>
              <div class="min-w-0 space-y-3">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                  @click="openMediaLibraryModalFn"
                >
                  <i class="fa fa-images text-indigo-500"></i>
                  {{ __('Upload') }}
                </button>
                <div class="flex flex-wrap items-center gap-2">
                  <!-- <button
                    v-if="faviconSource === 'upload' && form.url"
                    type="button"
                    class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
                    @click="resetFaviconToAuto"
                  >
                    <i class="fa fa-globe mr-1"></i>{{ __('Re-fetch from site') }}
                  </button> -->
                </div>
                <p class="text-xs text-gray-400">
                  {{ __('Pick a custom icon from the media library.') }}
                  <span v-if="faviconSource === 'upload'" class="ml-1 rounded bg-green-100 px-1.5 py-0.5 text-green-600">{{ __('From Media Library') }}</span>
                </p>
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
                <label class="mb-1.5 block text-sm font-medium text-gray-700">
                  {{ __('Category') }} <span class="text-red-500">*</span>
                </label>
                <select-dropdown
                  :options="categories"
                  :model-value="form.category ? parseInt(form.category) : null"
                  :multiple="false"
                  label="Select category"
                  search-placeholder="Search..."
                  empty-text="No results"
                  style="min-width: 200px"
                  @update:model-value="(val) => form.category = val ? String(val) : ''"
                />
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

          <!-- Link check -->
          <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 class="mb-4 flex items-center gap-2 text-base font-semibold text-gray-800">
              <i class="fa fa-heartbeat text-sky-500"></i>{{ __('Link Check') }}
            </h3>

            <div class="flex items-center gap-3">
              <button
                type="button"
                class="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-50"
                :disabled="checking || !form.url"
                @click="checkLink"
              >
                <i class="fa fa-heartbeat mr-1"></i>{{ checking ? __('Checking...') : __('Check this link') }}
              </button>
              <span v-if="checking" class="text-sm text-sky-500">
                <i class="fa fa-spinner fa-spin mr-1"></i>{{ __('Checking') }} {{ form.url }}...
              </span>
              <span v-else-if="!form.url" class="text-xs text-gray-400">{{ __('Enter a URL first to check availability.') }}</span>
            </div>

            <div v-if="checkResult" class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div class="rounded-lg border p-3">
                <div class="text-xs text-gray-400">{{ __('Availability') }}</div>
                <div class="mt-1 flex items-center gap-2">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-semibold"
                    :class="checkResult.link_status === 'ok'
                      ? 'bg-emerald-100 text-emerald-600'
                      : checkResult.link_status === 'dead'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-400'"
                  >
                    <i
                      :class="checkResult.link_status === 'ok'
                        ? 'fa fa-check-circle'
                        : checkResult.link_status === 'dead'
                          ? 'fa fa-exclamation-circle'
                          : 'fa fa-minus-circle'"
                    ></i>
                    {{ checkResult.link_status === 'ok' ? __('OK') : checkResult.link_status === 'dead' ? __('Dead') : __('Unknown') }}
                  </span>
                </div>
              </div>
              <div class="rounded-lg border p-3">
                <div class="text-xs text-gray-400">{{ __('HTTP Code') }}</div>
                <div class="mt-1 text-sm font-semibold text-gray-800">
                  {{ checkResult.http_code ? 'HTTP ' + checkResult.http_code : '—' }}
                </div>
              </div>
              <div class="rounded-lg border p-3">
                <div class="text-xs text-gray-400">{{ __('Last Checked') }}</div>
                <div class="mt-1 text-sm font-semibold text-gray-800">
                  {{ checkResult.last_checked_at || '—' }}
                </div>
              </div>
              <div v-if="checkResult.message && checkResult.link_status !== 'ok'" class="rounded-lg border border-red-100 bg-red-50 p-3 sm:col-span-3">
                <div class="text-xs text-gray-400">{{ __('Reason') }}</div>
                <div class="mt-1 text-sm font-medium text-red-600">{{ checkResult.message }}</div>
              </div>
            </div>
            <p v-else-if="!checking" class="mt-3 text-xs text-gray-400">
              {{ __('Detection only marks the result — dead links stay visible and you handle them manually.') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Media library modal -->
    <ui-modal maxWidth="7xl" :show="openMediaLibraryModal" :disableHeader="true" @close="closeMediaLibraryModal">
      <template #content>
        <media-library :project="project" :selected="selectedFiles" @insert="insertFiles" :disableDelete="false" :media_type="1"></media-library>
      </template>
      <template #footer>
        <ui-button color="gray-200" hover="gray-300" @click="closeMediaLibraryModal">
          <span class="text-gray-800">{{ __('Cancel') }}</span>
        </ui-button>
      </template>
    </ui-modal>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { useAdminStore } from "@/admin/store";
import { __ } from "@/admin/translations/engine";
import Swal from "sweetalert2";
import { useToast } from "vue-toastification";
import ProjectHeader from "@/admin/components/ProjectHeader.vue";
import CollectionSidebar from "@/admin/components/CollectionSidebar.vue";
import SelectDropdown from "@/components/SelectDropdown";
import MediaLibrary from "@/admin/components/MediaLibrary.vue";
import UiButton from "@/components/Button.vue";
import UiModal from "@/components/Modal.vue";

export default {
  name: "NavigationLinksEdit",
  components: { ProjectHeader, CollectionSidebar, SelectDropdown, MediaLibrary, UiButton, UiModal },
  setup() {
    const toast = useToast();
    const route = useRoute();
    const router = useRouter();
    const store = useAdminStore();

    const pid = route.params.project_id;
    const cid = route.params.col_id;
    const contentId = route.params.content_id;

    const project = ref(store.currentProject || {});
    const collection = ref(store.currentCollection || { name: "Links", fields: [] });
    const categories = ref([]);
    const tags = ref([]);
    const selectedTags = ref([]);
    const faviconPreview = ref("");
    const faviconSource = ref(""); // "auto" | "upload" | ""
    const uploadingFavicon = ref(false);
    const faviconInput = ref(null);
    const saving = ref(false);
    const loaded = ref(false);
    const checking = ref(false);
    const checkResult = ref(null);

    const form = reactive({
      title: "",
      url: "",
      favicon: "",
      description: "",
      category: "",
      weight: "",
      featured: false,
      private: false,
      click_behavior: "detail",
    });

    const canManage = computed(() => {
      const p = store.currentProject || project.value;
      return p && !(p.is_readonly || !p.status) && ["owner", "admin"].includes(p.my_role);
    });

    async function loadOptions() {
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
          const nameMeta = (row.meta || []).find((m) => ["name","title","tag"].includes(m.field_name));
          return { id: row.id, name: nameMeta ? nameMeta.value : `#${row.id}` };
        });
      }
      if (tagsTarget) {
        const { data } = await axios.get(`projects/${pid}/collections/${tagsTarget}/entries`, {
          params: { each: 200, getItems: "all" },
        });
        tags.value = (data.content.data || []).map((row) => {
          const nameMeta = (row.meta || []).find((m) => ["name","title","tag"].includes(m.field_name));
          return { id: row.id, name: nameMeta ? nameMeta.value : `#${row.id}` };
        });
      }
    }

    function metaValue(name) {
      const item = (entryMeta.value || []).find((m) => m.field_name === name);
      return item ? item.value : null;
    }

    const entryMeta = ref([]);

    async function loadEntry() {
      const { data } = await axios.get(`projects/${pid}/collections/${cid}/${contentId}/edit`);
      if (!project.value?.id) project.value = data.project;
      if (!collection.value?.id) collection.value = data.collection || { name: "Links", fields: [] };
      entryMeta.value = (data.content && data.content.meta) || [];
      await loadOptions();

      form.title = metaValue("title") || "";
      form.url = metaValue("url") || "";
      form.description = metaValue("description") || "";
      form.category = metaValue("category") || "";
      const tagsValue = metaValue("tags") || "";
      selectedTags.value = tagsValue ? tagsValue.split(",").filter(Boolean) : [];
      const weightValue = metaValue("weight");
      form.weight = weightValue === null || weightValue === undefined || weightValue === "" ? "" : Number(weightValue);
      const featuredValue = metaValue("featured");
      form.featured = featuredValue === "1" || featuredValue === 1 || featuredValue === true;
      const privateValue = metaValue("private");
      form.private = privateValue === "1" || privateValue === 1 || privateValue === true;
      const behavior = metaValue("click_behavior");
      form.click_behavior = behavior || "detail";

      // Load existing favicon from DB
      const faviconValue = metaValue("favicon");
      if (faviconValue && /^\d+$/.test(faviconValue)) {
        form.favicon = faviconValue;
        faviconSource.value = "upload";
        try {
          const { data: mediaData } = await axios.get(`projects/${pid}/media/${faviconValue}`);
          if (mediaData && mediaData.full_url) {
            faviconPreview.value = mediaData.full_url_thumb || mediaData.full_url;
          }
        } catch (e) {
          console.error("load favicon media failed:", e);
        }
      } else {
        // No favicon in DB, auto-fetch from URL
        if (form.url) {
          await previewFavicon();
        }
      }

      const status = metaValue("link_status");
      const code = metaValue("http_code");
      const checkedAt = metaValue("last_checked_at");
      if (status) {
        checkResult.value = {
          link_status: status,
          http_code: code || null,
          last_checked_at: checkedAt || null,
          message: null,
        };
      }

      loaded.value = true;
    }

    async function checkLink() {
      if (!form.url || checking.value) return;
      checking.value = true;
      try {
        const { data } = await axios.post(`projects/${pid}/collections/${cid}/${contentId}/check-link`);
        checkResult.value = {
          link_status: data.link_status,
          http_code: data.http_code,
          last_checked_at: data.last_checked_at,
          message: data.message,
        };
        if (data.link_status === "ok") {
          toast.success(__("Link is reachable (") + (data.http_code || "OK") + ").");
        } else {
          toast.error(__("Link is dead — ") + (data.message || __("check failed")) + ".");
        }
      } catch (e) {
        toast.error(__("Check failed."));
      } finally {
        checking.value = false;
      }
    }

    async function previewFavicon() {
      if (!form.url) return;
      if (faviconSource.value === "upload") return;
      try {
        const { data } = await axios.post(`projects/${pid}/collections/${cid}/${contentId}/fetch-favicon`, {
          url: form.url,
        });
        if (data && data.favicon_url && !data.favicon_url.startsWith("data:")) {
          faviconPreview.value = data.favicon_url;
          faviconSource.value = "auto";
          if (data.media_id) {
            form.favicon = String(data.media_id);
          }
        } else {
          faviconPreview.value = "";
          faviconSource.value = "";
          form.favicon = "";
        }
      } catch (e) {
        faviconPreview.value = "";
        faviconSource.value = "";
        form.favicon = "";
      }
    }

    async function handleFaviconUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      uploadingFavicon.value = true;
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("project_id", Number(pid));
        const { data: mediaData } = await axios.post(`projects/${pid}/media`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const mediaId = mediaData.id || (mediaData.data && mediaData.data.id);
        if (mediaId) {
          form.favicon = String(mediaId);
          faviconPreview.value = mediaData.full_url_thumb || mediaData.full_url || URL.createObjectURL(file);
          faviconSource.value = "upload";
          toast.success(__("Icon uploaded!"));
        }
      } catch (e) {
        toast.error(__("Upload failed."));
      } finally {
        uploadingFavicon.value = false;
        if (faviconInput.value) faviconInput.value.value = "";
      }
    }

    function clearUploadedFavicon() {
      form.favicon = "";
      faviconPreview.value = "";
      faviconSource.value = "";
    }

    // === Media library integration ===
    const openMediaLibraryModal = ref(false);
    const selectedFiles = ref([]);

    function openMediaLibraryModalFn() {
      selectedFiles.value = form.favicon && /^\d+$/.test(form.favicon) ? [parseInt(form.favicon)] : [];
      openMediaLibraryModal.value = true;
    }

    function closeMediaLibraryModal() {
      openMediaLibraryModal.value = false;
    }

    async function insertFiles(files) {
      if (files && files.length) {
        try {
          const { data: fileData } = await axios.post(`projects/${pid}/entries/get-selected-files`, { data: files });
          const file = fileData && fileData[0];
          if (file) {
            form.favicon = String(file.id);
            faviconPreview.value = file.full_url_thumb || file.full_url;
            faviconSource.value = "upload";
          }
        } catch (e) {
          console.error("load selected media failed:", e);
          toast.error(__("Failed to load selected media."));
        }
      }
      closeMediaLibraryModal();
    }

    function resetFaviconToAuto() {
      form.favicon = "";
      faviconSource.value = "";
      faviconPreview.value = "";
      previewFavicon();
    }

    function buildData() {
      const data = {
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
      if (form.favicon && form.favicon !== "") {
        data.favicon = form.favicon;
      }
      return data;
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
      if (!form.category) {
        toast.error(__("Category is required."));
        return;
      }
      saving.value = true;
      try {
        await axios.post(`projects/${pid}/collections/${cid}/${contentId}`, {
          project_id: Number(pid),
          collection_id: Number(cid),
          locale: (project.value && project.value.default_locale) || "zh",
          published,
          data: buildData(),
        });
        toast.success(__("Link saved!"));
        router.push({
          name: "projects.collections.content.list",
          params: { project_id: pid, col_id: cid },
        });
      } catch (e) {
        const msg = e.response && e.response.data && e.response.data.message;
        toast.error(msg || __("Failed to save link."));
      } finally {
        saving.value = false;
      }
    }

    async function moveToTrash() {
      try {
        const result = await Swal.fire({
          title: __("Move to trash?"),
          text: `"${form.title}"`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: __("Move"),
          cancelButtonText: __("Cancel"),
        });
        if (!result.isConfirmed) return;
        await axios.delete(`projects/${pid}/collections/${cid}/${contentId}/move-to-trash`);
        toast.success(__("Moved to trash."));
        router.push({
          name: "projects.collections.content.list",
          params: { project_id: pid, col_id: cid },
        });
      } catch (e) {
        toast.error(__("Failed to move to trash."));
      }
    }

    onMounted(async () => {
      try {
        await loadEntry();
      } catch (e) {
        console.error("load edit form failed:", e);
        toast.error(__("Failed to load link."));
      }
    });

    return {
      pid, cid, contentId, project, collection,
      categories, tags, selectedTags, faviconPreview, faviconSource, uploadingFavicon, faviconInput,
      saving, loaded, form,
      canManage, previewFavicon, handleFaviconUpload, clearUploadedFavicon, save, moveToTrash,
      openMediaLibraryModal, selectedFiles, openMediaLibraryModalFn, closeMediaLibraryModal, insertFiles, resetFaviconToAuto,
      checking, checkResult, checkLink,
    };
  },
};
</script>
