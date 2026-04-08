/*
 * Entertainment Master - Obsidian Plugin
 * Tracks TV Series, Movies, and Books with Watchlogs/Reading Logs
 */

'use strict';

const { Plugin, Notice, TFile, TFolder } = require('obsidian');

// ============================================================
//  UTILITY HELPERS
// ============================================================

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

function starsHtml(rating) {
  let s = '';
  for (let i = 1; i <= 5; i++) {
    s += `<span class="em-star ${i <= rating ? 'active' : ''}">★</span>`;
  }
  return s;
}

function timeDiff(start, end) {
  if (!start || !end) return '';
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============================================================
//  DOM BUILDER HELPERS
// ============================================================

function el(tag, props = {}, children = []) {
  const e = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === 'className') e.className = v;
    else if (k === 'innerHTML') e.innerHTML = v;
    else if (k === 'textContent') e.textContent = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
    else e.setAttribute(k, v);
  });
  children.forEach(c => c && e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
  return e;
}

function createModal(title, iconEmoji, opts = {}) {
  const overlay = el('div', { className: 'em-modal-overlay' });
  const modal = el('div', { className: `em-modal${opts.large ? ' em-modal-lg' : ''}` });

  const header = el('div', { className: 'em-modal-header' });
  const h2 = el('h2', {});
  h2.innerHTML = `<span class="em-header-icon">${iconEmoji}</span> ${title}`;
  const closeBtn = el('button', { className: 'em-close-btn', innerHTML: '✕' });
  header.appendChild(h2);
  header.appendChild(closeBtn);

  const body = el('div', { className: 'em-modal-body' });
  const footer = el('div', { className: 'em-modal-footer' });

  modal.appendChild(header);
  modal.appendChild(body);
  if (!opts.noFooter) modal.appendChild(footer);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  return { overlay, modal, header, body, footer, close };
}

function formGroup(labelText, inputEl) {
  const g = el('div', { className: 'em-form-group' });
  const lbl = el('label', { textContent: labelText });
  g.appendChild(lbl);
  g.appendChild(inputEl);
  return g;
}

function textInput(placeholder = '', value = '') {
  const i = el('input', { type: 'text' });
  i.placeholder = placeholder;
  i.value = value;
  return i;
}

function numberInput(placeholder = '', value = '') {
  const i = el('input', { type: 'number' });
  i.placeholder = placeholder;
  if (value !== '') i.value = value;
  return i;
}

function dateInput(value = '') {
  const i = el('input', { type: 'date' });
  i.value = value;
  return i;
}

function timeInput(value = '') {
  const i = el('input', { type: 'time' });
  i.value = value;
  return i;
}

function textArea(placeholder = '', value = '') {
  const t = el('textarea');
  t.placeholder = placeholder;
  t.value = value;
  return t;
}

function selectInput(options, value = '') {
  const s = el('select');
  options.forEach(([val, label]) => {
    const o = el('option', { value: val, textContent: label });
    if (val === value) o.selected = true;
    s.appendChild(o);
  });
  return s;
}

function starRatingInput(current = 0) {
  const wrap = el('div', { className: 'em-star-rating' });
  let rating = current;
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const s = el('span', { className: `em-star${i <= current ? ' active' : ''}`, textContent: '★' });
    s.dataset.val = i;
    s.addEventListener('click', () => {
      rating = i;
      stars.forEach((st, idx) => {
        st.classList.toggle('active', idx < i);
      });
    });
    stars.push(s);
    wrap.appendChild(s);
  }
  wrap.getRating = () => rating;
  return wrap;
}

function imageUploadGroup(labelText, currentSrc = '') {
  const g = el('div', { className: 'em-form-group' });
  const lbl = el('label', { textContent: labelText });
  const area = el('div', { className: 'em-image-upload-area' });
  const fileInput = el('input', { type: 'file', accept: 'image/*' });
  fileInput.style.cssText = 'position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%';

  let previewSrc = currentSrc;

  const renderPreview = () => {
    area.innerHTML = '';
    area.appendChild(fileInput);
    if (previewSrc) {
      const img = el('img', { className: 'em-image-preview', src: previewSrc });
      area.appendChild(img);
    } else {
      const ph = el('div', { className: 'em-image-placeholder' });
      ph.innerHTML = '<span class="em-img-icon">🖼️</span>Tap to choose image';
      area.appendChild(ph);
    }
  };

  fileInput.addEventListener('change', async () => {
    if (fileInput.files[0]) {
      previewSrc = await imageToBase64(fileInput.files[0]);
      renderPreview();
    }
  });

  renderPreview();
  g.appendChild(lbl);
  g.appendChild(area);
  g.getImage = () => previewSrc;
  return g;
}

function dashboardGrid(items) {
  const grid = el('div', { className: 'em-dashboard-grid' });
  items.forEach(({ icon, label, className, onClick }) => {
    const btn = el('button', { className: `em-dash-btn ${className || ''}` });
    btn.innerHTML = `<span class="em-btn-icon">${icon}</span><span class="em-btn-label">${label}</span>`;
    btn.addEventListener('click', onClick);
    grid.appendChild(btn);
  });
  return grid;
}

function emptyState(icon, text) {
  const d = el('div', { className: 'em-empty' });
  d.innerHTML = `<span class="em-empty-icon">${icon}</span><div class="em-empty-text">${text}</div>`;
  return d;
}

// ============================================================
//  DATA MANAGER  (markdown-backed storage)
//
//  File layout:
//    Entertainment/TV/<id>.md          — one file per TV series
//    Entertainment/Movies/<id>.md      — one file per movie
//    Entertainment/Books/<id>.md       — one file per book
//    Entertainment/TV/watchlog.md      — all TV watchlog entries
//    Entertainment/Movies/watchlog.md  — all movie watchlog entries
//    Entertainment/Books/readlog.md    — all reading log entries
//
//  Each .md file stores its data payload in a fenced JSON code
//  block between the markers below, followed by a human-readable
//  section so the notes are useful when opened normally in Obsidian.
//
//  EM_DATA_START / EM_DATA_END markers are used for reliable
//  machine parsing without touching the readable portion.
// ============================================================

const EM_DATA_START = '<!-- EM_DATA_START';
const EM_DATA_END   = 'EM_DATA_END -->';

class DataManager {
  constructor(app) {
    this.app = app;
    this.tvDir    = 'Entertainment/TV';
    this.movieDir = 'Entertainment/Movies';
    this.bookDir  = 'Entertainment/Books';
    this.watchlogTVFile    = 'Entertainment/TV/watchlog.md';
    this.watchlogMovieFile = 'Entertainment/Movies/watchlog.md';
    this.readlogFile       = 'Entertainment/Books/readlog.md';
  }

  // ---- Low-level file helpers ----

