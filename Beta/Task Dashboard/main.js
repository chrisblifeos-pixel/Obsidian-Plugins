"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key2 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key2) && key2 !== except)
        __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => TodoPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian5 = require("obsidian");

// TodoView.ts
var import_obsidian3 = require("obsidian");

// node_modules/esm-env/dev-fallback.js
var node_env = globalThis.process?.env?.NODE_ENV;
var dev_fallback_default = node_env && !node_env.toLowerCase().startsWith("prod");

// node_modules/svelte/src/internal/shared/utils.js
var is_array = Array.isArray;
var index_of = Array.prototype.indexOf;
var includes = Array.prototype.includes;
var array_from = Array.from;
var object_keys = Object.keys;
var define_property = Object.defineProperty;
var get_descriptor = Object.getOwnPropertyDescriptor;
var get_descriptors = Object.getOwnPropertyDescriptors;
var object_prototype = Object.prototype;
var array_prototype = Array.prototype;
var get_prototype_of = Object.getPrototypeOf;
var is_extensible = Object.isExtensible;
var noop = () => {
};
function run_all(arr) {
  for (var i = 0; i < arr.length; i++) {
    arr[i]();
  }
}
function deferred() {
  var resolve;
  var reject;
  var promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// node_modules/svelte/src/internal/client/constants.js
var DERIVED = 1 << 1;
var EFFECT = 1 << 2;
var RENDER_EFFECT = 1 << 3;
var MANAGED_EFFECT = 1 << 24;
var BLOCK_EFFECT = 1 << 4;
var BRANCH_EFFECT = 1 << 5;
var ROOT_EFFECT = 1 << 6;
var BOUNDARY_EFFECT = 1 << 7;
var CONNECTED = 1 << 9;
var CLEAN = 1 << 10;
var DIRTY = 1 << 11;
var MAYBE_DIRTY = 1 << 12;
var INERT = 1 << 13;
var DESTROYED = 1 << 14;
var REACTION_RAN = 1 << 15;
var EFFECT_TRANSPARENT = 1 << 16;
var EAGER_EFFECT = 1 << 17;
var HEAD_EFFECT = 1 << 18;
var EFFECT_PRESERVED = 1 << 19;
var USER_EFFECT = 1 << 20;
var EFFECT_OFFSCREEN = 1 << 25;
var WAS_MARKED = 1 << 16;
var REACTION_IS_UPDATING = 1 << 21;
var ASYNC = 1 << 22;
var ERROR_VALUE = 1 << 23;
var STATE_SYMBOL = Symbol("$state");
var LEGACY_PROPS = Symbol("legacy props");
var LOADING_ATTR_SYMBOL = Symbol("");
var PROXY_PATH_SYMBOL = Symbol("proxy path");
var STALE_REACTION = new class StaleReactionError extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
var IS_XHTML = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml")
);
var TEXT_NODE = 3;
var COMMENT_NODE = 8;

// node_modules/svelte/src/internal/shared/errors.js
function lifecycle_outside_component(name) {
  if (dev_fallback_default) {
    const error = new Error(`lifecycle_outside_component
\`${name}(...)\` can only be used during component initialisation
https://svelte.dev/e/lifecycle_outside_component`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/lifecycle_outside_component`);
  }
}

// node_modules/svelte/src/internal/client/errors.js
function async_derived_orphan() {
  if (dev_fallback_default) {
    const error = new Error(`async_derived_orphan
Cannot create a \`$derived(...)\` with an \`await\` expression outside of an effect tree
https://svelte.dev/e/async_derived_orphan`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/async_derived_orphan`);
  }
}
function bind_invalid_checkbox_value() {
  if (dev_fallback_default) {
    const error = new Error(`bind_invalid_checkbox_value
Using \`bind:value\` together with a checkbox input is not allowed. Use \`bind:checked\` instead
https://svelte.dev/e/bind_invalid_checkbox_value`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/bind_invalid_checkbox_value`);
  }
}
function derived_references_self() {
  if (dev_fallback_default) {
    const error = new Error(`derived_references_self
A derived value cannot reference itself recursively
https://svelte.dev/e/derived_references_self`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/derived_references_self`);
  }
}
function each_key_duplicate(a, b, value) {
  if (dev_fallback_default) {
    const error = new Error(`each_key_duplicate
${value ? `Keyed each block has duplicate key \`${value}\` at indexes ${a} and ${b}` : `Keyed each block has duplicate key at indexes ${a} and ${b}`}
https://svelte.dev/e/each_key_duplicate`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/each_key_duplicate`);
  }
}
function each_key_volatile(index2, a, b) {
  if (dev_fallback_default) {
    const error = new Error(`each_key_volatile
Keyed each block has key that is not idempotent \u2014 the key for item at index ${index2} was \`${a}\` but is now \`${b}\`. Keys must be the same each time for a given item
https://svelte.dev/e/each_key_volatile`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/each_key_volatile`);
  }
}
function effect_in_teardown(rune) {
  if (dev_fallback_default) {
    const error = new Error(`effect_in_teardown
\`${rune}\` cannot be used inside an effect cleanup function
https://svelte.dev/e/effect_in_teardown`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/effect_in_teardown`);
  }
}
function effect_in_unowned_derived() {
  if (dev_fallback_default) {
    const error = new Error(`effect_in_unowned_derived
Effect cannot be created inside a \`$derived\` value that was not itself created inside an effect
https://svelte.dev/e/effect_in_unowned_derived`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/effect_in_unowned_derived`);
  }
}
function effect_orphan(rune) {
  if (dev_fallback_default) {
    const error = new Error(`effect_orphan
\`${rune}\` can only be used inside an effect (e.g. during component initialisation)
https://svelte.dev/e/effect_orphan`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/effect_orphan`);
  }
}
function effect_update_depth_exceeded() {
  if (dev_fallback_default) {
    const error = new Error(`effect_update_depth_exceeded
Maximum update depth exceeded. This typically indicates that an effect reads and writes the same piece of state
https://svelte.dev/e/effect_update_depth_exceeded`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/effect_update_depth_exceeded`);
  }
}
function hydration_failed() {
  if (dev_fallback_default) {
    const error = new Error(`hydration_failed
Failed to hydrate the application
https://svelte.dev/e/hydration_failed`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/hydration_failed`);
  }
}
function props_invalid_value(key2) {
  if (dev_fallback_default) {
    const error = new Error(`props_invalid_value
Cannot do \`bind:${key2}={undefined}\` when \`${key2}\` has a fallback value
https://svelte.dev/e/props_invalid_value`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/props_invalid_value`);
  }
}
function rune_outside_svelte(rune) {
  if (dev_fallback_default) {
    const error = new Error(`rune_outside_svelte
The \`${rune}\` rune is only available inside \`.svelte\` and \`.svelte.js/ts\` files
https://svelte.dev/e/rune_outside_svelte`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/rune_outside_svelte`);
  }
}
function state_descriptors_fixed() {
  if (dev_fallback_default) {
    const error = new Error(`state_descriptors_fixed
Property descriptors defined on \`$state\` objects must contain \`value\` and always be \`enumerable\`, \`configurable\` and \`writable\`.
https://svelte.dev/e/state_descriptors_fixed`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/state_descriptors_fixed`);
  }
}
function state_prototype_fixed() {
  if (dev_fallback_default) {
    const error = new Error(`state_prototype_fixed
Cannot set prototype of \`$state\` object
https://svelte.dev/e/state_prototype_fixed`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/state_prototype_fixed`);
  }
}
function state_unsafe_mutation() {
  if (dev_fallback_default) {
    const error = new Error(`state_unsafe_mutation
Updating state inside \`$derived(...)\`, \`$inspect(...)\` or a template expression is forbidden. If the value should not be reactive, declare it without \`$state\`
https://svelte.dev/e/state_unsafe_mutation`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/state_unsafe_mutation`);
  }
}
function svelte_boundary_reset_onerror() {
  if (dev_fallback_default) {
    const error = new Error(`svelte_boundary_reset_onerror
A \`<svelte:boundary>\` \`reset\` function cannot be called while an error is still being handled
https://svelte.dev/e/svelte_boundary_reset_onerror`);
    error.name = "Svelte error";
    throw error;
  } else {
    throw new Error(`https://svelte.dev/e/svelte_boundary_reset_onerror`);
  }
}

// node_modules/svelte/src/constants.js
var EACH_ITEM_REACTIVE = 1;
var EACH_INDEX_REACTIVE = 1 << 1;
var EACH_IS_CONTROLLED = 1 << 2;
var EACH_IS_ANIMATED = 1 << 3;
var EACH_ITEM_IMMUTABLE = 1 << 4;
var PROPS_IS_IMMUTABLE = 1;
var PROPS_IS_RUNES = 1 << 1;
var PROPS_IS_UPDATED = 1 << 2;
var PROPS_IS_BINDABLE = 1 << 3;
var PROPS_IS_LAZY_INITIAL = 1 << 4;
var TRANSITION_OUT = 1 << 1;
var TRANSITION_GLOBAL = 1 << 2;
var TEMPLATE_FRAGMENT = 1;
var TEMPLATE_USE_IMPORT_NODE = 1 << 1;
var TEMPLATE_USE_SVG = 1 << 2;
var TEMPLATE_USE_MATHML = 1 << 3;
var HYDRATION_START = "[";
var HYDRATION_START_ELSE = "[!";
var HYDRATION_START_FAILED = "[?";
var HYDRATION_END = "]";
var HYDRATION_ERROR = {};
var ELEMENT_PRESERVE_ATTRIBUTE_CASE = 1 << 1;
var ELEMENT_IS_INPUT = 1 << 2;
var UNINITIALIZED = Symbol();
var FILENAME = Symbol("filename");
var HMR = Symbol("hmr");
var NAMESPACE_HTML = "http://www.w3.org/1999/xhtml";

// node_modules/svelte/src/internal/client/warnings.js
var bold = "font-weight: bold";
var normal = "font-weight: normal";
function await_waterfall(name, location) {
  if (dev_fallback_default) {
    console.warn(`%c[svelte] await_waterfall
%cAn async derived, \`${name}\` (${location}) was not read immediately after it resolved. This often indicates an unnecessary waterfall, which can slow down your app
https://svelte.dev/e/await_waterfall`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/await_waterfall`);
  }
}
function hydration_attribute_changed(attribute, html2, value) {
  if (dev_fallback_default) {
    console.warn(`%c[svelte] hydration_attribute_changed
%cThe \`${attribute}\` attribute on \`${html2}\` changed its value between server and client renders. The client value, \`${value}\`, will be ignored in favour of the server value
https://svelte.dev/e/hydration_attribute_changed`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/hydration_attribute_changed`);
  }
}
function hydration_mismatch(location) {
  if (dev_fallback_default) {
    console.warn(
      `%c[svelte] hydration_mismatch
%c${location ? `Hydration failed because the initial UI does not match what was rendered on the server. The error occurred near ${location}` : "Hydration failed because the initial UI does not match what was rendered on the server"}
https://svelte.dev/e/hydration_mismatch`,
      bold,
      normal
    );
  } else {
    console.warn(`https://svelte.dev/e/hydration_mismatch`);
  }
}
function lifecycle_double_unmount() {
  if (dev_fallback_default) {
    console.warn(`%c[svelte] lifecycle_double_unmount
%cTried to unmount a component that was not mounted
https://svelte.dev/e/lifecycle_double_unmount`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/lifecycle_double_unmount`);
  }
}
function select_multiple_invalid_value() {
  if (dev_fallback_default) {
    console.warn(`%c[svelte] select_multiple_invalid_value
%cThe \`value\` property of a \`<select multiple>\` element should be an array, but it received a non-array value. The selection will be kept as is.
https://svelte.dev/e/select_multiple_invalid_value`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/select_multiple_invalid_value`);
  }
}
function state_proxy_equality_mismatch(operator) {
  if (dev_fallback_default) {
    console.warn(`%c[svelte] state_proxy_equality_mismatch
%cReactive \`$state(...)\` proxies and the values they proxy have different identities. Because of this, comparisons with \`${operator}\` will produce unexpected results
https://svelte.dev/e/state_proxy_equality_mismatch`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/state_proxy_equality_mismatch`);
  }
}
function state_proxy_unmount() {
  if (dev_fallback_default) {
    console.warn(`%c[svelte] state_proxy_unmount
%cTried to unmount a state proxy, rather than a component
https://svelte.dev/e/state_proxy_unmount`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/state_proxy_unmount`);
  }
}
function svelte_boundary_reset_noop() {
  if (dev_fallback_default) {
    console.warn(`%c[svelte] svelte_boundary_reset_noop
%cA \`<svelte:boundary>\` \`reset\` function only resets the boundary the first time it is called
https://svelte.dev/e/svelte_boundary_reset_noop`, bold, normal);
  } else {
    console.warn(`https://svelte.dev/e/svelte_boundary_reset_noop`);
  }
}

// node_modules/svelte/src/internal/client/dom/hydration.js
var hydrating = false;
function set_hydrating(value) {
  hydrating = value;
}
var hydrate_node;
function set_hydrate_node(node) {
  if (node === null) {
    hydration_mismatch();
    throw HYDRATION_ERROR;
  }
  return hydrate_node = node;
}
function hydrate_next() {
  return set_hydrate_node(get_next_sibling(hydrate_node));
}
function reset(node) {
  if (!hydrating) return;
  if (get_next_sibling(hydrate_node) !== null) {
    hydration_mismatch();
    throw HYDRATION_ERROR;
  }
  hydrate_node = node;
}
function next(count = 1) {
  if (hydrating) {
    var i = count;
    var node = hydrate_node;
    while (i--) {
      node = /** @type {TemplateNode} */
      get_next_sibling(node);
    }
    hydrate_node = node;
  }
}
function skip_nodes(remove = true) {
  var depth = 0;
  var node = hydrate_node;
  while (true) {
    if (node.nodeType === COMMENT_NODE) {
      var data = (
        /** @type {Comment} */
        node.data
      );
      if (data === HYDRATION_END) {
        if (depth === 0) return node;
        depth -= 1;
      } else if (data === HYDRATION_START || data === HYDRATION_START_ELSE || // "[1", "[2", etc. for if blocks
      data[0] === "[" && !isNaN(Number(data.slice(1)))) {
        depth += 1;
      }
    }
    var next2 = (
      /** @type {TemplateNode} */
      get_next_sibling(node)
    );
    if (remove) node.remove();
    node = next2;
  }
}
function read_hydration_instruction(node) {
  if (!node || node.nodeType !== COMMENT_NODE) {
    hydration_mismatch();
    throw HYDRATION_ERROR;
  }
  return (
    /** @type {Comment} */
    node.data
  );
}

// node_modules/svelte/src/internal/client/reactivity/equality.js
function equals(value) {
  return value === this.v;
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || a !== null && typeof a === "object" || typeof a === "function";
}
function safe_equals(value) {
  return !safe_not_equal(value, this.v);
}

// node_modules/svelte/src/internal/flags/index.js
var async_mode_flag = false;
var legacy_mode_flag = false;
var tracing_mode_flag = false;

// node_modules/svelte/src/internal/client/dev/tracing.js
var tracing_expressions = null;
function tag(source2, label) {
  source2.label = label;
  tag_proxy(source2.v, label);
  return source2;
}
function tag_proxy(value, label) {
  value?.[PROXY_PATH_SYMBOL]?.(label);
  return value;
}

// node_modules/svelte/src/internal/shared/dev.js
function get_error(label) {
  const error = new Error();
  const stack2 = get_stack();
  if (stack2.length === 0) {
    return null;
  }
  stack2.unshift("\n");
  define_property(error, "stack", {
    value: stack2.join("\n")
  });
  define_property(error, "name", {
    value: label
  });
  return (
    /** @type {Error & { stack: string }} */
    error
  );
}
function get_stack() {
  const limit = Error.stackTraceLimit;
  Error.stackTraceLimit = Infinity;
  const stack2 = new Error().stack;
  Error.stackTraceLimit = limit;
  if (!stack2) return [];
  const lines = stack2.split("\n");
  const new_lines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const posixified = line.replaceAll("\\", "/");
    if (line.trim() === "Error") {
      continue;
    }
    if (line.includes("validate_each_keys")) {
      return [];
    }
    if (posixified.includes("svelte/src/internal") || posixified.includes("node_modules/.vite")) {
      continue;
    }
    new_lines.push(line);
  }
  return new_lines;
}

// node_modules/svelte/src/internal/client/context.js
var component_context = null;
function set_component_context(context) {
  component_context = context;
}
var dev_stack = null;
function set_dev_stack(stack2) {
  dev_stack = stack2;
}
var dev_current_component_function = null;
function set_dev_current_component_function(fn) {
  dev_current_component_function = fn;
}
function push(props, runes = false, fn) {
  component_context = {
    p: component_context,
    i: false,
    c: null,
    e: null,
    s: props,
    x: null,
    l: legacy_mode_flag && !runes ? { s: null, u: null, $: [] } : null
  };
  if (dev_fallback_default) {
    component_context.function = fn;
    dev_current_component_function = fn;
  }
}
function pop(component2) {
  var context = (
    /** @type {ComponentContext} */
    component_context
  );
  var effects = context.e;
  if (effects !== null) {
    context.e = null;
    for (var fn of effects) {
      create_user_effect(fn);
    }
  }
  if (component2 !== void 0) {
    context.x = component2;
  }
  context.i = true;
  component_context = context.p;
  if (dev_fallback_default) {
    dev_current_component_function = component_context?.function ?? null;
  }
  return component2 ?? /** @type {T} */
  {};
}
function is_runes() {
  return !legacy_mode_flag || component_context !== null && component_context.l === null;
}

// node_modules/svelte/src/internal/client/dom/task.js
var micro_tasks = [];
function run_micro_tasks() {
  var tasks2 = micro_tasks;
  micro_tasks = [];
  run_all(tasks2);
}
function queue_micro_task(fn) {
  if (micro_tasks.length === 0 && !is_flushing_sync) {
    var tasks2 = micro_tasks;
    queueMicrotask(() => {
      if (tasks2 === micro_tasks) run_micro_tasks();
    });
  }
  micro_tasks.push(fn);
}
function flush_tasks() {
  while (micro_tasks.length > 0) {
    run_micro_tasks();
  }
}

// node_modules/svelte/src/internal/client/error-handling.js
var adjustments = /* @__PURE__ */ new WeakMap();
function handle_error(error) {
  var effect2 = active_effect;
  if (effect2 === null) {
    active_reaction.f |= ERROR_VALUE;
    return error;
  }
  if (dev_fallback_default && error instanceof Error && !adjustments.has(error)) {
    adjustments.set(error, get_adjustments(error, effect2));
  }
  if ((effect2.f & REACTION_RAN) === 0 && (effect2.f & EFFECT) === 0) {
    if (dev_fallback_default && !effect2.parent && error instanceof Error) {
      apply_adjustments(error);
    }
    throw error;
  }
  invoke_error_boundary(error, effect2);
}
function invoke_error_boundary(error, effect2) {
  while (effect2 !== null) {
    if ((effect2.f & BOUNDARY_EFFECT) !== 0) {
      if ((effect2.f & REACTION_RAN) === 0) {
        throw error;
      }
      try {
        effect2.b.error(error);
        return;
      } catch (e) {
        error = e;
      }
    }
    effect2 = effect2.parent;
  }
  if (dev_fallback_default && error instanceof Error) {
    apply_adjustments(error);
  }
  throw error;
}
function get_adjustments(error, effect2) {
  const message_descriptor = get_descriptor(error, "message");
  if (message_descriptor && !message_descriptor.configurable) return;
  var indent = is_firefox ? "  " : "	";
  var component_stack = `
${indent}in ${effect2.fn?.name || "<unknown>"}`;
  var context = effect2.ctx;
  while (context !== null) {
    component_stack += `
${indent}in ${context.function?.[FILENAME].split("/").pop()}`;
    context = context.p;
  }
  return {
    message: error.message + `
${component_stack}
`,
    stack: error.stack?.split("\n").filter((line) => !line.includes("svelte/src/internal")).join("\n")
  };
}
function apply_adjustments(error) {
  const adjusted = adjustments.get(error);
  if (adjusted) {
    define_property(error, "message", {
      value: adjusted.message
    });
    define_property(error, "stack", {
      value: adjusted.stack
    });
  }
}

// node_modules/svelte/src/internal/client/reactivity/status.js
var STATUS_MASK = ~(DIRTY | MAYBE_DIRTY | CLEAN);
function set_signal_status(signal, status) {
  signal.f = signal.f & STATUS_MASK | status;
}
function update_derived_status(derived2) {
  if ((derived2.f & CONNECTED) !== 0 || derived2.deps === null) {
    set_signal_status(derived2, CLEAN);
  } else {
    set_signal_status(derived2, MAYBE_DIRTY);
  }
}

// node_modules/svelte/src/internal/client/reactivity/utils.js
function clear_marked(deps) {
  if (deps === null) return;
  for (const dep of deps) {
    if ((dep.f & DERIVED) === 0 || (dep.f & WAS_MARKED) === 0) {
      continue;
    }
    dep.f ^= WAS_MARKED;
    clear_marked(
      /** @type {Derived} */
      dep.deps
    );
  }
}
function defer_effect(effect2, dirty_effects, maybe_dirty_effects) {
  if ((effect2.f & DIRTY) !== 0) {
    dirty_effects.add(effect2);
  } else if ((effect2.f & MAYBE_DIRTY) !== 0) {
    maybe_dirty_effects.add(effect2);
  }
  clear_marked(effect2.deps);
  set_signal_status(effect2, CLEAN);
}

// node_modules/svelte/src/internal/client/reactivity/batch.js
var batches = /* @__PURE__ */ new Set();
var current_batch = null;
var previous_batch = null;
var batch_values = null;
var queued_root_effects = [];
var last_scheduled_effect = null;
var is_flushing = false;
var is_flushing_sync = false;
var Batch = class _Batch {
  /**
   * The current values of any sources that are updated in this batch
   * They keys of this map are identical to `this.#previous`
   * @type {Map<Source, any>}
   */
  current = /* @__PURE__ */ new Map();
  /**
   * The values of any sources that are updated in this batch _before_ those updates took place.
   * They keys of this map are identical to `this.#current`
   * @type {Map<Source, any>}
   */
  previous = /* @__PURE__ */ new Map();
  /**
   * When the batch is committed (and the DOM is updated), we need to remove old branches
   * and append new ones by calling the functions added inside (if/each/key/etc) blocks
   * @type {Set<() => void>}
   */
  #commit_callbacks = /* @__PURE__ */ new Set();
  /**
   * If a fork is discarded, we need to destroy any effects that are no longer needed
   * @type {Set<(batch: Batch) => void>}
   */
  #discard_callbacks = /* @__PURE__ */ new Set();
  /**
   * The number of async effects that are currently in flight
   */
  #pending = 0;
  /**
   * The number of async effects that are currently in flight, _not_ inside a pending boundary
   */
  #blocking_pending = 0;
  /**
   * A deferred that resolves when the batch is committed, used with `settled()`
   * TODO replace with Promise.withResolvers once supported widely enough
   * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
   */
  #deferred = null;
  /**
   * Deferred effects (which run after async work has completed) that are DIRTY
   * @type {Set<Effect>}
   */
  #dirty_effects = /* @__PURE__ */ new Set();
  /**
   * Deferred effects that are MAYBE_DIRTY
   * @type {Set<Effect>}
   */
  #maybe_dirty_effects = /* @__PURE__ */ new Set();
  /**
   * A map of branches that still exist, but will be destroyed when this batch
   * is committed — we skip over these during `process`.
   * The value contains child effects that were dirty/maybe_dirty before being reset,
   * so they can be rescheduled if the branch survives.
   * @type {Map<Effect, { d: Effect[], m: Effect[] }>}
   */
  #skipped_branches = /* @__PURE__ */ new Map();
  is_fork = false;
  #decrement_queued = false;
  #is_deferred() {
    return this.is_fork || this.#blocking_pending > 0;
  }
  /**
   * Add an effect to the #skipped_branches map and reset its children
   * @param {Effect} effect
   */
  skip_effect(effect2) {
    if (!this.#skipped_branches.has(effect2)) {
      this.#skipped_branches.set(effect2, { d: [], m: [] });
    }
  }
  /**
   * Remove an effect from the #skipped_branches map and reschedule
   * any tracked dirty/maybe_dirty child effects
   * @param {Effect} effect
   */
  unskip_effect(effect2) {
    var tracked = this.#skipped_branches.get(effect2);
    if (tracked) {
      this.#skipped_branches.delete(effect2);
      for (var e of tracked.d) {
        set_signal_status(e, DIRTY);
        schedule_effect(e);
      }
      for (e of tracked.m) {
        set_signal_status(e, MAYBE_DIRTY);
        schedule_effect(e);
      }
    }
  }
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(root_effects) {
    queued_root_effects = [];
    this.apply();
    var effects = [];
    var render_effects = [];
    for (const root6 of root_effects) {
      this.#traverse_effect_tree(root6, effects, render_effects);
    }
    if (this.#is_deferred()) {
      this.#defer_effects(render_effects);
      this.#defer_effects(effects);
      for (const [e, t] of this.#skipped_branches) {
        reset_branch(e, t);
      }
    } else {
      for (const fn of this.#commit_callbacks) fn();
      this.#commit_callbacks.clear();
      if (this.#pending === 0) {
        this.#commit();
      }
      previous_batch = this;
      current_batch = null;
      flush_queued_effects(render_effects);
      flush_queued_effects(effects);
      previous_batch = null;
      this.#deferred?.resolve();
    }
    batch_values = null;
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   * @param {Effect[]} effects
   * @param {Effect[]} render_effects
   */
  #traverse_effect_tree(root6, effects, render_effects) {
    root6.f ^= CLEAN;
    var effect2 = root6.first;
    while (effect2 !== null) {
      var flags2 = effect2.f;
      var is_branch = (flags2 & (BRANCH_EFFECT | ROOT_EFFECT)) !== 0;
      var is_skippable_branch = is_branch && (flags2 & CLEAN) !== 0;
      var skip = is_skippable_branch || (flags2 & INERT) !== 0 || this.#skipped_branches.has(effect2);
      if (!skip && effect2.fn !== null) {
        if (is_branch) {
          effect2.f ^= CLEAN;
        } else if ((flags2 & EFFECT) !== 0) {
          effects.push(effect2);
        } else if (async_mode_flag && (flags2 & (RENDER_EFFECT | MANAGED_EFFECT)) !== 0) {
          render_effects.push(effect2);
        } else if (is_dirty(effect2)) {
          if ((flags2 & BLOCK_EFFECT) !== 0) this.#maybe_dirty_effects.add(effect2);
          update_effect(effect2);
        }
        var child2 = effect2.first;
        if (child2 !== null) {
          effect2 = child2;
          continue;
        }
      }
      while (effect2 !== null) {
        var next2 = effect2.next;
        if (next2 !== null) {
          effect2 = next2;
          break;
        }
        effect2 = effect2.parent;
      }
    }
  }
  /**
   * @param {Effect[]} effects
   */
  #defer_effects(effects) {
    for (var i = 0; i < effects.length; i += 1) {
      defer_effect(effects[i], this.#dirty_effects, this.#maybe_dirty_effects);
    }
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(source2, value) {
    if (value !== UNINITIALIZED && !this.previous.has(source2)) {
      this.previous.set(source2, value);
    }
    if ((source2.f & ERROR_VALUE) === 0) {
      this.current.set(source2, source2.v);
      batch_values?.set(source2, source2.v);
    }
  }
  activate() {
    current_batch = this;
    this.apply();
  }
  deactivate() {
    if (current_batch !== this) return;
    current_batch = null;
    batch_values = null;
  }
  flush() {
    this.activate();
    if (queued_root_effects.length > 0) {
      flush_effects();
      if (current_batch !== null && current_batch !== this) {
        return;
      }
    } else if (this.#pending === 0) {
      this.process([]);
    }
    this.deactivate();
  }
  discard() {
    for (const fn of this.#discard_callbacks) fn(this);
    this.#discard_callbacks.clear();
  }
  #commit() {
    if (batches.size > 1) {
      this.previous.clear();
      var previous_batch_values = batch_values;
      var is_earlier = true;
      for (const batch of batches) {
        if (batch === this) {
          is_earlier = false;
          continue;
        }
        const sources = [];
        for (const [source2, value] of this.current) {
          if (batch.current.has(source2)) {
            if (is_earlier && value !== batch.current.get(source2)) {
              batch.current.set(source2, value);
            } else {
              continue;
            }
          }
          sources.push(source2);
        }
        if (sources.length === 0) {
          continue;
        }
        const others = [...batch.current.keys()].filter((s) => !this.current.has(s));
        if (others.length > 0) {
          var prev_queued_root_effects = queued_root_effects;
          queued_root_effects = [];
          const marked = /* @__PURE__ */ new Set();
          const checked = /* @__PURE__ */ new Map();
          for (const source2 of sources) {
            mark_effects(source2, others, marked, checked);
          }
          if (queued_root_effects.length > 0) {
            current_batch = batch;
            batch.apply();
            for (const root6 of queued_root_effects) {
              batch.#traverse_effect_tree(root6, [], []);
            }
            batch.deactivate();
          }
          queued_root_effects = prev_queued_root_effects;
        }
      }
      current_batch = null;
      batch_values = previous_batch_values;
    }
    batches.delete(this);
  }
  /**
   *
   * @param {boolean} blocking
   */
  increment(blocking) {
    this.#pending += 1;
    if (blocking) this.#blocking_pending += 1;
  }
  /**
   *
   * @param {boolean} blocking
   */
  decrement(blocking) {
    this.#pending -= 1;
    if (blocking) this.#blocking_pending -= 1;
    if (this.#decrement_queued) return;
    this.#decrement_queued = true;
    queue_micro_task(() => {
      this.#decrement_queued = false;
      if (!this.#is_deferred()) {
        this.revive();
      } else if (queued_root_effects.length > 0) {
        this.flush();
      }
    });
  }
  revive() {
    for (const e of this.#dirty_effects) {
      this.#maybe_dirty_effects.delete(e);
      set_signal_status(e, DIRTY);
      schedule_effect(e);
    }
    for (const e of this.#maybe_dirty_effects) {
      set_signal_status(e, MAYBE_DIRTY);
      schedule_effect(e);
    }
    this.flush();
  }
  /** @param {() => void} fn */
  oncommit(fn) {
    this.#commit_callbacks.add(fn);
  }
  /** @param {(batch: Batch) => void} fn */
  ondiscard(fn) {
    this.#discard_callbacks.add(fn);
  }
  settled() {
    return (this.#deferred ??= deferred()).promise;
  }
  static ensure() {
    if (current_batch === null) {
      const batch = current_batch = new _Batch();
      batches.add(current_batch);
      if (!is_flushing_sync) {
        queue_micro_task(() => {
          if (current_batch !== batch) {
            return;
          }
          batch.flush();
        });
      }
    }
    return current_batch;
  }
  apply() {
    if (!async_mode_flag || !this.is_fork && batches.size === 1) return;
    batch_values = new Map(this.current);
    for (const batch of batches) {
      if (batch === this) continue;
      for (const [source2, previous] of batch.previous) {
        if (!batch_values.has(source2)) {
          batch_values.set(source2, previous);
        }
      }
    }
  }
};
function flushSync(fn) {
  var was_flushing_sync = is_flushing_sync;
  is_flushing_sync = true;
  try {
    var result;
    if (fn) {
      if (current_batch !== null) {
        flush_effects();
      }
      result = fn();
    }
    while (true) {
      flush_tasks();
      if (queued_root_effects.length === 0) {
        current_batch?.flush();
        if (queued_root_effects.length === 0) {
          last_scheduled_effect = null;
          return (
            /** @type {T} */
            result
          );
        }
      }
      flush_effects();
    }
  } finally {
    is_flushing_sync = was_flushing_sync;
  }
}
function flush_effects() {
  is_flushing = true;
  var source_stacks = dev_fallback_default ? /* @__PURE__ */ new Set() : null;
  try {
    var flush_count = 0;
    while (queued_root_effects.length > 0) {
      var batch = Batch.ensure();
      if (flush_count++ > 1e3) {
        if (dev_fallback_default) {
          var updates = /* @__PURE__ */ new Map();
          for (const source2 of batch.current.keys()) {
            for (const [stack2, update2] of source2.updated ?? []) {
              var entry = updates.get(stack2);
              if (!entry) {
                entry = { error: update2.error, count: 0 };
                updates.set(stack2, entry);
              }
              entry.count += update2.count;
            }
          }
          for (const update2 of updates.values()) {
            if (update2.error) {
              console.error(update2.error);
            }
          }
        }
        infinite_loop_guard();
      }
      batch.process(queued_root_effects);
      old_values.clear();
      if (dev_fallback_default) {
        for (const source2 of batch.current.keys()) {
          source_stacks.add(source2);
        }
      }
    }
  } finally {
    queued_root_effects = [];
    is_flushing = false;
    last_scheduled_effect = null;
    if (dev_fallback_default) {
      for (
        const source2 of
        /** @type {Set<Source>} */
        source_stacks
      ) {
        source2.updated = null;
      }
    }
  }
}
function infinite_loop_guard() {
  try {
    effect_update_depth_exceeded();
  } catch (error) {
    if (dev_fallback_default) {
      define_property(error, "stack", { value: "" });
    }
    invoke_error_boundary(error, last_scheduled_effect);
  }
}
var eager_block_effects = null;
function flush_queued_effects(effects) {
  var length = effects.length;
  if (length === 0) return;
  var i = 0;
  while (i < length) {
    var effect2 = effects[i++];
    if ((effect2.f & (DESTROYED | INERT)) === 0 && is_dirty(effect2)) {
      eager_block_effects = /* @__PURE__ */ new Set();
      update_effect(effect2);
      if (effect2.deps === null && effect2.first === null && effect2.nodes === null && effect2.teardown === null && effect2.ac === null) {
        unlink_effect(effect2);
      }
      if (eager_block_effects?.size > 0) {
        old_values.clear();
        for (const e of eager_block_effects) {
          if ((e.f & (DESTROYED | INERT)) !== 0) continue;
          const ordered_effects = [e];
          let ancestor = e.parent;
          while (ancestor !== null) {
            if (eager_block_effects.has(ancestor)) {
              eager_block_effects.delete(ancestor);
              ordered_effects.push(ancestor);
            }
            ancestor = ancestor.parent;
          }
          for (let j = ordered_effects.length - 1; j >= 0; j--) {
            const e2 = ordered_effects[j];
            if ((e2.f & (DESTROYED | INERT)) !== 0) continue;
            update_effect(e2);
          }
        }
        eager_block_effects.clear();
      }
    }
  }
  eager_block_effects = null;
}
function mark_effects(value, sources, marked, checked) {
  if (marked.has(value)) return;
  marked.add(value);
  if (value.reactions !== null) {
    for (const reaction of value.reactions) {
      const flags2 = reaction.f;
      if ((flags2 & DERIVED) !== 0) {
        mark_effects(
          /** @type {Derived} */
          reaction,
          sources,
          marked,
          checked
        );
      } else if ((flags2 & (ASYNC | BLOCK_EFFECT)) !== 0 && (flags2 & DIRTY) === 0 && depends_on(reaction, sources, checked)) {
        set_signal_status(reaction, DIRTY);
        schedule_effect(
          /** @type {Effect} */
          reaction
        );
      }
    }
  }
}
function depends_on(reaction, sources, checked) {
  const depends = checked.get(reaction);
  if (depends !== void 0) return depends;
  if (reaction.deps !== null) {
    for (const dep of reaction.deps) {
      if (includes.call(sources, dep)) {
        return true;
      }
      if ((dep.f & DERIVED) !== 0 && depends_on(
        /** @type {Derived} */
        dep,
        sources,
        checked
      )) {
        checked.set(
          /** @type {Derived} */
          dep,
          true
        );
        return true;
      }
    }
  }
  checked.set(reaction, false);
  return false;
}
function schedule_effect(signal) {
  var effect2 = last_scheduled_effect = signal;
  var boundary2 = effect2.b;
  if (boundary2?.is_pending && (signal.f & (EFFECT | RENDER_EFFECT | MANAGED_EFFECT)) !== 0 && (signal.f & REACTION_RAN) === 0) {
    boundary2.defer_effect(signal);
    return;
  }
  while (effect2.parent !== null) {
    effect2 = effect2.parent;
    var flags2 = effect2.f;
    if (is_flushing && effect2 === active_effect && (flags2 & BLOCK_EFFECT) !== 0 && (flags2 & HEAD_EFFECT) === 0 && (flags2 & REACTION_RAN) !== 0) {
      return;
    }
    if ((flags2 & (ROOT_EFFECT | BRANCH_EFFECT)) !== 0) {
      if ((flags2 & CLEAN) === 0) {
        return;
      }
      effect2.f ^= CLEAN;
    }
  }
  queued_root_effects.push(effect2);
}
function reset_branch(effect2, tracked) {
  if ((effect2.f & BRANCH_EFFECT) !== 0 && (effect2.f & CLEAN) !== 0) {
    return;
  }
  if ((effect2.f & DIRTY) !== 0) {
    tracked.d.push(effect2);
  } else if ((effect2.f & MAYBE_DIRTY) !== 0) {
    tracked.m.push(effect2);
  }
  set_signal_status(effect2, CLEAN);
  var e = effect2.first;
  while (e !== null) {
    reset_branch(e, tracked);
    e = e.next;
  }
}

// node_modules/svelte/src/reactivity/create-subscriber.js
function createSubscriber(start) {
  let subscribers = 0;
  let version = source(0);
  let stop;
  if (dev_fallback_default) {
    tag(version, "createSubscriber version");
  }
  return () => {
    if (effect_tracking()) {
      get(version);
      render_effect(() => {
        if (subscribers === 0) {
          stop = untrack(() => start(() => increment(version)));
        }
        subscribers += 1;
        return () => {
          queue_micro_task(() => {
            subscribers -= 1;
            if (subscribers === 0) {
              stop?.();
              stop = void 0;
              increment(version);
            }
          });
        };
      });
    }
  };
}

// node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var flags = EFFECT_TRANSPARENT | EFFECT_PRESERVED;
function boundary(node, props, children, transform_error) {
  new Boundary(node, props, children, transform_error);
}
var Boundary = class {
  /** @type {Boundary | null} */
  parent;
  is_pending = false;
  /**
   * API-level transformError transform function. Transforms errors before they reach the `failed` snippet.
   * Inherited from parent boundary, or defaults to identity.
   * @type {(error: unknown) => unknown}
   */
  transform_error;
  /** @type {TemplateNode} */
  #anchor;
  /** @type {TemplateNode | null} */
  #hydrate_open = hydrating ? hydrate_node : null;
  /** @type {BoundaryProps} */
  #props;
  /** @type {((anchor: Node) => void)} */
  #children;
  /** @type {Effect} */
  #effect;
  /** @type {Effect | null} */
  #main_effect = null;
  /** @type {Effect | null} */
  #pending_effect = null;
  /** @type {Effect | null} */
  #failed_effect = null;
  /** @type {DocumentFragment | null} */
  #offscreen_fragment = null;
  #local_pending_count = 0;
  #pending_count = 0;
  #pending_count_update_queued = false;
  /** @type {Set<Effect>} */
  #dirty_effects = /* @__PURE__ */ new Set();
  /** @type {Set<Effect>} */
  #maybe_dirty_effects = /* @__PURE__ */ new Set();
  /**
   * A source containing the number of pending async deriveds/expressions.
   * Only created if `$effect.pending()` is used inside the boundary,
   * otherwise updating the source results in needless `Batch.ensure()`
   * calls followed by no-op flushes
   * @type {Source<number> | null}
   */
  #effect_pending = null;
  #effect_pending_subscriber = createSubscriber(() => {
    this.#effect_pending = source(this.#local_pending_count);
    if (dev_fallback_default) {
      tag(this.#effect_pending, "$effect.pending()");
    }
    return () => {
      this.#effect_pending = null;
    };
  });
  /**
   * @param {TemplateNode} node
   * @param {BoundaryProps} props
   * @param {((anchor: Node) => void)} children
   * @param {((error: unknown) => unknown) | undefined} [transform_error]
   */
  constructor(node, props, children, transform_error) {
    this.#anchor = node;
    this.#props = props;
    this.#children = (anchor) => {
      var effect2 = (
        /** @type {Effect} */
        active_effect
      );
      effect2.b = this;
      effect2.f |= BOUNDARY_EFFECT;
      children(anchor);
    };
    this.parent = /** @type {Effect} */
    active_effect.b;
    this.transform_error = transform_error ?? this.parent?.transform_error ?? ((e) => e);
    this.#effect = block(() => {
      if (hydrating) {
        const comment2 = (
          /** @type {Comment} */
          this.#hydrate_open
        );
        hydrate_next();
        const server_rendered_pending = comment2.data === HYDRATION_START_ELSE;
        const server_rendered_failed = comment2.data.startsWith(HYDRATION_START_FAILED);
        if (server_rendered_failed) {
          const serialized_error = JSON.parse(comment2.data.slice(HYDRATION_START_FAILED.length));
          this.#hydrate_failed_content(serialized_error);
        } else if (server_rendered_pending) {
          this.#hydrate_pending_content();
        } else {
          this.#hydrate_resolved_content();
        }
      } else {
        this.#render();
      }
    }, flags);
    if (hydrating) {
      this.#anchor = hydrate_node;
    }
  }
  #hydrate_resolved_content() {
    try {
      this.#main_effect = branch(() => this.#children(this.#anchor));
    } catch (error) {
      this.error(error);
    }
  }
  /**
   * @param {unknown} error The deserialized error from the server's hydration comment
   */
  #hydrate_failed_content(error) {
    const failed = this.#props.failed;
    if (!failed) return;
    this.#failed_effect = branch(() => {
      failed(
        this.#anchor,
        () => error,
        () => () => {
        }
      );
    });
  }
  #hydrate_pending_content() {
    const pending2 = this.#props.pending;
    if (!pending2) return;
    this.is_pending = true;
    this.#pending_effect = branch(() => pending2(this.#anchor));
    queue_micro_task(() => {
      var fragment = this.#offscreen_fragment = document.createDocumentFragment();
      var anchor = create_text();
      fragment.append(anchor);
      this.#main_effect = this.#run(() => {
        Batch.ensure();
        return branch(() => this.#children(anchor));
      });
      if (this.#pending_count === 0) {
        this.#anchor.before(fragment);
        this.#offscreen_fragment = null;
        pause_effect(
          /** @type {Effect} */
          this.#pending_effect,
          () => {
            this.#pending_effect = null;
          }
        );
        this.#resolve();
      }
    });
  }
  #render() {
    try {
      this.is_pending = this.has_pending_snippet();
      this.#pending_count = 0;
      this.#local_pending_count = 0;
      this.#main_effect = branch(() => {
        this.#children(this.#anchor);
      });
      if (this.#pending_count > 0) {
        var fragment = this.#offscreen_fragment = document.createDocumentFragment();
        move_effect(this.#main_effect, fragment);
        const pending2 = (
          /** @type {(anchor: Node) => void} */
          this.#props.pending
        );
        this.#pending_effect = branch(() => pending2(this.#anchor));
      } else {
        this.#resolve();
      }
    } catch (error) {
      this.error(error);
    }
  }
  #resolve() {
    this.is_pending = false;
    for (const e of this.#dirty_effects) {
      set_signal_status(e, DIRTY);
      schedule_effect(e);
    }
    for (const e of this.#maybe_dirty_effects) {
      set_signal_status(e, MAYBE_DIRTY);
      schedule_effect(e);
    }
    this.#dirty_effects.clear();
    this.#maybe_dirty_effects.clear();
  }
  /**
   * Defer an effect inside a pending boundary until the boundary resolves
   * @param {Effect} effect
   */
  defer_effect(effect2) {
    defer_effect(effect2, this.#dirty_effects, this.#maybe_dirty_effects);
  }
  /**
   * Returns `false` if the effect exists inside a boundary whose pending snippet is shown
   * @returns {boolean}
   */
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#props.pending;
  }
  /**
   * @template T
   * @param {() => T} fn
   */
  #run(fn) {
    var previous_effect = active_effect;
    var previous_reaction = active_reaction;
    var previous_ctx = component_context;
    set_active_effect(this.#effect);
    set_active_reaction(this.#effect);
    set_component_context(this.#effect.ctx);
    try {
      return fn();
    } catch (e) {
      handle_error(e);
      return null;
    } finally {
      set_active_effect(previous_effect);
      set_active_reaction(previous_reaction);
      set_component_context(previous_ctx);
    }
  }
  /**
   * Updates the pending count associated with the currently visible pending snippet,
   * if any, such that we can replace the snippet with content once work is done
   * @param {1 | -1} d
   */
  #update_pending_count(d) {
    if (!this.has_pending_snippet()) {
      if (this.parent) {
        this.parent.#update_pending_count(d);
      }
      return;
    }
    this.#pending_count += d;
    if (this.#pending_count === 0) {
      this.#resolve();
      if (this.#pending_effect) {
        pause_effect(this.#pending_effect, () => {
          this.#pending_effect = null;
        });
      }
      if (this.#offscreen_fragment) {
        this.#anchor.before(this.#offscreen_fragment);
        this.#offscreen_fragment = null;
      }
    }
  }
  /**
   * Update the source that powers `$effect.pending()` inside this boundary,
   * and controls when the current `pending` snippet (if any) is removed.
   * Do not call from inside the class
   * @param {1 | -1} d
   */
  update_pending_count(d) {
    this.#update_pending_count(d);
    this.#local_pending_count += d;
    if (!this.#effect_pending || this.#pending_count_update_queued) return;
    this.#pending_count_update_queued = true;
    queue_micro_task(() => {
      this.#pending_count_update_queued = false;
      if (this.#effect_pending) {
        internal_set(this.#effect_pending, this.#local_pending_count);
      }
    });
  }
  get_effect_pending() {
    this.#effect_pending_subscriber();
    return get(
      /** @type {Source<number>} */
      this.#effect_pending
    );
  }
  /** @param {unknown} error */
  error(error) {
    var onerror = this.#props.onerror;
    let failed = this.#props.failed;
    if (!onerror && !failed) {
      throw error;
    }
    if (this.#main_effect) {
      destroy_effect(this.#main_effect);
      this.#main_effect = null;
    }
    if (this.#pending_effect) {
      destroy_effect(this.#pending_effect);
      this.#pending_effect = null;
    }
    if (this.#failed_effect) {
      destroy_effect(this.#failed_effect);
      this.#failed_effect = null;
    }
    if (hydrating) {
      set_hydrate_node(
        /** @type {TemplateNode} */
        this.#hydrate_open
      );
      next();
      set_hydrate_node(skip_nodes());
    }
    var did_reset = false;
    var calling_on_error = false;
    const reset2 = () => {
      if (did_reset) {
        svelte_boundary_reset_noop();
        return;
      }
      did_reset = true;
      if (calling_on_error) {
        svelte_boundary_reset_onerror();
      }
      if (this.#failed_effect !== null) {
        pause_effect(this.#failed_effect, () => {
          this.#failed_effect = null;
        });
      }
      this.#run(() => {
        Batch.ensure();
        this.#render();
      });
    };
    const handle_error_result = (transformed_error) => {
      try {
        calling_on_error = true;
        onerror?.(transformed_error, reset2);
        calling_on_error = false;
      } catch (error2) {
        invoke_error_boundary(error2, this.#effect && this.#effect.parent);
      }
      if (failed) {
        this.#failed_effect = this.#run(() => {
          Batch.ensure();
          try {
            return branch(() => {
              var effect2 = (
                /** @type {Effect} */
                active_effect
              );
              effect2.b = this;
              effect2.f |= BOUNDARY_EFFECT;
              failed(
                this.#anchor,
                () => transformed_error,
                () => reset2
              );
            });
          } catch (error2) {
            invoke_error_boundary(
              error2,
              /** @type {Effect} */
              this.#effect.parent
            );
            return null;
          }
        });
      }
    };
    queue_micro_task(() => {
      var result;
      try {
        result = this.transform_error(error);
      } catch (e) {
        invoke_error_boundary(e, this.#effect && this.#effect.parent);
        return;
      }
      if (result !== null && typeof result === "object" && typeof /** @type {any} */
      result.then === "function") {
        result.then(
          handle_error_result,
          /** @param {unknown} e */
          (e) => invoke_error_boundary(e, this.#effect && this.#effect.parent)
        );
      } else {
        handle_error_result(result);
      }
    });
  }
};

// node_modules/svelte/src/internal/client/reactivity/async.js
function flatten(blockers, sync, async2, fn) {
  const d = is_runes() ? derived : derived_safe_equal;
  var pending2 = blockers.filter((b) => !b.settled);
  if (async2.length === 0 && pending2.length === 0) {
    fn(sync.map(d));
    return;
  }
  var batch = current_batch;
  var parent = (
    /** @type {Effect} */
    active_effect
  );
  var restore = capture();
  var blocker_promise = pending2.length === 1 ? pending2[0].promise : pending2.length > 1 ? Promise.all(pending2.map((b) => b.promise)) : null;
  function finish(values) {
    restore();
    try {
      fn(values);
    } catch (error) {
      if ((parent.f & DESTROYED) === 0) {
        invoke_error_boundary(error, parent);
      }
    }
    unset_context();
  }
  if (async2.length === 0) {
    blocker_promise.then(() => finish(sync.map(d)));
    return;
  }
  function run3() {
    restore();
    Promise.all(async2.map((expression) => async_derived(expression))).then((result) => finish([...sync.map(d), ...result])).catch((error) => invoke_error_boundary(error, parent));
  }
  if (blocker_promise) {
    blocker_promise.then(run3);
  } else {
    run3();
  }
}
function capture() {
  var previous_effect = active_effect;
  var previous_reaction = active_reaction;
  var previous_component_context = component_context;
  var previous_batch2 = current_batch;
  if (dev_fallback_default) {
    var previous_dev_stack = dev_stack;
  }
  return function restore(activate_batch = true) {
    set_active_effect(previous_effect);
    set_active_reaction(previous_reaction);
    set_component_context(previous_component_context);
    if (activate_batch) previous_batch2?.activate();
    if (dev_fallback_default) {
      set_from_async_derived(null);
      set_dev_stack(previous_dev_stack);
    }
  };
}
function unset_context(deactivate_batch = true) {
  set_active_effect(null);
  set_active_reaction(null);
  set_component_context(null);
  if (deactivate_batch) current_batch?.deactivate();
  if (dev_fallback_default) {
    set_from_async_derived(null);
    set_dev_stack(null);
  }
}
function increment_pending() {
  var boundary2 = (
    /** @type {Boundary} */
    /** @type {Effect} */
    active_effect.b
  );
  var batch = (
    /** @type {Batch} */
    current_batch
  );
  var blocking = boundary2.is_rendered();
  boundary2.update_pending_count(1);
  batch.increment(blocking);
  return () => {
    boundary2.update_pending_count(-1);
    batch.decrement(blocking);
  };
}

// node_modules/svelte/src/internal/client/reactivity/deriveds.js
var current_async_effect = null;
function set_from_async_derived(v) {
  current_async_effect = v;
}
var recent_async_deriveds = /* @__PURE__ */ new Set();
// @__NO_SIDE_EFFECTS__
function derived(fn) {
  var flags2 = DERIVED | DIRTY;
  var parent_derived = active_reaction !== null && (active_reaction.f & DERIVED) !== 0 ? (
    /** @type {Derived} */
    active_reaction
  ) : null;
  if (active_effect !== null) {
    active_effect.f |= EFFECT_PRESERVED;
  }
  const signal = {
    ctx: component_context,
    deps: null,
    effects: null,
    equals,
    f: flags2,
    fn,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      UNINITIALIZED
    ),
    wv: 0,
    parent: parent_derived ?? active_effect,
    ac: null
  };
  if (dev_fallback_default && tracing_mode_flag) {
    signal.created = get_error("created at");
  }
  return signal;
}
// @__NO_SIDE_EFFECTS__
function async_derived(fn, label, location) {
  let parent = (
    /** @type {Effect | null} */
    active_effect
  );
  if (parent === null) {
    async_derived_orphan();
  }
  var promise = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  );
  var signal = source(
    /** @type {V} */
    UNINITIALIZED
  );
  if (dev_fallback_default) signal.label = label;
  var should_suspend = !active_reaction;
  var deferreds = /* @__PURE__ */ new Map();
  async_effect(() => {
    if (dev_fallback_default) current_async_effect = active_effect;
    var d = deferred();
    promise = d.promise;
    try {
      Promise.resolve(fn()).then(d.resolve, d.reject).finally(unset_context);
    } catch (error) {
      d.reject(error);
      unset_context();
    }
    if (dev_fallback_default) current_async_effect = null;
    var batch = (
      /** @type {Batch} */
      current_batch
    );
    if (should_suspend) {
      var decrement_pending = increment_pending();
      deferreds.get(batch)?.reject(STALE_REACTION);
      deferreds.delete(batch);
      deferreds.set(batch, d);
    }
    const handler = (value, error = void 0) => {
      current_async_effect = null;
      batch.activate();
      if (error) {
        if (error !== STALE_REACTION) {
          signal.f |= ERROR_VALUE;
          internal_set(signal, error);
        }
      } else {
        if ((signal.f & ERROR_VALUE) !== 0) {
          signal.f ^= ERROR_VALUE;
        }
        internal_set(signal, value);
        for (const [b, d2] of deferreds) {
          deferreds.delete(b);
          if (b === batch) break;
          d2.reject(STALE_REACTION);
        }
        if (dev_fallback_default && location !== void 0) {
          recent_async_deriveds.add(signal);
          setTimeout(() => {
            if (recent_async_deriveds.has(signal)) {
              await_waterfall(
                /** @type {string} */
                signal.label,
                location
              );
              recent_async_deriveds.delete(signal);
            }
          });
        }
      }
      if (decrement_pending) {
        decrement_pending();
      }
    };
    d.promise.then(handler, (e) => handler(null, e || "unknown"));
  });
  teardown(() => {
    for (const d of deferreds.values()) {
      d.reject(STALE_REACTION);
    }
  });
  if (dev_fallback_default) {
    signal.f |= ASYNC;
  }
  return new Promise((fulfil) => {
    function next2(p) {
      function go() {
        if (p === promise) {
          fulfil(signal);
        } else {
          next2(promise);
        }
      }
      p.then(go, go);
    }
    next2(promise);
  });
}
// @__NO_SIDE_EFFECTS__
function user_derived(fn) {
  const d = /* @__PURE__ */ derived(fn);
  if (!async_mode_flag) push_reaction_value(d);
  return d;
}
// @__NO_SIDE_EFFECTS__
function derived_safe_equal(fn) {
  const signal = /* @__PURE__ */ derived(fn);
  signal.equals = safe_equals;
  return signal;
}
function destroy_derived_effects(derived2) {
  var effects = derived2.effects;
  if (effects !== null) {
    derived2.effects = null;
    for (var i = 0; i < effects.length; i += 1) {
      destroy_effect(
        /** @type {Effect} */
        effects[i]
      );
    }
  }
}
var stack = [];
function get_derived_parent_effect(derived2) {
  var parent = derived2.parent;
  while (parent !== null) {
    if ((parent.f & DERIVED) === 0) {
      return (parent.f & DESTROYED) === 0 ? (
        /** @type {Effect} */
        parent
      ) : null;
    }
    parent = parent.parent;
  }
  return null;
}
function execute_derived(derived2) {
  var value;
  var prev_active_effect = active_effect;
  set_active_effect(get_derived_parent_effect(derived2));
  if (dev_fallback_default) {
    let prev_eager_effects = eager_effects;
    set_eager_effects(/* @__PURE__ */ new Set());
    try {
      if (includes.call(stack, derived2)) {
        derived_references_self();
      }
      stack.push(derived2);
      derived2.f &= ~WAS_MARKED;
      destroy_derived_effects(derived2);
      value = update_reaction(derived2);
    } finally {
      set_active_effect(prev_active_effect);
      set_eager_effects(prev_eager_effects);
      stack.pop();
    }
  } else {
    try {
      derived2.f &= ~WAS_MARKED;
      destroy_derived_effects(derived2);
      value = update_reaction(derived2);
    } finally {
      set_active_effect(prev_active_effect);
    }
  }
  return value;
}
function update_derived(derived2) {
  var value = execute_derived(derived2);
  if (!derived2.equals(value)) {
    derived2.wv = increment_write_version();
    if (!current_batch?.is_fork || derived2.deps === null) {
      derived2.v = value;
      if (derived2.deps === null) {
        set_signal_status(derived2, CLEAN);
        return;
      }
    }
  }
  if (is_destroying_effect) {
    return;
  }
  if (batch_values !== null) {
    if (effect_tracking() || current_batch?.is_fork) {
      batch_values.set(derived2, value);
    }
  } else {
    update_derived_status(derived2);
  }
}
function freeze_derived_effects(derived2) {
  if (derived2.effects === null) return;
  for (const e of derived2.effects) {
    if (e.teardown || e.ac) {
      e.teardown?.();
      e.ac?.abort(STALE_REACTION);
      e.teardown = noop;
      e.ac = null;
      remove_reactions(e, 0);
      destroy_effect_children(e);
    }
  }
}
function unfreeze_derived_effects(derived2) {
  if (derived2.effects === null) return;
  for (const e of derived2.effects) {
    if (e.teardown) {
      update_effect(e);
    }
  }
}

