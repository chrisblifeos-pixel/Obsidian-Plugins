'use strict';

const { Plugin, Modal, Setting, Notice, TFile, TFolder, normalizePath } = require('obsidian');

// ── Constants ──────────────────────────────────────────────────────────────────

const PLUGIN_ID   = 'file-gateway';
const RIBBON_ICON = 'folder-sync';
const RIBBON_TIP  = 'File Gateway – Import / Export';

const IMPORT_TYPES = [
  { ext: 'md',   label: 'Markdown',  icon: '📝' },
  { ext: 'txt',  label: 'Text',      icon: '📄' },
  { ext: 'pdf',  label: 'PDF',       icon: '📕' },
  { ext: 'docx', label: 'Word',      icon: '📘' },
  { ext: 'html', label: 'HTML',      icon: '🌐' },
  { ext: 'css',  label: 'CSS',       icon: '🎨' },
  { ext: 'json', label: 'JSON',      icon: '🔧' },
  { ext: 'csv',  label: 'CSV',       icon: '📊' },
  { ext: 'php',  label: 'PHP',       icon: '🐘' },
  { ext: 'jpg',  label: 'JPEG',      icon: '🖼️' },
  { ext: 'jpeg', label: 'JPEG (alt)',icon: '🖼️' },
  { ext: 'png',  label: 'PNG',       icon: '🖼️' },
  { ext: 'gif',  label: 'GIF',       icon: '🎞️' },
  { ext: 'webp', label: 'WebP',      icon: '🖼️' },
  { ext: 'tiff', label: 'TIFF',      icon: '🖼️' },
];

const ACCEPT_ATTR = IMPORT_TYPES.map(t => `.${t.ext}`).join(',');

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024, sizes = ['B','KB','MB','GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getExtIcon(ext) {
  const e = ext.toLowerCase();
  if (['jpg','jpeg','png','gif','webp','tiff'].includes(e)) return '🖼️';
  if (e === 'pdf') return '📕';
  if (e === 'docx') return '📘';
  if (e === 'md')  return '📝';
  if (e === 'html') return '🌐';
  if (e === 'css')  return '🎨';
  if (e === 'json') return '🔧';
  if (e === 'csv')  return '📊';
  if (['txt','php'].includes(e)) return '📄';
  return '📁';
}

async function readFileAsArrayBuffer(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result);
    r.onerror = () => rej(r.error);
    r.readAsArrayBuffer(file);
  });
}

async function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1500);
}

