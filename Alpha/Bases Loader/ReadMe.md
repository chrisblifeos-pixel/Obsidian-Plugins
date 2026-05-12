This is a professional and detailed `README.md` for your **Base Launcher** plugin, organized to reflect the specific features and folder structures found in your source code.

---

# Base Launcher for Obsidian

**Base Launcher** is a mobile-optimized view for Obsidian designed to streamline access to `.base` files. It organizes your database files into categories based on your folder structure, providing a clean, tactile interface that feels like a native mobile app launcher.

## ✨ Features

* **Dedicated Database View**: A custom view (accessible via the ribbon) that lists all your `.base` files in one place.
* **Category Support**: Automatically turns subfolders within your base directory into a dropdown filter.
* **Smart Sorting**: Files are sorted alphabetically, with a built-in "clean-name" logic that ignores emojis to ensure your sorting remains logical even with decorative icons.
* **Mobile-First Design**:
* Large, easy-to-tap list items.
* Visual feedback on tap (scaling effect).
* Responsive layout that handles long filenames gracefully.


* **Live Updates**: The list and category dropdown automatically refresh when you create, delete, or rename files/folders within your vault.

---

## 📂 Configuration & Structure

The plugin is hardcoded to look for a specific folder structure to populate its categories. To use the plugin, ensure your vault is organized as follows:

```text
_system/
└── Bases/             <-- Root folder for the plugin
    ├── Project A.base
    ├── Personal/      <-- Becomes a "Category" in the dropdown
    │   └── Journal.base
    └── Work/          <-- Becomes a "Category" in the dropdown
        └── Clients.base

```

* **Root Folder**: `_system/Bases`
* **File Extension**: Only files ending in `.base` will be displayed.
* **Categories**: Any subfolder directly inside `_system/Bases` will appear in the "Category Selector" dropdown.

---

## 🚀 How to Use

1. **Open the Launcher**: Click the **Grid Icon** (`layout-grid`) in the Obsidian ribbon (left sidebar).
2. **Switch Categories**: Use the dropdown at the top of the view to filter by subfolders (e.g., "Work," "Personal," or "Main").
3. **Launch a File**: Tap any item in the list to open that `.base` file in your current workspace leaf.

---

## 🎨 Visual Styling

The plugin uses Obsidian's CSS variables to ensure it looks great in both **Light** and **Dark** modes. Key UI components include:

* **Header Section**: A sticky top section containing the title and category selector.
* **Database Icon**: A consistent SVG icon for all `.base` files for quick visual recognition.
* **List Area**: A scrollable area that keeps the header visible at all times.

---

## 🛠️ Technical Details

| Detail | Specification |
| --- | --- |
| **View ID** | `base-launcher-view` |
| **Icons** | Lucide `layout-grid` |
| **Required Extension** | `.base` |
| **Dependencies** | Obsidian API (`Plugin`, `ItemView`, `TFolder`) |

### Development

The plugin logic is contained within `main.js`, while the aesthetic layout is defined in `styles.css`. It uses standard Obsidian event listeners (`create`, `delete`, `rename`) to maintain data reactivity without requiring manual refreshes.

---

## 📝 License

*Created by Chris.* Refer to the `manifest.json` for versioning information. Currently at version **1.1.0**.