  async ensureDir(path) {
    const parts = path.split('/');
    let current = '';
    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      if (!this.app.vault.getAbstractFileByPath(current)) {
        await this.app.vault.createFolder(current).catch(() => {});
      }
    }
  }

  /** Write an arbitrary JS object into a .md file as a hidden data block
   *  plus a human-readable section generated by `renderFn(data)`. */
  async writeMD(path, data, renderFn) {
    await this.ensureDir(path.substring(0, path.lastIndexOf('/')));
    const dataBlock = `${EM_DATA_START}\n${JSON.stringify(data, null, 2)}\n${EM_DATA_END}`;
    const readable  = renderFn ? renderFn(data) : '';
    const content   = `${dataBlock}\n\n${readable}`;
    const f = this.app.vault.getAbstractFileByPath(path);
    if (f) await this.app.vault.modify(f, content);
    else   await this.app.vault.create(path, content);
  }

  /** Read and parse the data block from a .md file. Returns `def` on any error. */
  async readMD(path, def = null) {
    const f = this.app.vault.getAbstractFileByPath(path);
    if (!f) return def;
    try {
      const txt   = await this.app.vault.read(f);
      const start = txt.indexOf(EM_DATA_START);
      const end   = txt.indexOf(EM_DATA_END);
      if (start === -1 || end === -1) return def;
      const json = txt.slice(start + EM_DATA_START.length, end).trim();
      return JSON.parse(json);
    } catch { return def; }
  }

  // ---- Human-readable render helpers ----

  _renderSeries(s) {
    const seasons = (s.seasons || []).map(sn =>
      `  - Season ${sn.number}` +
      (sn.premiereDate ? ` (${sn.premiereDate})` : '') +
      ` — ${(sn.episodes || []).length} episodes`
    ).join('\n') || '  _(none yet)_';
    return [
      `# 📺 ${s.name || 'Untitled Series'}`,
      '',
      `**Status:** ${s.status || '—'}  `,
      `**Genre:** ${s.genre || '—'}  `,
      `**Created by:** ${s.createdBy || '—'}  `,
      `**Network:** ${s.network || '—'}  `,
      `**Where to Watch:** ${s.whereToWatch || '—'}  `,
      `**Content Rating:** ${s.contentRating || '—'}  `,
      `**Premiere:** ${s.premiereDate || '—'}  `,
      `**Finale:** ${s.finaleDate || '—'}  `,
      `**Seasons / Episodes:** ${s.totalSeasons || '—'} / ${s.totalEpisodes || '—'}`,
      '',
      `## Synopsis`,
      s.synopsis || '—',
      '',
      `## Seasons`,
      seasons,
    ].join('\n');
  }

  _renderMovie(m) {
    return [
      `# 🎬 ${m.title || 'Untitled Movie'}`,
      '',
      `**Director:** ${m.director || '—'}  `,
      `**Genre:** ${m.genre || '—'}  `,
      `**Release Year:** ${m.releaseYear || '—'}  `,
      `**Runtime:** ${m.runtime || '—'} min  `,
      `**Rating:** ${'★'.repeat(m.rating || 0)}${'☆'.repeat(5 - (m.rating || 0))}  `,
      `**Status:** ${m.status || '—'}  `,
      `**Where to Watch:** ${m.whereToWatch || '—'}`,
      '',
      `## Synopsis`,
      m.synopsis || '—',
      '',
      `## Notes`,
      m.notes || '—',
    ].join('\n');
  }

  _renderBook(b) {
    return [
      `# 📚 ${b.title || 'Untitled Book'}`,
      '',
      `**Author:** ${b.author || '—'}  `,
      `**Genre:** ${b.genre || '—'}  `,
      `**Pages:** ${b.pages || '—'}  `,
      `**Published:** ${b.publishedYear || '—'}  `,
      `**Rating:** ${'★'.repeat(b.rating || 0)}${'☆'.repeat(5 - (b.rating || 0))}  `,
      `**Status:** ${b.status || '—'}`,
      '',
      `## Synopsis`,
      b.synopsis || '—',
      '',
      `## Notes`,
      b.notes || '—',
    ].join('\n');
  }

  _renderTVWatchlog(logs) {
    if (!logs.length) return '# 📓 TV Watch Log\n\n_(no entries yet)_';
    const rows = logs.slice().reverse().map(e =>
      `| ${e.seriesName || '—'} | S${e.season || '?'}E${e.episode || '?'} | ${e.date || '—'} | ${'★'.repeat(e.rating || 0)} | ${e.comments || ''} |`
    ).join('\n');
    return [
      '# 📓 TV Watch Log',
      '',
      '| Series | Episode | Date | Rating | Comments |',
      '|--------|---------|------|--------|----------|',
      rows,
    ].join('\n');
  }

  _renderMovieWatchlog(logs) {
    if (!logs.length) return '# 🎬 Movie Watch Log\n\n_(no entries yet)_';
    const rows = logs.slice().reverse().map(e =>
      `| ${e.movieTitle || '—'} | ${e.date || '—'} | ${e.startTime || '—'} – ${e.endTime || '—'} | ${'★'.repeat(e.rating || 0)} | ${e.comments || ''} |`
    ).join('\n');
    return [
      '# 🎬 Movie Watch Log',
      '',
      '| Movie | Date | Time | Rating | Comments |',
      '|-------|------|------|--------|----------|',
      rows,
    ].join('\n');
  }

  _renderReadlog(logs) {
    if (!logs.length) return '# 📒 Reading Log\n\n_(no entries yet)_';
    const rows = logs.slice().reverse().map(e =>
      `| ${e.bookTitle || '—'} | ${e.startPage || '?'} → ${e.endPage || '?'} | ${e.pagesRead || '—'} | ${e.duration || '—'} | ${'★'.repeat(e.rating || 0)} | ${e.comments || ''} |`
    ).join('\n');
    return [
      '# 📒 Reading Log',
      '',
      '| Book | Pages | Read | Duration | Rating | Comments |',
      '|------|-------|------|----------|--------|----------|',
      rows,
    ].join('\n');
  }

  // ---- TV Series ----

  seriesPath(id) { return `${this.tvDir}/${id}.md`; }

  async getAllSeries() {
    const folder = this.app.vault.getAbstractFileByPath(this.tvDir);
    if (!folder || !folder.children) return [];
    const files = folder.children.filter(f =>
      f.extension === 'md' && f.name !== 'watchlog.md'
    );
    const all = [];
    for (const f of files) {
      const data = await this.readMD(f.path, null);
      if (data && data.id) all.push(data);
    }
    return all;
  }

  async getSeries(id) {
    return this.readMD(this.seriesPath(id), null);
  }

  async saveSeries(series) {
    if (!series.id) series.id = generateId();
    await this.writeMD(this.seriesPath(series.id), series, d => this._renderSeries(d));
    return series;
  }

  async deleteSeries(id) {
    const f = this.app.vault.getAbstractFileByPath(this.seriesPath(id));
    if (f) await this.app.vault.delete(f);
  }

  // ---- Movies ----

  moviePath(id) { return `${this.movieDir}/${id}.md`; }

  async getAllMovies() {
    const folder = this.app.vault.getAbstractFileByPath(this.movieDir);
    if (!folder || !folder.children) return [];
    const files = folder.children.filter(f =>
      f.extension === 'md' && f.name !== 'watchlog.md'
    );
    const all = [];
    for (const f of files) {
      const data = await this.readMD(f.path, null);
      if (data && data.id) all.push(data);
    }
    return all;
  }

  async addMovie(movie) {
    if (!movie.id) movie.id = generateId();
    await this.writeMD(this.moviePath(movie.id), movie, d => this._renderMovie(d));
    return movie;
  }

  async updateMovie(updated) {
    await this.writeMD(this.moviePath(updated.id), updated, d => this._renderMovie(d));
  }

  async deleteMovie(id) {
    const f = this.app.vault.getAbstractFileByPath(this.moviePath(id));
    if (f) await this.app.vault.delete(f);
  }

  // ---- Books ----

  bookPath(id) { return `${this.bookDir}/${id}.md`; }

  async getAllBooks() {
    const folder = this.app.vault.getAbstractFileByPath(this.bookDir);
    if (!folder || !folder.children) return [];
    const files = folder.children.filter(f =>
      f.extension === 'md' && f.name !== 'readlog.md'
    );
    const all = [];
    for (const f of files) {
      const data = await this.readMD(f.path, null);
      if (data && data.id) all.push(data);
    }
    return all;
  }

  async addBook(book) {
    if (!book.id) book.id = generateId();
    await this.writeMD(this.bookPath(book.id), book, d => this._renderBook(d));
    return book;
  }

  async updateBook(updated) {
    await this.writeMD(this.bookPath(updated.id), updated, d => this._renderBook(d));
  }

  async deleteBook(id) {
    const f = this.app.vault.getAbstractFileByPath(this.bookPath(id));
    if (f) await this.app.vault.delete(f);
  }

  // ---- TV Watchlog ----

  async getTVWatchlog() { return this.readMD(this.watchlogTVFile, []); }

  async saveTVWatchlog(logs) {
    await this.writeMD(this.watchlogTVFile, logs, d => this._renderTVWatchlog(d));
  }

  async addTVLog(entry) {
    const logs = await this.getTVWatchlog();
    if (!entry.id) entry.id = generateId();
    logs.push(entry);
    await this.saveTVWatchlog(logs);
    return entry;
  }

  async updateTVLog(updated) {
    const logs = await this.getTVWatchlog();
    const idx = logs.findIndex(l => l.id === updated.id);
    if (idx !== -1) { logs[idx] = updated; await this.saveTVWatchlog(logs); }
  }

  async deleteTVLog(id) {
    const logs = (await this.getTVWatchlog()).filter(l => l.id !== id);
    await this.saveTVWatchlog(logs);
  }

  // ---- Movie Watchlog ----

  async getMovieWatchlog() { return this.readMD(this.watchlogMovieFile, []); }

  async saveMovieWatchlog(logs) {
    await this.writeMD(this.watchlogMovieFile, logs, d => this._renderMovieWatchlog(d));
  }

  async addMovieLog(entry) {
    const logs = await this.getMovieWatchlog();
    if (!entry.id) entry.id = generateId();
    logs.push(entry);
    await this.saveMovieWatchlog(logs);
    return entry;
  }

  async updateMovieLog(updated) {
    const logs = await this.getMovieWatchlog();
    const idx = logs.findIndex(l => l.id === updated.id);
    if (idx !== -1) { logs[idx] = updated; await this.saveMovieWatchlog(logs); }
  }

  async deleteMovieLog(id) {
    const logs = (await this.getMovieWatchlog()).filter(l => l.id !== id);
    await this.saveMovieWatchlog(logs);
  }

  // ---- Reading Log ----

  async getReadlog() { return this.readMD(this.readlogFile, []); }

  async saveReadlog(logs) {
    await this.writeMD(this.readlogFile, logs, d => this._renderReadlog(d));
  }

  async addReadEntry(entry) {
    const logs = await this.getReadlog();
    if (!entry.id) entry.id = generateId();
    logs.push(entry);
    await this.saveReadlog(logs);
    return entry;
  }

  async updateReadEntry(updated) {
    const logs = await this.getReadlog();
    const idx = logs.findIndex(l => l.id === updated.id);
    if (idx !== -1) { logs[idx] = updated; await this.saveReadlog(logs); }
  }

  async deleteReadEntry(id) {
    const logs = (await this.getReadlog()).filter(l => l.id !== id);
    await this.saveReadlog(logs);
  }
}

// ============================================================
//  MAIN DASHBOARD
// ============================================================

