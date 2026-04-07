/*
 * Beverage Log Plugin for Obsidian
 * Version: 1.0.0
 * Mobile-first design, Android compatible
 * Dropdown options loaded live from vault folders
 */

'use strict';

var obsidian = require('obsidian');

// ============================================================
// CONSTANTS
// ============================================================
const PLUGIN_ID      = 'beverage-log';
const LOG_FOLDER     = 'Activity Logs/Beverage Logs';
const PAGE_SIZE      = 20;

// Vault folders that supply dropdown options
const FOLDER_TYPES   = '_system/Beverage Types';
const FOLDER_BRANDS  = '_system/Database/Brands/Beverage Brands';
const FOLDER_SIZES   = '_system/Database/Beverage Sizes';

// Palette of colours used for dynamic badge/chart colouring
const PALETTE = [
    '#3b82f6','#22c55e','#a855f7','#eab308',
    '#f97316','#db2777','#14b8a6','#6366f1',
    '#f43f5e','#84cc16','#06b6d4','#8b5cf6'
];

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

/** Return a stable palette index 0-11 for a given string */
function paletteIdx(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
    return Math.abs(hash) % PALETTE.length;
}

function badgeClass(val) {
    if (!val) return 'bvl-badge-none';
    return `bvl-badge-${paletteIdx(val)}`;
}

function badgeColor(val) {
    if (!val) return '#6b7280';
    return PALETTE[paletteIdx(val)];
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
    for (const line of yaml.split('\n')) {
        const idx = line.indexOf(':');
        if (idx === -1) continue;
        const key = line.slice(0, idx).trim();
        let val = line.slice(idx + 1).trim();
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
beverage_type: ${escapeYaml(entry.beverage_type || '')}
beverage_brand: ${escapeYaml(entry.beverage_brand || '')}
beverage_size: ${escapeYaml(entry.beverage_size || '')}
location: ${escapeYaml(entry.location || '')}
comments: ${escapeYaml(entry.comments || '')}
---

# Beverage Log Entry

**Date:** ${entry.date}  
**Time:** ${entry.time}  
**Beverage Type:** ${entry.beverage_type || 'N/A'}  
**Brand:** ${entry.beverage_brand || 'N/A'}  
**Size:** ${entry.beverage_size || 'N/A'}  
**Location:** ${entry.location || 'N/A'}  

## Comments
${entry.comments || '_No comments_'}
`;
}

function entryToFilename(entry) {
    const typeSlug  = slugify(entry.beverage_type  || 'unknown');
    const brandSlug = slugify(entry.beverage_brand || '');
    const base = brandSlug ? `${typeSlug}_${brandSlug}` : typeSlug;
    return `${entry.date}_${entry.time.replace(':', '-')}_${base}.md`;
}

function showToast(message, type = 'info', duration = 2800) {
    let toast = document.querySelector('.bvl-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'bvl-toast';
        document.body.appendChild(toast);
    }
    toast.className = `bvl-toast ${type}`;
    toast.textContent = message;
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

function showConfirm(title, message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'bvl-confirm-overlay';
    overlay.innerHTML = `
        <div class="bvl-confirm-box">
            <span class="confirm-icon">⚠️</span>
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="bvl-confirm-actions">
                <button class="bvl-btn bvl-btn-secondary" id="bvl-cancel-btn">Cancel</button>
                <button class="bvl-btn bvl-btn-danger"    id="bvl-confirm-btn">Delete</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#bvl-cancel-btn').addEventListener('click',  () => document.body.removeChild(overlay));
    overlay.querySelector('#bvl-confirm-btn').addEventListener('click', () => { document.body.removeChild(overlay); onConfirm(); });
}

// ============================================================
// PLUGIN CLASS
// ============================================================

class BeverageLogPlugin extends obsidian.Plugin {
    async onload() {
        await this.ensureFolder();

        this.addRibbonIcon('cup-soda', 'Beverage Log', () => {
            new BeverageLogModal(this.app, this).open();
        });

        this.addCommand({
            id: 'open-beverage-log',
            name: 'Open Beverage Log',
            callback: () => new BeverageLogModal(this.app, this).open()
        });
    }

    async ensureFolder() {
        const adapter = this.app.vault.adapter;
        if (!(await adapter.exists(LOG_FOLDER))) {
            // createFolder is recursive in newer Obsidian; fall back gracefully
            try { await this.app.vault.createFolder(LOG_FOLDER); } catch(e) {}
        }
    }

    // ---- Load names from a vault folder (file stems as option labels) ----
    async loadFolderOptions(folderPath) {
        const folder = this.app.vault.getAbstractFileByPath(folderPath);
        if (!folder || !(folder instanceof obsidian.TFolder)) return [];
        return folder.children
            .filter(f => f instanceof obsidian.TFile && f.extension === 'md')
            .map(f => f.basename)
            .sort((a, b) => a.localeCompare(b));
    }

    // ---- Load all three dropdown option lists in parallel ----
    async loadDropdownOptions() {
        const [types, brands, sizes] = await Promise.all([
            this.loadFolderOptions(FOLDER_TYPES),
            this.loadFolderOptions(FOLDER_BRANDS),
            this.loadFolderOptions(FOLDER_SIZES),
        ]);
        return { types, brands, sizes };
    }

    // ---- CRUD ----
    async saveEntry(entry, oldFilename) {
        await this.ensureFolder();
        const filename = entryToFilename(entry);
        const filepath = `${LOG_FOLDER}/${filename}`;
        const content  = buildMarkdown(entry);

        if (oldFilename && oldFilename !== filename) {
            const oldFile = this.app.vault.getAbstractFileByPath(`${LOG_FOLDER}/${oldFilename}`);
            if (oldFile) await this.app.vault.delete(oldFile);
        }

        const existing = this.app.vault.getAbstractFileByPath(filepath);
        if (existing) await this.app.vault.modify(existing, content);
        else          await this.app.vault.create(filepath, content);
        return filename;
    }

    async deleteEntry(filename) {
        const file = this.app.vault.getAbstractFileByPath(`${LOG_FOLDER}/${filename}`);
        if (file) { await this.app.vault.delete(file); return true; }
        return false;
    }

    async loadAllEntries() {
        const folder = this.app.vault.getAbstractFileByPath(LOG_FOLDER);
        if (!folder || !(folder instanceof obsidian.TFolder)) return [];

        const entries = [];
        for (const file of folder.children) {
            if (!(file instanceof obsidian.TFile) || file.extension !== 'md') continue;
            try {
                const content = await this.app.vault.read(file);
                const data    = parseYamlFrontmatter(content);
                if (data && data.date) {
                    entries.push({
                        filename:       file.name,
                        date:           data.date           || '',
                        time:           data.time           || '',
                        beverage_type:  data.beverage_type  || '',
                        beverage_brand: data.beverage_brand || '',
                        beverage_size:  data.beverage_size  || '',
                        location:       data.location       || '',
                        comments:       data.comments       || '',
                    });
                }
            } catch(e) { /* skip corrupt files */ }
        }

        entries.sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));
        return entries;
    }

    // ---- CSV export ----
    async exportCSV(entries) {
        const headers = ['Date','Time','Beverage Type','Brand','Size','Location','Comments'];
        const rows = entries.map(e =>
            [e.date, e.time, e.beverage_type, e.beverage_brand, e.beverage_size, e.location, e.comments]
            .map(v => `"${String(v||'').replace(/"/g,'""')}"`)
            .join(',')
        );
        const csv  = [headers.join(','), ...rows].join('\n');
        const ts   = new Date().toISOString().slice(0,10);
        const fp   = `${LOG_FOLDER}/export_${ts}.csv`;
        const existing = this.app.vault.getAbstractFileByPath(fp);
        if (existing) await this.app.vault.modify(existing, csv);
        else          await this.app.vault.create(fp, csv);
        return fp;
    }

    // ---- CSV import ----
    parseCSVLine(line) {
        const result = []; let inQ = false; let cur = '';
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') { if (inQ && line[i+1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
            else if (ch === ',' && !inQ) { result.push(cur); cur = ''; }
            else cur += ch;
        }
        result.push(cur);
        return result;
    }

    async importCSV(content) {
        const lines = content.split('\n').filter(l => l.trim());
        if (lines.length < 2) return 0;
        let imported = 0;
        for (let i = 1; i < lines.length; i++) {
            const cols = this.parseCSVLine(lines[i]);
            if (cols.length < 2) continue;
            const entry = {
                date:           (cols[0]||'').trim(),
                time:           (cols[1]||'').trim() || '00:00',
                beverage_type:  (cols[2]||'').trim(),
                beverage_brand: (cols[3]||'').trim(),
                beverage_size:  (cols[4]||'').trim(),
                location:       (cols[5]||'').trim(),
                comments:       (cols[6]||'').trim(),
            };
            if (!entry.date) continue;
            await this.saveEntry(entry, null);
            imported++;
        }
        return imported;
    }
}

