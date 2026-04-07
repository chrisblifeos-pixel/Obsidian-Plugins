var obsidian = require('obsidian');

const VIEW_TYPE_CALENDAR = 'calendar-week-view';

// ── Relative date label ──────────────────────────────────────────
var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function relativeDate(dateStr) {
    var parts = dateStr.split('-');
    var target = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var diff = Math.round((target - today) / 86400000);

    if (diff === 0) return 'today';
    if (diff === 1) return 'tomorrow';
    if (diff === -1) return 'yesterday';
    if (diff > 1 && diff <= 7) return 'in ' + diff + ' days';
    if (diff < -1 && diff >= -7) return Math.abs(diff) + ' days ago';
    if (diff > 7 && diff <= 14) return 'next ' + DAY_NAMES[target.getDay()];
    if (diff < -7 && diff >= -14) return 'last ' + DAY_NAMES[target.getDay()];
    if (diff > 14) {
        var months = Math.round(diff / 30);
        if (months < 1) return 'in ' + Math.round(diff / 7) + ' weeks';
        if (months < 12) return 'in ' + months + ' month' + (months > 1 ? 's' : '');
        var years = Math.round(diff / 365);
        return 'in ' + years + ' year' + (years > 1 ? 's' : '');
    }
    var absDiff = Math.abs(diff);
    var months = Math.round(absDiff / 30);
    if (months < 1) return Math.round(absDiff / 7) + ' weeks ago';
    if (months < 12) return months + ' month' + (months > 1 ? 's' : '') + ' ago';
    var years = Math.round(absDiff / 365);
    return years + ' year' + (years > 1 ? 's' : '') + ' ago';
}
const HOUR_HEIGHT = 60; // pixels per hour
const START_HOUR = 0;
const END_HOUR = 24;

// ── Duration parsing ──────────────────────────────────────────────
// Accepts: "1h", "30m", "1h 30m", "2h 15m"
// Returns: duration in minutes
function parseDuration(str) {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    if (String(str).trim().toLowerCase() === 'instant') return 0;
    var s = String(str);
    var hours = 0, minutes = 0;
    var hMatch = s.match(/(\d+)\s*h/i);
    var mMatch = s.match(/(\d+)\s*m/i);
    if (hMatch) hours = parseInt(hMatch[1], 10);
    if (mMatch) minutes = parseInt(mMatch[1], 10);
    var total = hours * 60 + minutes;
    if (total === 0 && (hMatch || mMatch)) return 0;
    return total;
}

// ── Parse time string "HH:MM" to fractional hours ────────────────
function parseTime(str) {
    if (!str) return null;
    var s = String(str);
    var parts = s.split(':');
    if (parts.length < 2) return null;
    var h = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;
    return h + m / 60;
}

// ── Parse time value (string or YAML sexagesimal number) ─────────
function parseTimeVal(val) {
    if (typeof val === 'number') {
        var result = Math.floor(val / 60) + (val % 60) / 60;
        if (result < 0 || result >= 24) return null;
        return result;
    }
    return parseTime(val);
}

// ── Get Monday of the week containing a date ─────────────────────
function getMonday(date) {
    var d = new Date(date);
    d.setHours(0, 0, 0, 0);
    var day = d.getDay();
    var diff = (day === 0 ? -6 : 1) - day; // Monday = 1
    d.setDate(d.getDate() + diff);
    return d;
}

// ── Format date as YYYY-MM-DD ────────────────────────────────────
function dateKey(date) {
    return date.getFullYear()
        + '-' + String(date.getMonth() + 1).padStart(2, '0')
        + '-' + String(date.getDate()).padStart(2, '0');
}

// ── Short month names ────────────────────────────────────────────
var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
var DAYS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// ── Default event color ───────────────────────────────────────────
var DEFAULT_COLOR = 'accent';

// ── Resolve the Obsidian accent color to hex ────────────────────
function resolveAccentColor() {
    var style = getComputedStyle(document.body);
    var raw = style.getPropertyValue('--interactive-accent').trim();
    if (raw) {
        if (raw.charAt(0) === '#') return raw;
        var m = raw.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        if (m) {
            return '#' + [m[1], m[2], m[3]].map(function (s) {
                return parseInt(s, 10).toString(16).padStart(2, '0');
            }).join('');
        }
    }
    // Try Obsidian's HSL accent variables
    var h = parseFloat(style.getPropertyValue('--accent-h'));
    var s = parseFloat(style.getPropertyValue('--accent-s'));
    var l = parseFloat(style.getPropertyValue('--accent-l'));
    if (!isNaN(h) && !isNaN(s) && !isNaN(l)) {
        return hslToHex(h, s, l);
    }
    // Try color-accent RGB variable
    var rgb = style.getPropertyValue('--color-accent-rgb').trim();
    if (rgb) {
        var parts = rgb.split(',');
        if (parts.length === 3) {
            return '#' + parts.map(function (s) {
                return parseInt(s.trim(), 10).toString(16).padStart(2, '0');
            }).join('');
        }
    }
    return '#4a8af4';
}

function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    var c = (1 - Math.abs(2 * l - 1)) * s;
    var x = c * (1 - Math.abs((h / 60) % 2 - 1));
    var m = l - c / 2;
    var r, g, b;
    if (h < 60)       { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else               { r = c; g = 0; b = x; }
    return '#' + [r + m, g + m, b + m].map(function (v) {
        return Math.round(v * 255).toString(16).padStart(2, '0');
    }).join('');
}

// ── Resolve a color value (Iconic name like "red" or hex "#ff0000") to hex ──
function resolveColor(val) {
    if (!val || val === 'accent') return resolveAccentColor();
    if (val.charAt(0) === '#') return val;
    // Treat as Iconic/Obsidian color name — resolve via CSS variable
    var style = getComputedStyle(document.body);
    // Try --color-{name}-rgb first (bare numbers: "255, 0, 0")
    var rgb = style.getPropertyValue('--color-' + val + '-rgb').trim();
    if (rgb) {
        var parts = rgb.split(',');
        return '#' + parts.map(function (s) {
            return parseInt(s.trim(), 10).toString(16).padStart(2, '0');
        }).join('');
    }
    // Fall back to --color-{name} which may be "rgb(255, 0, 0)"
    var raw = style.getPropertyValue('--color-' + val).trim();
    if (raw) {
        var m = raw.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        if (m) {
            return '#' + [m[1], m[2], m[3]].map(function (s) {
                return parseInt(s, 10).toString(16).padStart(2, '0');
            }).join('');
        }
    }
    return resolveAccentColor();
}

// ── Desaturate an RGB triplet by a factor (0 = grey, 1 = original) ──
function desaturate(r, g, b, factor) {
    var grey = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    return [
        Math.round(grey + factor * (r - grey)),
        Math.round(grey + factor * (g - grey)),
        Math.round(grey + factor * (b - grey)),
    ];
}

// ── Convert hex color to {bg, border} ────────────────────────────
function colorFromHex(hex) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    var isLight = document.body.classList.contains('theme-light');
    // Light mode: keep more saturation, darken more for contrast
    var satFactor = isLight ? 0.85 : 0.75;
    var darkFactor = isLight ? 0.6 : 0.75;
    var d = desaturate(r, g, b, satFactor);
    d = [Math.round(d[0] * darkFactor), Math.round(d[1] * darkFactor), Math.round(d[2] * darkFactor)];
    return {
        bg: 'rgba(' + d[0] + ',' + d[1] + ',' + d[2] + ', ' + (isLight ? '0.85' : '0.75') + ')',
        border: 'rgb(' + d[0] + ',' + d[1] + ',' + d[2] + ')',
    };
}

// ── Match a color rule against an event ──────────────────────────
function matchColorRules(rules, file, fm) {
    for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        if (rule.type === 'path') {
            if (file.path.toLowerCase().includes(rule.value.toLowerCase())) {
                return rule.color;
            }
        } else if (rule.type === 'frontmatter') {
            var fmVal = fm[rule.key];
            if (fmVal !== undefined && String(fmVal).toLowerCase() === rule.value.toLowerCase()) {
                return rule.color;
            }
        }
    }
    return null;
}

// ── Format a basename: insert comma after leading "Word Number" ──
function formatTitle(name) {
    return name.replace(/^(\S+\s+\d+)\s+/, '$1, ');
}

// ── Normalise a frontmatter date (Date object or string) to YYYY-MM-DD ──
function fmDateStr(raw) {
    if (raw instanceof Date) {
        return raw.getUTCFullYear()
            + '-' + String(raw.getUTCMonth() + 1).padStart(2, '0')
            + '-' + String(raw.getUTCDate()).padStart(2, '0');
    }
    return String(raw).substring(0, 10);
}

// ── Check if a file path is inside any of a [{path}] folder list ──
function inFolders(filePath, folders) {
    for (var i = 0; i < folders.length; i++) {
        var fp = folders[i].path;
        if (filePath === fp || filePath.startsWith(fp + '/')) return true;
    }
    return false;
}

// ── Snap fractional hours to nearest 15-min increment ────────────
function snapToQuarter(hours) {
    return Math.round(hours * 4) / 4;
}

// ── End time of an event (instant events treated as 1-min for overlap) ──
function eventEndTime(ev) {
    return ev.startTime + (ev.durationMin || 1) / 60;
}

