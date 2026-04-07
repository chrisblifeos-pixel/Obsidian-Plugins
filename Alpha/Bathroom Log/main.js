/*
 * Bathroom Log Plugin for Obsidian
 * Version: 1.0.0
 * Mobile-first design, Android compatible
 */

'use strict';

var obsidian = require('obsidian');

// ============================================================
// CONSTANTS
// ============================================================
const PLUGIN_ID = 'bathroom-log';
const LOG_FOLDER = 'Activity Logs/Bathroom Log';
const PAGE_SIZE = 20;

const USAGE_TYPES = ['Urinated', 'Bowel Movement', 'Both'];
const URGE_LEVELS = ['Minor', 'Moderate', 'Major', 'Severe', 'Urgent'];
const DISCOMFORT_LEVELS = ['None', 'Mild', 'Moderate', 'Major', 'Severe', 'Extreme'];

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function padZ(n) { return String(n).padStart(2, '0'); }

function nowDate() {
    const d = new Date();
    return `${d.getFullYear()}-${padZ(d.getMonth()+1)}-${padZ(d.getDate())}`;
}

function nowTime() {
    const d = new Date();
    return `${padZ(d.getHours())}:${padZ(d.getMinutes())}`;
}

function formatDateTime(date, time) {
    try {
        const dt = new Date(`${date}T${time}`);
        if (isNaN(dt)) return `${date} ${time}`;
        return dt.toLocaleString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch(e) { return `${date} ${time}`; }
}

function formatDateShort(date) {
    try {
        const d = new Date(date + 'T00:00:00');
        if (isNaN(d)) return date;
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch(e) { return date; }
}

function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function badgeClass(val) {
    if (!val) return 'bl-badge-none';
    const v = val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z-]/g, '');
    return `bl-badge-${v}`;
}

function escapeYaml(val) {
    if (!val) return '""';
    const s = String(val);
    if (s.includes('\n') || s.includes('"') || s.includes("'") || s.includes(':') || s.includes('#')) {
        return `"${s.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
    }
    return s;
}

function parseYamlFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;
    const yaml = match[1];
    const data = {};
    const lines = yaml.split('\n');
    for (const line of lines) {
        const idx = line.indexOf(':');
        if (idx === -1) continue;
        const key = line.slice(0, idx).trim();
        let val = line.slice(idx + 1).trim();
        // Remove surrounding quotes
        if ((val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, '\n');
        }
        data[key] = val;
    }
    return data;
}

function buildMarkdown(entry) {
    return `---
date: ${escapeYaml(entry.date)}
time: ${escapeYaml(entry.time)}
usage_type: ${escapeYaml(entry.usage_type)}
urge_level: ${escapeYaml(entry.urge_level)}
discomfort_level: ${escapeYaml(entry.discomfort_level)}
location: ${escapeYaml(entry.location || '')}
comments: ${escapeYaml(entry.comments || '')}
---

# Bathroom Log Entry

**Date:** ${entry.date}  
**Time:** ${entry.time}  
**Usage Type:** ${entry.usage_type}  
**Urge to Go:** ${entry.urge_level}  
**Discomfort Level:** ${entry.discomfort_level}  
**Location:** ${entry.location || 'N/A'}  

## Comments
${entry.comments || '_No comments_'}
`;
}

function entryToFilename(entry) {
    return `${entry.date}_${entry.time.replace(':', '-')}_${slugify(entry.usage_type)}.md`;
}

function showToast(message, type = 'info', duration = 2800) {
    let toast = document.querySelector('.bl-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'bl-toast';
        document.body.appendChild(toast);
    }
    toast.className = `bl-toast ${type}`;
    toast.textContent = message;
    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('show'));
    });
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// ============================================================
// CONFIRM DIALOG
// ============================================================

function showConfirm(title, message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'bl-confirm-overlay';
    overlay.innerHTML = `
        <div class="bl-confirm-box">
            <span class="confirm-icon">⚠️</span>
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="bl-confirm-actions">
                <button class="bl-btn bl-btn-secondary" id="bl-cancel-btn">Cancel</button>
                <button class="bl-btn bl-btn-danger" id="bl-confirm-btn">Delete</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('#bl-cancel-btn').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    overlay.querySelector('#bl-confirm-btn').addEventListener('click', () => {
        document.body.removeChild(overlay);
        onConfirm();
    });
}

// ============================================================
// PLUGIN CLASS
// ============================================================

class BathroomLogPlugin extends obsidian.Plugin {
    async onload() {
        await this.ensureFolder();

        this.addRibbonIcon('toilet', 'Bathroom Log', () => {
            new BathroomLogModal(this.app, this).open();
        });

        this.addCommand({
            id: 'open-bathroom-log',
            name: 'Open Bathroom Log',
            callback: () => {
                new BathroomLogModal(this.app, this).open();
            }
        });
    }

    async ensureFolder() {
        const adapter = this.app.vault.adapter;
        const exists = await adapter.exists(LOG_FOLDER);
        if (!exists) {
            await this.app.vault.createFolder(LOG_FOLDER);
            const parentFolder = 'Activity Logs';
            const parentExists = await adapter.exists(parentFolder);
            if (!parentExists) {
                // Folder already created recursively
            }
        }
    }

    async saveEntry(entry, oldFilename) {
        await this.ensureFolder();
        const filename = entryToFilename(entry);
        const filepath = `${LOG_FOLDER}/${filename}`;
        const content = buildMarkdown(entry);

        // If editing and filename changed, delete old file
        if (oldFilename && oldFilename !== filename) {
            const oldPath = `${LOG_FOLDER}/${oldFilename}`;
            const oldFile = this.app.vault.getAbstractFileByPath(oldPath);
            if (oldFile) await this.app.vault.delete(oldFile);
        }

        const existingFile = this.app.vault.getAbstractFileByPath(filepath);
        if (existingFile) {
            await this.app.vault.modify(existingFile, content);
        } else {
            await this.app.vault.create(filepath, content);
        }
        return filename;
    }

    async deleteEntry(filename) {
        const filepath = `${LOG_FOLDER}/${filename}`;
        const file = this.app.vault.getAbstractFileByPath(filepath);
        if (file) {
            await this.app.vault.delete(file);
            return true;
        }
        return false;
    }

    async loadAllEntries() {
        const folder = this.app.vault.getAbstractFileByPath(LOG_FOLDER);
        if (!folder || !(folder instanceof obsidian.TFolder)) return [];

        const entries = [];
        for (const file of folder.children) {
            if (!(file instanceof obsidian.TFile) || !file.name.endsWith('.md')) continue;
            try {
                const content = await this.app.vault.read(file);
                const data = parseYamlFrontmatter(content);
                if (data && data.date && data.usage_type) {
                    entries.push({
                        filename: file.name,
                        date: data.date || '',
                        time: data.time || '',
                        usage_type: data.usage_type || '',
                        urge_level: data.urge_level || '',
                        discomfort_level: data.discomfort_level || '',
                        location: data.location || '',
                        comments: data.comments || ''
                    });
                }
            } catch(e) { /* skip unreadable files */ }
        }

        // Sort newest first
        entries.sort((a, b) => {
            const da = `${a.date}T${a.time}`;
            const db = `${b.date}T${b.time}`;
            return db.localeCompare(da);
        });

        return entries;
    }

    async exportCSV(entries) {
        const headers = ['Date','Time','Usage Type','Urge Level','Discomfort Level','Location','Comments'];
        const rows = entries.map(e => [
            e.date, e.time, e.usage_type, e.urge_level, e.discomfort_level,
            e.location, e.comments
        ].map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','));
        const csv = [headers.join(','), ...rows].join('\n');

        const ts = new Date().toISOString().slice(0,10);
        const filepath = `${LOG_FOLDER}/export_${ts}.csv`;
        const existing = this.app.vault.getAbstractFileByPath(filepath);
        if (existing) await this.app.vault.modify(existing, csv);
        else await this.app.vault.create(filepath, csv);
        return filepath;
    }

    parseCSVLine(line) {
        const result = [];
        let inQuotes = false;
        let current = '';
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                if (inQuotes && line[i+1] === '"') { current += '"'; i++; }
                else inQuotes = !inQuotes;
            } else if (ch === ',' && !inQuotes) {
                result.push(current); current = '';
            } else {
                current += ch;
            }
        }
        result.push(current);
        return result;
    }

    async importCSV(content) {
        const lines = content.split('\n').filter(l => l.trim());
        if (lines.length < 2) return 0;
        // Skip header
        let imported = 0;
        for (let i = 1; i < lines.length; i++) {
            const cols = this.parseCSVLine(lines[i]);
            if (cols.length < 3) continue;
            const entry = {
                date: (cols[0] || '').trim(),
                time: (cols[1] || '').trim(),
                usage_type: (cols[2] || '').trim(),
                urge_level: (cols[3] || '').trim(),
                discomfort_level: (cols[4] || '').trim(),
                location: (cols[5] || '').trim(),
                comments: (cols[6] || '').trim()
            };
            if (!entry.date || !entry.usage_type) continue;
            if (!entry.time) entry.time = '00:00';
            await this.saveEntry(entry, null);
            imported++;
        }
        return imported;
    }
}

