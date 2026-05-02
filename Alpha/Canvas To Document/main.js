/*
 * Canvas to Markdown — Obsidian Plugin
 * Converts .canvas files into readable Markdown notes.
 * Compatible with Obsidian Mobile (Android).
 */

'use strict';

const { Plugin, PluginSettingTab, Setting, Notice, Modal, TFile, normalizePath } = require('obsidian');

// ─── Default Settings ────────────────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  outputFolder: '',          // empty = same folder as canvas
  includeCardText: true,
  includeLinks: true,
  includeGroups: true,
  includeEmbeds: true,
  prependFrontmatter: true,
  linkStyle: 'wikilink',     // 'wikilink' | 'markdown'
  groupSeparator: '---',
  overwriteExisting: false,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function escapeMarkdown(text) {
  if (!text) return '';
  return text.replace(/([*_`~\[\]\\])/g, '\\$1');
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toISOString().replace('T', ' ').slice(0, 16);
}

// ─── Canvas Parser ────────────────────────────────────────────────────────────

class CanvasParser {
  constructor(raw) {
    try {
      this.data = JSON.parse(raw);
    } catch (e) {
      throw new Error('Invalid canvas JSON: ' + e.message);
    }
    this.nodes = this.data.nodes || [];
    this.edges = this.data.edges || [];
  }

  getGroups() {
    return this.nodes.filter(n => n.type === 'group');
  }

  getCards() {
    return this.nodes.filter(n => n.type === 'text');
  }

  getFileNodes() {
    return this.nodes.filter(n => n.type === 'file');
  }

  getLinkNodes() {
    return this.nodes.filter(n => n.type === 'link');
  }

  getEdges() {
    return this.edges;
  }

  // Find which group (if any) a node belongs to by bounding box
  getGroupForNode(node) {
    const groups = this.getGroups();
    for (const g of groups) {
      if (
        node.x >= g.x &&
        node.y >= g.y &&
        node.x + node.width <= g.x + g.width &&
        node.y + node.height <= g.y + g.height
      ) {
        return g;
      }
    }
    return null;
  }

  // Build adjacency: nodeId → [connected nodeIds with label]
  buildAdjacency() {
    const adj = {};
    for (const node of this.nodes) {
      adj[node.id] = [];
    }
    for (const edge of this.edges) {
      const label = edge.label || '';
      if (adj[edge.fromNode]) {
        adj[edge.fromNode].push({ id: edge.toNode, label, direction: 'out' });
      }
      if (adj[edge.toNode]) {
        adj[edge.toNode].push({ id: edge.fromNode, label, direction: 'in' });
      }
    }
    return adj;
  }

  getNodeById(id) {
    return this.nodes.find(n => n.id === id);
  }
}

// ─── Markdown Generator ───────────────────────────────────────────────────────

class MarkdownGenerator {
  constructor(settings) {
    this.settings = settings;
  }

  nodeLabel(node) {
    if (!node) return '(unknown)';
    switch (node.type) {
      case 'text':
        return (node.text || '').split('\n')[0].slice(0, 60) || '(card)';
      case 'file':
        return node.file || '(file)';
      case 'link':
        return node.url || '(link)';
      case 'group':
        return node.label || '(group)';
      default:
        return node.id;
    }
  }

  formatLink(target, label) {
    if (this.settings.linkStyle === 'markdown') {
      return `[${label || target}](${encodeURIComponent(target)})`;
    }
    return label && label !== target ? `[[${target}|${label}]]` : `[[${target}]]`;
  }

  generate(canvasFile, parser) {
    const lines = [];
    const settings = this.settings;
    const canvasName = canvasFile.basename;

    // Frontmatter
    if (settings.prependFrontmatter) {
      lines.push('---');
      lines.push(`source_canvas: "${canvasFile.path}"`);
      lines.push(`generated: "${formatDate(Date.now())}"`);
      lines.push(`canvas_nodes: ${parser.nodes.length}`);
      lines.push(`canvas_edges: ${parser.edges.length}`);
      lines.push('---');
      lines.push('');
    }

    lines.push(`# ${canvasName}`);
    lines.push('');
    lines.push(`> Exported from canvas \`${canvasFile.path}\``);
    lines.push('');

    // ── Groups ───────────────────────────────────────────
    if (settings.includeGroups && parser.getGroups().length > 0) {
      lines.push('## Groups');
      lines.push('');
      for (const group of parser.getGroups()) {
        const title = group.label || '*(unnamed group)*';
        lines.push(`### ${escapeMarkdown(title)}`);
        lines.push('');
        // Cards inside this group
        const members = parser.getCards().filter(n => {
          return parser.getGroupForNode(n) && parser.getGroupForNode(n).id === group.id;
        });
        if (members.length > 0) {
          lines.push(`*Contains ${members.length} card(s)*`);
          lines.push('');
          for (const m of members) {
            const preview = (m.text || '').split('\n')[0].slice(0, 80);
            lines.push(`- ${escapeMarkdown(preview)}`);
          }
          lines.push('');
        }
      }
      if (settings.groupSeparator) {
        lines.push(settings.groupSeparator);
        lines.push('');
      }
    }

    // ── Text Cards ────────────────────────────────────────
    if (settings.includeCardText && parser.getCards().length > 0) {
      lines.push('## Cards');
      lines.push('');
      const sorted = [...parser.getCards()].sort((a, b) => a.y - b.y || a.x - b.x);
      for (const card of sorted) {
        const group = parser.getGroupForNode(card);
        const groupTag = group ? ` *(in: ${escapeMarkdown(group.label || 'group')})*` : '';
        lines.push(`### Card${groupTag}`);
        lines.push('');
        if (card.color) {
          lines.push(`> [!note] Color: \`${card.color}\``);
          lines.push('');
        }
        lines.push(card.text || '*(empty card)*');
        lines.push('');
      }
      if (settings.groupSeparator) {
        lines.push(settings.groupSeparator);
        lines.push('');
      }
    }

    // ── File Embeds ───────────────────────────────────────
    if (settings.includeEmbeds && parser.getFileNodes().length > 0) {
      lines.push('## Embedded Files');
      lines.push('');
      for (const node of parser.getFileNodes()) {
        const filePath = node.file || '';
        const ext = filePath.split('.').pop().toLowerCase();
        const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext);
        lines.push(`### ${filePath}`);
        lines.push('');
        if (isImage) {
          lines.push(`![[${filePath}]]`);
        } else {
          lines.push(this.formatLink(filePath, filePath));
        }
        lines.push('');
      }
      if (settings.groupSeparator) {
        lines.push(settings.groupSeparator);
        lines.push('');
      }
    }

    // ── Web Links ─────────────────────────────────────────
    if (settings.includeLinks && parser.getLinkNodes().length > 0) {
      lines.push('## Web Links');
      lines.push('');
      for (const node of parser.getLinkNodes()) {
        const url = node.url || '';
        lines.push(`- [${url}](${url})`);
      }
      lines.push('');
      if (settings.groupSeparator) {
        lines.push(settings.groupSeparator);
        lines.push('');
      }
    }

    // ── Connections ───────────────────────────────────────
    if (parser.getEdges().length > 0) {
      lines.push('## Connections');
      lines.push('');
      lines.push('| From | Label | To |');
      lines.push('|------|-------|----|');
      for (const edge of parser.getEdges()) {
        const fromNode = parser.getNodeById(edge.fromNode);
        const toNode = parser.getNodeById(edge.toNode);
        const fromLabel = escapeMarkdown(this.nodeLabel(fromNode).slice(0, 50));
        const toLabel = escapeMarkdown(this.nodeLabel(toNode).slice(0, 50));
        const edgeLabel = escapeMarkdown(edge.label || '');
        lines.push(`| ${fromLabel} | ${edgeLabel} | ${toLabel} |`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

class ConfirmModal extends Modal {
  constructor(app, title, body, onConfirm) {
    super(app);
    this.title = title;
    this.body = body;
    this.onConfirm = onConfirm;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.createEl('h2', { text: this.title });
    contentEl.createEl('p', { text: this.body });
    const row = contentEl.createDiv({ cls: 'modal-button-container' });

    const btnCancel = row.createEl('button', { text: 'Cancel' });
    btnCancel.addEventListener('click', () => this.close());

    const btnOk = row.createEl('button', { text: 'Overwrite', cls: 'mod-warning' });
    btnOk.addEventListener('click', () => {
      this.close();
      this.onConfirm();
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

class CanvasToMdSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Canvas → Markdown Settings' });

    new Setting(containerEl)
      .setName('Output folder')
      .setDesc('Where to save the Markdown files. Leave empty to save next to the canvas file.')
      .addText(text => text
        .setPlaceholder('e.g. Exports/Canvas')
        .setValue(this.plugin.settings.outputFolder)
        .onChange(async v => {
          this.plugin.settings.outputFolder = v.trim();
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Include card text')
      .setDesc('Export text card contents into the Markdown file.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.includeCardText)
        .onChange(async v => {
          this.plugin.settings.includeCardText = v;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Include web links')
      .setDesc('List URL nodes in the Markdown file.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.includeLinks)
        .onChange(async v => {
          this.plugin.settings.includeLinks = v;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Include groups')
      .setDesc('List canvas groups and their members.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.includeGroups)
        .onChange(async v => {
          this.plugin.settings.includeGroups = v;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Include file embeds')
      .setDesc('Embed or link files that are placed on the canvas.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.includeEmbeds)
        .onChange(async v => {
          this.plugin.settings.includeEmbeds = v;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Add YAML frontmatter')
      .setDesc('Prepend metadata (source canvas, generation date, node count) to the note.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.prependFrontmatter)
        .onChange(async v => {
          this.plugin.settings.prependFrontmatter = v;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Link style')
      .setDesc('How to render internal file links.')
      .addDropdown(dd => dd
        .addOption('wikilink', 'Wikilink [[…]]')
        .addOption('markdown', 'Markdown […](…)')
        .setValue(this.plugin.settings.linkStyle)
        .onChange(async v => {
          this.plugin.settings.linkStyle = v;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Section separator')
      .setDesc('Markdown text placed between sections. Use --- for a horizontal rule.')
      .addText(text => text
        .setValue(this.plugin.settings.groupSeparator)
        .onChange(async v => {
          this.plugin.settings.groupSeparator = v;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Overwrite existing notes')
      .setDesc('If off, you will be asked before overwriting an existing file.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.overwriteExisting)
        .onChange(async v => {
          this.plugin.settings.overwriteExisting = v;
          await this.plugin.saveSettings();
        }));
  }
}

// ─── Main Plugin ──────────────────────────────────────────────────────────────

class CanvasToMarkdownPlugin extends Plugin {

  async onload() {
    await this.loadSettings();

    // Command: convert active canvas
    this.addCommand({
      id: 'canvas-to-md-active',
      name: 'Save active canvas to Markdown note',
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (file && file.extension === 'canvas') {
          if (!checking) this.convertFile(file);
          return true;
        }
        return false;
      },
    });

    // Command: convert all canvases
    this.addCommand({
      id: 'canvas-to-md-all',
      name: 'Save ALL canvas files to Markdown notes',
      callback: () => this.convertAll(),
    });

    // File-menu item (right-click on a .canvas file in the file explorer)
    this.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        if (file instanceof TFile && file.extension === 'canvas') {
          menu.addItem(item => {
            item
              .setTitle('Save canvas to Markdown')
              .setIcon('file-text')
              .onClick(() => this.convertFile(file));
          });
        }
      })
    );

    // Also add to editor menu when canvas is active
    this.registerEvent(
      this.app.workspace.on('editor-menu', (menu, editor, view) => {
        const file = view.file;
        if (file && file.extension === 'canvas') {
          menu.addItem(item => {
            item
              .setTitle('Save canvas to Markdown')
              .setIcon('file-text')
              .onClick(() => this.convertFile(file));
          });
        }
      })
    );

    this.addSettingTab(new CanvasToMdSettingTab(this.app, this));

    console.log('Canvas to Markdown plugin loaded.');
  }

  onunload() {
    console.log('Canvas to Markdown plugin unloaded.');
  }

  // ── Core conversion logic ───────────────────────────────

  async convertFile(canvasFile) {
    try {
      const raw = await this.app.vault.read(canvasFile);
      const parser = new CanvasParser(raw);
      const generator = new MarkdownGenerator(this.settings);
      const markdown = generator.generate(canvasFile, parser);

      const outputPath = this.resolveOutputPath(canvasFile);

      const existing = this.app.vault.getAbstractFileByPath(outputPath);
      if (existing && !this.settings.overwriteExisting) {
        new ConfirmModal(
          this.app,
          'File already exists',
          `"${outputPath}" already exists. Overwrite it?`,
          async () => {
            await this.writeOutput(outputPath, markdown, existing);
            new Notice(`✅ Canvas saved → ${outputPath}`);
          }
        ).open();
        return;
      }

      await this.writeOutput(outputPath, markdown, existing);
      new Notice(`✅ Canvas saved → ${outputPath}`);

    } catch (err) {
      new Notice(`❌ Canvas export failed: ${err.message}`);
      console.error('[Canvas to MD]', err);
    }
  }

  async convertAll() {
    const canvases = this.app.vault.getFiles().filter(f => f.extension === 'canvas');
    if (canvases.length === 0) {
      new Notice('No canvas files found in vault.');
      return;
    }
    let ok = 0, fail = 0;
    for (const f of canvases) {
      try {
        await this.convertFile(f);
        ok++;
      } catch {
        fail++;
      }
    }
    new Notice(`Done: ${ok} exported, ${fail} failed.`);
  }

  resolveOutputPath(canvasFile) {
    const baseName = canvasFile.basename + '.md';
    if (this.settings.outputFolder) {
      const folder = normalizePath(this.settings.outputFolder);
      return normalizePath(`${folder}/${baseName}`);
    }
    // Same folder as the canvas
    const dir = canvasFile.parent ? canvasFile.parent.path : '';
    return dir ? normalizePath(`${dir}/${baseName}`) : baseName;
  }

  async writeOutput(outputPath, markdown, existing) {
    // Ensure folder exists
    const dir = outputPath.substring(0, outputPath.lastIndexOf('/'));
    if (dir && !this.app.vault.getAbstractFileByPath(dir)) {
      await this.app.vault.createFolder(dir).catch(() => {});
    }

    if (existing instanceof TFile) {
      await this.app.vault.modify(existing, markdown);
    } else {
      await this.app.vault.create(outputPath, markdown);
    }
  }

  // ── Settings persistence ────────────────────────────────

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

module.exports = CanvasToMarkdownPlugin;