function openMainDashboard(dm) {
  const { body, close } = createModal('Entertainment Master', '🎬', { noFooter: true });

  const statsRow = el('div', { className: 'em-stats-row' });
  body.appendChild(statsRow);

  const loadStats = async () => {
    const [series, movies, books] = await Promise.all([
      dm.getAllSeries(), dm.getAllMovies(), dm.getAllBooks()
    ]);
    statsRow.innerHTML = '';
    [
      { icon: '📺', num: series.length, label: 'TV Series' },
      { icon: '🎬', num: movies.length, label: 'Movies' },
      { icon: '📚', num: books.length, label: 'Books' },
    ].forEach(({ icon, num, label }) => {
      const card = el('div', { className: 'em-stat-card' });
      card.innerHTML = `<div class="em-stat-icon">${icon}</div><div class="em-stat-num">${num}</div><div class="em-stat-label">${label}</div>`;
      statsRow.appendChild(card);
    });
  };

  loadStats();

  body.appendChild(dashboardGrid([
    { icon: '📺', label: 'TV Series', className: 'tv', onClick: () => { close(); openTVDashboard(dm); } },
    { icon: '🎬', label: 'Movies', className: 'movie', onClick: () => { close(); openMovieDashboard(dm); } },
    { icon: '📚', label: 'Books', className: 'book', onClick: () => { close(); openBooksDashboard(dm); } },
  ]));
}

// ============================================================
//  TV MODULE
// ============================================================

function openTVDashboard(dm) {
  const { body, close } = createModal('TV Series', '📺', { noFooter: true });

  body.appendChild(dashboardGrid([
    { icon: '➕', label: 'Add New Series', className: 'tv', onClick: () => openAddSeriesDialog(dm, null, () => { close(); openTVDashboard(dm); }) },
    { icon: '📋', label: 'View Series', className: 'tv', onClick: () => { close(); openViewSeriesList(dm); } },
    { icon: '📓', label: 'Watch Log', className: 'tv', onClick: () => { close(); openTVWatchlogDashboard(dm); } },
  ]));

  const backBtn = el('button', { className: 'em-back-btn' });
  backBtn.innerHTML = '← Back to Main';
  backBtn.style.marginTop = '16px';
  backBtn.addEventListener('click', () => { close(); openMainDashboard(dm); });
  body.appendChild(backBtn);
}

function openAddSeriesDialog(dm, existing, onSave) {
  const isEdit = !!existing;
  const { body, footer, close } = createModal(isEdit ? 'Edit Series' : 'Add New Series', '📺', { large: true });

  const s = existing || {};

  const nameIn = textInput('Series Name', s.name || '');
  const synopsisIn = textArea('Synopsis...', s.synopsis || '');
  const createdByIn = textInput('Creator(s)', s.createdBy || '');
  const genreIn = textInput('Genre', s.genre || '');
  const premiereIn = dateInput(s.premiereDate || '');
  const statusIn = selectInput([
    ['Ongoing', 'Ongoing'], ['Ended', 'Ended'], ['Canceled', 'Canceled'], ['On Hold', 'On Hold']
  ], s.status || 'Ongoing');
  const totalSeasonsIn = numberInput('0', s.totalSeasons || '');
  const totalEpsIn = numberInput('0', s.totalEpisodes || '');
  const finaleDateIn = dateInput(s.finaleDate || '');
  const networkIn = textInput('Network', s.network || '');
  const whereWatchIn = textInput('Streaming / Channel', s.whereToWatch || '');
  const ratingIn = selectInput([
    ['TV-G', 'TV-G'], ['TV-PG', 'TV-PG'], ['TV-14', 'TV-14'], ['TV-R', 'TV-R'], ['TV-M', 'TV-M']
  ], s.contentRating || 'TV-PG');
  const logoImg = imageUploadGroup('Series Logo Image', s.logo || '');

  [
    formGroup('Series Name *', nameIn),
    formGroup('Synopsis', synopsisIn),
    formGroup('Created By', createdByIn),
    formGroup('Genre', genreIn),
  ].forEach(g => body.appendChild(g));

  const row1 = el('div', { className: 'em-form-row' });
  row1.appendChild(formGroup('Premiere Date', premiereIn));
  row1.appendChild(formGroup('Series Status', statusIn));
  body.appendChild(row1);

  const row2 = el('div', { className: 'em-form-row' });
  row2.appendChild(formGroup('Total Seasons', totalSeasonsIn));
  row2.appendChild(formGroup('Total Episodes', totalEpsIn));
  body.appendChild(row2);

  const row3 = el('div', { className: 'em-form-row' });
  row3.appendChild(formGroup('Finale Date', finaleDateIn));
  row3.appendChild(formGroup('Content Rating', ratingIn));
  body.appendChild(row3);

  [
    formGroup('Original Network', networkIn),
    formGroup('Where to Watch', whereWatchIn),
    logoImg,
  ].forEach(g => body.appendChild(g));

  const saveBtn = el('button', { className: 'em-btn em-btn-primary', textContent: isEdit ? '💾 Save Changes' : '✅ Add Series' });
  const cancelBtn = el('button', { className: 'em-btn em-btn-secondary', textContent: 'Cancel' });

  cancelBtn.addEventListener('click', close);
  saveBtn.addEventListener('click', async () => {
    const name = nameIn.value.trim();
    if (!name) { new Notice('Series Name is required'); return; }
    const series = {
      ...(s),
      name,
      synopsis: synopsisIn.value,
      createdBy: createdByIn.value,
      genre: genreIn.value,
      premiereDate: premiereIn.value,
      status: statusIn.value,
      totalSeasons: totalSeasonsIn.value,
      totalEpisodes: totalEpsIn.value,
      finaleDate: finaleDateIn.value,
      network: networkIn.value,
      whereToWatch: whereWatchIn.value,
      contentRating: ratingIn.value,
      logo: logoImg.getImage(),
      seasons: s.seasons || [],
    };
    await dm.saveSeries(series);
    new Notice(`Series "${name}" ${isEdit ? 'updated' : 'added'}!`);
    close();
    if (onSave) onSave();
  });

  footer.appendChild(cancelBtn);
  footer.appendChild(saveBtn);
}

// ---- View Series List ----
function openViewSeriesList(dm) {
  const { body, footer, close } = createModal('TV Series', '📋', { large: true, noFooter: true });

  const backBtn = el('button', { className: 'em-back-btn' });
  backBtn.innerHTML = '← TV Dashboard';
  backBtn.addEventListener('click', () => { close(); openTVDashboard(dm); });

  const addBtn = el('button', { className: 'em-btn em-btn-primary' });
  addBtn.innerHTML = '➕ Add Series';

  const topRow = el('div', { className: 'em-back-row' });
  topRow.appendChild(backBtn);
  topRow.appendChild(addBtn);
  body.appendChild(topRow);

  const listWrap = el('div', { className: 'em-scroll-list' });
  body.appendChild(listWrap);

  const refresh = async () => {
    listWrap.innerHTML = '';
    const all = await dm.getAllSeries();
    if (!all.length) {
      listWrap.appendChild(emptyState('📺', 'No series yet. Add your first!'));
      return;
    }
    all.forEach(series => {
      const item = el('div', { className: 'em-list-item' });

      if (series.logo) {
        const img = el('img', { className: 'em-list-item-img', src: series.logo });
        item.appendChild(img);
      } else {
        item.appendChild(el('div', { className: 'em-list-item-img-placeholder', innerHTML: '📺' }));
      }

      const info = el('div', { className: 'em-list-item-info' });
      info.appendChild(el('div', { className: 'em-list-item-title', textContent: series.name }));
      info.appendChild(el('div', { className: 'em-list-item-sub', textContent: `${series.status || ''} · ${series.genre || ''}` }));
      item.appendChild(info);

      const actions = el('div', { className: 'em-list-item-actions' });

      const viewBtn = el('button', { className: 'em-icon-btn', innerHTML: '👁️' });
      viewBtn.title = 'View / Seasons';
      viewBtn.addEventListener('click', (e) => { e.stopPropagation(); close(); openSeriesDetail(dm, series.id, () => openViewSeriesList(dm)); });

      const editBtn = el('button', { className: 'em-icon-btn', innerHTML: '✏️' });
      editBtn.title = 'Edit';
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        close();
        openAddSeriesDialog(dm, series, () => { openViewSeriesList(dm); });
      });

      const delBtn = el('button', { className: 'em-icon-btn danger', innerHTML: '🗑️' });
      delBtn.title = 'Delete';
      delBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm(`Delete "${series.name}"?`)) {
          await dm.deleteSeries(series.id);
          new Notice('Series deleted');
          refresh();
        }
      });

      actions.appendChild(viewBtn);
      actions.appendChild(editBtn);
      actions.appendChild(delBtn);
      item.appendChild(actions);
      listWrap.appendChild(item);
    });
  };

  addBtn.addEventListener('click', () => { close(); openAddSeriesDialog(dm, null, () => openViewSeriesList(dm)); });

  refresh();
}

