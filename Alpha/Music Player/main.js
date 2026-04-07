const { Plugin, ItemView, WorkspaceLeaf, Notice, TFile, TFolder } = require('obsidian');

const VIEW_TYPE_MUSIC_PLAYER = "music-player-view";

module.exports = class MusicPlayerPlugin extends Plugin {
	async onload() {
		console.log("Loading Music Player Plugin...");

		// Register the View
		this.registerView(
			VIEW_TYPE_MUSIC_PLAYER,
			(leaf) => new MusicPlayerView(leaf)
		);

		// Add Ribbon Icon
		this.addRibbonIcon('music', 'Open Music Player', () => {
			this.activateView();
		});
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_MUSIC_PLAYER);

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			leaf = workspace.getRightLeaf(false);
			await leaf.setViewState({ type: VIEW_TYPE_MUSIC_PLAYER, active: true });
		}

		workspace.revealLeaf(leaf);
	}
};

class MusicPlayerView extends ItemView {
	constructor(leaf) {
		super(leaf);
		this.playlist = [];
		this.currentTrackIndex = 0;
		this.isPlaying = false;
		this.isShuffle = false;
		this.audioEl = null; // Will hold the HTML Audio Element
	}

	getViewType() {
		return VIEW_TYPE_MUSIC_PLAYER;
	}

	getDisplayText() {
		return "Music Player";
	}

	getIcon() {
		return "music";
	}

	async onOpen() {
		const container = this.contentEl;
		container.empty();
		container.classList.add('music-player-container');

		// 1. Create Audio Element (Hidden)
		this.audioEl = container.createEl('audio');
		this.audioEl.addEventListener('ended', () => this.playNext());
		this.audioEl.addEventListener('error', (e) => console.error("Audio Error:", e));

		// 2. Build UI
		this.buildUI(container);

		// 3. Load Files
		await this.loadMusic();
	}

	buildUI(container) {
		// Title
		this.titleEl = container.createEl('div', { cls: 'mp-title', text: 'Select a track...' });

		// Controls
		const controlsEl = container.createEl('div', { cls: 'mp-controls' });

		// Shuffle
		this.shuffleBtn = controlsEl.createEl('button', { cls: 'mp-btn', text: '🔀' });
		this.shuffleBtn.onclick = () => this.toggleShuffle();

		// Prev
		const prevBtn = controlsEl.createEl('button', { cls: 'mp-btn', text: '⏮' });
		prevBtn.onclick = () => this.playPrevious();

		// Play/Pause
		this.playBtn = controlsEl.createEl('button', { cls: 'mp-btn', text: '▶' });
		this.playBtn.onclick = () => this.togglePlay();

		// Next
		const nextBtn = controlsEl.createEl('button', { cls: 'mp-btn', text: '⏭' });
		nextBtn.onclick = () => this.playNext();

		// Playlist Container
		this.playlistEl = container.createEl('div', { cls: 'mp-playlist' });
	}

	async loadMusic() {
		const folderPath = "Resources/Music";
		const folder = this.app.vault.getAbstractFileByPath(folderPath);

		if (!folder || !(folder instanceof TFolder)) {
			this.titleEl.textContent = `Folder "${folderPath}" not found.`;
			return;
		}

		// Recursive function to find mp3s
		const findMp3s = (folderItem) => {
			let results = [];
			if (folderItem.children) {
				for (const child of folderItem.children) {
					if (child instanceof TFile && child.extension === 'mp3') {
						results.push(child);
					} else if (child instanceof TFolder) {
						results = results.concat(findMp3s(child));
					}
				}
			}
			return results;
		};

		this.playlist = findMp3s(folder);

		if (this.playlist.length === 0) {
			this.titleEl.textContent = "No MP3 files found.";
		} else {
			this.renderPlaylist();
			// Pre-load first track info (don't play)
			this.loadTrack(0, false);
		}
	}

	renderPlaylist() {
		this.playlistEl.empty();
		
		this.playlist.forEach((file, index) => {
			const item = this.playlistEl.createEl('div', { 
				cls: 'mp-playlist-item', 
				text: file.name 
			});
			
			if (index === this.currentTrackIndex) {
				item.classList.add('is-active-track');
			}

			item.onclick = () => {
				this.currentTrackIndex = index;
				this.loadTrack(index, true);
			};
		});
	}

	loadTrack(index, autoPlay) {
		if (this.playlist.length === 0) return;

		const file = this.playlist[index];
		const resourcePath = this.app.vault.adapter.getResourcePath(file.path);
		
		this.audioEl.src = resourcePath;
		this.titleEl.textContent = file.name;
		
		// Update Visuals
		const items = this.playlistEl.querySelectorAll('.mp-playlist-item');
		items.forEach(i => i.classList.remove('is-active-track'));
		if (items[index]) items[index].classList.add('is-active-track');

		if (autoPlay) {
			this.audioEl.play().catch(e => console.error("Playback failed:", e));
			this.isPlaying = true;
			this.playBtn.textContent = '⏸';
		} else {
			this.isPlaying = false;
			this.playBtn.textContent = '▶';
		}
	}

	togglePlay() {
		if (this.playlist.length === 0) return;

		if (this.audioEl.paused) {
			this.audioEl.play();
			this.isPlaying = true;
			this.playBtn.textContent = '⏸';
		} else {
			this.audioEl.pause();
			this.isPlaying = false;
			this.playBtn.textContent = '▶';
		}
	}

	playNext() {
		if (this.playlist.length === 0) return;

		if (this.isShuffle) {
			this.currentTrackIndex = Math.floor(Math.random() * this.playlist.length);
		} else {
			this.currentTrackIndex++;
			if (this.currentTrackIndex >= this.playlist.length) {
				this.currentTrackIndex = 0;
			}
		}
		this.loadTrack(this.currentTrackIndex, true);
	}

	playPrevious() {
		if (this.playlist.length === 0) return;

		if (this.audioEl.currentTime > 3) {
			this.audioEl.currentTime = 0;
		} else {
			this.currentTrackIndex--;
			if (this.currentTrackIndex < 0) {
				this.currentTrackIndex = this.playlist.length - 1;
			}
			this.loadTrack(this.currentTrackIndex, true);
		}
	}

	toggleShuffle() {
		this.isShuffle = !this.isShuffle;
		if (this.isShuffle) {
			this.shuffleBtn.classList.add('btn-active');
		} else {
			this.shuffleBtn.classList.remove('btn-active');
		}
	}
}