// Walk vault tree into a nested structure for the export panel
function buildVaultTree(app) {
  function walk(folder) {
    const node = { name: folder.name, path: folder.path, isFolder: true, children: [] };
    for (const child of folder.children) {
      if (child instanceof TFolder) {
        node.children.push(walk(child));
      } else if (child instanceof TFile) {
        node.children.push({ name: child.name, path: child.path, isFolder: false, ext: child.extension, stat: child.stat });
      }
    }
    node.children.sort((a,b) => {
      if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return node;
  }
  return walk(app.vault.getRoot());
}

// Collect all TFile paths under a given path (inclusive)
function collectFiles(app, path) {
  const files = [];
  const item  = app.vault.getAbstractFileByPath(path);
  if (!item) return files;
  if (item instanceof TFile) { files.push(item); return files; }
  function recurse(folder) {
    for (const child of folder.children) {
      if (child instanceof TFolder) recurse(child);
      else if (child instanceof TFile) files.push(child);
    }
  }
  recurse(item);
  return files;
}

// ── Main Modal ────────────────────────────────────────────────────────────────

class GatewayModal extends Modal {
  constructor(app) {
    super(app);
    this.activeTab      = 'import';
    this.importQueue    = [];   // { file: File, destPath: string, status: 'pending'|'done'|'error' }
    this.exportSelected = new Set(); // vault paths
    this.importDestFolder = '/';
  }

  onOpen() {
    this.modalEl.addClass('fg-modal');
    this.render();
  }

  onClose() {
    this.contentEl.empty();
  }

  // ── Top-level render ──────────────────────────────────────────────────────

  render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('fg-root');

    // Header
    const header = contentEl.createDiv('fg-header');
    header.createDiv('fg-logo').createSpan({ text: '⇄' });
    const titles = header.createDiv('fg-header-text');
    titles.createDiv({ cls: 'fg-title', text: 'File Gateway' });
    titles.createDiv({ cls: 'fg-subtitle', text: 'Vault · Import & Export' });

    // Tab bar
    const tabs = contentEl.createDiv('fg-tabs');
    ['import','export'].forEach(tab => {
      const btn = tabs.createEl('button', {
        cls : `fg-tab${this.activeTab === tab ? ' fg-tab--active' : ''}`,
        text: tab === 'import' ? '↙ Import' : '↗ Export',
      });
      btn.addEventListener('click', () => { this.activeTab = tab; this.render(); });
    });

    // Body
    const body = contentEl.createDiv('fg-body');
    if (this.activeTab === 'import') this.renderImportPanel(body);
    else                             this.renderExportPanel(body);
  }

  // ── Import Panel ──────────────────────────────────────────────────────────

  renderImportPanel(body) {
    // Destination row
    const destRow = body.createDiv('fg-dest-row');
    destRow.createSpan({ cls: 'fg-dest-label', text: '📂 Destination:' });
    const destInput = destRow.createEl('input', { cls: 'fg-dest-input', type: 'text', value: this.importDestFolder });
    destInput.placeholder = '/subfolder';
    destInput.addEventListener('input', () => { this.importDestFolder = destInput.value || '/'; });

    // Drop zone
    const dropZone = body.createDiv('fg-dropzone');
    dropZone.createDiv({ cls: 'fg-drop-icon', text: '⬇' });
    const dropLabel = dropZone.createDiv({ cls: 'fg-drop-label', text: 'Drop files here or click to browse' });
    dropZone.createDiv({ cls: 'fg-drop-types', text: IMPORT_TYPES.map(t => `.${t.ext}`).join('  ') });

    // Hidden file input
    const fileInput = body.createEl('input', { type: 'file', attr: { multiple: true, accept: ACCEPT_ATTR } });
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', () => { this.addToQueue([...fileInput.files]); this.render(); });

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.addClass('fg-dropzone--over'); });
    dropZone.addEventListener('dragleave', () => dropZone.removeClass('fg-dropzone--over'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.removeClass('fg-dropzone--over');
      this.addToQueue([...e.dataTransfer.files]);
      this.render();
    });

    // Queue list
    if (this.importQueue.length > 0) {
      const queueWrap = body.createDiv('fg-queue');
      const qHead = queueWrap.createDiv('fg-queue-header');
      qHead.createSpan({ text: `Files to Import (${this.importQueue.length})` });
      const clearBtn = qHead.createEl('button', { cls: 'fg-btn-ghost', text: 'Clear all' });
      clearBtn.addEventListener('click', () => { this.importQueue = []; this.render(); });

      const list = queueWrap.createDiv('fg-queue-list');
      this.importQueue.forEach((item, idx) => {
        const row = list.createDiv(`fg-queue-item fg-queue-item--${item.status}`);
        row.createSpan({ cls: 'fg-qi-icon', text: getExtIcon(item.file.name.split('.').pop()) });
        const info = row.createDiv('fg-qi-info');
        info.createDiv({ cls: 'fg-qi-name', text: item.file.name });
        info.createDiv({ cls: 'fg-qi-meta', text: formatBytes(item.file.size) });
        const badge = row.createSpan({ cls: 'fg-qi-badge' });
        if (item.status === 'done')  { badge.setText('✓'); badge.addClass('fg-badge--done'); }
        if (item.status === 'error') { badge.setText('✗'); badge.addClass('fg-badge--error'); }
        const rm = row.createEl('button', { cls: 'fg-qi-remove', text: '×' });
        rm.addEventListener('click', () => { this.importQueue.splice(idx, 1); this.render(); });
      });

      // Import button
      const pending = this.importQueue.filter(i => i.status === 'pending');
      if (pending.length > 0) {
        const importBtn = body.createEl('button', {
          cls: 'fg-btn-primary',
          text: `↙ Import ${pending.length} file${pending.length !== 1 ? 's' : ''} into Vault`,
        });
        importBtn.addEventListener('click', () => this.runImport());
      }
    }
  }

  addToQueue(files) {
    const allowedExts = new Set(IMPORT_TYPES.map(t => t.ext));
    for (const f of files) {
      const ext = f.name.split('.').pop().toLowerCase();
      if (!allowedExts.has(ext)) {
        new Notice(`Skipped: .${ext} files are not supported.`);
        continue;
      }
      // Avoid duplicates
      if (!this.importQueue.find(q => q.file.name === f.name && q.file.size === f.size)) {
        this.importQueue.push({ file: f, status: 'pending' });
      }
    }
  }

  async runImport() {
    const pending = this.importQueue.filter(i => i.status === 'pending');
    let done = 0, errors = 0;
    for (const item of pending) {
      try {
        const dest   = normalizePath(`${this.importDestFolder}/${item.file.name}`);
        const buf    = await readFileAsArrayBuffer(item.file);
        const exists = this.app.vault.getAbstractFileByPath(dest);
        if (exists instanceof TFile) {
          await this.app.vault.modifyBinary(exists, buf);
        } else {
          // Ensure folder exists
          const parts = dest.split('/');
          parts.pop();
          const folder = parts.join('/') || '/';
          if (folder !== '/' && !this.app.vault.getAbstractFileByPath(folder)) {
            await this.app.vault.createFolder(folder);
          }
          await this.app.vault.createBinary(dest, buf);
        }
        item.status = 'done';
        done++;
      } catch(e) {
        item.status = 'error';
        errors++;
        console.error('[File Gateway] Import error:', e);
      }
    }
    new Notice(`File Gateway: Imported ${done} file${done !== 1 ? 's' : ''}${errors ? `, ${errors} failed` : ''}.`);
    this.render();
  }

  // ── Export Panel ──────────────────────────────────────────────────────────

  renderExportPanel(body) {
    const tree = buildVaultTree(this.app);

    const toolbar = body.createDiv('fg-export-toolbar');
    const selCount = this.exportSelected.size;
    toolbar.createSpan({ cls: 'fg-export-count', text: selCount > 0 ? `${selCount} selected` : 'Select files or folders to export' });
    const clrBtn = toolbar.createEl('button', { cls: 'fg-btn-ghost', text: 'Clear' });
    clrBtn.addEventListener('click', () => { this.exportSelected.clear(); this.render(); });

    // Tree
    const treeWrap = body.createDiv('fg-tree-wrap');
    this.renderTreeNode(treeWrap, tree, 0);

    // Export button
    if (this.exportSelected.size > 0) {
      const expBtn = body.createEl('button', {
        cls : 'fg-btn-primary',
        text: `↗ Export ${this.exportSelected.size} item${this.exportSelected.size !== 1 ? 's' : ''} to Device`,
      });
      expBtn.addEventListener('click', () => this.runExport());
    }
  }

  renderTreeNode(container, node, depth) {
    if (depth === 0) {
      // Root: just render children
      for (const child of node.children) this.renderTreeNode(container, child, 1);
      return;
    }

    const row = container.createDiv('fg-tree-row');
    row.style.paddingLeft = `${(depth - 1) * 18 + 8}px`;

    const checkbox = row.createEl('input', { type: 'checkbox' });
    checkbox.className = 'fg-tree-check';
    checkbox.checked   = this.exportSelected.has(node.path);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) this.exportSelected.add(node.path);
      else                  this.exportSelected.delete(node.path);
      this.render();
    });

    const icon = row.createSpan({ cls: 'fg-tree-icon' });
    icon.textContent = node.isFolder ? '📁' : getExtIcon(node.ext || '');

    row.createSpan({ cls: 'fg-tree-name', text: node.name });

    if (!node.isFolder && node.stat) {
      row.createSpan({ cls: 'fg-tree-size', text: formatBytes(node.stat.size) });
    }

    if (node.isFolder && node.children && node.children.length > 0) {
      const childrenWrap = container.createDiv('fg-tree-children');
      // Collapsible: toggle
      const details = container.createEl ? null : null;
      // Simple always-expanded for now; toggle on icon click
      row.addEventListener('click', e => {
        if (e.target === checkbox) return;
        childrenWrap.toggleClass('fg-tree-children--collapsed', !childrenWrap.hasClass('fg-tree-children--collapsed'));
        icon.textContent = childrenWrap.hasClass('fg-tree-children--collapsed') ? '📂' : '📁';
      });
      for (const child of node.children) this.renderTreeNode(childrenWrap, child, depth + 1);
    }
  }

  async runExport() {
    // Expand selected paths to individual files
    const allFiles = new Set();
    for (const path of this.exportSelected) {
      for (const f of collectFiles(this.app, path)) allFiles.add(f);
    }
    if (allFiles.size === 0) { new Notice('File Gateway: No files to export.'); return; }

    if (allFiles.size === 1) {
      // Single file – direct download
      const f = [...allFiles][0];
      await this.exportSingleFile(f);
    } else {
      // Multiple files – zip them
      await this.exportAsZip([...allFiles]);
    }
  }

  async exportSingleFile(tfile) {
    try {
      const buf  = await this.app.vault.readBinary(tfile);
      const blob = new Blob([buf]);
      await downloadBlob(blob, tfile.name);
      new Notice(`File Gateway: Exported "${tfile.name}".`);
    } catch(e) {
      new Notice(`File Gateway: Failed to export "${tfile.name}".`);
      console.error(e);
    }
  }

  async exportAsZip(tfiles) {
    // We use a minimal pure-JS zip builder (no external dep required)
    new Notice('File Gateway: Preparing zip…');
    try {
      const entries = [];
      for (const f of tfiles) {
        const buf = await this.app.vault.readBinary(f);
        entries.push({ path: f.path, data: new Uint8Array(buf) });
      }
      const zipBlob = buildZip(entries);
      const ts      = new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
      await downloadBlob(zipBlob, `vault-export-${ts}.zip`);
      new Notice(`File Gateway: Exported ${tfiles.length} files as zip.`);
    } catch(e) {
      new Notice('File Gateway: Export failed. See console.');
      console.error(e);
    }
  }
}

