'use strict';

const path = require('path');
const {
  Plugin,
  PluginSettingTab,
  Setting,
  Modal,
  Notice,
  ItemView,
  TFile,
  normalizePath,
  requestUrl,
  parseYaml,
  stringifyYaml,
  Platform,
} = require('obsidian');

const VIEW_TYPE_VINYL_COLLECTION = 'vinyl-catalog-view';

const DEFAULT_SETTINGS = {
  collectionFolder: 'Vinyl',
  artistsFolder: 'Vinyl/Artists',
  coversFolder: 'Vinyl/covers',
  language: 'auto',
};

const I18N = {
  ru: {
    'view.displayText': 'Коллекция винила',
    'view.title': 'Коллекция винила',
    'view.addAria': 'Добавить пластинку',
    'view.searchPlaceholder': 'Поиск: артист, название, год',
    'view.modeTable': 'Таблица',
    'view.modeCards': 'Карточки',
    'view.importDiscogs': 'Импорт Discogs',
    'view.export': 'Экспорт',
    'view.exportCards': 'Карточки PNG/JPG',
    'view.summaryTotal': 'Всего: {count}',
    'view.summarySum': 'Сумма: {sum} {currency}',
    'view.tableArtist': 'Артист',
    'view.tableTitle': 'Название',
    'view.tableYear': 'Год',
    'view.tablePrice': 'Цена',
    'view.tableAdded': 'Добавлено',
    'view.hide': 'Скрыть',
    'view.open': 'Открыть',
    'view.hideConfirm': 'Скрыть «{title}» из коллекции?',
    'view.hiddenNotice': 'Запись скрыта',
    'view.empty': 'Нет записей. Нажми «Добавить», чтобы создать первую карточку.',
    'view.noCover': 'Нет обложки',
    'view.yearFallback': 'Год —',
    'view.priceFallback': 'Цена —',
    'view.imageThemeDark': 'Тема: темная',
    'view.imageThemeLight': 'Тема: светлая',
    'view.cardsCount': 'Карточек: {count} • {theme}',

    'modal.addTitle': 'Добавить пластинку',
    'modal.artist': 'Артист *',
    'modal.artistPh': 'Например: Linkin Park',
    'modal.title': 'Название *',
    'modal.titlePh': 'Например: Meteora',
    'modal.year': 'Год',
    'modal.yearPh': 'Например: 2003',
    'modal.price': 'Цена',
    'modal.pricePh': 'Например: 3990',
    'modal.coverUrl': 'URL обложки',
    'modal.coverUrlDesc': 'jpg, png, webp или svg',
    'modal.cancel': 'Отмена',
    'modal.create': 'Создать',
    'modal.creating': 'Создаю...',
    'modal.requiredError': 'Поля «Артист» и «Название» обязательны.',
    'modal.createdNotice': 'Карточка пластинки создана',
    'modal.createError': 'не удалось создать карточку',
    'modal.errorPrefix': 'Ошибка: {message}',

    'dialog.importTitle': 'Импорт Discogs CSV',
    'dialog.importCsvLabel': 'CSV файл экспорта Discogs:',
    'dialog.importUpsert': 'Обновлять существующие карточки (по release_id и артист+название)',
    'dialog.importCovers': 'Автоподтягивать обложки (по release_id, только если cover пустой)',
    'dialog.importWarning': 'ВНИМАНИЕ: ЭКСПЕРИМЕНТАЛЬНАЯ ФИЧА, МОЖЕТ РАБОТАТЬ НЕККОРЕКТНО.',
    'dialog.importBtn': 'Импортировать',
    'dialog.importingBtn': 'Импортирую...',
    'dialog.importBackfillBtn': 'Докачать обложки',
    'dialog.importFileSelected': 'Файл выбран: {name}',
    'dialog.importNoFileBackfill': 'Файл не выбран: будут докачаны обложки к существующим записям.',
    'dialog.importNeedFileOrBackfill': 'Выберите CSV файл или включите докачку обложек.',
    'dialog.importReadCsv': 'Чтение и обработка CSV...',
    'dialog.importFindMissing': 'Поиск записей без обложки...',
    'dialog.importBackfillProgress': 'Докачка обложек: {current}/{total}',
    'dialog.importRowsProgress': 'Импорт записей: {current}/{total}',
    'dialog.backfillScanned': 'Проверено: {count}',
    'dialog.backfillCandidates': 'Кандидатов: {count}',
    'dialog.backfillAttached': 'Обложки: +{count}',
    'dialog.backfillSkipped': 'Пропущено: {count}',
    'dialog.backfillErrors': 'Ошибок: {count}',
    'dialog.backfillErrorsNotice': 'Докачка обложек с ошибками ({count})',
    'dialog.backfillDoneNotice': 'Докачка обложек завершена',
    'dialog.importCreated': 'Создано: {count}',
    'dialog.importUpdated': 'Обновлено: {count}',
    'dialog.importCoversAttached': 'Обложки: +{count}',
    'dialog.importSkipped': 'Пропущено: {count}',
    'dialog.importErrors': 'Ошибок: {count}',
    'dialog.importErrorsNotice': 'Импорт завершён с ошибками ({count})',
    'dialog.importDoneNotice': 'Импорт Discogs завершён',
    'dialog.importCsvFailed': 'не удалось импортировать CSV',
    'dialog.importCsvErrorNotice': 'Ошибка импорта Discogs CSV',

    'dialog.exportTitle': 'Экспорт коллекции',
    'dialog.format': 'Формат:',
    'dialog.formatBase': '.base (в vault)',
    'dialog.includePrice': 'Включить цену',
    'dialog.exportBaseInfo': 'Будет создан/обновлён файл в корне коллекции: {path}',
    'dialog.exportDownloadInfo': 'Файл будет скачан на устройство.',
    'dialog.exportBtn': 'Экспортировать',
    'dialog.exportNoRows': 'Нет записей для экспорта',
    'dialog.exportDone': 'Экспорт готов',

    'dialog.cardsExportNoRows': 'Нет карточек для экспорта',
    'dialog.cardsExportTitle': 'Экспорт карточек в изображение',
    'dialog.theme': 'Тема:',
    'dialog.themeLight': 'Светлая',
    'dialog.themeDark': 'Тёмная',
    'dialog.cardsExportMode': 'Режим:',
    'dialog.cardsExportModeSingle': 'Один файл (все карточки)',
    'dialog.cardsExportModePaged': 'Несколько файлов (сетка)',
    'dialog.cardsExportAspect': 'Соотношение сторон:',
    'dialog.cardsExportAspectSquare': '1:1 (Instagram)',
    'dialog.cardsExportAspect169': '16:9',
    'dialog.cardsExportAspect219': '21:9',
    'dialog.cardsExportGrid': 'Сетка на файл:',
    'dialog.cardsExportGridCols': 'Колонки',
    'dialog.cardsExportGridRows': 'Ряды',
    'dialog.cardsExportInfoSingle': 'Будет создан 1 файл со всеми карточками из текущего списка.',
    'dialog.cardsExportInfoPaged': 'Будет создано несколько файлов по {count} карточек на файл.',
    'dialog.download': 'Скачать',
    'dialog.generating': 'Генерирую...',
    'dialog.cardsExportDone': 'Изображение с карточками готово',
    'dialog.cardsExportDoneMany': 'Готово файлов: {count}',
    'dialog.cardsExportSavedVault': 'Файлы сохранены в vault: {path}',
    'dialog.cardsExportError': 'Ошибка при экспорте карточек',

    'settings.title': 'Vinyl Catalog Tools',
    'settings.language': 'Язык интерфейса',
    'settings.languageDesc': 'Локализация кнопок, диалогов и уведомлений плагина',
    'settings.langAuto': 'Auto (по языку Obsidian/системы)',
    'settings.langRu': 'Русский',
    'settings.langEn': 'English',
    'settings.collectionFolder': 'Папка коллекции',
    'settings.collectionFolderDesc': 'Корневая папка раздела с винилом в vault',
    'settings.artistsFolder': 'Папка артистов',
    'settings.artistsFolderDesc': 'Карточки пишутся в подпапки внутри этой директории',
    'settings.coversFolder': 'Папка обложек',
    'settings.coversFolderDesc': 'Куда сохранять скачанные обложки',
    'settings.init': 'Инициализировать структуру',
    'settings.initDesc': 'Создать папки коллекции, артистов и обложек по путям из настроек',
    'settings.initBtn': 'Создать',
    'settings.initDone': 'Структура винила готова',
    'settings.base': 'Создать .base файл',
    'settings.baseDesc': 'Создать или обновить файл базы коллекции с видами таблицы и карточек',
    'settings.baseBtn': 'Создать .base',
    'settings.baseUpdated': '.base обновлен: {path}',

    'ribbon.openCollection': 'Vinyl: открыть коллекцию',
    'command.openCollection': 'Vinyl: Открыть коллекцию',
    'command.addRecord': 'Vinyl: Добавить пластинку',
    'command.initFolders': 'Vinyl: Инициализировать папки',
    'command.importDiscogs': 'Vinyl: Импорт Discogs CSV',
    'command.createBase': 'Vinyl: Создать .base файл',

    'base.fileName': '🎶 Коллекция винила.base',
    'base.displayArtist': '🎤 Артист',
    'base.displayTitle': '🎵 Название',
    'base.displayYear': '🗓️ Год',
    'base.displayPrice': '💰 Цена',
    'base.displayCover': '🖼️ Обложка',
    'base.displayItems': '🔢 Кол-во',
    'base.viewTable': 'Коллекция',
    'base.viewCards': 'Карточки',

    'record.artistLine': '**Артист:** {artist}',
    'record.notesHeading': '### Notes',
    'record.state': '- Состояние:',
    'record.edition': '- Издание:',
    'record.comments': '- Комментарии:',
    'record.coverDownloadFailed': 'Не удалось скачать обложку, карточка будет создана без неё',

    'discogs.heading': '### Discogs',
    'discogs.releaseId': '- Release ID: {value}',
    'discogs.catalog': '- Каталожный номер: {value}',
    'discogs.label': '- Лейбл: {value}',
    'discogs.format': '- Формат: {value}',
    'discogs.added': '- Добавлено в коллекцию Discogs: {value}',
    'discogs.notesHeading': '### Notes',
    'discogs.media': '- Состояние пластинки: {value}',
    'discogs.sleeve': '- Состояние конверта: {value}',
    'discogs.edition': '- Издание:',
    'discogs.comments': '- Комментарии: {value}',
    'common.empty': '—',
    'common.currency': '₽',

    'error.imageBlob': 'Не удалось сформировать файл изображения',
    'error.backfill': 'ошибка докачки',
    'error.csvEmpty': 'CSV пустой или не удалось прочитать строки',
    'error.csvInvalidRows': 'В CSV не найдено валидных строк с Artist и Title',
    'error.importItem': 'ошибка импорта',
  },
  en: {
    'view.displayText': 'Vinyl Collection',
    'view.title': 'Vinyl Collection',
    'view.addAria': 'Add record',
    'view.searchPlaceholder': 'Search: artist, title, year',
    'view.modeTable': 'Table',
    'view.modeCards': 'Cards',
    'view.importDiscogs': 'Import Discogs',
    'view.export': 'Export',
    'view.exportCards': 'Cards PNG/JPG',
    'view.summaryTotal': 'Total: {count}',
    'view.summarySum': 'Sum: {sum} {currency}',
    'view.tableArtist': 'Artist',
    'view.tableTitle': 'Title',
    'view.tableYear': 'Year',
    'view.tablePrice': 'Price',
    'view.tableAdded': 'Added',
    'view.hide': 'Hide',
    'view.open': 'Open',
    'view.hideConfirm': 'Hide "{title}" from collection?',
    'view.hiddenNotice': 'Record hidden',
    'view.empty': 'No records yet. Click "Add" to create the first card.',
    'view.noCover': 'No cover',
    'view.yearFallback': 'Year —',
    'view.priceFallback': 'Price —',
    'view.imageThemeDark': 'Theme: dark',
    'view.imageThemeLight': 'Theme: light',
    'view.cardsCount': 'Cards: {count} • {theme}',

    'modal.addTitle': 'Add record',
    'modal.artist': 'Artist *',
    'modal.artistPh': 'Example: Linkin Park',
    'modal.title': 'Title *',
    'modal.titlePh': 'Example: Meteora',
    'modal.year': 'Year',
    'modal.yearPh': 'Example: 2003',
    'modal.price': 'Price',
    'modal.pricePh': 'Example: 3990',
    'modal.coverUrl': 'Cover URL',
    'modal.coverUrlDesc': 'jpg, png, webp or svg',
    'modal.cancel': 'Cancel',
    'modal.create': 'Create',
    'modal.creating': 'Creating...',
    'modal.requiredError': 'Fields "Artist" and "Title" are required.',
    'modal.createdNotice': 'Record card created',
    'modal.createError': 'failed to create card',
    'modal.errorPrefix': 'Error: {message}',

    'dialog.importTitle': 'Import Discogs CSV',
    'dialog.importCsvLabel': 'Discogs export CSV file:',
    'dialog.importUpsert': 'Update existing cards (by release_id and artist+title)',
    'dialog.importCovers': 'Auto-fetch covers (by release_id, only when cover is empty)',
    'dialog.importWarning': 'WARNING: EXPERIMENTAL FEATURE, MAY WORK INCORRECTLY.',
    'dialog.importBtn': 'Import',
    'dialog.importingBtn': 'Importing...',
    'dialog.importBackfillBtn': 'Backfill covers',
    'dialog.importFileSelected': 'Selected file: {name}',
    'dialog.importNoFileBackfill': 'No file selected: covers will be backfilled for existing records.',
    'dialog.importNeedFileOrBackfill': 'Select a CSV file or enable cover backfill.',
    'dialog.importReadCsv': 'Reading and processing CSV...',
    'dialog.importFindMissing': 'Scanning records without covers...',
    'dialog.importBackfillProgress': 'Cover backfill: {current}/{total}',
    'dialog.importRowsProgress': 'Importing records: {current}/{total}',
    'dialog.backfillScanned': 'Scanned: {count}',
    'dialog.backfillCandidates': 'Candidates: {count}',
    'dialog.backfillAttached': 'Covers: +{count}',
    'dialog.backfillSkipped': 'Skipped: {count}',
    'dialog.backfillErrors': 'Errors: {count}',
    'dialog.backfillErrorsNotice': 'Cover backfill completed with errors ({count})',
    'dialog.backfillDoneNotice': 'Cover backfill completed',
    'dialog.importCreated': 'Created: {count}',
    'dialog.importUpdated': 'Updated: {count}',
    'dialog.importCoversAttached': 'Covers: +{count}',
    'dialog.importSkipped': 'Skipped: {count}',
    'dialog.importErrors': 'Errors: {count}',
    'dialog.importErrorsNotice': 'Import completed with errors ({count})',
    'dialog.importDoneNotice': 'Discogs import completed',
    'dialog.importCsvFailed': 'failed to import CSV',
    'dialog.importCsvErrorNotice': 'Discogs CSV import error',

    'dialog.exportTitle': 'Export collection',
    'dialog.format': 'Format:',
    'dialog.formatBase': '.base (in vault)',
    'dialog.includePrice': 'Include price',
    'dialog.exportBaseInfo': 'A file will be created/updated in collection root: {path}',
    'dialog.exportDownloadInfo': 'File will be downloaded to your device.',
    'dialog.exportBtn': 'Export',
    'dialog.exportNoRows': 'No records to export',
    'dialog.exportDone': 'Export ready',

    'dialog.cardsExportNoRows': 'No cards to export',
    'dialog.cardsExportTitle': 'Export cards as image',
    'dialog.theme': 'Theme:',
    'dialog.themeLight': 'Light',
    'dialog.themeDark': 'Dark',
    'dialog.cardsExportMode': 'Mode:',
    'dialog.cardsExportModeSingle': 'Single file (all cards)',
    'dialog.cardsExportModePaged': 'Multiple files (grid)',
    'dialog.cardsExportAspect': 'Aspect ratio:',
    'dialog.cardsExportAspectSquare': '1:1 (Instagram)',
    'dialog.cardsExportAspect169': '16:9',
    'dialog.cardsExportAspect219': '21:9',
    'dialog.cardsExportGrid': 'Grid per file:',
    'dialog.cardsExportGridCols': 'Columns',
    'dialog.cardsExportGridRows': 'Rows',
    'dialog.cardsExportInfoSingle': 'One file with all cards from the current list will be generated.',
    'dialog.cardsExportInfoPaged': 'Multiple files will be generated, {count} cards per file.',
    'dialog.download': 'Download',
    'dialog.generating': 'Generating...',
    'dialog.cardsExportDone': 'Cards image is ready',
    'dialog.cardsExportDoneMany': 'Files generated: {count}',
    'dialog.cardsExportSavedVault': 'Files saved in vault: {path}',
    'dialog.cardsExportError': 'Cards export error',

    'settings.title': 'Vinyl Catalog Tools',
    'settings.language': 'Interface language',
    'settings.languageDesc': 'Localization of plugin buttons, dialogs, and notices',
    'settings.langAuto': 'Auto (Obsidian/system language)',
    'settings.langRu': 'Russian',
    'settings.langEn': 'English',
    'settings.collectionFolder': 'Collection folder',
    'settings.collectionFolderDesc': 'Root folder for the vinyl section in vault',
    'settings.artistsFolder': 'Artists folder',
    'settings.artistsFolderDesc': 'Cards are stored in subfolders inside this directory',
    'settings.coversFolder': 'Covers folder',
    'settings.coversFolderDesc': 'Where downloaded covers are saved',
    'settings.init': 'Initialize structure',
    'settings.initDesc': 'Create collection, artists and covers folders using paths from settings',
    'settings.initBtn': 'Create',
    'settings.initDone': 'Vinyl structure is ready',
    'settings.base': 'Create .base file',
    'settings.baseDesc': 'Create or update a collection base file with table and cards views',
    'settings.baseBtn': 'Create .base',
    'settings.baseUpdated': '.base updated: {path}',

    'ribbon.openCollection': 'Vinyl: open collection',
    'command.openCollection': 'Vinyl: Open collection',
    'command.addRecord': 'Vinyl: Add record',
    'command.initFolders': 'Vinyl: Initialize folders',
    'command.importDiscogs': 'Vinyl: Import Discogs CSV',
    'command.createBase': 'Vinyl: Create .base file',

    'base.fileName': '🎶 Коллекция винила.base',
    'base.displayArtist': '🎤 Artist',
    'base.displayTitle': '🎵 Title',
    'base.displayYear': '🗓️ Year',
    'base.displayPrice': '💰 Price',
    'base.displayCover': '🖼️ Cover',
    'base.displayItems': '🔢 Count',
    'base.viewTable': 'Collection',
    'base.viewCards': 'Cards',

    'record.artistLine': '**Artist:** {artist}',
    'record.notesHeading': '### Notes',
    'record.state': '- Condition:',
    'record.edition': '- Edition:',
    'record.comments': '- Comments:',
    'record.coverDownloadFailed': 'Failed to download cover, card will be created without it',

    'discogs.heading': '### Discogs',
    'discogs.releaseId': '- Release ID: {value}',
    'discogs.catalog': '- Catalog number: {value}',
    'discogs.label': '- Label: {value}',
    'discogs.format': '- Format: {value}',
    'discogs.added': '- Added to Discogs collection: {value}',
    'discogs.notesHeading': '### Notes',
    'discogs.media': '- Media condition: {value}',
    'discogs.sleeve': '- Sleeve condition: {value}',
    'discogs.edition': '- Edition:',
    'discogs.comments': '- Comments: {value}',
    'common.empty': '—',
    'common.currency': '₽',

    'error.imageBlob': 'Failed to generate image file',
    'error.backfill': 'backfill error',
    'error.csvEmpty': 'CSV is empty or rows could not be read',
    'error.csvInvalidRows': 'No valid rows with Artist and Title were found in CSV',
    'error.importItem': 'import error',
  },
};