// ---- Series Detail (Seasons) ----
function openSeriesDetail(dm, seriesId, onBack) {
  const { body, close } = createModal('Series Detail', '📺', { large: true, noFooter: true });

  const render = async () => {
    body.innerHTML = '';
    const series = await dm.getSeries(seriesId);
    if (!series) { close(); return; }

    const backBtn = el('button', { className: 'em-back-btn' });
    backBtn.innerHTML = '← Series List';
    backBtn.addEventListener('click', () => { close(); if (onBack) onBack(); });
    body.appendChild(backBtn);

    const titleRow = el('div', { style: 'display:flex;align-items:center;gap:14px;margin:12px 0 16px;' });
    if (series.logo) {
      const img = el('img', { src: series.logo, style: 'width:60px;height:80px;object-fit:cover;border-radius:10px;' });
      titleRow.appendChild(img);
    }
    const titleInfo = el('div');
    titleInfo.innerHTML = `<div style="font-size:1.1rem;font-weight:800;">${series.name}</div>
      <div style="font-size:0.82rem;color:var(--text-muted);">${series.status || ''} · ${series.genre || ''} · ${series.contentRating || ''}</div>`;
    titleRow.appendChild(titleInfo);
    body.appendChild(titleRow);

    const addSeasonBtn = el('button', { className: 'em-btn em-btn-primary' });
    addSeasonBtn.innerHTML = '➕ Add Season';
    addSeasonBtn.addEventListener('click', () => {
      close();
      openAddSeasonDialog(dm, series, null, () => openSeriesDetail(dm, seriesId, onBack));
    });
    body.appendChild(addSeasonBtn);

    const subH = el('div', { className: 'em-sub-header', textContent: `Seasons (${(series.seasons || []).length})` });
    body.appendChild(subH);

    const seasonList = el('div', { className: 'em-scroll-list' });
    if (!series.seasons || !series.seasons.length) {
      seasonList.appendChild(emptyState('🗓️', 'No seasons added yet'));
    } else {
      series.seasons.forEach(season => {
        const sItem = el('div', { className: 'em-season-item' });
        const sHeader = el('div', { className: 'em-season-header' });
        sHeader.innerHTML = `<span class="em-season-title">Season ${season.number}</span>`;

        const sActions = el('div', { style: 'display:flex;gap:6px;' });
        const viewEpBtn = el('button', { className: 'em-icon-btn', innerHTML: '🎬', title: 'View Episodes' });
        viewEpBtn.addEventListener('click', () => { close(); openSeasonDetail(dm, seriesId, season.id, () => openSeriesDetail(dm, seriesId, onBack)); });

        const editSeasonBtn = el('button', { className: 'em-icon-btn', innerHTML: '✏️', title: 'Edit Season' });
        editSeasonBtn.addEventListener('click', () => { close(); openAddSeasonDialog(dm, series, season, () => openSeriesDetail(dm, seriesId, onBack)); });

        const delSeasonBtn = el('button', { className: 'em-icon-btn danger', innerHTML: '🗑️', title: 'Delete Season' });
        delSeasonBtn.addEventListener('click', async () => {
          if (confirm(`Delete Season ${season.number}?`)) {
            const s = await dm.getSeries(seriesId);
            s.seasons = (s.seasons || []).filter(x => x.id !== season.id);
            await dm.saveSeries(s);
            new Notice('Season deleted');
            close();
            openSeriesDetail(dm, seriesId, onBack);
          }
        });

        sActions.appendChild(viewEpBtn);
        sActions.appendChild(editSeasonBtn);
        sActions.appendChild(delSeasonBtn);
        sHeader.appendChild(sActions);
        sItem.appendChild(sHeader);
        const sSubInfo = el('div', {
          style: 'font-size:0.8rem;color:var(--text-muted);margin-top:6px;',
          textContent: `${season.episodes ? season.episodes.length : 0} Episodes · Premiered: ${season.premiereDate || 'TBD'}`
        });
        sItem.appendChild(sSubInfo);
        seasonList.appendChild(sItem);
      });
    }
    body.appendChild(seasonList);
  };

  render();
}

// ---- Add/Edit Season ----
function openAddSeasonDialog(dm, series, existing, onSave) {
  const isEdit = !!existing;
  const { body, footer, close } = createModal(isEdit ? 'Edit Season' : 'Add Season', '🗓️', { large: true });

  const s = existing || {};

  const numIn = numberInput('Season Number', s.number || '');
  const synopsisIn = textArea('Season synopsis...', s.synopsis || '');
  const premiereIn = dateInput(s.premiereDate || '');
  const totalEpsIn = numberInput('0', s.totalEpisodes || '');
  const finaleIn = dateInput(s.finaleDate || '');
  const coverImg = imageUploadGroup('Season Cover Image', s.cover || '');

  [
    formGroup('Season Number *', numIn),
    formGroup('Season Synopsis', synopsisIn),
  ].forEach(g => body.appendChild(g));

  const row1 = el('div', { className: 'em-form-row' });
  row1.appendChild(formGroup('Premiere Date', premiereIn));
  row1.appendChild(formGroup('Total Episodes', totalEpsIn));
  body.appendChild(row1);

  body.appendChild(formGroup('Finale Date', finaleIn));
  body.appendChild(coverImg);

  const saveBtn = el('button', { className: 'em-btn em-btn-primary', textContent: isEdit ? '💾 Save' : '✅ Add Season' });
  const cancelBtn = el('button', { className: 'em-btn em-btn-secondary', textContent: 'Cancel' });
  cancelBtn.addEventListener('click', close);

  saveBtn.addEventListener('click', async () => {
    if (!numIn.value) { new Notice('Season number required'); return; }
    const season = {
      id: s.id || generateId(),
      number: numIn.value,
      synopsis: synopsisIn.value,
      premiereDate: premiereIn.value,
      totalEpisodes: totalEpsIn.value,
      finaleDate: finaleIn.value,
      cover: coverImg.getImage(),
      episodes: s.episodes || [],
    };
    const sr = await dm.getSeries(series.id);
    if (!sr.seasons) sr.seasons = [];
    if (isEdit) {
      const idx = sr.seasons.findIndex(x => x.id === season.id);
      if (idx !== -1) sr.seasons[idx] = season;
    } else {
      sr.seasons.push(season);
    }
    await dm.saveSeries(sr);
    new Notice(`Season ${season.number} ${isEdit ? 'updated' : 'added'}!`);
    close();
    if (onSave) onSave();
  });

  footer.appendChild(cancelBtn);
  footer.appendChild(saveBtn);
}

// ---- Season Detail (Episodes) ----
function openSeasonDetail(dm, seriesId, seasonId, onBack) {
  const { body, close } = createModal('Season Episodes', '🎬', { large: true, noFooter: true });

  const render = async () => {
    body.innerHTML = '';
    const series = await dm.getSeries(seriesId);
    const season = (series.seasons || []).find(s => s.id === seasonId);
    if (!season) { close(); return; }

    const backBtn = el('button', { className: 'em-back-btn' });
    backBtn.innerHTML = `← ${series.name}`;
    backBtn.addEventListener('click', () => { close(); if (onBack) onBack(); });
    body.appendChild(backBtn);

    const titleEl = el('div', { style: 'font-size:1rem;font-weight:700;margin:10px 0 14px;' });
    titleEl.textContent = `Season ${season.number}`;
    body.appendChild(titleEl);

    const addEpBtn = el('button', { className: 'em-btn em-btn-primary' });
    addEpBtn.innerHTML = '➕ Add Episode';
    addEpBtn.addEventListener('click', () => {
      close();
      openAddEpisodeDialog(dm, seriesId, seasonId, null, () => openSeasonDetail(dm, seriesId, seasonId, onBack));
    });
    body.appendChild(addEpBtn);

    const subH = el('div', { className: 'em-sub-header', textContent: `Episodes (${(season.episodes || []).length})` });
    body.appendChild(subH);

    const epList = el('div', { className: 'em-scroll-list' });
    if (!season.episodes || !season.episodes.length) {
      epList.appendChild(emptyState('🎬', 'No episodes yet'));
    } else {
      season.episodes.forEach(ep => {
        const item = el('div', { className: 'em-list-item' });

        if (ep.clip) {
          item.appendChild(el('img', { className: 'em-list-item-img', src: ep.clip }));
        } else {
          item.appendChild(el('div', { className: 'em-list-item-img-placeholder', innerHTML: '🎞️' }));
        }

        const info = el('div', { className: 'em-list-item-info' });
        info.appendChild(el('div', { className: 'em-list-item-title', textContent: `Ep ${ep.number}: ${ep.title}` }));
        info.appendChild(el('div', { className: 'em-list-item-sub', textContent: `${ep.airDate || ''} · ${ep.runtime || ''}` }));
        item.appendChild(info);

        const actions = el('div', { className: 'em-list-item-actions' });
        const editBtn = el('button', { className: 'em-icon-btn', innerHTML: '✏️', title: 'Edit' });
        editBtn.addEventListener('click', () => { close(); openAddEpisodeDialog(dm, seriesId, seasonId, ep, () => openSeasonDetail(dm, seriesId, seasonId, onBack)); });

        const delBtn = el('button', { className: 'em-icon-btn danger', innerHTML: '🗑️', title: 'Delete' });
        delBtn.addEventListener('click', async () => {
          if (confirm(`Delete episode "${ep.title}"?`)) {
            const sr = await dm.getSeries(seriesId);
            const sn = sr.seasons.find(s => s.id === seasonId);
            sn.episodes = sn.episodes.filter(e => e.id !== ep.id);
            await dm.saveSeries(sr);
            new Notice('Episode deleted');
            close();
            openSeasonDetail(dm, seriesId, seasonId, onBack);
          }
        });

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
        item.appendChild(actions);
        epList.appendChild(item);
      });
    }
    body.appendChild(epList);
  };

  render();
}

