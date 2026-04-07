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
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ViewTabsPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian3 = require("obsidian");

// src/basesTabs.base.ts
var import_obsidian = require("obsidian");

// src/leafUtils.ts
function findLeafForBasesView(app, el) {
  const leaves = app.workspace.getLeavesOfType("bases");
  for (const leaf of leaves) {
    const view = leaf.view;
    if (view.containerEl === el) return leaf;
  }
  return app.workspace.getMostRecentLeaf();
}

// src/types.ts
var CONTAINER_CLASS = "pill-tabs-container";
var ROW_CLASS = "pill-tabs-row";
var ACTIVE_CLASS = "is-active";

// src/basesTabs.base.ts
async function injectBasesTabs(app) {
  const basesViews = document.querySelectorAll(".bases-view");
  if (!basesViews.length) return;
  const file = app.workspace.getActiveFile();
  if (!file || file.extension !== "base") return;
  let viewNames = [];
  try {
    const raw = await app.vault.read(file);
    const parsed = (0, import_obsidian.parseYaml)(raw);
    viewNames = parsed.views?.map((v) => v.name) ?? [];
  } catch {
    return;
  }
  basesViews.forEach((basesView) => {
    if (basesView.closest(".cm-embed-block.cm-lang-base")) return;
    const root = basesView.parentElement;
    if (!root) return;
    const header = root.querySelector(".bases-header");
    if (!header) return;
    let row = header.nextElementSibling;
    if (!row || !row.classList.contains(ROW_CLASS)) {
      row = document.createElement("div");
      row.className = `bases-header-row ${ROW_CLASS}`;
      header.after(row);
    }
    let container = row.querySelector(`.${CONTAINER_CLASS}`);
    if (!container) {
      container = document.createElement("div");
      container.className = CONTAINER_CLASS;
      row.appendChild(container);
    }
    const basesContainer = container;
    if (!basesContainer._basesClickBound) {
      basesContainer.addEventListener("click", (e) => {
        void (async () => {
          const btn = e.target.closest(
            ".bases-toolbar-menu-item"
          );
          if (!btn) return;
          const name = btn.textContent;
          const leaf2 = findLeafForBasesView(app, basesView);
          if (!leaf2) return;
          const deferred = leaf2;
          if (deferred.loadIfDeferred) {
            await deferred.loadIfDeferred();
          }
          const controller2 = leaf2.view?.controller;
          if (!controller2) return;
          controller2.selectView(name);
          updateActive(basesContainer, name);
        })();
      });
      basesContainer._basesClickBound = true;
    }
    const existing = Array.from(basesContainer.children).map(
      (el) => el.textContent
    );
    const same = existing.length === viewNames.length && existing.every((n, i) => n === viewNames[i]);
    if (!same) {
      basesContainer.empty();
      for (const name of viewNames) {
        const btn = document.createElement("button");
        btn.textContent = name;
        btn.className = "suggestion-item bases-toolbar-menu-item";
        basesContainer.appendChild(btn);
      }
    }
    const leaf = findLeafForBasesView(app, basesView);
    const controller = leaf?.view?.controller;
    if (controller?.getActiveView) {
      updateActive(basesContainer, controller.getActiveView().name);
    }
  });
}
function updateActive(container, activeName) {
  Array.from(container.children).forEach((el) => {
    el.classList.toggle(
      ACTIVE_CLASS,
      el.innerText === activeName
    );
  });
}

// src/basesEmbedParser.ts
var import_obsidian2 = require("obsidian");
async function readBaseViewNames(plugin, sourcePath) {
  const file = plugin.app.vault.getAbstractFileByPath(sourcePath);
  if (!(file instanceof import_obsidian2.TFile)) return null;
  const content = await plugin.app.vault.read(file);
  const baseBlocks = content.match(/```base[\s\S]*?```/g);
  if (!baseBlocks || baseBlocks.length === 0) return null;
  const block = baseBlocks[0];
  const names = [...block.matchAll(/^\s*name:\s*([^\n]+)/gm)].map((m) => m[1].trim());
  return names.length ? names : null;
}