// ============================================================
// MODAL
// ============================================================

class BeverageLogModal extends obsidian.Modal {
    constructor(app, plugin) {
        super(app);
        this.plugin         = plugin;
        this.entries        = [];
        this.filteredEntries = [];
        this.dropdowns      = { types: [], brands: [], sizes: [] };
        this.currentView    = 'dashboard';
        this.currentEntry   = null;
        this.searchQuery    = '';
        this.filterType     = 'all';
        this.currentPage    = 0;
        this.contentEl.addClass('bvl-modal-root');
    }

    async onOpen() {
        // Force full-screen on Android
        const modalContainer = this.modalEl.closest('.modal-container');
        if (modalContainer) {
            modalContainer.style.cssText =
                'position:fixed;inset:0;display:flex;align-items:stretch;' +
                'justify-content:center;padding:0;margin:0;z-index:9999;';
        }
        this.modalEl.style.cssText =
            'position:relative;width:100%;max-width:680px;' +
            'height:100dvh;height:100vh;max-height:100dvh;max-height:100vh;' +
            'border-radius:0;margin:0;padding:0;' +
            'display:flex;flex-direction:column;overflow:hidden;' +
            'background:var(--background-primary);';
        this.contentEl.style.cssText =
            'flex:1 1 0;min-height:0;overflow:hidden;' +
            'display:flex;flex-direction:column;padding:0;margin:0;';

        const obsCloseBtn = this.modalEl.querySelector('.modal-close-button');
        if (obsCloseBtn) obsCloseBtn.style.display = 'none';

        this.contentEl.empty();
        this.wrapper = this.contentEl.createDiv({ cls: 'bvl-modal' });

        // Load entries and dropdown options in parallel
        [this.entries, this.dropdowns] = await Promise.all([
            this.plugin.loadAllEntries(),
            this.plugin.loadDropdownOptions(),
        ]);
        this.filteredEntries = [...this.entries];

        this.render();
    }

    onClose() { this.contentEl.empty(); }

    render() {
        this.wrapper.empty();
        this.renderHeader();
        switch (this.currentView) {
            case 'dashboard': this.renderDashboard();      break;
            case 'add':       this.renderForm(false);      break;
            case 'edit':      this.renderForm(true);       break;
            case 'entries':   this.renderEntries();        break;
            case 'charts':    this.renderCharts();         break;
            case 'detail':    this.renderDetail();         break;
            case 'data':      this.renderDataMgmt();       break;
        }
    }