// ---- Add/Edit Episode ----
function openAddEpisodeDialog(dm, seriesId, seasonId, existing, onSave) {
  const isEdit = !!existing;
  const { body, footer, close } = createModal(isEdit ? 'Edit Episode' : 'Add Episode', '🎞️', { large: true });

  const e = existing || {};
  const numIn = numberInput('Episode #', e.number || '');
  const titleIn = textInput('Episode Title', e.title || '');
  const synopsisIn = textArea('Synopsis...', e.synopsis || '');
  const airDateIn = dateInput(e.airDate || '');
  const directedByIn = textInput('Director(s)', e.directedBy || '');
  const runtimeIn = textInput('e.g. 45 min', e.runtime || '');
  const clipImg = imageUploadGroup('Episode Clip Image', e.clip || '');

  const row1 = el('div', { className: 'em-form-row' });
  row1.appendChild(formGroup('Episode Number *', numIn));
  row1.appendChild(formGroup('Air Date', airDateIn));
  body.appendChild(row1);

  body.appendChild(formGroup('Episode Title *', titleIn));
  body.appendChild(formGroup('Synopsis', synopsisIn));

  const row2 = el('div', { className: 'em-form-row' });
  row2.appendChild(formGroup('Directed By', directedByIn));
  row2.appendChild(formGroup('Runtime', runtimeIn));
  body.appendChild(row2);

  body.appendChild(clipImg);

  const saveBtn = el('button', { className: 'em-btn em-btn-primary', textContent: isEdit ? '💾 Save' : '✅ Add Episode' });
  const cancelBtn = el('button', { className: 'em-btn em-btn-secondary', textContent: 'Cancel' });
  cancelBtn.addEventListener('click', close);

  saveBtn.addEventListener('click', async () => {
    if (!numIn.value || !titleIn.value.trim()) { new Notice('Episode number and title required'); return; }
    const episode = {
      id: e.id || generateId(),
      number: numIn.value,
      title: titleIn.value.trim(),
      synopsis: synopsisIn.value,
      airDate: airDateIn.value,
      directedBy: directedByIn.value,
      runtime: runtimeIn.value,
      clip: clipImg.getImage(),
    };
    const sr = await dm.getSeries(seriesId);
    const sn = sr.seasons.find(s => s.id === seasonId);
    if (!sn.episodes) sn.episodes = [];
    if (isEdit) {
      const idx = sn.episodes.findIndex(x => x.id === episode.id);
      if (idx !== -1) sn.episodes[idx] = episode;
    } else {
      sn.episodes.push(episode);
    }
    await dm.saveSeries(sr);
    new Notice(`Episode "${episode.title}" ${isEdit ? 'updated' : 'added'}!`);
    close();
    if (onSave) onSave();
  });

  footer.appendChild(cancelBtn);
  footer.appendChild(saveBtn);
}

// ---- TV Watchlog ----
function openTVWatchlogDashboard(dm) {
  const { body, close } = createModal('TV Watch Log', '📓', { noFooter: true });

  body.appendChild(dashboardGrid([
    { icon: '➕', label: 'Add Entry', className: 'tv', onClick: () => { close(); openAddTVLogDialog(dm, null, () => openTVWatchlogDashboard(dm)); } },
    { icon: '📋', label: 'View Entries', className: 'tv', onClick: () => { close(); openTVLogList(dm); } },
  ]));

  const backBtn = el('button', { className: 'em-back-btn' });
  backBtn.innerHTML = '← TV Dashboard';
  backBtn.style.marginTop = '14px';
  backBtn.addEventListener('click', () => { close(); openTVDashboard(dm); });
  body.appendChild(backBtn);
}

function openAddTVLogDialog(dm, existing, onSave) {
  const isEdit = !!existing;
  const { body, footer, close } = createModal(isEdit ? 'Edit Watch Entry' : 'Add Watch Entry', '📺', { large: true });

  const entry = existing || {};

  // Series dropdown
  const seriesSelect = el('select');
  const seasonSelect = el('select');
  const episodeSelect = el('select');

  const populateSeries = async () => {
    const all = await dm.getAllSeries();
    seriesSelect.innerHTML = '<option value="">Select series...</option>';
    all.forEach(s => {
      const o = el('option', { value: s.id, textContent: s.name });
      if (s.id === entry.seriesId) o.selected = true;
      seriesSelect.appendChild(o);
    });
    if (entry.seriesId) await populateSeasons(entry.seriesId);
  };

  const populateSeasons = async (seriesId) => {
    seasonSelect.innerHTML = '<option value="">Select season...</option>';
    episodeSelect.innerHTML = '<option value="">Select episode...</option>';
    if (!seriesId) return;
    const series = await dm.getSeries(seriesId);
    (series.seasons || []).forEach(s => {
      const o = el('option', { value: s.id, textContent: `Season ${s.number}` });
      if (s.id === entry.seasonId) o.selected = true;
      seasonSelect.appendChild(o);
    });
    if (entry.seasonId) await populateEpisodes(series, entry.seasonId);
  };

  const populateEpisodes = async (series, seasonId) => {
    episodeSelect.innerHTML = '<option value="">Select episode...</option>';
    const season = (series.seasons || []).find(s => s.id === seasonId);
    if (!season) return;
    (season.episodes || []).forEach(ep => {
      const o = el('option', { value: ep.id, textContent: `Ep ${ep.number}: ${ep.title}` });
      if (ep.id === entry.episodeId) o.selected = true;
      episodeSelect.appendChild(o);
    });
  };

  seriesSelect.addEventListener('change', async () => {
    await populateSeasons(seriesSelect.value);
  });

  seasonSelect.addEventListener('change', async () => {
    const series = await dm.getSeries(seriesSelect.value);
    await populateEpisodes(series, seasonSelect.value);
  });

  const dateIn = dateInput(entry.date || '');
  const timeIn = timeInput(entry.time || '');
  const ratingWrap = el('div', { className: 'em-form-group' });
  ratingWrap.appendChild(el('label', { textContent: 'Rating' }));
  const starRating = starRatingInput(entry.rating || 0);
  ratingWrap.appendChild(starRating);
  const commentsIn = textArea('Comments...', entry.comments || '');

  body.appendChild(formGroup('Series', seriesSelect));
  body.appendChild(formGroup('Season', seasonSelect));
  body.appendChild(formGroup('Episode', episodeSelect));

  const row = el('div', { className: 'em-form-row' });
  row.appendChild(formGroup('Date', dateIn));
  row.appendChild(formGroup('Time', timeIn));
  body.appendChild(row);

  body.appendChild(ratingWrap);
  body.appendChild(formGroup('Comments', commentsIn));

  populateSeries();

  const saveBtn = el('button', { className: 'em-btn em-btn-primary', textContent: isEdit ? '💾 Save' : '✅ Add Entry' });
  const cancelBtn = el('button', { className: 'em-btn em-btn-secondary', textContent: 'Cancel' });
  cancelBtn.addEventListener('click', close);

  saveBtn.addEventListener('click', async () => {
    const newEntry = {
      id: entry.id || generateId(),
      seriesId: seriesSelect.value,
      seriesName: seriesSelect.options[seriesSelect.selectedIndex]?.text || '',
      seasonId: seasonSelect.value,
      seasonNum: seasonSelect.options[seasonSelect.selectedIndex]?.text || '',
      episodeId: episodeSelect.value,
      episodeName: episodeSelect.options[episodeSelect.selectedIndex]?.text || '',
      date: dateIn.value,
      time: timeIn.value,
      rating: starRating.getRating(),
      comments: commentsIn.value,
    };
    if (isEdit) await dm.updateTVLog(newEntry);
    else await dm.addTVLog(newEntry);
    new Notice('Watch entry saved!');
    close();
    if (onSave) onSave();
  });

  footer.appendChild(cancelBtn);
  footer.appendChild(saveBtn);
}

function openTVLogList(dm) {
  const { body, close } = createModal('Watch Log Entries', '📓', { large: true, noFooter: true });

  const backBtn = el('button', { className: 'em-back-btn' });
  backBtn.innerHTML = '← Watch Log';
  backBtn.addEventListener('click', () => { close(); openTVWatchlogDashboard(dm); });

  const addBtn = el('button', { className: 'em-btn em-btn-primary', innerHTML: '➕ Add Entry' });

  const topRow = el('div', { className: 'em-back-row' });
  topRow.appendChild(backBtn);
  topRow.appendChild(addBtn);
  body.appendChild(topRow);

  const listWrap = el('div', { className: 'em-scroll-list' });
  body.appendChild(listWrap);

  const refresh = async () => {
    listWrap.innerHTML = '';
    const logs = await dm.getTVWatchlog();
    if (!logs.length) { listWrap.appendChild(emptyState('📓', 'No watch entries yet')); return; }
    logs.slice().reverse().forEach(entry => {
      const item = el('div', { className: 'em-log-item' });
      const info = el('div', { className: 'em-log-info' });
      info.appendChild(el('div', { className: 'em-log-title', textContent: `${entry.seriesName} – ${entry.episodeName}` }));
      info.appendChild(el('div', { className: 'em-log-sub', textContent: `${entry.seasonNum} · ${entry.date || ''} ${entry.time || ''}` }));
      if (entry.comments) info.appendChild(el('div', { className: 'em-log-sub', textContent: entry.comments }));
      const stars = el('div', { className: 'em-log-stars', innerHTML: starsHtml(entry.rating) });

      const actions = el('div', { className: 'em-list-item-actions' });
      const editBtn = el('button', { className: 'em-icon-btn', innerHTML: '✏️' });
      editBtn.addEventListener('click', () => { close(); openAddTVLogDialog(dm, entry, () => openTVLogList(dm)); });
      const delBtn = el('button', { className: 'em-icon-btn danger', innerHTML: '🗑️' });
      delBtn.addEventListener('click', async () => {
        if (confirm('Delete this entry?')) {
          await dm.deleteTVLog(entry.id);
          refresh();
        }
      });
      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      item.appendChild(info);
      item.appendChild(stars);
      item.appendChild(actions);
      listWrap.appendChild(item);
    });
  };

  addBtn.addEventListener('click', () => { close(); openAddTVLogDialog(dm, null, () => openTVLogList(dm)); });
  refresh();
}