// node_modules/svelte/src/internal/client/reactivity/sources.js
var eager_effects = /* @__PURE__ */ new Set();
var old_values = /* @__PURE__ */ new Map();
function set_eager_effects(v) {
  eager_effects = v;
}
var eager_effects_deferred = false;
function set_eager_effects_deferred() {
  eager_effects_deferred = true;
}
function source(v, stack2) {
  var signal = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v,
    reactions: null,
    equals,
    rv: 0,
    wv: 0
  };
  if (dev_fallback_default && tracing_mode_flag) {
    signal.created = stack2 ?? get_error("created at");
    signal.updated = null;
    signal.set_during_effect = false;
    signal.trace = null;
  }
  return signal;
}
// @__NO_SIDE_EFFECTS__
function state(v, stack2) {
  const s = source(v, stack2);
  push_reaction_value(s);
  return s;
}
// @__NO_SIDE_EFFECTS__
function mutable_source(initial_value, immutable = false, trackable = true) {
  const s = source(initial_value);
  if (!immutable) {
    s.equals = safe_equals;
  }
  if (legacy_mode_flag && trackable && component_context !== null && component_context.l !== null) {
    (component_context.l.s ??= []).push(s);
  }
  return s;
}
function set(source2, value, should_proxy = false) {
  if (active_reaction !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!untracking || (active_reaction.f & EAGER_EFFECT) !== 0) && is_runes() && (active_reaction.f & (DERIVED | BLOCK_EFFECT | ASYNC | EAGER_EFFECT)) !== 0 && (current_sources === null || !includes.call(current_sources, source2))) {
    state_unsafe_mutation();
  }
  let new_value = should_proxy ? proxy(value) : value;
  if (dev_fallback_default) {
    tag_proxy(
      new_value,
      /** @type {string} */
      source2.label
    );
  }
  return internal_set(source2, new_value);
}
function internal_set(source2, value) {
  if (!source2.equals(value)) {
    var old_value = source2.v;
    if (is_destroying_effect) {
      old_values.set(source2, value);
    } else {
      old_values.set(source2, old_value);
    }
    source2.v = value;
    var batch = Batch.ensure();
    batch.capture(source2, old_value);
    if (dev_fallback_default) {
      if (tracing_mode_flag || active_effect !== null) {
        source2.updated ??= /* @__PURE__ */ new Map();
        const count = (source2.updated.get("")?.count ?? 0) + 1;
        source2.updated.set("", { error: (
          /** @type {any} */
          null
        ), count });
        if (tracing_mode_flag || count > 5) {
          const error = get_error("updated at");
          if (error !== null) {
            let entry = source2.updated.get(error.stack);
            if (!entry) {
              entry = { error, count: 0 };
              source2.updated.set(error.stack, entry);
            }
            entry.count++;
          }
        }
      }
      if (active_effect !== null) {
        source2.set_during_effect = true;
      }
    }
    if ((source2.f & DERIVED) !== 0) {
      const derived2 = (
        /** @type {Derived} */
        source2
      );
      if ((source2.f & DIRTY) !== 0) {
        execute_derived(derived2);
      }
      update_derived_status(derived2);
    }
    source2.wv = increment_write_version();
    mark_reactions(source2, DIRTY);
    if (is_runes() && active_effect !== null && (active_effect.f & CLEAN) !== 0 && (active_effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0) {
      if (untracked_writes === null) {
        set_untracked_writes([source2]);
      } else {
        untracked_writes.push(source2);
      }
    }
    if (!batch.is_fork && eager_effects.size > 0 && !eager_effects_deferred) {
      flush_eager_effects();
    }
  }
  return value;
}
function flush_eager_effects() {
  eager_effects_deferred = false;
  for (const effect2 of eager_effects) {
    if ((effect2.f & CLEAN) !== 0) {
      set_signal_status(effect2, MAYBE_DIRTY);
    }
    if (is_dirty(effect2)) {
      update_effect(effect2);
    }
  }
  eager_effects.clear();
}
function increment(source2) {
  set(source2, source2.v + 1);
}
function mark_reactions(signal, status) {
  var reactions = signal.reactions;
  if (reactions === null) return;
  var runes = is_runes();
  var length = reactions.length;
  for (var i = 0; i < length; i++) {
    var reaction = reactions[i];
    var flags2 = reaction.f;
    if (!runes && reaction === active_effect) continue;
    if (dev_fallback_default && (flags2 & EAGER_EFFECT) !== 0) {
      eager_effects.add(reaction);
      continue;
    }
    var not_dirty = (flags2 & DIRTY) === 0;
    if (not_dirty) {
      set_signal_status(reaction, status);
    }
    if ((flags2 & DERIVED) !== 0) {
      var derived2 = (
        /** @type {Derived} */
        reaction
      );
      batch_values?.delete(derived2);
      if ((flags2 & WAS_MARKED) === 0) {
        if (flags2 & CONNECTED) {
          reaction.f |= WAS_MARKED;
        }
        mark_reactions(derived2, MAYBE_DIRTY);
      }
    } else if (not_dirty) {
      if ((flags2 & BLOCK_EFFECT) !== 0 && eager_block_effects !== null) {
        eager_block_effects.add(
          /** @type {Effect} */
          reaction
        );
      }
      schedule_effect(
        /** @type {Effect} */
        reaction
      );
    }
  }
}

// node_modules/svelte/src/internal/client/proxy.js
var regex_is_valid_identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
function proxy(value) {
  if (typeof value !== "object" || value === null || STATE_SYMBOL in value) {
    return value;
  }
  const prototype = get_prototype_of(value);
  if (prototype !== object_prototype && prototype !== array_prototype) {
    return value;
  }
  var sources = /* @__PURE__ */ new Map();
  var is_proxied_array = is_array(value);
  var version = state(0);
  var stack2 = dev_fallback_default && tracing_mode_flag ? get_error("created at") : null;
  var parent_version = update_version;
  var with_parent = (fn) => {
    if (update_version === parent_version) {
      return fn();
    }
    var reaction = active_reaction;
    var version2 = update_version;
    set_active_reaction(null);
    set_update_version(parent_version);
    var result = fn();
    set_active_reaction(reaction);
    set_update_version(version2);
    return result;
  };
  if (is_proxied_array) {
    sources.set("length", state(
      /** @type {any[]} */
      value.length,
      stack2
    ));
    if (dev_fallback_default) {
      value = /** @type {any} */
      inspectable_array(
        /** @type {any[]} */
        value
      );
    }
  }
  var path = "";
  let updating = false;
  function update_path(new_path) {
    if (updating) return;
    updating = true;
    path = new_path;
    tag(version, `${path} version`);
    for (const [prop2, source2] of sources) {
      tag(source2, get_label(path, prop2));
    }
    updating = false;
  }
  return new Proxy(
    /** @type {any} */
    value,
    {
      defineProperty(_, prop2, descriptor) {
        if (!("value" in descriptor) || descriptor.configurable === false || descriptor.enumerable === false || descriptor.writable === false) {
          state_descriptors_fixed();
        }
        var s = sources.get(prop2);
        if (s === void 0) {
          with_parent(() => {
            var s2 = state(descriptor.value, stack2);
            sources.set(prop2, s2);
            if (dev_fallback_default && typeof prop2 === "string") {
              tag(s2, get_label(path, prop2));
            }
            return s2;
          });
        } else {
          set(s, descriptor.value, true);
        }
        return true;
      },
      deleteProperty(target, prop2) {
        var s = sources.get(prop2);
        if (s === void 0) {
          if (prop2 in target) {
            const s2 = with_parent(() => state(UNINITIALIZED, stack2));
            sources.set(prop2, s2);
            increment(version);
            if (dev_fallback_default) {
              tag(s2, get_label(path, prop2));
            }
          }
        } else {
          set(s, UNINITIALIZED);
          increment(version);
        }
        return true;
      },
      get(target, prop2, receiver) {
        if (prop2 === STATE_SYMBOL) {
          return value;
        }
        if (dev_fallback_default && prop2 === PROXY_PATH_SYMBOL) {
          return update_path;
        }
        var s = sources.get(prop2);
        var exists = prop2 in target;
        if (s === void 0 && (!exists || get_descriptor(target, prop2)?.writable)) {
          s = with_parent(() => {
            var p = proxy(exists ? target[prop2] : UNINITIALIZED);
            var s2 = state(p, stack2);
            if (dev_fallback_default) {
              tag(s2, get_label(path, prop2));
            }
            return s2;
          });
          sources.set(prop2, s);
        }
        if (s !== void 0) {
          var v = get(s);
          return v === UNINITIALIZED ? void 0 : v;
        }
        return Reflect.get(target, prop2, receiver);
      },
      getOwnPropertyDescriptor(target, prop2) {
        var descriptor = Reflect.getOwnPropertyDescriptor(target, prop2);
        if (descriptor && "value" in descriptor) {
          var s = sources.get(prop2);
          if (s) descriptor.value = get(s);
        } else if (descriptor === void 0) {
          var source2 = sources.get(prop2);
          var value2 = source2?.v;
          if (source2 !== void 0 && value2 !== UNINITIALIZED) {
            return {
              enumerable: true,
              configurable: true,
              value: value2,
              writable: true
            };
          }
        }
        return descriptor;
      },
      has(target, prop2) {
        if (prop2 === STATE_SYMBOL) {
          return true;
        }
        var s = sources.get(prop2);
        var has = s !== void 0 && s.v !== UNINITIALIZED || Reflect.has(target, prop2);
        if (s !== void 0 || active_effect !== null && (!has || get_descriptor(target, prop2)?.writable)) {
          if (s === void 0) {
            s = with_parent(() => {
              var p = has ? proxy(target[prop2]) : UNINITIALIZED;
              var s2 = state(p, stack2);
              if (dev_fallback_default) {
                tag(s2, get_label(path, prop2));
              }
              return s2;
            });
            sources.set(prop2, s);
          }
          var value2 = get(s);
          if (value2 === UNINITIALIZED) {
            return false;
          }
        }
        return has;
      },
      set(target, prop2, value2, receiver) {
        var s = sources.get(prop2);
        var has = prop2 in target;
        if (is_proxied_array && prop2 === "length") {
          for (var i = value2; i < /** @type {Source<number>} */
          s.v; i += 1) {
            var other_s = sources.get(i + "");
            if (other_s !== void 0) {
              set(other_s, UNINITIALIZED);
            } else if (i in target) {
              other_s = with_parent(() => state(UNINITIALIZED, stack2));
              sources.set(i + "", other_s);
              if (dev_fallback_default) {
                tag(other_s, get_label(path, i));
              }
            }
          }
        }
        if (s === void 0) {
          if (!has || get_descriptor(target, prop2)?.writable) {
            s = with_parent(() => state(void 0, stack2));
            if (dev_fallback_default) {
              tag(s, get_label(path, prop2));
            }
            set(s, proxy(value2));
            sources.set(prop2, s);
          }
        } else {
          has = s.v !== UNINITIALIZED;
          var p = with_parent(() => proxy(value2));
          set(s, p);
        }
        var descriptor = Reflect.getOwnPropertyDescriptor(target, prop2);
        if (descriptor?.set) {
          descriptor.set.call(receiver, value2);
        }
        if (!has) {
          if (is_proxied_array && typeof prop2 === "string") {
            var ls = (
              /** @type {Source<number>} */
              sources.get("length")
            );
            var n = Number(prop2);
            if (Number.isInteger(n) && n >= ls.v) {
              set(ls, n + 1);
            }
          }
          increment(version);
        }
        return true;
      },
      ownKeys(target) {
        get(version);
        var own_keys = Reflect.ownKeys(target).filter((key3) => {
          var source3 = sources.get(key3);
          return source3 === void 0 || source3.v !== UNINITIALIZED;
        });
        for (var [key2, source2] of sources) {
          if (source2.v !== UNINITIALIZED && !(key2 in target)) {
            own_keys.push(key2);
          }
        }
        return own_keys;
      },
      setPrototypeOf() {
        state_prototype_fixed();
      }
    }
  );
}
function get_label(path, prop2) {
  if (typeof prop2 === "symbol") return `${path}[Symbol(${prop2.description ?? ""})]`;
  if (regex_is_valid_identifier.test(prop2)) return `${path}.${prop2}`;
  return /^\d+$/.test(prop2) ? `${path}[${prop2}]` : `${path}['${prop2}']`;
}
function get_proxied_value(value) {
  try {
    if (value !== null && typeof value === "object" && STATE_SYMBOL in value) {
      return value[STATE_SYMBOL];
    }
  } catch {
  }
  return value;
}
function is(a, b) {
  return Object.is(get_proxied_value(a), get_proxied_value(b));
}
var ARRAY_MUTATING_METHODS = /* @__PURE__ */ new Set([
  "copyWithin",
  "fill",
  "pop",
  "push",
  "reverse",
  "shift",
  "sort",
  "splice",
  "unshift"
]);
function inspectable_array(array) {
  return new Proxy(array, {
    get(target, prop2, receiver) {
      var value = Reflect.get(target, prop2, receiver);
      if (!ARRAY_MUTATING_METHODS.has(
        /** @type {string} */
        prop2
      )) {
        return value;
      }
      return function(...args) {
        set_eager_effects_deferred();
        var result = value.apply(this, args);
        flush_eager_effects();
        return result;
      };
    }
  });
}

// node_modules/svelte/src/internal/client/dev/equality.js
function init_array_prototype_warnings() {
  const array_prototype2 = Array.prototype;
  const cleanup = Array.__svelte_cleanup;
  if (cleanup) {
    cleanup();
  }
  const { indexOf, lastIndexOf, includes: includes2 } = array_prototype2;
  array_prototype2.indexOf = function(item, from_index) {
    const index2 = indexOf.call(this, item, from_index);
    if (index2 === -1) {
      for (let i = from_index ?? 0; i < this.length; i += 1) {
        if (get_proxied_value(this[i]) === item) {
          state_proxy_equality_mismatch("array.indexOf(...)");
          break;
        }
      }
    }
    return index2;
  };
  array_prototype2.lastIndexOf = function(item, from_index) {
    const index2 = lastIndexOf.call(this, item, from_index ?? this.length - 1);
    if (index2 === -1) {
      for (let i = 0; i <= (from_index ?? this.length - 1); i += 1) {
        if (get_proxied_value(this[i]) === item) {
          state_proxy_equality_mismatch("array.lastIndexOf(...)");
          break;
        }
      }
    }
    return index2;
  };
  array_prototype2.includes = function(item, from_index) {
    const has = includes2.call(this, item, from_index);
    if (!has) {
      for (let i = 0; i < this.length; i += 1) {
        if (get_proxied_value(this[i]) === item) {
          state_proxy_equality_mismatch("array.includes(...)");
          break;
        }
      }
    }
    return has;
  };
  Array.__svelte_cleanup = () => {
    array_prototype2.indexOf = indexOf;
    array_prototype2.lastIndexOf = lastIndexOf;
    array_prototype2.includes = includes2;
  };
}

// node_modules/svelte/src/internal/client/dom/operations.js
var $window;
var $document;
var is_firefox;
var first_child_getter;
var next_sibling_getter;
function init_operations() {
  if ($window !== void 0) {
    return;
  }
  $window = window;
  $document = document;
  is_firefox = /Firefox/.test(navigator.userAgent);
  var element_prototype = Element.prototype;
  var node_prototype = Node.prototype;
  var text_prototype = Text.prototype;
  first_child_getter = get_descriptor(node_prototype, "firstChild").get;
  next_sibling_getter = get_descriptor(node_prototype, "nextSibling").get;
  if (is_extensible(element_prototype)) {
    element_prototype.__click = void 0;
    element_prototype.__className = void 0;
    element_prototype.__attributes = null;
    element_prototype.__style = void 0;
    element_prototype.__e = void 0;
  }
  if (is_extensible(text_prototype)) {
    text_prototype.__t = void 0;
  }
  if (dev_fallback_default) {
    element_prototype.__svelte_meta = null;
    init_array_prototype_warnings();
  }
}
function create_text(value = "") {
  return document.createTextNode(value);
}
// @__NO_SIDE_EFFECTS__
function get_first_child(node) {
  return (
    /** @type {TemplateNode | null} */
    first_child_getter.call(node)
  );
}
// @__NO_SIDE_EFFECTS__
function get_next_sibling(node) {
  return (
    /** @type {TemplateNode | null} */
    next_sibling_getter.call(node)
  );
}
function child(node, is_text) {
  if (!hydrating) {
    return /* @__PURE__ */ get_first_child(node);
  }
  var child2 = /* @__PURE__ */ get_first_child(hydrate_node);
  if (child2 === null) {
    child2 = hydrate_node.appendChild(create_text());
  } else if (is_text && child2.nodeType !== TEXT_NODE) {
    var text2 = create_text();
    child2?.before(text2);
    set_hydrate_node(text2);
    return text2;
  }
  if (is_text) {
    merge_text_nodes(
      /** @type {Text} */
      child2
    );
  }
  set_hydrate_node(child2);
  return child2;
}
function first_child(node, is_text = false) {
  if (!hydrating) {
    var first = /* @__PURE__ */ get_first_child(node);
    if (first instanceof Comment && first.data === "") return /* @__PURE__ */ get_next_sibling(first);
    return first;
  }
  if (is_text) {
    if (hydrate_node?.nodeType !== TEXT_NODE) {
      var text2 = create_text();
      hydrate_node?.before(text2);
      set_hydrate_node(text2);
      return text2;
    }
    merge_text_nodes(
      /** @type {Text} */
      hydrate_node
    );
  }
  return hydrate_node;
}
function sibling(node, count = 1, is_text = false) {
  let next_sibling = hydrating ? hydrate_node : node;
  var last_sibling;
  while (count--) {
    last_sibling = next_sibling;
    next_sibling = /** @type {TemplateNode} */
    /* @__PURE__ */ get_next_sibling(next_sibling);
  }
  if (!hydrating) {
    return next_sibling;
  }
  if (is_text) {
    if (next_sibling?.nodeType !== TEXT_NODE) {
      var text2 = create_text();
      if (next_sibling === null) {
        last_sibling?.after(text2);
      } else {
        next_sibling.before(text2);
      }
      set_hydrate_node(text2);
      return text2;
    }
    merge_text_nodes(
      /** @type {Text} */
      next_sibling
    );
  }
  set_hydrate_node(next_sibling);
  return next_sibling;
}
function clear_text_content(node) {
  node.textContent = "";
}
function should_defer_append() {
  if (!async_mode_flag) return false;
  if (eager_block_effects !== null) return false;
  var flags2 = (
    /** @type {Effect} */
    active_effect.f
  );
  return (flags2 & REACTION_RAN) !== 0;
}
function create_element(tag2, namespace, is2) {
  let options = is2 ? { is: is2 } : void 0;
  return (
    /** @type {T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element} */
    document.createElementNS(namespace ?? NAMESPACE_HTML, tag2, options)
  );
}
function merge_text_nodes(text2) {
  if (
    /** @type {string} */
    text2.nodeValue.length < 65536
  ) {
    return;
  }
  let next2 = text2.nextSibling;
  while (next2 !== null && next2.nodeType === TEXT_NODE) {
    next2.remove();
    text2.nodeValue += /** @type {string} */
    next2.nodeValue;
    next2 = text2.nextSibling;
  }
}

// node_modules/svelte/src/internal/client/dom/elements/misc.js
var listening_to_form_reset = false;
function add_form_reset_listener() {
  if (!listening_to_form_reset) {
    listening_to_form_reset = true;
    document.addEventListener(
      "reset",
      (evt) => {
        Promise.resolve().then(() => {
          if (!evt.defaultPrevented) {
            for (
              const e of
              /**@type {HTMLFormElement} */
              evt.target.elements
            ) {
              e.__on_r?.();
            }
          }
        });
      },
      // In the capture phase to guarantee we get noticed of it (no possibility of stopPropagation)
      { capture: true }
    );
  }
}

// node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function without_reactive_context(fn) {
  var previous_reaction = active_reaction;
  var previous_effect = active_effect;
  set_active_reaction(null);
  set_active_effect(null);
  try {
    return fn();
  } finally {
    set_active_reaction(previous_reaction);
    set_active_effect(previous_effect);
  }
}
function listen_to_event_and_reset_event(element2, event2, handler, on_reset = handler) {
  element2.addEventListener(event2, () => without_reactive_context(handler));
  const prev = element2.__on_r;
  if (prev) {
    element2.__on_r = () => {
      prev();
      on_reset(true);
    };
  } else {
    element2.__on_r = () => on_reset(true);
  }
  add_form_reset_listener();
}

