'use strict';

var obsidian = require('obsidian');

const GENRES = [
	"Action", "Adventure", "Animation", "Anime", "Biography", "Comedy",
	"Crime", "Documentary", "Drama", "Fantasy", "Food", "Game Show",
	"History", "Horror", "Kids", "Medical", "Music", "Mystery",
	"Nature", "News", "Reality", "Romance", "Sci-Fi", "Soap",
	"Sport", "Supernatural", "Talk Show", "Thriller", "Travel", "Western"
];

const STATUSES = ["In Production", "On-Going", "On-Hold", "Canceled", "Ended"];
const CONTENT_RATINGS = ["TV-G", "TV-PG", "TV-14", "TV-R", "TV-MA"];
const DB_FOLDER = "_system/Database/Entertainment/TV";

// ─── Utility ────────────────────────────────────────────────────────────────

function slugify(str) {
	return str
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.trim();
}

function formatDate(dateStr) {
	if (!dateStr) return '';
	return dateStr; // already YYYY-MM-DD from <input type="date">
}

function buildFrontmatter(data) {
	const lines = ['---'];
	const add = (key, val) => {
		if (val !== null && val !== undefined && val !== '') {
			lines.push(`${key}: ${val}`);
		}
	};

	add('series', JSON.stringify(data.series));
	add('created_by', JSON.stringify(data.createdBy));
	add('premiere_date', data.premiereDate);
	add('status', JSON.stringify(data.status));
	add('total_seasons', data.totalSeasons || '');
	add('total_episodes', data.totalEpisodes || '');
	add('finale_date', data.finaleDate);
	add('genre', JSON.stringify(data.genre));
	add('content_rating', JSON.stringify(data.contentRating));
	add('original_network', JSON.stringify(data.originalNetwork));
	add('where_to_watch', JSON.stringify(data.whereToWatch));
	add('type', '"TV Series"');
	if (data.logoFilename) {
		add('series_logo', JSON.stringify(data.logoFilename));
	}
	lines.push('---');
	return lines.join('\n');
}

function buildNoteBody(data) {
	const lines = [];

	// Logo banner
	if (data.logoFilename) {
		lines.push(`![[${data.logoFilename}]]`);
		lines.push('');
	}

	lines.push(`# ${data.series}`);
	lines.push('');

	// Info table
	lines.push('## Series Info');
	lines.push('');
	lines.push('| Field | Value |');
	lines.push('|---|---|');
	if (data.createdBy)        lines.push(`| **Created By** | ${data.createdBy} |`);
	if (data.premiereDate)     lines.push(`| **Series Premiere** | ${data.premiereDate} |`);
	if (data.status)           lines.push(`| **Status** | ${data.status} |`);
	if (data.totalSeasons)     lines.push(`| **Total Seasons** | ${data.totalSeasons} |`);
	if (data.totalEpisodes)    lines.push(`| **Total Episodes** | ${data.totalEpisodes} |`);
	if (data.finaleDate)       lines.push(`| **Series Finale** | ${data.finaleDate} |`);
	if (data.genre)            lines.push(`| **Genre** | ${data.genre} |`);
	if (data.contentRating)    lines.push(`| **Content Rating** | ${data.contentRating} |`);
	if (data.originalNetwork)  lines.push(`| **Original Network** | ${data.originalNetwork} |`);
	if (data.whereToWatch)     lines.push(`| **Where to Watch** | ${data.whereToWatch} |`);
	lines.push('');

	if (data.synopsis) {
		lines.push('## Synopsis');
		lines.push('');
		lines.push(data.synopsis);
		lines.push('');
	}

	lines.push('## Notes');
	lines.push('');

	return lines.join('\n');
}

// ─── Modal ───────────────────────────────────────────────────────────────────