// ============================================================
//  MOVIES MODULE
// ============================================================

function openMovieDashboard(dm) {
  const { body, close } = createModal('Movies', '🎬', { noFooter: true });

  body.appendChild(dashboardGrid([
    { icon: '➕', label: 'Add Movie', className: 'movie', onClick: () => { close(); openAddMovieDialog(dm, null, () => openMovieDashboard(dm)); } },
    { icon: '🎥', label: 'View Movies', className: 'movie', onClick: () => { close(); openMovieList(dm); } },
    { icon: '📓', label: 'Watch Log', className: 'movie', onClick: () => { close(); openMovieWatchlogDashboard(dm); } },
  ]));

  const backBtn = el('button', { className: 'em-back-btn' });
  backBtn.innerHTML = '← Main Dashboard';
  backBtn.style.marginTop = '16px';
  backBtn.addEventListener('click', () => { close(); openMainDashboard(dm); });
  body.appendChild(backBtn);
}

function openAddMovieDialog(dm, existing, onSave) {
  const isEdit = !!existing;
  const { body, footer, close } = createModal(isEdit ? 'Edit Movie' : 'Add Movie', '🎬', { large: true });

  const m = existing || {};
  const titleIn = textInput('Movie Title', m.title || '');
  const synopsisIn = textArea('Synopsis...', m.synopsis || '');
  const createdByIn = textInput('Created By', m.createdBy || '');
  const directedByIn = textInput('Director(s)', m.directedBy || '');
  const releaseDateIn = dateInput(m.releaseDate || '');
  const genreIn = textInput('Genre', m.genre || '');
  const runtimeIn = textInput('e.g. 2h 15m', m.runtime || '');
  const coverImg = imageUploadGroup('Movie Cover Image', m.cover || '');

  body.appendChild(formGroup('Movie Title *', titleIn));
  body.appendChild(formGroup('Synopsis', synopsisIn));

  const row1 = el('div', { className: 'em-form-row' });
  row1.appendChild(formGroup('Created By', createdByIn));
  row1.appendChild(formGroup('Directed By', directedByIn));
  body.appendChild(row1);

  const row2 = el('div', { className: 'em-form-row' });
  row2.appendChild(formGroup('Release Date', releaseDateIn));
  row2.appendChild(formGroup('Genre', genreIn));
  body.appendChild(row2);

  body.appendChild(formGroup('Runtime', runtimeIn));
  body.appendChild(coverImg);

  const saveBtn = el('button', { className: 'em-btn em-btn-primary', textContent: isEdit ? '💾 Save Changes' : '✅ Add Movie' });
  const cancelBtn = el('button', { className: 'em-btn em-btn-secondary', textContent: 'Cancel' });
  if (isEdit) {
    const delBtn = el('button', { className: 'em-btn em-btn-danger', textContent: '🗑️ Delete' });
    delBtn.addEventListener('click', async () => {
      if (confirm(`Delete "${m.title}"?`)) {
        await dm.deleteMovie(m.id);
        new Notice('Movie deleted');
        close();
        if (onSave) onSave();
      }
    });
    footer.appendChild(delBtn);
  }
  cancelBtn.addEventListener('click', close);

  saveBtn.addEventListener('click', async () => {
    if (!titleIn.value.trim()) { new Notice('Title required'); return; }
    const movie = {
      id: m.id || generateId(),
      title: titleIn.value.trim(),
      synopsis: synopsisIn.value,
      createdBy: createdByIn.value,
      directedBy: directedByIn.value,
      releaseDate: releaseDateIn.value,
      genre: genreIn.value,
      runtime: runtimeIn.value,
      cover: coverImg.getImage(),
    };
    if (isEdit) await dm.updateMovie(movie);
    else await dm.addMovie(movie);
    new Notice(`Movie "${movie.title}" ${isEdit ? 'updated' : 'added'}!`);
    close();
    if (onSave) onSave();
  });

  footer.appendChild(cancelBtn);
  footer.appendChild(saveBtn);
}

function openMovieList(dm) {
  const { body, close } = createModal('Movies', '🎥', { large: true, noFooter: true });

  const backBtn = el('button', { className: 'em-back-btn' });
  backBtn.innerHTML = '← Movies';
  backBtn.addEventListener('click', () => { close(); openMovieDashboard(dm); });

  const addBtn = el('button', { className: 'em-btn em-btn-primary', innerHTML: '➕ Add Movie' });

  const topRow = el('div', { className: 'em-back-row' });
  topRow.appendChild(backBtn);
  topRow.appendChild(addBtn);
  body.appendChild(topRow);

  const listWrap = el('div', { className: 'em-scroll-list' });
  body.appendChild(listWrap);

  const refresh = async () => {
    listWrap.innerHTML = '';
    const all = await dm.getAllMovies();
    if (!all.length) { listWrap.appendChild(emptyState('🎬', 'No movies yet')); return; }
    all.forEach(movie => {
      const item = el('div', { className: 'em-list-item' });

      if (movie.cover) {
        item.appendChild(el('img', { className: 'em-list-item-img', src: movie.cover }));
      } else {
        item.appendChild(el('div', { className: 'em-list-item-img-placeholder', innerHTML: '🎬' }));
      }

      const info = el('div', { className: 'em-list-item-info' });
      info.appendChild(el('div', { className: 'em-list-item-title', textContent: movie.title }));
      info.appendChild(el('div', { className: 'em-list-item-sub', textContent: `${movie.genre || ''} · ${movie.releaseDate || ''}` }));
      item.appendChild(info);

      const actions = el('div', { className: 'em-list-item-actions' });
      const editBtn = el('button', { className: 'em-icon-btn', innerHTML: '✏️' });
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        close();
        openAddMovieDialog(dm, movie, () => openMovieList(dm));
      });
      actions.appendChild(editBtn);
      item.appendChild(actions);

      item.addEventListener('click', () => { close(); openAddMovieDialog(dm, movie, () => openMovieList(dm)); });
      listWrap.appendChild(item);
    });
  };

  addBtn.addEventListener('click', () => { close(); openAddMovieDialog(dm, null, () => openMovieList(dm)); });
  refresh();
}

// ---- Movie Watchlog ----
function openMovieWatchlogDashboard(dm) {
  const { body, close } = createModal('Movie Watch Log', '📓', { noFooter: true });

  body.appendChild(dashboardGrid([
    { icon: '➕', label: 'Add Entry', className: 'movie', onClick: () => { close(); openAddMovieLogDialog(dm, null, () => openMovieWatchlogDashboard(dm)); } },
    { icon: '📋', label: 'View Entries', className: 'movie', onClick: () => { close(); openMovieLogList(dm); } },
  ]));

  const backBtn = el('button', { className: 'em-back-btn' });
  backBtn.innerHTML = '← Movies';
  backBtn.style.marginTop = '14px';
  backBtn.addEventListener('click', () => { close(); openMovieDashboard(dm); });
  body.appendChild(backBtn);
}

function openAddMovieLogDialog(dm, existing, onSave) {
  const isEdit = !!existing;
  const { body, footer, close } = createModal(isEdit ? 'Edit Watch Entry' : 'Add Watch Entry', '🎬', { large: true });

  const entry = existing || {};
  const movieSelect = el('select');
  const dateIn = dateInput(entry.date || '');
  const timeIn = timeInput(entry.time || '');
  const ratingWrap = el('div', { className: 'em-form-group' });
  ratingWrap.appendChild(el('label', { textContent: 'Rating' }));
  const starRating = starRatingInput(entry.rating || 0);
  ratingWrap.appendChild(starRating);
  const commentsIn = textArea('Comments...', entry.comments || '');

  const populateMovies = async () => {
    const all = await dm.getAllMovies();
    movieSelect.innerHTML = '<option value="">Select movie...</option>';
    all.forEach(m => {
      const o = el('option', { value: m.id, textContent: m.title });
      if (m.id === entry.movieId) o.selected = true;
      movieSelect.appendChild(o);
    });
  };

  body.appendChild(formGroup('Movie', movieSelect));
  const row = el('div', { className: 'em-form-row' });
  row.appendChild(formGroup('Date', dateIn));
  row.appendChild(formGroup('Time', timeIn));
  body.appendChild(row);
  body.appendChild(ratingWrap);
  body.appendChild(formGroup('Comments', commentsIn));

  populateMovies();

  const saveBtn = el('button', { className: 'em-btn em-btn-primary', textContent: isEdit ? '💾 Save' : '✅ Add Entry' });
  const cancelBtn = el('button', { className: 'em-btn em-btn-secondary', textContent: 'Cancel' });
  cancelBtn.addEventListener('click', close);

  saveBtn.addEventListener('click', async () => {
    const newEntry = {
      id: entry.id || generateId(),
      movieId: movieSelect.value,
      movieTitle: movieSelect.options[movieSelect.selectedIndex]?.text || '',
      date: dateIn.value,
      time: timeIn.value,
      rating: starRating.getRating(),
      comments: commentsIn.value,
    };
    if (isEdit) await dm.updateMovieLog(newEntry);
    else await dm.addMovieLog(newEntry);
    new Notice('Watch entry saved!');
    close();
    if (onSave) onSave();
  });

  footer.appendChild(cancelBtn);
  footer.appendChild(saveBtn);
}