// node_modules/svelte/src/internal/client/reactivity/effects.js
function validate_effect(rune) {
  if (active_effect === null) {
    if (active_reaction === null) {
      effect_orphan(rune);
    }
    effect_in_unowned_derived();
  }
  if (is_destroying_effect) {
    effect_in_teardown(rune);
  }
}
function push_effect(effect2, parent_effect) {
  var parent_last = parent_effect.last;
  if (parent_last === null) {
    parent_effect.last = parent_effect.first = effect2;
  } else {
    parent_last.next = effect2;
    effect2.prev = parent_last;
    parent_effect.last = effect2;
  }
}
function create_effect(type, fn, sync) {
  var parent = active_effect;
  if (dev_fallback_default) {
    while (parent !== null && (parent.f & EAGER_EFFECT) !== 0) {
      parent = parent.parent;
    }
  }
  if (parent !== null && (parent.f & INERT) !== 0) {
    type |= INERT;
  }
  var effect2 = {
    ctx: component_context,
    deps: null,
    nodes: null,
    f: type | DIRTY | CONNECTED,
    first: null,
    fn,
    last: null,
    next: null,
    parent,
    b: parent && parent.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null
  };
  if (dev_fallback_default) {
    effect2.component_function = dev_current_component_function;
  }
  if (sync) {
    try {
      update_effect(effect2);
    } catch (e2) {
      destroy_effect(effect2);
      throw e2;
    }
  } else if (fn !== null) {
    schedule_effect(effect2);
  }
  var e = effect2;
  if (sync && e.deps === null && e.teardown === null && e.nodes === null && e.first === e.last && // either `null`, or a singular child
  (e.f & EFFECT_PRESERVED) === 0) {
    e = e.first;
    if ((type & BLOCK_EFFECT) !== 0 && (type & EFFECT_TRANSPARENT) !== 0 && e !== null) {
      e.f |= EFFECT_TRANSPARENT;
    }
  }
  if (e !== null) {
    e.parent = parent;
    if (parent !== null) {
      push_effect(e, parent);
    }
    if (active_reaction !== null && (active_reaction.f & DERIVED) !== 0 && (type & ROOT_EFFECT) === 0) {
      var derived2 = (
        /** @type {Derived} */
        active_reaction
      );
      (derived2.effects ??= []).push(e);
    }
  }
  return effect2;
}
function effect_tracking() {
  return active_reaction !== null && !untracking;
}
function teardown(fn) {
  const effect2 = create_effect(RENDER_EFFECT, null, false);
  set_signal_status(effect2, CLEAN);
  effect2.teardown = fn;
  return effect2;
}
function user_effect(fn) {
  validate_effect("$effect");
  if (dev_fallback_default) {
    define_property(fn, "name", {
      value: "$effect"
    });
  }
  var flags2 = (
    /** @type {Effect} */
    active_effect.f
  );
  var defer = !active_reaction && (flags2 & BRANCH_EFFECT) !== 0 && (flags2 & REACTION_RAN) === 0;
  if (defer) {
    var context = (
      /** @type {ComponentContext} */
      component_context
    );
    (context.e ??= []).push(fn);
  } else {
    return create_user_effect(fn);
  }
}
function create_user_effect(fn) {
  return create_effect(EFFECT | USER_EFFECT, fn, false);
}
function effect_root(fn) {
  Batch.ensure();
  const effect2 = create_effect(ROOT_EFFECT | EFFECT_PRESERVED, fn, true);
  return () => {
    destroy_effect(effect2);
  };
}
function component_root(fn) {
  Batch.ensure();
  const effect2 = create_effect(ROOT_EFFECT | EFFECT_PRESERVED, fn, true);
  return (options = {}) => {
    return new Promise((fulfil) => {
      if (options.outro) {
        pause_effect(effect2, () => {
          destroy_effect(effect2);
          fulfil(void 0);
        });
      } else {
        destroy_effect(effect2);
        fulfil(void 0);
      }
    });
  };
}
function effect(fn) {
  return create_effect(EFFECT, fn, false);
}
function async_effect(fn) {
  return create_effect(ASYNC | EFFECT_PRESERVED, fn, true);
}
function render_effect(fn, flags2 = 0) {
  return create_effect(RENDER_EFFECT | flags2, fn, true);
}
function template_effect(fn, sync = [], async2 = [], blockers = []) {
  flatten(blockers, sync, async2, (values) => {
    create_effect(RENDER_EFFECT, () => fn(...values.map(get)), true);
  });
}
function block(fn, flags2 = 0) {
  var effect2 = create_effect(BLOCK_EFFECT | flags2, fn, true);
  if (dev_fallback_default) {
    effect2.dev_stack = dev_stack;
  }
  return effect2;
}
function branch(fn) {
  return create_effect(BRANCH_EFFECT | EFFECT_PRESERVED, fn, true);
}
function execute_effect_teardown(effect2) {
  var teardown2 = effect2.teardown;
  if (teardown2 !== null) {
    const previously_destroying_effect = is_destroying_effect;
    const previous_reaction = active_reaction;
    set_is_destroying_effect(true);
    set_active_reaction(null);
    try {
      teardown2.call(null);
    } finally {
      set_is_destroying_effect(previously_destroying_effect);
      set_active_reaction(previous_reaction);
    }
  }
}
function destroy_effect_children(signal, remove_dom = false) {
  var effect2 = signal.first;
  signal.first = signal.last = null;
  while (effect2 !== null) {
    const controller = effect2.ac;
    if (controller !== null) {
      without_reactive_context(() => {
        controller.abort(STALE_REACTION);
      });
    }
    var next2 = effect2.next;
    if ((effect2.f & ROOT_EFFECT) !== 0) {
      effect2.parent = null;
    } else {
      destroy_effect(effect2, remove_dom);
    }
    effect2 = next2;
  }
}
function destroy_block_effect_children(signal) {
  var effect2 = signal.first;
  while (effect2 !== null) {
    var next2 = effect2.next;
    if ((effect2.f & BRANCH_EFFECT) === 0) {
      destroy_effect(effect2);
    }
    effect2 = next2;
  }
}
function destroy_effect(effect2, remove_dom = true) {
  var removed = false;
  if ((remove_dom || (effect2.f & HEAD_EFFECT) !== 0) && effect2.nodes !== null && effect2.nodes.end !== null) {
    remove_effect_dom(
      effect2.nodes.start,
      /** @type {TemplateNode} */
      effect2.nodes.end
    );
    removed = true;
  }
  destroy_effect_children(effect2, remove_dom && !removed);
  remove_reactions(effect2, 0);
  set_signal_status(effect2, DESTROYED);
  var transitions = effect2.nodes && effect2.nodes.t;
  if (transitions !== null) {
    for (const transition2 of transitions) {
      transition2.stop();
    }
  }
  execute_effect_teardown(effect2);
  var parent = effect2.parent;
  if (parent !== null && parent.first !== null) {
    unlink_effect(effect2);
  }
  if (dev_fallback_default) {
    effect2.component_function = null;
  }
  effect2.next = effect2.prev = effect2.teardown = effect2.ctx = effect2.deps = effect2.fn = effect2.nodes = effect2.ac = null;
}
function remove_effect_dom(node, end) {
  while (node !== null) {
    var next2 = node === end ? null : get_next_sibling(node);
    node.remove();
    node = next2;
  }
}
function unlink_effect(effect2) {
  var parent = effect2.parent;
  var prev = effect2.prev;
  var next2 = effect2.next;
  if (prev !== null) prev.next = next2;
  if (next2 !== null) next2.prev = prev;
  if (parent !== null) {
    if (parent.first === effect2) parent.first = next2;
    if (parent.last === effect2) parent.last = prev;
  }
}
function pause_effect(effect2, callback, destroy = true) {
  var transitions = [];
  pause_children(effect2, transitions, true);
  var fn = () => {
    if (destroy) destroy_effect(effect2);
    if (callback) callback();
  };
  var remaining = transitions.length;
  if (remaining > 0) {
    var check = () => --remaining || fn();
    for (var transition2 of transitions) {
      transition2.out(check);
    }
  } else {
    fn();
  }
}
function pause_children(effect2, transitions, local) {
  if ((effect2.f & INERT) !== 0) return;
  effect2.f ^= INERT;
  var t = effect2.nodes && effect2.nodes.t;
  if (t !== null) {
    for (const transition2 of t) {
      if (transition2.is_global || local) {
        transitions.push(transition2);
      }
    }
  }
  var child2 = effect2.first;
  while (child2 !== null) {
    var sibling2 = child2.next;
    var transparent = (child2.f & EFFECT_TRANSPARENT) !== 0 || // If this is a branch effect without a block effect parent,
    // it means the parent block effect was pruned. In that case,
    // transparency information was transferred to the branch effect.
    (child2.f & BRANCH_EFFECT) !== 0 && (effect2.f & BLOCK_EFFECT) !== 0;
    pause_children(child2, transitions, transparent ? local : false);
    child2 = sibling2;
  }
}
function resume_effect(effect2) {
  resume_children(effect2, true);
}
function resume_children(effect2, local) {
  if ((effect2.f & INERT) === 0) return;
  effect2.f ^= INERT;
  if ((effect2.f & CLEAN) === 0) {
    set_signal_status(effect2, DIRTY);
    schedule_effect(effect2);
  }
  var child2 = effect2.first;
  while (child2 !== null) {
    var sibling2 = child2.next;
    var transparent = (child2.f & EFFECT_TRANSPARENT) !== 0 || (child2.f & BRANCH_EFFECT) !== 0;
    resume_children(child2, transparent ? local : false);
    child2 = sibling2;
  }
  var t = effect2.nodes && effect2.nodes.t;
  if (t !== null) {
    for (const transition2 of t) {
      if (transition2.is_global || local) {
        transition2.in();
      }
    }
  }
}
function move_effect(effect2, fragment) {
  if (!effect2.nodes) return;
  var node = effect2.nodes.start;
  var end = effect2.nodes.end;
  while (node !== null) {
    var next2 = node === end ? null : get_next_sibling(node);
    fragment.append(node);
    node = next2;
  }
}

// node_modules/svelte/src/internal/client/legacy.js
var captured_signals = null;