// src/basesTabs.embed.ts
var CONTAINER_CLASS2 = "pill-tabs-container";
function initBasesEmbedTabs(plugin) {
  const observer = new MutationObserver((mutations) => {
    const activeFile = plugin.app.workspace.getActiveFile();
    if (!activeFile) return;
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        if (!node.classList.contains("cm-embed-block") || !node.classList.contains("cm-lang-base")) {
          continue;
        }
        const embed = node;
        if (!embed._basesHeader) {
          const header2 = embed.querySelector(".bases-header");
          if (!(header2 instanceof HTMLElement)) continue;
          embed._basesHeader = header2;
        }
        const header = embed._basesHeader;
        if (!embed.querySelector(`.${CONTAINER_CLASS2}`)) {
          injectTabs(embed, header);
        }
        if (!embed._pillViewNames) {
          void readBaseViewNames(plugin, activeFile.path).then((names) => {
            if (!names) return;
            embed._pillViewNames = names;
            removeTabs(embed);
            injectTabs(embed, header);
          });
        }
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  plugin.register(() => observer.disconnect());
}
function removeTabs(embed) {
  embed.querySelector(`.${CONTAINER_CLASS2}`)?.remove();
}
function injectTabs(embed, header) {
  if (embed.querySelector(`.${CONTAINER_CLASS2}`)) return;
  const container = document.createElement("div");
  container.className = CONTAINER_CLASS2;
  const names = embed._pillViewNames;
  const count = names?.length ?? 5;
  for (let i = 0; i < count; i++) {
    const btn = document.createElement("button");
    btn.textContent = names?.[i] ?? `View ${i + 1}`;
    btn.dataset.index = String(i);
    container.appendChild(btn);
  }
  container.onclick = (e) => {
    const btn = e.target?.closest("button");
    if (!btn) return;
    const index = Number(btn.dataset.index);
    setActive(container, btn);
    requestAnimationFrame(() => switchEmbedViewByIndex(embed, index));
  };
  header.after(container);
}
function setActive(container, active) {
  container.querySelector(".is-active")?.classList.remove("is-active");
  active.classList.add("is-active");
}
function switchEmbedViewByIndex(embed, index) {
  const header = embed._basesHeader;
  if (!header) return;
  const viewButton = header.querySelector(".text-icon-button");
  if (!viewButton) return;
  document.body.classList.add("pill-hide-bases-menu");
  viewButton.click();
  requestAnimationFrame(() => {
    const menu = document.querySelector(
      ".menu.bases-toolbar-views-menu"
    );
    if (!menu) {
      document.body.classList.remove("pill-hide-bases-menu");
      return;
    }
    const items = menu.querySelectorAll(
      ".suggestion-item.bases-toolbar-menu-item"
    );
    items[index]?.click();
    requestAnimationFrame(() => {
      document.body.classList.remove("pill-hide-bases-menu");
    });
  });
}

// main.ts
var ViewTabsPlugin = class extends import_obsidian3.Plugin {
  constructor() {
    super(...arguments);
    this.observer = null;
    this.refreshQueued = false;
  }
  onload() {
    void injectBasesTabs(this.app);
    initBasesEmbedTabs(this);
    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        if (!(file instanceof import_obsidian3.TFile) || file.extension !== "base") return;
        if (this.refreshQueued) return;
        this.refreshQueued = true;
        requestAnimationFrame(() => {
          this.refreshQueued = false;
          void injectBasesTabs(this.app);
        });
      })
    );
    this.startObserver();
  }
  onunload() {
    this.observer?.disconnect();
  }
  startObserver() {
    this.observer = new MutationObserver(() => {
      void injectBasesTabs(this.app);
    });
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
};
//# sourceMappingURL=main.js.map