class TVSeriesModal extends obsidian.Modal {
	constructor(app) {
		super(app);
		this.logoFile = null;
		this.logoDataUrl = null;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('tv-series-modal');

		// Header
		const header = contentEl.createDiv('tsdb-header');
		header.createEl('div', { cls: 'tsdb-header-icon', text: '📺' });
		header.createEl('h2', { text: 'Add TV Series', cls: 'tsdb-title' });
		header.createEl('p', { text: 'Add a new TV series to your database', cls: 'tsdb-subtitle' });

		const form = contentEl.createDiv('tsdb-form');

		// ── Series Title
		this._field(form, 'Series Title *', (wrap) => {
			this.seriesInput = wrap.createEl('input', {
				type: 'text',
				placeholder: 'e.g. Breaking Bad',
				cls: 'tsdb-input'
			});
		});

		// ── Created By
		this._field(form, 'Created By', (wrap) => {
			this.createdByInput = wrap.createEl('input', {
				type: 'text',
				placeholder: 'e.g. Vince Gilligan',
				cls: 'tsdb-input'
			});
		});

		// ── Two columns: Premiere + Status
		const row1 = form.createDiv('tsdb-row');
		this._field(row1, 'Series Premiere Date', (wrap) => {
			this.premiereDateInput = wrap.createEl('input', { type: 'date', cls: 'tsdb-input' });
		});
		this._field(row1, 'Status', (wrap) => {
			this.statusSelect = wrap.createEl('select', { cls: 'tsdb-select' });
			this.statusSelect.createEl('option', { value: '', text: '— Select status —' });
			STATUSES.forEach(s => this.statusSelect.createEl('option', { value: s, text: s }));
		});

		// ── Two columns: Seasons + Episodes
		const row2 = form.createDiv('tsdb-row');
		this._field(row2, 'Total Seasons', (wrap) => {
			this.totalSeasonsInput = wrap.createEl('input', {
				type: 'number',
				placeholder: '0',
				cls: 'tsdb-input',
				attr: { min: '0' }
			});
		});
		this._field(row2, 'Total Episodes', (wrap) => {
			this.totalEpisodesInput = wrap.createEl('input', {
				type: 'number',
				placeholder: '0',
				cls: 'tsdb-input',
				attr: { min: '0' }
			});
		});

		// ── Finale Date
		this._field(form, 'Series Finale Date', (wrap) => {
			this.finaleDateInput = wrap.createEl('input', { type: 'date', cls: 'tsdb-input' });
		});

		// ── Two columns: Genre + Content Rating
		const row3 = form.createDiv('tsdb-row');
		this._field(row3, 'Genre', (wrap) => {
			this.genreSelect = wrap.createEl('select', { cls: 'tsdb-select' });
			this.genreSelect.createEl('option', { value: '', text: '— Select genre —' });
			GENRES.forEach(g => this.genreSelect.createEl('option', { value: g, text: g }));
		});
		this._field(row3, 'Content Rating', (wrap) => {
			this.contentRatingSelect = wrap.createEl('select', { cls: 'tsdb-select' });
			this.contentRatingSelect.createEl('option', { value: '', text: '— Select rating —' });
			CONTENT_RATINGS.forEach(r => this.contentRatingSelect.createEl('option', { value: r, text: r }));
		});

		// ── Two columns: Network + Where to Watch
		const row4 = form.createDiv('tsdb-row');
		this._field(row4, 'Original Network', (wrap) => {
			this.networkInput = wrap.createEl('input', {
				type: 'text',
				placeholder: 'e.g. AMC',
				cls: 'tsdb-input'
			});
		});
		this._field(row4, 'Where to Watch', (wrap) => {
			this.whereToWatchInput = wrap.createEl('input', {
				type: 'text',
				placeholder: 'e.g. Netflix, Hulu',
				cls: 'tsdb-input'
			});
		});

		// ── Synopsis
		this._field(form, 'Series Synopsis', (wrap) => {
			this.synopsisInput = wrap.createEl('textarea', {
				placeholder: 'Enter a brief synopsis of the series…',
				cls: 'tsdb-textarea'
			});
		});

		// ── Series Logo
		this._field(form, 'Series Logo', (wrap) => {
			const logoWrap = wrap.createDiv('tsdb-logo-wrap');

			this.logoPreview = logoWrap.createEl('div', { cls: 'tsdb-logo-preview tsdb-logo-empty' });
			this.logoPreview.createEl('span', { text: '🖼', cls: 'tsdb-logo-placeholder-icon' });
			this.logoPreview.createEl('span', { text: 'No image selected', cls: 'tsdb-logo-placeholder-text' });

			const logoActions = logoWrap.createDiv('tsdb-logo-actions');

			// Hidden file input
			this.logoFileInput = logoWrap.createEl('input', {
				type: 'file',
				cls: 'tsdb-file-input-hidden',
				attr: { accept: 'image/*' }
			});
			this.logoFileInput.addEventListener('change', (e) => {
				const file = e.target.files[0];
				if (file) this._handleLogoFile(file);
			});

			const pickBtn = logoActions.createEl('button', {
				text: '📁 Choose Image',
				cls: 'tsdb-btn tsdb-btn-secondary'
			});
			pickBtn.type = 'button';
			pickBtn.addEventListener('click', () => this.logoFileInput.click());

			const clearBtn = logoActions.createEl('button', {
				text: '✕ Clear',
				cls: 'tsdb-btn tsdb-btn-ghost'
			});
			clearBtn.type = 'button';
			clearBtn.addEventListener('click', () => this._clearLogo());

			// Paste hint
			wrap.createEl('p', {
				text: 'You can also paste an image (Ctrl/Cmd+V) anywhere in this dialog.',
				cls: 'tsdb-hint'
			});
		});

		// ── Buttons
		const btnRow = form.createDiv('tsdb-btn-row');

		const cancelBtn = btnRow.createEl('button', { text: 'Cancel', cls: 'tsdb-btn tsdb-btn-ghost' });
		cancelBtn.type = 'button';
		cancelBtn.addEventListener('click', () => this.close());

		const saveBtn = btnRow.createEl('button', { text: '💾 Save to Database', cls: 'tsdb-btn tsdb-btn-primary' });
		saveBtn.type = 'button';
		saveBtn.addEventListener('click', () => this._onSave());

		// ── Paste listener
		this._pasteHandler = (e) => {
			const items = e.clipboardData?.items;
			if (!items) return;
			for (const item of items) {
				if (item.type.startsWith('image/')) {
					const file = item.getAsFile();
					if (file) this._handleLogoFile(file);
					e.preventDefault();
					break;
				}
			}
		};
		document.addEventListener('paste', this._pasteHandler);
	}