// node_modules/svelte/src/internal/client/runtime.js
var is_updating_effect = false;
var is_destroying_effect = false;
function set_is_destroying_effect(value) {
  is_destroying_effect = value;
}
var active_reaction = null;
var untracking = false;
function set_active_reaction(reaction) {
  active_reaction = reaction;
}
var active_effect = null;
function set_active_effect(effect2) {
  active_effect = effect2;
}
var current_sources = null;
function push_reaction_value(value) {
  if (active_reaction !== null && (!async_mode_flag || (active_reaction.f & DERIVED) !== 0)) {
    if (current_sources === null) {
      current_sources = [value];
    } else {
      current_sources.push(value);
    }
  }
}
var new_deps = null;
var skipped_deps = 0;
var untracked_writes = null;
function set_untracked_writes(value) {
  untracked_writes = value;
}
var write_version = 1;
var read_version = 0;
var update_version = read_version;
function set_update_version(value) {
  update_version = value;
}
function increment_write_version() {
  return ++write_version;
}
function is_dirty(reaction) {
  var flags2 = reaction.f;
  if ((flags2 & DIRTY) !== 0) {
    return true;
  }
  if (flags2 & DERIVED) {
    reaction.f &= ~WAS_MARKED;
  }
  if ((flags2 & MAYBE_DIRTY) !== 0) {
    var dependencies = (
      /** @type {Value[]} */
      reaction.deps
    );
    var length = dependencies.length;
    for (var i = 0; i < length; i++) {
      var dependency = dependencies[i];
      if (is_dirty(
        /** @type {Derived} */
        dependency
      )) {
        update_derived(
          /** @type {Derived} */
          dependency
        );
      }
      if (dependency.wv > reaction.wv) {
        return true;
      }
    }
    if ((flags2 & CONNECTED) !== 0 && // During time traveling we don't want to reset the status so that
    // traversal of the graph in the other batches still happens
    batch_values === null) {
      set_signal_status(reaction, CLEAN);
    }
  }
  return false;
}
function schedule_possible_effect_self_invalidation(signal, effect2, root6 = true) {
  var reactions = signal.reactions;
  if (reactions === null) return;
  if (!async_mode_flag && current_sources !== null && includes.call(current_sources, signal)) {
    return;
  }
  for (var i = 0; i < reactions.length; i++) {
    var reaction = reactions[i];
    if ((reaction.f & DERIVED) !== 0) {
      schedule_possible_effect_self_invalidation(
        /** @type {Derived} */
        reaction,
        effect2,
        false
      );
    } else if (effect2 === reaction) {
      if (root6) {
        set_signal_status(reaction, DIRTY);
      } else if ((reaction.f & CLEAN) !== 0) {
        set_signal_status(reaction, MAYBE_DIRTY);
      }
      schedule_effect(
        /** @type {Effect} */
        reaction
      );
    }
  }
}
function update_reaction(reaction) {
  var previous_deps = new_deps;
  var previous_skipped_deps = skipped_deps;
  var previous_untracked_writes = untracked_writes;
  var previous_reaction = active_reaction;
  var previous_sources = current_sources;
  var previous_component_context = component_context;
  var previous_untracking = untracking;
  var previous_update_version = update_version;
  var flags2 = reaction.f;
  new_deps = /** @type {null | Value[]} */
  null;
  skipped_deps = 0;
  untracked_writes = null;
  active_reaction = (flags2 & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? reaction : null;
  current_sources = null;
  set_component_context(reaction.ctx);
  untracking = false;
  update_version = ++read_version;
  if (reaction.ac !== null) {
    without_reactive_context(() => {
      reaction.ac.abort(STALE_REACTION);
    });
    reaction.ac = null;
  }
  try {
    reaction.f |= REACTION_IS_UPDATING;
    var fn = (
      /** @type {Function} */
      reaction.fn
    );
    var result = fn();
    reaction.f |= REACTION_RAN;
    var deps = reaction.deps;
    var is_fork = current_batch?.is_fork;
    if (new_deps !== null) {
      var i;
      if (!is_fork) {
        remove_reactions(reaction, skipped_deps);
      }
      if (deps !== null && skipped_deps > 0) {
        deps.length = skipped_deps + new_deps.length;
        for (i = 0; i < new_deps.length; i++) {
          deps[skipped_deps + i] = new_deps[i];
        }
      } else {
        reaction.deps = deps = new_deps;
      }
      if (effect_tracking() && (reaction.f & CONNECTED) !== 0) {
        for (i = skipped_deps; i < deps.length; i++) {
          (deps[i].reactions ??= []).push(reaction);
        }
      }
    } else if (!is_fork && deps !== null && skipped_deps < deps.length) {
      remove_reactions(reaction, skipped_deps);
      deps.length = skipped_deps;
    }
    if (is_runes() && untracked_writes !== null && !untracking && deps !== null && (reaction.f & (DERIVED | MAYBE_DIRTY | DIRTY)) === 0) {
      for (i = 0; i < /** @type {Source[]} */
      untracked_writes.length; i++) {
        schedule_possible_effect_self_invalidation(
          untracked_writes[i],
          /** @type {Effect} */
          reaction
        );
      }
    }
    if (previous_reaction !== null && previous_reaction !== reaction) {
      read_version++;
      if (previous_reaction.deps !== null) {
        for (let i2 = 0; i2 < previous_skipped_deps; i2 += 1) {
          previous_reaction.deps[i2].rv = read_version;
        }
      }
      if (previous_deps !== null) {
        for (const dep of previous_deps) {
          dep.rv = read_version;
        }
      }
      if (untracked_writes !== null) {
        if (previous_untracked_writes === null) {
          previous_untracked_writes = untracked_writes;
        } else {
          previous_untracked_writes.push(.../** @type {Source[]} */
          untracked_writes);
        }
      }
    }
    if ((reaction.f & ERROR_VALUE) !== 0) {
      reaction.f ^= ERROR_VALUE;
    }
    return result;
  } catch (error) {
    return handle_error(error);
  } finally {
    reaction.f ^= REACTION_IS_UPDATING;
    new_deps = previous_deps;
    skipped_deps = previous_skipped_deps;
    untracked_writes = previous_untracked_writes;
    active_reaction = previous_reaction;
    current_sources = previous_sources;
    set_component_context(previous_component_context);
    untracking = previous_untracking;
    update_version = previous_update_version;
  }
}
function remove_reaction(signal, dependency) {
  let reactions = dependency.reactions;
  if (reactions !== null) {
    var index2 = index_of.call(reactions, signal);
    if (index2 !== -1) {
      var new_length = reactions.length - 1;
      if (new_length === 0) {
        reactions = dependency.reactions = null;
      } else {
        reactions[index2] = reactions[new_length];
        reactions.pop();
      }
    }
  }
  if (reactions === null && (dependency.f & DERIVED) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (new_deps === null || !includes.call(new_deps, dependency))) {
    var derived2 = (
      /** @type {Derived} */
      dependency
    );
    if ((derived2.f & CONNECTED) !== 0) {
      derived2.f ^= CONNECTED;
      derived2.f &= ~WAS_MARKED;
    }
    update_derived_status(derived2);
    freeze_derived_effects(derived2);
    remove_reactions(derived2, 0);
  }
}
function remove_reactions(signal, start_index) {
  var dependencies = signal.deps;
  if (dependencies === null) return;
  for (var i = start_index; i < dependencies.length; i++) {
    remove_reaction(signal, dependencies[i]);
  }
}
function update_effect(effect2) {
  var flags2 = effect2.f;
  if ((flags2 & DESTROYED) !== 0) {
    return;
  }
  set_signal_status(effect2, CLEAN);
  var previous_effect = active_effect;
  var was_updating_effect = is_updating_effect;
  active_effect = effect2;
  is_updating_effect = true;
  if (dev_fallback_default) {
    var previous_component_fn = dev_current_component_function;
    set_dev_current_component_function(effect2.component_function);
    var previous_stack = (
      /** @type {any} */
      dev_stack
    );
    set_dev_stack(effect2.dev_stack ?? dev_stack);
  }
  try {
    if ((flags2 & (BLOCK_EFFECT | MANAGED_EFFECT)) !== 0) {
      destroy_block_effect_children(effect2);
    } else {
      destroy_effect_children(effect2);
    }
    execute_effect_teardown(effect2);
    var teardown2 = update_reaction(effect2);
    effect2.teardown = typeof teardown2 === "function" ? teardown2 : null;
    effect2.wv = write_version;
    if (dev_fallback_default && tracing_mode_flag && (effect2.f & DIRTY) !== 0 && effect2.deps !== null) {
      for (var dep of effect2.deps) {
        if (dep.set_during_effect) {
          dep.wv = increment_write_version();
          dep.set_during_effect = false;
        }
      }
    }
  } finally {
    is_updating_effect = was_updating_effect;
    active_effect = previous_effect;
    if (dev_fallback_default) {
      set_dev_current_component_function(previous_component_fn);
      set_dev_stack(previous_stack);
    }
  }
}
async function tick() {
  if (async_mode_flag) {
    return new Promise((f) => {
      requestAnimationFrame(() => f());
      setTimeout(() => f());
    });
  }
  await Promise.resolve();
  flushSync();
}
function get(signal) {
  var flags2 = signal.f;
  var is_derived = (flags2 & DERIVED) !== 0;
  captured_signals?.add(signal);
  if (active_reaction !== null && !untracking) {
    var destroyed = active_effect !== null && (active_effect.f & DESTROYED) !== 0;
    if (!destroyed && (current_sources === null || !includes.call(current_sources, signal))) {
      var deps = active_reaction.deps;
      if ((active_reaction.f & REACTION_IS_UPDATING) !== 0) {
        if (signal.rv < read_version) {
          signal.rv = read_version;
          if (new_deps === null && deps !== null && deps[skipped_deps] === signal) {
            skipped_deps++;
          } else if (new_deps === null) {
            new_deps = [signal];
          } else {
            new_deps.push(signal);
          }
        }
      } else {
        (active_reaction.deps ??= []).push(signal);
        var reactions = signal.reactions;
        if (reactions === null) {
          signal.reactions = [active_reaction];
        } else if (!includes.call(reactions, active_reaction)) {
          reactions.push(active_reaction);
        }
      }
    }
  }
  if (dev_fallback_default) {
    recent_async_deriveds.delete(signal);
    if (tracing_mode_flag && !untracking && tracing_expressions !== null && active_reaction !== null && tracing_expressions.reaction === active_reaction) {
      if (signal.trace) {
        signal.trace();
      } else {
        var trace2 = get_error("traced at");
        if (trace2) {
          var entry = tracing_expressions.entries.get(signal);
          if (entry === void 0) {
            entry = { traces: [] };
            tracing_expressions.entries.set(signal, entry);
          }
          var last = entry.traces[entry.traces.length - 1];
          if (trace2.stack !== last?.stack) {
            entry.traces.push(trace2);
          }
        }
      }
    }
  }
  if (is_destroying_effect && old_values.has(signal)) {
    return old_values.get(signal);
  }
  if (is_derived) {
    var derived2 = (
      /** @type {Derived} */
      signal
    );
    if (is_destroying_effect) {
      var value = derived2.v;
      if ((derived2.f & CLEAN) === 0 && derived2.reactions !== null || depends_on_old_values(derived2)) {
        value = execute_derived(derived2);
      }
      old_values.set(derived2, value);
      return value;
    }
    var should_connect = (derived2.f & CONNECTED) === 0 && !untracking && active_reaction !== null && (is_updating_effect || (active_reaction.f & CONNECTED) !== 0);
    var is_new = (derived2.f & REACTION_RAN) === 0;
    if (is_dirty(derived2)) {
      if (should_connect) {
        derived2.f |= CONNECTED;
      }
      update_derived(derived2);
    }
    if (should_connect && !is_new) {
      unfreeze_derived_effects(derived2);
      reconnect(derived2);
    }
  }
  if (batch_values?.has(signal)) {
    return batch_values.get(signal);
  }
  if ((signal.f & ERROR_VALUE) !== 0) {
    throw signal.v;
  }
  return signal.v;
}
function reconnect(derived2) {
  derived2.f |= CONNECTED;
  if (derived2.deps === null) return;
  for (const dep of derived2.deps) {
    (dep.reactions ??= []).push(derived2);
    if ((dep.f & DERIVED) !== 0 && (dep.f & CONNECTED) === 0) {
      unfreeze_derived_effects(
        /** @type {Derived} */
        dep
      );
      reconnect(
        /** @type {Derived} */
        dep
      );
    }
  }
}
function depends_on_old_values(derived2) {
  if (derived2.v === UNINITIALIZED) return true;
  if (derived2.deps === null) return false;
  for (const dep of derived2.deps) {
    if (old_values.has(dep)) {
      return true;
    }
    if ((dep.f & DERIVED) !== 0 && depends_on_old_values(
      /** @type {Derived} */
      dep
    )) {
      return true;
    }
  }
  return false;
}
function untrack(fn) {
  var previous_untracking = untracking;
  try {
    untracking = true;
    return fn();
  } finally {
    untracking = previous_untracking;
  }
}

// node_modules/svelte/src/utils.js
var DOM_BOOLEAN_ATTRIBUTES = [
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "disabled",
  "formnovalidate",
  "indeterminate",
  "inert",
  "ismap",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "seamless",
  "selected",
  "webkitdirectory",
  "defer",
  "disablepictureinpicture",
  "disableremoteplayback"
];
var DOM_PROPERTIES = [
  ...DOM_BOOLEAN_ATTRIBUTES,
  "formNoValidate",
  "isMap",
  "noModule",
  "playsInline",
  "readOnly",
  "value",
  "volume",
  "defaultValue",
  "defaultChecked",
  "srcObject",
  "noValidate",
  "allowFullscreen",
  "disablePictureInPicture",
  "disableRemotePlayback"
];
var PASSIVE_EVENTS = ["touchstart", "touchmove"];
function is_passive_event(name) {
  return PASSIVE_EVENTS.includes(name);
}
var STATE_CREATION_RUNES = (
  /** @type {const} */
  [
    "$state",
    "$state.raw",
    "$derived",
    "$derived.by"
  ]
);
var RUNES = (
  /** @type {const} */
  [
    ...STATE_CREATION_RUNES,
    "$state.eager",
    "$state.snapshot",
    "$props",
    "$props.id",
    "$bindable",
    "$effect",
    "$effect.pre",
    "$effect.tracking",
    "$effect.root",
    "$effect.pending",
    "$inspect",
    "$inspect().with",
    "$inspect.trace",
    "$host"
  ]
);

// node_modules/svelte/src/internal/client/dev/css.js
var all_styles = /* @__PURE__ */ new Map();
function register_style(hash2, style) {
  var styles = all_styles.get(hash2);
  if (!styles) {
    styles = /* @__PURE__ */ new Set();
    all_styles.set(hash2, styles);
  }
  styles.add(style);
}

// node_modules/svelte/src/internal/client/dom/elements/events.js
var event_symbol = Symbol("events");
var all_registered_events = /* @__PURE__ */ new Set();
var root_event_handles = /* @__PURE__ */ new Set();
function create_event(event_name, dom, handler, options = {}) {
  function target_handler(event2) {
    if (!options.capture) {
      handle_event_propagation.call(dom, event2);
    }
    if (!event2.cancelBubble) {
      return without_reactive_context(() => {
        return handler?.call(this, event2);
      });
    }
  }
  if (event_name.startsWith("pointer") || event_name.startsWith("touch") || event_name === "wheel") {
    queue_micro_task(() => {
      dom.addEventListener(event_name, target_handler, options);
    });
  } else {
    dom.addEventListener(event_name, target_handler, options);
  }
  return target_handler;
}
function event(event_name, dom, handler, capture2, passive2) {
  var options = { capture: capture2, passive: passive2 };
  var target_handler = create_event(event_name, dom, handler, options);
  if (dom === document.body || // @ts-ignore
  dom === window || // @ts-ignore
  dom === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  dom instanceof HTMLMediaElement) {
    teardown(() => {
      dom.removeEventListener(event_name, target_handler, options);
    });
  }
}
function delegated(event_name, element2, handler) {
  (element2[event_symbol] ??= {})[event_name] = handler;
}
function delegate(events) {
  for (var i = 0; i < events.length; i++) {
    all_registered_events.add(events[i]);
  }
  for (var fn of root_event_handles) {
    fn(events);
  }
}
var last_propagated_event = null;
function handle_event_propagation(event2) {
  var handler_element = this;
  var owner_document = (
    /** @type {Node} */
    handler_element.ownerDocument
  );
  var event_name = event2.type;
  var path = event2.composedPath?.() || [];
  var current_target = (
    /** @type {null | Element} */
    path[0] || event2.target
  );
  last_propagated_event = event2;
  var path_idx = 0;
  var handled_at = last_propagated_event === event2 && event2[event_symbol];
  if (handled_at) {
    var at_idx = path.indexOf(handled_at);
    if (at_idx !== -1 && (handler_element === document || handler_element === /** @type {any} */
    window)) {
      event2[event_symbol] = handler_element;
      return;
    }
    var handler_idx = path.indexOf(handler_element);
    if (handler_idx === -1) {
      return;
    }
    if (at_idx <= handler_idx) {
      path_idx = at_idx;
    }
  }
  current_target = /** @type {Element} */
  path[path_idx] || event2.target;
  if (current_target === handler_element) return;
  define_property(event2, "currentTarget", {
    configurable: true,
    get() {
      return current_target || owner_document;
    }
  });
  var previous_reaction = active_reaction;
  var previous_effect = active_effect;
  set_active_reaction(null);
  set_active_effect(null);
  try {
    var throw_error;
    var other_errors = [];
    while (current_target !== null) {
      var parent_element = current_target.assignedSlot || current_target.parentNode || /** @type {any} */
      current_target.host || null;
      try {
        var delegated2 = current_target[event_symbol]?.[event_name];
        if (delegated2 != null && (!/** @type {any} */
        current_target.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
        // -> the target could not have been disabled because it emits the event in the first place
        event2.target === current_target)) {
          delegated2.call(current_target, event2);
        }
      } catch (error) {
        if (throw_error) {
          other_errors.push(error);
        } else {
          throw_error = error;
        }
      }
      if (event2.cancelBubble || parent_element === handler_element || parent_element === null) {
        break;
      }
      current_target = parent_element;
    }
    if (throw_error) {
      for (let error of other_errors) {
        queueMicrotask(() => {
          throw error;
        });
      }
      throw throw_error;
    }
  } finally {
    event2[event_symbol] = handler_element;
    delete event2.currentTarget;
    set_active_reaction(previous_reaction);
    set_active_effect(previous_effect);
  }
}

// node_modules/svelte/src/internal/client/dom/reconciler.js
var policy = (
  // We gotta write it like this because after downleveling the pure comment may end up in the wrong location
  globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
    /** @param {string} html */
    createHTML: (html2) => {
      return html2;
    }
  })
);
function create_trusted_html(html2) {
  return (
    /** @type {string} */
    policy?.createHTML(html2) ?? html2
  );
}
function create_fragment_from_html(html2) {
  var elem = create_element("template");
  elem.innerHTML = create_trusted_html(html2.replaceAll("<!>", "<!---->"));
  return elem.content;
}

// node_modules/svelte/src/internal/client/dom/template.js
function assign_nodes(start, end) {
  var effect2 = (
    /** @type {Effect} */
    active_effect
  );
  if (effect2.nodes === null) {
    effect2.nodes = { start, end, a: null, t: null };
  }
}
// @__NO_SIDE_EFFECTS__
function from_html(content, flags2) {
  var is_fragment = (flags2 & TEMPLATE_FRAGMENT) !== 0;
  var use_import_node = (flags2 & TEMPLATE_USE_IMPORT_NODE) !== 0;
  var node;
  var has_start = !content.startsWith("<!>");
  return () => {
    if (hydrating) {
      assign_nodes(hydrate_node, null);
      return hydrate_node;
    }
    if (node === void 0) {
      node = create_fragment_from_html(has_start ? content : "<!>" + content);
      if (!is_fragment) node = /** @type {TemplateNode} */
      get_first_child(node);
    }
    var clone = (
      /** @type {TemplateNode} */
      use_import_node || is_firefox ? document.importNode(node, true) : node.cloneNode(true)
    );
    if (is_fragment) {
      var start = (
        /** @type {TemplateNode} */
        get_first_child(clone)
      );
      var end = (
        /** @type {TemplateNode} */
        clone.lastChild
      );
      assign_nodes(start, end);
    } else {
      assign_nodes(clone, clone);
    }
    return clone;
  };
}
function comment() {
  if (hydrating) {
    assign_nodes(hydrate_node, null);
    return hydrate_node;
  }
  var frag = document.createDocumentFragment();
  var start = document.createComment("");
  var anchor = create_text();
  frag.append(start, anchor);
  assign_nodes(start, anchor);
  return frag;
}
function append(anchor, dom) {
  if (hydrating) {
    var effect2 = (
      /** @type {Effect & { nodes: EffectNodes }} */
      active_effect
    );
    if ((effect2.f & REACTION_RAN) === 0 || effect2.nodes.end === null) {
      effect2.nodes.end = hydrate_node;
    }
    hydrate_next();
    return;
  }
  if (anchor === null) {
    return;
  }
  anchor.before(
    /** @type {Node} */
    dom
  );
}

// node_modules/svelte/src/internal/client/render.js
var should_intro = true;
function set_text(text2, value) {
  var str = value == null ? "" : typeof value === "object" ? value + "" : value;
  if (str !== (text2.__t ??= text2.nodeValue)) {
    text2.__t = str;
    text2.nodeValue = str + "";
  }
}
function mount(component2, options) {
  return _mount(component2, options);
}
function hydrate(component2, options) {
  init_operations();
  options.intro = options.intro ?? false;
  const target = options.target;
  const was_hydrating = hydrating;
  const previous_hydrate_node = hydrate_node;
  try {
    var anchor = get_first_child(target);
    while (anchor && (anchor.nodeType !== COMMENT_NODE || /** @type {Comment} */
    anchor.data !== HYDRATION_START)) {
      anchor = get_next_sibling(anchor);
    }
    if (!anchor) {
      throw HYDRATION_ERROR;
    }
    set_hydrating(true);
    set_hydrate_node(
      /** @type {Comment} */
      anchor
    );
    const instance = _mount(component2, { ...options, anchor });
    set_hydrating(false);
    return (
      /**  @type {Exports} */
      instance
    );
  } catch (error) {
    if (error instanceof Error && error.message.split("\n").some((line) => line.startsWith("https://svelte.dev/e/"))) {
      throw error;
    }
    if (error !== HYDRATION_ERROR) {
      console.warn("Failed to hydrate: ", error);
    }
    if (options.recover === false) {
      hydration_failed();
    }
    init_operations();
    clear_text_content(target);
    set_hydrating(false);
    return mount(component2, options);
  } finally {
    set_hydrating(was_hydrating);
    set_hydrate_node(previous_hydrate_node);
  }
}
var listeners = /* @__PURE__ */ new Map();
function _mount(Component, { target, anchor, props = {}, events, context, intro = true, transformError }) {
  init_operations();
  var component2 = void 0;
  var unmount2 = component_root(() => {
    var anchor_node = anchor ?? target.appendChild(create_text());
    boundary(
      /** @type {TemplateNode} */
      anchor_node,
      {
        pending: () => {
        }
      },
      (anchor_node2) => {
        push({});
        var ctx = (
          /** @type {ComponentContext} */
          component_context
        );
        if (context) ctx.c = context;
        if (events) {
          props.$$events = events;
        }
        if (hydrating) {
          assign_nodes(
            /** @type {TemplateNode} */
            anchor_node2,
            null
          );
        }
        should_intro = intro;
        component2 = Component(anchor_node2, props) || {};
        should_intro = true;
        if (hydrating) {
          active_effect.nodes.end = hydrate_node;
          if (hydrate_node === null || hydrate_node.nodeType !== COMMENT_NODE || /** @type {Comment} */
          hydrate_node.data !== HYDRATION_END) {
            hydration_mismatch();
            throw HYDRATION_ERROR;
          }
        }
        pop();
      },
      transformError
    );
    var registered_events = /* @__PURE__ */ new Set();
    var event_handle = (events2) => {
      for (var i = 0; i < events2.length; i++) {
        var event_name = events2[i];
        if (registered_events.has(event_name)) continue;
        registered_events.add(event_name);
        var passive2 = is_passive_event(event_name);
        for (const node of [target, document]) {
          var counts = listeners.get(node);
          if (counts === void 0) {
            counts = /* @__PURE__ */ new Map();
            listeners.set(node, counts);
          }
          var count = counts.get(event_name);
          if (count === void 0) {
            node.addEventListener(event_name, handle_event_propagation, { passive: passive2 });
            counts.set(event_name, 1);
          } else {
            counts.set(event_name, count + 1);
          }
        }
      }
    };
    event_handle(array_from(all_registered_events));
    root_event_handles.add(event_handle);
    return () => {
      for (var event_name of registered_events) {
        for (const node of [target, document]) {
          var counts = (
            /** @type {Map<string, number>} */
            listeners.get(node)
          );
          var count = (
            /** @type {number} */
            counts.get(event_name)
          );
          if (--count == 0) {
            node.removeEventListener(event_name, handle_event_propagation);
            counts.delete(event_name);
            if (counts.size === 0) {
              listeners.delete(node);
            }
          } else {
            counts.set(event_name, count);
          }
        }
      }
      root_event_handles.delete(event_handle);
      if (anchor_node !== anchor) {
        anchor_node.parentNode?.removeChild(anchor_node);
      }
    };
  });
  mounted_components.set(component2, unmount2);
  return component2;
}
var mounted_components = /* @__PURE__ */ new WeakMap();
function unmount(component2, options) {
  const fn = mounted_components.get(component2);
  if (fn) {
    mounted_components.delete(component2);
    return fn(options);
  }
  if (dev_fallback_default) {
    if (STATE_SYMBOL in component2) {
      state_proxy_unmount();
    } else {
      lifecycle_double_unmount();
    }
  }
  return Promise.resolve();
}

