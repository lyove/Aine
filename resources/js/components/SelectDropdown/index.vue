<template>
  <div class="relative inline-block" ref="wrap">
    <!-- Trigger -->
    <button
      type="button"
      class="group flex w-full items-center gap-1.5 rounded-full border transition-colors"
      :class="[
        sizeClass,
        'border-gray-300 bg-white text-gray-600 hover:border-indigo-500 hover:bg-gray-100',
        { 'border-indigo-500': open },
        { 'cursor-not-allowed opacity-60 hover:border-gray-300 hover:bg-white': disabled },
      ]"
      :disabled="disabled"
      @click.stop="toggle"
      @keydown="onTriggerKeydown"
    >
      <i v-if="icon" :class="icon + ' mr-1'"></i>

      <!-- multi + tagLimit: show selected tags with per-tag remove -->
      <span v-if="showTags" class="flex min-w-0 flex-1 flex-wrap items-center gap-1">
        <span
          v-for="(opt, i) in visibleTags"
          :key="i"
          class="flex items-center gap-1 rounded-full bg-indigo-50 px-1.5 py-0.5 text-xs text-indigo-600"
        >
          <span class="truncate max-w-[8rem]">{{ opt[labelKey] }}</span>
          <i class="fa fa-times cursor-pointer" @click.stop="removeTag(opt)"></i>
        </span>
        <span v-if="hiddenTagCount > 0" class="rounded-full bg-indigo-50 px-1.5 py-0.5 text-xs text-indigo-600">
          +{{ hiddenTagCount }}
        </span>
      </span>

      <span v-else class="min-w-0 flex-1 truncate text-left">{{ triggerLabel }}</span>

      <!-- clear ×: only when clearable, has selection, dropdown closed, and hover -->
      <i
        v-if="clearable && hasSelection && !open"
        class="fa fa-times mr-1 text-xs opacity-0 transition-opacity group-hover:opacity-80"
        @click.stop.prevent="clearAll"
      ></i>
      <i
        class="fa text-xs transition-transform"
        :class="open ? 'fa-chevron-up' : 'fa-chevron-down'"
      ></i>
    </button>

    <!-- Dropdown: teleported to body so `fixed` stays viewport-relative even
         inside modals/drawers whose ancestors use transform (e.g. Tailwind .transform) -->
    <teleport to="body">
      <transition name="dropdown">
        <div
          v-if="open"
          ref="dropdown"
          class="fixed z-[100] flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          :style="menuStyle"
        >
        <!-- Footer when opening up (multi only: top) -->
        <div
          v-if="multiple && openUp"
          class="flex items-center justify-between border-b border-gray-100 px-3 py-2 text-xs text-gray-500"
        >
          <span>{{ selectedCount }} {{ selectedText }}</span>
          <button
            v-if="clearable && hasSelection"
            type="button"
            class="font-medium text-red-500 hover:text-red-600"
            @click="clearAll"
          >{{ clearText }}</button>
        </div>

        <!-- Options (scrollable, opening up) -->
        <div
          v-show="openUp"
          class="select-scroll space-y-1 overflow-y-auto overscroll-contain px-3 py-2"
          :style="{ maxHeight: maxHeight + 'px' }"
        >
          <template v-for="(opt, idx) in filteredOptions" :key="opt[valueKey]">
            <div
              class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50"
              :class="[highlightIndex === idx ? 'bg-indigo-50' : '', isOptionDisabled(opt) ? 'pointer-events-none opacity-50' : '']"
              @click="choose(opt[valueKey])"
              @mouseenter="highlightIndex = idx"
            >
              <input
                v-if="multiple"
                type="checkbox"
                class="h-4 w-4 shrink-0 accent-indigo-500"
                :checked="isChecked(opt[valueKey])"
                :disabled="isOptionDisabled(opt)"
                @click.stop="choose(opt[valueKey])"
              />
              <span
                v-else
                class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
                :class="isChecked(opt[valueKey]) ? 'border-indigo-500' : 'border-gray-300'"
              >
                <span
                  v-if="isChecked(opt[valueKey])"
                  class="h-2 w-2 rounded-full bg-indigo-500"
                ></span>
              </span>
              <span
                v-if="opt[colorKey]"
                class="inline-block h-3 w-3 shrink-0 rounded-full"
                :style="{ background: opt[colorKey] }"
              ></span>
              <span class="truncate text-gray-800">{{ opt[labelKey] }}</span>
            </div>
          </template>
          <div
            v-if="!filteredOptions.length && !(allowCreate && search.trim())"
            class="py-6 text-center text-sm text-gray-400"
          >{{ emptyText }}</div>
          <div
            v-if="allowCreate && search.trim() && !filteredOptions.length"
            class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50"
            @click="createFromSearch"
          >
            <i class="fa fa-plus text-xs"></i>
            <span>{{ createText.replace('{value}', search.trim()) }}</span>
          </div>
        </div>

        <!-- Search -->
        <div v-if="searchable || allowCreate" class="p-3" :class="openUp ? 'mt-2 pt-0 pb-3' : 'pb-0'">
          <div class="relative">
            <input
              v-model="search"
              type="text"
              class="w-full rounded-lg border border-gray-300 py-1.5 px-3 text-sm focus:border-indigo-400 focus:outline-none"
              :placeholder="searchPlaceholder"
              ref="searchInput"
            />
          </div>
        </div>

        <!-- Options (scrollable, default below search) -->
        <div
          v-show="!openUp"
          class="select-scroll mt-2 space-y-1 overflow-y-auto overscroll-contain px-3 py-2"
          :style="{ maxHeight: maxHeight + 'px' }"
        >
          <template v-for="(opt, idx) in filteredOptions" :key="opt[valueKey]">
            <div
              class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50"
              :class="[highlightIndex === idx ? 'bg-indigo-50' : '', isOptionDisabled(opt) ? 'pointer-events-none opacity-50' : '']"
              @click="choose(opt[valueKey])"
              @mouseenter="highlightIndex = idx"
            >
              <input
                v-if="multiple"
                type="checkbox"
                class="h-4 w-4 shrink-0 accent-indigo-500"
                :checked="isChecked(opt[valueKey])"
                :disabled="isOptionDisabled(opt)"
                @click.stop="choose(opt[valueKey])"
              />
              <span
                v-else
                class="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
                :class="isChecked(opt[valueKey]) ? 'border-indigo-500' : 'border-gray-300'"
              >
                <span
                  v-if="isChecked(opt[valueKey])"
                  class="h-2 w-2 rounded-full bg-indigo-500"
                ></span>
              </span>
              <span
                v-if="opt[colorKey]"
                class="inline-block h-3 w-3 shrink-0 rounded-full"
                :style="{ background: opt[colorKey] }"
              ></span>
              <span class="truncate text-gray-800">{{ opt[labelKey] }}</span>
            </div>
          </template>
          <div
            v-if="!filteredOptions.length && !(allowCreate && search.trim())"
            class="py-6 text-center text-sm text-gray-400"
          >{{ emptyText }}</div>
          <div
            v-if="allowCreate && search.trim() && !filteredOptions.length"
            class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50"
            @click="createFromSearch"
          >
            <i class="fa fa-plus text-xs"></i>
            <span>{{ createText.replace('{value}', search.trim()) }}</span>
          </div>
        </div>

        <!-- Footer (multi only: bottom when opening down) -->
        <div
          v-if="multiple && !openUp"
          class="mt-2 flex items-center justify-between border-t border-gray-100 px-3 py-2 text-xs text-gray-500"
        >
          <span>{{ selectedCount }} {{ selectedText }}</span>
          <button
            v-if="clearable && hasSelection"
            type="button"
            class="font-medium text-red-500 hover:text-red-600"
            @click="clearAll"
          >{{ clearText }}</button>
        </div>
      </div>
      </transition>
    </teleport>
  </div>
</template>

<script>
import selectDropdown from "./select.js";

export default selectDropdown;
</script>

<style scoped>
.select-scroll::-webkit-scrollbar {
  width: 6px;
}
.select-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.select-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
.select-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
}
</style>
