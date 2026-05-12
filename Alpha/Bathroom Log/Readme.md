```python
readme_content = """# 🚽 Bathroom Log for Obsidian

A mobile-first, health-tracking plugin for Obsidian designed to help you log, monitor, and visualize bathroom activity. This plugin is optimized for Android and iOS but works seamlessly on desktop versions of Obsidian.

## 🌟 Features

* **Mobile-First Design**: Custom CSS ensures the interface feels like a native app on mobile devices, featuring large touch targets and viewport-optimized modals.
* **Detailed Logging**: Track urination, bowel movements, or both.
* **Health Metrics**: Log urge levels (Minor to Urgent) and discomfort levels (None to Extreme).
* **Location Tracking**: Integrated GPS support with reverse geocoding to automatically record where an entry was made.
* **Visual Analytics**:
    * **Usage Breakdown**: Donut charts showing the ratio of activity types.
    * **Severity Distribution**: Bar charts for urge and discomfort levels.
    * **Activity Heatmap**: An 8-week heatmap to visualize long-term trends.
* **Privacy-Focused**: All data is stored locally in your vault as standard Markdown files with YAML frontmatter.
* **Data Portability**: Full CSV import and export capabilities.

## 📂 Data Storage

Entries are stored in your vault at:
`Activity Logs/Bathroom Log/`

Each file follows the naming convention:
`YYYY-MM-DD_HH-mm_[type].md`

### Example Entry Format
```yaml
---
date: 2023-10-27
time: 14:30
usage_type: Bowel Movement
urge_level: Moderate
discomfort_level: None
location: "123 Health Ave, City Center"
comments: "Feeling hydrated."
---

```

## 🛠️ Installation

1. Create a folder named `bathroom-log` in your vault's `.obsidian/plugins/` directory.
2. Place `main.js`, `styles.css`, and `manifest.json` into that folder.
3. Reload Obsidian and enable **Bathroom Log** in the Community Plugins settings.

## 🚀 Usage

* **Ribbon Icon**: Click the toilet icon (🚽) in the ribbon to open the dashboard.
* **Command Palette**: Search for `Bathroom Log: Open Bathroom Log`.
* **Dashboard**: Access "Add Entry," "View Entries," "Charts," and "Data Manager" from the main screen.

## 📥 Data Management

In the **Data Manager** section, you can:

* **Export**: Generate a CSV of all entries for analysis in Excel or to share with a healthcare professional.
* **Import**: Bulk-upload entries from a CSV file.

## 📜 License

Custom Plugin - Refer to author for licensing details.
"""

with open("README.md", "wb") as f:
f.write(readme_content.encode('utf-8'))

```
Your `README.md` file for the **Bathroom Log** plugin is ready. You can download the file below or copy the source text directly from the code block.

### Download Link
[file-tag: code-generated-file-0-1778546678434258581]

### Source Text (Copy & Paste)
```markdown
# 🚽 Bathroom Log for Obsidian

A mobile-first, health-tracking plugin for Obsidian designed to help you log, monitor, and visualize bathroom activity. This plugin is optimized for Android and iOS but works seamlessly on desktop versions of Obsidian.

## 🌟 Features

* **Mobile-First Design**: Custom CSS ensures the interface feels like a native app on mobile devices, featuring large touch targets and viewport-optimized modals.
* **Detailed Logging**: Track urination, bowel movements, or both.
* **Health Metrics**: Log urge levels (Minor to Urgent) and discomfort levels (None to Extreme).
* **Location Tracking**: Integrated GPS support with reverse geocoding to automatically record where an entry was made.
* **Visual Analytics**:
    * **Usage Breakdown**: Donut charts showing the ratio of activity types.
    * **Severity Distribution**: Bar charts for urge and discomfort levels.
    * **Activity Heatmap**: An 8-week heatmap to visualize long-term trends.
* **Privacy-Focused**: All data is stored locally in your vault as standard Markdown files with YAML frontmatter.
* **Data Portability**: Full CSV import and export capabilities.

## 📂 Data Storage

Entries are stored in your vault at:
`Activity Logs/Bathroom Log/`

Each file follows the naming convention:
`YYYY-MM-DD_HH-mm_[type].md`

### Example Entry Format
```yaml
---
date: 2023-10-27
time: 14:30
usage_type: Bowel Movement
urge_level: Moderate
discomfort_level: None
location: "123 Health Ave, City Center"
comments: "Feeling hydrated."
---

```

## 🛠️ Installation

1. Create a folder named `bathroom-log` in your vault's `.obsidian/plugins/` directory.
2. Place `main.js`, `styles.css`, and `manifest.json` into that folder.
3. Reload Obsidian and enable **Bathroom Log** in the Community Plugins settings.

## 🚀 Usage

* **Ribbon Icon**: Click the toilet icon (🚽) in the ribbon to open the dashboard.
* **Command Palette**: Search for `Bathroom Log: Open Bathroom Log`.
* **Dashboard**: Access "Add Entry," "View Entries," "Charts," and "Data Manager" from the main screen.

## 📥 Data Management

In the **Data Manager** section, you can:

* **Export**: Generate a CSV of all entries for analysis in Excel or to share with a healthcare professional.
* **Import**: Bulk-upload entries from a CSV file.

## 📜 License

Custom Plugin - Refer to author for licensing details.

```

```
