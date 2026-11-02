/* SelectDropdown component logic (Options API) */
import props from "./props.js";
import { computePosition } from "./position.js";

let __uid = 0;

export default {
  name: "SelectDropdown",
  props,
  emits: ["update:modelValue", "change", "visible-change", "clear", "remove", "create"],
  data() {
    return {
      uid: ++__uid,
      open: false,
      openUp: false,
      search: "",
      highlightIndex: -1,
      menuStyle: { left: "0px", top: "0px", width: "0px" },
    };
  },
  computed: {
    selectedCount() {
      return Array.isArray(this.modelValue)
        ? this.modelValue.length
        : (this.modelValue != null && this.modelValue !== "" ? 1 : 0);
    },
    hasSelection() {
      return this.selectedCount > 0;
    },
    // Multi-mode model value, always an array.
    // A plain string/number (single value from legacy callers) is treated as a one-element array.
    modelArr() {
      if (Array.isArray(this.modelValue)) return this.modelValue;
      if (this.modelValue != null && this.modelValue !== "") return [this.modelValue];
      return [];
    },
    showTags() {
      // Show tags when multi-select and something is selected (default); with tagLimit > 0 only the first N are shown
      return this.multiple && this.hasSelection;
    },
    sizeClass() {
      return (
        {
          sm: "px-2.5 py-0.5 text-xs",
          md: "px-3 py-1 text-sm",
          lg: "px-4 py-1.5 text-base",
        }[this.size] || "px-3 py-1 text-sm"
      );
    },
    // convert a plain string/number array into [{ [valueKey]: v, [labelKey]: v }]
    normalizedOptions() {
      const opts = this.options || [];
      if (!opts.length) return [];
      const first = opts[0];
      if (typeof first === "string" || typeof first === "number") {
        return opts.map((v) => ({ [this.valueKey]: v, [this.labelKey]: v }));
      }
      return opts;
    },
    filteredOptions() {
      const q = (this.search || "").trim().toLowerCase();
      const list = this.normalizedOptions;
      if (!q) return list;
      if (typeof this.filterOption === "function") {
        return list.filter((o) => this.filterOption(o, q));
      }
      return list.filter((o) => String(o[this.labelKey] ?? "").toLowerCase().includes(q));
    },
    triggerLabel() {
      if (!this.multiple && this.hasSelection) {
        const val = Array.isArray(this.modelValue) ? this.modelValue[0] : this.modelValue;
        const opt = this.normalizedOptions.find((o) => String(o[this.valueKey]) === String(val));
        if (opt) return opt[this.labelKey];
      }
      return this.label || this.placeholder;
    },
    multiSelectedOptions() {
      if (!this.multiple) return [];
      const arr = this.modelArr;
      return arr
        .map((v) => this.normalizedOptions.find((o) => String(o[this.valueKey]) === String(v)))
        .filter(Boolean);
    },
    visibleTags() {
      return this.tagLimit > 0 ? this.multiSelectedOptions.slice(0, this.tagLimit) : this.multiSelectedOptions;
    },
    hiddenTagCount() {
      return this.tagLimit > 0 ? Math.max(0, this.multiSelectedOptions.length - this.tagLimit) : 0;
    },
  },
  watch: {
    search() {
      if (this.open) {
        const len = this.filteredOptions.length;
        this.highlightIndex = len ? 0 : -1;
        this.$nextTick(() => this.updatePosition());
      }
    },
  },
  mounted() {
    document.addEventListener("click", this.onDocumentClick);
    window.addEventListener("resize", this.onViewportChange);
    window.addEventListener("scroll", this.onViewportChange, true);
    window.addEventListener("select-dropdown:opened", this.onOtherOpened);
    document.addEventListener("keydown", this.onGlobalKeydown);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.onDocumentClick);
    window.removeEventListener("resize", this.onViewportChange);
    window.removeEventListener("scroll", this.onViewportChange, true);
    window.removeEventListener("select-dropdown:opened", this.onOtherOpened);
    document.removeEventListener("keydown", this.onGlobalKeydown);
  },
  methods: {
    toggle() {
      if (this.disabled) return;
      this.open = !this.open;
      if (this.open) {
        this.search = "";
        this.highlightIndex = this.filteredOptions.length ? 0 : -1;
        this.updatePosition();
        this.$nextTick(() => this.$refs.searchInput && this.$refs.searchInput.focus());
        window.dispatchEvent(new CustomEvent("select-dropdown:opened", { detail: { source: this.uid } }));
      } else {
        this.highlightIndex = -1;
      }
      this.$emit("visible-change", this.open);
    },
    close() {
      if (!this.open) return;
      this.open = false;
      this.highlightIndex = -1;
      this.$emit("visible-change", false);
    },
    onTriggerKeydown(e) {
      if (this.disabled) return;
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        if (!this.open) this.toggle();
      }
    },
    onGlobalKeydown(e) {
      if (!this.open || this.disabled) return;
      const inWrap = this.$el && this.$el.contains(e.target);
      const inDropdown = this.$refs.dropdown && this.$refs.dropdown.contains(e.target);
      if (!inWrap && !inDropdown) return;
      if (e.key === "Escape") {
        e.preventDefault();
        this.close();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        this.moveHighlight(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.moveHighlight(-1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        this.createFromSearch();
      }
    },
    moveHighlight(dir) {
      const len = this.filteredOptions.length;
      if (!len) return;
      const cur = this.highlightIndex < 0 ? (dir > 0 ? -1 : 0) : this.highlightIndex;
      this.highlightIndex = (cur + dir + len) % len;
    },
    isOptionDisabled(opt) {
      if (this.disabled) return true;
      if (this.multiple && this.multipleLimit > 0) {
        const arr = this.modelArr;
        const alreadySelected = arr.some((x) => String(x) === String(opt[this.valueKey]));
        return arr.length >= this.multipleLimit && !alreadySelected;
      }
      return false;
    },
    isChecked(id) {
      if (this.multiple) {
        const arr = this.modelArr;
        return arr.some((x) => String(x) === String(id));
      }
      const val = Array.isArray(this.modelValue) ? this.modelValue[0] : this.modelValue;
      return String(val ?? "") === String(id ?? "");
    },
    choose(id) {
      if (this.disabled) return;
      if (this.multiple) {
        const arr = this.modelArr;
        if (this.isChecked(id)) {
          this.emitNext(arr.filter((x) => String(x) !== String(id)));
          this.$emit("remove", id);
        } else {
          if (this.multipleLimit > 0 && arr.length >= this.multipleLimit) return;
          this.emitNext([...arr, id]);
        }
      } else {
        // single: pick and close immediately
        this.emitNext(id);
        this.close();
      }
    },
    removeTag(opt) {
      if (this.disabled) return;
      const val = opt[this.valueKey];
      const arr = this.modelArr;
      this.emitNext(arr.filter((x) => String(x) !== String(val)));
      this.$emit("remove", val);
    },
    clearAll() {
      if (this.disabled) return;
      this.emitNext(this.multiple ? [] : null);
      this.$emit("clear");
    },
    createFromSearch() {
      if (this.disabled) return;
      const q = (this.search || "").trim();
      if (!q) return;
      if (this.allowCreate) {
        const exists = this.filteredOptions.some(
          (o) => String(o[this.labelKey]).toLowerCase() === q.toLowerCase()
        );
        if (!exists) {
          const created = { [this.valueKey]: q, [this.labelKey]: q };
          if (this.multiple) {
            const arr = this.modelArr;
            if (this.multipleLimit > 0 && arr.length >= this.multipleLimit) return;
            this.emitNext([...arr, q]);
          } else {
            this.emitNext(q);
            this.close();
          }
          this.$emit("create", created);
          this.search = "";
          return;
        }
      }
      // otherwise select the highlighted option
      if (this.highlightIndex >= 0 && this.filteredOptions[this.highlightIndex]) {
        this.choose(this.filteredOptions[this.highlightIndex][this.valueKey]);
      }
    },
    emitNext(next) {
      this.$emit("update:modelValue", next);
      this.$emit("change", next);
    },
    onDocumentClick(event) {
      const wrap = this.$refs.wrap;
      const dd = this.$refs.dropdown;
      if (wrap && !wrap.contains(event.target) && (!dd || !dd.contains(event.target))) this.close();
    },
    onViewportChange() {
      if (this.open) this.updatePosition();
    },
    onOtherOpened(e) {
      if (e.detail && e.detail.source !== this.uid) {
        this.close();
      }
    },
    updatePosition() {
      const wrap = this.$refs.wrap;
      if (!wrap) return;

      const { left, top, width, openUp, rect, margin, gap } = computePosition(wrap, {
        menuWidth: this.menuWidth,
        maxHeight: this.maxHeight,
        multiple: this.multiple,
      });

      this.openUp = openUp;
      this.menuStyle = {
        left: left + "px",
        top: top + "px",
        width: width + "px",
      };

      // After render, measure actual dropdown height and snap it to the button.
      requestAnimationFrame(() => {
        this.$nextTick(() => {
          const dd = this.$refs.dropdown;
          if (!dd) return;
          const realHeight = dd.offsetHeight;
          if (openUp) {
            this.menuStyle.top = Math.max(margin, rect.top - gap - realHeight) + "px";
          } else {
            this.menuStyle.top = (rect.bottom + gap) + "px";
          }
        });
      });
    },
  },
};