// node_modules/svelte/src/internal/client/dom/blocks/branches.js
var BranchManager = class {
  /** @type {TemplateNode} */
  anchor;
  /** @type {Map<Batch, Key>} */
  #batches = /* @__PURE__ */ new Map();
  /**
   * Map of keys to effects that are currently rendered in the DOM.
   * These effects are visible and actively part of the document tree.
   * Example:
   * ```
   * {#if condition}
   * 	foo
   * {:else}
   * 	bar
   * {/if}
   * ```
   * Can result in the entries `true->Effect` and `false->Effect`
   * @type {Map<Key, Effect>}
   */
  #onscreen = /* @__PURE__ */ new Map();
  /**
   * Similar to #onscreen with respect to the keys, but contains branches that are not yet
   * in the DOM, because their insertion is deferred.
   * @type {Map<Key, Branch>}
   */
  #offscreen = /* @__PURE__ */ new Map();
  /**
   * Keys of effects that are currently outroing
   * @type {Set<Key>}
   */
  #outroing = /* @__PURE__ */ new Set();
  /**
   * Whether to pause (i.e. outro) on change, or destroy immediately.
   * This is necessary for `<svelte:element>`
   */
  #transition = true;
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(anchor, transition2 = true) {
    this.anchor = anchor;
    this.#transition = transition2;
  }
  #commit = () => {
    var batch = (
      /** @type {Batch} */
      current_batch
    );
    if (!this.#batches.has(batch)) return;
    var key2 = (
      /** @type {Key} */
      this.#batches.get(batch)
    );
    var onscreen = this.#onscreen.get(key2);
    if (onscreen) {
      resume_effect(onscreen);
      this.#outroing.delete(key2);
    } else {
      var offscreen = this.#offscreen.get(key2);
      if (offscreen) {
        this.#onscreen.set(key2, offscreen.effect);
        this.#offscreen.delete(key2);
        offscreen.fragment.lastChild.remove();
        this.anchor.before(offscreen.fragment);
        onscreen = offscreen.effect;
      }
    }
    for (const [b, k] of this.#batches) {
      this.#batches.delete(b);
      if (b === batch) {
        break;
      }
      const offscreen2 = this.#offscreen.get(k);
      if (offscreen2) {
        destroy_effect(offscreen2.effect);
        this.#offscreen.delete(k);
      }
    }
    for (const [k, effect2] of this.#onscreen) {
      if (k === key2 || this.#outroing.has(k)) continue;
      const on_destroy = () => {
        const keys = Array.from(this.#batches.values());
        if (keys.includes(k)) {
          var fragment = document.createDocumentFragment();
          move_effect(effect2, fragment);
          fragment.append(create_text());
          this.#offscreen.set(k, { effect: effect2, fragment });
        } else {
          destroy_effect(effect2);
        }
        this.#outroing.delete(k);
        this.#onscreen.delete(k);
      };
      if (this.#transition || !onscreen) {
        this.#outroing.add(k);
        pause_effect(effect2, on_destroy, false);
      } else {
        on_destroy();
      }
    }
  };
  /**
   * @param {Batch} batch
   */
  #discard = (batch) => {
    this.#batches.delete(batch);
    const keys = Array.from(this.#batches.values());
    for (const [k, branch2] of this.#offscreen) {
      if (!keys.includes(k)) {
        destroy_effect(branch2.effect);
        this.#offscreen.delete(k);
      }
    }
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(key2, fn) {
    var batch = (
      /** @type {Batch} */
      current_batch
    );
    var defer = should_defer_append();
    if (fn && !this.#onscreen.has(key2) && !this.#offscreen.has(key2)) {
      if (defer) {
        var fragment = document.createDocumentFragment();
        var target = create_text();
        fragment.append(target);
        this.#offscreen.set(key2, {
          effect: branch(() => fn(target)),
          fragment
        });
      } else {
        this.#onscreen.set(
          key2,
          branch(() => fn(this.anchor))
        );
      }
    }
    this.#batches.set(batch, key2);
    if (defer) {
      for (const [k, effect2] of this.#onscreen) {
        if (k === key2) {
          batch.unskip_effect(effect2);
        } else {
          batch.skip_effect(effect2);
        }
      }
      for (const [k, branch2] of this.#offscreen) {
        if (k === key2) {
          batch.unskip_effect(branch2.effect);
        } else {
          batch.skip_effect(branch2.effect);
        }
      }
      batch.oncommit(this.#commit);
      batch.ondiscard(this.#discard);
    } else {
      if (hydrating) {
        this.anchor = hydrate_node;
      }
      this.#commit();
    }
  }
};

// node_modules/svelte/src/internal/client/dom/blocks/if.js
function if_block(node, fn, elseif = false) {
  if (hydrating) {
    hydrate_next();
  }
  var branches = new BranchManager(node);
  var flags2 = elseif ? EFFECT_TRANSPARENT : 0;
  function update_branch(key2, fn2) {
    if (hydrating) {
      const data = read_hydration_instruction(node);
      var hydrated_key;
      if (data === HYDRATION_START) {
        hydrated_key = 0;
      } else if (data === HYDRATION_START_ELSE) {
        hydrated_key = false;
      } else {
        hydrated_key = parseInt(data.substring(1));
      }
      if (key2 !== hydrated_key) {
        var anchor = skip_nodes();
        set_hydrate_node(anchor);
        branches.anchor = anchor;
        set_hydrating(false);
        branches.ensure(key2, fn2);
        set_hydrating(true);
        return;
      }
    }
    branches.ensure(key2, fn2);
  }
  block(() => {
    var has_branch = false;
    fn((fn2, key2 = 0) => {
      has_branch = true;
      update_branch(key2, fn2);
    });
    if (!has_branch) {
      update_branch(false, null);
    }
  }, flags2);
}

// node_modules/svelte/src/internal/client/dom/blocks/key.js
var NAN = Symbol("NaN");

// node_modules/svelte/src/internal/client/dom/blocks/each.js
function index(_, i) {
  return i;
}
function pause_effects(state2, to_destroy, controlled_anchor) {
  var transitions = [];
  var length = to_destroy.length;
  var group;
  var remaining = to_destroy.length;
  for (var i = 0; i < length; i++) {
    let effect2 = to_destroy[i];
    pause_effect(
      effect2,
      () => {
        if (group) {
          group.pending.delete(effect2);
          group.done.add(effect2);
          if (group.pending.size === 0) {
            var groups = (
              /** @type {Set<EachOutroGroup>} */
              state2.outrogroups
            );
            destroy_effects(array_from(group.done));
            groups.delete(group);
            if (groups.size === 0) {
              state2.outrogroups = null;
            }
          }
        } else {
          remaining -= 1;
        }
      },
      false
    );
  }
  if (remaining === 0) {
    var fast_path = transitions.length === 0 && controlled_anchor !== null;
    if (fast_path) {
      var anchor = (
        /** @type {Element} */
        controlled_anchor
      );
      var parent_node = (
        /** @type {Element} */
        anchor.parentNode
      );
      clear_text_content(parent_node);
      parent_node.append(anchor);
      state2.items.clear();
    }
    destroy_effects(to_destroy, !fast_path);
  } else {
    group = {
      pending: new Set(to_destroy),
      done: /* @__PURE__ */ new Set()
    };
    (state2.outrogroups ??= /* @__PURE__ */ new Set()).add(group);
  }
}
function destroy_effects(to_destroy, remove_dom = true) {
  for (var i = 0; i < to_destroy.length; i++) {
    destroy_effect(to_destroy[i], remove_dom);
  }
}
var offscreen_anchor;
function each(node, flags2, get_collection, get_key, render_fn, fallback_fn = null) {
  var anchor = node;
  var items = /* @__PURE__ */ new Map();
  var is_controlled = (flags2 & EACH_IS_CONTROLLED) !== 0;
  if (is_controlled) {
    var parent_node = (
      /** @type {Element} */
      node
    );
    anchor = hydrating ? set_hydrate_node(get_first_child(parent_node)) : parent_node.appendChild(create_text());
  }
  if (hydrating) {
    hydrate_next();
  }
  var fallback2 = null;
  var each_array = derived_safe_equal(() => {
    var collection = get_collection();
    return is_array(collection) ? collection : collection == null ? [] : array_from(collection);
  });
  var array;
  var first_run = true;
  function commit() {
    state2.fallback = fallback2;
    reconcile(state2, array, anchor, flags2, get_key);
    if (fallback2 !== null) {
      if (array.length === 0) {
        if ((fallback2.f & EFFECT_OFFSCREEN) === 0) {
          resume_effect(fallback2);
        } else {
          fallback2.f ^= EFFECT_OFFSCREEN;
          move(fallback2, null, anchor);
        }
      } else {
        pause_effect(fallback2, () => {
          fallback2 = null;
        });
      }
    }
  }
  var effect2 = block(() => {
    array = /** @type {V[]} */
    get(each_array);
    var length = array.length;
    let mismatch = false;
    if (hydrating) {
      var is_else = read_hydration_instruction(anchor) === HYDRATION_START_ELSE;
      if (is_else !== (length === 0)) {
        anchor = skip_nodes();
        set_hydrate_node(anchor);
        set_hydrating(false);
        mismatch = true;
      }
    }
    var keys = /* @__PURE__ */ new Set();
    var batch = (
      /** @type {Batch} */
      current_batch
    );
    var defer = should_defer_append();
    for (var index2 = 0; index2 < length; index2 += 1) {
      if (hydrating && hydrate_node.nodeType === COMMENT_NODE && /** @type {Comment} */
      hydrate_node.data === HYDRATION_END) {
        anchor = /** @type {Comment} */
        hydrate_node;
        mismatch = true;
        set_hydrating(false);
      }
      var value = array[index2];
      var key2 = get_key(value, index2);
      if (dev_fallback_default) {
        var key_again = get_key(value, index2);
        if (key2 !== key_again) {
          each_key_volatile(String(index2), String(key2), String(key_again));
        }
      }
      var item = first_run ? null : items.get(key2);
      if (item) {
        if (item.v) internal_set(item.v, value);
        if (item.i) internal_set(item.i, index2);
        if (defer) {
          batch.unskip_effect(item.e);
        }
      } else {
        item = create_item(
          items,
          first_run ? anchor : offscreen_anchor ??= create_text(),
          value,
          key2,
          index2,
          render_fn,
          flags2,
          get_collection
        );
        if (!first_run) {
          item.e.f |= EFFECT_OFFSCREEN;
        }
        items.set(key2, item);
      }
      keys.add(key2);
    }
    if (length === 0 && fallback_fn && !fallback2) {
      if (first_run) {
        fallback2 = branch(() => fallback_fn(anchor));
      } else {
        fallback2 = branch(() => fallback_fn(offscreen_anchor ??= create_text()));
        fallback2.f |= EFFECT_OFFSCREEN;
      }
    }
    if (length > keys.size) {
      if (dev_fallback_default) {
        validate_each_keys(array, get_key);
      } else {
        each_key_duplicate("", "", "");
      }
    }
    if (hydrating && length > 0) {
      set_hydrate_node(skip_nodes());
    }
    if (!first_run) {
      if (defer) {
        for (const [key3, item2] of items) {
          if (!keys.has(key3)) {
            batch.skip_effect(item2.e);
          }
        }
        batch.oncommit(commit);
        batch.ondiscard(() => {
        });
      } else {
        commit();
      }
    }
    if (mismatch) {
      set_hydrating(true);
    }
    get(each_array);
  });
  var state2 = { effect: effect2, flags: flags2, items, outrogroups: null, fallback: fallback2 };
  first_run = false;
  if (hydrating) {
    anchor = hydrate_node;
  }
}
function skip_to_branch(effect2) {
  while (effect2 !== null && (effect2.f & BRANCH_EFFECT) === 0) {
    effect2 = effect2.next;
  }
  return effect2;
}
function reconcile(state2, array, anchor, flags2, get_key) {
  var is_animated = (flags2 & EACH_IS_ANIMATED) !== 0;
  var length = array.length;
  var items = state2.items;
  var current = skip_to_branch(state2.effect.first);
  var seen;
  var prev = null;
  var to_animate;
  var matched = [];
  var stashed = [];
  var value;
  var key2;
  var effect2;
  var i;
  if (is_animated) {
    for (i = 0; i < length; i += 1) {
      value = array[i];
      key2 = get_key(value, i);
      effect2 = /** @type {EachItem} */
      items.get(key2).e;
      if ((effect2.f & EFFECT_OFFSCREEN) === 0) {
        effect2.nodes?.a?.measure();
        (to_animate ??= /* @__PURE__ */ new Set()).add(effect2);
      }
    }
  }
  for (i = 0; i < length; i += 1) {
    value = array[i];
    key2 = get_key(value, i);
    effect2 = /** @type {EachItem} */
    items.get(key2).e;
    if (state2.outrogroups !== null) {
      for (const group of state2.outrogroups) {
        group.pending.delete(effect2);
        group.done.delete(effect2);
      }
    }
    if ((effect2.f & EFFECT_OFFSCREEN) !== 0) {
      effect2.f ^= EFFECT_OFFSCREEN;
      if (effect2 === current) {
        move(effect2, null, anchor);
      } else {
        var next2 = prev ? prev.next : current;
        if (effect2 === state2.effect.last) {
          state2.effect.last = effect2.prev;
        }
        if (effect2.prev) effect2.prev.next = effect2.next;
        if (effect2.next) effect2.next.prev = effect2.prev;
        link(state2, prev, effect2);
        link(state2, effect2, next2);
        move(effect2, next2, anchor);
        prev = effect2;
        matched = [];
        stashed = [];
        current = skip_to_branch(prev.next);
        continue;
      }
    }
    if ((effect2.f & INERT) !== 0) {
      resume_effect(effect2);
      if (is_animated) {
        effect2.nodes?.a?.unfix();
        (to_animate ??= /* @__PURE__ */ new Set()).delete(effect2);
      }
    }
    if (effect2 !== current) {
      if (seen !== void 0 && seen.has(effect2)) {
        if (matched.length < stashed.length) {
          var start = stashed[0];
          var j;
          prev = start.prev;
          var a = matched[0];
          var b = matched[matched.length - 1];
          for (j = 0; j < matched.length; j += 1) {
            move(matched[j], start, anchor);
          }
          for (j = 0; j < stashed.length; j += 1) {
            seen.delete(stashed[j]);
          }
          link(state2, a.prev, b.next);
          link(state2, prev, a);
          link(state2, b, start);
          current = start;
          prev = b;
          i -= 1;
          matched = [];
          stashed = [];
        } else {
          seen.delete(effect2);
          move(effect2, current, anchor);
          link(state2, effect2.prev, effect2.next);
          link(state2, effect2, prev === null ? state2.effect.first : prev.next);
          link(state2, prev, effect2);
          prev = effect2;
        }
        continue;
      }
      matched = [];
      stashed = [];
      while (current !== null && current !== effect2) {
        (seen ??= /* @__PURE__ */ new Set()).add(current);
        stashed.push(current);
        current = skip_to_branch(current.next);
      }
      if (current === null) {
        continue;
      }
    }
    if ((effect2.f & EFFECT_OFFSCREEN) === 0) {
      matched.push(effect2);
    }
    prev = effect2;
    current = skip_to_branch(effect2.next);
  }
  if (state2.outrogroups !== null) {
    for (const group of state2.outrogroups) {
      if (group.pending.size === 0) {
        destroy_effects(array_from(group.done));
        state2.outrogroups?.delete(group);
      }
    }
    if (state2.outrogroups.size === 0) {
      state2.outrogroups = null;
    }
  }
  if (current !== null || seen !== void 0) {
    var to_destroy = [];
    if (seen !== void 0) {
      for (effect2 of seen) {
        if ((effect2.f & INERT) === 0) {
          to_destroy.push(effect2);
        }
      }
    }
    while (current !== null) {
      if ((current.f & INERT) === 0 && current !== state2.fallback) {
        to_destroy.push(current);
      }
      current = skip_to_branch(current.next);
    }
    var destroy_length = to_destroy.length;
    if (destroy_length > 0) {
      var controlled_anchor = (flags2 & EACH_IS_CONTROLLED) !== 0 && length === 0 ? anchor : null;
      if (is_animated) {
        for (i = 0; i < destroy_length; i += 1) {
          to_destroy[i].nodes?.a?.measure();
        }
        for (i = 0; i < destroy_length; i += 1) {
          to_destroy[i].nodes?.a?.fix();
        }
      }
      pause_effects(state2, to_destroy, controlled_anchor);
    }
  }
  if (is_animated) {
    queue_micro_task(() => {
      if (to_animate === void 0) return;
      for (effect2 of to_animate) {
        effect2.nodes?.a?.apply();
      }
    });
  }
}
function create_item(items, anchor, value, key2, index2, render_fn, flags2, get_collection) {
  var v = (flags2 & EACH_ITEM_REACTIVE) !== 0 ? (flags2 & EACH_ITEM_IMMUTABLE) === 0 ? mutable_source(value, false, false) : source(value) : null;
  var i = (flags2 & EACH_INDEX_REACTIVE) !== 0 ? source(index2) : null;
  if (dev_fallback_default && v) {
    v.trace = () => {
      get_collection()[i?.v ?? index2];
    };
  }
  return {
    v,
    i,
    e: branch(() => {
      render_fn(anchor, v ?? value, i ?? index2, get_collection);
      return () => {
        items.delete(key2);
      };
    })
  };
}
function move(effect2, next2, anchor) {
  if (!effect2.nodes) return;
  var node = effect2.nodes.start;
  var end = effect2.nodes.end;
  var dest = next2 && (next2.f & EFFECT_OFFSCREEN) === 0 ? (
    /** @type {EffectNodes} */
    next2.nodes.start
  ) : anchor;
  while (node !== null) {
    var next_node = (
      /** @type {TemplateNode} */
      get_next_sibling(node)
    );
    dest.before(node);
    if (node === end) {
      return;
    }
    node = next_node;
  }
}
function link(state2, prev, next2) {
  if (prev === null) {
    state2.effect.first = next2;
  } else {
    prev.next = next2;
  }
  if (next2 === null) {
    state2.effect.last = prev;
  } else {
    next2.prev = prev;
  }
}
function validate_each_keys(array, key_fn) {
  const keys = /* @__PURE__ */ new Map();
  const length = array.length;
  for (let i = 0; i < length; i++) {
    const key2 = key_fn(array[i], i);
    if (keys.has(key2)) {
      const a = String(keys.get(key2));
      const b = String(i);
      let k = String(key2);
      if (k.startsWith("[object ")) k = null;
      each_key_duplicate(a, b, k);
    }
    keys.set(key2, i);
  }
}

// node_modules/svelte/src/internal/client/dom/css.js
function append_styles(anchor, css) {
  effect(() => {
    var root6 = anchor.getRootNode();
    var target = (
      /** @type {ShadowRoot} */
      root6.host ? (
        /** @type {ShadowRoot} */
        root6
      ) : (
        /** @type {Document} */
        root6.head ?? /** @type {Document} */
        root6.ownerDocument.head
      )
    );
    if (!target.querySelector("#" + css.hash)) {
      const style = create_element("style");
      style.id = css.hash;
      style.textContent = css.code;
      target.appendChild(style);
      if (dev_fallback_default) {
        register_style(css.hash, style);
      }
    }
  });
}

// node_modules/svelte/src/internal/shared/attributes.js
var whitespace = [..." 	\n\r\f\xA0\v\uFEFF"];
function to_class(value, hash2, directives) {
  var classname = value == null ? "" : "" + value;
  if (hash2) {
    classname = classname ? classname + " " + hash2 : hash2;
  }
  if (directives) {
    for (var key2 of Object.keys(directives)) {
      if (directives[key2]) {
        classname = classname ? classname + " " + key2 : key2;
      } else if (classname.length) {
        var len = key2.length;
        var a = 0;
        while ((a = classname.indexOf(key2, a)) >= 0) {
          var b = a + len;
          if ((a === 0 || whitespace.includes(classname[a - 1])) && (b === classname.length || whitespace.includes(classname[b]))) {
            classname = (a === 0 ? "" : classname.substring(0, a)) + classname.substring(b + 1);
          } else {
            a = b;
          }
        }
      }
    }
  }
  return classname === "" ? null : classname;
}
function append_styles2(styles, important = false) {
  var separator = important ? " !important;" : ";";
  var css = "";
  for (var key2 of Object.keys(styles)) {
    var value = styles[key2];
    if (value != null && value !== "") {
      css += " " + key2 + ": " + value + separator;
    }
  }
  return css;
}
function to_css_name(name) {
  if (name[0] !== "-" || name[1] !== "-") {
    return name.toLowerCase();
  }
  return name;
}
function to_style(value, styles) {
  if (styles) {
    var new_style = "";
    var normal_styles;
    var important_styles;
    if (Array.isArray(styles)) {
      normal_styles = styles[0];
      important_styles = styles[1];
    } else {
      normal_styles = styles;
    }
    if (value) {
      value = String(value).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
      var in_str = false;
      var in_apo = 0;
      var in_comment = false;
      var reserved_names = [];
      if (normal_styles) {
        reserved_names.push(...Object.keys(normal_styles).map(to_css_name));
      }
      if (important_styles) {
        reserved_names.push(...Object.keys(important_styles).map(to_css_name));
      }
      var start_index = 0;
      var name_index = -1;
      const len = value.length;
      for (var i = 0; i < len; i++) {
        var c = value[i];
        if (in_comment) {
          if (c === "/" && value[i - 1] === "*") {
            in_comment = false;
          }
        } else if (in_str) {
          if (in_str === c) {
            in_str = false;
          }
        } else if (c === "/" && value[i + 1] === "*") {
          in_comment = true;
        } else if (c === '"' || c === "'") {
          in_str = c;
        } else if (c === "(") {
          in_apo++;
        } else if (c === ")") {
          in_apo--;
        }
        if (!in_comment && in_str === false && in_apo === 0) {
          if (c === ":" && name_index === -1) {
            name_index = i;
          } else if (c === ";" || i === len - 1) {
            if (name_index !== -1) {
              var name = to_css_name(value.substring(start_index, name_index).trim());
              if (!reserved_names.includes(name)) {
                if (c !== ";") {
                  i++;
                }
                var property = value.substring(start_index, i).trim();
                new_style += " " + property + ";";
              }
            }
            start_index = i + 1;
            name_index = -1;
          }
        }
      }
    }
    if (normal_styles) {
      new_style += append_styles2(normal_styles);
    }
    if (important_styles) {
      new_style += append_styles2(important_styles, true);
    }
    new_style = new_style.trim();
    return new_style === "" ? null : new_style;
  }
  return value == null ? null : String(value);
}

// node_modules/svelte/src/internal/client/dom/elements/class.js
function set_class(dom, is_html, value, hash2, prev_classes, next_classes) {
  var prev = dom.__className;
  if (hydrating || prev !== value || prev === void 0) {
    var next_class_name = to_class(value, hash2, next_classes);
    if (!hydrating || next_class_name !== dom.getAttribute("class")) {
      if (next_class_name == null) {
        dom.removeAttribute("class");
      } else if (is_html) {
        dom.className = next_class_name;
      } else {
        dom.setAttribute("class", next_class_name);
      }
    }
    dom.__className = value;
  } else if (next_classes && prev_classes !== next_classes) {
    for (var key2 in next_classes) {
      var is_present = !!next_classes[key2];
      if (prev_classes == null || is_present !== !!prev_classes[key2]) {
        dom.classList.toggle(key2, is_present);
      }
    }
  }
  return next_classes;
}

// node_modules/svelte/src/internal/client/dom/elements/style.js
function update_styles(dom, prev = {}, next2, priority) {
  for (var key2 in next2) {
    var value = next2[key2];
    if (prev[key2] !== value) {
      if (next2[key2] == null) {
        dom.style.removeProperty(key2);
      } else {
        dom.style.setProperty(key2, value, priority);
      }
    }
  }
}
function set_style(dom, value, prev_styles, next_styles) {
  var prev = dom.__style;
  if (hydrating || prev !== value) {
    var next_style_attr = to_style(value, next_styles);
    if (!hydrating || next_style_attr !== dom.getAttribute("style")) {
      if (next_style_attr == null) {
        dom.removeAttribute("style");
      } else {
        dom.style.cssText = next_style_attr;
      }
    }
    dom.__style = value;
  } else if (next_styles) {
    if (Array.isArray(next_styles)) {
      update_styles(dom, prev_styles?.[0], next_styles[0]);
      update_styles(dom, prev_styles?.[1], next_styles[1], "important");
    } else {
      update_styles(dom, prev_styles, next_styles);
    }
  }
  return next_styles;
}

// node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function select_option(select, value, mounting = false) {
  if (select.multiple) {
    if (value == void 0) {
      return;
    }
    if (!is_array(value)) {
      return select_multiple_invalid_value();
    }
    for (var option of select.options) {
      option.selected = value.includes(get_option_value(option));
    }
    return;
  }
  for (option of select.options) {
    var option_value = get_option_value(option);
    if (is(option_value, value)) {
      option.selected = true;
      return;
    }
  }
  if (!mounting || value !== void 0) {
    select.selectedIndex = -1;
  }
}
function init_select(select) {
  var observer = new MutationObserver(() => {
    select_option(select, select.__value);
  });
  observer.observe(select, {
    // Listen to option element changes
    childList: true,
    subtree: true,
    // because of <optgroup>
    // Listen to option element value attribute changes
    // (doesn't get notified of select value changes,
    // because that property is not reflected as an attribute)
    attributes: true,
    attributeFilter: ["value"]
  });
  teardown(() => {
    observer.disconnect();
  });
}
function bind_select_value(select, get3, set2 = get3) {
  var batches2 = /* @__PURE__ */ new WeakSet();
  var mounting = true;
  listen_to_event_and_reset_event(select, "change", (is_reset) => {
    var query = is_reset ? "[selected]" : ":checked";
    var value;
    if (select.multiple) {
      value = [].map.call(select.querySelectorAll(query), get_option_value);
    } else {
      var selected_option = select.querySelector(query) ?? // will fall back to first non-disabled option if no option is selected
      select.querySelector("option:not([disabled])");
      value = selected_option && get_option_value(selected_option);
    }
    set2(value);
    if (current_batch !== null) {
      batches2.add(current_batch);
    }
  });
  effect(() => {
    var value = get3();
    if (select === document.activeElement) {
      var batch = (
        /** @type {Batch} */
        previous_batch ?? current_batch
      );
      if (batches2.has(batch)) {
        return;
      }
    }
    select_option(select, value, mounting);
    if (mounting && value === void 0) {
      var selected_option = select.querySelector(":checked");
      if (selected_option !== null) {
        value = get_option_value(selected_option);
        set2(value);
      }
    }
    select.__value = value;
    mounting = false;
  });
  init_select(select);
}
function get_option_value(option) {
  if ("__value" in option) {
    return option.__value;
  } else {
    return option.value;
  }
}

// node_modules/svelte/src/internal/client/dom/elements/attributes.js
var CLASS = Symbol("class");
var STYLE = Symbol("style");
var IS_CUSTOM_ELEMENT = Symbol("is custom element");
var IS_HTML = Symbol("is html");
var LINK_TAG = IS_XHTML ? "link" : "LINK";
function remove_input_defaults(input) {
  if (!hydrating) return;
  var already_removed = false;
  var remove_defaults = () => {
    if (already_removed) return;
    already_removed = true;
    if (input.hasAttribute("value")) {
      var value = input.value;
      set_attribute2(input, "value", null);
      input.value = value;
    }
    if (input.hasAttribute("checked")) {
      var checked = input.checked;
      set_attribute2(input, "checked", null);
      input.checked = checked;
    }
  };
  input.__on_r = remove_defaults;
  queue_micro_task(remove_defaults);
  add_form_reset_listener();
}
function set_checked(element2, checked) {
  var attributes = get_attributes(element2);
  if (attributes.checked === (attributes.checked = // treat null and undefined the same for the initial value
  checked ?? void 0)) {
    return;
  }
  element2.checked = checked;
}
function set_attribute2(element2, attribute, value, skip_warning) {
  var attributes = get_attributes(element2);
  if (hydrating) {
    attributes[attribute] = element2.getAttribute(attribute);
    if (attribute === "src" || attribute === "srcset" || attribute === "href" && element2.nodeName === LINK_TAG) {
      if (!skip_warning) {
        check_src_in_dev_hydration(element2, attribute, value ?? "");
      }
      return;
    }
  }
  if (attributes[attribute] === (attributes[attribute] = value)) return;
  if (attribute === "loading") {
    element2[LOADING_ATTR_SYMBOL] = value;
  }
  if (value == null) {
    element2.removeAttribute(attribute);
  } else if (typeof value !== "string" && get_setters(element2).includes(attribute)) {
    element2[attribute] = value;
  } else {
    element2.setAttribute(attribute, value);
  }
}
function get_attributes(element2) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    element2.__attributes ??= {
      [IS_CUSTOM_ELEMENT]: element2.nodeName.includes("-"),
      [IS_HTML]: element2.namespaceURI === NAMESPACE_HTML
    }
  );
}
var setters_cache = /* @__PURE__ */ new Map();
function get_setters(element2) {
  var cache_key = element2.getAttribute("is") || element2.nodeName;
  var setters = setters_cache.get(cache_key);
  if (setters) return setters;
  setters_cache.set(cache_key, setters = []);
  var descriptors;
  var proto = element2;
  var element_proto = Element.prototype;
  while (element_proto !== proto) {
    descriptors = get_descriptors(proto);
    for (var key2 in descriptors) {
      if (descriptors[key2].set) {
        setters.push(key2);
      }
    }
    proto = get_prototype_of(proto);
  }
  return setters;
}
function check_src_in_dev_hydration(element2, attribute, value) {
  if (!dev_fallback_default) return;
  if (attribute === "srcset" && srcset_url_equal(element2, value)) return;
  if (src_url_equal(element2.getAttribute(attribute) ?? "", value)) return;
  hydration_attribute_changed(
    attribute,
    element2.outerHTML.replace(element2.innerHTML, element2.innerHTML && "..."),
    String(value)
  );
}
function src_url_equal(element_src, url) {
  if (element_src === url) return true;
  return new URL(element_src, document.baseURI).href === new URL(url, document.baseURI).href;
}
function split_srcset(srcset) {
  return srcset.split(",").map((src) => src.trim().split(" ").filter(Boolean));
}
function srcset_url_equal(element2, srcset) {
  var element_urls = split_srcset(element2.srcset);
  var urls = split_srcset(srcset);
  return urls.length === element_urls.length && urls.every(
    ([url, width], i) => width === element_urls[i][1] && // We need to test both ways because Vite will create an a full URL with
    // `new URL(asset, import.meta.url).href` for the client when `base: './'`, and the
    // relative URLs inside srcset are not automatically resolved to absolute URLs by
    // browsers (in contrast to img.src). This means both SSR and DOM code could
    // contain relative or absolute URLs.
    (src_url_equal(element_urls[i][0], url) || src_url_equal(url, element_urls[i][0]))
  );
}

// node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function bind_value(input, get3, set2 = get3) {
  var batches2 = /* @__PURE__ */ new WeakSet();
  listen_to_event_and_reset_event(input, "input", async (is_reset) => {
    if (dev_fallback_default && input.type === "checkbox") {
      bind_invalid_checkbox_value();
    }
    var value = is_reset ? input.defaultValue : input.value;
    value = is_numberlike_input(input) ? to_number(value) : value;
    set2(value);
    if (current_batch !== null) {
      batches2.add(current_batch);
    }
    await tick();
    if (value !== (value = get3())) {
      var start = input.selectionStart;
      var end = input.selectionEnd;
      var length = input.value.length;
      input.value = value ?? "";
      if (end !== null) {
        var new_length = input.value.length;
        if (start === end && end === length && new_length > length) {
          input.selectionStart = new_length;
          input.selectionEnd = new_length;
        } else {
          input.selectionStart = start;
          input.selectionEnd = Math.min(end, new_length);
        }
      }
    }
  });
  if (
    // If we are hydrating and the value has since changed,
    // then use the updated value from the input instead.
    hydrating && input.defaultValue !== input.value || // If defaultValue is set, then value == defaultValue
    // TODO Svelte 6: remove input.value check and set to empty string?
    untrack(get3) == null && input.value
  ) {
    set2(is_numberlike_input(input) ? to_number(input.value) : input.value);
    if (current_batch !== null) {
      batches2.add(current_batch);
    }
  }
  render_effect(() => {
    if (dev_fallback_default && input.type === "checkbox") {
      bind_invalid_checkbox_value();
    }
    var value = get3();
    if (input === document.activeElement) {
      var batch = (
        /** @type {Batch} */
        previous_batch ?? current_batch
      );
      if (batches2.has(batch)) {
        return;
      }
    }
    if (is_numberlike_input(input) && value === to_number(input.value)) {
      return;
    }
    if (input.type === "date" && !value && !input.value) {
      return;
    }
    if (value !== input.value) {
      input.value = value ?? "";
    }
  });
}
function is_numberlike_input(input) {
  var type = input.type;
  return type === "number" || type === "range";
}
function to_number(value) {
  return value === "" ? null : +value;
}

// node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function is_bound_this(bound_value, element_or_component) {
  return bound_value === element_or_component || bound_value?.[STATE_SYMBOL] === element_or_component;
}
function bind_this(element_or_component = {}, update2, get_value, get_parts) {
  effect(() => {
    var old_parts;
    var parts;
    render_effect(() => {
      old_parts = parts;
      parts = get_parts?.() || [];
      untrack(() => {
        if (element_or_component !== get_value(...parts)) {
          update2(element_or_component, ...parts);
          if (old_parts && is_bound_this(get_value(...old_parts), element_or_component)) {
            update2(null, ...old_parts);
          }
        }
      });
    });
    return () => {
      queue_micro_task(() => {
        if (parts && is_bound_this(get_value(...parts), element_or_component)) {
          update2(null, ...parts);
        }
      });
    };
  });
  return element_or_component;
}

// node_modules/svelte/src/internal/client/reactivity/store.js
var is_store_binding = false;
var IS_UNMOUNTED = Symbol();
function capture_store_binding(fn) {
  var previous_is_store_binding = is_store_binding;
  try {
    is_store_binding = false;
    return [fn(), is_store_binding];
  } finally {
    is_store_binding = previous_is_store_binding;
  }
}

// node_modules/svelte/src/internal/client/reactivity/props.js
function prop(props, key2, flags2, fallback2) {
  var runes = !legacy_mode_flag || (flags2 & PROPS_IS_RUNES) !== 0;
  var bindable = (flags2 & PROPS_IS_BINDABLE) !== 0;
  var lazy = (flags2 & PROPS_IS_LAZY_INITIAL) !== 0;
  var fallback_value = (
    /** @type {V} */
    fallback2
  );
  var fallback_dirty = true;
  var get_fallback = () => {
    if (fallback_dirty) {
      fallback_dirty = false;
      fallback_value = lazy ? untrack(
        /** @type {() => V} */
        fallback2
      ) : (
        /** @type {V} */
        fallback2
      );
    }
    return fallback_value;
  };
  var setter;
  if (bindable) {
    var is_entry_props = STATE_SYMBOL in props || LEGACY_PROPS in props;
    setter = get_descriptor(props, key2)?.set ?? (is_entry_props && key2 in props ? (v) => props[key2] = v : void 0);
  }
  var initial_value;
  var is_store_sub = false;
  if (bindable) {
    [initial_value, is_store_sub] = capture_store_binding(() => (
      /** @type {V} */
      props[key2]
    ));
  } else {
    initial_value = /** @type {V} */
    props[key2];
  }
  if (initial_value === void 0 && fallback2 !== void 0) {
    initial_value = get_fallback();
    if (setter) {
      if (runes) props_invalid_value(key2);
      setter(initial_value);
    }
  }
  var getter;
  if (runes) {
    getter = () => {
      var value = (
        /** @type {V} */
        props[key2]
      );
      if (value === void 0) return get_fallback();
      fallback_dirty = true;
      return value;
    };
  } else {
    getter = () => {
      var value = (
        /** @type {V} */
        props[key2]
      );
      if (value !== void 0) {
        fallback_value = /** @type {V} */
        void 0;
      }
      return value === void 0 ? fallback_value : value;
    };
  }
  if (runes && (flags2 & PROPS_IS_UPDATED) === 0) {
    return getter;
  }
  if (setter) {
    var legacy_parent = props.$$legacy;
    return (
      /** @type {() => V} */
      (function(value, mutation) {
        if (arguments.length > 0) {
          if (!runes || !mutation || legacy_parent || is_store_sub) {
            setter(mutation ? getter() : value);
          }
          return value;
        }
        return getter();
      })
    );
  }
  var overridden = false;
  var d = ((flags2 & PROPS_IS_IMMUTABLE) !== 0 ? derived : derived_safe_equal)(() => {
    overridden = false;
    return getter();
  });
  if (dev_fallback_default) {
    d.label = key2;
  }
  if (bindable) get(d);
  var parent_effect = (
    /** @type {Effect} */
    active_effect
  );
  return (
    /** @type {() => V} */
    (function(value, mutation) {
      if (arguments.length > 0) {
        const new_value = mutation ? get(d) : runes && bindable ? proxy(value) : value;
        set(d, new_value);
        overridden = true;
        if (fallback_value !== void 0) {
          fallback_value = new_value;
        }
        return value;
      }
      if (is_destroying_effect && overridden || (parent_effect.f & DESTROYED) !== 0) {
        return d.v;
      }
      return get(d);
    })
  );
}

// node_modules/svelte/src/legacy/legacy-client.js
function createClassComponent(options) {
  return new Svelte4Component(options);
}
var Svelte4Component = class {
  /** @type {any} */
  #events;
  /** @type {Record<string, any>} */
  #instance;
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(options) {
    var sources = /* @__PURE__ */ new Map();
    var add_source = (key2, value) => {
      var s = mutable_source(value, false, false);
      sources.set(key2, s);
      return s;
    };
    const props = new Proxy(
      { ...options.props || {}, $$events: {} },
      {
        get(target, prop2) {
          return get(sources.get(prop2) ?? add_source(prop2, Reflect.get(target, prop2)));
        },
        has(target, prop2) {
          if (prop2 === LEGACY_PROPS) return true;
          get(sources.get(prop2) ?? add_source(prop2, Reflect.get(target, prop2)));
          return Reflect.has(target, prop2);
        },
        set(target, prop2, value) {
          set(sources.get(prop2) ?? add_source(prop2, value), value);
          return Reflect.set(target, prop2, value);
        }
      }
    );
    this.#instance = (options.hydrate ? hydrate : mount)(options.component, {
      target: options.target,
      anchor: options.anchor,
      props,
      context: options.context,
      intro: options.intro ?? false,
      recover: options.recover,
      transformError: options.transformError
    });
    if (!async_mode_flag && (!options?.props?.$$host || options.sync === false)) {
      flushSync();
    }
    this.#events = props.$$events;
    for (const key2 of Object.keys(this.#instance)) {
      if (key2 === "$set" || key2 === "$destroy" || key2 === "$on") continue;
      define_property(this, key2, {
        get() {
          return this.#instance[key2];
        },
        /** @param {any} value */
        set(value) {
          this.#instance[key2] = value;
        },
        enumerable: true
      });
    }
    this.#instance.$set = /** @param {Record<string, any>} next */
    (next2) => {
      Object.assign(props, next2);
    };
    this.#instance.$destroy = () => {
      unmount(this.#instance);
    };
  }
  /** @param {Record<string, any>} props */
  $set(props) {
    this.#instance.$set(props);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(event2, callback) {
    this.#events[event2] = this.#events[event2] || [];
    const cb = (...args) => callback.call(this, ...args);
    this.#events[event2].push(cb);
    return () => {
      this.#events[event2] = this.#events[event2].filter(
        /** @param {any} fn */
        (fn) => fn !== cb
      );
    };
  }
  $destroy() {
    this.#instance.$destroy();
  }
};

// node_modules/svelte/src/internal/client/dom/elements/custom-element.js
var SvelteElement;
if (typeof HTMLElement === "function") {
  SvelteElement = class extends HTMLElement {
    /** The Svelte component constructor */
    $$ctor;
    /** Slots */
    $$s;
    /** @type {any} The Svelte component instance */
    $$c;
    /** Whether or not the custom element is connected */
    $$cn = false;
    /** @type {Record<string, any>} Component props data */
    $$d = {};
    /** `true` if currently in the process of reflecting component props back to attributes */
    $$r = false;
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    $$p_d = {};
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    $$l = {};
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    $$l_u = /* @__PURE__ */ new Map();
    /** @type {any} The managed render effect for reflecting attributes */
    $$me;
    /** @type {ShadowRoot | null} The ShadowRoot of the custom element */
    $$shadowRoot = null;
    /**
     * @param {*} $$componentCtor
     * @param {*} $$slots
     * @param {ShadowRootInit | undefined} shadow_root_init
     */
    constructor($$componentCtor, $$slots, shadow_root_init) {
      super();
      this.$$ctor = $$componentCtor;
      this.$$s = $$slots;
      if (shadow_root_init) {
        this.$$shadowRoot = this.attachShadow(shadow_root_init);
      }
    }
    /**
     * @param {string} type
     * @param {EventListenerOrEventListenerObject} listener
     * @param {boolean | AddEventListenerOptions} [options]
     */
    addEventListener(type, listener, options) {
      this.$$l[type] = this.$$l[type] || [];
      this.$$l[type].push(listener);
      if (this.$$c) {
        const unsub = this.$$c.$on(type, listener);
        this.$$l_u.set(listener, unsub);
      }
      super.addEventListener(type, listener, options);
    }
    /**
     * @param {string} type
     * @param {EventListenerOrEventListenerObject} listener
     * @param {boolean | AddEventListenerOptions} [options]
     */
    removeEventListener(type, listener, options) {
      super.removeEventListener(type, listener, options);
      if (this.$$c) {
        const unsub = this.$$l_u.get(listener);
        if (unsub) {
          unsub();
          this.$$l_u.delete(listener);
        }
      }
    }
    async connectedCallback() {
      this.$$cn = true;
      if (!this.$$c) {
        let create_slot = function(name) {
          return (anchor) => {
            const slot2 = create_element("slot");
            if (name !== "default") slot2.name = name;
            append(anchor, slot2);
          };
        };
        await Promise.resolve();
        if (!this.$$cn || this.$$c) {
          return;
        }
        const $$slots = {};
        const existing_slots = get_custom_elements_slots(this);
        for (const name of this.$$s) {
          if (name in existing_slots) {
            if (name === "default" && !this.$$d.children) {
              this.$$d.children = create_slot(name);
              $$slots.default = true;
            } else {
              $$slots[name] = create_slot(name);
            }
          }
        }
        for (const attribute of this.attributes) {
          const name = this.$$g_p(attribute.name);
          if (!(name in this.$$d)) {
            this.$$d[name] = get_custom_element_value(name, attribute.value, this.$$p_d, "toProp");
          }
        }
        for (const key2 in this.$$p_d) {
          if (!(key2 in this.$$d) && this[key2] !== void 0) {
            this.$$d[key2] = this[key2];
            delete this[key2];
          }
        }
        this.$$c = createClassComponent({
          component: this.$$ctor,
          target: this.$$shadowRoot || this,
          props: {
            ...this.$$d,
            $$slots,
            $$host: this
          }
        });
        this.$$me = effect_root(() => {
          render_effect(() => {
            this.$$r = true;
            for (const key2 of object_keys(this.$$c)) {
              if (!this.$$p_d[key2]?.reflect) continue;
              this.$$d[key2] = this.$$c[key2];
              const attribute_value = get_custom_element_value(
                key2,
                this.$$d[key2],
                this.$$p_d,
                "toAttribute"
              );
              if (attribute_value == null) {
                this.removeAttribute(this.$$p_d[key2].attribute || key2);
              } else {
                this.setAttribute(this.$$p_d[key2].attribute || key2, attribute_value);
              }
            }
            this.$$r = false;
          });
        });
        for (const type in this.$$l) {
          for (const listener of this.$$l[type]) {
            const unsub = this.$$c.$on(type, listener);
            this.$$l_u.set(listener, unsub);
          }
        }
        this.$$l = {};
      }
    }
    // We don't need this when working within Svelte code, but for compatibility of people using this outside of Svelte
    // and setting attributes through setAttribute etc, this is helpful
    /**
     * @param {string} attr
     * @param {string} _oldValue
     * @param {string} newValue
     */
    attributeChangedCallback(attr2, _oldValue, newValue) {
      if (this.$$r) return;
      attr2 = this.$$g_p(attr2);
      this.$$d[attr2] = get_custom_element_value(attr2, newValue, this.$$p_d, "toProp");
      this.$$c?.$set({ [attr2]: this.$$d[attr2] });
    }
    disconnectedCallback() {
      this.$$cn = false;
      Promise.resolve().then(() => {
        if (!this.$$cn && this.$$c) {
          this.$$c.$destroy();
          this.$$me();
          this.$$c = void 0;
        }
      });
    }
    /**
     * @param {string} attribute_name
     */
    $$g_p(attribute_name) {
      return object_keys(this.$$p_d).find(
        (key2) => this.$$p_d[key2].attribute === attribute_name || !this.$$p_d[key2].attribute && key2.toLowerCase() === attribute_name
      ) || attribute_name;
    }
  };
}
function get_custom_element_value(prop2, value, props_definition, transform) {
  const type = props_definition[prop2]?.type;
  value = type === "Boolean" && typeof value !== "boolean" ? value != null : value;
  if (!transform || !props_definition[prop2]) {
    return value;
  } else if (transform === "toAttribute") {
    switch (type) {
      case "Object":
      case "Array":
        return value == null ? null : JSON.stringify(value);
      case "Boolean":
        return value ? "" : null;
      case "Number":
        return value == null ? null : value;
      default:
        return value;
    }
  } else {
    switch (type) {
      case "Object":
      case "Array":
        return value && JSON.parse(value);
      case "Boolean":
        return value;
      // conversion already handled above
      case "Number":
        return value != null ? +value : value;
      default:
        return value;
    }
  }
}
function get_custom_elements_slots(element2) {
  const result = {};
  element2.childNodes.forEach((node) => {
    result[
      /** @type {Element} node */
      node.slot || "default"
    ] = true;
  });
  return result;
}