	onClose() {
		document.removeEventListener('paste', this._pasteHandler);
		this.contentEl.empty();
	}

	// ── Helpers

	_field(parent, label, buildFn) {
		const wrap = parent.createDiv('tsdb-field');
		wrap.createEl('label', { text: label, cls: 'tsdb-label' });
		buildFn(wrap);
		return wrap;
	}

	_handleLogoFile(file) {
		this.logoFile = file;
		const reader = new FileReader();
		reader.onload = (e) => {
			this.logoDataUrl = e.target.result;
			this._renderLogoPreview();
		};
		reader.readAsDataURL(file);
	}

	_renderLogoPreview() {
		this.logoPreview.empty();
		this.logoPreview.removeClass('tsdb-logo-empty');
		this.logoPreview.addClass('tsdb-logo-has-image');
		const img = this.logoPreview.createEl('img', { cls: 'tsdb-logo-img' });
		img.src = this.logoDataUrl;
	}

	_clearLogo() {
		this.logoFile = null;
		this.logoDataUrl = null;
		this.logoPreview.empty();
		this.logoPreview.removeClass('tsdb-logo-has-image');
		this.logoPreview.addClass('tsdb-logo-empty');
		this.logoPreview.createEl('span', { text: '🖼', cls: 'tsdb-logo-placeholder-icon' });
		this.logoPreview.createEl('span', { text: 'No image selected', cls: 'tsdb-logo-placeholder-text' });
		this.logoFileInput.value = '';
	}