// ── Compute overlap layout for a list of day events ─────────────
function computeOverlapLayout(dayEvents) {
    if (dayEvents.length === 0) return [];

    // Sort by start time ascending, then longer events first
    var sorted = dayEvents.slice().sort(function (a, b) {
        if (a.startTime !== b.startTime) return a.startTime - b.startTime;
        return b.durationMin - a.durationMin;
    });

    // Build overlap groups: events that transitively overlap share a group
    var groups = [];
    var currentGroup = [sorted[0]];
    var groupEnd = eventEndTime(sorted[0]);

    for (var i = 1; i < sorted.length; i++) {
        var ev = sorted[i];
        if (ev.startTime < groupEnd) {
            currentGroup.push(ev);
            var evEnd = eventEndTime(ev);
            if (evEnd > groupEnd) groupEnd = evEnd;
        } else {
            groups.push(currentGroup);
            currentGroup = [ev];
            groupEnd = eventEndTime(ev);
        }
    }
    groups.push(currentGroup);

    var result = [];
    for (var g = 0; g < groups.length; g++) {
        var group = groups[g];
        var columns = [];

        for (var j = 0; j < group.length; j++) {
            var ev = group[j];
            var evEnd = eventEndTime(ev);

            // Find first column where this event fits (no overlap)
            var placed = false;
            for (var c = 0; c < columns.length; c++) {
                if (ev.startTime >= columns[c]) {
                    columns[c] = evEnd;
                    result.push({ event: ev, colIndex: c, totalCols: 0 });
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                result.push({ event: ev, colIndex: columns.length, totalCols: 0 });
                columns.push(evEnd);
            }
        }

        // Set totalCols for all events in this group
        var totalCols = columns.length;
        for (var k = result.length - group.length; k < result.length; k++) {
            result[k].totalCols = totalCols;
        }
    }

    return result;
}

// ── Format fractional hours as "HH:MM" ──────────────────────────
function fmtTime(h) {
    var hh = Math.floor(h);
    var mm = Math.round((h - hh) * 60);
    return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
}

// ── Format duration in minutes as "1h 30m" / "45m" / "0m" ──────
function fmtDuration(durMin) {
    durMin = Math.round(durMin);
    if (durMin <= 0) return '0m';
    var h = Math.floor(durMin / 60);
    var m = durMin % 60;
    return h > 0 ? h + 'h' + (m > 0 ? ' ' + m + 'm' : '') : m + 'm';
}

// ── Default settings ─────────────────────────────────────────────
var DEFAULT_SETTINGS = {
    folders: [],       // [{path: string, label: string}] — empty = all folders
    taskFolders: [],   // [{path: string, label: string}] — deadline/task folders
    colorRules: [],    // [{type:'path'|'frontmatter', value:string, key?:string, color:string}]
    defaultColor: DEFAULT_COLOR,
    lineMode: true,    // render events as dot + line instead of filled blocks
    hiddenPaths: [],   // [string] — file paths hidden from calendar via context menu
    mapMode: false,    // show journey blocks between events at different locations
    gcalFeeds: [],              // [{url: string, label: string}] — Google Calendar ICS feed URLs
    gcalSyncIntervalMin: 30,   // auto-sync interval in minutes (0 = manual only)
};

// ── ICS parser ──────────────────────────────────────────────────
function parseICS(icsText) {
    // Unfold lines (RFC 5545: lines starting with space/tab are continuations)
    var unfolded = icsText.replace(/\r\n[ \t]/g, '').replace(/\r/g, '');
    var lines = unfolded.split('\n');
    var events = [];
    var current = null;

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (line === 'BEGIN:VEVENT') {
            current = {};
            continue;
        }
        if (line === 'END:VEVENT') {
            if (current) events.push(current);
            current = null;
            continue;
        }
        if (!current) continue;

        // Parse "PROPERTY;params:value" or "PROPERTY:value"
        var colonIdx = line.indexOf(':');
        if (colonIdx < 0) continue;
        var left = line.substring(0, colonIdx);
        var value = line.substring(colonIdx + 1);
        var propName = left.split(';')[0].toUpperCase();

        if (propName === 'SUMMARY') current.summary = value;
        else if (propName === 'LOCATION') current.location = value;
        else if (propName === 'DESCRIPTION') current.description = value;
        else if (propName === 'UID') current.uid = value;
        else if (propName === 'DTSTART') {
            current.dtstart = parseICSDateTime(value);
            current.allDay = /VALUE=DATE/i.test(left) || value.length === 8;
        }
        else if (propName === 'DTEND') current.dtend = parseICSDateTime(value);
    }
    return events;
}

function parseICSDateTime(val) {
    // Formats: YYYYMMDD, YYYYMMDDTHHMMSS, YYYYMMDDTHHMMSSZ
    val = val.trim();
    if (val.length === 8) {
        // All-day: YYYYMMDD
        return new Date(+val.slice(0,4), +val.slice(4,6)-1, +val.slice(6,8));
    }
    var y = +val.slice(0,4), mo = +val.slice(4,6)-1, d = +val.slice(6,8);
    var h = +val.slice(9,11), mi = +val.slice(11,13), s = +val.slice(13,15) || 0;
    if (val.endsWith('Z')) {
        return new Date(Date.UTC(y, mo, d, h, mi, s));
    }
    return new Date(y, mo, d, h, mi, s);
}

