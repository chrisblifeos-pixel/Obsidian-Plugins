# Canvas to Markdown — Obsidian Plugin

Convert your Obsidian Canvas (`.canvas`) files into fully readable Markdown notes.  
**Works on Android mobile** — no desktop required.

---

## Installation (Android / Mobile)

1. In your Obsidian vault, open the file manager app and navigate to:
   ```
   <YourVault>/.obsidian/plugins/
   ```
2. Create a new folder named exactly:
   ```
   canvas-to-markdown
   ```
3. Copy these three files into that folder:
   - `main.js`
   - `manifest.json`
   - `styles.css`

4. In Obsidian → **Settings → Community plugins** → disable Safe mode (if prompted).
5. Find **"Canvas to Markdown"** in the list of installed plugins and toggle it **on**.

> **Tip for Android**: Use a file manager app like **Files by Google**, **Solid Explorer**, or **MiXplorer** to paste the files. You can also use the [**Termux**](https://termux.dev) terminal.

---

## Usage

### Method 1 — Command Palette (recommended on mobile)
1. Open a `.canvas` file in Obsidian.
2. Tap the **Command Palette** (swipe from bottom, or press the ribbon icon).
3. Run: **"Save active canvas to Markdown note"**

### Method 2 — Long-press / Right-click in File Explorer
1. In the file explorer, **long-press** any `.canvas` file.
2. Tap **"Save canvas to Markdown"** from the context menu.

### Method 3 — Convert everything at once
- Command Palette → **"Save ALL canvas files to Markdown notes"**

---

## What gets exported

| Canvas element | Exported as |
|---|---|
| Text cards | `## Cards` section, one sub-heading per card |
| Groups | `## Groups` section listing member cards |
| File nodes (images, notes) | `## Embedded Files` with `![[…]]` or link |
| Web link nodes | `## Web Links` as clickable Markdown links |
| Arrows / connections | `## Connections` table (From → Label → To) |
| YAML frontmatter | Source canvas path, export date, node count |

---

## Settings

Open **Settings → Canvas to Markdown**:

| Setting | Description |
|---|---|
| Output folder | Where to save `.md` files (empty = same folder as canvas) |
| Include card text | Toggle text card export |
| Include web links | Toggle URL node export |
| Include groups | Toggle group section |
| Include file embeds | Toggle embedded file links |
| Add YAML frontmatter | Prepend metadata block |
| Link style | `[[Wikilink]]` or `[Markdown](link)` |
| Section separator | Characters between sections (default `---`) |
| Overwrite existing | Auto-overwrite or prompt |

---

## Example output

Given a canvas named `Project Ideas.canvas`, the plugin creates  
`Project Ideas.md` containing:

```markdown
---
source_canvas: "Project Ideas.canvas"
generated: "2026-04-29 14:32"
canvas_nodes: 8
canvas_edges: 3
---

# Project Ideas

> Exported from canvas `Project Ideas.canvas`

## Groups

### Research Phase

*Contains 2 card(s)*

- Look into competitor pricing
- Interview 5 users

---

## Cards

### Card *(in: Research Phase)*

Look into competitor pricing

Find the top 3 competitors and note their pricing tiers.

### Card

Ship v1 by end of Q2

---

## Web Links

- [https://example.com](https://example.com)

---

## Connections

| From | Label | To |
|------|-------|----|
| Look into competitor pricing | informs | Ship v1 by end of Q2 |
```

---

## Troubleshooting

**Plugin doesn't appear in the list**  
→ Make sure the folder is named `canvas-to-markdown` (exact match) and contains all three files.

**"Invalid canvas JSON" error**  
→ The canvas file may be corrupted. Try opening it in Obsidian first to confirm it loads.

**Output file not created**  
→ Check that Obsidian has storage permissions on Android (Settings → Apps → Obsidian → Permissions).

---

## Version history

- **1.0.0** — Initial release. Full canvas export with groups, cards, links, embeds, connections.