	async _onSave() {
		const series = this.seriesInput.value.trim();
		if (!series) {
			new obsidian.Notice('⚠️ Series title is required.');
			this.seriesInput.focus();
			return;
		}

		const data = {
			series,
			createdBy: this.createdByInput.value.trim(),
			premiereDate: formatDate(this.premiereDateInput.value),
			status: this.statusSelect.value,
			totalSeasons: this.totalSeasonsInput.value,
			totalEpisodes: this.totalEpisodesInput.value,
			finaleDate: formatDate(this.finaleDateInput.value),
			genre: this.genreSelect.value,
			contentRating: this.contentRatingSelect.value,
			originalNetwork: this.networkInput.value.trim(),
			whereToWatch: this.whereToWatchInput.value.trim(),
			synopsis: this.synopsisInput.value.trim(),
			logoFilename: null
		};

		try {
			// Ensure folder exists
			await this._ensureFolder(DB_FOLDER);

			// Save logo if present
			if (this.logoFile && this.logoDataUrl) {
				const ext = this.logoFile.name.split('.').pop() || 'png';
				const logoName = `${slugify(series)}-logo.${ext}`;
				const logoPath = `${DB_FOLDER}/${logoName}`;
				const arrayBuffer = await this.logoFile.arrayBuffer();
				const existing = this.app.vault.getAbstractFileByPath(logoPath);
				if (existing) {
					await this.app.vault.modifyBinary(existing, arrayBuffer);
				} else {
					await this.app.vault.createBinary(logoPath, arrayBuffer);
				}
				data.logoFilename = logoName;
			}

			// Build and save note
			const frontmatter = buildFrontmatter(data);
			const body = buildNoteBody(data);
			const noteContent = `${frontmatter}\n${body}`;

			const filename = `${slugify(series)}.md`;
			const notePath = `${DB_FOLDER}/${filename}`;

			const existingNote = this.app.vault.getAbstractFileByPath(notePath);
			if (existingNote) {
				const answer = await this._confirm(
					`A note for "${series}" already exists. Overwrite it?`
				);
				if (!answer) return;
				await this.app.vault.modify(existingNote, noteContent);
			} else {
				await this.app.vault.create(notePath, noteContent);
			}

			new obsidian.Notice(`✅ "${series}" saved to TV database!`);
			this.close();

			// Open the new note
			const file = this.app.vault.getAbstractFileByPath(notePath);
			if (file) {
				const leaf = this.app.workspace.getLeaf(false);
				await leaf.openFile(file);
			}

		} catch (err) {
			console.error('[TV Series DB]', err);
			new obsidian.Notice(`❌ Error saving: ${err.message}`);
		}
	}

	async _ensureFolder(path) {
		const parts = path.split('/');
		let current = '';
		for (const part of parts) {
			current = current ? `${current}/${part}` : part;
			const existing = this.app.vault.getAbstractFileByPath(current);
			if (!existing) {
				await this.app.vault.createFolder(current);
			}
		}
	}

	_confirm(message) {
		return new Promise((resolve) => {
			const modal = new ConfirmModal(this.app, message, resolve);
			modal.open();
		});
	}
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

class ConfirmModal extends obsidian.Modal {
	constructor(app, message, callback) {
		super(app);
		this.message = message;
		this.callback = callback;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.addClass('tsdb-confirm-modal');
		contentEl.createEl('p', { text: this.message, cls: 'tsdb-confirm-message' });

		const btnRow = contentEl.createDiv('tsdb-btn-row');

		const noBtn = btnRow.createEl('button', { text: 'Cancel', cls: 'tsdb-btn tsdb-btn-ghost' });
		noBtn.addEventListener('click', () => { this.callback(false); this.close(); });

		const yesBtn = btnRow.createEl('button', { text: 'Overwrite', cls: 'tsdb-btn tsdb-btn-danger' });
		yesBtn.addEventListener('click', () => { this.callback(true); this.close(); });
	}

	onClose() { this.contentEl.empty(); }
}

// ─── Plugin ───────────────────────────────────────────────────────────────────

class TVSeriesDBPlugin extends obsidian.Plugin {
	async onload() {
		// Ribbon icon — use 'tv' lucide icon; fallback to monitor
		this.addRibbonIcon('monitor-play', 'Add TV Series', () => {
			new TVSeriesModal(this.app).open();
		});

		// Command palette
		this.addCommand({
			id: 'open-tv-series-dialog',
			name: 'Add TV Series to Database',
			callback: () => {
				new TVSeriesModal(this.app).open();
			}
		});
	}

	onunload() {}
}

module.exports = TVSeriesDBPlugin;
