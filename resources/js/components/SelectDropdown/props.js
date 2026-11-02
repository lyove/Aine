// SelectDropdown props definition
// Split from SelectDropdown into its own file for easier maintenance and reuse
export default {
  // true: multi-select (v-model = array of values); false: single-select (v-model = single value)
  multiple: {
    type: Boolean,
    default: true,
  },
  // v-model: array of values when multiple, single value otherwise
  modelValue: {
    type: [Array, String, Number],
    default: () => [],
  },
  // options: array of objects ({ id, name, color? }) — string/number arrays are converted automatically
  options: {
    type: Array,
    default: () => [],
  },
  // trigger button text when nothing is selected (legacy, takes precedence over placeholder)
  label: {
    type: String,
    default: "",
  },
  // same as label, kept for mainstream component semantics
  placeholder: {
    type: String,
    default: "Please select",
  },
  // font-awesome icon class on the trigger, e.g. "fa fa-filter"
  icon: {
    type: String,
    default: "",
  },
  // field names of the option objects
  valueKey: {
    type: String,
    default: "id",
  },
  labelKey: {
    type: String,
    default: "name",
  },
  colorKey: {
    type: String,
    default: "color",
  },
  searchPlaceholder: {
    type: String,
    default: "Search...",
  },
  selectedText: {
    type: String,
    default: "selected",
  },
  clearText: {
    type: String,
    default: "Clear filter",
  },
  emptyText: {
    type: String,
    default: "No options found.",
  },
  createText: {
    type: String,
    default: "Create '{value}'",
  },
  menuWidth: {
    type: Number,
    default: 256,
  },
  maxHeight: {
    type: Number,
    default: 256,
  },
  // disabled state: trigger and dropdown both inert
  disabled: {
    type: Boolean,
    default: false,
  },
  // show / hide the clear button
  clearable: {
    type: Boolean,
    default: true,
  },
  // show / hide the search box
  searchable: {
    type: Boolean,
    default: true,
  },
  // sm | md | lg
  size: {
    type: String,
    default: "md",
    validator: (v) => ["sm", "md", "lg"].includes(v),
  },
  // max selectable items in multi mode; 0 = unlimited
  multipleLimit: {
    type: Number,
    default: 0,
  },
  // Max number of selected tags shown on the trigger in multi mode; 0 = unlimited (show all tags by default), excess is collapsed into "+N"
  tagLimit: {
    type: Number,
    default: 0,
  },
  // allow creating a new option from the search input
  allowCreate: {
    type: Boolean,
    default: false,
  },
  // custom filter: (option, queryLowercase) => boolean; default filters by label
  filterOption: {
    type: Function,
    default: null,
  },
};