// node_modules/svelte/src/index-client.js
if (dev_fallback_default) {
  let throw_rune_error = function(rune) {
    if (!(rune in globalThis)) {
      let value;
      Object.defineProperty(globalThis, rune, {
        configurable: true,
        // eslint-disable-next-line getter-return
        get: () => {
          if (value !== void 0) {
            return value;
          }
          rune_outside_svelte(rune);
        },
        set: (v) => {
          value = v;
        }
      });
    }
  };
  throw_rune_error("$state");
  throw_rune_error("$effect");
  throw_rune_error("$derived");
  throw_rune_error("$inspect");
  throw_rune_error("$props");
  throw_rune_error("$bindable");
}
function onMount(fn) {
  if (component_context === null) {
    lifecycle_outside_component("onMount");
  }
  if (legacy_mode_flag && component_context.l !== null) {
    init_update_callbacks(component_context).m.push(fn);
  } else {
    user_effect(() => {
      const cleanup = untrack(fn);
      if (typeof cleanup === "function") return (
        /** @type {() => void} */
        cleanup
      );
    });
  }
}
function init_update_callbacks(context) {
  var l = (
    /** @type {ComponentContextLegacy} */
    context.l
  );
  return l.u ??= { a: [], b: [], m: [] };
}

// node_modules/svelte/src/version.js
var PUBLIC_VERSION = "5";

// node_modules/svelte/src/internal/disclose-version.js
if (typeof window !== "undefined") {
  ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(PUBLIC_VERSION);
}

// state.svelte.ts
var import_obsidian2 = require("obsidian");

// vault-scanner.ts
var import_obsidian = require("obsidian");
var CHECKBOX_RE = /^\s*[-*+]\s*\[(.)\]\s*/;
var LIST_ITEM_RE = /^\s*[-*+]\s+/;
var DEFAULT_EMOJI_MAP = {
  school: "\u{1F393}",
  programming: "\u{1F4BB}",
  personal: "\u{1F3E0}",
  apps: "\u{1F4F1}",
  learning: "\u{1F4DA}",
  work: "\u{1F4BC}",
  tech: "\u2699\uFE0F",
  health: "\u{1F4AA}",
  finance: "\u{1F4B0}"
};
function makeId() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36);
}
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function validTagRegex(tagPrefix) {
  return new RegExp(`^${escapeRegex(tagPrefix)}(?:\\/[\\w-]+)*$`);
}
function extractTag(line, tagPrefix) {
  const raw = line.match(new RegExp(`${escapeRegex(tagPrefix)}(?:\\/[\\w-]+)*`, "g")) ?? [];
  const validator = validTagRegex(tagPrefix);
  return raw.find((tag2) => validator.test(tag2));
}
function parseTagParts(tag2, tagPrefix) {
  return tag2.slice(tagPrefix.length).split("/").filter(Boolean);
}
function parseCompleted(line) {
  const match = line.match(CHECKBOX_RE);
  if (!match) return { completed: false };
  const mark = match[1].toLowerCase();
  if (mark !== "x" && mark !== "-") return { completed: false };
  const doneDateMatch = line.match(/✅\s*(\d{4}-\d{2}-\d{2})/);
  return {
    completed: true,
    completedAt: doneDateMatch?.[1]
  };
}
function parseTaskTitle(line, tagPrefix) {
  return line.replace(CHECKBOX_RE, "").replace(LIST_ITEM_RE, "").replace(new RegExp(`${escapeRegex(tagPrefix)}(?:\\/[\\w-]+)*`, "g"), "").replace(/✅\s*\d{4}-\d{2}-\d{2}/g, "").replace(/📅\s*\d{4}-\d{2}-\d{2}/g, "").replace(/[⏫🔺🔼🔽]/g, "").replace(/\[\[([^\]]+)\]\]/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\s+/g, " ").trim();
}
function displayNameFromSlug(value) {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
async function scanSingleFile(app, settings, file) {
  const tagPrefix = settings.tagPrefix || "#todo";
  const content = await app.vault.cachedRead(file);
  const lines = content.split(/\r?\n/);
  const groupsByKey = /* @__PURE__ */ new Map();
  const categoriesByKey = /* @__PURE__ */ new Map();
  const tasks2 = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || !trimmed.includes(tagPrefix)) continue;
    const hasCheckbox = CHECKBOX_RE.test(trimmed);
    const isPlainListItem = /^[-*+]\s+#/.test(trimmed);
    if (!hasCheckbox && !isPlainListItem) continue;
    const tag2 = extractTag(trimmed, tagPrefix);
    if (!tag2) continue;
    const title = parseTaskTitle(trimmed, tagPrefix);
    if (!title) continue;
    const parts = parseTagParts(tag2, tagPrefix);
    const groupKey = parts[0]?.toLowerCase();
    const categoryKey = parts[1]?.toLowerCase();
    let groupId;
    if (groupKey) {
      let group = groupsByKey.get(groupKey);
      if (!group) {
        group = {
          id: makeId(),
          name: displayNameFromSlug(parts[0]),
          sortOrder: groupsByKey.size,
          collapsed: settings.archivedGroups.includes(groupKey),
          archived: settings.archivedGroups.includes(groupKey),
          sourceGroupKey: groupKey
        };
        groupsByKey.set(groupKey, group);
      }
      groupId = group.id;
    }
    let categoryId;
    if (groupKey && categoryKey) {
      const catMapKey = `${groupKey}/${categoryKey}`;
      let category = categoriesByKey.get(catMapKey);
      if (!category) {
        const groupLocalCategoryCount = [...categoriesByKey.values()].filter((c) => c.sourceGroupKey === groupKey).length;
        category = {
          id: makeId(),
          name: displayNameFromSlug(parts[1]),
          emoji: DEFAULT_EMOJI_MAP[categoryKey],
          sortOrder: groupLocalCategoryCount,
          groupId,
          sourceGroupKey: groupKey,
          sourceCategoryKey: categoryKey
        };
        categoriesByKey.set(catMapKey, category);
      }
      categoryId = category.id;
    }
    const completion = parseCompleted(trimmed);
    const createdAt = file.stat?.ctime ? new Date(file.stat.ctime).toISOString() : (/* @__PURE__ */ new Date()).toISOString();
    const updatedAt = file.stat?.mtime ? new Date(file.stat.mtime).toISOString() : createdAt;
    tasks2.push({
      id: makeId(),
      title,
      completed: completion.completed,
      createdAt,
      updatedAt,
      completedAt: completion.completedAt ? `${completion.completedAt}T00:00:00.000Z` : void 0,
      sortOrder: tasks2.length,
      categoryId,
      source: `obsidian:${file.path}`,
      sourceTag: tag2,
      sourceFile: file.path,
      sourceLine: i + 1,
      groupTag: !categoryId && groupKey ? groupKey : void 0,
      subTag: parts.length >= 3 ? parts.slice(2).join("/") : void 0
    });
  }
  return {
    tasks: tasks2,
    categories: [...categoriesByKey.values()].sort((a, b) => a.sortOrder - b.sortOrder),
    categoryGroups: [...groupsByKey.values()].sort((a, b) => a.sortOrder - b.sortOrder)
  };
}
function combineScanResults(scans) {
  const groupsByKey = /* @__PURE__ */ new Map();
  const categoriesByKey = /* @__PURE__ */ new Map();
  const tasks2 = [];
  for (const scan of scans) {
    const localGroupIdToGlobalId = /* @__PURE__ */ new Map();
    for (const group of [...scan.categoryGroups].sort((a, b) => a.sortOrder - b.sortOrder)) {
      const groupKey = group.sourceGroupKey ?? group.name.toLowerCase();
      let existing = groupsByKey.get(groupKey);
      if (!existing) {
        existing = {
          ...group,
          id: group.id ?? makeId(),
          sortOrder: groupsByKey.size
        };
        groupsByKey.set(groupKey, existing);
      }
      localGroupIdToGlobalId.set(group.id, existing.id);
    }
    const localCategoryIdToGlobalId = /* @__PURE__ */ new Map();
    for (const category of [...scan.categories].sort((a, b) => a.sortOrder - b.sortOrder)) {
      const categoryKey = `${category.sourceGroupKey ?? ""}/${category.sourceCategoryKey ?? category.name.toLowerCase()}`;
      let existing = categoriesByKey.get(categoryKey);
      if (!existing) {
        existing = {
          ...category,
          id: category.id ?? makeId(),
          groupId: category.groupId ? localGroupIdToGlobalId.get(category.groupId) ?? category.groupId : void 0,
          sortOrder: categoriesByKey.size
        };
        categoriesByKey.set(categoryKey, existing);
      }
      localCategoryIdToGlobalId.set(category.id, existing.id);
    }
    for (const task of [...scan.tasks].sort((a, b) => a.sortOrder - b.sortOrder)) {
      tasks2.push({
        ...task,
        categoryId: task.categoryId ? localCategoryIdToGlobalId.get(task.categoryId) ?? task.categoryId : void 0,
        sortOrder: tasks2.length
      });
    }
  }
  return {
    tasks: tasks2,
    categories: [...categoriesByKey.values()],
    categoryGroups: [...groupsByKey.values()]
  };
}

// vault-writer.ts
function todayDate() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function splitLines(content) {
  return content.split(/\r?\n/);
}
function joinLines(lines) {
  return lines.join("\n");
}
function normalizeCheckPrefix(line, checked) {
  if (/^\s*[-*+]\s*\[[ xX-]\]/.test(line)) {
    return line.replace(/^(\s*[-*+]\s*)\[[ xX-]\]/, `$1[${checked ? "x" : " "}]`);
  }
  if (/^\s*[-*+]\s+/.test(line)) {
    return line.replace(/^(\s*[-*+]\s+)/, `$1[${checked ? "x" : " "}] `);
  }
  return `- [${checked ? "x" : " "}] ${line}`;
}
function addCompletionDate(line) {
  const withoutOld = line.replace(/\s*✅\s*\d{4}-\d{2}-\d{2}/g, "");
  return `${withoutOld} \u2705 ${todayDate()}`;
}
function removeCompletionDate(line) {
  return line.replace(/\s*✅\s*\d{4}-\d{2}-\d{2}/g, "");
}
function ensureMdExtension(path) {
  return path.endsWith(".md") ? path : `${path}.md`;
}
function buildTagForCategory(categoryId, categories2, tagPrefix) {
  if (!categoryId) return tagPrefix;
  const category = categories2.find((c) => c.id === categoryId);
  if (!category) return tagPrefix;
  const group = category.sourceGroupKey;
  const cat = category.sourceCategoryKey;
  if (group && cat) return `${tagPrefix}/${group}/${cat}`;
  if (group) return `${tagPrefix}/${group}`;
  return tagPrefix;
}
async function getFileOrCreate(app, path) {
  const normalized = ensureMdExtension(path);
  const existing = app.vault.getFileByPath(normalized);
  if (existing) return existing;
  const parts = normalized.split("/");
  if (parts.length > 1) {
    const folders = parts.slice(0, -1);
    let current = "";
    for (const folder of folders) {
      current = current ? `${current}/${folder}` : folder;
      if (!app.vault.getAbstractFileByPath(current)) {
        await app.vault.createFolder(current);
      }
    }
  }
  return app.vault.create(normalized, "");
}
var VaultTodoWriter = class {
  constructor(app, settings, getCategories) {
    this.app = app;
    this.settings = settings;
    this.getCategories = getCategories;
  }
  async toggleComplete(task, completed) {
    return this.updateLine(task, (line) => {
      let next2 = normalizeCheckPrefix(line, completed);
      next2 = completed ? addCompletionDate(next2) : removeCompletionDate(next2);
      return next2;
    });
  }
  async deleteTask(task) {
    return this.updateFile(task.sourceFile, task.sourceLine, (lines, idx) => {
      lines.splice(idx, 1);
      return lines;
    });
  }
  async editTaskTitle(task, title) {
    const trimmed = title.trim();
    if (!trimmed) return false;
    return this.updateLine(task, (line) => {
      const tagMatch = line.match(/#todo(?:\/[\w-]+)*/);
      const tag2 = tagMatch?.[0] ?? this.settings.tagPrefix;
      const checked = /^\s*[-*+]\s*\[[xX-]\]/.test(line);
      const base = `- [${checked ? "x" : " "}] ${tag2} ${trimmed}`;
      const completion = line.match(/✅\s*\d{4}-\d{2}-\d{2}/)?.[0];
      return completion && checked ? `${base} ${completion}` : base;
    });
  }
  async addTask(input) {
    const title = input.title.trim();
    if (!title) return false;
    const file = await getFileOrCreate(this.app, this.settings.inboxFile);
    const content = await this.app.vault.cachedRead(file);
    const lines = splitLines(content);
    let tag2 = buildTagForCategory(input.categoryId, this.getCategories(), this.settings.tagPrefix);
    if (input.subTag) tag2 = `${tag2}/${input.subTag.replace(/\s+/g, "-").toLowerCase()}`;
    const line = `- [ ] ${tag2} ${title}`.trim();
    lines.push(line);
    await this.app.vault.modify(file, joinLines(lines.filter((_, i) => !(lines.length === 1 && lines[0] === ""))));
    return true;
  }
  /** Change a task's subtag within its category. e.g., blog → ebook rewrites #todo/personal/social/blog → #todo/personal/social/ebook */
  async changeSubTag(task, newSubTag) {
    return this.updateLine(task, (line) => {
      const tagMatch = line.match(/#todo(?:\/[\w-]+)*/);
      if (!tagMatch) return line;
      const oldTag = tagMatch[0];
      const parts = oldTag.replace(this.settings.tagPrefix, "").split("/").filter(Boolean);
      const base = parts.length >= 2 ? `${this.settings.tagPrefix}/${parts[0]}/${parts[1]}` : oldTag;
      const newTag = newSubTag ? `${base}/${newSubTag}` : base;
      return line.replace(oldTag, newTag);
    });
  }
  async updateLine(task, transform) {
    if (!task.sourceFile || !task.sourceLine) return false;
    return this.updateFile(task.sourceFile, task.sourceLine, (lines, idx) => {
      lines[idx] = transform(lines[idx] ?? "");
      return lines;
    });
  }
  async updateFile(path, lineNo, mutate2) {
    if (!path || !lineNo) return false;
    const file = this.app.vault.getFileByPath(path);
    if (!file) return false;
    const content = await this.app.vault.cachedRead(file);
    const lines = splitLines(content);
    const idx = lineNo - 1;
    if (idx < 0 || idx >= lines.length) return false;
    const next2 = mutate2(lines, idx);
    await this.app.vault.modify(file, joinLines(next2));
    return true;
  }
};

// state.svelte.ts
function makeId2() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36);
}
var tasks = proxy([]);
var categories = proxy([]);
var categoryGroups = proxy([]);
var ui = proxy({ loading: false, lastScanAt: null, errorMessage: null });
var nav = proxy({ view: "dashboard" });
var pluginRef = null;
var writerRef = null;
var initialized = false;
var refreshTimer = null;
var scanQueue = Promise.resolve();
var fileScanCache = /* @__PURE__ */ new Map();
var queuedChangedPaths = /* @__PURE__ */ new Set();
var queuedDeletedPaths = /* @__PURE__ */ new Set();
var categoriesByGroupValue = user_derived(() => {
  const groups = [...categoryGroups].sort((a, b) => a.sortOrder - b.sortOrder);
  const cats = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  return groups.map((group) => ({
    group,
    categories: cats.filter((category) => category.groupId === group.id)
  }));
});
var ungroupedCategoriesValue = user_derived(() => {
  const groupIds = new Set(categoryGroups.map((group) => group.id));
  return [...categories].filter((category) => !category.groupId || !groupIds.has(category.groupId)).sort((a, b) => a.sortOrder - b.sortOrder);
});
var visibleTasksValue = user_derived(() => {
  const showCompleted = pluginRef?.settings.showCompleted ?? true;
  let list = [...tasks].sort((a, b) => a.sortOrder - b.sortOrder);
  if (nav.uncategorizedOnly) {
    list = list.filter((task) => !task.categoryId);
  } else if (nav.categoryId) list = list.filter((task) => task.categoryId === nav.categoryId);
  else if (nav.groupId) {
    const group = categoryGroups.find((g) => g.id === nav.groupId);
    const groupKey = group?.sourceGroupKey?.toLowerCase();
    const catIds = new Set(categories.filter((c) => c.groupId === nav.groupId).map((c) => c.id));
    list = list.filter((task) => catIds.has(task.categoryId ?? "") || !!groupKey && task.groupTag === groupKey);
  }
  if (!showCompleted) list = list.filter((task) => !task.completed);
  return list;
});
function categoriesByGroup() {
  return get(categoriesByGroupValue);
}
function ungroupedCategories() {
  return get(ungroupedCategoriesValue);
}
function visibleTasks() {
  return get(visibleTasksValue);
}
function initializeTodoState(plugin) {
  pluginRef = plugin;
  writerRef = new VaultTodoWriter(plugin.app, plugin.settings, () => categories);
  if (initialized) return;
  initialized = true;
  const queueRefresh = (path) => {
    if (path) {
      queuedDeletedPaths.delete(path);
      queuedChangedPaths.add(path);
    }
    if (refreshTimer != null) window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(
      () => {
        refreshTimer = null;
        void flushQueuedVaultChanges();
      },
      300
    );
  };
  const queueDelete = (path) => {
    queuedChangedPaths.delete(path);
    queuedDeletedPaths.add(path);
    if (refreshTimer != null) window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(
      () => {
        refreshTimer = null;
        void flushQueuedVaultChanges();
      },
      300
    );
  };
  plugin.registerEvent(plugin.app.vault.on("modify", (file) => {
    if (file instanceof import_obsidian2.TFile && file.extension === "md") queueRefresh(file.path);
  }));
  plugin.registerEvent(plugin.app.vault.on("create", (file) => {
    if (file instanceof import_obsidian2.TFile && file.extension === "md") queueRefresh(file.path);
  }));
  plugin.registerEvent(plugin.app.vault.on("delete", (file) => {
    if (file instanceof import_obsidian2.TFile && file.extension === "md") queueDelete(file.path);
  }));
  plugin.registerEvent(plugin.app.vault.on("rename", (file, oldPath) => {
    if (typeof oldPath === "string" && oldPath.endsWith(".md")) queueDelete(oldPath);
    if (file instanceof import_obsidian2.TFile && file.extension === "md") queueRefresh(file.path);
  }));
}
async function refreshVaultState() {
  return queueScanWork(performFullRefresh);
}
async function flushQueuedVaultChanges() {
  return queueScanWork(async () => {
    if (!pluginRef) return;
    const changedPaths = [...queuedChangedPaths];
    const deletedPaths = [...queuedDeletedPaths];
    queuedChangedPaths.clear();
    queuedDeletedPaths.clear();
    if (changedPaths.length === 0 && deletedPaths.length === 0) return;
    if (fileScanCache.size === 0) {
      await performFullRefresh();
      return;
    }
    ui.loading = true;
    ui.errorMessage = null;
    try {
      for (const path of deletedPaths) fileScanCache.delete(path);
      for (const path of changedPaths) {
        const file = pluginRef.app.vault.getAbstractFileByPath(path);
        if (!(file instanceof import_obsidian2.TFile) || file.extension !== "md") {
          fileScanCache.delete(path);
          continue;
        }
        const scan = await scanSingleFile(pluginRef.app, pluginRef.settings, file);
        fileScanCache.set(path, scan);
      }
      const scans = [...fileScanCache.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, scan]) => scan);
      applyScanResult(combineScanResults(scans));
      ui.lastScanAt = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString();
    } catch (error) {
      ui.errorMessage = error instanceof Error ? error.message : String(error);
      await performFullRefresh();
    } finally {
      ui.loading = false;
    }
  });
}
async function performFullRefresh() {
  if (!pluginRef) return;
  ui.loading = true;
  ui.errorMessage = null;
  try {
    const files = pluginRef.app.vault.getMarkdownFiles();
    const scans = await Promise.all(files.map((file) => scanSingleFile(pluginRef.app, pluginRef.settings, file)));
    fileScanCache.clear();
    files.forEach((file, idx) => {
      fileScanCache.set(file.path, scans[idx]);
    });
    applyScanResult(combineScanResults(scans));
    ui.lastScanAt = /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString();
  } catch (error) {
    ui.errorMessage = error instanceof Error ? error.message : String(error);
  } finally {
    ui.loading = false;
  }
}
function queueScanWork(work) {
  scanQueue = scanQueue.then(work, work);
  return scanQueue;
}
function applyScanResult(scanned) {
  reconcileGroups(scanned.categoryGroups);
  reconcileCategories(scanned.categories);
  reconcileTasks(scanned.tasks);
}
function reconcileGroups(nextGroups) {
  const prevByKey = new Map(categoryGroups.map((g) => [g.sourceGroupKey ?? g.name.toLowerCase(), g]));
  const merged = nextGroups.map((group, idx) => {
    const key2 = group.sourceGroupKey ?? group.name.toLowerCase();
    const prev = prevByKey.get(key2);
    return {
      ...group,
      id: prev?.id ?? group.id ?? makeId2(),
      collapsed: prev?.collapsed ?? group.collapsed ?? false,
      archived: prev?.archived ?? group.archived,
      sortOrder: idx
    };
  });
  categoryGroups.splice(0, categoryGroups.length, ...merged);
}
function reconcileCategories(nextCategories) {
  const groupIdByKey = new Map(categoryGroups.map((g) => [g.sourceGroupKey, g.id]));
  const prevByKey = new Map(categories.map((c) => [
    `${c.sourceGroupKey ?? ""}/${c.sourceCategoryKey ?? c.name.toLowerCase()}`,
    c
  ]));
  const merged = nextCategories.map((category, idx) => {
    const key2 = `${category.sourceGroupKey ?? ""}/${category.sourceCategoryKey ?? category.name.toLowerCase()}`;
    const prev = prevByKey.get(key2);
    return {
      ...category,
      id: prev?.id ?? category.id ?? makeId2(),
      groupId: category.sourceGroupKey ? groupIdByKey.get(category.sourceGroupKey) : category.groupId,
      sortOrder: idx
    };
  });
  categories.splice(0, categories.length, ...merged);
}
function reconcileTasks(nextTasks) {
  const categoryIdBySourceKey = new Map(categories.map((category) => [
    `${category.sourceGroupKey ?? ""}/${category.sourceCategoryKey ?? category.name.toLowerCase()}`,
    category.id
  ]));
  const prevByKey = new Map(tasks.map((task) => [
    `${task.sourceFile ?? ""}:${task.sourceLine ?? ""}:${task.title.toLowerCase()}`,
    task
  ]));
  const merged = nextTasks.map((task, idx) => {
    const key2 = `${task.sourceFile ?? ""}:${task.sourceLine ?? ""}:${task.title.toLowerCase()}`;
    const prev = prevByKey.get(key2);
    const sourceKey = taskCategorySourceKey(task);
    const sortKey = task.sourceFile && task.sourceLine != null ? `${task.sourceFile}:${task.sourceLine}` : void 0;
    const customSort = sortKey && pluginRef ? pluginRef.customSortOrders[sortKey] : void 0;
    return {
      ...task,
      id: prev?.id ?? task.id ?? makeId2(),
      categoryId: sourceKey ? categoryIdBySourceKey.get(sourceKey) : void 0,
      sortOrder: customSort ?? idx
    };
  });
  tasks.splice(0, tasks.length, ...merged);
}
function taskCategorySourceKey(task) {
  if (!task.sourceTag) return void 0;
  const tagPrefix = pluginRef?.settings.tagPrefix || "#todo";
  if (!task.sourceTag.startsWith(`${tagPrefix}/`)) return void 0;
  const parts = task.sourceTag.slice(tagPrefix.length).split("/").filter(Boolean);
  if (parts.length < 2) return void 0;
  return `${parts[0].toLowerCase()}/${parts[1].toLowerCase()}`;
}
function setNavDashboard() {
  nav.view = "dashboard";
  nav.groupId = void 0;
  nav.categoryId = void 0;
  nav.uncategorizedOnly = void 0;
}
function setNavGroup(groupId) {
  nav.view = "dashboard";
  nav.groupId = groupId;
  nav.categoryId = void 0;
  nav.uncategorizedOnly = void 0;
}
function setNavCategory(categoryId) {
  nav.view = "dashboard";
  nav.categoryId = categoryId;
  nav.groupId = void 0;
  nav.uncategorizedOnly = void 0;
}
function setNavUncategorized() {
  nav.view = "dashboard";
  nav.categoryId = void 0;
  nav.groupId = void 0;
  nav.uncategorizedOnly = true;
}
function getCategory(categoryId) {
  if (!categoryId) return void 0;
  return categories.find((category) => category.id === categoryId);
}
function categoryLabel(categoryId) {
  return getCategory(categoryId)?.name ?? "Uncategorized";
}
function toggleGroupCollapsed(groupId) {
  const group = categoryGroups.find((g) => g.id === groupId);
  if (!group) return;
  group.collapsed = !group.collapsed;
}
async function addTask(input) {
  if (!writerRef) return;
  await writerRef.addTask(input);
  await refreshVaultState();
}
async function toggleTaskComplete(taskId) {
  if (!writerRef) return;
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;
  await writerRef.toggleComplete(task, !task.completed);
  await refreshVaultState();
}
async function deleteTask(taskId) {
  if (!writerRef) return;
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;
  await writerRef.deleteTask(task);
  await refreshVaultState();
}
async function updateTask(taskId, patch) {
  if (!writerRef) return;
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;
  if (typeof patch.title === "string" && patch.title.trim() && patch.title !== task.title) {
    await writerRef.editTaskTitle(task, patch.title);
  }
  if (typeof patch.completed === "boolean" && patch.completed !== task.completed) {
    await writerRef.toggleComplete(task, patch.completed);
  }
  await refreshVaultState();
}
function moveTask(draggedTaskId, targetTaskId) {
  if (draggedTaskId === targetTaskId || !pluginRef) return;
  const visible = get(visibleTasksValue);
  const dragIdx = visible.findIndex((t) => t.id === draggedTaskId);
  const targetIdx = visible.findIndex((t) => t.id === targetTaskId);
  if (dragIdx === -1 || targetIdx === -1) return;
  const reordered = [...visible];
  const [moved] = reordered.splice(dragIdx, 1);
  reordered.splice(targetIdx, 0, moved);
  for (let i = 0; i < reordered.length; i++) {
    const t = reordered[i];
    const key2 = taskSortKey(t);
    if (key2) {
      pluginRef.customSortOrders[key2] = i;
    }
    const real = tasks.find((rt) => rt.id === t.id);
    if (real) real.sortOrder = i;
  }
  void pluginRef.saveSortOrders();
}
function taskSortKey(task) {
  if (task.sourceFile && task.sourceLine != null) {
    return `${task.sourceFile}:${task.sourceLine}`;
  }
  return void 0;
}
async function changeTaskSubTag(taskId, newSubTag) {
  if (!writerRef) return;
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;
  await writerRef.changeSubTag(task, newSubTag);
  await refreshVaultState();
}
async function openTaskInObsidian(taskId) {
  if (!pluginRef) return;
  const task = tasks.find((t) => t.id === taskId);
  if (!task?.sourceFile) return;
  await pluginRef.app.workspace.openLinkText(task.sourceFile, "", false);
}

