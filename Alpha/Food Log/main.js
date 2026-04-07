/*
 * Food Log Plugin for Obsidian
 * Version: 1.0.0
 * Mobile-first design, Android compatible
 */

'use strict';

var obsidian = require('obsidian');

// ============================================================
// CONSTANTS
// ============================================================
const PLUGIN_ID = 'food-log';
const LOG_FOLDER = 'Activity Logs/Food Log';
const DB_FOLDER_PREPARED_BY = '_system/Database/Prepared By';
const DB_FOLDER_FOOD_ITEMS = '_system/Database/Food Items';
const PAGE_SIZE = 20;

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

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
    if (!val) return 'fl-badge-none';
    const v = val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z-]/g, '');
    return `fl-badge-${v}`;
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
    let inList = null;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('  - ') && inList) {
            data[inList].push(line.slice(4).trim().replace(/^["']|["']$/g, ''));
            continue;
        }
        inList = null;
        const idx = line.indexOf(':');
        if (idx === -1) continue;
        const key = line.slice(0, idx).trim();
        let val = line.slice(idx + 1).trim();
        if (val === '') {
            data[key] = [];
            inList = key;
        } else {
            if ((val.startsWith('"') && val.endsWith('"')) ||
                (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, '\n');
            }
            data[key] = val;
        }
    }
    return data;
}

function buildMarkdown(entry) {
    const sidesYaml = Array.isArray(entry.side_dishes) && entry.side_dishes.length > 0
        ? '\n' + entry.side_dishes.map(s => `  - ${escapeYaml(s)}`).join('\n')
        : ' []';
    const sidesDisplay = Array.isArray(entry.side_dishes) && entry.side_dishes.length > 0
        ? entry.side_dishes.join(', ')
        : 'N/A';
    const stars = entry.rating ? '⭐'.repeat(parseInt(entry.rating)) : 'N/A';

    return `---
date: ${escapeYaml(entry.date)}
time: ${escapeYaml(entry.time)}
meal: ${escapeYaml(entry.meal)}
prepared_by: ${escapeYaml(entry.prepared_by || '')}
main_dish: ${escapeYaml(entry.main_dish || '')}
side_dishes:${sidesYaml}
rating: ${escapeYaml(String(entry.rating || ''))}
location: ${escapeYaml(entry.location || '')}
comments: ${escapeYaml(entry.comments || '')}
---

# Food Log Entry

**Date:** ${entry.date}  
**Time:** ${entry.time}  
**Meal:** ${entry.meal}  
**Prepared By:** ${entry.prepared_by || 'N/A'}  
**Main Dish:** ${entry.main_dish || 'N/A'}  
**Side Dishes:** ${sidesDisplay}  
**Rating:** ${stars} ${entry.rating ? `(${entry.rating}/5)` : ''}  
**Location:** ${entry.location || 'N/A'}  

## Comments
${entry.comments || '_No comments_'}
`;
}

function entryToFilename(entry) {
    const mealSlug = slugify(entry.meal || 'meal');
    return `${entry.date}_${entry.time.replace(':', '-')}_${mealSlug}.md`;
}

function showToast(message, type = 'info', duration = 2800) {
    let toast = document.querySelector('.fl-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'fl-toast';
        document.body.appendChild(toast);
    }
    toast.className = `fl-toast ${type}`;
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
    overlay.className = 'fl-confirm-overlay';
    overlay.innerHTML = `
        <div class="fl-confirm-box">
            <span class="confirm-icon">⚠️</span>
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="fl-confirm-actions">
                <button class="fl-btn fl-btn-secondary" id="fl-cancel-btn">Cancel</button>
                <button class="fl-btn fl-btn-danger" id="fl-confirm-btn">Delete</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('#fl-cancel-btn').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    overlay.querySelector('#fl-confirm-btn').addEventListener('click', () => {
        document.body.removeChild(overlay);
        onConfirm();
    });
}

// ============================================================
// PLUGIN CLASS
// ============================================================

class FoodLogPlugin extends obsidian.Plugin {
    async onload() {
        await this.ensureFolder();

        this.addRibbonIcon('utensils', 'Food Log', () => {
            new FoodLogModal(this.app, this).open();
        });

        this.addCommand({
            id: 'open-food-log',
            name: 'Open Food Log',
            callback: () => {
                new FoodLogModal(this.app, this).open();
            }
        });
    }

    async ensureFolder() {
        const adapter = this.app.vault.adapter;
        const exists = await adapter.exists(LOG_FOLDER);
        if (!exists) {
            await this.app.vault.createFolder(LOG_FOLDER);
        }
    }

    async loadDatabaseFolder(folderPath) {
        const folder = this.app.vault.getAbstractFileByPath(folderPath);
        if (!folder || !(folder instanceof obsidian.TFolder)) return [];
        const names = [];
        for (const file of folder.children) {
            if (file instanceof obsidian.TFile) {
                // Strip extension for display
                names.push(file.basename || file.name.replace(/\.[^.]+$/, ''));
            }
        }
        return names.sort((a, b) => a.localeCompare(b));
    }

    async saveEntry(entry, oldFilename) {
        await this.ensureFolder();
        const filename = entryToFilename(entry);
        const filepath = `${LOG_FOLDER}/${filename}`;
        const content = buildMarkdown(entry);

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
                if (data && data.date && data.meal) {
                    entries.push({
                        filename: file.name,
                        date: data.date || '',
                        time: data.time || '',
                        meal: data.meal || '',
                        prepared_by: data.prepared_by || '',
                        main_dish: data.main_dish || '',
                        side_dishes: Array.isArray(data.side_dishes) ? data.side_dishes : [],
                        rating: data.rating || '',
                        location: data.location || '',
                        comments: data.comments || ''
                    });
                }
            } catch(e) { /* skip unreadable files */ }
        }

        entries.sort((a, b) => {
            const da = `${a.date}T${a.time}`;
            const db = `${b.date}T${b.time}`;
            return db.localeCompare(da);
        });

        return entries;
    }

    async exportCSV(entries) {
        const headers = ['Date','Time','Meal','Prepared By','Main Dish','Side Dishes','Rating','Location','Comments'];
        const rows = entries.map(e => [
            e.date, e.time, e.meal, e.prepared_by, e.main_dish,
            Array.isArray(e.side_dishes) ? e.side_dishes.join('; ') : '',
            e.rating, e.location, e.comments
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
        let imported = 0;
        for (let i = 1; i < lines.length; i++) {
            const cols = this.parseCSVLine(lines[i]);
            if (cols.length < 3) continue;
            const entry = {
                date: (cols[0] || '').trim(),
                time: (cols[1] || '').trim(),
                meal: (cols[2] || '').trim(),
                prepared_by: (cols[3] || '').trim(),
                main_dish: (cols[4] || '').trim(),
                side_dishes: (cols[5] || '').trim().split(';').map(s => s.trim()).filter(Boolean),
                rating: (cols[6] || '').trim(),
                location: (cols[7] || '').trim(),
                comments: (cols[8] || '').trim()
            };
            if (!entry.date || !entry.meal) continue;
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

class FoodLogModal extends obsidian.Modal {
    constructor(app, plugin) {
        super(app);
        this.plugin = plugin;
        this.entries = [];
        this.filteredEntries = [];
        this.currentView = 'dashboard';
        this.currentEntry = null;
        this.searchQuery = '';
        this.filterMeal = 'all';
        this.currentPage = 0;
        this.loading = true;
        this.containerEl.addClass('fl-modal-root');
    }

    async onOpen() {
        const bg = document.querySelector('.modal-bg');
        if (bg) bg.style.cssText = '';

        const container = this.modalEl.closest('.modal-container');
        if (container) {
            container.style.cssText =
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
        this.wrapper = this.contentEl.createDiv({ cls: 'fl-modal' });

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
        else if (this.currentView === 'add')       this.renderAddForm();
        else if (this.currentView === 'edit')      this.renderAddForm(true);
        else if (this.currentView === 'entries')   this.renderEntries();
        else if (this.currentView === 'detail')    this.renderDetail();
        else if (this.currentView === 'charts')    this.renderCharts();
        else if (this.currentView === 'data')      this.renderDataMgmt();
    }

    // ---- HEADER ----
    renderHeader() {
        const header = this.wrapper.createDiv({ cls: 'fl-header' });
        const top = header.createDiv({ cls: 'fl-header-top' });
        const title = top.createEl('h2');
        title.innerHTML = `<span class="fl-header-icon">🍽️</span> Food Log`;
        top.createEl('p', { cls: 'fl-header-subtitle', text: 'Track your meals' });

        const closeBtn = top.createEl('button', { cls: 'fl-close-btn', text: '✕' });
        closeBtn.addEventListener('click', () => this.close());

        const stats = this.computeStats();
        const strip = this.wrapper.createDiv({ cls: 'fl-stats-strip' });

        const chips = [
            { value: stats.total,    label: 'Total' },
            { value: stats.today,    label: 'Today' },
            { value: stats.thisWeek, label: 'This Week' },
            { value: stats.avgRating ? stats.avgRating.toFixed(1) : '—', label: 'Avg Rating' },
        ];
        for (const c of chips) {
            const chip = strip.createDiv({ cls: 'fl-stat-chip' });
            chip.createEl('span', { cls: 'stat-value', text: String(c.value) });
            chip.createEl('span', { cls: 'stat-label', text: c.label });
        }
    }

    computeStats() {
        const entries = this.entries;
        const total = entries.length;
        const todayStr = nowDate();
        const todayEntries = entries.filter(e => e.date === todayStr);

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = `${weekAgo.getFullYear()}-${padZ(weekAgo.getMonth()+1)}-${padZ(weekAgo.getDate())}`;
        const thisWeek = entries.filter(e => e.date >= weekAgoStr).length;

        const rated = entries.filter(e => e.rating && !isNaN(parseInt(e.rating)));
        const avgRating = rated.length > 0
            ? rated.reduce((sum, e) => sum + parseInt(e.rating), 0) / rated.length
            : null;

        return { total, today: todayEntries.length, thisWeek, avgRating };
    }

    // ---- DASHBOARD ----
    renderDashboard() {
        const content = this.wrapper.createDiv({ cls: 'fl-content' });
        const grid = content.createDiv({ cls: 'fl-dashboard-grid' });

        const buttons = [
            { icon: '➕', label: 'Add Entry', desc: 'Log a new meal', view: 'add' },
            { icon: '📋', label: 'View Entries', desc: 'Browse & search logs', view: 'entries' },
            { icon: '📊', label: 'Charts', desc: 'Visual statistics', view: 'charts' },
            { icon: '⚙️', label: 'Data Manager', desc: 'Import / Export CSV', view: 'data', full: true },
        ];

        for (const btn of buttons) {
            const el = grid.createEl('button', {
                cls: 'fl-dashboard-btn' + (btn.full ? ' full-width' : '')
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
    async renderAddForm(isEdit = false) {
        const entry = isEdit && this.currentEntry ? this.currentEntry : null;

        // Load DB options
        const preparedByOptions = await this.plugin.loadDatabaseFolder(DB_FOLDER_PREPARED_BY);
        const foodItemOptions = await this.plugin.loadDatabaseFolder(DB_FOLDER_FOOD_ITEMS);

        const content = this.wrapper.createDiv({ cls: 'fl-content' });

        const backBtn = content.createEl('button', { cls: 'fl-back-btn' });
        backBtn.innerHTML = `← Back`;
        backBtn.addEventListener('click', () => {
            this.currentView = isEdit ? 'detail' : 'dashboard';
            this.render();
        });

        if (isEdit) {
            content.createDiv({ cls: 'fl-edit-banner', text: '✏️  Editing existing entry' });
        }

        const form = content.createDiv({ cls: `fl-form-view${isEdit ? ' fl-edit-mode' : ''}` });

        const secHdr = form.createDiv({ cls: 'fl-section-header' });
        secHdr.createEl('h3', { text: isEdit ? 'Edit Entry' : 'New Entry' });
        secHdr.createDiv({ cls: 'fl-section-divider' });

        // Date & Time
        const row1 = form.createDiv({ cls: 'fl-form-row' });

        const dateGroup = row1.createDiv({ cls: 'fl-form-group' });
        dateGroup.createEl('label', { cls: 'required', text: 'Date' });
        const dateInput = dateGroup.createEl('input', {
            cls: 'fl-input',
            type: 'date',
            value: entry ? entry.date : nowDate()
        });

        const timeGroup = row1.createDiv({ cls: 'fl-form-group' });
        timeGroup.createEl('label', { cls: 'required', text: 'Time' });
        const timeInput = timeGroup.createEl('input', {
            cls: 'fl-input',
            type: 'time',
            value: entry ? entry.time : nowTime()
        });

        // Meal type
        const mealGroup = form.createDiv({ cls: 'fl-form-group' });
        mealGroup.createEl('label', { cls: 'required', text: 'Meal' });
        const mealSelect = mealGroup.createEl('select', { cls: 'fl-select' });
        for (const opt of MEAL_TYPES) {
            const o = mealSelect.createEl('option', { value: opt, text: opt });
            if (entry && entry.meal === opt) o.selected = true;
        }

        // Prepared By
        const prepGroup = form.createDiv({ cls: 'fl-form-group' });
        prepGroup.createEl('label', { text: 'Prepared By' });
        const prepSelect = prepGroup.createEl('select', { cls: 'fl-select' });
        prepSelect.createEl('option', { value: '', text: '— Select —' });
        for (const opt of preparedByOptions) {
            const o = prepSelect.createEl('option', { value: opt, text: opt });
            if (entry && entry.prepared_by === opt) o.selected = true;
        }
        if (preparedByOptions.length === 0) {
            const hint = prepGroup.createEl('p', { cls: 'fl-db-hint', text: `ℹ️ Add notes to ${DB_FOLDER_PREPARED_BY} to populate this list.` });
        }

        // Main Dish
        const mainGroup = form.createDiv({ cls: 'fl-form-group' });
        mainGroup.createEl('label', { text: 'Main Dish' });
        const mainSelect = mainGroup.createEl('select', { cls: 'fl-select' });
        mainSelect.createEl('option', { value: '', text: '— Select —' });
        for (const opt of foodItemOptions) {
            const o = mainSelect.createEl('option', { value: opt, text: opt });
            if (entry && entry.main_dish === opt) o.selected = true;
        }
        if (foodItemOptions.length === 0) {
            mainGroup.createEl('p', { cls: 'fl-db-hint', text: `ℹ️ Add notes to ${DB_FOLDER_FOOD_ITEMS} to populate this list.` });
        }

        // Side Dishes (multiselect)
        const sidesGroup = form.createDiv({ cls: 'fl-form-group' });
        sidesGroup.createEl('label', { text: 'Side Dishes' });

        const currentSides = entry && Array.isArray(entry.side_dishes) ? entry.side_dishes : [];
        const sidesContainer = sidesGroup.createDiv({ cls: 'fl-multiselect' });

        if (foodItemOptions.length === 0) {
            sidesContainer.createEl('p', { cls: 'fl-db-hint', text: `ℹ️ Add notes to ${DB_FOLDER_FOOD_ITEMS} to populate this list.` });
        } else {
            const selectedSides = new Set(currentSides);
            const sideCheckboxes = [];

            for (const opt of foodItemOptions) {
                const item = sidesContainer.createDiv({ cls: 'fl-multiselect-item' });
                const cb = item.createEl('input', { type: 'checkbox', cls: 'fl-checkbox' });
                cb.id = `fl-side-${slugify(opt)}`;
                cb.value = opt;
                cb.checked = selectedSides.has(opt);
                const lbl = item.createEl('label', { text: opt });
                lbl.htmlFor = cb.id;
                sideCheckboxes.push(cb);
            }

            // expose getter on container
            sidesContainer._getSelected = () => sideCheckboxes.filter(c => c.checked).map(c => c.value);
        }
        if (!sidesContainer._getSelected) sidesContainer._getSelected = () => [];

        // Rating (5-star)
        const ratingGroup = form.createDiv({ cls: 'fl-form-group' });
        ratingGroup.createEl('label', { text: 'Rating' });
        const starWrap = ratingGroup.createDiv({ cls: 'fl-star-wrap' });
        let selectedRating = entry ? parseInt(entry.rating) || 0 : 0;
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            const star = starWrap.createEl('button', { cls: 'fl-star', type: 'button', text: '★' });
            star.dataset.val = String(i);
            if (i <= selectedRating) star.classList.add('active');
            stars.push(star);
        }
        const updateStars = (val) => {
            selectedRating = val;
            stars.forEach((s, idx) => {
                s.classList.toggle('active', idx < val);
            });
        };
        stars.forEach((star, idx) => {
            star.addEventListener('click', () => {
                const val = idx + 1;
                // clicking same star deselects
                updateStars(selectedRating === val ? 0 : val);
            });
        });

        // Location
        const locGroup = form.createDiv({ cls: 'fl-form-group' });
        locGroup.createEl('label', { text: 'Location' });
        const locRow = locGroup.createDiv({ cls: 'fl-location-row' });
        const locInput = locRow.createEl('input', {
            cls: 'fl-input',
            type: 'text',
            placeholder: 'Enter location or use GPS...',
            value: entry ? entry.location : ''
        });

        const gpsBtn = locRow.createEl('button', { cls: 'fl-location-btn', text: '📍' });
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
        const comGroup = form.createDiv({ cls: 'fl-form-group' });
        comGroup.createEl('label', { text: 'Comments' });
        const comTextarea = comGroup.createEl('textarea', {
            cls: 'fl-textarea',
            placeholder: 'Any additional notes...'
        });
        if (entry && entry.comments) comTextarea.value = entry.comments;

        // Actions
        const actions = form.createDiv({ cls: 'fl-form-actions' });

        const cancelBtn = actions.createEl('button', { cls: 'fl-btn fl-btn-secondary', text: 'Cancel' });
        cancelBtn.addEventListener('click', () => {
            this.currentView = isEdit ? 'detail' : 'dashboard';
            this.render();
        });

        const saveBtn = actions.createEl('button', {
            cls: 'fl-btn fl-btn-primary',
            text: isEdit ? '💾  Save Changes' : '💾  Save Entry'
        });

        saveBtn.addEventListener('click', async () => {
            const date = dateInput.value.trim();
            const time = timeInput.value.trim();
            const meal = mealSelect.value;

            if (!date || !time || !meal) {
                showToast('Please fill in required fields', 'error');
                return;
            }

            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving…';

            const newEntry = {
                date,
                time,
                meal,
                prepared_by: prepSelect.value,
                main_dish: mainSelect.value,
                side_dishes: sidesContainer._getSelected(),
                rating: selectedRating > 0 ? String(selectedRating) : '',
                location: locInput.value.trim(),
                comments: comTextarea.value.trim()
            };

            try {
                const oldFilename = isEdit && entry ? entry.filename : null;
                const savedFilename = await this.plugin.saveEntry(newEntry, oldFilename);
                newEntry.filename = savedFilename;

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
        const content = this.wrapper.createDiv({ cls: 'fl-content' });

        const backBtn = content.createEl('button', { cls: 'fl-back-btn' });
        backBtn.innerHTML = `← Dashboard`;
        backBtn.addEventListener('click', () => { this.currentView = 'dashboard'; this.render(); });

        const secHdr = content.createDiv({ cls: 'fl-section-header' });
        secHdr.createEl('h3', { text: 'All Entries' });
        secHdr.createDiv({ cls: 'fl-section-divider' });

        const sfRow = content.createDiv({ cls: 'fl-search-filter-row' });

        const searchInput = sfRow.createEl('input', {
            cls: 'fl-search-input',
            type: 'search',
            placeholder: '🔍 Search…'
        });
        searchInput.value = this.searchQuery;

        const filterSelect = sfRow.createEl('select', { cls: 'fl-filter-select' });
        const filterOptions = [
            { value: 'all', text: 'All Meals' },
            ...MEAL_TYPES.map(m => ({ value: m, text: m }))
        ];
        for (const opt of filterOptions) {
            const o = filterSelect.createEl('option', { value: opt.value, text: opt.text });
            if (this.filterMeal === opt.value) o.selected = true;
        }

        const tableWrap = content.createDiv({ cls: 'fl-entries-view' });
        const countEl = content.createEl('p', { cls: 'fl-entries-count' });
        const paginationWrap = content.createDiv({ cls: 'fl-pagination' });

        searchInput.addEventListener('input', () => {
            this.searchQuery = searchInput.value;
            this.currentPage = 0;
            this.applyFilters();
            this.renderEntriesTable(tableWrap, countEl, paginationWrap);
        });

        filterSelect.addEventListener('change', () => {
            this.filterMeal = filterSelect.value;
            this.currentPage = 0;
            this.applyFilters();
            this.renderEntriesTable(tableWrap, countEl, paginationWrap);
        });

        this.applyFilters();
        this.renderEntriesTable(tableWrap, countEl, paginationWrap);
    }

    applyFilters() {
        let result = [...this.entries];
        if (this.filterMeal !== 'all') {
            result = result.filter(e => e.meal === this.filterMeal);
        }
        if (this.searchQuery.trim()) {
            const q = this.searchQuery.toLowerCase();
            result = result.filter(e =>
                e.date.includes(q) ||
                e.time.includes(q) ||
                e.meal.toLowerCase().includes(q) ||
                e.prepared_by.toLowerCase().includes(q) ||
                e.main_dish.toLowerCase().includes(q) ||
                (Array.isArray(e.side_dishes) ? e.side_dishes.join(' ').toLowerCase() : '').includes(q) ||
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
            const empty = container.createDiv({ cls: 'fl-empty-state' });
            empty.createEl('span', { cls: 'empty-icon', text: '🍽️' });
            empty.createEl('p', { text: 'No entries found' });
            return;
        }

        const tableWrap = container.createDiv({ cls: 'fl-table-wrap' });
        const table = tableWrap.createEl('table', { cls: 'fl-table' });
        const thead = table.createEl('thead');
        const hrow = thead.createEl('tr');
        for (const h of ['Date / Time', 'Meal', 'Main Dish', 'Rating', 'Location']) {
            hrow.createEl('th', { text: h });
        }

        const tbody = table.createEl('tbody');
        for (const entry of pageEntries) {
            const tr = tbody.createEl('tr');
            tr.createEl('td', { text: formatDateTime(entry.date, entry.time) });

            const mealTd = tr.createEl('td');
            mealTd.createEl('span', {
                cls: `fl-badge ${badgeClass(entry.meal)}`,
                text: entry.meal
            });

            tr.createEl('td', { text: entry.main_dish || '—' });

            const ratingTd = tr.createEl('td');
            if (entry.rating) {
                const r = parseInt(entry.rating);
                ratingTd.createEl('span', { cls: 'fl-star-display', text: '⭐'.repeat(r) });
            } else {
                ratingTd.createEl('span', { cls: 'fl-badge fl-badge-none', text: '—' });
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

        if (totalPages > 1) {
            const prevBtn = paginationWrap.createEl('button', {
                cls: 'fl-page-btn',
                text: '← Prev'
            });
            if (this.currentPage === 0) prevBtn.disabled = true;
            prevBtn.addEventListener('click', () => {
                this.currentPage--;
                this.renderEntriesTable(container, countEl, paginationWrap);
            });

            paginationWrap.createEl('span', {
                cls: 'fl-page-info',
                text: `${this.currentPage + 1} / ${totalPages}`
            });

            const nextBtn = paginationWrap.createEl('button', {
                cls: 'fl-page-btn',
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

        const content = this.wrapper.createDiv({ cls: 'fl-content' });

        const backBtn = content.createEl('button', { cls: 'fl-back-btn' });
        backBtn.innerHTML = `← Entries`;
        backBtn.addEventListener('click', () => { this.currentView = 'entries'; this.render(); });

        const secHdr = content.createDiv({ cls: 'fl-section-header' });
        secHdr.createEl('h3', { text: 'Entry Detail' });
        secHdr.createDiv({ cls: 'fl-section-divider' });

        const card = content.createDiv({ cls: 'fl-detail-card fl-detail-view' });

        const sidesDisplay = Array.isArray(entry.side_dishes) && entry.side_dishes.length > 0
            ? entry.side_dishes.join(', ')
            : '—';
        const starsDisplay = entry.rating
            ? '⭐'.repeat(parseInt(entry.rating)) + ` (${entry.rating}/5)`
            : '—';

        const fields = [
            { label: 'Date',        value: entry.date },
            { label: 'Time',        value: entry.time },
            { label: 'Meal',        value: entry.meal, badge: true },
            { label: 'Prepared By', value: entry.prepared_by || '—' },
            { label: 'Main Dish',   value: entry.main_dish || '—' },
            { label: 'Side Dishes', value: sidesDisplay },
            { label: 'Rating',      value: starsDisplay },
            { label: 'Location',    value: entry.location || '—' },
            { label: 'Comments',    value: entry.comments || '—' },
            { label: 'File',        value: entry.filename },
        ];

        for (const f of fields) {
            const row = card.createDiv({ cls: 'fl-detail-row' });
            row.createEl('span', { cls: 'fl-detail-label', text: f.label });
            const valEl = row.createEl('span', { cls: 'fl-detail-value' });
            if (f.badge && f.value !== '—') {
                valEl.createEl('span', {
                    cls: `fl-badge ${badgeClass(f.value)}`,
                    text: f.value
                });
            } else {
                valEl.textContent = f.value;
            }
        }

        const actions = content.createDiv({ cls: 'fl-form-actions' });

        const deleteBtn = actions.createEl('button', { cls: 'fl-btn fl-btn-danger', text: '🗑️  Delete' });
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

        const editBtn = actions.createEl('button', { cls: 'fl-btn fl-btn-primary', text: '✏️  Edit' });
        editBtn.addEventListener('click', () => {
            this.currentView = 'edit';
            this.render();
        });
    }

    // ---- CHARTS VIEW ----
    renderCharts() {
        const content = this.wrapper.createDiv({ cls: 'fl-content fl-charts-view' });

        const backBtn = content.createEl('button', { cls: 'fl-back-btn' });
        backBtn.innerHTML = `← Dashboard`;
        backBtn.addEventListener('click', () => { this.currentView = 'dashboard'; this.render(); });

        const secHdr = content.createDiv({ cls: 'fl-section-header' });
        secHdr.createEl('h3', { text: 'Statistics & Charts' });
        secHdr.createDiv({ cls: 'fl-section-divider' });

        if (this.entries.length === 0) {
            const empty = content.createDiv({ cls: 'fl-empty-state' });
            empty.createEl('span', { cls: 'empty-icon', text: '📊' });
            empty.createEl('p', { text: 'No data yet. Add some entries to see charts!' });
            return;
        }

        this.renderMealDonut(content);
        this.renderRatingBar(content);
        this.renderTopDishesBar(content);
        this.renderDailyBar(content);
        this.renderActivityHeatmap(content);
    }

    renderMealDonut(container) {
        const card = container.createDiv({ cls: 'fl-chart-card' });
        card.createEl('h4', { text: '🍽️ Meal Type Breakdown' });

        const colors = {
            'Breakfast': '#f59e0b',
            'Lunch':     '#22c55e',
            'Dinner':    '#3b82f6',
            'Snack':     '#a855f7'
        };

        const counts = {};
        for (const e of this.entries) {
            if (e.meal) counts[e.meal] = (counts[e.meal] || 0) + 1;
        }
        const total = this.entries.length || 1;

        const data = MEAL_TYPES
            .map(m => ({ label: m, count: counts[m] || 0, color: colors[m] || '#6b7280' }))
            .filter(d => d.count > 0);

        const wrap = card.createDiv({ cls: 'fl-donut-wrap' });
        const size = 100, r = 36, cx = 50, cy = 50;
        const circumference = 2 * Math.PI * r;

        const svg = wrap.createSvg('svg', { cls: 'fl-donut-svg' });
        svg.setAttribute('width', '100');
        svg.setAttribute('height', '100');
        svg.setAttribute('viewBox', '0 0 100 100');

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

        const centerText = svg.createSvg('text');
        centerText.setAttribute('x', cx); centerText.setAttribute('y', cy + 4);
        centerText.setAttribute('text-anchor', 'middle');
        centerText.setAttribute('font-size', '14');
        centerText.setAttribute('font-weight', '700');
        centerText.setAttribute('fill', 'var(--text-normal)');
        centerText.textContent = total;

        const legend = wrap.createDiv({ cls: 'fl-donut-legend' });
        for (const seg of data) {
            const item = legend.createDiv({ cls: 'fl-legend-item' });
            const dot = item.createDiv({ cls: 'fl-legend-dot' });
            dot.style.background = seg.color;
            item.createEl('span', { cls: 'fl-legend-item-label', text: seg.label });
            item.createEl('span', { cls: 'fl-legend-item-val', text: String(seg.count) });
        }
    }

    renderRatingBar(container) {
        const card = container.createDiv({ cls: 'fl-chart-card' });
        card.createEl('h4', { text: '⭐ Rating Distribution' });
        const chart = card.createDiv({ cls: 'fl-bar-chart' });

        const colors = {
            '1': '#ef4444',
            '2': '#f97316',
            '3': '#eab308',
            '4': '#22c55e',
            '5': '#16a34a'
        };

        const counts = {};
        for (const e of this.entries) {
            if (e.rating) counts[e.rating] = (counts[e.rating] || 0) + 1;
        }
        const maxVal = Math.max(...Object.values(counts), 1);

        for (const star of ['5','4','3','2','1']) {
            const count = counts[star] || 0;
            const pct = (count / maxVal * 100).toFixed(0);
            const row = chart.createDiv({ cls: 'fl-bar-row' });
            row.createEl('span', { cls: 'fl-bar-label', text: `${'⭐'.repeat(parseInt(star))}` });
            const track = row.createDiv({ cls: 'fl-bar-track' });
            const fill = track.createDiv({ cls: 'fl-bar-fill' });
            fill.style.width = `${pct}%`;
            fill.style.background = colors[star] || '#6b7280';
            if (count > 0) fill.createEl('span', { text: String(count) });
            row.createEl('span', { cls: 'fl-bar-value', text: String(count) });
        }
    }

    renderTopDishesBar(container) {
        const card = container.createDiv({ cls: 'fl-chart-card' });
        card.createEl('h4', { text: '🥘 Top Main Dishes' });
        const chart = card.createDiv({ cls: 'fl-bar-chart' });

        const counts = {};
        for (const e of this.entries) {
            if (e.main_dish) counts[e.main_dish] = (counts[e.main_dish] || 0) + 1;
        }

        const sorted = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 7);

        if (sorted.length === 0) {
            chart.createEl('p', { cls: 'fl-db-hint', text: 'No main dish data yet.' });
            return;
        }

        const maxVal = sorted[0][1];
        for (const [dish, count] of sorted) {
            const pct = (count / maxVal * 100).toFixed(0);
            const row = chart.createDiv({ cls: 'fl-bar-row' });
            const labelEl = row.createEl('span', { cls: 'fl-bar-label' });
            labelEl.textContent = dish.length > 10 ? dish.slice(0,9) + '…' : dish;
            const track = row.createDiv({ cls: 'fl-bar-track' });
            const fill = track.createDiv({ cls: 'fl-bar-fill' });
            fill.style.width = `${pct}%`;
            fill.style.background = '#22c55e';
            if (count > 0) fill.createEl('span', { text: String(count) });
            row.createEl('span', { cls: 'fl-bar-value', text: String(count) });
        }
    }

    renderDailyBar(container) {
        const card = container.createDiv({ cls: 'fl-chart-card' });
        card.createEl('h4', { text: '📅 Entries – Last 7 Days' });
        const chart = card.createDiv({ cls: 'fl-bar-chart' });

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
            const row = chart.createDiv({ cls: 'fl-bar-row' });
            row.createEl('span', { cls: 'fl-bar-label', text: day.label });
            const track = row.createDiv({ cls: 'fl-bar-track' });
            const fill = track.createDiv({ cls: 'fl-bar-fill' });
            fill.style.width = `${pct}%`;
            fill.style.background = '#f59e0b';
            if (count > 0) fill.createEl('span', { text: String(count) });
            row.createEl('span', { cls: 'fl-bar-value', text: String(count) });
        }
    }

    renderActivityHeatmap(container) {
        const card = container.createDiv({ cls: 'fl-chart-card' });
        card.createEl('h4', { text: '🗓️ Activity Heatmap – Last 8 Weeks' });

        const heatmap = card.createDiv({ cls: 'fl-heatmap' });
        const today = new Date();
        const cols = 8 * 7;
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - cols + 1);

        const weeks = [];
        let current = new Date(startDate);

        while (current <= today) {
            const weekCells = [];
            for (let d = 0; d < 7; d++) {
                if (current > today) break;
                const str = `${current.getFullYear()}-${padZ(current.getMonth()+1)}-${padZ(current.getDate())}`;
                const count = this.entries.filter(e => e.date === str).length;
                weekCells.push({ date: str, count });
                const next = new Date(current);
                next.setDate(current.getDate() + 1);
                current = next;
            }
            weeks.push(weekCells);
        }

        for (const week of weeks) {
            const col = heatmap.createDiv({ cls: 'fl-heatmap-col' });
            const labelStr = week[0] ? week[0].date.slice(5) : '';
            col.createEl('span', { cls: 'fl-heatmap-label', text: labelStr });
            for (const cell of week) {
                const cellEl = col.createDiv({ cls: 'fl-heatmap-cell' });
                const displayCount = Math.min(cell.count, 5);
                if (displayCount > 0) cellEl.setAttribute('data-count', String(displayCount));
                cellEl.setAttribute('title', `${cell.date}: ${cell.count} entries`);
            }
        }
    }

    // ---- DATA MANAGEMENT ----
    renderDataMgmt() {
        const content = this.wrapper.createDiv({ cls: 'fl-content fl-data-mgmt-view' });

        const backBtn = content.createEl('button', { cls: 'fl-back-btn' });
        backBtn.innerHTML = `← Dashboard`;
        backBtn.addEventListener('click', () => { this.currentView = 'dashboard'; this.render(); });

        const secHdr = content.createDiv({ cls: 'fl-section-header' });
        secHdr.createEl('h3', { text: 'Data Management' });
        secHdr.createDiv({ cls: 'fl-section-divider' });

        // Export
        const exportSec = content.createDiv({ cls: 'fl-mgmt-section' });
        exportSec.createEl('h4').innerHTML = `📤 Export Data`;
        exportSec.createEl('p', { text: `Export all ${this.entries.length} entries to a CSV file saved in your vault at ${LOG_FOLDER}/export_YYYY-MM-DD.csv` });

        const exportBtn = exportSec.createEl('button', {
            cls: 'fl-btn fl-btn-success',
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

        // Import
        const importSec = content.createDiv({ cls: 'fl-mgmt-section' });
        importSec.createEl('h4').innerHTML = `📥 Import Data`;
        importSec.createEl('p', { text: 'Import entries from a CSV file. Expected columns: Date, Time, Meal, Prepared By, Main Dish, Side Dishes (semicolon-separated), Rating, Location, Comments.' });

        const fileWrap = importSec.createDiv({ cls: 'fl-file-input-wrap' });
        const fileInput = fileWrap.createEl('input', { type: 'file' });
        fileInput.setAttribute('accept', '.csv,text/csv');
        const fileLabel = fileWrap.createEl('label', { cls: 'fl-file-label' });
        fileLabel.innerHTML = `📁 Tap to choose a CSV file`;

        fileInput.addEventListener('change', async () => {
            const file = fileInput.files[0];
            if (!file) return;
            fileLabel.innerHTML = `⏳ Importing ${file.name}…`;

            const reader = new FileReader();
            reader.onload = async (evt) => {
                try {
                    const csvContent = evt.target.result;
                    const count = await this.plugin.importCSV(csvContent);
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
        const statsSec = content.createDiv({ cls: 'fl-mgmt-section' });
        statsSec.createEl('h4').innerHTML = `📊 Storage Info`;
        const stats = this.computeStats();
        const infoRows = [
            { label: 'Total entries',  value: stats.total },
            { label: 'Today',          value: stats.today },
            { label: 'This week',      value: stats.thisWeek },
            { label: 'Avg rating',     value: stats.avgRating ? stats.avgRating.toFixed(2) + ' / 5' : '—' },
            { label: 'Storage folder', value: LOG_FOLDER },
        ];
        for (const row of infoRows) {
            const r = statsSec.createDiv({ cls: 'fl-detail-row' });
            r.createEl('span', { cls: 'fl-detail-label', text: row.label });
            r.createEl('span', { cls: 'fl-detail-value', text: String(row.value) });
        }
    }
}

module.exports = FoodLogPlugin;