function openMovieLogList(dm) {
  const { body, close } = createModal('Movie Watch Log', '📓', { large: true, noFooter: true });

  const backBtn = el('button', { className: 'em-back-btn' });
  backBtn.innerHTML = '← Watch Log';
  backBtn.addEventListener('click', () => { close(); openMovieWatchlogDashboard(dm); });

  const addBtn = el('button', { className: 'em-btn em-btn-primary', innerHTML: '➕ Add Entry' });

  const topRow = el('div', { className: 'em-back-row' });
  topRow.appendChild(backBtn);
  topRow.appendChild(addBtn);
  body.appendChild(topRow);

  const listWrap = el('div', { className: 'em-scroll-list' });
  body.appendChild(listWrap);

  const refresh = async () => {
    listWrap.innerHTML = '';
    const logs = await dm.getMovieWatchlog();
    if (!logs.length) { listWrap.appendChild(emptyState('📓', 'No entries yet')); return; }
    logs.slice().reverse().forEach(entry => {
      const item = el('div', { className: 'em-log-item' });
      const info = el('div', { className: 'em-log-info' });
      info.appendChild(el('div', { className: 'em-log-title', textContent: entry.movieTitle }));
      info.appendChild(el('div', { className: 'em-log-sub', textContent: `${entry.date || ''} ${entry.time || ''}` }));
      if (entry.comments) info.appendChild(el('div', { className: 'em-log-sub', textContent: entry.comments }));
      const stars = el('div', { className: 'em-log-stars', innerHTML: starsHtml(entry.rating) });

      const actions = el('div', { className: 'em-list-item-actions' });
      const editBtn = el('button', { className: 'em-icon-btn', innerHTML: '✏️' });
      editBtn.addEventListener('click', () => { close(); openAddMovieLogDialog(dm, entry, () => openMovieLogList(dm)); });
      const delBtn = el('button', { className: 'em-icon-btn danger', innerHTML: '🗑️' });
      delBtn.addEventListener('click', async () => {
        if (confirm('Delete this entry?')) { await dm.deleteMovieLog(entry.id); refresh(); }
      });
      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      item.appendChild(info);
      item.appendChild(stars);
      item.appendChild(actions);
      listWrap.appendChild(item);
    });
  };

  addBtn.addEventListener('click', () => { close(); openAddMovieLogDialog(dm, null, () => openMovieLogList(dm)); });
  refresh();
}

// ============================================================
//  BOOKS MODULE
// ============================================================

function openBooksDashboard(dm) {
  const { body, close } = createModal('Books', '📚', { noFooter: true });

  body.appendChild(dashboardGrid([
    { icon: '➕', label: 'Add Book', className: 'book', onClick: () => { close(); openAddBookDialog(dm, null, () => openBooksDashboard(dm)); } },
    { icon: '📖', label: 'View Books', className: 'book', onClick: () => { close(); openBookList(dm); } },
    { icon: '📒', label: 'Reading Log', className: 'book', onClick: () => { close(); openReadlogDashboard(dm); } },
  ]));

  const backBtn = el('button', { className: 'em-back-btn' });
  backBtn.innerHTML = '← Main Dashboard';
  backBtn.style.marginTop = '16px';
  backBtn.addEventListener('click', () => { close(); openMainDashboard(dm); });
  body.appendChild(backBtn);
}

function openAddBookDialog(dm, existing, onSave) {
  const isEdit = !!existing;
  const { body, footer, close } = createModal(isEdit ? 'Edit Book' : 'Add Book', '📚', { large: true });

  const b = existing || {};
  const titleIn = textInput('Book Title', b.title || '');
  const synopsisIn = textArea('Synopsis...', b.synopsis || '');
  const authorIn = textInput('Author', b.author || '');
  const releaseDateIn = dateInput(b.releaseDate || '');
  const genreIn = textInput('Genre', b.genre || '');
  const seriesIn = textInput('Series Name', b.series || '');
  const bookNumIn = textInput('Book # in Series', b.bookNumber || '');
  const pagesIn = numberInput('0', b.pages || '');
  const isbnIn = textInput('ISBN #', b.isbn || '');
  const publisherIn = textInput('Publisher', b.publisher || '');
  const coverImg = imageUploadGroup('Book Cover Image', b.cover || '');

  body.appendChild(formGroup('Book Title *', titleIn));
  body.appendChild(formGroup('Synopsis', synopsisIn));

  const row1 = el('div', { className: 'em-form-row' });
  row1.appendChild(formGroup('Author', authorIn));
  row1.appendChild(formGroup('Release Date', releaseDateIn));
  body.appendChild(row1);

  const row2 = el('div', { className: 'em-form-row' });
  row2.appendChild(formGroup('Genre', genreIn));
  row2.appendChild(formGroup('Number of Pages', pagesIn));
  body.appendChild(row2);

  const row3 = el('div', { className: 'em-form-row' });
  row3.appendChild(formGroup('Series Name', seriesIn));
  row3.appendChild(formGroup('Book # in Series', bookNumIn));
  body.appendChild(row3);

  const row4 = el('div', { className: 'em-form-row' });
  row4.appendChild(formGroup('ISBN #', isbnIn));
  row4.appendChild(formGroup('Publisher', publisherIn));
  body.appendChild(row4);

  body.appendChild(coverImg);

  const saveBtn = el('button', { className: 'em-btn em-btn-primary', textContent: isEdit ? '💾 Save Changes' : '✅ Add Book' });
  const cancelBtn = el('button', { className: 'em-btn em-btn-secondary', textContent: 'Cancel' });
  if (isEdit) {
    const delBtn = el('button', { className: 'em-btn em-btn-danger', textContent: '🗑️ Delete' });
    delBtn.addEventListener('click', async () => {
      if (confirm(`Delete "${b.title}"?`)) {
        await dm.deleteBook(b.id);
        new Notice('Book deleted');
        close();
        if (onSave) onSave();
      }
    });
    footer.appendChild(delBtn);
  }
  cancelBtn.addEventListener('click', close);

  saveBtn.addEventListener('click', async () => {
    if (!titleIn.value.trim()) { new Notice('Title required'); return; }
    const book = {
      id: b.id || generateId(),
      title: titleIn.value.trim(),
      synopsis: synopsisIn.value,
      author: authorIn.value,
      releaseDate: releaseDateIn.value,
      genre: genreIn.value,
      series: seriesIn.value,
      bookNumber: bookNumIn.value,
      pages: pagesIn.value,
      isbn: isbnIn.value,
      publisher: publisherIn.value,
      cover: coverImg.getImage(),
    };
    if (isEdit) await dm.updateBook(book);
    else await dm.addBook(book);
    new Notice(`Book "${book.title}" ${isEdit ? 'updated' : 'added'}!`);
    close();
    if (onSave) onSave();
  });

  footer.appendChild(cancelBtn);
  footer.appendChild(saveBtn);
}

function openBookList(dm) {
  const { body, close } = createModal('Books', '📖', { large: true, noFooter: true });

  const backBtn = el('button', { className: 'em-back-btn' });
  backBtn.innerHTML = '← Books';
  backBtn.addEventListener('click', () => { close(); openBooksDashboard(dm); });

  const addBtn = el('button', { className: 'em-btn em-btn-primary', innerHTML: '➕ Add Book' });

  const topRow = el('div', { className: 'em-back-row' });
  topRow.appendChild(backBtn);
  topRow.appendChild(addBtn);
  body.appendChild(topRow);

  const listWrap = el('div', { className: 'em-scroll-list' });
  body.appendChild(listWrap);

  const refresh = async () => {
    listWrap.innerHTML = '';
    const all = await dm.getAllBooks();
    if (!all.length) { listWrap.appendChild(emptyState('📚', 'No books yet')); return; }
    all.forEach(book => {
      const item = el('div', { className: 'em-list-item' });

      if (book.cover) {
        item.appendChild(el('img', { className: 'em-list-item-img', src: book.cover }));
      } else {
        item.appendChild(el('div', { className: 'em-list-item-img-placeholder', innerHTML: '📚' }));
      }

      const info = el('div', { className: 'em-list-item-info' });
      info.appendChild(el('div', { className: 'em-list-item-title', textContent: book.title }));
      info.appendChild(el('div', { className: 'em-list-item-sub', textContent: `${book.author || ''} · ${book.genre || ''}` }));
      if (book.series) info.appendChild(el('div', { className: 'em-list-item-sub', textContent: `Series: ${book.series} #${book.bookNumber || ''}` }));
      item.appendChild(info);

      const actions = el('div', { className: 'em-list-item-actions' });
      const editBtn = el('button', { className: 'em-icon-btn', innerHTML: '✏️' });
      editBtn.addEventListener('click', (e) => { e.stopPropagation(); close(); openAddBookDialog(dm, book, () => openBookList(dm)); });
      actions.appendChild(editBtn);
      item.appendChild(actions);

      item.addEventListener('click', () => { close(); openAddBookDialog(dm, book, () => openBookList(dm)); });
      listWrap.appendChild(item);
    });
  };

  addBtn.addEventListener('click', () => { close(); openAddBookDialog(dm, null, () => openBookList(dm)); });
  refresh();
}