// components/Sidebar.svelte
var root_3 = from_html(`<button type="button"><span class="accent svelte-1b12cm3"></span> <span class="emoji svelte-1b12cm3"> </span> <span class="svelte-1b12cm3"> </span></button>`);
var root_2 = from_html(`<div class="items svelte-1b12cm3"></div>`);
var root_1 = from_html(`<div class="group-block svelte-1b12cm3"><div class="group-header-row svelte-1b12cm3"><button type="button" class="group-collapse svelte-1b12cm3"><span>\u25B8</span></button> <button type="button" class="group-label svelte-1b12cm3"> </button></div> <!></div>`);
var root_5 = from_html(`<button type="button"><span class="accent svelte-1b12cm3"></span> <span class="emoji svelte-1b12cm3"> </span> <span class="svelte-1b12cm3"> </span></button>`);
var root_4 = from_html(`<div class="group-block svelte-1b12cm3"><div class="group-header-static svelte-1b12cm3">UNGROUPED</div> <div class="items svelte-1b12cm3"></div></div>`);
var root = from_html(`<nav aria-label="Sidebar navigation"><div class="brand svelte-1b12cm3"><div class="logo svelte-1b12cm3">\u2713</div> <div><strong class="svelte-1b12cm3">Tasks Dashboard</strong> <small class="svelte-1b12cm3">Vault-backed task board</small></div></div> <div class="pinned-nav svelte-1b12cm3"><button type="button">\u{1F4CC} Uncategorized / Group-level</button> <button type="button">\u{1F3E1} Dashboard</button></div> <div class="group-list svelte-1b12cm3"><!> <!></div></nav>`);
var $$css = {
  hash: "svelte-1b12cm3",
  code: ".sidebar.svelte-1b12cm3 {display:grid;grid-template-rows:auto auto 1fr;gap:0.35rem;height:100%;min-height:0;padding:0.5rem;background:var(--sidebar-bg);color:var(--sidebar-text);border-right:1px solid var(--sidebar-border);}.brand.svelte-1b12cm3 {display:flex;gap:0.5rem;align-items:center;padding:0.25rem 0.25rem 0.35rem;min-width:0;}.logo.svelte-1b12cm3 {width:2rem;height:2rem;display:grid;place-items:center;border-radius:0.6rem;background:color-mix(in srgb, var(--accent) 20%, transparent);border:1px solid color-mix(in srgb, var(--accent) 50%, var(--sidebar-border));font-weight:800;}.brand.svelte-1b12cm3 small:where(.svelte-1b12cm3) {color:var(--sidebar-muted);}.brand.svelte-1b12cm3 strong:where(.svelte-1b12cm3),\n  .brand.svelte-1b12cm3 small:where(.svelte-1b12cm3) {display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.sidebar.svelte-1b12cm3 button:where(.svelte-1b12cm3) {text-align:left;background:transparent;border:1px solid transparent;color:inherit;border-radius:0.5rem;padding:0.35rem 0.5rem;font:inherit;}.pinned-nav.svelte-1b12cm3 {display:flex;flex-direction:column;gap:0.35rem;padding:0.1rem 0.15rem 0.35rem;margin-bottom:0.2rem;border-bottom:1px solid color-mix(in srgb, var(--sidebar-border) 70%, transparent);}.pinned-item.svelte-1b12cm3 {width:100%;background:color-mix(in srgb, var(--sidebar-active-bg) 50%, transparent);border-color:color-mix(in srgb, var(--sidebar-border) 85%, transparent);padding:0.45rem 0.55rem;font-weight:600;}.pinned-item.active.svelte-1b12cm3 {background:var(--sidebar-active-bg);border-color:var(--sidebar-border);}.group-list.svelte-1b12cm3 {overflow-x:hidden;overflow-y:auto;display:grid;gap:0.2rem;align-content:start;padding:0.1rem 0.15rem 0.2rem 0.1rem;}.group-block.svelte-1b12cm3 {display:grid;gap:0.2rem;margin-bottom:0.875rem;}.group-header-row.svelte-1b12cm3 {display:flex;gap:0.25rem;align-items:center;padding-inline:0.3rem;}.group-block.svelte-1b12cm3 + .group-block:where(.svelte-1b12cm3) .group-header-row:where(.svelte-1b12cm3),\n  .group-block.svelte-1b12cm3 + .group-block:where(.svelte-1b12cm3) .group-header-static:where(.svelte-1b12cm3) {margin-top:0.3rem;}.group-collapse.svelte-1b12cm3 {border:0;color:var(--sidebar-muted);padding:0.05rem 0.2rem;}.group-collapse.svelte-1b12cm3 span:where(.svelte-1b12cm3) {display:inline-block;transition:transform 120ms ease;}.group-collapse.svelte-1b12cm3 span.rotated:where(.svelte-1b12cm3) {transform:rotate(90deg);}.group-label.svelte-1b12cm3,\n  .group-header-static.svelte-1b12cm3 {color:var(--sidebar-muted);font-size:0.72rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;padding:0.15rem 0.5rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.group-header-static.svelte-1b12cm3 {padding:0.15rem 0.65rem;}.items.svelte-1b12cm3 {display:grid;gap:0.12rem;padding-left:1.15rem;}.category-item.svelte-1b12cm3 {display:grid;grid-template-columns:3px 1.1rem 1fr;gap:0.5rem;align-items:center;padding:0.4rem 0.95rem 0.4rem 0.95rem;border-radius:0.4rem;border:1px solid transparent;font-size:0.85rem;min-width:0;}.category-item.svelte-1b12cm3 .accent:where(.svelte-1b12cm3) {width:3px;height:1.2rem;border-radius:999px;opacity:0.7;}.category-item.svelte-1b12cm3 .emoji:where(.svelte-1b12cm3) + span:where(.svelte-1b12cm3) {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.category-item.active.svelte-1b12cm3 {background:var(--sidebar-active-bg);border-color:var(--sidebar-border);}.category-item.active.svelte-1b12cm3 .accent:where(.svelte-1b12cm3) {opacity:1;}"
};
function Sidebar($$anchor, $$props) {
  push($$props, true);
  append_styles($$anchor, $$css);
  let mobile = prop($$props, "mobile", 3, false);
  const grouped = user_derived(categoriesByGroup);
  const looseCategories = user_derived(ungroupedCategories);
  function goDashboard() {
    setNavDashboard();
    $$props.onNavigate?.();
  }
  function goUncategorized() {
    setNavUncategorized();
    $$props.onNavigate?.();
  }
  function goGroup(id) {
    setNavGroup(id);
    $$props.onNavigate?.();
  }
  function goCategory(id) {
    setNavCategory(id);
    $$props.onNavigate?.();
  }
  var nav_1 = root();
  let classes;
  var div = sibling(child(nav_1), 2);
  var button = child(div);
  let classes_1;
  var button_1 = sibling(button, 2);
  let classes_2;
  reset(div);
  var div_1 = sibling(div, 2);
  var node = child(div_1);
  each(node, 17, () => get(grouped), (section) => section.group.id, ($$anchor2, section) => {
    var div_2 = root_1();
    var div_3 = child(div_2);
    var button_2 = child(div_3);
    var span = child(button_2);
    let classes_3;
    reset(button_2);
    var button_3 = sibling(button_2, 2);
    var text2 = child(button_3, true);
    reset(button_3);
    reset(div_3);
    var node_1 = sibling(div_3, 2);
    {
      var consequent = ($$anchor3) => {
        var div_4 = root_2();
        each(div_4, 21, () => get(section).categories, (category) => category.id, ($$anchor4, category) => {
          var button_4 = root_3();
          let classes_4;
          var span_1 = child(button_4);
          var span_2 = sibling(span_1, 2);
          var text_1 = child(span_2, true);
          reset(span_2);
          var span_3 = sibling(span_2, 2);
          var text_2 = child(span_3, true);
          reset(span_3);
          reset(button_4);
          template_effect(() => {
            classes_4 = set_class(button_4, 1, "category-item svelte-1b12cm3", null, classes_4, { active: nav.categoryId === get(category).id });
            set_style(span_1, `background:${get(category).color ?? "var(--accent)"}`);
            set_text(text_1, get(category).emoji ?? "\u2022");
            set_text(text_2, get(category).name);
          });
          delegated("click", button_4, () => goCategory(get(category).id));
          append($$anchor4, button_4);
        });
        reset(div_4);
        append($$anchor3, div_4);
      };
      if_block(node_1, ($$render) => {
        if (!get(section).group.collapsed) $$render(consequent);
      });
    }
    reset(div_2);
    template_effect(() => {
      classes_3 = set_class(span, 1, "svelte-1b12cm3", null, classes_3, { rotated: get(section).group.collapsed });
      set_text(text2, get(section).group.name);
    });
    delegated("click", button_2, () => toggleGroupCollapsed(get(section).group.id));
    delegated("click", button_3, () => goGroup(get(section).group.id));
    append($$anchor2, div_2);
  });
  var node_2 = sibling(node, 2);
  {
    var consequent_1 = ($$anchor2) => {
      var div_5 = root_4();
      var div_6 = sibling(child(div_5), 2);
      each(div_6, 21, () => get(looseCategories), (category) => category.id, ($$anchor3, category) => {
        var button_5 = root_5();
        let classes_5;
        var span_4 = child(button_5);
        var span_5 = sibling(span_4, 2);
        var text_3 = child(span_5, true);
        reset(span_5);
        var span_6 = sibling(span_5, 2);
        var text_4 = child(span_6, true);
        reset(span_6);
        reset(button_5);
        template_effect(() => {
          classes_5 = set_class(button_5, 1, "category-item svelte-1b12cm3", null, classes_5, { active: nav.categoryId === get(category).id });
          set_style(span_4, `background:${get(category).color ?? "var(--accent)"}`);
          set_text(text_3, get(category).emoji ?? "\u2022");
          set_text(text_4, get(category).name);
        });
        delegated("click", button_5, () => goCategory(get(category).id));
        append($$anchor3, button_5);
      });
      reset(div_6);
      reset(div_5);
      append($$anchor2, div_5);
    };
    if_block(node_2, ($$render) => {
      if (get(looseCategories).length) $$render(consequent_1);
    });
  }
  reset(div_1);
  reset(nav_1);
  template_effect(() => {
    classes = set_class(nav_1, 1, "sidebar tasks-dashboard-sidebar svelte-1b12cm3", null, classes, { mobile: mobile() });
    classes_1 = set_class(button, 1, "pinned-item svelte-1b12cm3", null, classes_1, { active: !!nav.uncategorizedOnly });
    classes_2 = set_class(button_1, 1, "pinned-item svelte-1b12cm3", null, classes_2, {
      active: !nav.groupId && !nav.categoryId && !nav.uncategorizedOnly
    });
  });
  delegated("click", button, goUncategorized);
  delegated("click", button_1, goDashboard);
  append($$anchor, nav_1);
  pop();
}
delegate(["click"]);

// components/QuickCapture.svelte
var root_12 = from_html(`<label class="svelte-149ph0u"><span>Subtag (optional)</span> <input type="text" placeholder="e.g. blog, ebook" maxlength="40" class="svelte-149ph0u"/></label>`);
var root_32 = from_html(`<option> </option>`);
var root_22 = from_html(`<label class="svelte-149ph0u"><span>Category</span> <select class="svelte-149ph0u"><option>Uncategorized (uses #todo)</option><!></select></label>`);
var root2 = from_html(`<section class="quick-capture svelte-149ph0u"><div class="header svelte-149ph0u"><h2 class="svelte-149ph0u">Quick Capture</h2> <p class="svelte-149ph0u">Fast task entry into your vault inbox file.</p></div> <form class="svelte-149ph0u"><input type="text" placeholder="What needs to happen next?" maxlength="140" class="svelte-149ph0u"/> <div class="row svelte-149ph0u"><!> <button type="submit" class="svelte-149ph0u"> </button></div></form></section>`);
var $$css2 = {
  hash: "svelte-149ph0u",
  code: ".quick-capture.svelte-149ph0u {display:grid;gap:0.75rem;padding:1rem;border-radius:1rem;border:1px solid var(--border-color);background:var(--surface-1);}.header.svelte-149ph0u h2:where(.svelte-149ph0u) {margin:0;font-size:1.05rem;}.header.svelte-149ph0u p:where(.svelte-149ph0u) {margin:0.2rem 0 0;font-size:0.85rem;color:var(--text-muted);}form.svelte-149ph0u {display:grid;gap:0.75rem;}input[type='text'].svelte-149ph0u {width:100%;background:var(--surface-2);border:1px solid var(--border-color);border-radius:0.7rem;padding:0.7rem 0.85rem;color:inherit;min-width:0;}.row.svelte-149ph0u {display:flex;flex-wrap:wrap;gap:0.75rem;align-items:end;}label.svelte-149ph0u {display:grid;gap:0.25rem;font-size:0.8rem;}select.svelte-149ph0u,\n  button.svelte-149ph0u {background:var(--surface-2);border:1px solid var(--border-color);color:inherit;border-radius:0.6rem;padding:0.5rem 0.65rem;max-width:100%;}button[type='submit'].svelte-149ph0u {background:var(--accent);border-color:var(--accent);color:white;font-weight:700;}\n\n  @media (max-width: 600px) {.quick-capture.svelte-149ph0u {padding:0.85rem;gap:0.65rem;}form.svelte-149ph0u {gap:0.6rem;}.row.svelte-149ph0u > :where(.svelte-149ph0u) {flex:1 1 100%;}.row.svelte-149ph0u {align-items:stretch;}button[type='submit'].svelte-149ph0u {width:100%;}\n  }\n\n  @media (max-width: 400px) {.quick-capture.svelte-149ph0u {padding:0.8rem;gap:0.6rem;}form.svelte-149ph0u {gap:0.6rem;}input[type='text'].svelte-149ph0u {padding:0.6rem 0.7rem;}select.svelte-149ph0u,\n    button.svelte-149ph0u {padding:0.45rem 0.55rem;}\n  }"
};
function QuickCapture($$anchor, $$props) {
  push($$props, true);
  append_styles($$anchor, $$css2);
  let locked = prop($$props, "locked", 3, false);
  let title = state("");
  let categoryId = state("");
  let subTag = state("");
  let submitting = state(false);
  user_effect(() => {
    set(categoryId, $$props.defaultCategoryId ?? "", true);
  });
  async function submit() {
    if (!get(title).trim() || get(submitting)) return;
    set(submitting, true);
    try {
      await addTask({
        title: get(title),
        categoryId: get(categoryId) || void 0,
        subTag: get(subTag).trim() || void 0
      });
      set(title, "");
      set(subTag, "");
    } finally {
      set(submitting, false);
    }
  }
  var section = root2();
  var form = sibling(child(section), 2);
  var input = child(form);
  remove_input_defaults(input);
  var div = sibling(input, 2);
  var node = child(div);
  {
    var consequent = ($$anchor2) => {
      var label = root_12();
      var input_1 = sibling(child(label), 2);
      remove_input_defaults(input_1);
      reset(label);
      delegated("keydown", input_1, (e) => e.stopPropagation());
      bind_value(input_1, () => get(subTag), ($$value) => set(subTag, $$value));
      append($$anchor2, label);
    };
    var alternate = ($$anchor2) => {
      var label_1 = root_22();
      var select = sibling(child(label_1), 2);
      var option = child(select);
      option.value = option.__value = "";
      var node_1 = sibling(option);
      each(node_1, 17, () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder), index, ($$anchor3, category) => {
        var option_1 = root_32();
        var text2 = child(option_1);
        reset(option_1);
        var option_1_value = {};
        template_effect(() => {
          set_text(text2, `${get(category).emoji ? `${get(category).emoji} ` : ""}${get(category).name ?? ""}`);
          if (option_1_value !== (option_1_value = get(category).id)) {
            option_1.value = (option_1.__value = get(category).id) ?? "";
          }
        });
        append($$anchor3, option_1);
      });
      reset(select);
      reset(label_1);
      bind_select_value(select, () => get(categoryId), ($$value) => set(categoryId, $$value));
      append($$anchor2, label_1);
    };
    if_block(node, ($$render) => {
      if (locked()) $$render(consequent);
      else $$render(alternate, false);
    });
  }
  var button = sibling(node, 2);
  var text_1 = child(button, true);
  reset(button);
  reset(div);
  reset(form);
  reset(section);
  template_effect(() => {
    button.disabled = get(submitting);
    set_text(text_1, get(submitting) ? "Adding\u2026" : "Add Task");
  });
  event("submit", form, (event2) => {
    event2.preventDefault();
    void submit();
  });
  delegated("keydown", input, (e) => e.stopPropagation());
  event("focus", input, (e) => e.stopPropagation());
  bind_value(input, () => get(title), ($$value) => set(title, $$value));
  append($$anchor, section);
  pop();
}
delegate(["keydown"]);

// components/TaskCard.svelte
var root_13 = from_html(`<button type="button" class="cat-badge svelte-1j8piq"> </button>`);
var root_23 = from_html(`<button type="button" class="ghost icon-btn svelte-1j8piq" title="Open in Obsidian">\u2197</button> <button type="button" class="ghost icon-btn svelte-1j8piq" title="Edit">\u270E</button> <button type="button" class="danger icon-btn svelte-1j8piq" title="Delete">\u{1F5D1}</button>`, 1);
var root_42 = from_html(`<option> </option>`);
var root_33 = from_html(`<div class="editor svelte-1j8piq"><input type="text" maxlength="140" class="svelte-1j8piq"/> <div class="grid2 svelte-1j8piq"><select disabled="" class="svelte-1j8piq"><option>Vault category (read from tags)</option><!></select></div> <div class="actions svelte-1j8piq"><button type="button" class="svelte-1j8piq">Save</button> <button type="button" class="ghost svelte-1j8piq">Cancel</button></div></div>`);
var root3 = from_html(`<article draggable="true"><div class="row top-row svelte-1j8piq"><label class="checkbox-row svelte-1j8piq"><input type="checkbox" class="svelte-1j8piq"/> <span class="title svelte-1j8piq"> </span></label> <div class="right-controls svelte-1j8piq"><!> <!></div></div> <!></article>`);
var $$css3 = {
  hash: "svelte-1j8piq",
  code: ".task-card.svelte-1j8piq {display:grid;gap:0.25rem;padding:0.4rem 0.5rem;border-radius:0.75rem;border:1px solid var(--border-color);background:var(--surface-1);}.task-card.done.svelte-1j8piq {opacity:0.72;}.top-row.svelte-1j8piq {display:flex;justify-content:space-between;gap:0.35rem;align-items:flex-start;min-width:0;}.checkbox-row.svelte-1j8piq {display:flex;flex:1 1 auto;gap:0.45rem;align-items:flex-start;font-weight:600;min-width:0;}.checkbox-row.svelte-1j8piq .title:where(.svelte-1j8piq) {display:block;min-width:0;line-height:1.2;font-size:0.9rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.checkbox-row.svelte-1j8piq input[type='checkbox']:where(.svelte-1j8piq) {margin-top:0.1rem;inline-size:0.95rem;block-size:0.95rem;}.done.svelte-1j8piq .title:where(.svelte-1j8piq) {text-decoration:line-through;}.right-controls.svelte-1j8piq {display:flex;flex:0 0 auto;gap:0.25rem;align-items:center;}.editor.svelte-1j8piq {display:grid;gap:0.5rem;padding-top:0.1rem;}.editor.svelte-1j8piq input:where(.svelte-1j8piq),\n  .editor.svelte-1j8piq select:where(.svelte-1j8piq),\n  .actions.svelte-1j8piq button:where(.svelte-1j8piq) {background:var(--surface-2);border:1px solid var(--border-color);color:inherit;border-radius:0.55rem;padding:0.45rem 0.6rem;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.grid2.svelte-1j8piq {display:grid;gap:0.5rem;grid-template-columns:repeat(2, minmax(0, 1fr));}.cat-badge.svelte-1j8piq {padding:0.15rem 0.5rem;border-radius:999px;font-size:0.65rem;font-weight:600;background:color-mix(in srgb, var(--interactive-accent, #7c3aed) 18%, var(--surface-2, #2a2a3e));border:1px solid var(--border-color);color:var(--text-normal);cursor:pointer;white-space:nowrap;transition:background 120ms ease;}.cat-badge.svelte-1j8piq:hover {background:color-mix(in srgb, var(--interactive-accent, #7c3aed) 35%, var(--surface-2, #2a2a3e));}.icon-btn.svelte-1j8piq {display:grid;place-items:center;min-width:1.8rem;min-height:1.8rem;padding:0.2rem;line-height:1;font-size:0.8rem;border-radius:0.45rem;}.actions.svelte-1j8piq .ghost:where(.svelte-1j8piq) {background:transparent;}.danger.svelte-1j8piq {border-color:color-mix(in srgb, #ff6b6b 55%, var(--border-color));}\n\n  @media (max-width: 600px) {.task-card.svelte-1j8piq {padding:0.35rem 0.4rem;}.checkbox-row.svelte-1j8piq {gap:0.35rem;}.grid2.svelte-1j8piq {grid-template-columns:1fr;}.actions.svelte-1j8piq {justify-content:flex-start;}\n  }\n\n  @media (max-width: 400px) {.top-row.svelte-1j8piq {flex-wrap:wrap;}.icon-btn.svelte-1j8piq {min-width:1.65rem;min-height:1.65rem;}\n  }"
};
function TaskCard($$anchor, $$props) {
  push($$props, true);
  append_styles($$anchor, $$css3);
  let showCategory = prop($$props, "showCategory", 3, false);
  const catName = user_derived(() => showCategory() ? categoryLabel($$props.task.categoryId) : "");
  let editing = state(false);
  let title = state("");
  let categoryId = state("");
  user_effect(() => {
    set(title, $$props.task.title, true);
    set(categoryId, $$props.task.categoryId ?? "", true);
  });
  async function save2() {
    await updateTask($$props.task.id, {
      title: get(title),
      categoryId: get(categoryId) || void 0
    });
    set(editing, false);
  }
  var article = root3();
  let classes;
  var div = child(article);
  var label = child(div);
  var input = child(label);
  remove_input_defaults(input);
  var span = sibling(input, 2);
  var text2 = child(span, true);
  reset(span);
  reset(label);
  var div_1 = sibling(label, 2);
  var node = child(div_1);
  {
    var consequent = ($$anchor2) => {
      var button = root_13();
      var text_1 = child(button, true);
      reset(button);
      template_effect(() => {
        set_attribute2(button, "title", `Go to ${get(catName) ?? ""}`);
        set_text(text_1, get(catName));
      });
      delegated("click", button, () => $$props.task.categoryId && $$props.onGoToCategory?.($$props.task.categoryId));
      append($$anchor2, button);
    };
    if_block(node, ($$render) => {
      if (showCategory() && get(catName) && get(catName) !== "Uncategorized") $$render(consequent);
    });
  }
  var node_1 = sibling(node, 2);
  {
    var consequent_1 = ($$anchor2) => {
      var fragment = root_23();
      var button_1 = first_child(fragment);
      var button_2 = sibling(button_1, 2);
      var button_3 = sibling(button_2, 2);
      delegated("click", button_1, () => openTaskInObsidian($$props.task.id));
      delegated("click", button_2, () => set(editing, true));
      delegated("click", button_3, () => deleteTask($$props.task.id));
      append($$anchor2, fragment);
    };
    if_block(node_1, ($$render) => {
      if (!get(editing)) $$render(consequent_1);
    });
  }
  reset(div_1);
  reset(div);
  var node_2 = sibling(div, 2);
  {
    var consequent_2 = ($$anchor2) => {
      var div_2 = root_33();
      var input_1 = child(div_2);
      remove_input_defaults(input_1);
      var div_3 = sibling(input_1, 2);
      var select = child(div_3);
      var option = child(select);
      option.value = option.__value = "";
      var node_3 = sibling(option);
      each(node_3, 17, () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder), index, ($$anchor3, category) => {
        var option_1 = root_42();
        var text_2 = child(option_1);
        reset(option_1);
        var option_1_value = {};
        template_effect(() => {
          set_text(text_2, `${get(category).emoji ? `${get(category).emoji} ` : ""}${get(category).name ?? ""}`);
          if (option_1_value !== (option_1_value = get(category).id)) {
            option_1.value = (option_1.__value = get(category).id) ?? "";
          }
        });
        append($$anchor3, option_1);
      });
      reset(select);
      reset(div_3);
      var div_4 = sibling(div_3, 2);
      var button_4 = child(div_4);
      var button_5 = sibling(button_4, 2);
      reset(div_4);
      reset(div_2);
      delegated("keydown", input_1, (e) => e.stopPropagation());
      bind_value(input_1, () => get(title), ($$value) => set(title, $$value));
      bind_select_value(select, () => get(categoryId), ($$value) => set(categoryId, $$value));
      delegated("click", button_4, save2);
      delegated("click", button_5, () => set(editing, false));
      append($$anchor2, div_2);
    };
    if_block(node_2, ($$render) => {
      if (get(editing)) $$render(consequent_2);
    });
  }
  reset(article);
  template_effect(() => {
    classes = set_class(article, 1, "task-card svelte-1j8piq", null, classes, { done: $$props.task.completed });
    set_checked(input, $$props.task.completed);
    set_text(text2, $$props.task.title);
  });
  event("dragstart", article, (event2) => {
    event2.dataTransfer?.setData("text/plain", $$props.task.id);
    event2.dataTransfer.effectAllowed = "move";
    event2.stopPropagation();
    $$props.onDragStart?.($$props.task.id);
  });
  event("dragover", article, (event2) => {
    event2.preventDefault();
    event2.stopPropagation();
    event2.dataTransfer.dropEffect = "move";
  });
  event("drop", article, (event2) => {
    event2.preventDefault();
    event2.stopPropagation();
    $$props.onDropOn?.($$props.task.id);
  });
  event("dragend", article, (event2) => event2.stopPropagation());
  delegated("change", input, () => toggleTaskComplete($$props.task.id));
  append($$anchor, article);
  pop();
}
delegate(["change", "click", "keydown"]);