function translateText(dict, fallbackDict, key, vars = {}) {
  const template = dict[key] ?? fallbackDict[key] ?? key;
  return String(template).replace(/\{(\w+)\}/g, (_, token) => (
    Object.prototype.hasOwnProperty.call(vars, token) ? String(vars[token]) : `{${token}}`
  ));
}

function toText(value) {
  if (value == null) return '';
  if (Array.isArray(value)) return toText(value[0]);
  return String(value).trim();
}

function toPrice(value) {
  if (value == null || value === '') return null;
  const normalized = String(value).replace(',', '.').trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function sanitizeName(value) {
  return toText(value).replace(/[\\/:*?"<>|]/g, '').trim();
}

function translitRu(value) {
  const map = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
    н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
    ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
    А: 'a', Б: 'b', В: 'v', Г: 'g', Д: 'd', Е: 'e', Ё: 'e', Ж: 'zh', З: 'z', И: 'i', Й: 'y', К: 'k', Л: 'l', М: 'm',
    Н: 'n', О: 'o', П: 'p', Р: 'r', С: 's', Т: 't', У: 'u', Ф: 'f', Х: 'h', Ц: 'ts', Ч: 'ch', Ш: 'sh', Щ: 'sch',
    Ъ: '', Ы: 'y', Ь: '', Э: 'e', Ю: 'yu', Я: 'ya',
  };
  return [...value].map((ch) => map[ch] ?? ch).join('');
}

function slugify(value) {
  return translitRu(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'cover';
}

function extFromUrl(url) {
  try {
    const match = new URL(url).pathname.toLowerCase().match(/\.(jpg|jpeg|png|webp|svg)$/);
    if (!match) return '';
    return match[1] === 'jpeg' ? 'jpg' : match[1];
  } catch {
    return '';
  }
}

function extFromContentType(contentType) {
  const raw = toText(contentType).toLowerCase();
  if (raw.includes('svg')) return 'svg';
  if (raw.includes('png')) return 'png';
  if (raw.includes('webp')) return 'webp';
  if (raw.includes('jpeg') || raw.includes('jpg')) return 'jpg';
  return '';
}

function splitFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return null;
  return {
    frontmatterRaw: match[1],
    body: content.slice(match[0].length),
  };
}

function unwrapCoverValue(raw) {
  if (raw == null) return '';
  if (Array.isArray(raw)) return unwrapCoverValue(raw[0]);
  if (typeof raw === 'object') {
    if (raw.path) return `[[${raw.path}]]`;
    if (raw.url) return raw.url;
    if (raw.value) return raw.value;
  }
  return toText(raw);
}

function normalizeCoverLinkTarget(raw) {
  let cover = toText(raw);
  if (!cover) return '';

  const markdownImage = cover.match(/!\[[^\]]*\]\(([^)]+)\)/);
  if (markdownImage?.[1]) cover = markdownImage[1].trim();

  const wiki = cover.match(/^\[\[([^\]]+)\]\]$/);
  if (wiki?.[1]) cover = wiki[1].trim();

  if (cover.includes('|') && !/^(https?:|data:|file:|app:)/i.test(cover)) {
    cover = cover.split('|')[0].trim();
  }

  return cover;
}

function escapeDoubleQuoted(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function normalizeLookupValue(value) {
  return toText(value)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function makeArtistTitleLookupKey(artist, title) {
  return `${normalizeLookupValue(artist)}::${normalizeLookupValue(title)}`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasCoverValue(rawCover) {
  const normalized = normalizeCoverLinkTarget(unwrapCoverValue(rawCover));
  return normalized.length > 0;
}

function parseCsvToObjects(text) {
  const input = String(text || '');
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        const next = input[i + 1];
        if (next === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ',') {
      row.push(field);
      field = '';
      continue;
    }

    if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }

    if (char === '\r') continue;

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (!rows.length) return [];

  const headers = rows[0].map((header, index) => {
    const cleaned = String(header || '').replace(/^\uFEFF/, '').trim();
    return cleaned || `column_${index + 1}`;
  });

  return rows
    .slice(1)
    .filter((csvRow) => csvRow.some((value) => toText(value) !== ''))
    .map((csvRow) => {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = csvRow[index] ?? '';
      });
      return item;
    });
}

function mapDiscogsCsvRow(row) {
  const artist = toText(row.Artist);
  const title = toText(row.Title);
  if (!artist || !title) return null;

  const releaseId = toText(row.release_id);
  const mapped = {
    artist,
    title,
    year: toText(row.Released),
    releaseId,
    catalogNumber: toText(row['Catalog#']),
    label: toText(row.Label),
    format: toText(row.Format),
    rating: toText(row.Rating),
    dateAdded: toText(row['Date Added']),
    mediaCondition: toText(row['Collection Media Condition']),
    sleeveCondition: toText(row['Collection Sleeve Condition']),
    notes: toText(row['Collection Notes']),
  };

  return mapped;
}

function escapeCsvCell(value) {
  return `"${toText(value).replace(/"/g, '""')}"`;
}