// ══════════════════════════════════════════════════════════════════
//  CalendarView
// ══════════════════════════════════════════════════════════════════
class CalendarView extends obsidian.ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
        this.weekStart = getMonday(new Date());
        this.focusedDate = dateKey(new Date());
        this.nowLineInterval = null;
        this._drag = null;             // drag-to-create state
        this._onDragMove = null;       // bound mousemove handler (for cleanup)
        this._onDragUp = null;         // bound mouseup handler (for cleanup)
    }

    getViewType() { return VIEW_TYPE_CALENDAR; }
    getDisplayText() { return 'Calendar'; }
    getIcon() { return 'calendar'; }

    scheduleRender() {
        if (this._renderTimer) clearTimeout(this._renderTimer);
        this._renderTimer = setTimeout(() => { this._renderTimer = null; this.render(); }, 100);
    }

    async onOpen() {
        this.render();

        var self = this;

        var isRelevantFile = function (path) {
            if (path.startsWith('Modules/')) return true;
            var s = self.plugin.settings;
            var eventFolders = s.folders;
            var taskFolders = s.taskFolders;
            if (eventFolders.length === 0 && taskFolders.length === 0) return true;
            if (eventFolders.length > 0 && inFolders(path, eventFolders)) return true;
            if (taskFolders.length > 0 && inFolders(path, taskFolders)) return true;
            return false;
        };
        var filteredRender = function (file) {
            if (file && file.path) {
                if (!isRelevantFile(file.path)) return;
                if (file.path.startsWith('Modules/')) self.plugin._moduleColorsDirty = true;
            }
            self.scheduleRender();
        };
        this.registerEvent(this.app.vault.on('create', filteredRender));
        this.registerEvent(this.app.vault.on('delete', filteredRender));
        this.registerEvent(this.app.vault.on('rename', filteredRender));
        this.registerEvent(this.app.vault.on('modify', filteredRender));
        this.registerEvent(this.app.metadataCache.on('changed', filteredRender));

        // Update "now" line every minute
        this.nowLineInterval = setInterval(() => this.updateNowLine(), 60000);

        // Re-render when moved to/from sidebar
        this.lastSidebarState = this.isSidebar();
        this.registerEvent(this.app.workspace.on('layout-change', function () {
            var isSidebar = self.isSidebar();
            if (isSidebar !== self.lastSidebarState) {
                self.lastSidebarState = isSidebar;
                self.sidebarUserNavigated = false;
                if (!isSidebar) {
                    self.weekStart = getMonday(self.weekStart);
                }
                self.render();
            }
        }));

        // ── Keyboard shortcuts ──
        this.contentEl.tabIndex = 0;
        this._onKeyDown = function (e) {
            // Ignore when typing in inputs or contenteditable
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA'
                || e.target.isContentEditable) return;

            if (e.key === 't' || e.key === 'T') {
                e.preventDefault();
                self.sidebarUserNavigated = false;
                self.weekStart = self.isSidebar() ? new Date() : getMonday(new Date());
                self.weekStart.setHours(0, 0, 0, 0);
                self.focusedDate = dateKey(new Date());
                self.render();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                self.navigate('prev');
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                self.navigate('next');
            } else if (e.key === 'n' || e.key === 'N') {
                e.preventDefault();
                // Create event at current hour on focused day
                var body = self.contentEl.querySelector('.cal-body');
                var cols = self.contentEl.querySelectorAll('.cal-day-col');
                if (!body || cols.length === 0) return;
                var visibleDays = self.getVisibleDays();
                var targetCol = null;
                for (var i = 0; i < visibleDays.length; i++) {
                    var colDate = new Date(self.weekStart);
                    colDate.setDate(colDate.getDate() + visibleDays[i]);
                    if (dateKey(colDate) === self.focusedDate) {
                        targetCol = cols[i];
                        break;
                    }
                }
                if (!targetCol) targetCol = cols[0];
                var now = new Date();
                var hour = snapToQuarter(now.getHours() + now.getMinutes() / 60);
                var hex = resolveColor(self.plugin.settings.defaultColor);
                var result = self.buildEventDOM(targetCol, hour, 0, hex, '', { isDraft: true });
                if (result) {
                    // Find the date string for the target column
                    var targetDateStr = self.focusedDate;
                    self.transitionToDraft({
                        dayCol: targetCol, dateStr: targetDateStr, body: body,
                        startHour: hour, currentHour: hour,
                        el: result.el, titleEl: result.titleEl, timeEl: result.timeEl,
                        shape: result.shape, isInstant: true, hex: hex
                    }, hour, hour);
                }
            }
        };
        this.contentEl.addEventListener('keydown', this._onKeyDown);

        // ── Responsive size classes via ResizeObserver ──
        this._sizeClass = '';
        this._heightClass = '';
        this._resizeObserver = new ResizeObserver(function (entries) {
            var entry = entries[0];
            if (!entry) return;
            var w = entry.contentRect.width;
            var h = entry.contentRect.height;
            var wClass = w < 350 ? 'cal-mini' : w < 550 ? 'cal-compact' : '';
            var hClass = h < 450 ? 'cal-short' : '';
            if (wClass !== self._sizeClass || hClass !== self._heightClass) {
                self._sizeClass = wClass;
                self._heightClass = hClass;
                self.render();
            }
        });
        this._resizeObserver.observe(this.contentEl);

    }

    async onClose() {
        if (this._renderTimer) clearTimeout(this._renderTimer);
        if (this.nowLineInterval) clearInterval(this.nowLineInterval);
        if (this._resizeObserver) this._resizeObserver.disconnect();
        if (this._onKeyDown) this.contentEl.removeEventListener('keydown', this._onKeyDown);
    }

    // ── Check if view is in a sidebar ──────────────────────────
    isSidebar() {
        var root = this.leaf.getRoot();
        return root !== this.app.workspace.rootSplit;
    }

    // ── Determine which days to show ───────────────────────────
    getVisibleDays() {
        if (this.isSidebar()) {
            return [0];
        }
        return [0, 1, 2, 3, 4, 5, 6];
    }

    // ── Collect events from vault ────────────────────────────────
    getEvents() {
        if (this.plugin._moduleColorsDirty) {
            this.plugin.syncColorsFromModules();
            this.plugin._moduleColorsDirty = false;
        }

        var events = [];
        var files = this.app.vault.getMarkdownFiles();
        var allowedFolders = this.plugin.settings.folders;
        var hiddenPaths = this.plugin.settings.hiddenPaths;

        for (var i = 0; i < files.length; i++) {
            var file = files[i];

            // Skip hidden items
            if (hiddenPaths.indexOf(file.path) !== -1) continue;

            // Folder filter: if folders are configured, only include matching files
            var matchedFolder = null;
            if (allowedFolders.length > 0) {
                if (!inFolders(file.path, allowedFolders)) continue;
                matchedFolder = allowedFolders.find(function (f) {
                    return file.path === f.path || file.path.startsWith(f.path + '/');
                });
            }
            var cache = this.app.metadataCache.getFileCache(file);
            if (!cache || !cache.frontmatter) continue;
            var fm = cache.frontmatter;
            // Accept: starts, startTime, time
            var timeVal = fm.starts || fm.startTime || fm.time;
            if (!fm.date || !timeVal) continue;

            var dateStr = fmDateStr(fm.date);
            if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) continue;

            // Parse start time — YAML may give sexagesimal number for unquoted "14:00"
            var startTime = parseTimeVal(timeVal);
            if (startTime === null) continue;

            // Duration: from "duration" field, or computed from endTime/endDate
            var durationMin;
            var endDateStr = fm.endDate ? fmDateStr(fm.endDate) : null;
            var endTimeVal = fm.endTime;

            if (endDateStr && endDateStr !== dateStr) {
                // Multi-day event: compute total duration across days
                var startParts = dateStr.split('-');
                var endParts = endDateStr.split('-');
                var startDate = new Date(+startParts[0], +startParts[1] - 1, +startParts[2]);
                var endDate = new Date(+endParts[0], +endParts[1] - 1, +endParts[2]);
                var endTimeHours = endTimeVal ? parseTimeVal(endTimeVal) : 24;
                if (endTimeHours === null) endTimeHours = 24;

                // Generate segments for each day
                var title = fm.displayTitle || formatTitle(file.basename);
                var folderLabel = matchedFolder ? matchedFolder.label : null;
                var loc = fm.location || null;
                var cursor = new Date(startDate);
                var dayIndex = 0;
                while (cursor <= endDate) {
                    var dk = dateKey(cursor);
                    var isFirst = dayIndex === 0;
                    var isLast = dk === endDateStr;
                    var segStart = isFirst ? startTime : 0;
                    var segEnd = isLast ? endTimeHours : 24;
                    var segDur = (segEnd - segStart) * 60;
                    if (segDur > 0) {
                        events.push({
                            file: file, fm: fm, date: dk,
                            startTime: segStart, durationMin: segDur,
                            title: title, folderLabel: folderLabel, location: loc,
                            isMultiDayStart: isFirst && !isLast,
                            isMultiDayEnd: isLast && !isFirst,
                            isMultiDayMiddle: !isFirst && !isLast,
                        });
                    }
                    cursor.setDate(cursor.getDate() + 1);
                    dayIndex++;
                    if (dayIndex > 30) break; // safety limit
                }
            } else {
                if (endTimeVal) {
                    var endTime = parseTimeVal(endTimeVal);
                    if (endTime !== null && endTime >= startTime) {
                        durationMin = (endTime - startTime) * 60;
                    } else {
                        durationMin = parseDuration(fm.duration);
                    }
                } else {
                    durationMin = parseDuration(fm.duration);
                }

                events.push({
                    file: file,
                    fm: fm,
                    date: dateStr,
                    startTime: startTime,
                    durationMin: durationMin,
                    title: fm.displayTitle || formatTitle(file.basename),
                    folderLabel: matchedFolder ? matchedFolder.label : null,
                    location: fm.location || null,
                    isMultiDayStart: false,
                    isMultiDayEnd: false,
                    isMultiDayMiddle: false,
                });
            }
        }
        return events;
    }

    // ── Collect task/deadline events from vault ────────────────────
    getTaskEvents() {
        var tasks = [];
        var taskFolders = this.plugin.settings.taskFolders;
        if (taskFolders.length === 0) return tasks;
        var hiddenPaths = this.plugin.settings.hiddenPaths;

        var files = this.app.vault.getMarkdownFiles();
        for (var i = 0; i < files.length; i++) {
            var file = files[i];

            // Skip hidden items
            if (hiddenPaths.indexOf(file.path) !== -1) continue;

            // Folder filter
            if (!inFolders(file.path, taskFolders)) continue;
            var matchedFolder = taskFolders.find(function (f) {
                return file.path === f.path || file.path.startsWith(f.path + '/');
            });

            var cache = this.app.metadataCache.getFileCache(file);
            if (!cache || !cache.frontmatter) continue;
            var fm = cache.frontmatter;

            // Task notes use "closes" for date
            var rawDate = fm.closes;
            if (!rawDate) continue;

            // Hide completed daily tasks from the calendar
            if (fm.dailytask === true && fm.status === 'completed') continue;

            var dateStr = fmDateStr(rawDate);
            if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) continue;

            // Optional time via "closeTime"
            var timeVal = fm.closeTime;
            var startTime = timeVal ? parseTimeVal(timeVal) : null;

            tasks.push({
                file: file,
                fm: fm,
                date: dateStr,
                startTime: startTime,
                title: fm.displayTitle || formatTitle(file.basename),
                folderLabel: matchedFolder ? matchedFolder.label : null,
            });
        }
        return tasks;
    }

    // ── Main render ──────────────────────────────────────────────
    render() {
        var self = this;
        // Sidebar always defaults to today unless user navigated away
        if (this.isSidebar() && !this.sidebarUserNavigated) {
            this.weekStart = new Date();
            this.weekStart.setHours(0, 0, 0, 0);
        }

        var container = this.contentEl;
        var slideDir = this._slideDirection;
        this._slideDirection = null;
        var prevBody = container.querySelector('.cal-body');
        var savedScroll = prevBody ? prevBody.scrollTop : null;
        container.empty();
        container.removeClass('cal-slide-next');
        container.removeClass('cal-slide-prev');
        container.addClass('cal-container');
        if (this.isSidebar()) container.addClass('cal-sidebar');
        if (this._sizeClass) container.addClass(this._sizeClass);
        if (this._heightClass) container.addClass(this._heightClass);
        if (slideDir) {
            void container.offsetWidth; // force reflow to restart animation
            container.addClass('cal-slide-' + slideDir);
            setTimeout(function () {
                container.removeClass('cal-slide-next');
                container.removeClass('cal-slide-prev');
            }, 200);
        }

        this.renderHeader(container);
        this.renderWeekGrid(container);
        var newBody = container.querySelector('.cal-body');
        if (savedScroll !== null) {
            if (newBody) newBody.scrollTop = savedScroll;
        } else if (newBody) {
            // First render: scroll so current hour is near the top, with 1h padding
            var now = new Date();
            var targetHour = Math.max(0, now.getHours() - 1);
            newBody.scrollTop = targetHour * HOUR_HEIGHT;
        }
    }

    // ── Navigation step (1 day in sidebar, 7 days in main) ──────
    navStep() {
        return this.isSidebar() ? 1 : 7;
    }

    // ── Shared navigation logic for prev/next ──────────────────
    navigate(direction) {
        if (this.isSidebar()) this.sidebarUserNavigated = true;
        this.focusedDate = dateKey(new Date());
        var d = new Date(this.weekStart);
        d.setDate(d.getDate() + (direction === 'next' ? this.navStep() : -this.navStep()));
        this.weekStart = this.isSidebar() ? d : getMonday(d);
        this._slideDirection = direction;
        this.render();
    }

    // ── Header: nav + week/day label ──────────────────────────────
    renderHeader(container) {
        var self = this;
        var header = container.createDiv({ cls: 'cal-header' });

        // Prev
        var prevBtn = header.createEl('button', { cls: 'cal-nav-btn' });
        obsidian.setIcon(prevBtn, 'chevron-left');
        prevBtn.addEventListener('click', function () { self.navigate('prev'); });

        // Next
        var nextBtn = header.createEl('button', { cls: 'cal-nav-btn' });
        obsidian.setIcon(nextBtn, 'chevron-right');
        nextBtn.addEventListener('click', function () { self.navigate('next'); });

        // Label
        var label;
        if (this.isSidebar()) {
            // Single day: "Fri 7 Mar 2026"
            var dayDate = new Date(this.weekStart);
            var dayIdx = (dayDate.getDay() + 6) % 7; // 0=Mon, 6=Sun
            label = DAYS[dayIdx] + ' ' + dayDate.getDate()
                + ' ' + MONTHS[dayDate.getMonth()] + ' ' + dayDate.getFullYear();
        } else {
            // Week range: "3–9 Mar 2026" or "Week 22 · 3–9 Mar 2026"
            var weekEnd = new Date(this.weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            if (this.weekStart.getMonth() === weekEnd.getMonth()) {
                label = this.weekStart.getDate() + '\u2013' + weekEnd.getDate()
                    + ' ' + MONTHS[weekEnd.getMonth()] + ' ' + weekEnd.getFullYear();
            } else {
                label = this.weekStart.getDate() + ' ' + MONTHS[this.weekStart.getMonth()]
                    + ' \u2013 ' + weekEnd.getDate() + ' ' + MONTHS[weekEnd.getMonth()]
                    + ' ' + weekEnd.getFullYear();
            }
            var weekNum = this.plugin.getAcademicWeek(dateKey(this.weekStart));
            if (weekNum) label = 'Week ' + weekNum + ' \u00b7 ' + label;
        }
        header.createEl('span', { cls: 'cal-week-label', text: label });
    }

    // ── Week grid ────────────────────────────────────────────────
    renderWeekGrid(container) {
        var self = this;
        var events = this.getEvents();
        var mapMode = this.plugin.settings.mapMode;
        var totalHours = END_HOUR - START_HOUR;

        var grid = container.createDiv({ cls: 'cal-grid' });

        // ── Body (scrollable — header and allday are sticky inside) ──
        var body = grid.createDiv({ cls: 'cal-body' });

        // ── Day headers row (sticky) ──
        var headerRow = body.createDiv({ cls: 'cal-header-row' });
        headerRow.createDiv({ cls: 'cal-time-gutter cal-corner' });

        var todayStr = dateKey(new Date());
        var visibleDays = this.getVisibleDays();

        for (var vi = 0; vi < visibleDays.length; vi++) {
            var d = visibleDays[vi];
            var colDate = new Date(this.weekStart);
            colDate.setDate(colDate.getDate() + d);
            var dk = dateKey(colDate);
            var dayHeader = headerRow.createDiv({ cls: 'cal-day-header' });
            if (dk === todayStr) dayHeader.addClass('cal-day-header-today');
            var dayNameIdx = (colDate.getDay() + 6) % 7;
            var dayNames = this._sizeClass === 'cal-compact' || this._sizeClass === 'cal-mini' ? DAYS_SHORT : DAYS;
            dayHeader.createDiv({ cls: 'cal-day-name', text: dayNames[dayNameIdx] });
            dayHeader.createDiv({ cls: 'cal-day-date', text: String(colDate.getDate()) });
            dayHeader.style.cursor = 'pointer';
            (function (key) {
                dayHeader.addEventListener('click', function () {
                    self.focusedDate = key;
                    self.render();
                });
            })(dk);
        }

        // ── Collect task events ──
        var taskEvents = this.getTaskEvents();
        var allDayTasks = taskEvents.filter(function (t) { return t.startTime === null; });
        var timedTasks = taskEvents.filter(function (t) { return t.startTime !== null; });

        // ── All-day row (only if there are all-day tasks this week) ──
        var hasAllDay = false;
        for (var ai = 0; ai < visibleDays.length; ai++) {
            var ad = visibleDays[ai];
            var aColDate = new Date(this.weekStart);
            aColDate.setDate(aColDate.getDate() + ad);
            var adk = dateKey(aColDate);
            if (allDayTasks.some(function (t) { return t.date === adk; })) {
                hasAllDay = true;
                break;
            }
        }

        var allDayRow = null;
        if (hasAllDay) {
            allDayRow = body.createDiv({ cls: 'cal-allday-row' });
            allDayRow.style.top = headerRow.offsetHeight + 'px';
            allDayRow.createDiv({ cls: 'cal-time-gutter cal-allday-gutter' });

            for (var bi = 0; bi < visibleDays.length; bi++) {
                var bd = visibleDays[bi];
                var bColDate = new Date(this.weekStart);
                bColDate.setDate(bColDate.getDate() + bd);
                var bdk = dateKey(bColDate);
                var allDayCol = allDayRow.createDiv({ cls: 'cal-allday-col' });

                var dayAllDay = allDayTasks.filter(function (t) { return t.date === bdk; });
                dayAllDay.sort(function (a, b) {
                    var aName = a.fm.redirectTo ? String(a.fm.redirectTo).replace(/^\[\[|\]\]$/g, '').split('/').pop() : a.title;
                    var bName = b.fm.redirectTo ? String(b.fm.redirectTo).replace(/^\[\[|\]\]$/g, '').split('/').pop() : b.title;
                    return aName.localeCompare(bName);
                });
                for (var ba = 0; ba < dayAllDay.length; ba++) {
                    this.renderTaskAllDay(allDayCol, dayAllDay[ba]);
                }
            }
        }

        // ── Time gutter + day columns ──
        var row = body.createDiv({ cls: 'cal-row' });
        var gutter = row.createDiv({ cls: 'cal-time-gutter' });

        // Hour labels
        for (var h = START_HOUR; h < END_HOUR; h++) {
            var hourLabel = gutter.createDiv({ cls: 'cal-hour-label' });
            hourLabel.style.height = HOUR_HEIGHT + 'px';
            hourLabel.textContent = String(h).padStart(2, '0') + ':00';
        }

        // ── Day columns ──
        for (var vi = 0; vi < visibleDays.length; vi++) {
            var d = visibleDays[vi];
            var colDate = new Date(this.weekStart);
            colDate.setDate(colDate.getDate() + d);
            var dk = dateKey(colDate);

            var dayCol = row.createDiv({ cls: 'cal-day-col' });
            dayCol.style.height = (totalHours * HOUR_HEIGHT) + 'px';

            // Hour gridlines
            for (var h = START_HOUR; h < END_HOUR; h++) {
                var line = dayCol.createDiv({ cls: 'cal-hour-line' });
                line.style.top = ((h - START_HOUR) * HOUR_HEIGHT) + 'px';
            }

            // Drag-to-create: mousedown on empty grid area
            (function (col, colDateStr) {
                col.addEventListener('mousedown', function (e) {
                    if (e.button !== 0) return; // left click only
                    if (e.target.closest('.cal-event, .cal-task-timed, .cal-task-allday')) return;
                    self.startDragCreate(e, col, colDateStr, body);
                });
            })(dayCol, dk);

            // Focused day background
            if (dk === self.focusedDate) {
                dayCol.addClass('cal-day-col-today');
            }

            // Place events (with overlap stacking)
            var dayEvents = events.filter(function (e) { return e.date === dk; });
            var layout = computeOverlapLayout(dayEvents);
            for (var i = 0; i < layout.length; i++) {
                var item = layout[i];
                this.renderEvent(dayCol, item);
            }

            // Place journey blocks (map mode — delegates to iris-maps plugin)
            if (mapMode && self.plugin.irisMaps) {
                var journeys = self.plugin.irisMaps.computeJourneys(dayEvents);
                for (var ji = 0; ji < journeys.length; ji++) {
                    this.renderJourney(dayCol, journeys[ji]);
                }
            }

            // Place timed tasks (markers)
            var dayTimedTasks = timedTasks.filter(function (t) { return t.date === dk; });
            for (var ti = 0; ti < dayTimedTasks.length; ti++) {
                this.renderTaskTimed(dayCol, dayTimedTasks[ti]);
            }

            // Now line
            if (dk === todayStr) {
                this.renderNowLine(dayCol);
            }
        }

    }

    yToHour(e, dayCol, rect) {
        if (!rect) rect = dayCol.getBoundingClientRect();
        var y = e.clientY - rect.top;
        var hour = snapToQuarter(START_HOUR + y / HOUR_HEIGHT);
        return Math.max(START_HOUR, Math.min(END_HOUR, hour));
    }

    startDragCreate(e, dayCol, dateStr, body) {
        var self = this;
        e.preventDefault();
        var hour = this.yToHour(e, dayCol);
        var hex = resolveColor(this.plugin.settings.defaultColor);

        var result = this.buildEventDOM(dayCol, hour, 0, hex, 'Event name', { isDraft: true });
        result.el.style.pointerEvents = 'none';
        if (result.shape) result.shape.style.opacity = '0.6';
        if (result.titleEl) result.titleEl.classList.add('cal-drag-title-placeholder');

        this._drag = {
            dayCol: dayCol, dateStr: dateStr, body: body,
            startHour: hour, currentHour: hour,
            el: result.el, titleEl: result.titleEl, timeEl: result.timeEl, shape: result.shape,
            isInstant: true, hex: hex,
            colRect: dayCol.getBoundingClientRect()
        };

        this._onDragMove = function (ev) { self.onDragMove(ev); };
        this._onDragUp = function (ev) { self.onDragUp(ev); };
        document.addEventListener('mousemove', this._onDragMove);
        document.addEventListener('mouseup', this._onDragUp);
    }

    onDragMove(e) {
        var drag = this._drag;
        if (!drag) return;
        drag.currentHour = this.yToHour(e, drag.dayCol, drag.colRect);
        this.updateDragPreview();
    }

    async onDragUp() {
        document.removeEventListener('mousemove', this._onDragMove);
        document.removeEventListener('mouseup', this._onDragUp);
        var drag = this._drag;
        this._drag = null;
        if (!drag) return;

        var lo = Math.min(drag.startHour, drag.currentHour);
        var hi = Math.max(drag.startHour, drag.currentHour);
        var durationMin = (hi - lo) * 60;

        // Short drags (< 15 min) snap to instant
        var startHour = durationMin < 15 ? drag.startHour : lo;
        var endHour = durationMin < 15 ? drag.startHour : hi;
        var finalInstant = startHour === endHour;
        var finalDurationMin = (endHour - startHour) * 60;

        // Rebuild if final type differs from current preview
        if (finalInstant !== drag.isInstant) {
            drag.el.remove();
            var result = this.buildEventDOM(drag.dayCol, startHour, finalDurationMin, drag.hex, '', { isDraft: true });
            drag.el = result.el;
            drag.titleEl = result.titleEl;
            drag.timeEl = result.timeEl;
            drag.shape = result.shape;
        } else {
            // Update position for final snap
            var top = (startHour - START_HOUR) * HOUR_HEIGHT;
            drag.el.style.top = top + 'px';
            if (!finalInstant) {
                var height = (endHour - startHour) * HOUR_HEIGHT;
                drag.el.style.height = height + 'px';
                drag.el.style.setProperty('--ev-h', height + 'px');
                if (drag.shape) drag.shape.style.height = height + 'px';
            }
        }

        this.transitionToDraft(drag, startHour, endHour);
    }

    updateDragPreview() {
        var drag = this._drag;
        var lo = Math.min(drag.startHour, drag.currentHour);
        var hi = Math.max(drag.startHour, drag.currentHour);
        var isInstant = hi === lo;
        var durationMin = (hi - lo) * 60;

        if (isInstant !== drag.isInstant) {
            // Type changed — rebuild element
            drag.el.remove();
            var result = this.buildEventDOM(drag.dayCol, lo, durationMin, drag.hex, 'Event name', { isDraft: true });
            result.el.style.pointerEvents = 'none';
            if (result.shape) result.shape.style.opacity = '0.6';
            if (result.titleEl) result.titleEl.classList.add('cal-drag-title-placeholder');
            drag.el = result.el;
            drag.titleEl = result.titleEl;
            drag.timeEl = result.timeEl;
            drag.shape = result.shape;
            drag.isInstant = isInstant;
        } else {
            // Same type — update position and time
            var top = (lo - START_HOUR) * HOUR_HEIGHT;
            drag.el.style.top = top + 'px';
            if (!isInstant) {
                var height = (hi - lo) * HOUR_HEIGHT;
                drag.el.style.height = height + 'px';
                drag.el.style.setProperty('--ev-h', height + 'px');
                if (drag.shape) drag.shape.style.height = height + 'px';
            }
            if (isInstant) {
                if (drag.timeEl) drag.timeEl.textContent = fmtTime(lo);
            } else {
                if (drag.timeEl) drag.timeEl.textContent = fmtTime(lo) + ' \u2013 ' + fmtTime(hi);
            }
        }
    }

    transitionToDraft(drag, startHour, endHour) {
        var self = this;
        var el = drag.el;
        var titleEl = drag.titleEl;
        var isInstant = startHour === endHour;
        var startStr = fmtTime(startHour);
        var endStr = fmtTime(endHour);
        var dateStr = drag.dateStr;

        // Enable interaction
        el.style.pointerEvents = '';
        el.style.zIndex = '10';
        if (drag.shape) drag.shape.style.opacity = '';

        // Make title editable
        titleEl.textContent = '';
        titleEl.classList.remove('cal-drag-title-placeholder');
        titleEl.setAttribute('contenteditable', 'plaintext-only');
        if (titleEl.contentEditable !== 'plaintext-only') titleEl.contentEditable = 'true';
        titleEl.dataset.placeholder = 'Event name';

        // Update time label for final state
        if (drag.timeEl) {
            drag.timeEl.textContent = isInstant ? startStr : startStr + ' \u2013 ' + endStr;
        }

        var committed = false;
        async function commit() {
            if (committed) return;
            committed = true;
            var title = titleEl.textContent.trim();
            el.classList.add('cal-event-committing');
            setTimeout(function () { el.remove(); }, 150);
            var folder = 'Events';
            await self.plugin.ensureFolder(folder);
            var safeName = dateStr + ' ' + startStr.replace(':', '-');
            var filePath = folder + '/' + safeName + '.md';
            var n = 1;
            while (self.app.vault.getAbstractFileByPath(filePath)) {
                filePath = folder + '/' + safeName + ' ' + (++n) + '.md';
            }
            var durLabel = fmtDuration((endHour - startHour) * 60);
            var yaml = 'date: "' + dateStr + '"\nstarts: "' + startStr + '"\nduration: "' + durLabel + '"';
            if (!isInstant) yaml += '\nendTime: "' + endStr + '"';
            if (title) yaml += '\ndisplayTitle: "' + title.replace(/"/g, '\\"') + '"';
            var content = '---\n' + yaml + '\n---\n';
            await self.app.vault.create(filePath, content);
        }

        function cancel() { el.remove(); }

        titleEl.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); commit(); }
            if (e.key === 'Escape') { e.preventDefault(); cancel(); }
        });
        titleEl.addEventListener('blur', function () {
            setTimeout(function () { if (!committed && el.parentNode) cancel(); }, 150);
        });

        setTimeout(function () { titleEl.focus(); }, 10);
    }

    openNote(file, fm) {
        var leaf = this.app.workspace.getLeaf(false);
        if (fm && fm.redirectTo) {
            // Strip [[brackets]] if present to get a plain link path
            var linkPath = String(fm.redirectTo).replace(/^\[\[|\]\]$/g, '');
            var target = this.app.metadataCache.getFirstLinkpathDest(linkPath, file.path);
            if (target) {
                leaf.openFile(target);
                return;
            }
        }
        leaf.openFile(file);
    }

    buildEventDOM(dayCol, startTime, durationMin, hex, title, opts) {
        opts = opts || {};
        var top = (startTime - START_HOUR) * HOUR_HEIGHT;
        var height = (durationMin / 60) * HOUR_HEIGHT;
        var isInstant = durationMin === 0;

        if (isInstant) {
            if (top < 0 || top > (END_HOUR - START_HOUR) * HOUR_HEIGHT) return null;
        } else {
            // Clamp to visible range
            if (top < 0) { height += top; top = 0; }
            if (top + height > (END_HOUR - START_HOUR) * HOUR_HEIGHT) {
                height = (END_HOUR - START_HOUR) * HOUR_HEIGHT - top;
            }
            if (height <= 0) return null;
        }

        var cls = opts.isDraft ? ' cal-event-draft' : '';

        var timeStr = fmtTime(startTime);
        if (!isInstant) timeStr += ' \u2013 ' + fmtTime(startTime + durationMin / 60);

        var el, titleEl, timeEl, shape;

        if (isInstant) {
            el = dayCol.createDiv({ cls: 'cal-event-instant' + cls });
            el.style.top = top + 'px';
            shape = el.createEl('span', { cls: 'cal-event-instant-dot' });
            shape.style.background = hex;
            var textWrap = el.createDiv({ cls: 'cal-event-line-text' });
            titleEl = textWrap.createDiv({ cls: 'cal-event-title', text: title || '' });
            timeEl = textWrap.createDiv({ cls: 'cal-event-time', text: timeStr });
        } else if (this.plugin.settings.lineMode) {
            el = dayCol.createDiv({ cls: 'cal-event-line' + cls });
            el.style.top = top + 'px';
            el.style.height = height + 'px';
            el.style.setProperty('--ev-h', height + 'px');

            shape = el.createDiv({ cls: 'cal-event-line-shape' });
            shape.style.height = height + 'px';
            shape.style.background = hex;

            var textWrap = el.createDiv({ cls: 'cal-event-line-text' });
            if (opts.folderLabel) {
                textWrap.createDiv({ cls: 'cal-event-folder', text: opts.folderLabel });
            }
            titleEl = textWrap.createDiv({ cls: 'cal-event-title', text: title || '' });
            timeEl = textWrap.createDiv({ cls: 'cal-event-time', text: timeStr });
        } else {
            var color = colorFromHex(hex);
            el = dayCol.createDiv({ cls: 'cal-event' + cls });
            el.style.top = top + 'px';
            el.style.background = color.bg;
            el.style.borderLeft = '3px solid ' + color.border;
            el.style.setProperty('--ev-h', height + 'px');
            el.dataset.bg = color.bg;
            el.dataset.bgSolid = hex;

            if (opts.folderLabel) {
                el.createDiv({ cls: 'cal-event-folder', text: opts.folderLabel });
            }
            titleEl = el.createDiv({ cls: 'cal-event-title', text: title || '' });
            timeEl = el.createDiv({ cls: 'cal-event-time', text: timeStr });
        }

        // Multi-day segment styling
        if (opts.multiDayStart) el.classList.add('cal-event-multiday-start');
        if (opts.multiDayEnd) el.classList.add('cal-event-multiday-end');
        if (opts.multiDayMiddle) el.classList.add('cal-event-multiday-mid');

        return { el: el, titleEl: titleEl, timeEl: timeEl, shape: shape, top: top, height: height };
    }

    renderEvent(dayCol, layoutItem) {
        var self = this;
        var ev = layoutItem.event;
        var colIndex = layoutItem.colIndex;
        var totalCols = layoutItem.totalCols;
        var rules = this.plugin.settings.colorRules;
        var hex = resolveColor(matchColorRules(rules, ev.file, ev.fm) || this.plugin.settings.defaultColor);

        var opts = { folderLabel: ev.folderLabel };
        if (ev.isMultiDayStart) opts.multiDayStart = true;
        if (ev.isMultiDayEnd) opts.multiDayEnd = true;
        if (ev.isMultiDayMiddle) opts.multiDayMiddle = true;
        var result = this.buildEventDOM(dayCol, ev.startTime, ev.durationMin, hex, ev.title, opts);
        if (!result) return;

        var el = result.el;

        if (totalCols > 1) {
            var pct = 100 / totalCols;
            el.style.left = (colIndex * pct) + '%';
            el.style.width = 'calc(' + pct + '% - 2px)';
            el.style.right = 'auto';
        }

        el.addEventListener('mouseenter', function () { el.classList.add('cal-event-hover'); });
        el.addEventListener('mouseleave', function () { el.classList.remove('cal-event-hover'); });
        el.addEventListener('mousedown', function (e) { e.stopPropagation(); });
        el.addEventListener('click', function (e) {
            e.stopPropagation();
            self.openNote(ev.file, ev.fm);
        });
        el.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            e.stopPropagation();
            self.showEventContextMenu(e, ev, el, result);
        });
    }

    // ── Render a journey block ────────────────────────────────
    renderJourney(dayCol, journey) {
        var top = (journey.startTime - START_HOUR) * HOUR_HEIGHT;
        var height = (journey.durationMin / 60) * HOUR_HEIGHT;

        // Clamp to visible range
        if (top < 0) { height += top; top = 0; }
        if (top + height > (END_HOUR - START_HOUR) * HOUR_HEIGHT) {
            height = (END_HOUR - START_HOUR) * HOUR_HEIGHT - top;
        }
        if (height <= 0) return;

        var cls = 'cal-journey';
        if (journey.isWarning) cls += ' cal-journey-warning';

        var durLabel = journey.travelMin + 'm';

        if (this.plugin.settings.lineMode) {
            // Line-style journey
            var marker = dayCol.createDiv({ cls: cls + ' cal-journey-line' });
            marker.style.top = top + 'px';
            marker.style.height = height + 'px';

            var line = marker.createDiv({ cls: 'cal-journey-line-bar' });
            line.style.height = height + 'px';

            var textWrap = marker.createDiv({ cls: 'cal-journey-text' });
            textWrap.createDiv({ cls: 'cal-journey-title', text: journey.title });
            textWrap.createDiv({ cls: 'cal-journey-duration', text: durLabel });
        } else {
            // Block-style journey
            var block = dayCol.createDiv({ cls: cls });
            block.style.top = top + 'px';
            block.style.setProperty('--ev-h', height + 'px');

            block.createDiv({ cls: 'cal-journey-title', text: journey.title });
            block.createDiv({ cls: 'cal-journey-duration', text: durLabel });
        }
    }

    // ── Render an all-day task pill ─────────────────────────────
    renderTaskAllDay(allDayCol, task) {
        var self = this;
        var rules = this.plugin.settings.colorRules;
        var hex = resolveColor(matchColorRules(rules, task.file, task.fm)
            || this.plugin.settings.defaultColor);
        var color = colorFromHex(hex);

        if (this.plugin.settings.lineMode) {
            // ── Line mode: colored bar + text (consistent with event lines)
            var pill = allDayCol.createDiv({ cls: 'cal-task-allday cal-task-allday-line' });

            var shape = pill.createDiv({ cls: 'cal-task-allday-line-shape' });
            shape.style.background = hex;

            var textWrap = pill.createDiv({ cls: 'cal-task-allday-line-text' });
            if (task.folderLabel) {
                textWrap.createEl('span', { cls: 'cal-task-label', text: task.folderLabel + ': ' });
            }
            textWrap.createEl('span', { cls: 'cal-task-title', text: task.title });

            pill.addEventListener('mouseenter', function () {
                pill.classList.add('cal-task-hover');
            });
            pill.addEventListener('mouseleave', function () {
                pill.classList.remove('cal-task-hover');
            });
        } else {
            var pill = allDayCol.createDiv({ cls: 'cal-task-allday' });
            pill.style.background = color.bg;
            pill.style.borderLeft = '3px solid ' + color.border;

            if (task.folderLabel) {
                pill.createEl('span', { cls: 'cal-task-label', text: task.folderLabel + ': ' });
            }
            pill.createEl('span', { cls: 'cal-task-title', text: task.title });

            pill.addEventListener('mouseenter', function () {
                pill.classList.add('cal-task-hover');
                pill.style.background = color.border;
            });
            pill.addEventListener('mouseleave', function () {
                pill.classList.remove('cal-task-hover');
                pill.style.background = color.bg;
            });
        }
        pill.addEventListener('click', function () {
            self.openNote(task.file, task.fm);
        });
        pill.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            self.showContextMenu(e, task.file, task.fm);
        });
    }

    // ── Render a timed task marker ──────────────────────────────
    renderTaskTimed(dayCol, task) {
        var self = this;
        var top = (task.startTime - START_HOUR) * HOUR_HEIGHT;
        if (top < 0 || top > (END_HOUR - START_HOUR) * HOUR_HEIGHT) return;

        var rules = this.plugin.settings.colorRules;
        var hex = resolveColor(matchColorRules(rules, task.file, task.fm)
            || this.plugin.settings.defaultColor);
        var color = colorFromHex(hex);

        var marker = dayCol.createDiv({ cls: 'cal-task-timed' });
        marker.style.top = top + 'px';
        if (!this.plugin.settings.lineMode) {
            marker.style.borderColor = color.border;
            marker.style.background = color.bg;
        }

        var timeStr = fmtTime(task.startTime);

        marker.createEl('span', { cls: 'cal-task-timed-dot' }).style.background = hex;
        marker.createEl('span', {
            cls: 'cal-task-timed-text',
            text: timeStr + ' ' + task.title,
        });

        marker.addEventListener('click', function () {
            self.openNote(task.file, task.fm);
        });
        marker.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            self.showContextMenu(e, task.file, task.fm);
        });
    }

    // ── Add shared menu items (Open / Hide / Delete) ──────────────
    _addCommonMenuItems(menu, file, fm) {
        var self = this;
        menu.addItem(function (item) {
            item.setTitle('Open note')
                .setIcon('file-text')
                .onClick(function () { self.openNote(file, fm); });
        });
        menu.addItem(function (item) {
            item.setTitle('Hide')
                .setIcon('eye-off')
                .onClick(function () {
                    var paths = self.plugin.settings.hiddenPaths;
                    if (paths.indexOf(file.path) === -1) paths.push(file.path);
                    self.plugin.saveSettings();
                });
        });
        menu.addSeparator();
        menu.addItem(function (item) {
            item.setTitle('Delete file')
                .setIcon('trash')
                .onClick(function () { self.app.vault.trash(file, true); });
        });
    }

    showContextMenu(e, file, fm) {
        var menu = new obsidian.Menu();
        this._addCommonMenuItems(menu, file, fm);
        menu.showAtMouseEvent(e);
    }

    showEventContextMenu(e, ev, el, result) {
        var self = this;
        var menu = new obsidian.Menu();
        menu.addItem(function (item) {
            item.setTitle('Rename')
                .setIcon('pencil')
                .onClick(function () { self.renameEvent(ev, el, result); });
        });
        menu.addItem(function (item) {
            item.setTitle('Change time')
                .setIcon('clock')
                .onClick(function () { self.editEventTime(ev, el, result); });
        });
        this._addCommonMenuItems(menu, ev.file, ev.fm);
        menu.showAtMouseEvent(e);
    }

    renameEvent(ev, el, result) {
        var self = this;
        var titleEl = result.titleEl;
        var origTitle = ev.title;

        el.classList.add('cal-event-draft');
        el.style.zIndex = '10';

        titleEl.setAttribute('contenteditable', 'plaintext-only');
        if (titleEl.contentEditable !== 'plaintext-only') titleEl.contentEditable = 'true';
        titleEl.dataset.placeholder = 'Event name';

        var done = false;
        async function commit() {
            if (done) return;
            done = true;
            var newTitle = titleEl.textContent.trim();
            if (newTitle && newTitle !== origTitle) {
                try {
                    await self.app.fileManager.processFrontMatter(ev.file, function (fm) {
                        fm.displayTitle = newTitle;
                    });
                } catch (e) {
                    console.error('iris-calendar: failed to save title', e);
                    new obsidian.Notice('Failed to save event title');
                }
            }
            cleanup();
        }

        function cancel() {
            if (done) return;
            done = true;
            titleEl.textContent = origTitle;
            cleanup();
        }

        function cleanup() {
            titleEl.removeAttribute('contenteditable');
            el.classList.remove('cal-event-draft');
            el.style.zIndex = '';
            document.removeEventListener('mousedown', onClickAway);
        }

        titleEl.addEventListener('keydown', function handler(e) {
            if (e.key === 'Enter') { e.preventDefault(); commit(); titleEl.removeEventListener('keydown', handler); }
            if (e.key === 'Escape') { e.preventDefault(); cancel(); titleEl.removeEventListener('keydown', handler); }
        });

        var onClickAway = function (e) {
            if (!el.contains(e.target)) commit();
        };
        setTimeout(function () {
            document.addEventListener('mousedown', onClickAway);
        }, 10);

        titleEl.focus();
        var range = document.createRange();
        range.selectNodeContents(titleEl);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    editEventTime(ev, el, result) {
        var self = this;
        var timeEl = result.timeEl;
        var shape = result.shape;
        var dayCol = el.parentNode;

        var currentStart = ev.startTime;
        var currentDur = ev.durationMin;
        var origStart = ev.startTime;
        var origDur = ev.durationMin;
        var dragType = null;
        var dragOffset = 0;

        el.classList.add('cal-event-draft', 'cal-event-editing');
        el.style.zIndex = '10';

        // Block the original click handler (which opens the note)
        function blockClick(e) {
            e.stopImmediatePropagation();
            e.preventDefault();
        }
        el.addEventListener('click', blockClick, true);

        // Add resize handles (always, so instant events can be expanded)
        var resizeTop = el.createDiv({ cls: 'cal-event-resize-handle cal-event-resize-top' });
        var resizeBottom = el.createDiv({ cls: 'cal-event-resize-handle cal-event-resize-bottom' });
        var wasInstant = currentDur === 0;

        function updateVisuals() {
            var top = (currentStart - START_HOUR) * HOUR_HEIGHT;
            el.style.top = top + 'px';
            var startStr = fmtTime(currentStart);
            if (currentDur > 0) {
                // Transition from instant to timed appearance
                if (wasInstant && el.classList.contains('cal-event-instant')) {
                    el.classList.remove('cal-event-instant');
                    el.classList.add('cal-event-line');
                    if (shape) {
                        shape.classList.remove('cal-event-instant-dot');
                        shape.classList.add('cal-event-line-shape');
                        shape.style.borderRadius = '';
                    }
                }
                var height = (currentDur / 60) * HOUR_HEIGHT;
                el.style.height = height + 'px';
                el.style.setProperty('--ev-h', height + 'px');
                if (shape) shape.style.height = height + 'px';
                timeEl.textContent = startStr + ' \u2013 ' + fmtTime(currentStart + currentDur / 60);
            } else {
                // Transition back to instant appearance
                if (wasInstant && !el.classList.contains('cal-event-instant')) {
                    el.classList.remove('cal-event-line');
                    el.classList.add('cal-event-instant');
                    if (shape) {
                        shape.classList.remove('cal-event-line-shape');
                        shape.classList.add('cal-event-instant-dot');
                        shape.style.height = '';
                    }
                    el.style.height = '';
                    el.style.removeProperty('--ev-h');
                }
                timeEl.textContent = startStr;
            }
        }

        var cachedColRect = null;

        function onMouseDown(e) {
            e.preventDefault();
            e.stopPropagation();

            cachedColRect = dayCol.getBoundingClientRect();

            if (resizeTop && e.target === resizeTop) {
                dragType = 'resize-top';
            } else if (resizeBottom && e.target === resizeBottom) {
                dragType = 'resize-bottom';
            } else {
                dragType = 'move';
                var clickHour = START_HOUR + (e.clientY - cachedColRect.top) / HOUR_HEIGHT;
                dragOffset = clickHour - currentStart;
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }

        function onMouseMove(e) {
            var colRect = cachedColRect;
            var mouseHour = START_HOUR + (e.clientY - colRect.top) / HOUR_HEIGHT;
            var currentEnd = currentStart + currentDur / 60;

            if (dragType === 'move') {
                var newStart = snapToQuarter(mouseHour - dragOffset);
                var maxStart = currentDur > 0 ? END_HOUR - currentDur / 60 : END_HOUR;
                currentStart = Math.max(START_HOUR, Math.min(maxStart, newStart));
            } else if (dragType === 'resize-top') {
                var newStart = snapToQuarter(mouseHour);
                newStart = Math.max(START_HOUR, Math.min(currentEnd, newStart));
                currentDur = (currentEnd - newStart) * 60;
                currentStart = newStart;
            } else {
                var newEnd = snapToQuarter(mouseHour);
                newEnd = Math.max(currentStart, Math.min(END_HOUR, newEnd));
                currentDur = (newEnd - currentStart) * 60;
            }
            updateVisuals();
        }

        function onMouseUp() {
            dragType = null;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        el.addEventListener('mousedown', onMouseDown);

        var done = false;
        async function commit() {
            if (done) return;
            done = true;

            var changed = currentStart !== origStart || currentDur !== origDur;
            if (!changed) { cleanup(); return; }

            try {
                await self.app.fileManager.processFrontMatter(ev.file, function (fm) {
                    fm.starts = fmtTime(currentStart);
                    if (currentDur > 0) {
                        fm.endTime = fmtTime(currentStart + currentDur / 60);
                        fm.duration = fmtDuration(currentDur);
                    } else {
                        fm.duration = '0m';
                        delete fm.endTime;
                    }
                });
            } catch (e) {
                console.error('iris-calendar: failed to save event time', e);
                new obsidian.Notice('Failed to save event time');
            }
            cleanup();
        }

        function cancel() {
            if (done) return;
            done = true;
            cleanup();
            currentStart = origStart;
            currentDur = origDur;
            updateVisuals();
        }

        function cleanup() {
            el.classList.remove('cal-event-draft', 'cal-event-editing');
            el.style.zIndex = '';
            el.removeEventListener('click', blockClick, true);
            el.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('mousedown', onClickAway);
            document.removeEventListener('keydown', onKey);
            if (resizeTop) resizeTop.remove();
            if (resizeBottom) resizeBottom.remove();
        }

        function onKey(e) {
            if (e.key === 'Enter') { e.preventDefault(); commit(); }
            if (e.key === 'Escape') { e.preventDefault(); cancel(); }
        }
        document.addEventListener('keydown', onKey);

        var onClickAway = function (e) {
            if (dragType) return;
            if (!el.contains(e.target)) commit();
        };
        setTimeout(function () {
            document.addEventListener('mousedown', onClickAway);
        }, 10);
    }

    renderNowLine(dayCol) {
        var now = new Date();
        var hours = now.getHours() + now.getMinutes() / 60;
        if (hours < START_HOUR || hours > END_HOUR) return;

        var top = (hours - START_HOUR) * HOUR_HEIGHT;
        var line = dayCol.createDiv({ cls: 'cal-now-line' });
        line.style.top = top + 'px';
        line.dataset.nowLine = 'true';
    }

    updateNowLine() {
        var lines = this.contentEl.querySelectorAll('[data-now-line]');
        if (lines.length === 0) {
            // Now line missing (view went stale) — full re-render
            this.render();
            return;
        }
        var now = new Date();
        var hours = now.getHours() + now.getMinutes() / 60;
        if (hours < START_HOUR || hours > END_HOUR) {
            lines.forEach(function (l) { l.style.display = 'none'; });
            return;
        }
        var top = (hours - START_HOUR) * HOUR_HEIGHT;
        lines.forEach(function (l) {
            l.style.top = top + 'px';
            l.style.display = '';
        });
    }
}

// ══════════════════════════════════════════════════════════════════
//  CalendarPlugin
// ══════════════════════════════════════════════════════════════════
class CalendarPlugin extends obsidian.Plugin {
    async onload() {
        var self = this;
        this._moduleColorsDirty = true;

        await this.loadSettings();

        this.registerView(VIEW_TYPE_CALENDAR, function (leaf) {
            return new CalendarView(leaf, self);
        });

        this.addRibbonIcon('calendar', 'Calendar', function () {
            self.activateView();
        });

        this.addCommand({
            id: 'open-calendar-view',
            name: 'Open calendar',
            callback: function () { self.activateView(); },
        });

        this.addCommand({
            id: 'unhide-all-calendar-items',
            name: 'Unhide all hidden calendar items',
            callback: function () {
                if (self.settings.hiddenPaths.length === 0) {
                    new obsidian.Notice('No hidden items');
                    return;
                }
                var count = self.settings.hiddenPaths.length;
                self.settings.hiddenPaths = [];
                self.saveSettings();
                new obsidian.Notice('Restored ' + count + ' hidden item' + (count > 1 ? 's' : ''));
            },
        });

        this.addSettingTab(new CalendarSettingTab(this.app, this));

        // ── Google Calendar sync ─────────────────────────────────
        this.addCommand({
            id: 'sync-google-calendar',
            name: 'Sync Google Calendar',
            callback: function () { self.syncGoogleCalendar(); },
        });

        // Auto-sync interval
        if (this.settings.gcalSyncIntervalMin > 0 && this.settings.gcalFeeds.length > 0) {
            this.registerInterval(window.setInterval(function () {
                self.syncGoogleCalendar(true);
            }, self.settings.gcalSyncIntervalMin * 60000));
        }

        // Initial sync on startup
        this.app.workspace.onLayoutReady(function () {
            if (self.settings.gcalFeeds.length > 0) {
                // Small delay to let metadata cache populate
                setTimeout(function () { self.syncGoogleCalendar(true); }, 3000);
            }
        });

        // ── Status bar countdown to next event ───────────────────
        this.statusBarEl = this.addStatusBarItem();
        this.statusBarEl.addClass('cal-status-countdown');
        this.registerInterval(window.setInterval(function () {
            self.updateStatusBarCountdown();
        }, 15000)); // tick every 15 seconds
        // Initial update once metadata is ready
        this.app.workspace.onLayoutReady(function () {
            self.updateStatusBarCountdown();
        });

        // Sync module colors once metadata cache is ready
        this.app.workspace.onLayoutReady(function () {
            self.syncColorsFromModules();
        });

        // ── Connect to Iris Maps plugin for journey data ─────────
        this.irisMaps = null;
        this.app.workspace.onLayoutReady(function () {
            self.irisMaps = self.app.plugins.plugins['iris-maps'] || null;
        });
        // Re-render when iris-maps data changes
        this.registerEvent(this.app.workspace.on('iris-maps:changed', function () {
            self.irisMaps = self.app.plugins.plugins['iris-maps'] || null;
            self.reRenderViews();
        }));

        // Annotate date frontmatter with relative labels
        this._datePropsTimer = null;
        var scheduleDateProps = function () {
            if (self._datePropsTimer) return;
            self._datePropsTimer = setTimeout(function () {
                self._datePropsTimer = null;
                self.processDateProperties();
            }, 200);
        };
        this.registerEvent(this.app.metadataCache.on('changed', scheduleDateProps));
        this.registerEvent(this.app.workspace.on('active-leaf-change', scheduleDateProps));

        // Open sidebar on startup
        this.app.workspace.onLayoutReady(function () {
            self.activateSidebar();
        });
    }

    async activateSidebar() {
        var existing = this.app.workspace.getLeavesOfType(VIEW_TYPE_CALENDAR);
        for (var i = 0; i < existing.length; i++) {
            var root = existing[i].getRoot();
            if (root !== this.app.workspace.rootSplit) return; // already in a sidebar
        }
        var leaf = this.app.workspace.getRightLeaf(false);
        await leaf.setViewState({ type: VIEW_TYPE_CALENDAR, active: true });
        this.app.workspace.revealLeaf(leaf);
    }

    processDateProperties() {
        var self = this;
        var props = document.querySelectorAll('.metadata-property');
        for (var i = 0; i < props.length; i++) {
            var prop = props[i];
            var valueEl = prop.querySelector('.metadata-property-value');
            if (!valueEl) continue;
            var input = valueEl.querySelector('input');
            var text = input ? input.value : valueEl.textContent;
            if (!text) continue;
            text = text.trim();
            if (!/^\d{4}-\d{2}-\d{2}/.test(text)) continue;
            var dateOnly = text.slice(0, 10);
            var rel = relativeDate(dateOnly);
            var existing = prop.querySelector('.cal-relative-date');
            if (existing) {
                if (existing.dataset.date === dateOnly) continue;
                existing.textContent = rel ? '(' + rel + ')' : '';
                existing.dataset.date = dateOnly;
                continue;
            }
            if (!rel) continue;
            var label = document.createElement('span');
            label.className = 'cal-relative-date';
            label.textContent = '(' + rel + ')';
            label.dataset.date = dateOnly;
            label.addEventListener('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                self.activateViewOnDate(this.dataset.date);
            });
            valueEl.appendChild(label);
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        // Migrate old string[] folders to {path, label}[]
        if (this.settings.folders.length > 0 && typeof this.settings.folders[0] === 'string') {
            this.settings.folders = this.settings.folders.map(function (f) {
                return { path: f, label: f };
            });
        }
        if (!this.settings.taskFolders) this.settings.taskFolders = [];
        if (!Array.isArray(this.settings.hiddenPaths)) this.settings.hiddenPaths = [];
        if (!this.settings.gcalFeeds) this.settings.gcalFeeds = [];
        if (this.settings.gcalSyncIntervalMin == null) this.settings.gcalSyncIntervalMin = 30;
        // Load weekMap from Iris plugin
        await this.loadWeekMap();
    }

    syncColorsFromModules() {
        var rules = [];
        var files = this.app.vault.getMarkdownFiles();
        for (var i = 0; i < files.length; i++) {
            if (!files[i].path.startsWith('Modules/')) continue;
            var cache = this.app.metadataCache.getFileCache(files[i]);
            if (!cache || !cache.frontmatter) continue;
            var fm = cache.frontmatter;
            if (fm.module && fm.associatedColour) {
                rules.push({
                    type: 'frontmatter',
                    key: 'module',
                    value: fm.module,
                    color: fm.associatedColour,
                });
            }
        }
        this.settings.colorRules = rules;
    }

    async loadWeekMap() {
        this.weekMap = {};
        try {
            var adapter = this.app.vault.adapter;
            var irisDataPath = this.app.vault.configDir + '/plugins/iris/data.json';
            var exists = await adapter.exists(irisDataPath);
            if (exists) {
                var raw = await adapter.read(irisDataPath);
                var data = JSON.parse(raw);
                if (data.weekMap) {
                    this.weekMap = data.weekMap;
                }
            }
        } catch (e) {
            console.log('Iris Calendar: Could not load Iris weekMap', e);
        }
    }

    // Look up academic week number for a date string (YYYY-MM-DD)
    getAcademicWeek(dateStr) {
        var wm = this.weekMap || {};
        var target = new Date(dateStr + 'T00:00:00').getTime();
        if (isNaN(target)) return null;
        var weekMs = 7 * 24 * 60 * 60 * 1000;
        for (var key in wm) {
            var start = new Date(wm[key] + 'T00:00:00').getTime();
            if (target >= start && target < start + weekMs) return key;
        }
        return null;
    }

    reRenderViews() {
        var leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_CALENDAR);
        for (var i = 0; i < leaves.length; i++) {
            var view = leaves[i].view;
            if (view && view.render) view.render();
        }
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.reRenderViews();
    }

    async activateViewOnDate(dateStr) {
        await this.activateView();
        var parts = dateStr.split('-');
        var target = new Date(+parts[0], +parts[1] - 1, +parts[2]);
        var leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_CALENDAR);
        for (var i = 0; i < leaves.length; i++) {
            var root = leaves[i].getRoot();
            if (root === this.app.workspace.rootSplit) {
                var view = leaves[i].view;
                view.weekStart = getMonday(target);
                view.focusedDate = dateStr;
                view.render();
                return;
            }
        }
    }

    async activateView() {
        var workspace = this.app.workspace;

        // If already open in main area, reveal it
        var existing = workspace.getLeavesOfType(VIEW_TYPE_CALENDAR);
        for (var i = 0; i < existing.length; i++) {
            var root = existing[i].getRoot();
            if (root === workspace.rootSplit) {
                workspace.revealLeaf(existing[i]);
                return;
            }
        }

        // Open in a new tab (main area)
        var leaf = workspace.getLeaf('tab');
        await leaf.setViewState({ type: VIEW_TYPE_CALENDAR, active: true });
        workspace.revealLeaf(leaf);
    }


    async ensureFolder(path) {
        var parts = path.split('/');
        var current = '';
        for (var i = 0; i < parts.length; i++) {
            current = current ? current + '/' + parts[i] : parts[i];
            if (!this.app.vault.getAbstractFileByPath(current)) {
                await this.app.vault.createFolder(current);
            }
        }
    }

    // ── Google Calendar sync ─────────────────────────────────────
    async syncGoogleCalendar(silent) {
        var self = this;
        var feeds = this.settings.gcalFeeds;
        if (!feeds || feeds.length === 0) {
            if (!silent) new obsidian.Notice('No Google Calendar feeds configured. Add one in settings.');
            return;
        }

        if (!silent) new obsidian.Notice('Syncing Google Calendar...');

        var syncFolder = 'Events/Gcal';
        try {
            await this.ensureFolder(syncFolder);
        } catch (e) {
            console.error('Iris Calendar: Failed to create sync folder:', e);
        }

        var totalCreated = 0, totalUpdated = 0, totalDeleted = 0;

        for (var f = 0; f < feeds.length; f++) {
            var feed = feeds[f];
            try {
                var resp = await obsidian.requestUrl({ url: feed.url });
                if (!resp.text || !resp.text.includes('VCALENDAR')) {
                    if (!silent) new obsidian.Notice('Feed "' + (feed.label || 'feed') + '" did not return valid ICS data. Make sure you use the "Secret address in iCal format" URL (ends in .ics).');
                    continue;
                }
                var parsed = parseICS(resp.text);
                console.log('Iris Calendar: Parsed ' + parsed.length + ' events from "' + feed.label + '"');

                // Build UID → event map from feed
                var feedUids = {};
                for (var p = 0; p < parsed.length; p++) {
                    var ev = parsed[p];
                    if (!ev.uid || !ev.dtstart) continue;
                    feedUids[ev.uid] = ev;
                }

                // Scan existing local files for gcalUid
                var localByUid = {};
                var vault = this.app.vault;
                var allFiles = vault.getMarkdownFiles();
                for (var i = 0; i < allFiles.length; i++) {
                    var file = allFiles[i];
                    if (!file.path.startsWith(syncFolder + '/')) continue;
                    var cache = this.app.metadataCache.getFileCache(file);
                    if (!cache || !cache.frontmatter || !cache.frontmatter.gcalUid) continue;
                    localByUid[cache.frontmatter.gcalUid] = file;
                }

                // Create or update events
                for (var uid in feedUids) {
                    var gev = feedUids[uid];
                    var dateObj = gev.dtstart;
                    var dateStr = dateObj.getFullYear() + '-' +
                        String(dateObj.getMonth() + 1).padStart(2, '0') + '-' +
                        String(dateObj.getDate()).padStart(2, '0');
                    var startStr = fmtTime(dateObj.getHours() + dateObj.getMinutes() / 60);

                    // Compute duration
                    var durLabel = '';
                    var endStr = '';
                    if (gev.dtend) {
                        var durMin = Math.round((gev.dtend.getTime() - gev.dtstart.getTime()) / 60000);
                        if (durMin > 0) durLabel = fmtDuration(durMin);
                        endStr = fmtTime(gev.dtend.getHours() + gev.dtend.getMinutes() / 60);
                    }

                    var summary = (gev.summary || 'Untitled').replace(/\\/g, '');
                    var location = gev.location ? gev.location.replace(/\\/g, '') : '';

                    // Build frontmatter
                    var yaml = 'date: "' + dateStr + '"';
                    if (!gev.allDay) {
                        yaml += '\nstarts: "' + startStr + '"';
                        if (endStr) yaml += '\nendTime: "' + endStr + '"';
                        if (durLabel) yaml += '\nduration: "' + durLabel + '"';
                    }
                    yaml += '\ndisplayTitle: "' + summary.replace(/"/g, '\\"') + '"';
                    if (location) yaml += '\nlocation: "' + location.replace(/"/g, '\\"') + '"';
                    yaml += '\ngcalUid: "' + uid.replace(/"/g, '\\"') + '"';
                    if (feed.label) yaml += '\ngcalFeedLabel: "' + feed.label.replace(/"/g, '\\"') + '"';

                    var newFrontmatter = '---\n' + yaml + '\n---\n';

                    if (localByUid[uid]) {
                        // Update existing file if frontmatter changed
                        var existing = await vault.read(localByUid[uid]);
                        var existingFm = existing.match(/^---\n[\s\S]*?\n---\n/);
                        if (existingFm && existingFm[0] !== newFrontmatter) {
                            // Preserve any body content after frontmatter
                            var body = existing.slice(existingFm[0].length);
                            await vault.modify(localByUid[uid], newFrontmatter + body);
                            totalUpdated++;
                        }
                        delete localByUid[uid]; // Mark as handled
                    } else {
                        // Create new file
                        var safeName = dateStr + ' ' + startStr.replace(':', '-') + ' ' +
                            summary.replace(/[\\/:*?"<>|]/g, '-').substring(0, 60).trim();
                        var filePath = syncFolder + '/' + safeName + '.md';
                        var n = 1;
                        while (vault.getAbstractFileByPath(filePath)) {
                            filePath = syncFolder + '/' + safeName + ' ' + (++n) + '.md';
                        }
                        await vault.create(filePath, newFrontmatter);
                        totalCreated++;
                    }
                }

                // Delete local files whose UIDs are no longer in the feed
                for (var orphanUid in localByUid) {
                    var orphanFile = localByUid[orphanUid];
                    // Only delete files from this specific feed
                    var orphanCache = this.app.metadataCache.getFileCache(orphanFile);
                    if (orphanCache && orphanCache.frontmatter &&
                        orphanCache.frontmatter.gcalFeedLabel === feed.label) {
                        await vault.trash(orphanFile, true);
                        totalDeleted++;
                    }
                }

            } catch (e) {
                console.error('Iris Calendar: Google Calendar sync error for feed "' + feed.label + '":', e);
                if (!silent) new obsidian.Notice('Google Calendar sync failed for "' + (feed.label || 'feed') + '": ' + e.message);
            }
        }

        if (!silent) new obsidian.Notice('Google Calendar: ' + totalCreated + ' new, ' +
            totalUpdated + ' updated, ' + totalDeleted + ' removed');
    }

    // ── Status bar countdown ─────────────────────────────────────
    updateStatusBarCountdown() {
        var now = new Date();
        var todayStr = dateKey(now);
        var nowHours = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
        var s = this.settings;

        var best = null;
        var files = this.app.vault.getMarkdownFiles();

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (s.hiddenPaths.indexOf(file.path) !== -1) continue;
            var cache = this.app.metadataCache.getFileCache(file);
            if (!cache || !cache.frontmatter) continue;
            var fm = cache.frontmatter;

            // Resolve date + startTime from either event or timed-task fields
            var rawDate = null, timeVal = null;
            var evTime = fm.starts || fm.startTime || fm.time;
            if (fm.date && evTime && (s.folders.length === 0 || inFolders(file.path, s.folders))) {
                rawDate = fm.date;
                timeVal = evTime;
            } else if (fm.closes && fm.closeTime && inFolders(file.path, s.taskFolders)) {
                if (fm.dailytask === true && fm.status === 'completed') continue;
                rawDate = fm.closes;
                timeVal = fm.closeTime;
            }
            if (!rawDate) continue;

            var dateStr = fmDateStr(rawDate);
            if (dateStr !== todayStr) continue;
            var startTime = parseTimeVal(timeVal);
            if (startTime === null) continue;

            var minutesUntil = (startTime - nowHours) * 60;
            if (minutesUntil <= 0 || minutesUntil > 60) continue;
            if (!best || minutesUntil < best.minutesUntil) {
                best = { title: fm.displayTitle || formatTitle(file.basename), minutesUntil: minutesUntil };
            }
        }

        if (!best) {
            this.statusBarEl.setText('');
            this.statusBarEl.style.display = 'none';
            return;
        }
        this.statusBarEl.style.display = '';
        this.statusBarEl.setText(best.title + ' in ' + Math.ceil(best.minutesUntil) + 'm');
    }

    onunload() {
        if (this._datePropsTimer) clearTimeout(this._datePropsTimer);
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_CALENDAR);
    }
}

// ══════════════════════════════════════════════════════════════════
//  CalendarSettingTab
// ══════════════════════════════════════════════════════════════════
class CalendarSettingTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    // ── Helper: create a section card with icon header ──────────
    createSection(containerEl, icon, title, desc) {
        var section = containerEl.createDiv({ cls: 'cal-settings-section' });
        var header = section.createDiv({ cls: 'cal-settings-section-header' });
        var iconEl = header.createDiv({ cls: 'cal-settings-section-icon' });
        obsidian.setIcon(iconEl, icon);
        var textCol = header.createDiv();
        textCol.createEl('div', { cls: 'cal-settings-section-title', text: title });
        if (desc) textCol.createEl('div', { cls: 'cal-settings-section-desc', text: desc });
        return section;
    }

    // ── Helper: render folder chips list ──────────────────────────
    renderFolderChips(section, folders, settingsKey) {
        var self = this;
        if (folders.length === 0) {
            section.createDiv({ cls: 'cal-empty-state', text: 'No folders added yet.' });
            return;
        }
        var list = section.createDiv({ cls: 'cal-folder-list' });
        for (var i = 0; i < folders.length; i++) {
            (function (folder, idx) {
                var chip = list.createDiv({ cls: 'cal-folder-chip' });
                chip.createDiv({ cls: 'cal-folder-chip-path', text: folder.path });
                var labelWrap = chip.createDiv({ cls: 'cal-folder-chip-label' });
                var labelInput = labelWrap.createEl('input', {
                    type: 'text',
                    value: folder.label,
                    placeholder: 'Label',
                });
                labelInput.addEventListener('change', async function () {
                    self.plugin.settings[settingsKey][idx].label = labelInput.value;
                    await self.plugin.saveSettings();
                });
                var removeBtn = chip.createEl('button', { cls: 'cal-folder-chip-remove', attr: { 'aria-label': 'Remove' } });
                obsidian.setIcon(removeBtn, 'x');
                removeBtn.addEventListener('click', async function () {
                    self.plugin.settings[settingsKey].splice(idx, 1);
                    await self.plugin.saveSettings();
                    self.display();
                });
            })(folders[i], i);
        }
    }

    display() {
        var self = this;
        var containerEl = this.containerEl;
        containerEl.empty();

        // ── Appearance ────────────────────────────────────────────
        var appearSection = this.createSection(containerEl, 'eye',
            'Appearance',
            'Visual style for the calendar.');

        new obsidian.Setting(appearSection)
            .setName('Line mode')
            .setDesc('Show events as a dot with a line instead of filled blocks.')
            .addToggle(function (toggle) {
                toggle.setValue(self.plugin.settings.lineMode);
                toggle.onChange(async function (val) {
                    self.plugin.settings.lineMode = val;
                    await self.plugin.saveSettings();
                });
            });

        new obsidian.Setting(appearSection)
            .setName('Map mode')
            .setDesc('Show journey blocks between events at different locations. Uses Places/ folder for travel times.')
            .addToggle(function (toggle) {
                toggle.setValue(self.plugin.settings.mapMode);
                toggle.onChange(async function (val) {
                    self.plugin.settings.mapMode = val;
                    await self.plugin.saveSettings();
                });
            });

        // ── Folders ──────────────────────────────────────────────
        var folderSection = this.createSection(containerEl, 'folder',
            'Folders',
            'Folders to read notes from. Leave empty to include all folders.');

        this.renderFolderChips(folderSection, this.plugin.settings.folders, 'folders');

        new obsidian.Setting(folderSection)
            .addText(function (text) {
                text.setPlaceholder('Add folder...');
                text.inputEl.addEventListener('keydown', async function (e) {
                    if (e.key !== 'Enter') return;
                    var val = text.getValue().trim();
                    if (!val) return;
                    var exists = self.plugin.settings.folders.some(function (f) { return f.path === val; });
                    if (!exists) {
                        self.plugin.settings.folders.push({ path: val, label: val });
                        await self.plugin.saveSettings();
                    }
                    text.setValue('');
                    self.display();
                });
            });

        // ── Task Folders ────────────────────────────────────────
        var taskSection = this.createSection(containerEl, 'list-checks',
            'Task Folders',
            'Folders containing deadline/task notes. These show as markers or all-day pills.');

        this.renderFolderChips(taskSection, this.plugin.settings.taskFolders, 'taskFolders');

        new obsidian.Setting(taskSection)
            .addText(function (text) {
                text.setPlaceholder('Add task folder...');
                text.inputEl.addEventListener('keydown', async function (e) {
                    if (e.key !== 'Enter') return;
                    var val = text.getValue().trim();
                    if (!val) return;
                    var exists = self.plugin.settings.taskFolders.some(function (f) { return f.path === val; });
                    if (!exists) {
                        self.plugin.settings.taskFolders.push({ path: val, label: val });
                        await self.plugin.saveSettings();
                    }
                    text.setValue('');
                    self.display();
                });
            });

        // ── Google Calendar ─────────────────────────────────────
        var gcalSection = this.createSection(containerEl, 'cloud',
            'Google Calendar',
            'In Google Calendar: Settings > your calendar > Integrate calendar > "Secret address in iCal format". The URL should end in .ics');

        // Render existing feeds
        var gcalFeeds = this.plugin.settings.gcalFeeds;
        if (gcalFeeds.length === 0) {
            gcalSection.createDiv({ cls: 'cal-empty-state', text: 'No feeds added yet.' });
        } else {
            var feedList = gcalSection.createDiv({ cls: 'cal-folder-list' });
            for (var gi = 0; gi < gcalFeeds.length; gi++) {
                (function (feed, idx) {
                    var chip = feedList.createDiv({ cls: 'cal-folder-chip' });
                    var urlText = feed.url.length > 50 ? feed.url.substring(0, 47) + '...' : feed.url;
                    chip.createDiv({ cls: 'cal-folder-chip-path', text: feed.label || urlText });
                    var labelWrap = chip.createDiv({ cls: 'cal-folder-chip-label' });
                    var labelInput = labelWrap.createEl('input', {
                        type: 'text',
                        value: feed.label,
                        placeholder: 'Label',
                    });
                    labelInput.addEventListener('change', async function () {
                        self.plugin.settings.gcalFeeds[idx].label = labelInput.value;
                        await self.plugin.saveSettings();
                    });
                    var removeBtn = chip.createEl('button', { cls: 'cal-folder-chip-remove', attr: { 'aria-label': 'Remove' } });
                    obsidian.setIcon(removeBtn, 'x');
                    removeBtn.addEventListener('click', async function () {
                        self.plugin.settings.gcalFeeds.splice(idx, 1);
                        await self.plugin.saveSettings();
                        self.display();
                    });
                })(gcalFeeds[gi], gi);
            }
        }

        // Add feed inputs
        var addFeedRow = new obsidian.Setting(gcalSection)
            .setName('Add feed')
            .setDesc('Paste your ICS feed URL.');
        var feedUrlInput, feedLabelInput;
        addFeedRow.addText(function (text) {
            feedUrlInput = text;
            text.setPlaceholder('ICS feed URL...');
            text.inputEl.style.width = '250px';
        });
        addFeedRow.addText(function (text) {
            feedLabelInput = text;
            text.setPlaceholder('Label...');
            text.inputEl.style.width = '100px';
        });
        addFeedRow.addButton(function (btn) {
            btn.setButtonText('Add');
            btn.onClick(async function () {
                var url = feedUrlInput.getValue().trim();
                if (!url) return;
                var label = feedLabelInput ? feedLabelInput.getValue().trim() : '';
                var exists = self.plugin.settings.gcalFeeds.some(function (f) { return f.url === url; });
                if (!exists) {
                    self.plugin.settings.gcalFeeds.push({ url: url, label: label || 'Google Calendar' });
                    await self.plugin.saveSettings();
                }
                feedUrlInput.setValue('');
                if (feedLabelInput) feedLabelInput.setValue('');
                self.display();
            });
        });

        // Sync interval
        new obsidian.Setting(gcalSection)
            .setName('Sync interval')
            .setDesc('How often to automatically sync. Set to "Manual" to only sync via the ribbon icon or command.')
            .addDropdown(function (drop) {
                drop.addOption('0', 'Manual only');
                drop.addOption('15', 'Every 15 minutes');
                drop.addOption('30', 'Every 30 minutes');
                drop.addOption('60', 'Every hour');
                drop.setValue(String(self.plugin.settings.gcalSyncIntervalMin));
                drop.onChange(async function (val) {
                    self.plugin.settings.gcalSyncIntervalMin = parseInt(val, 10);
                    await self.plugin.saveSettings();
                });
            });

        // Sync now button
        new obsidian.Setting(gcalSection)
            .setName('Sync now')
            .setDesc('Manually trigger a sync of all configured feeds.')
            .addButton(function (btn) {
                btn.setButtonText('Sync now');
                btn.setCta();
                btn.onClick(function () {
                    self.plugin.syncGoogleCalendar();
                });
            });

    }
}

module.exports = CalendarPlugin;