// ── Minimal ZIP builder (no external deps) ───────────────────────────────────
// Implements DEFLATE-STORE (no compression) – small and dependency-free.

function buildZip(entries) {
  const parts      = [];
  const centralDir = [];
  let offset       = 0;

  function strToBytes(str) {
    return new TextEncoder().encode(str);
  }
  function u16(n) { const b = new Uint8Array(2); new DataView(b.buffer).setUint16(0, n, true); return b; }
  function u32(n) { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, n, true); return b; }

  function crc32(data) {
    let crc = 0xFFFFFFFF;
    const table = crc32.table || (crc32.table = (() => {
      const t = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        t[i] = c;
      }
      return t;
    })());
    for (let i = 0; i < data.length; i++) crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  for (const { path, data } of entries) {
    const name    = strToBytes(path);
    const crc     = crc32(data);
    const size    = data.length;
    const modTime = 0x5400, modDate = 0x5821; // fixed dummy date

    // Local file header
    const lfh = new Uint8Array([
      0x50,0x4B,0x03,0x04,  // signature
      ...u16(20),           // version needed
      ...u16(0),            // general purpose
      ...u16(0),            // compression (store)
      ...u16(modTime),
      ...u16(modDate),
      ...u32(crc),
      ...u32(size),         // compressed size
      ...u32(size),         // uncompressed size
      ...u16(name.length),
      ...u16(0),            // extra field length
    ]);

    const localOffset = offset;
    parts.push(lfh, name, data);
    offset += lfh.length + name.length + size;

    // Central directory entry
    const cde = new Uint8Array([
      0x50,0x4B,0x01,0x02,
      ...u16(20), ...u16(20),
      ...u16(0),
      ...u16(0),
      ...u16(modTime), ...u16(modDate),
      ...u32(crc),
      ...u32(size), ...u32(size),
      ...u16(name.length),
      ...u16(0), ...u16(0),
      ...u16(0), ...u16(0),
      ...u32(0),
      ...u32(localOffset),
    ]);
    centralDir.push(cde, name);
  }

  const cdOffset = offset;
  let cdSize = 0;
  for (const p of centralDir) cdSize += p.length;

  const eocd = new Uint8Array([
    0x50,0x4B,0x05,0x06,
    ...u16(0), ...u16(0),
    ...u16(entries.length), ...u16(entries.length),
    ...u32(cdSize),
    ...u32(cdOffset),
    ...u16(0),
  ]);

  const all    = [...parts, ...centralDir, eocd];
  const total  = all.reduce((s, p) => s + p.length, 0);
  const out    = new Uint8Array(total);
  let pos      = 0;
  for (const p of all) { out.set(p, pos); pos += p.length; }
  return new Blob([out], { type: 'application/zip' });
}

// ── Plugin class ─────────────────────────────────────────────────────────────

class FileGatewayPlugin extends Plugin {
  onload() {
    this.addRibbonIcon(RIBBON_ICON, RIBBON_TIP, () => {
      new GatewayModal(this.app).open();
    });
    this.addCommand({
      id   : 'open-file-gateway',
      name : 'Open File Gateway',
      callback: () => new GatewayModal(this.app).open(),
    });
    console.log('[File Gateway] Plugin loaded.');
  }
  onunload() {
    console.log('[File Gateway] Plugin unloaded.');
  }
}

module.exports = FileGatewayPlugin;