// components/TaskBoard.svelte
var root_14 = from_html(`<div class="empty-state svelte-q5ccww">No tasks here yet.</div>`);
var root_34 = from_html(`<div class="cards svelte-q5ccww"></div>`);
var root_6 = from_html(`<div class="empty-state compact svelte-q5ccww">No finished tasks.</div>`);
var root_7 = from_html(`<div class="cards svelte-q5ccww"></div>`);
var root_24 = from_html(`<section class="task-section svelte-q5ccww"><div class="task-section-head svelte-q5ccww"><h3 class="svelte-q5ccww">Tasks</h3> <small class="svelte-q5ccww"> </small></div> <!></section> <section class="task-section finished-block svelte-q5ccww"><button type="button" class="finished-toggle svelte-q5ccww"><span> </span> <span>\u25BE</span></button> <!></section>`, 1);
var root_11 = from_html(`<section class="subtag-group svelte-q5ccww"><div class="subtag-header svelte-q5ccww">Root / Uncategorized</div> <div class="cards svelte-q5ccww"></div></section>`);
var root_132 = from_html(`<section class="subtag-group svelte-q5ccww"><div class="subtag-header svelte-q5ccww"> </div> <div class="cards svelte-q5ccww"></div></section>`);
var root_10 = from_html(`<!> <!>`, 1);
var root_16 = from_html(`<div class="cards svelte-q5ccww"></div>`);
var root_18 = from_html(`<section class="subtag-group svelte-q5ccww"><div class="subtag-header svelte-q5ccww"> </div> <div class="cards svelte-q5ccww"></div></section>`);
var root_15 = from_html(`<!> <!>`, 1);
var root_20 = from_html(`<div class="cards svelte-q5ccww"></div>`);
var root_232 = from_html(`<div class="empty-state compact svelte-q5ccww">No finished tasks.</div>`);
var root_25 = from_html(`<section class="subtag-group svelte-q5ccww"><div class="subtag-header svelte-q5ccww">Root / Uncategorized</div> <div class="cards svelte-q5ccww"></div></section>`);
var root_27 = from_html(`<section class="subtag-group svelte-q5ccww"><div class="subtag-header svelte-q5ccww"> </div> <div class="cards svelte-q5ccww"></div></section>`);
var root_242 = from_html(`<!> <!>`, 1);
var root_30 = from_html(`<div class="cards svelte-q5ccww"></div>`);
var root_322 = from_html(`<section class="subtag-group svelte-q5ccww"><div class="subtag-header svelte-q5ccww"> </div> <div class="cards svelte-q5ccww"></div></section>`);
var root_29 = from_html(`<!> <!>`, 1);
var root_342 = from_html(`<div class="cards svelte-q5ccww"></div>`);
var root_9 = from_html(`<section class="task-section svelte-q5ccww"><div class="task-section-head svelte-q5ccww"><h3 class="svelte-q5ccww">Tasks</h3> <small class="svelte-q5ccww"> </small></div> <!></section> <section class="task-section finished-block svelte-q5ccww"><button type="button" class="finished-toggle svelte-q5ccww"><span> </span> <span>\u25BE</span></button> <!></section>`, 1);
var root_37 = from_html(`<li><button type="button" class="svelte-q5ccww"> </button></li>`);
var root_36 = from_html(`<div><button type="button" class="categories-tab svelte-q5ccww" aria-controls="dashboard-categories-panel">Categories</button> <button type="button" class="categories-overlay-backdrop svelte-q5ccww" aria-label="Close categories"></button> <aside class="side-column svelte-q5ccww" id="dashboard-categories-panel"><section class="panel svelte-q5ccww"><h3 class="svelte-q5ccww">Categories</h3> <ul class="category-links svelte-q5ccww"><!> <li><button type="button" class="svelte-q5ccww">Uncategorized / group-level</button></li></ul></section></aside></div>`);
var root4 = from_html(`<section class="task-board svelte-q5ccww"><header class="page-header svelte-q5ccww"><h1 class="svelte-q5ccww"> </h1> <div class="stats-grid svelte-q5ccww"><div class="svelte-q5ccww"><span class="svelte-q5ccww"> </span><small class="svelte-q5ccww">Open</small></div> <div class="svelte-q5ccww"><span class="svelte-q5ccww"> </span><small class="svelte-q5ccww">Done</small></div></div> <div class="header-actions svelte-q5ccww"><button type="button">Board</button> <button type="button" class="svelte-q5ccww"> </button></div></header> <div><div class="main-column svelte-q5ccww"><!> <section class="task-list svelte-q5ccww"><!></section></div> <!></div></section>`);
var $$css4 = {
  hash: "svelte-q5ccww",
  code: ".task-board.svelte-q5ccww {display:grid;gap:1rem;}.page-header.svelte-q5ccww {display:flex;justify-content:space-between;gap:1rem;align-items:center;flex-wrap:wrap;}h1.svelte-q5ccww {margin:0;font-size:clamp(1.2rem, 2.3vw, 1.7rem);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.stats-grid.svelte-q5ccww {display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:0.5rem;min-width:min(14rem, 100%);flex:1 1 14rem;max-width:100%;}.stats-grid.svelte-q5ccww > div:where(.svelte-q5ccww) {background:var(--surface-1);border:1px solid var(--border-color);border-radius:0.9rem;padding:0.6rem 0.75rem;display:grid;gap:0.15rem;}.stats-grid.svelte-q5ccww span:where(.svelte-q5ccww) {font-size:1.15rem;font-weight:800;}.stats-grid.svelte-q5ccww small:where(.svelte-q5ccww) {color:var(--text-muted);}.header-actions.svelte-q5ccww {display:flex;gap:0.5rem;margin-left:auto;min-width:0;}.header-actions.svelte-q5ccww button:where(.svelte-q5ccww) {background:var(--surface-1);border:1px solid var(--border-color);color:inherit;border-radius:0.65rem;padding:0.45rem 0.75rem;font:inherit;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.header-actions.svelte-q5ccww button.active:where(.svelte-q5ccww) {background:var(--surface-2);}.board-grid.svelte-q5ccww {display:grid;grid-template-columns:minmax(0, 1fr) minmax(240px, 320px);gap:1rem;position:relative;}.board-grid.single-column.svelte-q5ccww {grid-template-columns:minmax(0, 1fr);}.main-column.svelte-q5ccww,\n  .side-column.svelte-q5ccww {display:grid;gap:1rem;align-content:start;}.categories-overlay-shell.svelte-q5ccww {display:contents;}.categories-tab.svelte-q5ccww,\n  .categories-overlay-backdrop.svelte-q5ccww {display:none;}.task-list.svelte-q5ccww {display:grid;gap:0.65rem;padding:1rem;border:1px solid var(--border-color);border-radius:1rem;background:var(--surface-1);}\n  .category-links.svelte-q5ccww button:where(.svelte-q5ccww) {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.empty-state.compact.svelte-q5ccww {padding:0;border:none;font-size:0.85rem;}\n  .panel.svelte-q5ccww h3:where(.svelte-q5ccww) {margin:0;font-size:1rem;}.task-section.svelte-q5ccww {display:grid;gap:0.25rem;}.task-section.svelte-q5ccww + .task-section:where(.svelte-q5ccww) {margin-top:0.2rem;}.task-section-head.svelte-q5ccww {display:flex;align-items:center;justify-content:space-between;gap:0.5rem;}.task-section-head.svelte-q5ccww h3:where(.svelte-q5ccww) {margin:0;font-size:0.9rem;}.task-section-head.svelte-q5ccww small:where(.svelte-q5ccww) {color:var(--text-muted);font-size:0.75rem;font-weight:600;}.finished-block.svelte-q5ccww {gap:0.55rem;padding-top:0.15rem;border-top:1px solid color-mix(in srgb, var(--border-color) 70%, transparent);}.finished-toggle.svelte-q5ccww {display:flex;align-items:center;justify-content:space-between;gap:0.5rem;width:100%;text-align:left;background:transparent;border:1px solid var(--border-color);color:inherit;border-radius:0.65rem;padding:0.4rem 0.55rem;font:inherit;cursor:pointer;}.finished-toggle.svelte-q5ccww .chevron:where(.svelte-q5ccww) {color:var(--text-muted);transition:transform 120ms ease;}.finished-toggle.svelte-q5ccww .chevron.expanded:where(.svelte-q5ccww) {transform:rotate(180deg);}.cards.svelte-q5ccww {display:grid;gap:0.45rem;}.subtag-group.svelte-q5ccww {display:grid;gap:0.55rem;margin-top:0.4rem;}.subtag-header.svelte-q5ccww {padding:0.35rem 0.55rem;border-radius:0.6rem;border:1px solid var(--border-color);background:var(--surface-2);font-size:0.8rem;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted);}.empty-state.svelte-q5ccww {padding:1rem;border:1px dashed var(--border-color);border-radius:0.8rem;color:var(--text-muted);text-align:left;}.panel.svelte-q5ccww {padding:1rem;border:1px solid var(--border-color);border-radius:1rem;background:var(--surface-1);}.panel.svelte-q5ccww ul:where(.svelte-q5ccww) {list-style:none;margin:0.6rem 0 0;padding:0;display:grid;gap:0.45rem;color:var(--text-muted);font-size:0.9rem;}.category-links.svelte-q5ccww button:where(.svelte-q5ccww) {width:100%;text-align:left;font:inherit;color:inherit;background:transparent;border:1px solid transparent;border-radius:0.45rem;padding:0.35rem 0.45rem;cursor:pointer;max-width:100%;}.category-links.svelte-q5ccww button:where(.svelte-q5ccww):hover {background:var(--surface-2);color:var(--text-normal);}\n\n  @media (max-width: 900px) {.board-grid.svelte-q5ccww {grid-template-columns:1fr;}.categories-overlay-shell.svelte-q5ccww {display:block;position:absolute;inset:0 0 auto auto;z-index:5;pointer-events:none;}.categories-tab.svelte-q5ccww {display:inline-flex;align-items:center;justify-content:center;position:absolute;top:0.5rem;right:0;transform:translateX(calc(100% - 0.75rem));writing-mode:vertical-rl;text-orientation:mixed;letter-spacing:0.03em;padding:0.55rem 0.35rem;border-radius:0.7rem 0 0 0.7rem;border:1px solid var(--border-color);border-right:0;background:var(--surface-1);color:inherit;box-shadow:0 8px 20px rgba(0, 0, 0, 0.12);cursor:pointer;pointer-events:auto;transition:transform 180ms ease, background-color 160ms ease;}.categories-overlay-shell.svelte-q5ccww:hover .categories-tab:where(.svelte-q5ccww),\n    .categories-overlay-shell.open.svelte-q5ccww .categories-tab:where(.svelte-q5ccww) {transform:translateX(0);background:var(--surface-2);}.categories-overlay-backdrop.svelte-q5ccww {display:block;position:fixed;inset:0;border:0;padding:0;background:transparent;opacity:0;pointer-events:none;}.categories-overlay-shell.open.svelte-q5ccww .categories-overlay-backdrop:where(.svelte-q5ccww) {pointer-events:auto;}.side-column.svelte-q5ccww {position:absolute;top:0;right:0;width:min(78vw, 320px);max-width:calc(100vw - 1rem);transform:translateX(calc(100% + 0.75rem));opacity:0;pointer-events:none;transition:transform 220ms ease, opacity 220ms ease;z-index:6;}.categories-overlay-shell.svelte-q5ccww:hover .side-column:where(.svelte-q5ccww),\n    .categories-overlay-shell.open.svelte-q5ccww .side-column:where(.svelte-q5ccww) {transform:translateX(0);opacity:1;pointer-events:auto;}.stats-grid.svelte-q5ccww {width:100%;min-width:0;}.header-actions.svelte-q5ccww {width:100%;margin-left:0;flex-wrap:wrap;}.header-actions.svelte-q5ccww button:where(.svelte-q5ccww) {flex:1 1 0;}\n  }\n\n  @media (max-width: 600px) {.page-header.svelte-q5ccww {gap:0.7rem;}h1.svelte-q5ccww {width:100%;white-space:normal;line-height:1.15;}.stats-grid.svelte-q5ccww {gap:0.4rem;grid-template-columns:repeat(2, minmax(0, 1fr));}.stats-grid.svelte-q5ccww > div:where(.svelte-q5ccww) {padding:0.45rem 0.55rem;border-radius:0.75rem;}.stats-grid.svelte-q5ccww span:where(.svelte-q5ccww) {font-size:1rem;}.stats-grid.svelte-q5ccww small:where(.svelte-q5ccww) {font-size:0.72rem;}.task-list.svelte-q5ccww,\n    .panel.svelte-q5ccww {padding:0.8rem;}.categories-tab.svelte-q5ccww {top:0.35rem;padding:0.45rem 0.3rem;font-size:0.8rem;}\n  }\n\n  @media (max-width: 400px) {.page-header.svelte-q5ccww {align-items:stretch;}.stats-grid.svelte-q5ccww > div:where(.svelte-q5ccww) {padding:0.35rem 0.45rem;border-radius:0.65rem;gap:0.05rem;}.stats-grid.svelte-q5ccww span:where(.svelte-q5ccww) {font-size:0.9rem;}.stats-grid.svelte-q5ccww small:where(.svelte-q5ccww) {font-size:0.65rem;}.header-actions.svelte-q5ccww {gap:0.35rem;}.side-column.svelte-q5ccww {width:calc(100vw - 0.8rem);max-width:calc(100vw - 0.8rem);}\n  }"
};
function TaskBoard($$anchor, $$props) {
  push($$props, true);
  append_styles($$anchor, $$css4);
  let title = prop($$props, "title", 3, "Dashboard"), filterUncategorized = prop($$props, "filterUncategorized", 3, false), showCategoriesCard = prop($$props, "showCategoriesCard", 3, true), boardActive = prop($$props, "boardActive", 3, true), rescanLoading = prop($$props, "rescanLoading", 3, false);
  let draggingTaskId = state(null);
  let finishedExpanded = state(false);
  let categoriesPanelOpen = state(false);
  const sortedTasks = user_derived(() => [...visibleTasks()].sort((a, b) => a.sortOrder - b.sortOrder));
  const incompleteTasks = user_derived(() => get(sortedTasks).filter((task) => !task.completed));
  const finishedTasks = user_derived(() => get(sortedTasks).filter((task) => task.completed));
  const openCount = user_derived(() => get(sortedTasks).filter((task) => !task.completed).length);
  const doneCount = user_derived(() => get(sortedTasks).filter((task) => task.completed).length);
  const sortedCategories = user_derived(() => [...categories].sort((a, b) => a.sortOrder - b.sortOrder));
  const dashboardUncategorizedTasks = user_derived(() => get(sortedTasks).filter((task) => !task.categoryId));
  const showSubtagSections = user_derived(() => !!$$props.filterCategoryId && get(sortedTasks).some((task) => !!task.subTag));
  const openUntaggedCategoryTasks = user_derived(() => get(showSubtagSections) ? get(incompleteTasks).filter((task) => !task.subTag) : []);
  const finishedUntaggedCategoryTasks = user_derived(() => get(showSubtagSections) ? get(finishedTasks).filter((task) => !task.subTag) : []);
  const openSubtagGroups = user_derived(() => {
    return get(showSubtagSections) ? groupBySubtag(get(incompleteTasks)) : [];
  });
  const finishedSubtagGroups = user_derived(() => {
    return get(showSubtagSections) ? groupBySubtag(get(finishedTasks)) : [];
  });
  const showCategorySections = user_derived(() => !!$$props.filterGroupId && !$$props.filterCategoryId);
  function groupByCategory(list) {
    const groups = /* @__PURE__ */ new Map();
    const rootTasks = [];
    for (const task of list) {
      if (!task.categoryId) {
        rootTasks.push(task);
        continue;
      }
      const existing = groups.get(task.categoryId);
      if (existing) {
        existing.tasks.push(task);
      } else {
        const cat = get(sortedCategories).find((c) => c.id === task.categoryId);
        groups.set(task.categoryId, {
          name: cat?.name ?? "Unknown",
          categoryId: task.categoryId,
          tasks: [task]
        });
      }
    }
    return { rootTasks, categoryGroups: [...groups.values()] };
  }
  const openByCategory = user_derived(() => get(showCategorySections) ? groupByCategory(get(incompleteTasks)) : { rootTasks: [], categoryGroups: [] });
  const finishedByCategory = user_derived(() => get(showCategorySections) ? groupByCategory(get(finishedTasks)) : { rootTasks: [], categoryGroups: [] });
  {
    let lastFilterKey = "";
    user_effect(() => {
      const key2 = `${$$props.filterCategoryId ?? ""}|${$$props.filterGroupId ?? ""}|${filterUncategorized() ?? ""}`;
      if (lastFilterKey && key2 !== lastFilterKey) {
        set(finishedExpanded, false);
      }
      lastFilterKey = key2;
    });
  }
  user_effect(() => {
    if (!showCategoriesCard()) {
      set(categoriesPanelOpen, false);
    }
  });
  function groupBySubtag(list) {
    const groups = /* @__PURE__ */ new Map();
    for (const task of list) {
      if (!task.subTag) continue;
      const items = groups.get(task.subTag) ?? [];
      items.push(task);
      groups.set(task.subTag, items);
    }
    return [...groups.entries()].map(([subTag, tasks2]) => ({ subTag, tasks: tasks2 }));
  }
  function onDropOn(targetTaskId, targetSubTag) {
    if (!get(draggingTaskId) || get(draggingTaskId) === targetTaskId) {
      set(draggingTaskId, null);
      return;
    }
    if (get(showSubtagSections) && targetSubTag !== void 0) {
      const draggedTask = get(sortedTasks).find((t) => t.id === get(draggingTaskId));
      const currentSubTag = draggedTask?.subTag ?? "";
      if (currentSubTag !== targetSubTag) {
        void changeTaskSubTag(get(draggingTaskId), targetSubTag || void 0);
        set(draggingTaskId, null);
        return;
      }
    }
    moveTask(get(draggingTaskId), targetTaskId);
    set(draggingTaskId, null);
  }
  var section = root4();
  var header = child(section);
  var h1 = child(header);
  var text2 = child(h1, true);
  reset(h1);
  var div = sibling(h1, 2);
  var div_1 = child(div);
  var span = child(div_1);
  var text_1 = child(span, true);
  reset(span);
  next();
  reset(div_1);
  var div_2 = sibling(div_1, 2);
  var span_1 = child(div_2);
  var text_2 = child(span_1, true);
  reset(span_1);
  next();
  reset(div_2);
  reset(div);
  var div_3 = sibling(div, 2);
  var button = child(div_3);
  let classes;
  var button_1 = sibling(button, 2);
  var text_3 = child(button_1, true);
  reset(button_1);
  reset(div_3);
  reset(header);
  var div_4 = sibling(header, 2);
  let classes_1;
  var div_5 = child(div_4);
  var node = child(div_5);
  {
    let $0 = user_derived(() => !!$$props.filterCategoryId);
    QuickCapture(node, {
      get defaultCategoryId() {
        return $$props.filterCategoryId;
      },
      get locked() {
        return get($0);
      }
    });
  }
  var section_1 = sibling(node, 2);
  var node_1 = child(section_1);
  {
    var consequent = ($$anchor2) => {
      var div_6 = root_14();
      append($$anchor2, div_6);
    };
    var consequent_4 = ($$anchor2) => {
      var fragment = root_24();
      var section_2 = first_child(fragment);
      var div_7 = child(section_2);
      var small = sibling(child(div_7), 2);
      var text_4 = child(small, true);
      reset(small);
      reset(div_7);
      var node_2 = sibling(div_7, 2);
      {
        var consequent_1 = ($$anchor3) => {
          var div_8 = root_34();
          each(div_8, 21, () => get(incompleteTasks), (task) => task.id, ($$anchor4, task) => {
            TaskCard($$anchor4, {
              get task() {
                return get(task);
              },
              onDragStart: (id) => set(draggingTaskId, id, true),
              onDropOn: (id) => onDropOn(id),
              showCategory: true,
              onGoToCategory: (catId) => $$props.onSelectCategory?.(catId)
            });
          });
          reset(div_8);
          append($$anchor3, div_8);
        };
        if_block(node_2, ($$render) => {
          if (get(openCount) > 0) $$render(consequent_1);
        });
      }
      reset(section_2);
      var section_3 = sibling(section_2, 2);
      var button_2 = child(section_3);
      var span_2 = child(button_2);
      var text_5 = child(span_2);
      reset(span_2);
      var span_3 = sibling(span_2, 2);
      let classes_2;
      reset(button_2);
      var node_3 = sibling(button_2, 2);
      {
        var consequent_3 = ($$anchor3) => {
          var fragment_2 = comment();
          var node_4 = first_child(fragment_2);
          {
            var consequent_2 = ($$anchor4) => {
              var div_9 = root_6();
              append($$anchor4, div_9);
            };
            var alternate = ($$anchor4) => {
              var div_10 = root_7();
              each(div_10, 21, () => get(finishedTasks), (task) => task.id, ($$anchor5, task) => {
                TaskCard($$anchor5, {
                  get task() {
                    return get(task);
                  },
                  onDragStart: (id) => set(draggingTaskId, id, true),
                  onDropOn: (id) => onDropOn(id),
                  showCategory: true,
                  onGoToCategory: (catId) => $$props.onSelectCategory?.(catId)
                });
              });
              reset(div_10);
              append($$anchor4, div_10);
            };
            if_block(node_4, ($$render) => {
              if (get(doneCount) === 0) $$render(consequent_2);
              else $$render(alternate, false);
            });
          }
          append($$anchor3, fragment_2);
        };
        if_block(node_3, ($$render) => {
          if (get(finishedExpanded)) $$render(consequent_3);
        });
      }
      reset(section_3);
      template_effect(() => {
        set_text(text_4, get(openCount));
        set_attribute2(button_2, "aria-expanded", get(finishedExpanded));
        set_text(text_5, `Finished Tasks (${get(doneCount) ?? ""})`);
        classes_2 = set_class(span_3, 1, "chevron svelte-q5ccww", null, classes_2, { expanded: get(finishedExpanded) });
      });
      delegated("click", button_2, () => set(finishedExpanded, !get(finishedExpanded)));
      append($$anchor2, fragment);
    };
    var alternate_3 = ($$anchor2) => {
      var fragment_4 = root_9();
      var section_4 = first_child(fragment_4);
      var div_11 = child(section_4);
      var small_1 = sibling(child(div_11), 2);
      var text_6 = child(small_1, true);
      reset(small_1);
      reset(div_11);
      var node_5 = sibling(div_11, 2);
      {
        var consequent_5 = ($$anchor3) => {
        };
        var consequent_7 = ($$anchor3) => {
          var fragment_5 = root_10();
          var node_6 = first_child(fragment_5);
          {
            var consequent_6 = ($$anchor4) => {
              var section_5 = root_11();
              var div_12 = sibling(child(section_5), 2);
              each(div_12, 21, () => get(openByCategory).rootTasks, (task) => task.id, ($$anchor5, task) => {
                TaskCard($$anchor5, {
                  get task() {
                    return get(task);
                  },
                  onDragStart: (id) => set(draggingTaskId, id, true),
                  onDropOn
                });
              });
              reset(div_12);
              reset(section_5);
              append($$anchor4, section_5);
            };
            if_block(node_6, ($$render) => {
              if (get(openByCategory).rootTasks.length) $$render(consequent_6);
            });
          }
          var node_7 = sibling(node_6, 2);
          each(node_7, 17, () => get(openByCategory).categoryGroups, (group) => group.categoryId, ($$anchor4, group) => {
            var section_6 = root_132();
            var div_13 = child(section_6);
            var text_7 = child(div_13, true);
            reset(div_13);
            var div_14 = sibling(div_13, 2);
            each(div_14, 21, () => get(group).tasks, (task) => task.id, ($$anchor5, task) => {
              TaskCard($$anchor5, {
                get task() {
                  return get(task);
                },
                onDragStart: (id) => set(draggingTaskId, id, true),
                onDropOn
              });
            });
            reset(div_14);
            reset(section_6);
            template_effect(() => set_text(text_7, get(group).name));
            append($$anchor4, section_6);
          });
          append($$anchor3, fragment_5);
        };
        var consequent_9 = ($$anchor3) => {
          var fragment_8 = root_15();
          var node_8 = first_child(fragment_8);
          {
            var consequent_8 = ($$anchor4) => {
              var div_15 = root_16();
              each(div_15, 21, () => get(openUntaggedCategoryTasks), (task) => task.id, ($$anchor5, task) => {
                TaskCard($$anchor5, {
                  get task() {
                    return get(task);
                  },
                  onDragStart: (id) => set(draggingTaskId, id, true),
                  onDropOn: (id) => onDropOn(id, "")
                });
              });
              reset(div_15);
              append($$anchor4, div_15);
            };
            if_block(node_8, ($$render) => {
              if (get(openUntaggedCategoryTasks).length) $$render(consequent_8);
            });
          }
          var node_9 = sibling(node_8, 2);
          each(node_9, 17, () => get(openSubtagGroups), (group) => group.subTag, ($$anchor4, group) => {
            var section_7 = root_18();
            var div_16 = child(section_7);
            var text_8 = child(div_16, true);
            reset(div_16);
            var div_17 = sibling(div_16, 2);
            each(div_17, 21, () => get(group).tasks, (task) => task.id, ($$anchor5, task) => {
              TaskCard($$anchor5, {
                get task() {
                  return get(task);
                },
                onDragStart: (id) => set(draggingTaskId, id, true),
                onDropOn: (id) => onDropOn(id, get(group).subTag)
              });
            });
            reset(div_17);
            reset(section_7);
            template_effect(() => set_text(text_8, get(group).subTag));
            append($$anchor4, section_7);
          });
          append($$anchor3, fragment_8);
        };
        var alternate_1 = ($$anchor3) => {
          var div_18 = root_20();
          each(div_18, 21, () => get(incompleteTasks), (task) => task.id, ($$anchor4, task) => {
            TaskCard($$anchor4, {
              get task() {
                return get(task);
              },
              onDragStart: (id) => set(draggingTaskId, id, true),
              onDropOn
            });
          });
          reset(div_18);
          append($$anchor3, div_18);
        };
        if_block(node_5, ($$render) => {
          if (get(openCount) === 0) $$render(consequent_5);
          else if (get(showCategorySections)) $$render(consequent_7, 1);
          else if (get(showSubtagSections)) $$render(consequent_9, 2);
          else $$render(alternate_1, false);
        });
      }
      reset(section_4);
      var section_8 = sibling(section_4, 2);
      var button_3 = child(section_8);
      var span_4 = child(button_3);
      var text_9 = child(span_4);
      reset(span_4);
      var span_5 = sibling(span_4, 2);
      let classes_3;
      reset(button_3);
      var node_10 = sibling(button_3, 2);
      {
        var consequent_15 = ($$anchor3) => {
          var fragment_12 = comment();
          var node_11 = first_child(fragment_12);
          {
            var consequent_10 = ($$anchor4) => {
              var div_19 = root_232();
              append($$anchor4, div_19);
            };
            var consequent_12 = ($$anchor4) => {
              var fragment_13 = root_242();
              var node_12 = first_child(fragment_13);
              {
                var consequent_11 = ($$anchor5) => {
                  var section_9 = root_25();
                  var div_20 = sibling(child(section_9), 2);
                  each(div_20, 21, () => get(finishedByCategory).rootTasks, (task) => task.id, ($$anchor6, task) => {
                    TaskCard($$anchor6, {
                      get task() {
                        return get(task);
                      },
                      onDragStart: (id) => set(draggingTaskId, id, true),
                      onDropOn
                    });
                  });
                  reset(div_20);
                  reset(section_9);
                  append($$anchor5, section_9);
                };
                if_block(node_12, ($$render) => {
                  if (get(finishedByCategory).rootTasks.length) $$render(consequent_11);
                });
              }
              var node_13 = sibling(node_12, 2);
              each(node_13, 17, () => get(finishedByCategory).categoryGroups, (group) => group.categoryId, ($$anchor5, group) => {
                var section_10 = root_27();
                var div_21 = child(section_10);
                var text_10 = child(div_21, true);
                reset(div_21);
                var div_22 = sibling(div_21, 2);
                each(div_22, 21, () => get(group).tasks, (task) => task.id, ($$anchor6, task) => {
                  TaskCard($$anchor6, {
                    get task() {
                      return get(task);
                    },
                    onDragStart: (id) => set(draggingTaskId, id, true),
                    onDropOn
                  });
                });
                reset(div_22);
                reset(section_10);
                template_effect(() => set_text(text_10, get(group).name));
                append($$anchor5, section_10);
              });
              append($$anchor4, fragment_13);
            };
            var consequent_14 = ($$anchor4) => {
              var fragment_16 = root_29();
              var node_14 = first_child(fragment_16);
              {
                var consequent_13 = ($$anchor5) => {
                  var div_23 = root_30();
                  each(div_23, 21, () => get(finishedUntaggedCategoryTasks), (task) => task.id, ($$anchor6, task) => {
                    TaskCard($$anchor6, {
                      get task() {
                        return get(task);
                      },
                      onDragStart: (id) => set(draggingTaskId, id, true),
                      onDropOn: (id) => onDropOn(id, "")
                    });
                  });
                  reset(div_23);
                  append($$anchor5, div_23);
                };
                if_block(node_14, ($$render) => {
                  if (get(finishedUntaggedCategoryTasks).length) $$render(consequent_13);
                });
              }
              var node_15 = sibling(node_14, 2);
              each(node_15, 17, () => get(finishedSubtagGroups), (group) => group.subTag, ($$anchor5, group) => {
                var section_11 = root_322();
                var div_24 = child(section_11);
                var text_11 = child(div_24, true);
                reset(div_24);
                var div_25 = sibling(div_24, 2);
                each(div_25, 21, () => get(group).tasks, (task) => task.id, ($$anchor6, task) => {
                  TaskCard($$anchor6, {
                    get task() {
                      return get(task);
                    },
                    onDragStart: (id) => set(draggingTaskId, id, true),
                    onDropOn: (id) => onDropOn(id, get(group).subTag)
                  });
                });
                reset(div_25);
                reset(section_11);
                template_effect(() => set_text(text_11, get(group).subTag));
                append($$anchor5, section_11);
              });
              append($$anchor4, fragment_16);
            };
            var alternate_2 = ($$anchor4) => {
              var div_26 = root_342();
              each(div_26, 21, () => get(finishedTasks), (task) => task.id, ($$anchor5, task) => {
                TaskCard($$anchor5, {
                  get task() {
                    return get(task);
                  },
                  onDragStart: (id) => set(draggingTaskId, id, true),
                  onDropOn
                });
              });
              reset(div_26);
              append($$anchor4, div_26);
            };
            if_block(node_11, ($$render) => {
              if (get(doneCount) === 0) $$render(consequent_10);
              else if (get(showCategorySections)) $$render(consequent_12, 1);
              else if (get(showSubtagSections)) $$render(consequent_14, 2);
              else $$render(alternate_2, false);
            });
          }
          append($$anchor3, fragment_12);
        };
        if_block(node_10, ($$render) => {
          if (get(finishedExpanded)) $$render(consequent_15);
        });
      }
      reset(section_8);
      template_effect(() => {
        set_text(text_6, get(openCount));
        set_attribute2(button_3, "aria-expanded", get(finishedExpanded));
        set_text(text_9, `Finished Tasks (${get(doneCount) ?? ""})`);
        classes_3 = set_class(span_5, 1, "chevron svelte-q5ccww", null, classes_3, { expanded: get(finishedExpanded) });
      });
      delegated("click", button_3, () => set(finishedExpanded, !get(finishedExpanded)));
      append($$anchor2, fragment_4);
    };
    if_block(node_1, ($$render) => {
      if (get(sortedTasks).length === 0) $$render(consequent);
      else if (showCategoriesCard()) $$render(consequent_4, 1);
      else $$render(alternate_3, false);
    });
  }
  reset(section_1);
  reset(div_5);
  var node_16 = sibling(div_5, 2);
  {
    var consequent_16 = ($$anchor2) => {
      var div_27 = root_36();
      let classes_4;
      var button_4 = child(div_27);
      var button_5 = sibling(button_4, 2);
      var aside = sibling(button_5, 2);
      var section_12 = child(aside);
      var ul = sibling(child(section_12), 2);
      var node_17 = child(ul);
      each(node_17, 17, () => get(sortedCategories), index, ($$anchor3, category) => {
        var li = root_37();
        var button_6 = child(li);
        var text_12 = child(button_6);
        reset(button_6);
        reset(li);
        template_effect(() => set_text(text_12, `${get(category).emoji ? `${get(category).emoji} ` : ""}${get(category).name ?? ""}`));
        delegated("click", button_6, () => $$props.onSelectCategory?.(get(category).id));
        append($$anchor3, li);
      });
      var li_1 = sibling(node_17, 2);
      var button_7 = child(li_1);
      reset(li_1);
      reset(ul);
      reset(section_12);
      reset(aside);
      reset(div_27);
      template_effect(() => {
        classes_4 = set_class(div_27, 1, "categories-overlay-shell svelte-q5ccww", null, classes_4, { open: get(categoriesPanelOpen) });
        set_attribute2(button_4, "aria-expanded", get(categoriesPanelOpen));
      });
      delegated("click", button_4, () => set(categoriesPanelOpen, !get(categoriesPanelOpen)));
      delegated("click", button_5, () => set(categoriesPanelOpen, false));
      delegated("click", button_7, () => $$props.onSelectUncategorized?.());
      append($$anchor2, div_27);
    };
    if_block(node_16, ($$render) => {
      if (showCategoriesCard()) $$render(consequent_16);
    });
  }
  reset(div_4);
  reset(section);
  template_effect(() => {
    set_text(text2, title());
    set_text(text_1, get(openCount));
    set_text(text_2, get(doneCount));
    classes = set_class(button, 1, "svelte-q5ccww", null, classes, { active: boardActive() });
    button_1.disabled = rescanLoading();
    set_text(text_3, rescanLoading() ? "Scanning\u2026" : "Rescan");
    classes_1 = set_class(div_4, 1, "board-grid svelte-q5ccww", null, classes_1, { "single-column": !showCategoriesCard() });
  });
  delegated("click", button, () => $$props.onBoard?.());
  delegated("click", button_1, () => $$props.onRescan?.());
  append($$anchor, section);
  pop();
}
delegate(["click"]);

// components/App.svelte
var root_17 = from_html(`<button type="button" class="tasks-dashboard-sidebar-backdrop" aria-label="Close sidebar"></button>`);
var root_26 = from_html(`<div class="error-banner"> </div>`);
var root5 = from_html(`<div><aside class="tasks-dashboard-sidebar-pane" id="tasks-dashboard-sidebar"><!></aside> <!> <main class="tasks-dashboard-main"><button type="button" class="tasks-dashboard-sidebar-toggle" aria-controls="tasks-dashboard-sidebar">\u2630 Menu</button> <!> <!></main></div>`);
function App($$anchor, $$props) {
  push($$props, true);
  let containerEl = state(null);
  let isNarrowViewport = state(false);
  let sidebarOpen = state(true);
  user_effect(() => {
    initializeTodoState($$props.plugin);
  });
  const activeGroup = user_derived(() => nav.groupId ? categoryGroups.find((g) => g.id === nav.groupId) : void 0);
  const activeCategory = user_derived(() => nav.categoryId ? getCategory(nav.categoryId) : void 0);
  const isDashboardView = user_derived(() => !nav.groupId && !nav.categoryId && !nav.uncategorizedOnly);
  const pageTitle = user_derived(() => get(activeCategory) ? `${get(activeCategory).emoji ? `${get(activeCategory).emoji} ` : ""}${get(activeCategory).name}` : nav.uncategorizedOnly ? "Uncategorized / Group-level" : get(activeGroup) ? get(activeGroup).name : "Dashboard");
  function applyResponsiveLayout(width) {
    const nextIsNarrow = (width ?? get(containerEl)?.clientWidth ?? 0) <= 900;
    if (nextIsNarrow !== get(isNarrowViewport)) {
      set(isNarrowViewport, nextIsNarrow);
      set(sidebarOpen, !nextIsNarrow);
    }
  }
  function toggleSidebar() {
    set(sidebarOpen, !get(sidebarOpen));
  }
  function closeSidebarOnMobileNavigate() {
    if (get(isNarrowViewport)) set(sidebarOpen, false);
  }
  onMount(() => {
    if (!get(containerEl)) return;
    applyResponsiveLayout(get(containerEl).clientWidth);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      applyResponsiveLayout(entry.contentRect.width);
    });
    observer.observe(get(containerEl));
    return () => observer.disconnect();
  });
  var div = root5();
  let classes;
  var aside = child(div);
  var node = child(aside);
  Sidebar(node, {
    get mobile() {
      return get(isNarrowViewport);
    },
    onNavigate: closeSidebarOnMobileNavigate
  });
  reset(aside);
  var node_1 = sibling(aside, 2);
  {
    var consequent = ($$anchor2) => {
      var button = root_17();
      delegated("click", button, () => set(sidebarOpen, false));
      append($$anchor2, button);
    };
    if_block(node_1, ($$render) => {
      if (get(isNarrowViewport) && get(sidebarOpen)) $$render(consequent);
    });
  }
  var main = sibling(node_1, 2);
  var button_1 = child(main);
  var node_2 = sibling(button_1, 2);
  {
    var consequent_1 = ($$anchor2) => {
      var div_1 = root_26();
      var text2 = child(div_1);
      reset(div_1);
      template_effect(() => set_text(text2, `Scan failed: ${ui.errorMessage ?? ""}`));
      append($$anchor2, div_1);
    };
    if_block(node_2, ($$render) => {
      if (ui.errorMessage) $$render(consequent_1);
    });
  }
  var node_3 = sibling(node_2, 2);
  TaskBoard(node_3, {
    get title() {
      return get(pageTitle);
    },
    get filterCategoryId() {
      return nav.categoryId;
    },
    get filterGroupId() {
      return nav.groupId;
    },
    get filterUncategorized() {
      return nav.uncategorizedOnly;
    },
    get showCategoriesCard() {
      return get(isDashboardView);
    },
    get boardActive() {
      return get(isDashboardView);
    },
    get rescanLoading() {
      return ui.loading;
    },
    onSelectCategory: (categoryId) => setNavCategory(categoryId),
    get onSelectUncategorized() {
      return setNavUncategorized;
    },
    get onBoard() {
      return setNavDashboard;
    },
    onRescan: () => refreshVaultState()
  });
  reset(main);
  reset(div);
  bind_this(div, ($$value) => set(containerEl, $$value), () => get(containerEl));
  template_effect(() => {
    classes = set_class(div, 1, "tasks-dashboard-container", null, classes, {
      "is-narrow": get(isNarrowViewport),
      "sidebar-open": get(sidebarOpen)
    });
    set_attribute2(button_1, "aria-expanded", get(sidebarOpen));
  });
  delegated("click", button_1, toggleSidebar);
  append($$anchor, div);
  pop();
}
delegate(["click"]);

// TodoView.ts
var VIEW_TYPE_TODO = "tasks-dashboard-view";
var TodoView = class extends import_obsidian3.ItemView {
  plugin;
  component = null;
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE_TODO;
  }
  getDisplayText() {
    return "Tasks Dashboard";
  }
  getIcon() {
    return "check-square";
  }
  async onOpen() {
    this.contentEl.empty();
    this.contentEl.addClass("tasks-dashboard-root");
    this.component = mount(App, {
      target: this.contentEl,
      props: { plugin: this.plugin }
    });
  }
  async onClose() {
    if (this.component) {
      unmount(this.component);
      this.component = null;
    }
    this.contentEl.removeClass("tasks-dashboard-root");
  }
};

// settings.ts
var import_obsidian4 = require("obsidian");
var DEFAULT_SETTINGS = {
  tagPrefix: "#todo",
  inboxFile: "Todo Inbox.md",
  archivedGroups: [],
  showCompleted: true
};
var TodoSettingTab = class extends import_obsidian4.PluginSettingTab {
  plugin;
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Tasks Dashboard Settings" });
    new import_obsidian4.Setting(containerEl).setName("Tag prefix").setDesc("Tag used to discover tasks in your vault").addText(
      (text2) => text2.setPlaceholder("#todo").setValue(this.plugin.settings.tagPrefix).onChange(async (value) => {
        this.plugin.settings.tagPrefix = value.trim() || "#todo";
        await this.plugin.saveSettings();
        await this.plugin.refreshTodoState();
      })
    );
    new import_obsidian4.Setting(containerEl).setName("Inbox file").setDesc("File used by Quick Capture for new tasks").addText(
      (text2) => text2.setPlaceholder("Todo Inbox.md").setValue(this.plugin.settings.inboxFile).onChange(async (value) => {
        this.plugin.settings.inboxFile = value.trim() || DEFAULT_SETTINGS.inboxFile;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian4.Setting(containerEl).setName("Show completed").setDesc("Show completed tasks in the task board").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.showCompleted).onChange(async (value) => {
        this.plugin.settings.showCompleted = value;
        await this.plugin.saveSettings();
      })
    );
  }
};

// main.ts
var TodoPlugin = class extends import_obsidian5.Plugin {
  settings = DEFAULT_SETTINGS;
  customSortOrders = {};
  async onload() {
    await this.loadPluginData();
    this.registerView(VIEW_TYPE_TODO, (leaf) => new TodoView(leaf, this));
    this.addRibbonIcon("check-square", "Tasks Dashboard", () => {
      void this.activateView();
    });
    this.addCommand({
      id: "open-tasks-dashboard",
      name: "Open Tasks Dashboard",
      callback: () => {
        void this.activateView();
      }
    });
    this.addCommand({
      id: "rescan-tasks-dashboard-vault",
      name: "Rescan Tasks Dashboard tasks",
      callback: () => {
        void this.refreshTodoState();
      }
    });
    this.addSettingTab(new TodoSettingTab(this.app, this));
    initializeTodoState(this);
    await this.refreshTodoState();
  }
  async onunload() {
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_TODO)) {
      leaf.detach();
    }
  }
  async activateView() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_TODO)[0];
    if (!leaf) {
      leaf = workspace.getLeaf("tab");
      await leaf.setViewState({ type: VIEW_TYPE_TODO, active: true });
    }
    workspace.revealLeaf(leaf);
  }
  async loadPluginData() {
    const data = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data?.settings ?? data ?? {});
    this.customSortOrders = data?.customSortOrders ?? {};
  }
  async savePluginData() {
    await this.saveData({ settings: this.settings, customSortOrders: this.customSortOrders });
  }
  async saveSettings() {
    await this.savePluginData();
  }
  async saveSortOrders() {
    await this.savePluginData();
  }
  async refreshTodoState() {
    await refreshVaultState();
  }
};