    // ---- HEADER ----
    renderHeader() {
        const hdr = this.wrapper.createDiv({ cls: 'bvl-header' });
        const top = hdr.createDiv({ cls: 'bvl-header-top' });
        top.createDiv().createEl('h2').innerHTML =
            `<span class="bvl-header-icon">🥤</span> Beverage Log`;
        hdr.createEl('p', { cls: 'bvl-header-subtitle', text: 'Personal beverage consumption tracker' });

        const closeBtn = top.createEl('button', { cls: 'bvl-close-btn', text: '✕' });
        closeBtn.addEventListener('click', () => this.close());

        this.renderStatsStrip();
    }

    renderStatsStrip() {
        const strip  = this.wrapper.createDiv({ cls: 'bvl-stats-strip' });
        const stats  = this.computeStats();
        const chips  = [
            { value: stats.total,     label: 'Total' },
            { value: stats.today,     label: 'Today' },
            { value: stats.thisWeek,  label: 'This Week' },
            { value: stats.topType,   label: 'Top Type' },
            { value: stats.topBrand,  label: 'Top Brand' },
        ];
        for (const c of chips) {
            const chip = strip.createDiv({ cls: 'bvl-stat-chip' });
            chip.createEl('span', { cls: 'stat-value', text: String(c.value) });
            chip.createEl('span', { cls: 'stat-label', text: c.label });
        }
    }