// ============================================================
// MAIN MODAL
// ============================================================

class BathroomLogModal extends obsidian.Modal {
    constructor(app, plugin) {
        super(app);
        this.plugin = plugin;
        this.entries = [];
        this.filteredEntries = [];
        this.currentView = 'dashboard'; // dashboard | add | entries | charts | detail | edit | data
        this.currentEntry = null;
        this.searchQuery = '';
        this.filterType = 'all';
        this.currentPage = 0;
        this.loading = true;
        this.containerEl.addClass('bl-modal-root');
    }

    async onOpen() {
        // ---- Force Obsidian's modal to go full-screen on Android ----
        // .modal-bg (the dimmer behind the modal)
        const bg = document.querySelector('.modal-bg');
        if (bg) bg.style.cssText = '';

        // .modal-container wraps everything
        const container = this.modalEl.closest('.modal-container');
        if (container) {
            container.style.cssText =
                'position:fixed;inset:0;display:flex;align-items:stretch;' +
                'justify-content:center;padding:0;margin:0;z-index:9999;';
        }

        // .modal itself — this is what Obsidian sizes by default
        this.modalEl.style.cssText =
            'position:relative;width:100%;max-width:680px;' +
            'height:100dvh;height:100vh;max-height:100dvh;max-height:100vh;' +
            'border-radius:0;margin:0;padding:0;' +
            'display:flex;flex-direction:column;overflow:hidden;' +
            'background:var(--background-primary);';

        // .modal-content (Obsidian's inner scrollable div — we take it over)
        this.contentEl.style.cssText =
            'flex:1 1 0;min-height:0;overflow:hidden;' +
            'display:flex;flex-direction:column;padding:0;margin:0;';

        // Also strip the close button Obsidian injects (we have our own)
        const obsCloseBtn = this.modalEl.querySelector('.modal-close-button');
        if (obsCloseBtn) obsCloseBtn.style.display = 'none';

        // Build our wrapper inside contentEl
        this.contentEl.empty();
        this.wrapper = this.contentEl.createDiv({ cls: 'bl-modal' });

        this.entries = await this.plugin.loadAllEntries();
        this.filteredEntries = [...this.entries];
        this.loading = false;

        this.render();
    }

