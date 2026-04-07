/*
 * Cigarette Log Plugin for Obsidian
 * Version: 1.0.0
 * Mobile-first design, Android compatible
 * Brand dropdown loaded live from vault; Type & Size are static lists
 */

'use strict';

var obsidian = require('obsidian');

// ============================================================
// CONSTANTS
// ============================================================
const PLUGIN_ID   = 'cigarette-log';
const LOG_FOLDER  = 'Activity Logs/Cigarette Log';
const PAGE_SIZE   = 20;

// Vault folder that supplies brand options
const FOLDER_BRANDS = '_system/Database/Brands/Cigarette Brands';

// Static dropdown options
const CIG_TYPES = ['Regular', 'Full Flavor', 'Light', 'Ultra-Light', 'Menthol-Light', 'Menthol'];
const CIG_SIZES = ['100s', 'Regular', 'King', 'Slim'];

// Colour palette for brand badges / charts
const PALETTE = [
    '#d97706','#b45309','#92400e','#78350f',
    '#ea580c','#c2410c','#dc2626','#b91c1c',
    '#7c3aed','#6d28d9','#059669','#0891b2'
];

// Fixed colours for the known cigarette types (used in donut & bars)
const TYPE_COLORS = {
    'Regular':       '#d97706',
    'Full Flavor':   '#dc2626',
    'Light':         '#3b82f6',
    'Ultra-Light':   '#a855f7',
    'Menthol-Light': '#22c55e',
    'Menthol':       '#14b8a6',
};

const SIZE_COLORS = {
    '100s':    '#d97706',
    'Regular': '#ea580c',
    'King':    '#7c3aed',
    'Slim':    '#059669',
};

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

/** Stable palette index 0–11 for any string (used for brand colouring) */
function paletteIdx(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
    return Math.abs(h) % PALETTE.length;
}

function brandColor(val) {
    if (!val) return '#6b7280';
    return PALETTE[paletteIdx(val)];
}

/** CSS badge class for a cigarette type (uses fixed slugs) */
function typeBadgeClass(val) {
    if (!val) return 'cgl-badge-none';
    return `cgl-badge-${slugify(val)}`;
}

/** CSS badge class for a cigarette size */
function sizeBadgeClass(val) {
    if (!val) return 'cgl-badge-none';
    return `cgl-badge-${slugify(val)}`;
}