function downloadTextFile(content, filename, mimeType, addBom = false) {
  const payload = addBom ? `\ufeff${content}` : content;
  const blob = new Blob([payload], { type: mimeType });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function downloadBlob(blob, filename) {
  return new Promise((resolve) => {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      resolve();
    }, 800);
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to generate image file'));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

function roundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = toText(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);

  if (words.length > 0 && lines.length === maxLines) {
    let tail = lines[maxLines - 1];
    while (tail && ctx.measureText(`${tail}...`).width > maxWidth) {
      tail = tail.slice(0, -1);
    }
    lines[maxLines - 1] = `${tail}...`;
  }

  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });

  return y + lines.length * lineHeight;
}

function loadImageSafe(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }

    const img = new Image();
    if (/^https?:/i.test(src)) img.crossOrigin = 'anonymous';

    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function exportTimestamp() {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
}

function clampInt(value, min, max, fallback) {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function getAspectRatioValue(aspect) {
  if (aspect === '16:9') return 16 / 9;
  if (aspect === '21:9') return 21 / 9;
  return 1;
}

function getAspectCanvasSize(aspect) {
  if (aspect === '16:9') return { width: 3200, height: 1800 };
  if (aspect === '21:9') return { width: 3360, height: 1440 };
  return { width: 2600, height: 2600 };
}

function shouldSaveExportsToVault() {
  return Boolean(Platform.isMobileApp || Platform.isMobile);
}

function chooseGridForCountByAspect(count, aspectRatio) {
  const total = Math.max(1, count);
  let bestCols = 1;
  let bestRows = total;
  let bestScore = Number.POSITIVE_INFINITY;
  const maxCols = Math.min(24, total);

  for (let cols = 1; cols <= maxCols; cols += 1) {
    const rows = Math.ceil(total / cols);
    const ratioGuess = (cols * 340) / (rows * 500 + 92);
    const score = Math.abs(Math.log((ratioGuess || 1e-6) / aspectRatio));
    if (score < bestScore) {
      bestScore = score;
      bestCols = cols;
      bestRows = rows;
    }
  }

  return { cols: bestCols, rows: bestRows };
}

class AddVinylModal extends Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
    this.form = {
      artist: '',
      title: '',
      year: '',
      price: '',
      coverUrl: '',
    };
  }

  onOpen() {
    const { contentEl } = this;
    const t = (key, vars) => this.plugin.t(key, vars);
    contentEl.empty();
    contentEl.addClass('vinyl-modal');

    contentEl.createEl('h2', { text: t('modal.addTitle') });

    new Setting(contentEl)
      .setName(t('modal.artist'))
      .addText((text) => {
        text.setPlaceholder(t('modal.artistPh'));
        text.onChange((value) => {
          this.form.artist = value;
        });
        setTimeout(() => text.inputEl.focus(), 0);
      });

    new Setting(contentEl)
      .setName(t('modal.title'))
      .addText((text) => {
        text.setPlaceholder(t('modal.titlePh'));
        text.onChange((value) => {
          this.form.title = value;
        });
      });

    new Setting(contentEl)
      .setName(t('modal.year'))
      .addText((text) => {
        text.setPlaceholder(t('modal.yearPh'));
        text.onChange((value) => {
          this.form.year = value;
        });
      });

    new Setting(contentEl)
      .setName(t('modal.price'))
      .addText((text) => {
        text.setPlaceholder(t('modal.pricePh'));
        text.onChange((value) => {
          this.form.price = value;
        });
      });

    new Setting(contentEl)
      .setName(t('modal.coverUrl'))
      .setDesc(t('modal.coverUrlDesc'))
      .addText((text) => {
        text.setPlaceholder('https://...');
        text.onChange((value) => {
          this.form.coverUrl = value;
        });
      });

    this.errorEl = contentEl.createDiv({ cls: 'vinyl-modal-error' });

    const actions = contentEl.createDiv({ cls: 'vinyl-modal-actions' });

    const cancelBtn = actions.createEl('button', { text: t('modal.cancel') });
    cancelBtn.addClass('mod-muted');
    cancelBtn.addEventListener('click', () => this.close());

    this.submitBtn = actions.createEl('button', { text: t('modal.create') });
    this.submitBtn.addClass('mod-cta');
    this.submitBtn.addEventListener('click', async () => {
      await this.handleSubmit();
    });
  }

  onClose() {
    this.contentEl.empty();
  }

  async handleSubmit() {
    const artist = sanitizeName(this.form.artist);
    const title = sanitizeName(this.form.title);

    if (!artist || !title) {
      this.setError(this.plugin.t('modal.requiredError'));
      return;
    }

    this.setError('');
    this.submitBtn.disabled = true;
    const originalText = this.submitBtn.textContent;
    this.submitBtn.textContent = this.plugin.t('modal.creating');

    try {
      const file = await this.plugin.createVinylRecord({
        artist,
        title,
        year: toText(this.form.year),
        price: this.form.price,
        coverUrl: toText(this.form.coverUrl),
      });
      await this.plugin.openRecord(file);
      await this.plugin.refreshOpenViews();
      new Notice(this.plugin.t('modal.createdNotice'));
      this.close();
    } catch (error) {
      console.error(error);
      this.setError(this.plugin.t('modal.errorPrefix', {
        message: error?.message ?? this.plugin.t('modal.createError'),
      }));
    } finally {
      this.submitBtn.disabled = false;
      this.submitBtn.textContent = originalText;
    }
  }

  setError(message) {
    if (!this.errorEl) return;
    this.errorEl.setText(message || '');
    this.errorEl.style.display = message ? 'block' : 'none';
  }
}