    onClose() {
        this.contentEl.empty();
    }

    render() {
        this.wrapper.empty();
        this.renderHeader();
        if (this.currentView === 'dashboard') this.renderDashboard();
        else if (this.currentView === 'add')     this.renderAddForm();
        else if (this.currentView === 'edit')    this.renderAddForm(true);
        else if (this.currentView === 'entries') this.renderEntries();
        else if (this.currentView === 'charts')  this.renderCharts();
        else if (this.currentView === 'detail')  this.renderDetail();
        else if (this.currentView === 'data')    this.renderDataMgmt();
    }

    renderHeader() {
        const hdr = this.wrapper.createDiv({ cls: 'bl-header' });
        const top = hdr.createDiv({ cls: 'bl-header-top' });

        const titleWrap = top.createDiv();
        titleWrap.createEl('h2', { text: '' }).innerHTML =
            `<span class="bl-header-icon">🚽</span> Bathroom Log`;
        hdr.createEl('p', { cls: 'bl-header-subtitle', text: 'Personal health activity tracker' });

        const closeBtn = top.createEl('button', { cls: 'bl-close-btn', text: '✕' });
        closeBtn.addEventListener('click', () => this.close());

        // Stats strip
        this.renderStatsStrip();
    }

    renderStatsStrip() {
        const strip = this.wrapper.createDiv({ cls: 'bl-stats-strip' });
        const stats = this.computeStats();

        const chips = [
            { value: stats.total,       label: 'Total' },
            { value: stats.today,        label: 'Today' },
            { value: stats.urinatedCount,label: 'Urine' },
            { value: stats.bowelCount,   label: 'Bowel' },
            { value: stats.thisWeek,     label: 'This Week' },
        ];

        for (const chip of chips) {
            const c = strip.createDiv({ cls: 'bl-stat-chip' });
            c.createEl('span', { cls: 'stat-value', text: String(chip.value) });
            c.createEl('span', { cls: 'stat-label', text: chip.label });
        }
    }

    computeStats() {
        const entries = this.entries;
        const today = nowDate();
        const total = entries.length;
        const todayEntries = entries.filter(e => e.date === today);
        const urinatedCount = entries.filter(e =>
            e.usage_type === 'Urinated' || e.usage_type === 'Both').length;
        const bowelCount = entries.filter(e =>
            e.usage_type === 'Bowel Movement' || e.usage_type === 'Both').length;

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = `${weekAgo.getFullYear()}-${padZ(weekAgo.getMonth()+1)}-${padZ(weekAgo.getDate())}`;
        const thisWeek = entries.filter(e => e.date >= weekAgoStr).length;

        return { total, today: todayEntries.length, urinatedCount, bowelCount, thisWeek };
    }

    // ---- DASHBOARD ----
    renderDashboard() {
        const content = this.wrapper.createDiv({ cls: 'bl-content' });
        const grid = content.createDiv({ cls: 'bl-dashboard-grid' });

        const buttons = [
            { icon: '➕', label: 'Add Entry', desc: 'Log new bathroom use', view: 'add' },
            { icon: '📋', label: 'View Entries', desc: 'Browse & search logs', view: 'entries' },
            { icon: '📊', label: 'Charts', desc: 'Visual statistics', view: 'charts' },
            { icon: '⚙️', label: 'Data Manager', desc: 'Import / Export CSV', view: 'data', full: true },
        ];

        for (const btn of buttons) {
            const el = grid.createEl('button', {
                cls: 'bl-dashboard-btn' + (btn.full ? ' full-width' : '')
            });
            el.innerHTML = `
                <span class="btn-icon">${btn.icon}</span>
                <span class="btn-label">${btn.label}</span>
                <span class="btn-desc">${btn.desc}</span>`;
            el.addEventListener('click', () => {
                this.currentView = btn.view;
                this.render();
            });
        }
    }

