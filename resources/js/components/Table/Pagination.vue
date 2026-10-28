<template>
  <div class="flex flex-wrap items-center justify-end gap-3 mt-4">
    <!-- Page navigation -->
    <nav class="flex items-center gap-1">
      <!-- Previous button -->
      <button
        type="button"
        class="flex items-center justify-center w-8 h-8 text-sm border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="!prevIsPossible"
        @click.prevent.stop="previousPage"
      >
        <i class="fa fa-chevron-left text-xs"></i>
      </button>

      <!-- Page numbers -->
      <template v-for="page in visiblePages" :key="page">
        <span v-if="page === '...'" class="px-1.5 text-sm text-gray-400">&hellip;</span>
        <button
          v-else
          type="button"
          class="min-w-[32px] h-8 text-sm border rounded-lg"
          :class="page === currentPage
            ? 'border-indigo-500 bg-indigo-500 text-white hover:bg-indigo-600'
            : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
          @click.prevent="changePage(page)"
        >
          {{ page }}
        </button>
      </template>

      <!-- Next button -->
      <button
        type="button"
        class="flex items-center justify-center w-8 h-8 text-sm border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="!nextIsPossible"
        @click.prevent.stop="nextPage"
      >
        <i class="fa fa-chevron-right text-xs"></i>
      </button>
    </nav>

    <!-- Per page dropdown -->
    <select
      v-if="perPageDropdownEnabled"
      autocomplete="off"
      class="text-sm border border-gray-300 rounded-lg pl-2 pr-7 py-1 text-gray-600 focus:outline-none focus:border-indigo-400 appearance-none bg-no-repeat"
      style="background-position: right 0.5rem center; background-size: 12px; background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 fill=%22none%22 stroke=%22%239ca3af%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 viewBox=%220 0 24 24%22%3E%3Cpath d=%22M6 9l6 6 6-6%22/%3E%3C/svg%3E');"
      v-model="currentPerPage"
      @change="perPageChanged"
    >
      <option v-for="(option, idx) in rowsPerPageOptions" :key="idx" :value="option">
        {{ option }} {{ ofText }} {{ pageText }}
      </option>
      <option v-if="paginateDropdownAllowAll" :value="total">{{ allText }}</option>
    </select>

    <!-- Jump to page -->
    <span class="flex items-center gap-1 text-sm text-gray-500">
      {{ jumpToText }}
      <input
        v-model="jumpPageInput"
        type="text"
        class="w-12 h-8 rounded-lg border border-gray-300 text-center text-sm focus:outline-none focus:border-indigo-400"
        :placeholder="String(currentPage)"
        @keyup.enter="goToJumpPage"
      />
      {{ pageText }}
    </span>
  </div>
</template>

<script>
import { PAGINATION_MODES, DEFAULT_ROWS_PER_PAGE_DROPDOWN } from './utils/constants';