class VinylCollectionView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.mode = 'table';
    this.sortKey = 'artist';
    this.sortDir = 'asc';
    this.search = '';
    this.rows = [];
  }

  getViewType() {
    return VIEW_TYPE_VINYL_COLLECTION;
  }

  getDisplayText() {
    return this.plugin.t('view.displayText');
  }

  getIcon() {
    return 'disc';
  }

  async onOpen() {
    this.renderShell();
    await this.refreshData();
  }

  async onClose() {
    this.contentEl.empty();
  }

  async refreshData() {
    this.rows = await this.plugin.loadVinylRows();
    this.renderContent();
  }

  renderShell() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('vinyl-view');

    const top = contentEl.createDiv({ cls: 'vinyl-top' });
    const t = (key, vars) => this.plugin.t(key, vars);

    const titleWrap = top.createDiv({ cls: 'vinyl-title-wrap' });
    titleWrap.createEl('h2', { text: t('view.title') });
    titleWrap.createEl('div', {
      cls: 'vinyl-subtitle',
      text: this.plugin.settings.artistsFolder,
    });

    const headerActions = top.createDiv({ cls: 'vinyl-header-actions' });
    this.addBtn = headerActions.createEl('button', { text: '+', cls: 'vinyl-add-btn' });
    this.addBtn.setAttribute('aria-label', t('view.addAria'));
    this.addBtn.title = t('view.addAria');

    const toolbar = contentEl.createDiv({ cls: 'vinyl-toolbar' });

    this.searchInput = toolbar.createEl('input', {
      cls: 'vinyl-search',
      attr: {
        type: 'search',
        placeholder: t('view.searchPlaceholder'),
      },
    });
    this.searchInput.value = this.search;
    this.searchInput.addEventListener('input', () => {
      this.search = toText(this.searchInput.value).toLowerCase();
      this.renderContent();
    });

    const groups = toolbar.createDiv({ cls: 'vinyl-toolbar-groups' });

    const modeGroup = groups.createDiv({ cls: 'vinyl-segment-group' });
    this.tableModeBtn = modeGroup.createEl('button', { text: t('view.modeTable') });
    this.cardsModeBtn = modeGroup.createEl('button', { text: t('view.modeCards') });

    groups.createDiv({ cls: 'vinyl-toolbar-divider' });

    const exportGroup = groups.createDiv({ cls: 'vinyl-export-group' });
    this.importDiscogsBtn = exportGroup.createEl('button', { text: t('view.importDiscogs') });
    this.exportBtn = exportGroup.createEl('button', { text: t('view.export') });
    this.imageExportBtn = exportGroup.createEl('button', { text: t('view.exportCards') });

    this.tableModeBtn.addEventListener('click', () => {
      this.mode = 'table';
      this.renderContent();
    });

    this.cardsModeBtn.addEventListener('click', () => {
      this.mode = 'cards';
      this.renderContent();
    });

    this.addBtn.addEventListener('click', () => {
      this.plugin.openAddModal();
    });

    this.importDiscogsBtn.addEventListener('click', () => {
      this.showDiscogsImportDialog();
    });

    this.exportBtn.addEventListener('click', () => {
      this.showExportDialog();
    });

    this.imageExportBtn.addEventListener('click', () => {
      this.showCardImageExportDialog();
    });

    this.summaryEl = contentEl.createDiv({ cls: 'vinyl-summary' });
    this.bodyEl = contentEl.createDiv({ cls: 'vinyl-body' });
  }

  relocalizeUi() {
    this.renderShell();
    this.renderContent();
  }

  renderContent() {
    this.bodyEl.empty();

    const rows = this.getRenderedRows();
    this.renderSummary(rows);
    this.syncModeButtons();

    if (this.mode === 'cards') {
      this.renderCards(rows);
      return;
    }

    this.renderTable(rows);
  }

  renderSummary(rows) {
    const totalPrice = rows.reduce((sum, row) => sum + (row.price || 0), 0);
    this.summaryEl.empty();
    this.summaryEl.createDiv({
      cls: 'vinyl-kpi',
      text: this.plugin.t('view.summaryTotal', { count: rows.length }),
    });
    this.summaryEl.createDiv({
      cls: 'vinyl-kpi',
      text: this.plugin.t('view.summarySum', {
        sum: Math.round(totalPrice),
        currency: this.plugin.t('common.currency'),
      }),
    });
  }

  syncModeButtons() {
    this.tableModeBtn.toggleClass('is-active', this.mode === 'table');
    this.cardsModeBtn.toggleClass('is-active', this.mode === 'cards');
  }

  getRenderedRows() {
    let rows = [...this.rows];
    if (this.search) {
      rows = rows.filter((row) => {
        const haystack = [row.artist, row.title, row.year || ''].join(' ').toLowerCase();
        return haystack.includes(this.search);
      });
    }

    rows.sort((a, b) => {
      const aValue = this.sortValueFor(a, this.sortKey);
      const bValue = this.sortValueFor(b, this.sortKey);

      let cmp = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        cmp = aValue - bValue;
      } else {
        cmp = String(aValue).localeCompare(String(bValue), this.plugin.getLanguage(), {
          numeric: true,
          sensitivity: 'base',
        });
      }

      return this.sortDir === 'asc' ? cmp : -cmp;
    });

    return rows;
  }

  sortValueFor(row, key) {
    if (key === 'year') {
      const yearNum = Number(row.year);
      return Number.isFinite(yearNum) ? yearNum : Number.NEGATIVE_INFINITY;
    }
    if (key === 'price') return row.price || 0;
    if (key === 'added') return row.added || 0;
    if (key === 'artist') return row.artist || '';
    if (key === 'title') return row.title || '';
    return '';
  }

  makeSortHeader(label, key) {
    const th = document.createElement('th');
    th.className = 'sortable';
    const arrow = this.sortKey === key ? (this.sortDir === 'asc' ? ' ▲' : ' ▼') : '';
    th.textContent = `${label}${arrow}`;
    th.addEventListener('click', () => {
      if (this.sortKey === key) {
        this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortDir = key === 'added' ? 'desc' : 'asc';
      }
      this.renderContent();
    });
    return th;
  }

  renderTable(rows) {
    const tableWrap = this.bodyEl.createDiv({ cls: 'vinyl-table-wrap' });
    const table = tableWrap.createEl('table', { cls: 'vinyl-table' });

    const thead = table.createEl('thead');
    const headRow = thead.createEl('tr');
    headRow.appendChild(this.makeSortHeader(this.plugin.t('view.tableArtist'), 'artist'));
    headRow.appendChild(this.makeSortHeader(this.plugin.t('view.tableTitle'), 'title'));
    headRow.appendChild(this.makeSortHeader(this.plugin.t('view.tableYear'), 'year'));
    headRow.appendChild(this.makeSortHeader(this.plugin.t('view.tablePrice'), 'price'));
    headRow.appendChild(this.makeSortHeader(this.plugin.t('view.tableAdded'), 'added'));

    const actionsHead = document.createElement('th');
    actionsHead.textContent = '';
    headRow.appendChild(actionsHead);

    const tbody = table.createEl('tbody');

    for (const row of rows) {
      const tr = tbody.createEl('tr');

      tr.createEl('td', { text: row.artist || this.plugin.t('common.empty') });

      const tdTitle = tr.createEl('td');
      const openBtn = tdTitle.createEl('button', {
        text: row.title || row.file.basename,
        cls: 'vinyl-link-btn',
      });
      openBtn.addEventListener('click', async () => {
        await this.plugin.openRecord(row.file);
      });

      tr.createEl('td', { text: row.year || this.plugin.t('common.empty') });
      tr.createEl('td', {
        text: row.price ? `${row.price} ${this.plugin.t('common.currency')}` : this.plugin.t('common.empty'),
      });
      tr.createEl('td', { text: row.addedText });

      const tdAction = tr.createEl('td', { cls: 'vinyl-actions' });
      const hideBtn = tdAction.createEl('button', { text: this.plugin.t('view.hide'), cls: 'vinyl-danger-btn' });
      hideBtn.addEventListener('click', async () => {
        const ok = window.confirm(this.plugin.t('view.hideConfirm', { title: row.title }));
        if (!ok) return;
        await this.plugin.setHiddenFlag(row.file, true);
        new Notice(this.plugin.t('view.hiddenNotice'));
        await this.refreshData();
      });
    }

    if (rows.length === 0) {
      const empty = this.bodyEl.createDiv({ cls: 'vinyl-empty' });
      empty.setText(this.plugin.t('view.empty'));
    }
  }

  renderCards(rows) {
    if (rows.length === 0) {
      const empty = this.bodyEl.createDiv({ cls: 'vinyl-empty' });
      empty.setText(this.plugin.t('view.empty'));
      return;
    }

    const grid = this.bodyEl.createDiv({ cls: 'vinyl-grid' });

    for (const row of rows) {
      const card = grid.createDiv({ cls: 'vinyl-card' });

      const imageWrap = card.createDiv({ cls: 'vinyl-cover-wrap' });
      const coverSrc = this.plugin.resolveCoverSrc(row);
      if (coverSrc) {
        const img = imageWrap.createEl('img', { cls: 'vinyl-cover', attr: { src: coverSrc, alt: row.title } });
        img.loading = 'lazy';
      } else {
        imageWrap.createDiv({ cls: 'vinyl-cover-placeholder', text: this.plugin.t('view.noCover') });
      }

      const info = card.createDiv({ cls: 'vinyl-card-info' });
      info.createEl('div', { cls: 'vinyl-card-artist', text: row.artist || this.plugin.t('common.empty') });
      info.createEl('div', { cls: 'vinyl-card-title', text: row.title || row.file.basename });
      const yearText = row.year || this.plugin.t('view.yearFallback');
      const priceText = row.price
        ? `${row.price} ${this.plugin.t('common.currency')}`
        : this.plugin.t('view.priceFallback');
      info.createEl('div', {
        cls: 'vinyl-card-meta',
        text: `${yearText} • ${priceText}`,
      });

      const actions = card.createDiv({ cls: 'vinyl-card-actions' });
      const openBtn = actions.createEl('button', { text: this.plugin.t('view.open'), cls: 'mod-cta' });
      openBtn.addEventListener('click', async () => {
        await this.plugin.openRecord(row.file);
      });

      const hideBtn = actions.createEl('button', { text: this.plugin.t('view.hide') });
      hideBtn.addEventListener('click', async () => {
        const ok = window.confirm(this.plugin.t('view.hideConfirm', { title: row.title }));
        if (!ok) return;
        await this.plugin.setHiddenFlag(row.file, true);
        new Notice(this.plugin.t('view.hiddenNotice'));
        await this.refreshData();
      });
    }
  }

  createDialog(titleText) {
    const overlay = document.createElement('div');
    overlay.className = 'vinyl-dialog-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'vinyl-dialog';

    const title = document.createElement('div');
    title.className = 'vinyl-dialog-title';
    title.textContent = titleText;
    dialog.appendChild(title);

    const body = document.createElement('div');
    body.className = 'vinyl-dialog-body';
    dialog.appendChild(body);

    const actions = document.createElement('div');
    actions.className = 'vinyl-dialog-actions';
    dialog.appendChild(actions);

    const close = () => {
      dialog.remove();
      overlay.remove();
    };

    overlay.addEventListener('click', close);
    dialog.addEventListener('click', (event) => event.stopPropagation());

    document.body.appendChild(overlay);
    document.body.appendChild(dialog);

    return { body, actions, close };
  }

  showDiscogsImportDialog() {
    const t = (key, vars) => this.plugin.t(key, vars);
    const { body, actions, close } = this.createDialog(t('dialog.importTitle'));

    body.createEl('div', { cls: 'vinyl-dialog-label', text: t('dialog.importCsvLabel') });
    const fileInput = body.createEl('input', {
      cls: 'vinyl-file-input',
      attr: { type: 'file', accept: '.csv,text/csv' },
    });

    const upsertLabel = body.createEl('label', { cls: 'vinyl-dialog-checkbox' });
    const upsertInput = upsertLabel.createEl('input', { attr: { type: 'checkbox' } });
    upsertInput.checked = true;
    upsertLabel.createSpan({ text: t('dialog.importUpsert') });

    const coversLabel = body.createEl('label', { cls: 'vinyl-dialog-checkbox' });
    const coversInput = coversLabel.createEl('input', { attr: { type: 'checkbox' } });
    coversInput.checked = true;
    coversLabel.createSpan({ text: t('dialog.importCovers') });

    body.createEl('div', {
      cls: 'vinyl-dialog-warning',
      text: t('dialog.importWarning'),
    });

    const status = body.createEl('div', { cls: 'vinyl-dialog-note' });

    const cancelBtn = actions.createEl('button', { text: t('modal.cancel') });
    cancelBtn.addEventListener('click', close);

    const importBtn = actions.createEl('button', { text: t('dialog.importBtn'), cls: 'mod-cta' });
    importBtn.disabled = false;

    const updateUiState = () => {
      const hasFile = !!(fileInput.files && fileInput.files.length > 0);
      upsertInput.disabled = !hasFile;

      if (hasFile) {
        status.textContent = t('dialog.importFileSelected', { name: fileInput.files[0].name });
        importBtn.disabled = false;
        importBtn.textContent = t('dialog.importBtn');
        return;
      }

      if (coversInput.checked) {
        status.textContent = t('dialog.importNoFileBackfill');
        importBtn.disabled = false;
        importBtn.textContent = t('dialog.importBackfillBtn');
      } else {
        status.textContent = t('dialog.importNeedFileOrBackfill');
        importBtn.disabled = true;
        importBtn.textContent = t('dialog.importBtn');
      }
    };

    fileInput.addEventListener('change', () => {
      updateUiState();
    });
    coversInput.addEventListener('change', updateUiState);
    updateUiState();

    importBtn.addEventListener('click', async () => {
      const hasFile = !!(fileInput.files && fileInput.files.length > 0);
      if (!hasFile && !coversInput.checked) return;

      importBtn.disabled = true;
      importBtn.textContent = t('dialog.importingBtn');
      status.textContent = hasFile
        ? t('dialog.importReadCsv')
        : t('dialog.importFindMissing');

      try {
        if (!hasFile) {
          const summary = await this.plugin.backfillDiscogsCoversForExisting({
            onProgress: (current, total) => {
              status.textContent = t('dialog.importBackfillProgress', { current, total });
            },
          });

          const parts = [
            t('dialog.backfillScanned', { count: summary.scanned }),
            t('dialog.backfillCandidates', { count: summary.candidates }),
            t('dialog.backfillAttached', { count: summary.attached }),
            t('dialog.backfillSkipped', { count: summary.skipped }),
            t('dialog.backfillErrors', { count: summary.errors.length }),
          ];
          status.textContent = parts.join(' • ');

          if (summary.errors.length > 0) {
            new Notice(t('dialog.backfillErrorsNotice', { count: summary.errors.length }));
          } else {
            new Notice(t('dialog.backfillDoneNotice'));
          }
        } else {
          const file = fileInput.files[0];
          const csvText = await file.text();
          const summary = await this.plugin.importDiscogsCsv(csvText, {
            upsert: upsertInput.checked,
            autoFetchCovers: coversInput.checked,
            onProgress: (current, total) => {
              status.textContent = t('dialog.importRowsProgress', { current, total });
            },
          });

          const parts = [
            t('dialog.importCreated', { count: summary.created }),
            t('dialog.importUpdated', { count: summary.updated }),
            t('dialog.importCoversAttached', { count: summary.coversAttached }),
            t('dialog.importSkipped', { count: summary.skipped }),
            t('dialog.importErrors', { count: summary.errors.length }),
          ];
          status.textContent = parts.join(' • ');

          if (summary.errors.length > 0) {
            new Notice(t('dialog.importErrorsNotice', { count: summary.errors.length }));
          } else {
            new Notice(t('dialog.importDoneNotice'));
          }
        }

        await this.refreshData();
      } catch (error) {
        console.error(error);
        status.textContent = this.plugin.t('modal.errorPrefix', {
          message: error?.message ?? t('dialog.importCsvFailed'),
        });
        new Notice(t('dialog.importCsvErrorNotice'));
      } finally {
        updateUiState();
      }
    });
  }

  showExportDialog() {
    const rows = this.getRenderedRows();
    const t = (key, vars) => this.plugin.t(key, vars);

    const { body, actions, close } = this.createDialog(t('dialog.exportTitle'));

    body.createEl('div', { cls: 'vinyl-dialog-label', text: t('dialog.format') });
    const formatWrap = body.createDiv({ cls: 'vinyl-dialog-options' });

    const csvLabel = formatWrap.createEl('label', { cls: 'vinyl-dialog-radio' });
    const csvInput = csvLabel.createEl('input', {
      attr: { type: 'radio', name: 'vinyl-export-format', value: 'csv' },
    });
    csvInput.checked = true;
    csvLabel.createSpan({ text: 'CSV' });

    const mdLabel = formatWrap.createEl('label', { cls: 'vinyl-dialog-radio' });
    const mdInput = mdLabel.createEl('input', {
      attr: { type: 'radio', name: 'vinyl-export-format', value: 'md' },
    });
    mdLabel.createSpan({ text: 'Markdown' });

    const baseLabel = formatWrap.createEl('label', { cls: 'vinyl-dialog-radio' });
    const baseInput = baseLabel.createEl('input', {
      attr: { type: 'radio', name: 'vinyl-export-format', value: 'base' },
    });
    baseLabel.createSpan({ text: t('dialog.formatBase') });

    const priceLabel = body.createEl('label', { cls: 'vinyl-dialog-checkbox' });
    const includePrice = priceLabel.createEl('input', { attr: { type: 'checkbox' } });
    includePrice.checked = true;
    priceLabel.createSpan({ text: t('dialog.includePrice') });

    const info = body.createEl('div', { cls: 'vinyl-dialog-note' });
    const updateUiByFormat = () => {
      const baseMode = baseInput.checked;
      priceLabel.style.display = baseMode ? 'none' : 'flex';
      info.textContent = baseMode
        ? t('dialog.exportBaseInfo', { path: this.plugin.getBaseFilePath() })
        : t('dialog.exportDownloadInfo');
    };

    csvInput.addEventListener('change', updateUiByFormat);
    mdInput.addEventListener('change', updateUiByFormat);
    baseInput.addEventListener('change', updateUiByFormat);
    updateUiByFormat();

    const cancelBtn = actions.createEl('button', { text: t('modal.cancel') });
    cancelBtn.addEventListener('click', close);

    const exportBtn = actions.createEl('button', { text: t('dialog.exportBtn'), cls: 'mod-cta' });
    exportBtn.addEventListener('click', async () => {
      if (baseInput.checked) {
        const basePath = await this.plugin.createOrUpdateBaseFile();
        new Notice(t('settings.baseUpdated', { path: basePath }));
        close();
        return;
      }

      if (!rows.length) {
        new Notice(t('dialog.exportNoRows'));
        return;
      }

      const include = includePrice.checked;
      if (csvInput.checked) {
        const content = this.exportRowsToCSV(rows, include);
        const filename = include ? 'vinyl-collection.csv' : 'vinyl-collection-no-price.csv';
        downloadTextFile(content, filename, 'text/csv;charset=utf-8;', true);
      } else {
        const content = this.exportRowsToMarkdown(rows, include);
        const filename = include ? 'vinyl-collection.md' : 'vinyl-collection-no-price.md';
        downloadTextFile(content, filename, 'text/markdown;charset=utf-8;');
      }
      new Notice(t('dialog.exportDone'));
      close();
    });
  }

  exportRowsToCSV(rows, includePrice = true) {
    const t = (key, vars) => this.plugin.t(key, vars);
    const headers = includePrice
      ? [t('view.tableArtist'), t('view.tableTitle'), t('view.tableYear'), t('view.tablePrice')]
      : [t('view.tableArtist'), t('view.tableTitle'), t('view.tableYear')];

    const lines = [headers.map((header) => escapeCsvCell(header)).join(',')];

    for (const row of rows) {
      const values = [
        escapeCsvCell(row.artist || ''),
        escapeCsvCell(row.title || row.file.basename),
        escapeCsvCell(row.year || ''),
      ];
      if (includePrice) {
        values.push(escapeCsvCell(row.price ? row.price : ''));
      }
      lines.push(values.join(','));
    }

    return lines.join('\n');
  }

  exportRowsToMarkdown(rows, includePrice = true) {
    const t = (key, vars) => this.plugin.t(key, vars);
    let md = `# ${t('view.title')}\n\n`;

    if (includePrice) {
      md += `| ${t('view.tableArtist')} | ${t('view.tableTitle')} | ${t('view.tableYear')} | ${t('view.tablePrice')} |\n`;
      md += '|:-------|:---------|:----|:-----|\n';
      for (const row of rows) {
        const title = (row.title || row.file.basename).replace(/\|/g, '\\|');
        const artist = (row.artist || '').replace(/\|/g, '\\|');
        const year = (row.year || '').replace(/\|/g, '\\|');
        const price = row.price ? `${row.price} ${t('common.currency')}` : t('common.empty');
        md += `| ${artist} | ${title} | ${year} | ${price} |\n`;
      }
    } else {
      md += `| ${t('view.tableArtist')} | ${t('view.tableTitle')} | ${t('view.tableYear')} |\n`;
      md += '|:-------|:---------|:----|\n';
      for (const row of rows) {
        const title = (row.title || row.file.basename).replace(/\|/g, '\\|');
        const artist = (row.artist || '').replace(/\|/g, '\\|');
        const year = (row.year || '').replace(/\|/g, '\\|');
        md += `| ${artist} | ${title} | ${year} |\n`;
      }
    }

    return md;
  }

  showCardImageExportDialog() {
    const rows = this.getRenderedRows();
    const t = (key, vars) => this.plugin.t(key, vars);
    if (!rows.length) {
      new Notice(t('dialog.cardsExportNoRows'));
      return;
    }

    const { body, actions, close } = this.createDialog(t('dialog.cardsExportTitle'));
    body.createEl('div', { cls: 'vinyl-dialog-label', text: t('dialog.format') });

    const formatWrap = body.createDiv({ cls: 'vinyl-dialog-options' });
    const pngLabel = formatWrap.createEl('label', { cls: 'vinyl-dialog-radio' });
    const pngInput = pngLabel.createEl('input', {
      attr: { type: 'radio', name: 'vinyl-image-format', value: 'png' },
    });
    pngInput.checked = true;
    pngLabel.createSpan({ text: 'PNG' });

    const jpgLabel = formatWrap.createEl('label', { cls: 'vinyl-dialog-radio' });
    const jpgInput = jpgLabel.createEl('input', {
      attr: { type: 'radio', name: 'vinyl-image-format', value: 'jpeg' },
    });
    jpgLabel.createSpan({ text: 'JPEG' });

    body.createEl('div', { cls: 'vinyl-dialog-label', text: t('dialog.theme') });
    const themeWrap = body.createDiv({ cls: 'vinyl-dialog-options' });

    const lightLabel = themeWrap.createEl('label', { cls: 'vinyl-dialog-radio' });
    const lightInput = lightLabel.createEl('input', {
      attr: { type: 'radio', name: 'vinyl-image-theme', value: 'light' },
    });
    lightInput.checked = true;
    lightLabel.createSpan({ text: t('dialog.themeLight') });

    const darkLabel = themeWrap.createEl('label', { cls: 'vinyl-dialog-radio' });
    const darkInput = darkLabel.createEl('input', {
      attr: { type: 'radio', name: 'vinyl-image-theme', value: 'dark' },
    });
    darkLabel.createSpan({ text: t('dialog.themeDark') });

    body.createEl('div', { cls: 'vinyl-dialog-label', text: t('dialog.cardsExportMode') });
    const modeWrap = body.createDiv({ cls: 'vinyl-dialog-options' });

    const singleModeLabel = modeWrap.createEl('label', { cls: 'vinyl-dialog-radio' });
    const singleModeInput = singleModeLabel.createEl('input', {
      attr: { type: 'radio', name: 'vinyl-image-mode', value: 'single' },
    });
    singleModeInput.checked = true;
    singleModeLabel.createSpan({ text: t('dialog.cardsExportModeSingle') });

    const pagedModeLabel = modeWrap.createEl('label', { cls: 'vinyl-dialog-radio' });
    const pagedModeInput = pagedModeLabel.createEl('input', {
      attr: { type: 'radio', name: 'vinyl-image-mode', value: 'paged' },
    });
    pagedModeLabel.createSpan({ text: t('dialog.cardsExportModePaged') });

    body.createEl('div', { cls: 'vinyl-dialog-label', text: t('dialog.cardsExportAspect') });
    const aspectWrap = body.createDiv({ cls: 'vinyl-dialog-options' });
    const aspectSquareLabel = aspectWrap.createEl('label', { cls: 'vinyl-dialog-radio' });
    const aspectSquareInput = aspectSquareLabel.createEl('input', {
      attr: { type: 'radio', name: 'vinyl-image-aspect', value: '1:1' },
    });
    aspectSquareInput.checked = true;
    aspectSquareLabel.createSpan({ text: t('dialog.cardsExportAspectSquare') });

    const aspect169Label = aspectWrap.createEl('label', { cls: 'vinyl-dialog-radio' });
    const aspect169Input = aspect169Label.createEl('input', {
      attr: { type: 'radio', name: 'vinyl-image-aspect', value: '16:9' },
    });
    aspect169Label.createSpan({ text: t('dialog.cardsExportAspect169') });

    const aspect219Label = aspectWrap.createEl('label', { cls: 'vinyl-dialog-radio' });
    const aspect219Input = aspect219Label.createEl('input', {
      attr: { type: 'radio', name: 'vinyl-image-aspect', value: '21:9' },
    });
    aspect219Label.createSpan({ text: t('dialog.cardsExportAspect219') });

    const gridLabel = body.createEl('div', { cls: 'vinyl-dialog-label', text: t('dialog.cardsExportGrid') });
    const gridWrap = body.createDiv({ cls: 'vinyl-dialog-options' });
    const colsLabel = gridWrap.createEl('label', { cls: 'vinyl-dialog-radio' });
    colsLabel.createSpan({ text: `${t('dialog.cardsExportGridCols')}: ` });
    const colsInput = colsLabel.createEl('input', {
      attr: { type: 'number', min: '1', max: '40', step: '1', value: '12' },
    });
    colsInput.style.maxWidth = '90px';

    const rowsLabel = gridWrap.createEl('label', { cls: 'vinyl-dialog-radio' });
    rowsLabel.createSpan({ text: `${t('dialog.cardsExportGridRows')}: ` });
    const rowsInput = rowsLabel.createEl('input', {
      attr: { type: 'number', min: '1', max: '40', step: '1', value: '12' },
    });
    rowsInput.style.maxWidth = '90px';

    const info = body.createEl('div', { cls: 'vinyl-dialog-note' });
    const syncModeInfo = () => {
      const cols = clampInt(colsInput.value, 1, 40, 12);
      const rowsPerFile = clampInt(rowsInput.value, 1, 40, 12);
      const perFile = cols * rowsPerFile;
      const isPaged = pagedModeInput.checked;
      colsInput.disabled = !isPaged;
      rowsInput.disabled = !isPaged;
      gridLabel.style.display = isPaged ? '' : 'none';
      gridWrap.style.display = isPaged ? 'flex' : 'none';
      info.textContent = pagedModeInput.checked
        ? t('dialog.cardsExportInfoPaged', { count: perFile })
        : t('dialog.cardsExportInfoSingle');
    };
    singleModeInput.addEventListener('change', syncModeInfo);
    pagedModeInput.addEventListener('change', syncModeInfo);
    colsInput.addEventListener('input', syncModeInfo);
    rowsInput.addEventListener('input', syncModeInfo);
    syncModeInfo();

    const cancelBtn = actions.createEl('button', { text: t('modal.cancel') });
    cancelBtn.addEventListener('click', close);

    const exportBtn = actions.createEl('button', { text: t('dialog.download'), cls: 'mod-cta' });
    exportBtn.addEventListener('click', async () => {
      try {
        exportBtn.disabled = true;
        exportBtn.textContent = t('dialog.generating');
        const format = pngInput.checked ? 'png' : 'jpeg';
        const theme = darkInput.checked ? 'dark' : 'light';
        const mode = pagedModeInput.checked ? 'paged' : 'single';
        const aspect = aspect219Input.checked ? '21:9' : (aspect169Input.checked ? '16:9' : '1:1');
        const gridCols = clampInt(colsInput.value, 1, 40, 12);
        const gridRows = clampInt(rowsInput.value, 1, 40, 12);
        const result = await this.exportCardsImage(rows, format, theme, {
          mode,
          aspect,
          gridCols,
          gridRows,
        });
        if (result.files > 1) {
          new Notice(t('dialog.cardsExportDoneMany', { count: result.files }));
        } else {
          new Notice(t('dialog.cardsExportDone'));
        }
        if (result.savedToVault) {
          new Notice(t('dialog.cardsExportSavedVault', { path: this.plugin.getImageExportFolderPath() }));
        }
        close();
      } catch (error) {
        console.error(error);
        new Notice(t('dialog.cardsExportError'));
        exportBtn.disabled = false;
        exportBtn.textContent = t('dialog.download');
      }
    });

  }

  async exportCardsImage(rows, format, theme = 'light', options = {}) {
    const mode = options.mode || 'single';
    const aspect = options.aspect || '1:1';
    const aspectRatio = getAspectRatioValue(aspect);
    const canvasSize = getAspectCanvasSize(aspect);
    const saveToVault = shouldSaveExportsToVault();

    if (mode === 'paged') {
      const cardsPerRow = clampInt(options.gridCols, 1, 40, 12);
      const rowsPerFile = clampInt(options.gridRows, 1, 40, 12);
      const perFile = cardsPerRow * rowsPerFile;
      const stamp = exportTimestamp();
      let part = 0;
      const layout = this.buildImageLayout({
        cardsPerRow,
        rowsForCanvas: rowsPerFile,
        aspectRatio,
        canvasWidth: canvasSize.width,
        canvasHeight: canvasSize.height,
      });

      for (let start = 0; start < rows.length; start += perFile) {
        const chunk = rows.slice(start, start + perFile);
        part += 1;
        await this.renderCardsImageFile(chunk, format, theme, {
          ...layout,
          stamp,
          part,
          saveToVault,
        });
        await delay(900);
      }

      return { files: part, savedToVault: saveToVault };
    }

    const singleGrid = chooseGridForCountByAspect(rows.length, aspectRatio);
    const singleLayout = this.buildImageLayout({
      cardsPerRow: singleGrid.cols,
      rowsForCanvas: singleGrid.rows,
      aspectRatio,
      canvasWidth: canvasSize.width,
      canvasHeight: canvasSize.height,
    });

    await this.renderCardsImageFile(rows, format, theme, {
      ...singleLayout,
      stamp: exportTimestamp(),
      part: 0,
      saveToVault,
    });

    return { files: 1, savedToVault: saveToVault };
  }

  buildImageLayout(options = {}) {
    const cardsPerRow = clampInt(options.cardsPerRow, 1, 40, 3);
    const rowsForCanvas = clampInt(options.rowsForCanvas, 1, 40, 3);
    const targetRatio = Number(options.aspectRatio) > 0 ? Number(options.aspectRatio) : 1;

    let canvasWidth = Number(options.canvasWidth) || 3200;
    let canvasHeight = Number(options.canvasHeight) || Math.round(canvasWidth / targetRatio);
    if (canvasHeight <= 0) canvasHeight = Math.round(canvasWidth / targetRatio);

    const gap = 10;
    const basePad = 10;
    const headerH = Math.max(52, Math.round(canvasHeight * 0.03));
    const availW = Math.max(180, canvasWidth - basePad * 2 - (cardsPerRow - 1) * gap);
    const availH = Math.max(180, canvasHeight - basePad * 2 - headerH - (rowsForCanvas - 1) * gap);

    const cardW = Math.max(90, Math.floor(availW / cardsPerRow));
    const cardH = Math.max(130, Math.floor(availH / rowsForCanvas));

    const usedW = cardsPerRow * cardW + (cardsPerRow - 1) * gap;
    const usedH = rowsForCanvas * cardH + (rowsForCanvas - 1) * gap;
    const horizontalPad = Math.max(basePad, Math.floor((canvasWidth - usedW) / 2));
    const verticalPad = basePad;

    return {
      cardsPerRow,
      cardW,
      cardH,
      gap,
      pad: horizontalPad,
      topPad: verticalPad,
      headerH,
      canvasWidth,
      canvasHeight,
      rowsForCanvas,
    };
  }

  async renderCardsImageFile(rows, format, theme = 'light', layout = {}) {
    const t = (key, vars) => this.plugin.t(key, vars);
    const cardsPerRow = Number(layout.cardsPerRow) || 3;
    const cardW = Number(layout.cardW) || 340;
    const cardH = Number(layout.cardH) || 500;
    const gap = Number(layout.gap) || 22;
    const pad = Number(layout.pad) || 24;
    const topPad = Number(layout.topPad) || pad;
    const headerH = Number(layout.headerH) || 92;
    const scaleW = cardW / 340;
    const scaleH = cardH / 500;
    const scale = Math.min(scaleW, scaleH);
    const coverPad = Math.max(6, Math.round(10 * scale));
    const reservedTextH = Math.max(74, Math.round(108 * scale));
    const cardRadius = Math.max(10, Math.round(18 * scale));
    const coverRadius = Math.max(8, Math.round(12 * scale));
    const shadowBlur = Math.max(8, Math.round(18 * scale));
    const shadowOffset = Math.max(2, Math.round(5 * scale));
    const artistFont = Math.max(10, Math.round(13 * scale));
    const cardTitleFont = Math.max(12, Math.round(17 * scale));
    const metaFont = Math.max(10, Math.round(12 * scale));
    const placeholderFont = Math.max(10, Math.round(14 * scale));
    const artistLine = Math.max(12, Math.round(16 * scale));
    const titleLine = Math.max(14, Math.round(20 * scale));
    const metaLine = Math.max(11, Math.round(14 * scale));
    const artistGap = Math.max(3, Math.round(5 * scale));
    const titleGap = Math.max(4, Math.round(6 * scale));
    const textTopGap = Math.max(12, Math.round(18 * scale));
    const totalRows = Math.ceil(rows.length / cardsPerRow);
    const rowsForCanvas = Number(layout.rowsForCanvas) || totalRows;

    const canvas = document.createElement('canvas');
    const computedWidth = pad * 2 + cardsPerRow * cardW + Math.max(0, cardsPerRow - 1) * gap;
    const computedHeight = topPad * 2 + headerH + rowsForCanvas * cardH + Math.max(0, rowsForCanvas - 1) * gap;
    canvas.width = Number(layout.canvasWidth) || computedWidth;
    canvas.height = Number(layout.canvasHeight) || computedHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context is not available');

    const isDark = theme === 'dark';
    const palette = isDark
      ? {
          bg: '#0f172a',
          heading: '#f8fafc',
          subtitle: '#94a3b8',
          cardBg: '#111827',
          shadow: 'rgba(2, 6, 23, 0.55)',
          coverBg: '#1f2937',
          placeholder: '#94a3b8',
          artist: '#cbd5e1',
          title: '#f8fafc',
          meta: '#94a3b8',
        }
      : {
          bg: '#f3f4f6',
          heading: '#111827',
          subtitle: '#6b7280',
          cardBg: '#ffffff',
          shadow: 'rgba(17, 24, 39, 0.12)',
          coverBg: '#eef1f5',
          placeholder: '#9ca3af',
          artist: '#4b5563',
          title: '#111827',
          meta: '#374151',
        };

    const prepared = await Promise.all(
      rows.map(async (row) => ({
        row,
        img: await loadImageSafe(this.plugin.resolveCoverSrc(row)),
      })),
    );

    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = palette.heading;
    const titleFont = Math.max(24, Math.round(Math.min(canvas.width, canvas.height) * 0.012));
    const subtitleFont = Math.max(14, Math.round(titleFont * 0.55));
    ctx.font = `700 ${titleFont}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
    ctx.fillText(t('view.title'), pad, topPad + titleFont);

    ctx.fillStyle = palette.subtitle;
    ctx.font = `500 ${subtitleFont}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
    const themeLabel = isDark ? t('view.imageThemeDark') : t('view.imageThemeLight');
    ctx.fillText(t('view.cardsCount', { count: rows.length, theme: themeLabel }), pad, topPad + titleFont + subtitleFont + 10);

    prepared.forEach((entry, index) => {
      const col = index % cardsPerRow;
      const rowIndex = Math.floor(index / cardsPerRow);
      const x = pad + col * (cardW + gap);
      const y = topPad + headerH + rowIndex * (cardH + gap);

      ctx.save();
      ctx.shadowColor = palette.shadow;
      ctx.shadowBlur = shadowBlur;
      ctx.shadowOffsetY = shadowOffset;
      ctx.fillStyle = palette.cardBg;
      roundedRect(ctx, x, y, cardW, cardH, cardRadius);
      ctx.fill();
      ctx.restore();

      const maxCoverByHeight = Math.max(80, cardH - coverPad * 2 - reservedTextH);
      const rawCoverW = cardW - coverPad * 2;
      const coverSize = Math.max(80, Math.min(rawCoverW, maxCoverByHeight));
      const coverW = coverSize;
      const coverH = coverSize;
      const coverX = x + (cardW - coverW) / 2;
      const coverY = y + coverPad;

      ctx.save();
      ctx.fillStyle = palette.coverBg;
      roundedRect(ctx, coverX, coverY, coverW, coverH, coverRadius);
      ctx.fill();

      roundedRect(ctx, coverX, coverY, coverW, coverH, coverRadius);
      ctx.clip();

      if (entry.img) {
        const imgScale = Math.min(coverW / entry.img.width, coverH / entry.img.height);
        const drawW = entry.img.width * imgScale;
        const drawH = entry.img.height * imgScale;
        const drawX = coverX + (coverW - drawW) / 2;
        const drawY = coverY + (coverH - drawH) / 2;
        ctx.drawImage(entry.img, drawX, drawY, drawW, drawH);
      } else {
        ctx.fillStyle = palette.placeholder;
        ctx.font = `500 ${placeholderFont}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(t('view.noCover'), coverX + coverW / 2, coverY + coverH / 2);
        ctx.textAlign = 'start';
      }
      ctx.restore();

      const textX = coverX;
      const textW = coverW;
      let textY = coverY + coverH + textTopGap;

      ctx.fillStyle = palette.artist;
      ctx.font = `600 ${artistFont}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
      textY = drawWrappedText(ctx, entry.row.artist || t('common.empty'), textX, textY, textW, artistLine, 2) + artistGap;

      ctx.fillStyle = palette.title;
      ctx.font = `700 ${cardTitleFont}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
      textY = drawWrappedText(
        ctx,
        entry.row.title || entry.row.file.basename,
        textX,
        textY,
        textW,
        titleLine,
        3,
      ) + titleGap;

      ctx.fillStyle = palette.meta;
      ctx.font = `500 ${metaFont}px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif`;
      const meta = `${entry.row.year || t('view.yearFallback')} • ${
        entry.row.price ? `${entry.row.price} ${t('common.currency')}` : t('view.priceFallback')
      }`;
      drawWrappedText(ctx, meta, textX, textY, textW, metaLine, 2);
    });

    const isJpeg = format === 'jpeg';
    const blob = await canvasToBlob(canvas, isJpeg ? 'image/jpeg' : 'image/png', isJpeg ? 0.92 : undefined);
    const ext = isJpeg ? 'jpg' : 'png';
    const themeSuffix = isDark ? 'dark' : 'light';
    const partSuffix = layout.part ? `-p${String(layout.part).padStart(2, '0')}` : '';
    const stamp = layout.stamp || exportTimestamp();
    const filename = `vinyl-cards-${themeSuffix}-${stamp}${partSuffix}.${ext}`;
    if (layout.saveToVault) {
      await this.plugin.saveExportBlobToVault(blob, filename);
    } else {
      await downloadBlob(blob, filename);
    }
  }
}

class VinylSettingsTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    const t = (key, vars) => this.plugin.t(key, vars);

    containerEl.createEl('h2', { text: t('settings.title') });

    new Setting(containerEl)
      .setName(t('settings.language'))
      .setDesc(t('settings.languageDesc'))
      .addDropdown((dropdown) => {
        dropdown
          .addOption('auto', t('settings.langAuto'))
          .addOption('ru', t('settings.langRu'))
          .addOption('en', t('settings.langEn'))
          .setValue(this.plugin.settings.language || DEFAULT_SETTINGS.language)
          .onChange(async (value) => {
            const next = value === 'ru' || value === 'en' ? value : 'auto';
            this.plugin.settings.language = next;
            await this.plugin.saveSettings();
            await this.plugin.relocalizeOpenViews();
            this.display();
          });
      });

    new Setting(containerEl)
      .setName(t('settings.collectionFolder'))
      .setDesc(t('settings.collectionFolderDesc'))
      .addText((text) => {
        text.setValue(this.plugin.settings.collectionFolder);
        text.onChange(async (value) => {
          this.plugin.settings.collectionFolder = normalizePath(value || DEFAULT_SETTINGS.collectionFolder);
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(t('settings.artistsFolder'))
      .setDesc(t('settings.artistsFolderDesc'))
      .addText((text) => {
        text.setValue(this.plugin.settings.artistsFolder);
        text.onChange(async (value) => {
          this.plugin.settings.artistsFolder = normalizePath(value || DEFAULT_SETTINGS.artistsFolder);
          await this.plugin.saveSettings();
          await this.plugin.refreshOpenViews();
        });
      });

    new Setting(containerEl)
      .setName(t('settings.coversFolder'))
      .setDesc(t('settings.coversFolderDesc'))
      .addText((text) => {
        text.setValue(this.plugin.settings.coversFolder);
        text.onChange(async (value) => {
          this.plugin.settings.coversFolder = normalizePath(value || DEFAULT_SETTINGS.coversFolder);
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(t('settings.init'))
      .setDesc(t('settings.initDesc'))
      .addButton((button) => {
        button.setButtonText(t('settings.initBtn')).setCta().onClick(async () => {
          await this.plugin.ensureStructure();
          new Notice(t('settings.initDone'));
        });
      });

    new Setting(containerEl)
      .setName(t('settings.base'))
      .setDesc(t('settings.baseDesc'))
      .addButton((button) => {
        button.setButtonText(t('settings.baseBtn')).onClick(async () => {
          const basePath = await this.plugin.createOrUpdateBaseFile();
          new Notice(t('settings.baseUpdated', { path: basePath }));
        });
      });
  }
}

class VinylCatalogToolsPlugin extends Plugin {
  async onload() {
    await this.loadSettings();

    this.registerView(
      VIEW_TYPE_VINYL_COLLECTION,
      (leaf) => new VinylCollectionView(leaf, this),
    );

    this.addRibbonIcon('disc', this.t('ribbon.openCollection'), async () => {
      await this.activateCollectionView();
    });

    this.addCommand({
      id: 'vinyl-open-collection',
      name: this.t('command.openCollection'),
      callback: async () => {
        await this.activateCollectionView();
      },
    });

    this.addCommand({
      id: 'vinyl-add-record',
      name: this.t('command.addRecord'),
      callback: () => {
        this.openAddModal();
      },
    });

    this.addCommand({
      id: 'vinyl-init-structure',
      name: this.t('command.initFolders'),
      callback: async () => {
        await this.ensureStructure();
        new Notice(this.t('settings.initDone'));
      },
    });

    this.addCommand({
      id: 'vinyl-import-discogs-csv',
      name: this.t('command.importDiscogs'),
      callback: async () => {
        await this.activateCollectionView();
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_VINYL_COLLECTION);
        const view = leaves[0]?.view;
        if (view instanceof VinylCollectionView) {
          view.showDiscogsImportDialog();
        }
      },
    });

    this.addCommand({
      id: 'vinyl-create-base-file',
      name: this.t('command.createBase'),
      callback: async () => {
        const basePath = await this.createOrUpdateBaseFile();
        new Notice(this.t('settings.baseUpdated', { path: basePath }));
      },
    });

    this.addSettingTab(new VinylSettingsTab(this.app, this));

    this.registerEvent(this.app.vault.on('create', async (file) => {
      await this.maybeRefreshForFile(file);
    }));
    this.registerEvent(this.app.vault.on('modify', async (file) => {
      await this.maybeRefreshForFile(file);
    }));
    this.registerEvent(this.app.vault.on('delete', async (file) => {
      await this.maybeRefreshForFile(file);
    }));
    this.registerEvent(this.app.vault.on('rename', async (file) => {
      await this.maybeRefreshForFile(file);
    }));
    this.registerEvent(this.app.metadataCache.on('changed', async (file) => {
      await this.maybeRefreshForFile(file);
    }));
  }

  async onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_VINYL_COLLECTION);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    if (!['auto', 'ru', 'en'].includes(this.settings.language)) {
      this.settings.language = DEFAULT_SETTINGS.language;
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  getLanguage() {
    const selected = this.settings?.language || DEFAULT_SETTINGS.language;
    if (selected === 'ru' || selected === 'en') return selected;
    const locale = String(window?.navigator?.language || '').toLowerCase();
    return locale.startsWith('ru') ? 'ru' : 'en';
  }

  t(key, vars = {}) {
    const lang = this.getLanguage();
    return translateText(I18N[lang] || I18N.en, I18N.en, key, vars);
  }

  openAddModal() {
    new AddVinylModal(this.app, this).open();
  }

  async activateCollectionView() {
    let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE_VINYL_COLLECTION)[0];

    if (!leaf) {
      leaf = this.app.workspace.getRightLeaf(false);
      await leaf.setViewState({
        type: VIEW_TYPE_VINYL_COLLECTION,
        active: true,
      });
    }

    this.app.workspace.revealLeaf(leaf);
    const view = leaf.view;
    if (view instanceof VinylCollectionView) {
      await view.refreshData();
    }
  }

  async maybeRefreshForFile(file) {
    if (!(file instanceof TFile)) return;
    if (file.extension !== 'md') return;

    const normalizedArtists = `${normalizePath(this.settings.artistsFolder).replace(/\/$/, '')}/`;
    if (file.path.startsWith(normalizedArtists)) {
      await this.refreshOpenViews();
    }
  }

  async refreshOpenViews() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_VINYL_COLLECTION);
    for (const leaf of leaves) {
      const view = leaf.view;
      if (view instanceof VinylCollectionView) {
        await view.refreshData();
      }
    }
  }

  async relocalizeOpenViews() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_VINYL_COLLECTION);
    for (const leaf of leaves) {
      const view = leaf.view;
      if (view instanceof VinylCollectionView) {
        view.relocalizeUi();
      }
    }
  }

  async ensureStructure() {
    await this.ensureFolder(this.settings.collectionFolder);
    await this.ensureFolder(this.settings.artistsFolder);
    await this.ensureFolder(this.settings.coversFolder);
  }

  getImageExportFolderPath() {
    const collectionRoot = normalizePath(this.settings.collectionFolder || DEFAULT_SETTINGS.collectionFolder);
    return normalizePath(`${collectionRoot}/exports`);
  }

  async saveExportBlobToVault(blob, filename) {
    const folder = this.getImageExportFolderPath();
    await this.ensureFolder(folder);
    const targetPath = await this.getUniqueNotePath(normalizePath(`${folder}/${filename}`));
    const buffer = new Uint8Array(await blob.arrayBuffer());
    await this.app.vault.adapter.writeBinary(targetPath, buffer);
    return targetPath;
  }

  getBaseFilePath() {
    const collectionRoot = normalizePath(this.settings.collectionFolder || DEFAULT_SETTINGS.collectionFolder);
    return normalizePath(`${collectionRoot}/${this.t('base.fileName')}`);
  }

  buildBaseFileContent() {
    const artistsFolder = normalizePath(this.settings.artistsFolder || DEFAULT_SETTINGS.artistsFolder);
    const inFolderExpr = `file.inFolder("${escapeDoubleQuoted(artistsFolder)}")`;

    return [
      'filters:',
      '  and:',
      `    - ${inFolderExpr}`,
      '    - artist',
      '    - hidden != true',
      'formulas:',
      '  items: "1"',
      'properties:',
      '  artist:',
      `    displayName: ${this.t('base.displayArtist')}`,
      '  title:',
      `    displayName: ${this.t('base.displayTitle')}`,
      '  year:',
      `    displayName: ${this.t('base.displayYear')}`,
      '  price:',
      `    displayName: ${this.t('base.displayPrice')}`,
      '  cover:',
      `    displayName: ${this.t('base.displayCover')}`,
      '  formula.items:',
      `    displayName: ${this.t('base.displayItems')}`,
      'views:',
      '  - type: table',
      `    name: ${this.t('base.viewTable')}`,
      '    order:',
      '      - artist',
      '      - title',
      '      - year',
      '      - price',
      '      - cover',
      '    sort:',
      '      - property: cover',
      '        direction: DESC',
      '      - property: artist',
      '        direction: ASC',
      '      - property: title',
      '        direction: ASC',
      '      - property: year',
      '        direction: DESC',
      '    summaries:',
      '      price: Sum',
      '      formula.items: Sum',
      '  - type: cards',
      `    name: ${this.t('base.viewCards')}`,
      '    order:',
      '      - artist',
      '      - title',
      '      - year',
      '    sort:',
      '      - property: artist',
      '        direction: ASC',
      '      - property: title',
      '        direction: ASC',
      '    image: cover',
      '    imageFit: contain',
      '    imageAspectRatio: 1',
      '    cardSize: 220',
      '',
    ].join('\n');
  }

  async createOrUpdateBaseFile() {
    await this.ensureStructure();

    const basePath = this.getBaseFilePath();
    const content = this.buildBaseFileContent();
    const exists = await this.app.vault.adapter.exists(basePath);

    if (exists) {
      const existing = this.app.vault.getAbstractFileByPath(basePath);
      if (existing instanceof TFile) {
        await this.app.vault.modify(existing, content);
      } else {
        await this.app.vault.adapter.write(basePath, content);
      }
    } else {
      await this.app.vault.create(basePath, content);
    }

    return basePath;
  }

  async ensureFolder(folderPath) {
    const normalized = normalizePath(folderPath);
    if (!normalized) return;
    if (await this.app.vault.adapter.exists(normalized)) return;

    const segments = normalized.split('/');
    let current = '';

    for (const segment of segments) {
      current = current ? `${current}/${segment}` : segment;
      if (!(await this.app.vault.adapter.exists(current))) {
        await this.app.vault.createFolder(current);
      }
    }
  }

  async getUniqueNotePath(initialPath) {
    const normalized = normalizePath(initialPath);
    if (!(await this.app.vault.adapter.exists(normalized))) return normalized;

    const ext = path.posix.extname(normalized);
    const noExt = normalized.slice(0, -ext.length);

    let counter = 2;
    while (true) {
      const candidate = `${noExt} ${counter}${ext}`;
      if (!(await this.app.vault.adapter.exists(candidate))) return candidate;
      counter += 1;
    }
  }

  async downloadCover(coverUrl, artist, title) {
    if (!coverUrl) return '';

    await this.ensureFolder(this.settings.coversFolder);

    const baseName = slugify(`${artist} ${title}`);
    let ext = extFromUrl(coverUrl) || 'jpg';

    const response = await requestUrl({
      url: coverUrl,
      method: 'GET',
      headers: {
        accept: 'image/*,*/*',
        'user-agent': 'Mozilla/5.0 (Obsidian)',
      },
    });

    const byContentType = extFromContentType(response.headers['content-type'] || response.headers['Content-Type']);
    if (byContentType) ext = byContentType;

    let targetPath = normalizePath(`${this.settings.coversFolder}/${baseName}.${ext}`);
    const existing = await this.app.vault.adapter.exists(targetPath);
    if (existing) {
      const unique = await this.getUniqueNotePath(targetPath);
      targetPath = unique;
    }

    if (ext === 'svg') {
      await this.app.vault.adapter.write(targetPath, response.text || '');
    } else {
      await this.app.vault.adapter.writeBinary(targetPath, new Uint8Array(response.arrayBuffer));
    }

    return targetPath;
  }

  buildRecordContent({ artist, title, year, price, coverPath }) {
    const frontmatter = {
      artist,
      title,
      tags: ['vinyl'],
    };

    if (toText(year)) frontmatter.year = toText(year);
    const parsedPrice = toPrice(price);
    if (parsedPrice) frontmatter.price = parsedPrice;
    if (coverPath) frontmatter.cover = `[[${coverPath}]]`;

    const yaml = stringifyYaml(frontmatter).trimEnd();

    const lines = [];
    if (coverPath) lines.push(`![[${coverPath}|300]]`, '');

    lines.push(
      this.t('record.artistLine', { artist }),
      '',
      '',
      this.t('record.notesHeading'),
      this.t('record.state'),
      this.t('record.edition'),
      this.t('record.comments'),
      '',
    );

    return `---\n${yaml}\n---\n\n${lines.join('\n')}`;
  }

  async createVinylRecord({ artist, title, year, price, coverUrl }) {
    await this.ensureStructure();

    const artistFolder = normalizePath(`${this.settings.artistsFolder}/${sanitizeName(artist)}`);
    await this.ensureFolder(artistFolder);

    let coverPath = '';
    if (coverUrl) {
      try {
        coverPath = await this.downloadCover(coverUrl, artist, title);
      } catch (error) {
        console.error(error);
        new Notice(this.t('record.coverDownloadFailed'));
      }
    }

    const baseName = `${sanitizeName(artist)} — ${sanitizeName(title)}`;
    const notePath = await this.getUniqueNotePath(`${artistFolder}/${baseName}.md`);
    const content = this.buildRecordContent({ artist, title, year, price, coverPath });

    return this.app.vault.create(notePath, content);
  }

  async openRecord(file) {
    if (!(file instanceof TFile)) return;
    const leaf = this.app.workspace.getLeaf(true);
    await leaf.openFile(file);
  }

  async setHiddenFlag(file, hidden) {
    if (!(file instanceof TFile)) return;

    const content = await this.app.vault.read(file);
    const parts = splitFrontmatter(content);

    let frontmatter = {};
    let body = content;

    if (parts) {
      frontmatter = parseYaml(parts.frontmatterRaw) || {};
      body = parts.body;
    }

    if (hidden) {
      frontmatter.hidden = true;
    } else {
      delete frontmatter.hidden;
    }

    const yaml = stringifyYaml(frontmatter).trimEnd();
    const next = `---\n${yaml}\n---\n\n${body.replace(/^\s*/, '')}`;
    await this.app.vault.modify(file, next);
  }

  async readFrontmatter(file) {
    const cached = this.app.metadataCache.getFileCache(file)?.frontmatter;
    if (cached && Object.keys(cached).length > 0) {
      return cached;
    }

    const content = await this.app.vault.cachedRead(file);
    const parts = splitFrontmatter(content);
    if (!parts) return {};
    return parseYaml(parts.frontmatterRaw) || {};
  }

  async modifyFrontmatter(file, mutator) {
    const content = await this.app.vault.read(file);
    const parts = splitFrontmatter(content);

    let frontmatter = {};
    let body = content;
    if (parts) {
      frontmatter = parseYaml(parts.frontmatterRaw) || {};
      body = parts.body;
    }

    const nextFrontmatter = (await mutator(frontmatter)) || frontmatter;
    const yaml = stringifyYaml(nextFrontmatter).trimEnd();
    const next = `---\n${yaml}\n---\n\n${body.replace(/^\s*/, '')}`;
    await this.app.vault.modify(file, next);
  }

  async ensureCoverLinked(file, coverPath) {
    if (!coverPath) return false;

    const fm = await this.readFrontmatter(file);
    if (hasCoverValue(fm.cover)) return false;

    await this.modifyFrontmatter(file, async (frontmatter) => {
      if (!hasCoverValue(frontmatter.cover)) {
        frontmatter.cover = `[[${coverPath}]]`;
      }
      return frontmatter;
    });
    return true;
  }

  async throttleDiscogsRequest(state, minIntervalMs = 1200) {
    const now = Date.now();
    const waitMs = state.lastRequestTs + minIntervalMs - now;
    if (waitMs > 0) await delay(waitMs);
    state.lastRequestTs = Date.now();
  }

  async fetchDiscogsReleaseImageUrl(releaseId, state) {
    const key = toText(releaseId);
    if (!key) return '';
    if (state.imageUrlCache.has(key)) return state.imageUrlCache.get(key) || '';

    await this.throttleDiscogsRequest(state);

    const response = await requestUrl({
      url: `https://api.discogs.com/releases/${encodeURIComponent(key)}`,
      method: 'GET',
      headers: {
        accept: 'application/json',
        'user-agent': 'VinylCatalogTools/0.5.0 (+https://obsidian.md)',
      },
    });

    if (response.status >= 400) {
      if (response.status === 429) {
        const retryAfterSec = Number(response.headers['Retry-After'] || response.headers['retry-after'] || 2);
        await delay(Math.max(1000, retryAfterSec * 1000));
        await this.throttleDiscogsRequest(state);
        const retry = await requestUrl({
          url: `https://api.discogs.com/releases/${encodeURIComponent(key)}`,
          method: 'GET',
          headers: {
            accept: 'application/json',
            'user-agent': 'VinylCatalogTools/0.5.0 (+https://obsidian.md)',
          },
        });
        if (retry.status >= 400) {
          state.imageUrlCache.set(key, '');
          return '';
        }
        const parsedRetry = JSON.parse(retry.text || '{}');
        const retryUrl = toText(parsedRetry?.images?.[0]?.uri || parsedRetry?.images?.[0]?.uri150);
        state.imageUrlCache.set(key, retryUrl);
        return retryUrl;
      }

      state.imageUrlCache.set(key, '');
      return '';
    }

    const parsed = JSON.parse(response.text || '{}');
    const url = toText(parsed?.images?.[0]?.uri || parsed?.images?.[0]?.uri150);
    state.imageUrlCache.set(key, url);
    return url;
  }

  async downloadCoverByUrl(url, preferredStem) {
    const coverUrl = toText(url);
    if (!coverUrl) return '';

    await this.ensureFolder(this.settings.coversFolder);

    let ext = extFromUrl(coverUrl) || 'jpg';
    let targetPath = normalizePath(`${this.settings.coversFolder}/${preferredStem}.${ext}`);
    const alreadyExists = await this.app.vault.adapter.exists(targetPath);
    if (alreadyExists) return targetPath;

    const response = await requestUrl({
      url: coverUrl,
      method: 'GET',
      headers: {
        accept: 'image/*,*/*',
        'user-agent': 'VinylCatalogTools/0.5.0 (+https://obsidian.md)',
      },
    });

    if (response.status >= 400) return '';

    const byContentType = extFromContentType(response.headers['content-type'] || response.headers['Content-Type']);
    if (byContentType) {
      ext = byContentType;
      targetPath = normalizePath(`${this.settings.coversFolder}/${preferredStem}.${ext}`);
      if (await this.app.vault.adapter.exists(targetPath)) return targetPath;
    }

    if (ext === 'svg') {
      await this.app.vault.adapter.write(targetPath, response.text || '');
    } else {
      await this.app.vault.adapter.writeBinary(targetPath, new Uint8Array(response.arrayBuffer));
    }

    return targetPath;
  }

  async fetchAndAttachDiscogsCover(file, record, state) {
    if (!record.releaseId) return false;

    const fm = await this.readFrontmatter(file);
    if (hasCoverValue(fm.cover)) return false;

    const imageUrl = await this.fetchDiscogsReleaseImageUrl(record.releaseId, state);
    if (!imageUrl) return false;

    const safeReleaseId = sanitizeName(record.releaseId) || slugify(record.releaseId);
    const stem = `discogs-${safeReleaseId}`;
    const coverPath = await this.downloadCoverByUrl(imageUrl, stem);
    if (!coverPath) return false;

    return this.ensureCoverLinked(file, coverPath);
  }

  applyDiscogsFields(frontmatter, record) {
    frontmatter.artist = record.artist;
    frontmatter.title = record.title;
    if (record.year) frontmatter.year = record.year;
    if (record.releaseId) frontmatter.discogs_release_id = record.releaseId;
    if (record.catalogNumber) frontmatter.catalog_number = record.catalogNumber;
    if (record.label) frontmatter.label = record.label;
    if (record.format) frontmatter.format = record.format;
    if (record.rating) frontmatter.discogs_rating = record.rating;
    if (record.dateAdded) frontmatter.discogs_date_added = record.dateAdded;
    if (record.mediaCondition) frontmatter.media_condition = record.mediaCondition;
    if (record.sleeveCondition) frontmatter.sleeve_condition = record.sleeveCondition;
    frontmatter.source = 'discogs';

    const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags.map((tag) => toText(tag)).filter(Boolean) : [];
    if (!tags.includes('vinyl')) tags.push('vinyl');
    frontmatter.tags = tags;
  }

  buildDiscogsRecordContent(record) {
    const frontmatter = {};
    this.applyDiscogsFields(frontmatter, record);

    const yaml = stringifyYaml(frontmatter).trimEnd();
    const lines = [
      this.t('record.artistLine', { artist: record.artist }),
      '',
      this.t('discogs.heading'),
      this.t('discogs.releaseId', { value: record.releaseId || this.t('common.empty') }),
      this.t('discogs.catalog', { value: record.catalogNumber || this.t('common.empty') }),
      this.t('discogs.label', { value: record.label || this.t('common.empty') }),
      this.t('discogs.format', { value: record.format || this.t('common.empty') }),
      this.t('discogs.added', { value: record.dateAdded || this.t('common.empty') }),
      '',
      this.t('discogs.notesHeading'),
      this.t('discogs.media', { value: record.mediaCondition || '' }),
      this.t('discogs.sleeve', { value: record.sleeveCondition || '' }),
      this.t('discogs.edition'),
      this.t('discogs.comments', { value: record.notes || '' }),
      '',
    ];

    return `---\n${yaml}\n---\n\n${lines.join('\n')}`;
  }

  async createVinylRecordFromDiscogs(record) {
    await this.ensureStructure();
    const artistFolder = normalizePath(`${this.settings.artistsFolder}/${sanitizeName(record.artist)}`);
    await this.ensureFolder(artistFolder);

    const baseName = `${sanitizeName(record.artist)} — ${sanitizeName(record.title)}`;
    const notePath = await this.getUniqueNotePath(`${artistFolder}/${baseName}.md`);
    const content = this.buildDiscogsRecordContent(record);
    return this.app.vault.create(notePath, content);
  }

  async updateVinylRecordFromDiscogs(file, record) {
    await this.modifyFrontmatter(file, async (frontmatter) => {
      this.applyDiscogsFields(frontmatter, record);
      return frontmatter;
    });
  }

  async buildDiscogsIndex() {
    const byReleaseId = new Map();
    const byArtistTitle = new Map();
    const prefix = `${normalizePath(this.settings.artistsFolder).replace(/\/$/, '')}/`;

    const files = this.app.vault
      .getMarkdownFiles()
      .filter((file) => file.path.startsWith(prefix))
      .filter((file) => {
        const tail = file.path.slice(prefix.length);
        return tail.includes('/');
      });

    for (const file of files) {
      const fm = await this.readFrontmatter(file);
      const artist = toText(fm.artist);
      const title = toText(fm.title) || file.basename;
      const releaseId = toText(fm.discogs_release_id || fm.release_id);

      if (artist && title) {
        byArtistTitle.set(makeArtistTitleLookupKey(artist, title), file);
      }
      if (releaseId) byReleaseId.set(releaseId, file);
    }

    return { byReleaseId, byArtistTitle };
  }

  async backfillDiscogsCoversForExisting(options = {}) {
    const onProgress = typeof options.onProgress === 'function' ? options.onProgress : null;
    const prefix = `${normalizePath(this.settings.artistsFolder).replace(/\/$/, '')}/`;

    const files = this.app.vault
      .getMarkdownFiles()
      .filter((file) => file.path.startsWith(prefix))
      .filter((file) => {
        const tail = file.path.slice(prefix.length);
        return tail.includes('/');
      });

    const summary = {
      scanned: files.length,
      candidates: 0,
      attached: 0,
      skipped: 0,
      errors: [],
    };

    const state = {
      lastRequestTs: 0,
      imageUrlCache: new Map(),
    };

    let progress = 0;
    for (const file of files) {
      progress += 1;
      if (onProgress) onProgress(progress, files.length);

      try {
        const fm = await this.readFrontmatter(file);
        const releaseId = toText(fm.discogs_release_id || fm.release_id);

        if (!releaseId || hasCoverValue(fm.cover)) {
          summary.skipped += 1;
          continue;
        }

        summary.candidates += 1;
        const attached = await this.fetchAndAttachDiscogsCover(file, { releaseId }, state);
        if (attached) summary.attached += 1;
        else summary.skipped += 1;
      } catch (error) {
        summary.errors.push(`${file.path}: ${error?.message ?? this.t('error.backfill')}`);
      }
    }

    await this.refreshOpenViews();
    return summary;
  }

  async importDiscogsCsv(csvText, options = {}) {
    const upsert = options.upsert !== false;
    const autoFetchCovers = options.autoFetchCovers === true;
    const onProgress = typeof options.onProgress === 'function' ? options.onProgress : null;
    const rawRows = parseCsvToObjects(csvText);
    if (!rawRows.length) {
      throw new Error(this.t('error.csvEmpty'));
    }

    const mappedRows = rawRows.map(mapDiscogsCsvRow).filter(Boolean);
    const summary = {
      total: rawRows.length,
      created: 0,
      updated: 0,
      coversAttached: 0,
      skipped: rawRows.length - mappedRows.length,
      errors: [],
    };

    if (!mappedRows.length) {
      throw new Error(this.t('error.csvInvalidRows'));
    }

    const index = await this.buildDiscogsIndex();
    const discogsState = {
      lastRequestTs: 0,
      imageUrlCache: new Map(),
    };

    let progress = 0;
    for (const record of mappedRows) {
      progress += 1;
      if (onProgress) onProgress(progress, mappedRows.length);
      try {
        let targetFile = null;
        if (upsert) {
          if (record.releaseId) targetFile = index.byReleaseId.get(record.releaseId) || null;
          if (!targetFile) {
            targetFile = index.byArtistTitle.get(makeArtistTitleLookupKey(record.artist, record.title)) || null;
          }
        }

        if (targetFile) {
          await this.updateVinylRecordFromDiscogs(targetFile, record);
          summary.updated += 1;
        } else {
          targetFile = await this.createVinylRecordFromDiscogs(record);
          summary.created += 1;
        }

        if (record.releaseId) index.byReleaseId.set(record.releaseId, targetFile);
        index.byArtistTitle.set(makeArtistTitleLookupKey(record.artist, record.title), targetFile);

        if (autoFetchCovers) {
          const attached = await this.fetchAndAttachDiscogsCover(targetFile, record, discogsState);
          if (attached) summary.coversAttached += 1;
        }
      } catch (error) {
        summary.errors.push(`${record.artist} — ${record.title}: ${error?.message ?? this.t('error.importItem')}`);
      }
    }

    await this.refreshOpenViews();
    return summary;
  }

  async loadVinylRows() {
    const prefix = `${normalizePath(this.settings.artistsFolder).replace(/\/$/, '')}/`;

    const files = this.app.vault
      .getMarkdownFiles()
      .filter((file) => file.path.startsWith(prefix))
      .filter((file) => {
        const tail = file.path.slice(prefix.length);
        return tail.includes('/');
      });

    const rows = await Promise.all(files.map(async (file) => {
      const fm = await this.readFrontmatter(file);

      const isHidden = fm.hidden === true || toText(fm.hidden).toLowerCase() === 'true';
      if (isHidden) return null;

      const artist = toText(fm.artist);
      if (!artist) return null;

      const title = toText(fm.title) || file.basename;
      const year = toText(fm.year);
      const price = toPrice(fm.price);
      const addedTs = file.stat?.ctime || 0;
      const addedDate = addedTs ? new Date(addedTs) : null;
      const addedText = addedDate
        ? `${String(addedDate.getDate()).padStart(2, '0')}.${String(addedDate.getMonth() + 1).padStart(2, '0')}.${addedDate.getFullYear()}`
        : this.t('common.empty');

      return {
        file,
        artist,
        title,
        year,
        price,
        cover: fm.cover,
        added: addedTs,
        addedText,
      };
    }));

    return rows.filter(Boolean);
  }

  resolveCoverSrc(row) {
    const raw = normalizeCoverLinkTarget(unwrapCoverValue(row.cover));
    if (!raw) return '';

    if (/^(https?:|data:|file:|app:)/i.test(raw)) {
      return raw;
    }

    const direct = this.app.vault.getAbstractFileByPath(raw);
    if (direct instanceof TFile) {
      return this.app.vault.getResourcePath(direct);
    }

    const linked = this.app.metadataCache.getFirstLinkpathDest(raw, row.file.path);
    if (linked instanceof TFile) {
      return this.app.vault.getResourcePath(linked);
    }

    return '';
  }
}

module.exports = VinylCatalogToolsPlugin;