    // ---- ADD / EDIT FORM ----
    renderAddForm(isEdit = false) {
        const entry = isEdit && this.currentEntry ? this.currentEntry : null;

        const content = this.wrapper.createDiv({ cls: 'bl-content' });

        // Back button
        const backBtn = content.createEl('button', { cls: 'bl-back-btn' });
        backBtn.innerHTML = `← Back`;
        backBtn.addEventListener('click', () => {
            this.currentView = isEdit ? 'detail' : 'dashboard';
            this.render();
        });

        if (isEdit) {
            content.createDiv({ cls: 'bl-edit-banner', text: '✏️  Editing existing entry' });
        }

        const form = content.createDiv({ cls: `bl-form-view${isEdit ? ' bl-edit-mode' : ''}` });

        // Section header
        const secHdr = form.createDiv({ cls: 'bl-section-header' });
        secHdr.createEl('h3', { text: isEdit ? 'Edit Entry' : 'New Entry' });
        secHdr.createDiv({ cls: 'bl-section-divider' });

        // Date & Time
        const row1 = form.createDiv({ cls: 'bl-form-row' });

        const dateGroup = row1.createDiv({ cls: 'bl-form-group' });
        dateGroup.createEl('label', { cls: 'required', text: 'Date' });
        const dateInput = dateGroup.createEl('input', {
            cls: 'bl-input',
            type: 'date',
            value: entry ? entry.date : nowDate()
        });

        const timeGroup = row1.createDiv({ cls: 'bl-form-group' });
        timeGroup.createEl('label', { cls: 'required', text: 'Time' });
        const timeInput = timeGroup.createEl('input', {
            cls: 'bl-input',
            type: 'time',
            value: entry ? entry.time : nowTime()
        });

        // Usage Type
        const utGroup = form.createDiv({ cls: 'bl-form-group' });
        utGroup.createEl('label', { cls: 'required', text: 'Usage Type' });
        const utSelect = utGroup.createEl('select', { cls: 'bl-select' });
        for (const opt of USAGE_TYPES) {
            const o = utSelect.createEl('option', { value: opt, text: opt });
            if (entry && entry.usage_type === opt) o.selected = true;
        }

        // Urge & Discomfort
        const row2 = form.createDiv({ cls: 'bl-form-row' });

        const urgeGroup = row2.createDiv({ cls: 'bl-form-group' });
        urgeGroup.createEl('label', { text: 'Urge to Go' });
        const urgeSelect = urgeGroup.createEl('select', { cls: 'bl-select' });
        urgeSelect.createEl('option', { value: '', text: '— Select —' });
        for (const opt of URGE_LEVELS) {
            const o = urgeSelect.createEl('option', { value: opt, text: opt });
            if (entry && entry.urge_level === opt) o.selected = true;
        }

        const discGroup = row2.createDiv({ cls: 'bl-form-group' });
        discGroup.createEl('label', { text: 'Discomfort Level' });
        const discSelect = discGroup.createEl('select', { cls: 'bl-select' });
        discSelect.createEl('option', { value: '', text: '— Select —' });
        for (const opt of DISCOMFORT_LEVELS) {
            const o = discSelect.createEl('option', { value: opt, text: opt });
            if (entry && entry.discomfort_level === opt) o.selected = true;
        }

        // Location
        const locGroup = form.createDiv({ cls: 'bl-form-group' });
        locGroup.createEl('label', { text: 'Location' });
        const locRow = locGroup.createDiv({ cls: 'bl-location-row' });
        const locInput = locRow.createEl('input', {
            cls: 'bl-input',
            type: 'text',
            placeholder: 'Enter location or use GPS...',
            value: entry ? entry.location : ''
        });

        const gpsBtn = locRow.createEl('button', { cls: 'bl-location-btn', text: '📍' });
        gpsBtn.setAttribute('title', 'Get current location');
        gpsBtn.addEventListener('click', () => {
            gpsBtn.textContent = '⏳';
            gpsBtn.disabled = true;
            if (!navigator.geolocation) {
                showToast('Geolocation not available', 'error');
                gpsBtn.textContent = '📍';
                gpsBtn.disabled = false;
                return;
            }
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const lat = pos.coords.latitude.toFixed(5);
                    const lon = pos.coords.longitude.toFixed(5);
                    // Try reverse geocode via nominatim
                    try {
                        const resp = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16`,
                            { headers: { 'Accept-Language': 'en' } }
                        );
                        const geo = await resp.json();
                        if (geo && geo.display_name) {
                            locInput.value = geo.display_name;
                        } else {
                            locInput.value = `${lat}, ${lon}`;
                        }
                    } catch(e) {
                        locInput.value = `${lat}, ${lon}`;
                    }
                    gpsBtn.textContent = '✅';
                    gpsBtn.disabled = false;
                    showToast('Location acquired', 'success');
                },
                (err) => {
                    showToast(`Location error: ${err.message}`, 'error');
                    gpsBtn.textContent = '📍';
                    gpsBtn.disabled = false;
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });

        // Comments
        const comGroup = form.createDiv({ cls: 'bl-form-group' });
        comGroup.createEl('label', { text: 'Comments' });
        const comTextarea = comGroup.createEl('textarea', {
            cls: 'bl-textarea',
            placeholder: 'Any additional notes...'
        });
        if (entry && entry.comments) comTextarea.value = entry.comments;

        // Actions
        const actions = form.createDiv({ cls: 'bl-form-actions' });

        const cancelBtn = actions.createEl('button', { cls: 'bl-btn bl-btn-secondary', text: 'Cancel' });
        cancelBtn.addEventListener('click', () => {
            this.currentView = isEdit ? 'detail' : 'dashboard';
            this.render();
        });

        const saveBtn = actions.createEl('button', {
            cls: 'bl-btn bl-btn-primary',
            text: isEdit ? '💾  Save Changes' : '💾  Save Entry'
        });

        saveBtn.addEventListener('click', async () => {
            const date = dateInput.value.trim();
            const time = timeInput.value.trim();
            const usageType = utSelect.value;

            if (!date || !time || !usageType) {
                showToast('Please fill in required fields', 'error');
                return;
            }

            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving…';

            const newEntry = {
                date,
                time,
                usage_type: usageType,
                urge_level: urgeSelect.value,
                discomfort_level: discSelect.value,
                location: locInput.value.trim(),
                comments: comTextarea.value.trim()
            };

            try {
                const oldFilename = isEdit && entry ? entry.filename : null;
                const savedFilename = await this.plugin.saveEntry(newEntry, oldFilename);
                newEntry.filename = savedFilename;

                // Refresh entries
                this.entries = await this.plugin.loadAllEntries();

                showToast(isEdit ? '✅ Entry updated!' : '✅ Entry saved!', 'success');

                if (isEdit) {
                    this.currentEntry = newEntry;
                    this.currentView = 'detail';
                } else {
                    this.currentView = 'dashboard';
                }
                this.render();
            } catch(e) {
                showToast(`Error saving: ${e.message}`, 'error');
                saveBtn.disabled = false;
                saveBtn.textContent = isEdit ? '💾  Save Changes' : '💾  Save Entry';
            }
        });
    }

    // ---- ENTRIES TABLE ----
    renderEntries() {
        const content = this.wrapper.createDiv({ cls: 'bl-content' });

        const backBtn = content.createEl('button', { cls: 'bl-back-btn' });
        backBtn.innerHTML = `← Dashboard`;
        backBtn.addEventListener('click', () => { this.currentView = 'dashboard'; this.render(); });

        const secHdr = content.createDiv({ cls: 'bl-section-header' });
        secHdr.createEl('h3', { text: 'All Entries' });
        secHdr.createDiv({ cls: 'bl-section-divider' });

        // Search & Filter row
        const sfRow = content.createDiv({ cls: 'bl-search-filter-row' });

        const searchInput = sfRow.createEl('input', {
            cls: 'bl-search-input',
            type: 'search',
            placeholder: '🔍 Search…'
        });
        searchInput.value = this.searchQuery;

        const filterSelect = sfRow.createEl('select', { cls: 'bl-filter-select' });
        const filterOptions = [
            { value: 'all', text: 'All Types' },
            { value: 'Urinated', text: 'Urinated' },
            { value: 'Bowel Movement', text: 'Bowel' },
            { value: 'Both', text: 'Both' },
        ];
        for (const opt of filterOptions) {
            const o = filterSelect.createEl('option', { value: opt.value, text: opt.text });
            if (this.filterType === opt.value) o.selected = true;
        }

        searchInput.addEventListener('input', () => {
            this.searchQuery = searchInput.value;
            this.currentPage = 0;
            this.applyFilters();
            this.renderEntriesTable(tableWrap, countEl, paginationWrap);
        });

        filterSelect.addEventListener('change', () => {
            this.filterType = filterSelect.value;
            this.currentPage = 0;
            this.applyFilters();
            this.renderEntriesTable(tableWrap, countEl, paginationWrap);
        });

        const tableWrap = content.createDiv({ cls: 'bl-entries-view' });
        const countEl = content.createEl('p', { cls: 'bl-entries-count' });
        const paginationWrap = content.createDiv({ cls: 'bl-pagination' });

        this.applyFilters();
        this.renderEntriesTable(tableWrap, countEl, paginationWrap);
    }

    applyFilters() {
        let result = [...this.entries];
        if (this.filterType !== 'all') {
            result = result.filter(e => e.usage_type === this.filterType);
        }
        if (this.searchQuery.trim()) {
            const q = this.searchQuery.toLowerCase();
            result = result.filter(e =>
                e.date.includes(q) ||
                e.time.includes(q) ||
                e.usage_type.toLowerCase().includes(q) ||
                e.urge_level.toLowerCase().includes(q) ||
                e.discomfort_level.toLowerCase().includes(q) ||
                e.location.toLowerCase().includes(q) ||
                e.comments.toLowerCase().includes(q)
            );
        }
        this.filteredEntries = result;
    }

    renderEntriesTable(container, countEl, paginationWrap) {
        container.empty();
        paginationWrap.empty();

        const total = this.filteredEntries.length;
        const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
        if (this.currentPage >= totalPages) this.currentPage = 0;

        const start = this.currentPage * PAGE_SIZE;
        const pageEntries = this.filteredEntries.slice(start, start + PAGE_SIZE);

        countEl.textContent = `Showing ${pageEntries.length} of ${total} entries`;

        if (total === 0) {
            const empty = container.createDiv({ cls: 'bl-empty-state' });
            empty.createEl('span', { cls: 'empty-icon', text: '📭' });
            empty.createEl('p', { text: 'No entries found' });
            return;
        }

        const tableWrap = container.createDiv({ cls: 'bl-table-wrap' });
        const table = tableWrap.createEl('table', { cls: 'bl-table' });
        const thead = table.createEl('thead');
        const hrow = thead.createEl('tr');
        for (const h of ['Date / Time', 'Type', 'Urge', 'Discomfort', 'Location']) {
            hrow.createEl('th', { text: h });
        }

        const tbody = table.createEl('tbody');
        for (const entry of pageEntries) {
            const tr = tbody.createEl('tr');
            tr.createEl('td', { text: formatDateTime(entry.date, entry.time) });

            const typeTd = tr.createEl('td');
            typeTd.createEl('span', {
                cls: `bl-badge ${badgeClass(entry.usage_type)}`,
                text: entry.usage_type
            });

            const urgeTd = tr.createEl('td');
            if (entry.urge_level) {
                urgeTd.createEl('span', {
                    cls: `bl-badge ${badgeClass(entry.urge_level)}`,
                    text: entry.urge_level
                });
            } else {
                urgeTd.createEl('span', { cls: 'bl-badge bl-badge-none', text: '—' });
            }

            const discTd = tr.createEl('td');
            if (entry.discomfort_level) {
                discTd.createEl('span', {
                    cls: `bl-badge ${badgeClass(entry.discomfort_level)}`,
                    text: entry.discomfort_level
                });
            } else {
                discTd.createEl('span', { cls: 'bl-badge bl-badge-none', text: '—' });
            }

            const locTd = tr.createEl('td');
            locTd.textContent = entry.location
                ? (entry.location.length > 22 ? entry.location.slice(0,20) + '…' : entry.location)
                : '—';

            tr.addEventListener('click', () => {
                this.currentEntry = entry;
                this.currentView = 'detail';
                this.render();
            });
        }

        // Pagination
        if (totalPages > 1) {
            const prevBtn = paginationWrap.createEl('button', {
                cls: 'bl-page-btn',
                text: '← Prev'
            });
            if (this.currentPage === 0) prevBtn.disabled = true;
            prevBtn.addEventListener('click', () => {
                this.currentPage--;
                this.renderEntriesTable(container, countEl, paginationWrap);
            });

            paginationWrap.createEl('span', {
                cls: 'bl-page-info',
                text: `Page ${this.currentPage + 1} of ${totalPages}`
            });

            const nextBtn = paginationWrap.createEl('button', {
                cls: 'bl-page-btn',
                text: 'Next →'
            });
            if (this.currentPage >= totalPages - 1) nextBtn.disabled = true;
            nextBtn.addEventListener('click', () => {
                this.currentPage++;
                this.renderEntriesTable(container, countEl, paginationWrap);
            });
        }
    }

    // ---- DETAIL VIEW ----
    renderDetail() {
        const entry = this.currentEntry;
        if (!entry) { this.currentView = 'entries'; this.render(); return; }

        const content = this.wrapper.createDiv({ cls: 'bl-content' });

        const backBtn = content.createEl('button', { cls: 'bl-back-btn' });
        backBtn.innerHTML = `← Entries`;
        backBtn.addEventListener('click', () => { this.currentView = 'entries'; this.render(); });

        const secHdr = content.createDiv({ cls: 'bl-section-header' });
        secHdr.createEl('h3', { text: 'Entry Detail' });
        secHdr.createDiv({ cls: 'bl-section-divider' });

        const card = content.createDiv({ cls: 'bl-detail-card bl-detail-view' });

        const fields = [
            { label: 'Date',        value: entry.date },
            { label: 'Time',        value: entry.time },
            { label: 'Usage Type',  value: entry.usage_type, badge: true },
            { label: 'Urge Level',  value: entry.urge_level || '—', badge: !!entry.urge_level },
            { label: 'Discomfort',  value: entry.discomfort_level || '—', badge: !!entry.discomfort_level },
            { label: 'Location',    value: entry.location || '—' },
            { label: 'Comments',    value: entry.comments || '—' },
            { label: 'File',        value: entry.filename },
        ];

        for (const f of fields) {
            const row = card.createDiv({ cls: 'bl-detail-row' });
            row.createEl('span', { cls: 'bl-detail-label', text: f.label });
            const valEl = row.createEl('span', { cls: 'bl-detail-value' });
            if (f.badge && f.value !== '—') {
                valEl.createEl('span', {
                    cls: `bl-badge ${badgeClass(f.value)}`,
                    text: f.value
                });
            } else {
                valEl.textContent = f.value;
            }
        }

        // Actions
        const actions = content.createDiv({ cls: 'bl-form-actions' });

        const deleteBtn = actions.createEl('button', { cls: 'bl-btn bl-btn-danger', text: '🗑️  Delete' });
        deleteBtn.addEventListener('click', () => {
            showConfirm(
                'Delete Entry',
                'This entry will be permanently deleted. Are you sure?',
                async () => {
                    await this.plugin.deleteEntry(entry.filename);
                    this.entries = await this.plugin.loadAllEntries();
                    this.currentEntry = null;
                    this.currentView = 'entries';
                    this.applyFilters();
                    showToast('Entry deleted', 'info');
                    this.render();
                }
            );
        });

        const editBtn = actions.createEl('button', { cls: 'bl-btn bl-btn-primary', text: '✏️  Edit' });
        editBtn.addEventListener('click', () => {
            this.currentView = 'edit';
            this.render();
        });
    }

    // ---- CHARTS VIEW ----
    renderCharts() {
        const content = this.wrapper.createDiv({ cls: 'bl-content bl-charts-view' });

        const backBtn = content.createEl('button', { cls: 'bl-back-btn' });
        backBtn.innerHTML = `← Dashboard`;
        backBtn.addEventListener('click', () => { this.currentView = 'dashboard'; this.render(); });

        const secHdr = content.createDiv({ cls: 'bl-section-header' });
        secHdr.createEl('h3', { text: 'Statistics & Charts' });
        secHdr.createDiv({ cls: 'bl-section-divider' });

        if (this.entries.length === 0) {
            const empty = content.createDiv({ cls: 'bl-empty-state' });
            empty.createEl('span', { cls: 'empty-icon', text: '📊' });
            empty.createEl('p', { text: 'No data yet. Add some entries to see charts!' });
            return;
        }

        this.renderTypeDonut(content);
        this.renderUrgeBar(content);
        this.renderDiscomfortBar(content);
        this.renderDailyBar(content);
        this.renderActivityHeatmap(content);
    }

    renderTypeDonut(container) {
        const card = container.createDiv({ cls: 'bl-chart-card' });
        card.createEl('h4', { text: '💧 Usage Type Breakdown' });

        const uCount = this.entries.filter(e => e.usage_type === 'Urinated').length;
        const bCount = this.entries.filter(e => e.usage_type === 'Bowel Movement').length;
        const bothCount = this.entries.filter(e => e.usage_type === 'Both').length;
        const total = this.entries.length || 1;

        const data = [
            { label: 'Urinated',       count: uCount,    color: '#3b82f6' },
            { label: 'Bowel Movement', count: bCount,    color: '#22c55e' },
            { label: 'Both',           count: bothCount, color: '#a855f7' },
        ].filter(d => d.count > 0);

        const wrap = card.createDiv({ cls: 'bl-donut-wrap' });

        // SVG donut
        const size = 100;
        const r = 36;
        const cx = 50, cy = 50;
        const circumference = 2 * Math.PI * r;

        const svg = wrap.createSvg('svg', { cls: 'bl-donut-svg' });
        svg.setAttribute('width', '100');
        svg.setAttribute('height', '100');
        svg.setAttribute('viewBox', '0 0 100 100');

        // Background circle
        const bgCircle = svg.createSvg('circle');
        bgCircle.setAttribute('cx', cx); bgCircle.setAttribute('cy', cy);
        bgCircle.setAttribute('r', r);
        bgCircle.setAttribute('fill', 'none');
        bgCircle.setAttribute('stroke', 'var(--background-modifier-border)');
        bgCircle.setAttribute('stroke-width', '14');

        let offset = 0;
        for (const seg of data) {
            const pct = seg.count / total;
            const dash = circumference * pct;
            const gap = circumference - dash;
            const circle = svg.createSvg('circle');
            circle.setAttribute('cx', cx); circle.setAttribute('cy', cy);
            circle.setAttribute('r', r);
            circle.setAttribute('fill', 'none');
            circle.setAttribute('stroke', seg.color);
            circle.setAttribute('stroke-width', '14');
            circle.setAttribute('stroke-dasharray', `${dash} ${gap}`);
            circle.setAttribute('stroke-dashoffset', -offset);
            circle.setAttribute('transform', `rotate(-90 ${cx} ${cy})`);
            offset += dash;
        }

        // Center text
        const centerText = svg.createSvg('text');
        centerText.setAttribute('x', cx); centerText.setAttribute('y', cy + 4);
        centerText.setAttribute('text-anchor', 'middle');
        centerText.setAttribute('font-size', '14');
        centerText.setAttribute('font-weight', '700');
        centerText.setAttribute('fill', 'var(--text-normal)');
        centerText.textContent = total;

        // Legend
        const legend = wrap.createDiv({ cls: 'bl-donut-legend' });
        for (const seg of data) {
            const item = legend.createDiv({ cls: 'bl-legend-item' });
            const dot = item.createDiv({ cls: 'bl-legend-dot' });
            dot.style.background = seg.color;
            item.createEl('span', { cls: 'bl-legend-item-label', text: seg.label });
            item.createEl('span', { cls: 'bl-legend-item-val', text: String(seg.count) });
        }
    }

    renderUrgeBar(container) {
        const card = container.createDiv({ cls: 'bl-chart-card' });
        card.createEl('h4', { text: '⚡ Urge Level Distribution' });
        const chart = card.createDiv({ cls: 'bl-bar-chart' });

        const colors = {
            'Minor':    '#22c55e',
            'Moderate': '#eab308',
            'Major':    '#f97316',
            'Severe':   '#ef4444',
            'Urgent':   '#db2777'
        };

        const counts = {};
        for (const e of this.entries) {
            if (e.urge_level) counts[e.urge_level] = (counts[e.urge_level] || 0) + 1;
        }
        const maxVal = Math.max(...Object.values(counts), 1);

        for (const level of URGE_LEVELS) {
            const count = counts[level] || 0;
            const pct = (count / maxVal * 100).toFixed(0);
            const row = chart.createDiv({ cls: 'bl-bar-row' });
            row.createEl('span', { cls: 'bl-bar-label', text: level });
            const track = row.createDiv({ cls: 'bl-bar-track' });
            const fill = track.createDiv({ cls: 'bl-bar-fill' });
            fill.style.width = `${pct}%`;
            fill.style.background = colors[level] || '#6b7280';
            if (count > 0) fill.createEl('span', { text: String(count) });
            row.createEl('span', { cls: 'bl-bar-value', text: String(count) });
        }
    }

    renderDiscomfortBar(container) {
        const card = container.createDiv({ cls: 'bl-chart-card' });
        card.createEl('h4', { text: '😣 Discomfort Level Distribution' });
        const chart = card.createDiv({ cls: 'bl-bar-chart' });

        const colors = {
            'None':     '#6b7280',
            'Mild':     '#22c55e',
            'Moderate': '#eab308',
            'Major':    '#f97316',
            'Severe':   '#ef4444',
            'Extreme':  '#7c3aed'
        };

        const counts = {};
        for (const e of this.entries) {
            if (e.discomfort_level) counts[e.discomfort_level] = (counts[e.discomfort_level] || 0) + 1;
        }
        const maxVal = Math.max(...Object.values(counts), 1);

        for (const level of DISCOMFORT_LEVELS) {
            const count = counts[level] || 0;
            const pct = (count / maxVal * 100).toFixed(0);
            const row = chart.createDiv({ cls: 'bl-bar-row' });
            row.createEl('span', { cls: 'bl-bar-label', text: level });
            const track = row.createDiv({ cls: 'bl-bar-track' });
            const fill = track.createDiv({ cls: 'bl-bar-fill' });
            fill.style.width = `${pct}%`;
            fill.style.background = colors[level] || '#6b7280';
            if (count > 0) fill.createEl('span', { text: String(count) });
            row.createEl('span', { cls: 'bl-bar-value', text: String(count) });
        }
    }

    renderDailyBar(container) {
        const card = container.createDiv({ cls: 'bl-chart-card' });
        card.createEl('h4', { text: '📅 Entries – Last 7 Days' });
        const chart = card.createDiv({ cls: 'bl-bar-chart' });

        const days = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const str = `${d.getFullYear()}-${padZ(d.getMonth()+1)}-${padZ(d.getDate())}`;
            days.push({ date: str, label: formatDateShort(str) });
        }

        const maxVal = Math.max(...days.map(d =>
            this.entries.filter(e => e.date === d.date).length
        ), 1);

        for (const day of days) {
            const count = this.entries.filter(e => e.date === day.date).length;
            const pct = (count / maxVal * 100).toFixed(0);
            const row = chart.createDiv({ cls: 'bl-bar-row' });
            row.createEl('span', { cls: 'bl-bar-label', text: day.label });
            const track = row.createDiv({ cls: 'bl-bar-track' });
            const fill = track.createDiv({ cls: 'bl-bar-fill' });
            fill.style.width = `${pct}%`;
            fill.style.background = '#1a6b8a';
            if (count > 0) fill.createEl('span', { text: String(count) });
            row.createEl('span', { cls: 'bl-bar-value', text: String(count) });
        }
    }

    renderActivityHeatmap(container) {
        const card = container.createDiv({ cls: 'bl-chart-card' });
        card.createEl('h4', { text: '🗓️ Activity Heatmap – Last 8 Weeks' });

        const heatmap = card.createDiv({ cls: 'bl-heatmap' });

        const today = new Date();
        const cols = 8 * 7; // 8 weeks
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - cols + 1);

        // Group by week column
        const weeks = [];
        let current = new Date(startDate);

        while (current <= today) {
            const weekCells = [];
            for (let d = 0; d < 7; d++) {
                if (current > today) break;
                const str = `${current.getFullYear()}-${padZ(current.getMonth()+1)}-${padZ(current.getDate())}`;
                const count = this.entries.filter(e => e.date === str).length;
                const dayLabel = d === 0 ? current.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
                weekCells.push({ date: str, count, label: dayLabel });
                const next = new Date(current);
                next.setDate(current.getDate() + 1);
                current = next;
            }
            weeks.push(weekCells);
        }

        for (const week of weeks) {
            const col = heatmap.createDiv({ cls: 'bl-heatmap-col' });
            const labelStr = week[0] ? week[0].date.slice(5) : '';
            col.createEl('span', { cls: 'bl-heatmap-label', text: labelStr });
            for (const cell of week) {
                const cellEl = col.createDiv({ cls: 'bl-heatmap-cell' });
                const displayCount = Math.min(cell.count, 5);
                if (displayCount > 0) cellEl.setAttribute('data-count', String(displayCount));
                cellEl.setAttribute('title', `${cell.date}: ${cell.count} entries`);
            }
        }
    }

    // ---- DATA MANAGEMENT ----
    renderDataMgmt() {
        const content = this.wrapper.createDiv({ cls: 'bl-content bl-data-mgmt-view' });

        const backBtn = content.createEl('button', { cls: 'bl-back-btn' });
        backBtn.innerHTML = `← Dashboard`;
        backBtn.addEventListener('click', () => { this.currentView = 'dashboard'; this.render(); });

        const secHdr = content.createDiv({ cls: 'bl-section-header' });
        secHdr.createEl('h3', { text: 'Data Management' });
        secHdr.createDiv({ cls: 'bl-section-divider' });

        // Export Section
        const exportSec = content.createDiv({ cls: 'bl-mgmt-section' });
        exportSec.createEl('h4').innerHTML = `📤 Export Data`;
        exportSec.createEl('p', { text: `Export all ${this.entries.length} entries to a CSV file saved in your vault at ${LOG_FOLDER}/export_YYYY-MM-DD.csv` });

        const exportBtn = exportSec.createEl('button', {
            cls: 'bl-btn bl-btn-success',
            text: `📤  Export ${this.entries.length} Entries to CSV`
        });
        exportBtn.style.width = '100%';
        exportBtn.addEventListener('click', async () => {
            if (this.entries.length === 0) {
                showToast('No entries to export', 'error');
                return;
            }
            exportBtn.disabled = true;
            exportBtn.textContent = 'Exporting…';
            try {
                const filepath = await this.plugin.exportCSV(this.entries);
                showToast(`✅ Exported to: ${filepath}`, 'success', 4000);
            } catch(e) {
                showToast(`Export failed: ${e.message}`, 'error');
            }
            exportBtn.disabled = false;
            exportBtn.textContent = `📤  Export ${this.entries.length} Entries to CSV`;
        });

        // Import Section
        const importSec = content.createDiv({ cls: 'bl-mgmt-section' });
        importSec.createEl('h4').innerHTML = `📥 Import Data`;
        importSec.createEl('p', { text: 'Import entries from a CSV file. Expected columns: Date, Time, Usage Type, Urge Level, Discomfort Level, Location, Comments. Existing entries with the same date/time/type will be overwritten.' });

        const fileWrap = importSec.createDiv({ cls: 'bl-file-input-wrap' });
        const fileInput = fileWrap.createEl('input', { type: 'file' });
        fileInput.setAttribute('accept', '.csv,text/csv');
        const fileLabel = fileWrap.createEl('label', { cls: 'bl-file-label' });
        fileLabel.innerHTML = `📁 Tap to choose a CSV file`;

        fileInput.addEventListener('change', async () => {
            const file = fileInput.files[0];
            if (!file) return;
            fileLabel.innerHTML = `⏳ Importing ${file.name}…`;

            const reader = new FileReader();
            reader.onload = async (evt) => {
                try {
                    const content = evt.target.result;
                    const count = await this.plugin.importCSV(content);
                    this.entries = await this.plugin.loadAllEntries();
                    this.applyFilters();
                    showToast(`✅ Imported ${count} entries`, 'success', 4000);
                    fileLabel.innerHTML = `✅ Imported ${count} entries from ${file.name}`;
                    this.render();
                } catch(e) {
                    showToast(`Import failed: ${e.message}`, 'error');
                    fileLabel.innerHTML = `❌ Import failed. Try again.`;
                }
            };
            reader.onerror = () => {
                showToast('Failed to read file', 'error');
                fileLabel.innerHTML = `📁 Tap to choose a CSV file`;
            };
            reader.readAsText(file);
        });

        // Stats summary
        const statsSec = content.createDiv({ cls: 'bl-mgmt-section' });
        statsSec.createEl('h4').innerHTML = `📊 Storage Info`;
        const stats = this.computeStats();
        const infoRows = [
            { label: 'Total entries', value: stats.total },
            { label: 'Urine entries', value: stats.urinatedCount },
            { label: 'Bowel entries', value: stats.bowelCount },
            { label: 'Entries today', value: stats.today },
            { label: 'Entries this week', value: stats.thisWeek },
            { label: 'Storage folder', value: LOG_FOLDER },
        ];
        for (const row of infoRows) {
            const r = statsSec.createDiv({ cls: 'bl-detail-row' });
            r.createEl('span', { cls: 'bl-detail-label', text: row.label });
            r.createEl('span', { cls: 'bl-detail-value', text: String(row.value) });
        }
    }
}

module.exports = BathroomLogPlugin;