export default {
  name: 'Pagination',

  props: {
    styleClass: { default: '' },
    total: { default: null },
    perPage: {},
    rtl: { default: false },
    perPageDropdownEnabled: { default: true },
    customRowsPerPageDropdown: { default: () => [] },
    paginateDropdownAllowAll: { default: true },
    mode: { default: PAGINATION_MODES.Records },
    nextText: { default: 'Next' },
    prevText: { default: 'Prev' },
    rowsPerPageText: { default: 'Rows per page' },
    ofText: { default: 'of' },
    pageText: { default: 'page' },
    allText: { default: 'All' },
    jumpToText: { default: 'Jump to' },
    infoFn: { default: null },
    // Number of page buttons to show on each side of current page
    pageRange: { default: 2, type: Number },
  },

  data() {
    return {
      id: this.getId(),
      pageInfoId: this.getPageInfoId(),
      currentPage: 1,
      prevPage: 0,
      currentPerPage: 10,
      rowsPerPageOptions: [],
      jumpPageInput: '',
    };
  },

  watch: {
    perPage: {
      handler(newValue, oldValue) {
        this.handlePerPage();
        this.perPageChanged(oldValue);
      },
      immediate: true,
    },
    customRowsPerPageDropdown: {
      handler() {
        this.handlePerPage();
      },
      deep: true,
    },
    total: {
      handler(newValue, oldValue) {
        if (this.rowsPerPageOptions.indexOf(this.currentPerPage) === -1) {
          this.currentPerPage = newValue;
        }
      },
    },
  },

  computed: {
    pagesCount() {
      const total = this.total || 0;
      if (total === 0 || this.currentPerPage <= 0) return 1;
      const quotient = Math.floor(total / this.currentPerPage);
      const remainder = total % this.currentPerPage;
      return remainder === 0 ? quotient : quotient + 1;
    },

    nextIsPossible() {
      return this.currentPage < this.pagesCount;
    },

    prevIsPossible() {
      return this.currentPage > 1;
    },

    // Calculate visible page numbers with ellipsis
    visiblePages() {
      const pages = [];
      const total = this.pagesCount;
      const current = this.currentPage;
      const range = this.pageRange;

      if (total <= 1) return pages;

      // Always show first page
      pages.push(1);

      // Calculate start and end of visible range
      let start = Math.max(2, current - range);
      let end = Math.min(total - 1, current + range);

      // Adjust range if near edges
      if (current - range <= 2) {
        end = Math.min(total - 1, range * 2 + 1);
      }
      if (current + range >= total - 1) {
        start = Math.max(2, total - range * 2 - 1);
      }

      // Add ellipsis before range
      if (start > 2) {
        pages.push('...');
      }

      // Add pages in range
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis after range
      if (end < total - 1) {
        pages.push('...');
      }

      // Always show last page (if more than 1 page)
      if (total > 1) {
        pages.push(total);
      }

      return pages;
    },

    // Page info computed properties (merged from PaginationPageInfo)
    firstRecordOnPage() {
      return ((this.currentPage - 1) * this.currentPerPage) + 1;
    },

    lastRecordOnPage() {
      return Math.min(this.total || 0, this.currentPage * this.currentPerPage);
    },

    recordInfo() {
      let first = this.firstRecordOnPage;
      const last = this.lastRecordOnPage;
      if (last === 0) {
        first = 0;
      }
      return `${first} - ${last} ${this.ofText} ${this.total || 0}`;
    },

    pageInfoText() {
      return `${this.ofText} ${this.pagesCount}`;
    },

    pageInfoParams() {
      let first = this.firstRecordOnPage;
      const last = this.lastRecordOnPage;
      if (last === 0) {
        first = 0;
      }
      return {
        firstRecordOnPage: first,
        lastRecordOnPage: last,
        totalRecords: this.total || 0,
        currentPage: this.currentPage,
        totalPages: this.pagesCount,
      };
    },
  },

  methods: {
    getId() {
      return `pagination-select-${Math.floor(Math.random() * Date.now())}`;
    },

    getPageInfoId() {
      return `page-input-${Math.floor(Math.random() * Date.now())}`;
    },

    changePage(pageNumber, emit = true) {
      const total = this.total || 0;
      if (pageNumber > 0 && pageNumber <= this.pagesCount) {
        this.prevPage = this.currentPage;
        this.currentPage = pageNumber;
        this.pageChanged(emit);
      }
    },

    changePageFromInput(event) {
      const value = parseInt(event.target.value, 10);

      if (Number.isNaN(value) || value > this.pagesCount || value < 1) {
        event.target.value = this.currentPage;
        return false;
      }

      event.target.value = value;
      this.changePage(value);
    },

    goToJumpPage() {
      const value = parseInt(this.jumpPageInput, 10);
      if (Number.isNaN(value) || value > this.pagesCount || value < 1) {
        this.jumpPageInput = '';
        return;
      }
      this.jumpPageInput = '';
      this.changePage(value);
    },

    nextPage() {
      if (this.nextIsPossible) {
        this.prevPage = this.currentPage;
        ++this.currentPage;
        this.pageChanged();
      }
    },

    previousPage() {
      if (this.prevIsPossible) {
        this.prevPage = this.currentPage;
        --this.currentPage;
        this.pageChanged();
      }
    },

    pageChanged(emit = true) {
      const payload = {
        currentPage: this.currentPage,
        prevPage: this.prevPage,
      };
      if (!emit) payload.noEmit = true;
      this.$emit('page-changed', payload);
    },

    perPageChanged(oldValue) {
      if (oldValue) {
        this.$emit('per-page-changed', { currentPerPage: this.currentPerPage });
      }
      this.changePage(1, false);
    },

    handlePerPage() {
      if (
        this.customRowsPerPageDropdown !== null &&
        Array.isArray(this.customRowsPerPageDropdown) &&
        this.customRowsPerPageDropdown.length !== 0
      ) {
        this.rowsPerPageOptions = JSON.parse(JSON.stringify(this.customRowsPerPageDropdown));
      } else {
        this.rowsPerPageOptions = JSON.parse(JSON.stringify(DEFAULT_ROWS_PER_PAGE_DROPDOWN));
      }

      if (this.perPage) {
        this.currentPerPage = this.perPage;
        let found = false;
        for (let i = 0; i < this.rowsPerPageOptions.length; i++) {
          if (this.rowsPerPageOptions[i] === this.perPage) {
            found = true;
          }
        }
        if (!found && this.perPage !== -1) {
          this.rowsPerPageOptions.unshift(this.perPage);
        }
      } else {
        this.currentPerPage = 10;
      }
    },
  },
};
</script>