// ---- Reading Log ----
function openReadlogDashboard(dm) {
  const { body, close } = createModal('Reading Log', '📒', { noFooter: true });

  body.appendChild(dashboardGrid([
    { icon: '➕', label: 'Add Entry', className: 'book', onClick: () => { close(); openAddReadlogDialog(dm, null, () => openReadlogDashboard(dm)); } },
    { icon: '📋', label: 'View Entries', className: 'book', onClick: () => { close(); openReadlogList(dm); } },
  ]));

  const backBtn = el('button', { className: 'em-back-btn' });
  backBtn.innerHTML = '← Books';
  backBtn.style.marginTop = '14px';
  backBtn.addEventListener('click', () => { close(); openBooksDashboard(dm); });
  body.appendChild(backBtn);
}

function openAddReadlogDialog(dm, existing, onSave) {
  const isEdit = !!existing;
  const { body, footer, close } = createModal(isEdit ? 'Edit Reading Entry' : 'Add Reading Entry', '📒', { large: true });

  const entry = existing || {};
  const bookSelect = el('select');
  const startTimeIn = timeInput(entry.startTime || '');
  const startPageIn = numberInput('Page #', entry.startPage || '');
  const endTimeIn = timeInput(entry.endTime || '');
  const endPageIn = numberInput('Page #', entry.endPage || '');

  // Auto-calc display
  const calcDisplay = el('div', { className: 'em-calc-display' });
  calcDisplay.innerHTML = '<span>Pages Read: <strong id="em-pages-read">–</strong></span><span>Duration: <strong id="em-duration">–</strong></span>';

  const updateCalc = () => {
    const sp = parseInt(startPageIn.value) || 0;
    const ep = parseInt(endPageIn.value) || 0;
    const pagesRead = ep > sp ? ep - sp : 0;
    const dur = timeDiff(startTimeIn.value, endTimeIn.value);
    const pEl = calcDisplay.querySelector('#em-pages-read');
    const dEl = calcDisplay.querySelector('#em-duration');
    if (pEl) pEl.textContent = pagesRead > 0 ? pagesRead : '–';
    if (dEl) dEl.textContent = dur || '–';
  };

  [startTimeIn, endTimeIn, startPageIn, endPageIn].forEach(i => i.addEventListener('change', updateCalc));
  [startPageIn, endPageIn].forEach(i => i.addEventListener('input', updateCalc));

  const ratingWrap = el('div', { className: 'em-form-group' });
  ratingWrap.appendChild(el('label', { textContent: 'Rating' }));
  const starRating = starRatingInput(entry.rating || 0);
  ratingWrap.appendChild(starRating);
  const commentsIn = textArea('Comments...', entry.comments || '');

  const populateBooks = async () => {
    const all = await dm.getAllBooks();
    bookSelect.innerHTML = '<option value="">Select book...</option>';
    all.forEach(b => {
      const o = el('option', { value: b.id, textContent: b.title });
      if (b.id === entry.bookId) o.selected = true;
      bookSelect.appendChild(o);
    });
  };

  body.appendChild(formGroup('Book', bookSelect));

  const row1 = el('div', { className: 'em-form-row' });
  row1.appendChild(formGroup('Start Time', startTimeIn));
  row1.appendChild(formGroup('Starting Page', startPageIn));
  body.appendChild(row1);

  const row2 = el('div', { className: 'em-form-row' });
  row2.appendChild(formGroup('End Time', endTimeIn));
  row2.appendChild(formGroup('Ending Page', endPageIn));
  body.appendChild(row2);

  body.appendChild(calcDisplay);
  body.appendChild(ratingWrap);
  body.appendChild(formGroup('Comments', commentsIn));

  populateBooks();
  if (entry.startTime || entry.endTime) updateCalc();

  const saveBtn = el('button', { className: 'em-btn em-btn-primary', textContent: isEdit ? '💾 Save' : '✅ Add Entry' });
  const cancelBtn = el('button', { className: 'em-btn em-btn-secondary', textContent: 'Cancel' });
  cancelBtn.addEventListener('click', close);

  saveBtn.addEventListener('click', async () => {
    const sp = parseInt(startPageIn.value) || 0;
    const ep = parseInt(endPageIn.value) || 0;
    const newEntry = {
      id: entry.id || generateId(),
      bookId: bookSelect.value,
      bookTitle: bookSelect.options[bookSelect.selectedIndex]?.text || '',
      startTime: startTimeIn.value,
      startPage: startPageIn.value,
      endTime: endTimeIn.value,
      endPage: endPageIn.value,
      pagesRead: ep > sp ? ep - sp : 0,
      duration: timeDiff(startTimeIn.value, endTimeIn.value),
      rating: starRating.getRating(),
      comments: commentsIn.value,
    };
    if (isEdit) await dm.updateReadEntry(newEntry);
    else await dm.addReadEntry(newEntry);
    new Notice('Reading entry saved!');
    close();
    if (onSave) onSave();
  });

  footer.appendChild(cancelBtn);
  footer.appendChild(saveBtn);
}

function openReadlogList(dm) {
  const { body, close } = createModal('Reading Log Entries', '📒', { large: true, noFooter: true });

  const backBtn = el('button', { className: 'em-back-btn' });
  backBtn.innerHTML = '← Reading Log';
  backBtn.addEventListener('click', () => { close(); openReadlogDashboard(dm); });

  const addBtn = el('button', { className: 'em-btn em-btn-primary', innerHTML: '➕ Add Entry' });

  const topRow = el('div', { className: 'em-back-row' });
  topRow.appendChild(backBtn);
  topRow.appendChild(addBtn);
  body.appendChild(topRow);

  const listWrap = el('div', { className: 'em-scroll-list' });
  body.appendChild(listWrap);

  const refresh = async () => {
    listWrap.innerHTML = '';
    const logs = await dm.getReadlog();
    if (!logs.length) { listWrap.appendChild(emptyState('📒', 'No reading entries yet')); return; }
    logs.slice().reverse().forEach(entry => {
      const item = el('div', { className: 'em-log-item' });
      const info = el('div', { className: 'em-log-info' });
      info.appendChild(el('div', { className: 'em-log-title', textContent: entry.bookTitle }));

      const calc = el('div', { className: 'em-calc-display', style: 'margin-top:6px;padding:6px 10px;font-size:0.78rem;' });
      calc.innerHTML = `Pages Read: <strong>${entry.pagesRead || '–'}</strong> &nbsp;|&nbsp; Duration: <strong>${entry.duration || '–'}</strong>`;
      info.appendChild(calc);

      info.appendChild(el('div', { className: 'em-log-sub', textContent: `Pages ${entry.startPage || '?'} → ${entry.endPage || '?'} · ${entry.startTime || ''} – ${entry.endTime || ''}` }));
      if (entry.comments) info.appendChild(el('div', { className: 'em-log-sub', textContent: entry.comments }));

      const stars = el('div', { className: 'em-log-stars', innerHTML: starsHtml(entry.rating) });

      const actions = el('div', { className: 'em-list-item-actions' });
      const editBtn = el('button', { className: 'em-icon-btn', innerHTML: '✏️' });
      editBtn.addEventListener('click', () => { close(); openAddReadlogDialog(dm, entry, () => openReadlogList(dm)); });
      const delBtn = el('button', { className: 'em-icon-btn danger', innerHTML: '🗑️' });
      delBtn.addEventListener('click', async () => {
        if (confirm('Delete this entry?')) { await dm.deleteReadEntry(entry.id); refresh(); }
      });
      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      item.appendChild(info);
      item.appendChild(stars);
      item.appendChild(actions);
      listWrap.appendChild(item);
    });
  };

  addBtn.addEventListener('click', () => { close(); openAddReadlogDialog(dm, null, () => openReadlogList(dm)); });
  refresh();
}

// ============================================================
//  MAIN PLUGIN CLASS
// ============================================================

class EntertainmentMasterPlugin extends Plugin {
  async onload() {
    console.log('Entertainment Master: Loading...');

    this.dm = new DataManager(this.app);

    // Load stylesheet
    this.addStyle();

    // Ribbon icon
    this.addRibbonIcon('clapperboard', 'Entertainment Master', () => {
      openMainDashboard(this.dm);
    });

    // Command palette
    this.addCommand({
      id: 'open-entertainment-master',
      name: 'Open Entertainment Master',
      callback: () => openMainDashboard(this.dm),
    });

    this.addCommand({
      id: 'open-tv-module',
      name: 'Open TV Series Module',
      callback: () => openTVDashboard(this.dm),
    });

    this.addCommand({
      id: 'open-movies-module',
      name: 'Open Movies Module',
      callback: () => openMovieDashboard(this.dm),
    });

    this.addCommand({
      id: 'open-books-module',
      name: 'Open Books Module',
      callback: () => openBooksDashboard(this.dm),
    });

    console.log('Entertainment Master: Loaded!');
  }

  addStyle() {
    // Styles are loaded via styles.css automatically by Obsidian
  }

  onunload() {
    console.log('Entertainment Master: Unloaded.');
  }
}

module.exports = EntertainmentMasterPlugin;