    computeStats() {
        const entries  = this.entries;
        const today    = nowDate();
        const total    = entries.length;
        const todayCnt = entries.filter(e => e.date === today).length;

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = `${weekAgo.getFullYear()}-${padZ(weekAgo.getMonth()+1)}-${padZ(weekAgo.getDate())}`;
        const thisWeek = entries.filter(e => e.date >= weekAgoStr).length;

        // Top type
        const typeCounts = {};
        for (const e of entries) if (e.beverage_type) typeCounts[e.beverage_type] = (typeCounts[e.beverage_type]||0)+1;
        const topType = Object.entries(typeCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || '—';

        // Top brand
        const brandCounts = {};
        for (const e of entries) if (e.beverage_brand) brandCounts[e.beverage_brand] = (brandCounts[e.beverage_brand]||0)+1;
        const topBrand = Object.entries(brandCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || '—';

        return { total, today: todayCnt, thisWeek, topType, topBrand };
    }

    // ---- DASHBOARD ----
    renderDashboard() {
        const content = this.wrapper.createDiv({ cls: 'bvl-content' });
        const grid    = content.createDiv({ cls: 'bvl-dashboard-grid' });

        const buttons = [
            { icon: '➕', label: 'Add Entry',    desc: 'Log a new beverage',     view: 'add' },
            { icon: '📋', label: 'View Entries', desc: 'Browse & search logs',   view: 'entries' },
            { icon: '📊', label: 'Charts',       desc: 'Visual statistics',      view: 'charts' },
            { icon: '⚙️', label: 'Data Manager', desc: 'Import / Export CSV',    view: 'data', full: true },
        ];

        for (const btn of buttons) {
            const el = grid.createEl('button', { cls: 'bvl-dashboard-btn' + (btn.full ? ' full-width' : '') });
            el.innerHTML = `
                <span class="btn-icon">${btn.icon}</span>
                <span class="btn-label">${btn.label}</span>
                <span class="btn-desc">${btn.desc}</span>`;
            el.addEventListener('click', () => { this.currentView = btn.view; this.render(); });
        }
    }

    // ---- ADD / EDIT FORM ----
    async renderForm(isEdit) {
        const entry   = isEdit && this.currentEntry ? this.currentEntry : null;
        const content = this.wrapper.createDiv({ cls: 'bvl-content' });

        // Back
        const backBtn = content.createEl('button', { cls: 'bvl-back-btn', text: '← Back' });
        backBtn.addEventListener('click', () => {
            this.currentView = isEdit ? 'detail' : 'dashboard';
            this.render();
        });

        if (isEdit) content.createDiv({ cls: 'bvl-edit-banner', text: '✏️  Editing existing entry' });

        const form = content.createDiv({ cls: `bvl-form-view${isEdit ? ' bvl-edit-mode' : ''}` });

        const secHdr = form.createDiv({ cls: 'bvl-section-header' });
        secHdr.createEl('h3', { text: isEdit ? 'Edit Entry' : 'New Entry' });
        secHdr.createDiv({ cls: 'bvl-section-divider' });

        // ---- Date & Time ----
        const row1 = form.createDiv({ cls: 'bvl-form-row' });

        const dateGrp = row1.createDiv({ cls: 'bvl-form-group' });
        dateGrp.createEl('label', { cls: 'required', text: 'Date' });
        const dateInput = dateGrp.createEl('input', { cls: 'bvl-input', type: 'date', value: entry ? entry.date : nowDate() });

        const timeGrp = row1.createDiv({ cls: 'bvl-form-group' });
        timeGrp.createEl('label', { cls: 'required', text: 'Time' });
        const timeInput = timeGrp.createEl('input', { cls: 'bvl-input', type: 'time', value: entry ? entry.time : nowTime() });

        // ---- Beverage Type (vault-driven) ----
        const typeGrp = form.createDiv({ cls: 'bvl-form-group' });
        typeGrp.createEl('label', { cls: 'required', text: 'Beverage Type' });
        const typeSelect = typeGrp.createEl('select', { cls: 'bvl-select' });
        typeSelect.createEl('option', { value: '', text: '— Select Type —' });
        if (this.dropdowns.types.length === 0) {
            typeSelect.createEl('option', { value: '__none__', text: '(No types found — add notes to ' + FOLDER_TYPES + ')' });
            typeGrp.createEl('p', { cls: 'bvl-select-note', text: `Add .md files to: ${FOLDER_TYPES}` });
        } else {
            for (const t of this.dropdowns.types) {
                const o = typeSelect.createEl('option', { value: t, text: t });
                if (entry && entry.beverage_type === t) o.selected = true;
            }
        }

        // ---- Beverage Brand (vault-driven) ----
        const brandGrp = form.createDiv({ cls: 'bvl-form-group' });
        brandGrp.createEl('label', { text: 'Beverage Brand' });
        const brandSelect = brandGrp.createEl('select', { cls: 'bvl-select' });
        brandSelect.createEl('option', { value: '', text: '— Select Brand —' });
        if (this.dropdowns.brands.length === 0) {
            brandSelect.createEl('option', { value: '__none__', text: '(No brands found — add notes to ' + FOLDER_BRANDS + ')' });
            brandGrp.createEl('p', { cls: 'bvl-select-note', text: `Add .md files to: ${FOLDER_BRANDS}` });
        } else {
            for (const b of this.dropdowns.brands) {
                const o = brandSelect.createEl('option', { value: b, text: b });
                if (entry && entry.beverage_brand === b) o.selected = true;
            }
        }

        // ---- Beverage Size (vault-driven) ----
        const sizeGrp = form.createDiv({ cls: 'bvl-form-group' });
        sizeGrp.createEl('label', { text: 'Beverage Size' });
        const sizeSelect = sizeGrp.createEl('select', { cls: 'bvl-select' });
        sizeSelect.createEl('option', { value: '', text: '— Select Size —' });
        if (this.dropdowns.sizes.length === 0) {
            sizeSelect.createEl('option', { value: '__none__', text: '(No sizes found — add notes to ' + FOLDER_SIZES + ')' });
            sizeGrp.createEl('p', { cls: 'bvl-select-note', text: `Add .md files to: ${FOLDER_SIZES}` });
        } else {
            for (const s of this.dropdowns.sizes) {
                const o = sizeSelect.createEl('option', { value: s, text: s });
                if (entry && entry.beverage_size === s) o.selected = true;
            }
        }

        // ---- Location ----
        const locGrp = form.createDiv({ cls: 'bvl-form-group' });
        locGrp.createEl('label', { text: 'Location' });
        const locRow   = locGrp.createDiv({ cls: 'bvl-location-row' });
        const locInput = locRow.createEl('input', {
            cls: 'bvl-input', type: 'text',
            placeholder: 'Enter location or use GPS…',
            value: entry ? entry.location : ''
        });

        const gpsBtn = locRow.createEl('button', { cls: 'bvl-location-btn', text: '📍' });
        gpsBtn.setAttribute('title', 'Get current location');
        gpsBtn.addEventListener('click', () => {
            gpsBtn.textContent = '⏳';
            gpsBtn.disabled    = true;
            if (!navigator.geolocation) {
                showToast('Geolocation not available', 'error');
                gpsBtn.textContent = '📍'; gpsBtn.disabled = false;
                return;
            }
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const lat = pos.coords.latitude.toFixed(5);
                    const lon = pos.coords.longitude.toFixed(5);
                    try {
                        const resp = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16`,
                            { headers: { 'Accept-Language': 'en' } }
                        );
                        const geo = await resp.json();
                        locInput.value = (geo && geo.display_name) ? geo.display_name : `${lat}, ${lon}`;
                    } catch(e) {
                        locInput.value = `${lat}, ${lon}`;
                    }
                    gpsBtn.textContent = '✅'; gpsBtn.disabled = false;
                    showToast('Location acquired', 'success');
                },
                (err) => {
                    showToast(`Location error: ${err.message}`, 'error');
                    gpsBtn.textContent = '📍'; gpsBtn.disabled = false;
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });

        // ---- Comments ----
        const comGrp = form.createDiv({ cls: 'bvl-form-group' });
        comGrp.createEl('label', { text: 'Comments' });
        const comTextarea = comGrp.createEl('textarea', { cls: 'bvl-textarea', placeholder: 'Any additional notes…' });
        if (entry && entry.comments) comTextarea.value = entry.comments;

        // ---- Actions (sticky) ----
        const actions   = form.createDiv({ cls: 'bvl-form-actions' });
        const cancelBtn = actions.createEl('button', { cls: 'bvl-btn bvl-btn-secondary', text: 'Cancel' });
        cancelBtn.addEventListener('click', () => {
            this.currentView = isEdit ? 'detail' : 'dashboard';
            this.render();
        });

        const saveBtn = actions.createEl('button', {
            cls: 'bvl-btn bvl-btn-primary',
            text: isEdit ? '💾  Save Changes' : '💾  Save Entry'
        });

        saveBtn.addEventListener('click', async () => {
            const date = dateInput.value.trim();
            const time = timeInput.value.trim();
            const type = typeSelect.value === '__none__' ? '' : typeSelect.value;

            if (!date || !time) {
                showToast('Date and Time are required', 'error');
                return;
            }

            saveBtn.disabled    = true;
            saveBtn.textContent = 'Saving…';

            const brandVal = brandSelect.value === '__none__' ? '' : brandSelect.value;
            const sizeVal  = sizeSelect.value  === '__none__' ? '' : sizeSelect.value;

            const newEntry = {
                date,
                time,
                beverage_type:  type,
                beverage_brand: brandVal,
                beverage_size:  sizeVal,
                location:       locInput.value.trim(),
                comments:       comTextarea.value.trim(),
            };

            try {
                const oldFilename   = isEdit && entry ? entry.filename : null;
                const savedFilename = await this.plugin.saveEntry(newEntry, oldFilename);
                newEntry.filename   = savedFilename;
                this.entries        = await this.plugin.loadAllEntries();
                showToast(isEdit ? '✅ Entry updated!' : '✅ Entry saved!', 'success');
                if (isEdit) { this.currentEntry = newEntry; this.currentView = 'detail'; }
                else          this.currentView = 'dashboard';
                this.render();
            } catch(e) {
                showToast(`Error saving: ${e.message}`, 'error');
                saveBtn.disabled    = false;
                saveBtn.textContent = isEdit ? '💾  Save Changes' : '💾  Save Entry';
            }
        });
    }

    // ---- ENTRIES TABLE ----
    renderEntries() {
        const content = this.wrapper.createDiv({ cls: 'bvl-content' });

        content.createEl('button', { cls: 'bvl-back-btn', text: '← Dashboard' })
            .addEventListener('click', () => { this.currentView = 'dashboard'; this.render(); });

        const secHdr = content.createDiv({ cls: 'bvl-section-header' });
        secHdr.createEl('h3', { text: 'All Entries' });
        secHdr.createDiv({ cls: 'bvl-section-divider' });

        const sfRow = content.createDiv({ cls: 'bvl-search-filter-row' });

        const searchInput = sfRow.createEl('input', { cls: 'bvl-search-input', type: 'search', placeholder: '🔍 Search…' });
        searchInput.value = this.searchQuery;

        // Filter by beverage type
        const filterSelect = sfRow.createEl('select', { cls: 'bvl-filter-select' });
        filterSelect.createEl('option', { value: 'all', text: 'All Types' });
        const uniqueTypes = [...new Set(this.entries.map(e => e.beverage_type).filter(Boolean))].sort();
        for (const t of uniqueTypes) {
            const o = filterSelect.createEl('option', { value: t, text: t.length > 14 ? t.slice(0,12)+'…' : t });
            if (this.filterType === t) o.selected = true;
        }
        if (this.filterType === 'all') filterSelect.value = 'all';

        const tableWrap    = content.createDiv({ cls: 'bvl-entries-view' });
        const countEl      = content.createEl('p', { cls: 'bvl-entries-count' });
        const paginWrap    = content.createDiv({ cls: 'bvl-pagination' });

        const refresh = () => {
            this.applyFilters();
            this.renderEntriesTable(tableWrap, countEl, paginWrap);
        };

        searchInput.addEventListener('input', () => {
            this.searchQuery = searchInput.value; this.currentPage = 0; refresh();
        });
        filterSelect.addEventListener('change', () => {
            this.filterType = filterSelect.value; this.currentPage = 0; refresh();
        });

        this.applyFilters();
        this.renderEntriesTable(tableWrap, countEl, paginWrap);
    }

    applyFilters() {
        let result = [...this.entries];
        if (this.filterType !== 'all') result = result.filter(e => e.beverage_type === this.filterType);
        if (this.searchQuery.trim()) {
            const q = this.searchQuery.toLowerCase();
            result = result.filter(e =>
                e.date.includes(q) || e.time.includes(q) ||
                e.beverage_type.toLowerCase().includes(q)  ||
                e.beverage_brand.toLowerCase().includes(q) ||
                e.beverage_size.toLowerCase().includes(q)  ||
                e.location.toLowerCase().includes(q)       ||
                e.comments.toLowerCase().includes(q)
            );
        }
        this.filteredEntries = result;
    }

    renderEntriesTable(container, countEl, paginWrap) {
        container.empty(); paginWrap.empty();

        const total      = this.filteredEntries.length;
        const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
        if (this.currentPage >= totalPages) this.currentPage = 0;

        const pageEntries = this.filteredEntries.slice(this.currentPage * PAGE_SIZE, (this.currentPage + 1) * PAGE_SIZE);
        countEl.textContent = `Showing ${pageEntries.length} of ${total} entries`;

        if (total === 0) {
            const empty = container.createDiv({ cls: 'bvl-empty-state' });
            empty.createEl('span', { cls: 'empty-icon', text: '🥤' });
            empty.createEl('p', { text: 'No entries found' });
            return;
        }

        const tableWrap = container.createDiv({ cls: 'bvl-table-wrap' });
        const table     = tableWrap.createEl('table', { cls: 'bvl-table' });
        const hrow      = table.createEl('thead').createEl('tr');
        for (const h of ['Date / Time', 'Type', 'Brand', 'Size', 'Location']) hrow.createEl('th', { text: h });

        const tbody = table.createEl('tbody');
        for (const entry of pageEntries) {
            const tr = tbody.createEl('tr');
            tr.createEl('td', { text: formatDateTime(entry.date, entry.time) });

            const typeTd = tr.createEl('td');
            if (entry.beverage_type) typeTd.createEl('span', { cls: `bvl-badge ${badgeClass(entry.beverage_type)}`, text: entry.beverage_type });
            else typeTd.createEl('span', { cls: 'bvl-badge bvl-badge-none', text: '—' });

            const brandTd = tr.createEl('td');
            brandTd.textContent = entry.beverage_brand
                ? (entry.beverage_brand.length > 16 ? entry.beverage_brand.slice(0,14)+'…' : entry.beverage_brand) : '—';

            tr.createEl('td', { text: entry.beverage_size || '—' });

            const locTd = tr.createEl('td');
            locTd.textContent = entry.location
                ? (entry.location.length > 20 ? entry.location.slice(0,18)+'…' : entry.location) : '—';

            tr.addEventListener('click', () => {
                this.currentEntry = entry;
                this.currentView  = 'detail';
                this.render();
            });
        }

        if (totalPages > 1) {
            const prevBtn = paginWrap.createEl('button', { cls: 'bvl-page-btn', text: '← Prev' });
            if (this.currentPage === 0) prevBtn.disabled = true;
            prevBtn.addEventListener('click', () => { this.currentPage--; this.renderEntriesTable(container, countEl, paginWrap); });

            paginWrap.createEl('span', { cls: 'bvl-page-info', text: `Page ${this.currentPage+1} of ${totalPages}` });

            const nextBtn = paginWrap.createEl('button', { cls: 'bvl-page-btn', text: 'Next →' });
            if (this.currentPage >= totalPages - 1) nextBtn.disabled = true;
            nextBtn.addEventListener('click', () => { this.currentPage++; this.renderEntriesTable(container, countEl, paginWrap); });
        }
    }

    // ---- DETAIL ----
    renderDetail() {
        const entry = this.currentEntry;
        if (!entry) { this.currentView = 'entries'; this.render(); return; }

        const content = this.wrapper.createDiv({ cls: 'bvl-content' });
        content.createEl('button', { cls: 'bvl-back-btn', text: '← Entries' })
            .addEventListener('click', () => { this.currentView = 'entries'; this.render(); });

        const secHdr = content.createDiv({ cls: 'bvl-section-header' });
        secHdr.createEl('h3', { text: 'Entry Detail' });
        secHdr.createDiv({ cls: 'bvl-section-divider' });

        const card   = content.createDiv({ cls: 'bvl-detail-card bvl-detail-view' });
        const fields = [
            { label: 'Date',          value: entry.date },
            { label: 'Time',          value: entry.time },
            { label: 'Bev. Type',     value: entry.beverage_type  || '—', badge: !!entry.beverage_type },
            { label: 'Brand',         value: entry.beverage_brand || '—' },
            { label: 'Size',          value: entry.beverage_size  || '—' },
            { label: 'Location',      value: entry.location       || '—' },
            { label: 'Comments',      value: entry.comments       || '—' },
            { label: 'File',          value: entry.filename },
        ];

        for (const f of fields) {
            const row = card.createDiv({ cls: 'bvl-detail-row' });
            row.createEl('span', { cls: 'bvl-detail-label', text: f.label });
            const valEl = row.createEl('span', { cls: 'bvl-detail-value' });
            if (f.badge && f.value !== '—') {
                valEl.createEl('span', { cls: `bvl-badge ${badgeClass(f.value)}`, text: f.value });
            } else {
                valEl.textContent = f.value;
            }
        }

        const actions   = content.createDiv({ cls: 'bvl-form-actions' });
        const deleteBtn = actions.createEl('button', { cls: 'bvl-btn bvl-btn-danger', text: '🗑️  Delete' });
        deleteBtn.addEventListener('click', () => {
            showConfirm('Delete Entry', 'This entry will be permanently deleted. Are you sure?', async () => {
                await this.plugin.deleteEntry(entry.filename);
                this.entries      = await this.plugin.loadAllEntries();
                this.currentEntry = null;
                this.currentView  = 'entries';
                this.applyFilters();
                showToast('Entry deleted', 'info');
                this.render();
            });
        });

        actions.createEl('button', { cls: 'bvl-btn bvl-btn-primary', text: '✏️  Edit' })
            .addEventListener('click', () => { this.currentView = 'edit'; this.render(); });
    }

    // ---- CHARTS ----
    renderCharts() {
        const content = this.wrapper.createDiv({ cls: 'bvl-content' });
        content.createEl('button', { cls: 'bvl-back-btn', text: '← Dashboard' })
            .addEventListener('click', () => { this.currentView = 'dashboard'; this.render(); });

        const secHdr = content.createDiv({ cls: 'bvl-section-header' });
        secHdr.createEl('h3', { text: 'Statistics & Charts' });
        secHdr.createDiv({ cls: 'bvl-section-divider' });

        if (this.entries.length === 0) {
            const empty = content.createDiv({ cls: 'bvl-empty-state' });
            empty.createEl('span', { cls: 'empty-icon', text: '📊' });
            empty.createEl('p', { text: 'No data yet. Add some entries to see charts!' });
            return;
        }

        this.renderTypeDonut(content);
        this.renderTopBrandsBar(content);
        this.renderTopSizesBar(content);
        this.renderDailyBar(content);
        this.renderActivityHeatmap(content);
    }

    // Donut: top beverage types
    renderTypeDonut(container) {
        const card = container.createDiv({ cls: 'bvl-chart-card' });
        card.createEl('h4', { text: '🥤 Beverage Type Breakdown' });

        const counts = {};
        for (const e of this.entries) if (e.beverage_type) counts[e.beverage_type] = (counts[e.beverage_type]||0)+1;
        const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8);
        const total  = this.entries.length || 1;

        if (sorted.length === 0) { card.createEl('p', { text: 'No type data yet.' }); return; }

        const wrap  = card.createDiv({ cls: 'bvl-donut-wrap' });
        const r = 36, cx = 50, cy = 50;
        const circumference = 2 * Math.PI * r;

        const svg = wrap.createSvg('svg', { cls: 'bvl-donut-svg' });
        svg.setAttribute('width','100'); svg.setAttribute('height','100'); svg.setAttribute('viewBox','0 0 100 100');

        const bgCirc = svg.createSvg('circle');
        bgCirc.setAttribute('cx',cx); bgCirc.setAttribute('cy',cy); bgCirc.setAttribute('r',r);
        bgCirc.setAttribute('fill','none'); bgCirc.setAttribute('stroke','var(--background-modifier-border)'); bgCirc.setAttribute('stroke-width','14');

        let offset = 0;
        for (const [label, count] of sorted) {
            const pct   = count / total;
            const dash  = circumference * pct;
            const circ  = svg.createSvg('circle');
            circ.setAttribute('cx',cx); circ.setAttribute('cy',cy); circ.setAttribute('r',r);
            circ.setAttribute('fill','none'); circ.setAttribute('stroke', badgeColor(label)); circ.setAttribute('stroke-width','14');
            circ.setAttribute('stroke-dasharray', `${dash} ${circumference - dash}`);
            circ.setAttribute('stroke-dashoffset', -offset);
            circ.setAttribute('transform', `rotate(-90 ${cx} ${cy})`);
            offset += dash;
        }

        const ct = svg.createSvg('text');
        ct.setAttribute('x',cx); ct.setAttribute('y',cy+4); ct.setAttribute('text-anchor','middle');
        ct.setAttribute('font-size','14'); ct.setAttribute('font-weight','700'); ct.setAttribute('fill','var(--text-normal)');
        ct.textContent = total;

        const legend = wrap.createDiv({ cls: 'bvl-donut-legend' });
        for (const [label, count] of sorted) {
            const item = legend.createDiv({ cls: 'bvl-legend-item' });
            const dot  = item.createDiv({ cls: 'bvl-legend-dot' });
            dot.style.background = badgeColor(label);
            item.createEl('span', { cls: 'bvl-legend-item-label', text: label });
            item.createEl('span', { cls: 'bvl-legend-item-val',   text: String(count) });
        }
    }

    // Bar: top brands
    renderTopBrandsBar(container) {
        const card = container.createDiv({ cls: 'bvl-chart-card' });
        card.createEl('h4', { text: '🏷️ Top Brands' });

        const counts = {};
        for (const e of this.entries) if (e.beverage_brand) counts[e.beverage_brand] = (counts[e.beverage_brand]||0)+1;
        const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8);

        if (sorted.length === 0) { card.createEl('p', { text: 'No brand data yet.' }); return; }

        const maxVal = sorted[0][1];
        const chart  = card.createDiv({ cls: 'bvl-bar-chart' });
        for (const [label, count] of sorted) {
            const pct = (count / maxVal * 100).toFixed(0);
            const row = chart.createDiv({ cls: 'bvl-bar-row' });
            row.createEl('span', { cls: 'bvl-bar-label', text: label });
            const track = row.createDiv({ cls: 'bvl-bar-track' });
            const fill  = track.createDiv({ cls: 'bvl-bar-fill' });
            fill.style.width      = `${pct}%`;
            fill.style.background = badgeColor(label);
            if (count > 0) fill.createEl('span', { text: String(count) });
            row.createEl('span', { cls: 'bvl-bar-value', text: String(count) });
        }
    }

    // Bar: beverage sizes
    renderTopSizesBar(container) {
        const card = container.createDiv({ cls: 'bvl-chart-card' });
        card.createEl('h4', { text: '📏 Beverage Sizes' });

        const counts = {};
        for (const e of this.entries) if (e.beverage_size) counts[e.beverage_size] = (counts[e.beverage_size]||0)+1;
        const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8);

        if (sorted.length === 0) { card.createEl('p', { text: 'No size data yet.' }); return; }

        const maxVal = sorted[0][1];
        const chart  = card.createDiv({ cls: 'bvl-bar-chart' });
        for (const [label, count] of sorted) {
            const pct = (count / maxVal * 100).toFixed(0);
            const row = chart.createDiv({ cls: 'bvl-bar-row' });
            row.createEl('span', { cls: 'bvl-bar-label', text: label });
            const track = row.createDiv({ cls: 'bvl-bar-track' });
            const fill  = track.createDiv({ cls: 'bvl-bar-fill' });
            fill.style.width      = `${pct}%`;
            fill.style.background = '#1a7a4a';
            if (count > 0) fill.createEl('span', { text: String(count) });
            row.createEl('span', { cls: 'bvl-bar-value', text: String(count) });
        }
    }

    // Bar: last 7 days
    renderDailyBar(container) {
        const card = container.createDiv({ cls: 'bvl-chart-card' });
        card.createEl('h4', { text: '📅 Entries – Last 7 Days' });

        const today = new Date();
        const days  = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today); d.setDate(today.getDate() - (6 - i));
            const str = `${d.getFullYear()}-${padZ(d.getMonth()+1)}-${padZ(d.getDate())}`;
            return { date: str, label: formatDateShort(str) };
        });

        const maxVal = Math.max(...days.map(d => this.entries.filter(e => e.date === d.date).length), 1);
        const chart  = card.createDiv({ cls: 'bvl-bar-chart' });
        for (const day of days) {
            const count = this.entries.filter(e => e.date === day.date).length;
            const pct   = (count / maxVal * 100).toFixed(0);
            const row   = chart.createDiv({ cls: 'bvl-bar-row' });
            row.createEl('span', { cls: 'bvl-bar-label', text: day.label });
            const track = row.createDiv({ cls: 'bvl-bar-track' });
            const fill  = track.createDiv({ cls: 'bvl-bar-fill' });
            fill.style.width      = `${pct}%`;
            fill.style.background = '#1a7a4a';
            if (count > 0) fill.createEl('span', { text: String(count) });
            row.createEl('span', { cls: 'bvl-bar-value', text: String(count) });
        }
    }

    // Heatmap: last 8 weeks
    renderActivityHeatmap(container) {
        const card = container.createDiv({ cls: 'bvl-chart-card' });
        card.createEl('h4', { text: '🗓️ Activity Heatmap – Last 8 Weeks' });

        const today = new Date();
        const totalDays = 8 * 7;
        const start = new Date(today); start.setDate(today.getDate() - totalDays + 1);

        const weeks = [];
        let current = new Date(start);
        while (current <= today) {
            const week = [];
            for (let d = 0; d < 7 && current <= today; d++) {
                const str = `${current.getFullYear()}-${padZ(current.getMonth()+1)}-${padZ(current.getDate())}`;
                week.push({ date: str, count: this.entries.filter(e => e.date === str).length });
                const next = new Date(current); next.setDate(current.getDate() + 1); current = next;
            }
            weeks.push(week);
        }

        const heatmap = card.createDiv({ cls: 'bvl-heatmap' });
        for (const week of weeks) {
            const col = heatmap.createDiv({ cls: 'bvl-heatmap-col' });
            col.createEl('span', { cls: 'bvl-heatmap-label', text: week[0]?.date.slice(5) || '' });
            for (const cell of week) {
                const el = col.createDiv({ cls: 'bvl-heatmap-cell' });
                if (cell.count > 0) el.setAttribute('data-count', String(Math.min(cell.count, 5)));
                el.setAttribute('title', `${cell.date}: ${cell.count} entries`);
            }
        }
    }

    // ---- DATA MANAGEMENT ----
    renderDataMgmt() {
        const content = this.wrapper.createDiv({ cls: 'bvl-content' });
        content.createEl('button', { cls: 'bvl-back-btn', text: '← Dashboard' })
            .addEventListener('click', () => { this.currentView = 'dashboard'; this.render(); });

        const secHdr = content.createDiv({ cls: 'bvl-section-header' });
        secHdr.createEl('h3', { text: 'Data Management' });
        secHdr.createDiv({ cls: 'bvl-section-divider' });

        // Export
        const exportSec = content.createDiv({ cls: 'bvl-mgmt-section' });
        exportSec.createEl('h4').textContent = '📤 Export Data';
        exportSec.createEl('p', { text: `Export all ${this.entries.length} entries to CSV saved in: ${LOG_FOLDER}/export_YYYY-MM-DD.csv` });
        const exportBtn = exportSec.createEl('button', { cls: 'bvl-btn bvl-btn-success', text: `📤  Export ${this.entries.length} Entries to CSV` });
        exportBtn.style.width = '100%';
        exportBtn.addEventListener('click', async () => {
            if (this.entries.length === 0) { showToast('No entries to export', 'error'); return; }
            exportBtn.disabled = true; exportBtn.textContent = 'Exporting…';
            try {
                const fp = await this.plugin.exportCSV(this.entries);
                showToast(`✅ Exported to: ${fp}`, 'success', 4000);
            } catch(e) { showToast(`Export failed: ${e.message}`, 'error'); }
            exportBtn.disabled = false;
            exportBtn.textContent = `📤  Export ${this.entries.length} Entries to CSV`;
        });

        // Import
        const importSec = content.createDiv({ cls: 'bvl-mgmt-section' });
        importSec.createEl('h4').textContent = '📥 Import Data';
        importSec.createEl('p', { text: 'Import from CSV. Expected columns: Date, Time, Beverage Type, Brand, Size, Location, Comments.' });
        const fileWrap  = importSec.createDiv({ cls: 'bvl-file-input-wrap' });
        const fileInput = fileWrap.createEl('input', { type: 'file' });
        fileInput.setAttribute('accept', '.csv,text/csv');
        const fileLabel = fileWrap.createEl('label', { cls: 'bvl-file-label' });
        fileLabel.textContent = '📁 Tap to choose a CSV file';

        fileInput.addEventListener('change', async () => {
            const file = fileInput.files[0]; if (!file) return;
            fileLabel.textContent = `⏳ Importing ${file.name}…`;
            const reader = new FileReader();
            reader.onload = async (evt) => {
                try {
                    const count = await this.plugin.importCSV(evt.target.result);
                    this.entries = await this.plugin.loadAllEntries();
                    this.applyFilters();
                    showToast(`✅ Imported ${count} entries`, 'success', 4000);
                    fileLabel.textContent = `✅ Imported ${count} entries from ${file.name}`;
                    this.render();
                } catch(e) {
                    showToast(`Import failed: ${e.message}`, 'error');
                    fileLabel.textContent = '❌ Import failed. Try again.';
                }
            };
            reader.onerror = () => { showToast('Failed to read file', 'error'); fileLabel.textContent = '📁 Tap to choose a CSV file'; };
            reader.readAsText(file);
        });

        // Dropdown source info
        const srcSec = content.createDiv({ cls: 'bvl-mgmt-section' });
        srcSec.createEl('h4').textContent = '📂 Dropdown Sources';
        srcSec.createEl('p', { text: 'These vault folders supply the dropdown options. Add a note (any .md file) to a folder to add an option.' });
        const sources = [
            { label: 'Beverage Types',  path: FOLDER_TYPES,  count: this.dropdowns.types.length },
            { label: 'Beverage Brands', path: FOLDER_BRANDS, count: this.dropdowns.brands.length },
            { label: 'Beverage Sizes',  path: FOLDER_SIZES,  count: this.dropdowns.sizes.length },
        ];
        for (const s of sources) {
            const row = srcSec.createDiv({ cls: 'bvl-detail-row' });
            row.createEl('span', { cls: 'bvl-detail-label', text: s.label });
            const valEl = row.createEl('span', { cls: 'bvl-detail-value' });
            valEl.innerHTML = `<small style="color:var(--text-muted);font-size:10px">${s.path}</small><br><strong>${s.count} options loaded</strong>`;
        }

        // Stats
        const statsSec = content.createDiv({ cls: 'bvl-mgmt-section' });
        statsSec.createEl('h4').textContent = '📊 Storage Info';
        const stats = this.computeStats();
        for (const row of [
            { label: 'Total entries',    value: stats.total },
            { label: 'Today',            value: stats.today },
            { label: 'This week',        value: stats.thisWeek },
            { label: 'Top type',         value: stats.topType },
            { label: 'Top brand',        value: stats.topBrand },
            { label: 'Storage folder',   value: LOG_FOLDER },
        ]) {
            const r = statsSec.createDiv({ cls: 'bvl-detail-row' });
            r.createEl('span', { cls: 'bvl-detail-label', text: row.label });
            r.createEl('span', { cls: 'bvl-detail-value', text: String(row.value) });
        }
    }
}

module.exports = BeverageLogPlugin;