/** CSS badge class for a brand (dynamic palette) */
function brandBadgeClass(val) {
    if (!val) return 'cgl-badge-none';
    return `cgl-badge-p${paletteIdx(val)}`;
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
    const data = {};
    for (const line of match[1].split('\n')) {
        const idx = line.indexOf(':');
        if (idx === -1) continue;
        const key = line.slice(0, idx).trim();
        let val    = line.slice(idx + 1).trim();
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
cigarette_brand: ${escapeYaml(entry.cigarette_brand || '')}
cigarette_type: ${escapeYaml(entry.cigarette_type   || '')}
cigarette_size: ${escapeYaml(entry.cigarette_size   || '')}
location: ${escapeYaml(entry.location || '')}
comments: ${escapeYaml(entry.comments || '')}
---

# Cigarette Log Entry

**Date:** ${entry.date}  
**Time:** ${entry.time}  
**Brand:** ${entry.cigarette_brand || 'N/A'}  
**Type:** ${entry.cigarette_type   || 'N/A'}  
**Size:** ${entry.cigarette_size   || 'N/A'}  
**Location:** ${entry.location || 'N/A'}  

## Comments
${entry.comments || '_No comments_'}
`;
}

function entryToFilename(entry) {
    const brandSlug = slugify(entry.cigarette_brand || 'unknown');
    const typeSlug  = slugify(entry.cigarette_type  || '');
    const base      = typeSlug ? `${brandSlug}_${typeSlug}` : brandSlug;
    return `${entry.date}_${entry.time.replace(':', '-')}_${base}.md`;
}

// ============================================================
// TOAST & CONFIRM
// ============================================================

function showToast(message, type = 'info', duration = 2800) {
    let toast = document.querySelector('.cgl-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'cgl-toast';
        document.body.appendChild(toast);
    }
    toast.className = `cgl-toast ${type}`;
    toast.textContent = message;
    requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

function showConfirm(title, message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'cgl-confirm-overlay';
    overlay.innerHTML = `
        <div class="cgl-confirm-box">
            <span class="confirm-icon">⚠️</span>
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="cgl-confirm-actions">
                <button class="cgl-btn cgl-btn-secondary" id="cgl-cancel-btn">Cancel</button>
                <button class="cgl-btn cgl-btn-danger"    id="cgl-confirm-btn">Delete</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#cgl-cancel-btn').addEventListener('click',  () => document.body.removeChild(overlay));
    overlay.querySelector('#cgl-confirm-btn').addEventListener('click', () => { document.body.removeChild(overlay); onConfirm(); });
}

// ============================================================
// PLUGIN CLASS
// ============================================================

class CigaretteLogPlugin extends obsidian.Plugin {
    async onload() {
        await this.ensureFolder();

        this.addRibbonIcon('flame', 'Cigarette Log', () => {
            new CigaretteLogModal(this.app, this).open();
        });

        this.addCommand({
            id:   'open-cigarette-log',
            name: 'Open Cigarette Log',
            callback: () => new CigaretteLogModal(this.app, this).open()
        });
    }

    async ensureFolder() {
        if (!(await this.app.vault.adapter.exists(LOG_FOLDER))) {
            try { await this.app.vault.createFolder(LOG_FOLDER); } catch(e) {}
        }
    }

    /** Load brand names from vault folder — file stems become option labels */
    async loadBrands() {
        const folder = this.app.vault.getAbstractFileByPath(FOLDER_BRANDS);
        if (!folder || !(folder instanceof obsidian.TFolder)) return [];
        return folder.children
            .filter(f => f instanceof obsidian.TFile && f.extension === 'md')
            .map(f => f.basename)
            .sort((a, b) => a.localeCompare(b));
    }

    // ---- CRUD ----
    async saveEntry(entry, oldFilename) {
        await this.ensureFolder();
        const filename = entryToFilename(entry);
        const filepath = `${LOG_FOLDER}/${filename}`;
        const content  = buildMarkdown(entry);

        if (oldFilename && oldFilename !== filename) {
            const old = this.app.vault.getAbstractFileByPath(`${LOG_FOLDER}/${oldFilename}`);
            if (old) await this.app.vault.delete(old);
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
                const raw  = await this.app.vault.read(file);
                const data = parseYamlFrontmatter(raw);
                if (data && data.date) {
                    entries.push({
                        filename:        file.name,
                        date:            data.date            || '',
                        time:            data.time            || '',
                        cigarette_brand: data.cigarette_brand || '',
                        cigarette_type:  data.cigarette_type  || '',
                        cigarette_size:  data.cigarette_size  || '',
                        location:        data.location        || '',
                        comments:        data.comments        || '',
                    });
                }
            } catch(e) { /* skip corrupt files */ }
        }

        entries.sort((a, b) =>
            `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`)
        );
        return entries;
    }

    // ---- CSV export ----
    async exportCSV(entries) {
        const headers = ['Date','Time','Brand','Type','Size','Location','Comments'];
        const rows    = entries.map(e =>
            [e.date, e.time, e.cigarette_brand, e.cigarette_type, e.cigarette_size, e.location, e.comments]
            .map(v => `"${String(v||'').replace(/"/g,'""')}"`)
            .join(',')
        );
        const csv = [headers.join(','), ...rows].join('\n');
        const ts  = new Date().toISOString().slice(0, 10);
        const fp  = `${LOG_FOLDER}/export_${ts}.csv`;
        const ex  = this.app.vault.getAbstractFileByPath(fp);
        if (ex) await this.app.vault.modify(ex, csv);
        else    await this.app.vault.create(fp, csv);
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
                date:            (cols[0]||'').trim(),
                time:            (cols[1]||'').trim() || '00:00',
                cigarette_brand: (cols[2]||'').trim(),
                cigarette_type:  (cols[3]||'').trim(),
                cigarette_size:  (cols[4]||'').trim(),
                location:        (cols[5]||'').trim(),
                comments:        (cols[6]||'').trim(),
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

class CigaretteLogModal extends obsidian.Modal {
    constructor(app, plugin) {
        super(app);
        this.plugin          = plugin;
        this.entries         = [];
        this.filteredEntries = [];
        this.brands          = [];      // vault-loaded brand list
        this.currentView     = 'dashboard';
        this.currentEntry    = null;
        this.searchQuery     = '';
        this.filterType      = 'all';   // filter by cigarette type
        this.currentPage     = 0;
        this.contentEl.addClass('cgl-modal-root');
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
        this.wrapper = this.contentEl.createDiv({ cls: 'cgl-modal' });

        // Load entries and brands in parallel
        [this.entries, this.brands] = await Promise.all([
            this.plugin.loadAllEntries(),
            this.plugin.loadBrands(),
        ]);
        this.filteredEntries = [...this.entries];

        this.render();
    }

    onClose() { this.contentEl.empty(); }

    render() {
        this.wrapper.empty();
        this.renderHeader();
        switch (this.currentView) {
            case 'dashboard': this.renderDashboard(); break;
            case 'add':       this.renderForm(false); break;
            case 'edit':      this.renderForm(true);  break;
            case 'entries':   this.renderEntries();   break;
            case 'charts':    this.renderCharts();    break;
            case 'detail':    this.renderDetail();    break;
            case 'data':      this.renderDataMgmt();  break;
        }
    }

    // ---- HEADER ----
    renderHeader() {
        const hdr = this.wrapper.createDiv({ cls: 'cgl-header' });
        const top = hdr.createDiv({ cls: 'cgl-header-top' });
        top.createDiv().createEl('h2').innerHTML =
            `<span class="cgl-header-icon">🚬</span> Cigarette Log`;
        hdr.createEl('p', { cls: 'cgl-header-subtitle', text: 'Personal cigarette consumption tracker' });
        top.createEl('button', { cls: 'cgl-close-btn', text: '✕' })
            .addEventListener('click', () => this.close());
        this.renderStatsStrip();
    }

    renderStatsStrip() {
        const strip = this.wrapper.createDiv({ cls: 'cgl-stats-strip' });
        const s     = this.computeStats();
        for (const chip of [
            { value: s.total,      label: 'Total' },
            { value: s.today,      label: 'Today' },
            { value: s.thisWeek,   label: 'This Week' },
            { value: s.topBrand,   label: 'Top Brand' },
            { value: s.topType,    label: 'Top Type' },
        ]) {
            const c = strip.createDiv({ cls: 'cgl-stat-chip' });
            c.createEl('span', { cls: 'stat-value', text: String(chip.value) });
            c.createEl('span', { cls: 'stat-label', text: chip.label });
        }
    }

    computeStats() {
        const today  = nowDate();
        const total  = this.entries.length;
        const todayCnt = this.entries.filter(e => e.date === today).length;

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const wStr    = `${weekAgo.getFullYear()}-${padZ(weekAgo.getMonth()+1)}-${padZ(weekAgo.getDate())}`;
        const thisWeek = this.entries.filter(e => e.date >= wStr).length;

        const brandCounts = {}, typeCounts = {};
        for (const e of this.entries) {
            if (e.cigarette_brand) brandCounts[e.cigarette_brand] = (brandCounts[e.cigarette_brand]||0)+1;
            if (e.cigarette_type)  typeCounts[e.cigarette_type]   = (typeCounts[e.cigarette_type]||0)+1;
        }
        const topBrand = Object.entries(brandCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || '—';
        const topType  = Object.entries(typeCounts).sort((a,b)=>b[1]-a[1])[0]?.[0]  || '—';

        return { total, today: todayCnt, thisWeek, topBrand, topType };
    }

    // ---- DASHBOARD ----
    renderDashboard() {
        const content = this.wrapper.createDiv({ cls: 'cgl-content' });
        const grid    = content.createDiv({ cls: 'cgl-dashboard-grid' });

        for (const btn of [
            { icon: '➕', label: 'Add Entry',    desc: 'Log a cigarette',        view: 'add' },
            { icon: '📋', label: 'View Entries', desc: 'Browse & search logs',   view: 'entries' },
            { icon: '📊', label: 'Charts',       desc: 'Visual statistics',      view: 'charts' },
            { icon: '⚙️', label: 'Data Manager', desc: 'Import / Export CSV',    view: 'data', full: true },
        ]) {
            const el = grid.createEl('button', { cls: 'cgl-dashboard-btn' + (btn.full ? ' full-width' : '') });
            el.innerHTML = `
                <span class="btn-icon">${btn.icon}</span>
                <span class="btn-label">${btn.label}</span>
                <span class="btn-desc">${btn.desc}</span>`;
            el.addEventListener('click', () => { this.currentView = btn.view; this.render(); });
        }
    }

    // ---- ADD / EDIT FORM ----
    renderForm(isEdit) {
        const entry   = isEdit && this.currentEntry ? this.currentEntry : null;
        const content = this.wrapper.createDiv({ cls: 'cgl-content' });

        content.createEl('button', { cls: 'cgl-back-btn', text: '← Back' })
            .addEventListener('click', () => {
                this.currentView = isEdit ? 'detail' : 'dashboard';
                this.render();
            });

        if (isEdit) content.createDiv({ cls: 'cgl-edit-banner', text: '✏️  Editing existing entry' });

        const form = content.createDiv({ cls: `cgl-form-view${isEdit ? ' cgl-edit-mode' : ''}` });

        const secHdr = form.createDiv({ cls: 'cgl-section-header' });
        secHdr.createEl('h3', { text: isEdit ? 'Edit Entry' : 'New Entry' });
        secHdr.createDiv({ cls: 'cgl-section-divider' });

        // ---- Date & Time ----
        const row1 = form.createDiv({ cls: 'cgl-form-row' });

        const dateGrp = row1.createDiv({ cls: 'cgl-form-group' });
        dateGrp.createEl('label', { cls: 'required', text: 'Date' });
        const dateInput = dateGrp.createEl('input', {
            cls: 'cgl-input', type: 'date', value: entry ? entry.date : nowDate()
        });

        const timeGrp = row1.createDiv({ cls: 'cgl-form-group' });
        timeGrp.createEl('label', { cls: 'required', text: 'Time' });
        const timeInput = timeGrp.createEl('input', {
            cls: 'cgl-input', type: 'time', value: entry ? entry.time : nowTime()
        });

        // ---- Cigarette Brand (vault-driven) ----
        const brandGrp = form.createDiv({ cls: 'cgl-form-group' });
        brandGrp.createEl('label', { text: 'Cigarette Brand' });
        const brandSelect = brandGrp.createEl('select', { cls: 'cgl-select' });
        brandSelect.createEl('option', { value: '', text: '— Select Brand —' });
        if (this.brands.length === 0) {
            brandSelect.createEl('option', { value: '__none__', text: `(No brands — add notes to ${FOLDER_BRANDS})` });
            brandGrp.createEl('p', { cls: 'cgl-select-note', text: `Add .md files to: ${FOLDER_BRANDS}` });
        } else {
            for (const b of this.brands) {
                const o = brandSelect.createEl('option', { value: b, text: b });
                if (entry && entry.cigarette_brand === b) o.selected = true;
            }
        }

        // ---- Cigarette Type (static) ----
        const typeGrp = form.createDiv({ cls: 'cgl-form-group' });
        typeGrp.createEl('label', { text: 'Cigarette Type' });
        const typeSelect = typeGrp.createEl('select', { cls: 'cgl-select' });
        typeSelect.createEl('option', { value: '', text: '— Select Type —' });
        for (const t of CIG_TYPES) {
            const o = typeSelect.createEl('option', { value: t, text: t });
            if (entry && entry.cigarette_type === t) o.selected = true;
        }

        // ---- Cigarette Size (static) ----
        const sizeGrp = form.createDiv({ cls: 'cgl-form-group' });
        sizeGrp.createEl('label', { text: 'Cigarette Size' });
        const sizeSelect = sizeGrp.createEl('select', { cls: 'cgl-select' });
        sizeSelect.createEl('option', { value: '', text: '— Select Size —' });
        for (const s of CIG_SIZES) {
            const o = sizeSelect.createEl('option', { value: s, text: s });
            if (entry && entry.cigarette_size === s) o.selected = true;
        }

        // ---- Location ----
        const locGrp = form.createDiv({ cls: 'cgl-form-group' });
        locGrp.createEl('label', { text: 'Location' });
        const locRow   = locGrp.createDiv({ cls: 'cgl-location-row' });
        const locInput = locRow.createEl('input', {
            cls: 'cgl-input', type: 'text',
            placeholder: 'Enter location or use GPS…',
            value: entry ? entry.location : ''
        });
        const gpsBtn = locRow.createEl('button', { cls: 'cgl-location-btn', text: '📍' });
        gpsBtn.setAttribute('title', 'Get current location');
        gpsBtn.addEventListener('click', () => {
            gpsBtn.textContent = '⏳'; gpsBtn.disabled = true;
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
        const comGrp = form.createDiv({ cls: 'cgl-form-group' });
        comGrp.createEl('label', { text: 'Comments' });
        const comTextarea = comGrp.createEl('textarea', {
            cls: 'cgl-textarea', placeholder: 'Any additional notes…'
        });
        if (entry && entry.comments) comTextarea.value = entry.comments;

        // ---- Sticky actions ----
        const actions   = form.createDiv({ cls: 'cgl-form-actions' });
        const cancelBtn = actions.createEl('button', { cls: 'cgl-btn cgl-btn-secondary', text: 'Cancel' });
        cancelBtn.addEventListener('click', () => {
            this.currentView = isEdit ? 'detail' : 'dashboard'; this.render();
        });

        const saveBtn = actions.createEl('button', {
            cls: 'cgl-btn cgl-btn-primary',
            text: isEdit ? '💾  Save Changes' : '💾  Save Entry'
        });

        saveBtn.addEventListener('click', async () => {
            const date = dateInput.value.trim();
            const time = timeInput.value.trim();
            if (!date || !time) { showToast('Date and Time are required', 'error'); return; }

            saveBtn.disabled = true; saveBtn.textContent = 'Saving…';

            const newEntry = {
                date,
                time,
                cigarette_brand: brandSelect.value === '__none__' ? '' : brandSelect.value,
                cigarette_type:  typeSelect.value,
                cigarette_size:  sizeSelect.value,
                location:        locInput.value.trim(),
                comments:        comTextarea.value.trim(),
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
                saveBtn.disabled = false;
                saveBtn.textContent = isEdit ? '💾  Save Changes' : '💾  Save Entry';
            }
        });
    }

    // ---- ENTRIES TABLE ----
    renderEntries() {
        const content = this.wrapper.createDiv({ cls: 'cgl-content' });
        content.createEl('button', { cls: 'cgl-back-btn', text: '← Dashboard' })
            .addEventListener('click', () => { this.currentView = 'dashboard'; this.render(); });

        const secHdr = content.createDiv({ cls: 'cgl-section-header' });
        secHdr.createEl('h3', { text: 'All Entries' });
        secHdr.createDiv({ cls: 'cgl-section-divider' });

        const sfRow       = content.createDiv({ cls: 'cgl-search-filter-row' });
        const searchInput = sfRow.createEl('input', { cls: 'cgl-search-input', type: 'search', placeholder: '🔍 Search…' });
        searchInput.value = this.searchQuery;

        // Filter by cigarette type (static list is predictable)
        const filterSelect = sfRow.createEl('select', { cls: 'cgl-filter-select' });
        filterSelect.createEl('option', { value: 'all', text: 'All Types' });
        for (const t of CIG_TYPES) {
            const o = filterSelect.createEl('option', { value: t, text: t });
            if (this.filterType === t) o.selected = true;
        }
        if (this.filterType === 'all') filterSelect.value = 'all';

        const tableWrap = content.createDiv({ cls: 'cgl-entries-view' });
        const countEl   = content.createEl('p', { cls: 'cgl-entries-count' });
        const paginWrap = content.createDiv({ cls: 'cgl-pagination' });

        const refresh = () => { this.applyFilters(); this.renderEntriesTable(tableWrap, countEl, paginWrap); };

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
        if (this.filterType !== 'all') result = result.filter(e => e.cigarette_type === this.filterType);
        if (this.searchQuery.trim()) {
            const q = this.searchQuery.toLowerCase();
            result  = result.filter(e =>
                e.date.includes(q)                         ||
                e.time.includes(q)                         ||
                e.cigarette_brand.toLowerCase().includes(q)||
                e.cigarette_type.toLowerCase().includes(q) ||
                e.cigarette_size.toLowerCase().includes(q) ||
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
            const empty = container.createDiv({ cls: 'cgl-empty-state' });
            empty.createEl('span', { cls: 'empty-icon', text: '🚬' });
            empty.createEl('p', { text: 'No entries found' });
            return;
        }

        const tableWrap = container.createDiv({ cls: 'cgl-table-wrap' });
        const table     = tableWrap.createEl('table', { cls: 'cgl-table' });
        const hrow      = table.createEl('thead').createEl('tr');
        for (const h of ['Date / Time', 'Brand', 'Type', 'Size', 'Location'])
            hrow.createEl('th', { text: h });

        const tbody = table.createEl('tbody');
        for (const entry of pageEntries) {
            const tr = tbody.createEl('tr');
            tr.createEl('td', { text: formatDateTime(entry.date, entry.time) });

            // Brand
            const brandTd = tr.createEl('td');
            if (entry.cigarette_brand) {
                brandTd.createEl('span', {
                    cls: `cgl-badge ${brandBadgeClass(entry.cigarette_brand)}`,
                    text: entry.cigarette_brand
                });
            } else {
                brandTd.createEl('span', { cls: 'cgl-badge cgl-badge-none', text: '—' });
            }

            // Type
            const typeTd = tr.createEl('td');
            if (entry.cigarette_type) {
                typeTd.createEl('span', {
                    cls: `cgl-badge ${typeBadgeClass(entry.cigarette_type)}`,
                    text: entry.cigarette_type
                });
            } else {
                typeTd.createEl('span', { cls: 'cgl-badge cgl-badge-none', text: '—' });
            }

            // Size
            const sizeTd = tr.createEl('td');
            if (entry.cigarette_size) {
                sizeTd.createEl('span', {
                    cls: `cgl-badge ${sizeBadgeClass(entry.cigarette_size)}`,
                    text: entry.cigarette_size
                });
            } else {
                sizeTd.createEl('span', { cls: 'cgl-badge cgl-badge-none', text: '—' });
            }

            // Location
            const locTd = tr.createEl('td');
            locTd.textContent = entry.location
                ? (entry.location.length > 20 ? entry.location.slice(0,18)+'…' : entry.location) : '—';

            tr.addEventListener('click', () => {
                this.currentEntry = entry; this.currentView = 'detail'; this.render();
            });
        }

        if (totalPages > 1) {
            const prevBtn = paginWrap.createEl('button', { cls: 'cgl-page-btn', text: '← Prev' });
            if (this.currentPage === 0) prevBtn.disabled = true;
            prevBtn.addEventListener('click', () => { this.currentPage--; this.renderEntriesTable(container, countEl, paginWrap); });

            paginWrap.createEl('span', { cls: 'cgl-page-info', text: `Page ${this.currentPage+1} of ${totalPages}` });

            const nextBtn = paginWrap.createEl('button', { cls: 'cgl-page-btn', text: 'Next →' });
            if (this.currentPage >= totalPages - 1) nextBtn.disabled = true;
            nextBtn.addEventListener('click', () => { this.currentPage++; this.renderEntriesTable(container, countEl, paginWrap); });
        }
    }

    // ---- DETAIL ----
    renderDetail() {
        const entry = this.currentEntry;
        if (!entry) { this.currentView = 'entries'; this.render(); return; }

        const content = this.wrapper.createDiv({ cls: 'cgl-content' });
        content.createEl('button', { cls: 'cgl-back-btn', text: '← Entries' })
            .addEventListener('click', () => { this.currentView = 'entries'; this.render(); });

        const secHdr = content.createDiv({ cls: 'cgl-section-header' });
        secHdr.createEl('h3', { text: 'Entry Detail' });
        secHdr.createDiv({ cls: 'cgl-section-divider' });

        const card = content.createDiv({ cls: 'cgl-detail-card cgl-detail-view' });

        const fields = [
            { label: 'Date',     value: entry.date },
            { label: 'Time',     value: entry.time },
            { label: 'Brand',    value: entry.cigarette_brand || '—', brandBadge: !!entry.cigarette_brand },
            { label: 'Type',     value: entry.cigarette_type  || '—', typeBadge:  !!entry.cigarette_type  },
            { label: 'Size',     value: entry.cigarette_size  || '—', sizeBadge:  !!entry.cigarette_size  },
            { label: 'Location', value: entry.location        || '—' },
            { label: 'Comments', value: entry.comments        || '—' },
            { label: 'File',     value: entry.filename },
        ];

        for (const f of fields) {
            const row   = card.createDiv({ cls: 'cgl-detail-row' });
            row.createEl('span', { cls: 'cgl-detail-label', text: f.label });
            const valEl = row.createEl('span', { cls: 'cgl-detail-value' });
            if (f.brandBadge) {
                valEl.createEl('span', { cls: `cgl-badge ${brandBadgeClass(f.value)}`, text: f.value });
            } else if (f.typeBadge) {
                valEl.createEl('span', { cls: `cgl-badge ${typeBadgeClass(f.value)}`,  text: f.value });
            } else if (f.sizeBadge) {
                valEl.createEl('span', { cls: `cgl-badge ${sizeBadgeClass(f.value)}`,  text: f.value });
            } else {
                valEl.textContent = f.value;
            }
        }

        const actions = content.createDiv({ cls: 'cgl-form-actions' });
        actions.createEl('button', { cls: 'cgl-btn cgl-btn-danger', text: '🗑️  Delete' })
            .addEventListener('click', () => {
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

        actions.createEl('button', { cls: 'cgl-btn cgl-btn-primary', text: '✏️  Edit' })
            .addEventListener('click', () => { this.currentView = 'edit'; this.render(); });
    }

    // ---- CHARTS ----
    renderCharts() {
        const content = this.wrapper.createDiv({ cls: 'cgl-content' });
        content.createEl('button', { cls: 'cgl-back-btn', text: '← Dashboard' })
            .addEventListener('click', () => { this.currentView = 'dashboard'; this.render(); });

        const secHdr = content.createDiv({ cls: 'cgl-section-header' });
        secHdr.createEl('h3', { text: 'Statistics & Charts' });
        secHdr.createDiv({ cls: 'cgl-section-divider' });

        if (this.entries.length === 0) {
            const empty = content.createDiv({ cls: 'cgl-empty-state' });
            empty.createEl('span', { cls: 'empty-icon', text: '📊' });
            empty.createEl('p', { text: 'No data yet. Add some entries to see charts!' });
            return;
        }

        this.renderTypeDonut(content);
        this.renderTopBrandsBar(content);
        this.renderSizeBar(content);
        this.renderDailyBar(content);
        this.renderActivityHeatmap(content);
    }

    // Donut: cigarette types
    renderTypeDonut(container) {
        const card = container.createDiv({ cls: 'cgl-chart-card' });
        card.createEl('h4', { text: '🚬 Cigarette Type Breakdown' });

        const counts = {};
        for (const e of this.entries) if (e.cigarette_type) counts[e.cigarette_type] = (counts[e.cigarette_type]||0)+1;
        const data  = CIG_TYPES.map(t => ({ label: t, count: counts[t]||0, color: TYPE_COLORS[t]||'#6b7280' })).filter(d => d.count > 0);
        const total = this.entries.length || 1;

        if (data.length === 0) { card.createEl('p', { text: 'No type data yet.' }); return; }

        const wrap = card.createDiv({ cls: 'cgl-donut-wrap' });
        const r = 36, cx = 50, cy = 50, circ = 2 * Math.PI * r;

        const svg = wrap.createSvg('svg', { cls: 'cgl-donut-svg' });
        svg.setAttribute('width','100'); svg.setAttribute('height','100'); svg.setAttribute('viewBox','0 0 100 100');

        const bgC = svg.createSvg('circle');
        bgC.setAttribute('cx',cx); bgC.setAttribute('cy',cy); bgC.setAttribute('r',r);
        bgC.setAttribute('fill','none'); bgC.setAttribute('stroke','var(--background-modifier-border)'); bgC.setAttribute('stroke-width','14');

        let offset = 0;
        for (const seg of data) {
            const dash = circ * (seg.count / total);
            const c    = svg.createSvg('circle');
            c.setAttribute('cx',cx); c.setAttribute('cy',cy); c.setAttribute('r',r);
            c.setAttribute('fill','none'); c.setAttribute('stroke',seg.color); c.setAttribute('stroke-width','14');
            c.setAttribute('stroke-dasharray', `${dash} ${circ - dash}`);
            c.setAttribute('stroke-dashoffset', -offset);
            c.setAttribute('transform', `rotate(-90 ${cx} ${cy})`);
            offset += dash;
        }

        const ct = svg.createSvg('text');
        ct.setAttribute('x',cx); ct.setAttribute('y',cy+4); ct.setAttribute('text-anchor','middle');
        ct.setAttribute('font-size','14'); ct.setAttribute('font-weight','700'); ct.setAttribute('fill','var(--text-normal)');
        ct.textContent = total;

        const legend = wrap.createDiv({ cls: 'cgl-donut-legend' });
        for (const seg of data) {
            const item = legend.createDiv({ cls: 'cgl-legend-item' });
            item.createDiv({ cls: 'cgl-legend-dot' }).style.background = seg.color;
            item.createEl('span', { cls: 'cgl-legend-item-label', text: seg.label });
            item.createEl('span', { cls: 'cgl-legend-item-val',   text: String(seg.count) });
        }
    }

    // Bar: top brands
    renderTopBrandsBar(container) {
        const card = container.createDiv({ cls: 'cgl-chart-card' });
        card.createEl('h4', { text: '🏷️ Top Brands' });

        const counts = {};
        for (const e of this.entries) if (e.cigarette_brand) counts[e.cigarette_brand] = (counts[e.cigarette_brand]||0)+1;
        const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8);

        if (sorted.length === 0) { card.createEl('p', { text: 'No brand data yet.' }); return; }

        const maxVal = sorted[0][1];
        const chart  = card.createDiv({ cls: 'cgl-bar-chart' });
        for (const [label, count] of sorted) {
            const row   = chart.createDiv({ cls: 'cgl-bar-row' });
            row.createEl('span', { cls: 'cgl-bar-label', text: label });
            const fill = row.createDiv({ cls: 'cgl-bar-track' }).createDiv({ cls: 'cgl-bar-fill' });
            fill.style.width      = `${(count / maxVal * 100).toFixed(0)}%`;
            fill.style.background = brandColor(label);
            if (count > 0) fill.createEl('span', { text: String(count) });
            row.createEl('span', { cls: 'cgl-bar-value', text: String(count) });
        }
    }

    // Bar: cigarette sizes
    renderSizeBar(container) {
        const card = container.createDiv({ cls: 'cgl-chart-card' });
        card.createEl('h4', { text: '📏 Cigarette Sizes' });

        const counts = {};
        for (const e of this.entries) if (e.cigarette_size) counts[e.cigarette_size] = (counts[e.cigarette_size]||0)+1;
        const data   = CIG_SIZES.map(s => [s, counts[s]||0]).filter(([,c])=>c>0);

        if (data.length === 0) { card.createEl('p', { text: 'No size data yet.' }); return; }

        const maxVal = Math.max(...data.map(([,c])=>c));
        const chart  = card.createDiv({ cls: 'cgl-bar-chart' });
        for (const [label, count] of data) {
            const row  = chart.createDiv({ cls: 'cgl-bar-row' });
            row.createEl('span', { cls: 'cgl-bar-label', text: label });
            const fill = row.createDiv({ cls: 'cgl-bar-track' }).createDiv({ cls: 'cgl-bar-fill' });
            fill.style.width      = `${(count / maxVal * 100).toFixed(0)}%`;
            fill.style.background = SIZE_COLORS[label] || '#7c4a03';
            if (count > 0) fill.createEl('span', { text: String(count) });
            row.createEl('span', { cls: 'cgl-bar-value', text: String(count) });
        }
    }

    // Bar: last 7 days
    renderDailyBar(container) {
        const card  = container.createDiv({ cls: 'cgl-chart-card' });
        card.createEl('h4', { text: '📅 Cigarettes – Last 7 Days' });

        const today = new Date();
        const days  = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today); d.setDate(today.getDate() - (6 - i));
            const str = `${d.getFullYear()}-${padZ(d.getMonth()+1)}-${padZ(d.getDate())}`;
            return { date: str, label: formatDateShort(str) };
        });

        const maxVal = Math.max(...days.map(d => this.entries.filter(e => e.date === d.date).length), 1);
        const chart  = card.createDiv({ cls: 'cgl-bar-chart' });
        for (const day of days) {
            const count = this.entries.filter(e => e.date === day.date).length;
            const row   = chart.createDiv({ cls: 'cgl-bar-row' });
            row.createEl('span', { cls: 'cgl-bar-label', text: day.label });
            const fill  = row.createDiv({ cls: 'cgl-bar-track' }).createDiv({ cls: 'cgl-bar-fill' });
            fill.style.width      = `${(count / maxVal * 100).toFixed(0)}%`;
            fill.style.background = '#7c4a03';
            if (count > 0) fill.createEl('span', { text: String(count) });
            row.createEl('span', { cls: 'cgl-bar-value', text: String(count) });
        }
    }

    // Heatmap: last 8 weeks
    renderActivityHeatmap(container) {
        const card   = container.createDiv({ cls: 'cgl-chart-card' });
        card.createEl('h4', { text: '🗓️ Activity Heatmap – Last 8 Weeks' });

        const today = new Date();
        const start = new Date(today); start.setDate(today.getDate() - 55);

        const weeks = [];
        let current = new Date(start);
        while (current <= today) {
            const week = [];
            for (let d = 0; d < 7 && current <= today; d++) {
                const str = `${current.getFullYear()}-${padZ(current.getMonth()+1)}-${padZ(current.getDate())}`;
                week.push({ date: str, count: this.entries.filter(e => e.date === str).length });
                const nxt = new Date(current); nxt.setDate(current.getDate() + 1); current = nxt;
            }
            weeks.push(week);
        }

        const heatmap = card.createDiv({ cls: 'cgl-heatmap' });
        for (const week of weeks) {
            const col = heatmap.createDiv({ cls: 'cgl-heatmap-col' });
            col.createEl('span', { cls: 'cgl-heatmap-label', text: week[0]?.date.slice(5) || '' });
            for (const cell of week) {
                const el = col.createDiv({ cls: 'cgl-heatmap-cell' });
                if (cell.count > 0) el.setAttribute('data-count', String(Math.min(cell.count, 5)));
                el.setAttribute('title', `${cell.date}: ${cell.count} cigarettes`);
            }
        }
    }

    // ---- DATA MANAGEMENT ----
    renderDataMgmt() {
        const content = this.wrapper.createDiv({ cls: 'cgl-content' });
        content.createEl('button', { cls: 'cgl-back-btn', text: '← Dashboard' })
            .addEventListener('click', () => { this.currentView = 'dashboard'; this.render(); });

        const secHdr = content.createDiv({ cls: 'cgl-section-header' });
        secHdr.createEl('h3', { text: 'Data Management' });
        secHdr.createDiv({ cls: 'cgl-section-divider' });

        // Export
        const exportSec = content.createDiv({ cls: 'cgl-mgmt-section' });
        exportSec.createEl('h4').textContent = '📤 Export Data';
        exportSec.createEl('p', { text: `Export all ${this.entries.length} entries to CSV in: ${LOG_FOLDER}/export_YYYY-MM-DD.csv` });
        const exportBtn = exportSec.createEl('button', {
            cls: 'cgl-btn cgl-btn-success',
            text: `📤  Export ${this.entries.length} Entries to CSV`
        });
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
        const importSec = content.createDiv({ cls: 'cgl-mgmt-section' });
        importSec.createEl('h4').textContent = '📥 Import Data';
        importSec.createEl('p', { text: 'Import from CSV. Expected columns: Date, Time, Brand, Type, Size, Location, Comments.' });
        const fileWrap  = importSec.createDiv({ cls: 'cgl-file-input-wrap' });
        const fileInput = fileWrap.createEl('input', { type: 'file' });
        fileInput.setAttribute('accept', '.csv,text/csv');
        const fileLabel = fileWrap.createEl('label', { cls: 'cgl-file-label' });
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

        // Brand dropdown source info
        const srcSec = content.createDiv({ cls: 'cgl-mgmt-section' });
        srcSec.createEl('h4').textContent = '📂 Brand Dropdown Source';
        srcSec.createEl('p', { text: 'Add a .md file to this folder to add a brand option. The file name becomes the dropdown label.' });
        const srcRow = srcSec.createDiv({ cls: 'cgl-detail-row' });
        srcRow.createEl('span', { cls: 'cgl-detail-label', text: 'Cig. Brands' });
        const srcVal = srcRow.createEl('span', { cls: 'cgl-detail-value' });
        srcVal.innerHTML = `<small style="color:var(--text-muted);font-size:10px">${FOLDER_BRANDS}</small><br><strong>${this.brands.length} brands loaded</strong>`;

        // Stats
        const statsSec = content.createDiv({ cls: 'cgl-mgmt-section' });
        statsSec.createEl('h4').textContent = '📊 Storage Info';
        const s = this.computeStats();
        for (const row of [
            { label: 'Total entries',  value: s.total },
            { label: 'Today',          value: s.today },
            { label: 'This week',      value: s.thisWeek },
            { label: 'Top brand',      value: s.topBrand },
            { label: 'Top type',       value: s.topType },
            { label: 'Storage folder', value: LOG_FOLDER },
        ]) {
            const r = statsSec.createDiv({ cls: 'cgl-detail-row' });
            r.createEl('span', { cls: 'cgl-detail-label', text: row.label });
            r.createEl('span', { cls: 'cgl-detail-value', text: String(row.value) });
        }
    }
}

module.exports = CigaretteLogPlugin;
