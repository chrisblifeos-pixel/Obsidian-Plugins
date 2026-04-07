const { Plugin, ItemView, WorkspaceLeaf, TFolder } = require('obsidian');

const VIEW_TYPE_BASE_LAUNCHER = "base-launcher-view";

const DATABASE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5V19C3 20.1 5.24 21 8 21S13 20.1 13 19V5"/><path d="M3 5C3 6.1 5.24 7 8 7S13 6.1 13 5"/><path d="M13 5C13 6.1 15.24 7 18 7S23 6.1 23 5V19C23 20.1 20.76 21 18 21S13 20.1 13 19"/><path d="M13 12C13 13.1 15.24 14 18 14S23 13.1 23 12"/><path d="M3 12C3 13.1 5.24 14 8 14S13 13.1 13 12"/></svg>`;

class BaseLauncherView extends ItemView {
    constructor(leaf) {
        super(leaf);
        // Default to the root Database folder path
        this.currentFolderPath = "_system/Bases";
    }

    getViewType() { return VIEW_TYPE_BASE_LAUNCHER; }
    getDisplayText() { return "Database Launcher"; }
    getIcon() { return "layout-grid"; }

    async onOpen() {
        this.render();
    }

    render() {
        const container = this.contentEl;
        container.empty();
        
        const rootContainer = container.createDiv({ cls: "base-launcher-container" });
        
        // --- Header Section ---
        const header = rootContainer.createDiv({ cls: "base-launcher-header-section" });
        header.createDiv({ cls: "base-launcher-title", text: "My Databases" });

        // Get the main Database folder
        const rootFolder = this.app.vault.getAbstractFileByPath("_system/Bases");

        if (!(rootFolder instanceof TFolder)) {
            rootContainer.createEl("p", { text: "Folder 'Database' not found at root." });
            return;
        }

        // --- Category Selector (Dropdown) ---
        const controls = header.createDiv({ cls: "base-launcher-controls" });
        const select = controls.createEl("select", { cls: "base-launcher-select" });

        // 1. Add Option for the Root Folder
        const rootOption = select.createEl("option", { value: rootFolder.path, text: "Main (Root)" });
        if (this.currentFolderPath === rootFolder.path) rootOption.selected = true;

        // 2. Find and Sort Subfolders (Categories)
        const subFolders = rootFolder.children
            .filter(f => f instanceof TFolder)
            .sort((a, b) => a.name.localeCompare(b.name));

        // 3. Add Options for Subfolders
        subFolders.forEach(sub => {
            const option = select.createEl("option", { value: sub.path, text: sub.name });
            if (this.currentFolderPath === sub.path) option.selected = true;
        });

        // Event Listener: Update path and re-render list on change
        select.addEventListener("change", (e) => {
            this.currentFolderPath = e.target.value;
            this.renderList(listContainer);
        });

        // --- List Section ---
        const listContainer = rootContainer.createDiv({ cls: "base-launcher-list" });
        this.renderList(listContainer);
    }

    renderList(container) {
        container.empty();

        // Get the folder based on the current selection
        const targetFolder = this.app.vault.getAbstractFileByPath(this.currentFolderPath);

        if (targetFolder instanceof TFolder) {
            // Helper to remove emojis for sorting
            const cleanName = (name) => {
                return name.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();
            };

            // Filter for .base files and Sort
            const files = targetFolder.children
                .filter(f => f.extension === "base")
                .sort((a, b) => {
                    const nameA = cleanName(a.basename);
                    const nameB = cleanName(b.basename);
                    return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
                });

            if (files.length === 0) {
                container.createEl("div", { cls: "base-launcher-empty", text: "No .base files in this category." });
                return;
            }

            files.forEach(file => {
                const item = container.createDiv({ cls: "base-launcher-item" });
                
                const icon = item.createDiv({ cls: "base-launcher-icon" });
                icon.innerHTML = DATABASE_SVG;
                
                item.createDiv({ cls: "base-launcher-text", text: file.basename });

                item.addEventListener("click", async () => {
                    const leaf = this.app.workspace.getLeaf(false);
                    await leaf.openFile(file);
                });
            });
        } else {
            container.createEl("p", { text: "Selected folder not found." });
        }
    }
}

module.exports = class BaseLauncherPlugin extends Plugin {
    async onload() {
        this.registerView(
            VIEW_TYPE_BASE_LAUNCHER,
            (leaf) => new BaseLauncherView(leaf)
        );

        this.addRibbonIcon("layout-grid", "Base Launcher", () => {
            this.activateView();
        });

        // Refresh if files are changed so the list/dropdown stays up to date
        this.registerEvent(this.app.vault.on("create", () => this.refreshView()));
        this.registerEvent(this.app.vault.on("delete", () => this.refreshView()));
        this.registerEvent(this.app.vault.on("rename", () => this.refreshView()));
    }

    async activateView() {
        const { workspace } = this.app;
        let leaf = workspace.getLeavesOfType(VIEW_TYPE_BASE_LAUNCHER)[0];

        if (!leaf) {
            leaf = workspace.getRightLeaf(false);
            await leaf.setViewState({
                type: VIEW_TYPE_BASE_LAUNCHER,
                active: true,
            });
        }
        workspace.revealLeaf(leaf);
    }

    refreshView() {
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_BASE_LAUNCHER);
        leaves.forEach(leaf => {
            if (leaf.view instanceof BaseLauncherView) {
                leaf.view.render();
            }
        });
    }
};