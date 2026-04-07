import { ItemView, WorkspaceLeaf, Setting, Notice, Modal, TFile } from 'obsidian';
import { ContactCardsSettings, ObjectType, ContactParseResult } from './contact-types';
import { LinkResolver } from './link-resolver';
import { ContactCreator } from './contact-creator';
import { FileManager } from './file-manager';
import ContactCardsPlugin from '../main';

export const CONTACTS_VIEW_TYPE = "contacts-view";

export class ContactsView extends ItemView {
    private plugin: ContactCardsPlugin;
    private settings: ContactCardsSettings;
    private linkResolver: LinkResolver;
    private fileManager: FileManager;
    private allContacts: ContactParseResult[] = [];
    private filteredContacts: ContactParseResult[] = [];
    private searchQuery: string = '';
    private selectedType: ObjectType | 'all' = 'all';
    private sortMode: 'alphabetical' | 'company' | 'union' | 'organization' = 'alphabetical';

    constructor(leaf: WorkspaceLeaf, plugin: ContactCardsPlugin) {
        super(leaf);
        this.plugin = plugin;
        this.settings = plugin.settings;
        this.linkResolver = plugin.getLinkResolver();
        this.fileManager = plugin.getFileManager();
    }

    getViewType(): string {
        return CONTACTS_VIEW_TYPE;
    }

    getDisplayText(): string {
        return "Contacts";
    }

    getIcon(): string {
        return "users";
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('contacts-view-container');

        // Validate selectedType is still enabled
        if (this.selectedType !== 'all' && !this.settings.enabledContactTypes.includes(this.selectedType as ObjectType)) {
            this.selectedType = 'all';
        }

        // Refresh data when opening the panel
        this.linkResolver.invalidateCache();
        await this.loadAllContacts();
        this.renderView();
    }

    async onClose() {
        // Cleanup if needed
    }

    private async loadAllContacts(): Promise<void> {
        try {
            const [people, companies, unions, organizations] = await Promise.all([
                this.linkResolver.getAllContactsOfType('People'),
                this.linkResolver.getAllContactsOfType('Company'),
                this.linkResolver.getAllContactsOfType('TradeUnion'),
                this.linkResolver.getAllContactsOfType('Organization')
            ]);

            this.allContacts = [...people, ...companies, ...unions, ...organizations];
            this.filteredContacts = [...this.allContacts];
        } catch (error) {
            console.error('Error loading contacts:', error);
            new Notice('Error loading contacts');
        }
    }

    private renderView(): void {
        const container = this.containerEl.children[1];
        container.empty();

        // Header
        const header = container.createDiv({ cls: 'contacts-header' });
        header.createEl('h2', { text: 'Contacts Manager', cls: 'contacts-title' });

        // Search and filters
        this.renderSearchAndFilters(header);

        // Action buttons container
        const actionButtons = header.createDiv({ cls: 'contacts-action-buttons' });

        // Sort dropdown (only show for People)
        if (this.selectedType === 'People') {
            this.renderSortDropdown(actionButtons);
        }

        // Refresh button
        const refreshButton = actionButtons.createEl('button', {
            text: '🔄 Refresh',
            cls: 'contacts-refresh-button'
        });
        refreshButton.addEventListener('click', async () => {
            refreshButton.disabled = true;
            refreshButton.textContent = '🔄 Refreshing...';
            // Use the plugin's force refresh method
            this.plugin.forceRefresh();
            await this.refresh();
            refreshButton.disabled = false;
            refreshButton.textContent = '🔄 Refresh';
        });

        // Add new contact button
        const addButton = actionButtons.createEl('button', {
            text: '+ New Contact',
            cls: 'contacts-add-button'
        });
        addButton.addEventListener('click', () => {
            const creator = new ContactCreator(
                this.app,
                this.settings,
                this.fileManager
            );
            creator.open();
        });

        // Content area
        const content = container.createDiv({ cls: 'contacts-content' });

        // Type tabs
        this.renderTypeTabs(content);

        // Contacts grid
        this.renderContactsGrid(content);
    }

    private renderSearchAndFilters(container: HTMLElement): void {
        const searchContainer = container.createDiv({ cls: 'contacts-search-container' });

        // Search input wrapper
        const searchInputWrapper = searchContainer.createDiv({ cls: 'contacts-search-input-wrapper' });

        // Search input
        const searchInput = searchInputWrapper.createEl('input', {
            type: 'text',
            placeholder: 'Search contacts...',
            cls: 'contacts-search-input'
        });

        // Clear button (initially hidden)
        const clearButton = searchInputWrapper.createEl('button', {
            text: '×',
            cls: 'contacts-search-clear',
            attr: { 'aria-label': 'Clear search', 'title': 'Clear search' }
        });
        clearButton.style.display = 'none';

        // Set initial value if there's a search query
        if (this.searchQuery) {
            searchInput.value = this.searchQuery;
            clearButton.style.display = 'block';
        }

        const updateSearch = (value: string) => {
            this.searchQuery = value;
            clearButton.style.display = value ? 'block' : 'none';
            // Refresh data when searching
            this.loadAllContacts().then(() => {
                this.filterContacts();
                this.updateTabCounts(); // Update tab counts based on search results
                this.renderContactsGrid(this.containerEl.querySelector('.contacts-content') as HTMLElement);
            });
        };

        searchInput.addEventListener('input', (e) => {
            const value = (e.target as HTMLInputElement).value;
            updateSearch(value);
        });

        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            searchInput.focus();
            updateSearch('');
        });

        // Results count
        const resultsCount = searchContainer.createDiv({ cls: 'contacts-results-count' });
        resultsCount.textContent = `${this.filteredContacts.length} contacts`;
    }

    private renderTypeTabs(container: HTMLElement): void {
        // Remove existing tabs if they exist
        const existingTabs = container.querySelector('.contacts-tabs');
        if (existingTabs) {
            existingTabs.remove();
        }

        const tabsContainer = container.createDiv({ cls: 'contacts-tabs' });

        const allTabs = [
            { type: 'all' as ObjectType | 'all', label: 'All', icon: '📋' },
            { type: 'People' as ObjectType, label: 'People', icon: '👤' },
            { type: 'Company' as ObjectType, label: 'Companies', icon: '🏢' },
            { type: 'TradeUnion' as ObjectType, label: 'Trade Unions', icon: '🤝' },
            { type: 'Organization' as ObjectType, label: 'Organizations', icon: '🏛️' }
        ];

        // Filter tabs by enabled contact types (always show "All")
        const tabs = allTabs.filter(tab =>
            tab.type === 'all' || this.settings.enabledContactTypes.includes(tab.type as ObjectType)
        );

        tabs.forEach(tab => {
            const tabElement = tabsContainer.createDiv({
                cls: `contacts-tab ${this.selectedType === tab.type ? 'active' : ''}`,
                text: `${tab.icon} ${tab.label}`
            });

            const count = tab.type === 'all'
                ? this.filteredContacts.length
                : this.filteredContacts.filter(c => c.contact.type === tab.type).length;

            tabElement.createSpan({ text: ` (${count})`, cls: 'tab-count' });

            tabElement.addEventListener('click', () => {
                // Store current scroll position
                const tabsContainer = this.containerEl.querySelector('.contacts-tabs') as HTMLElement;
                const currentScrollLeft = tabsContainer ? tabsContainer.scrollLeft : 0;

                this.selectedType = tab.type;
                // Refresh data when changing filter
                this.loadAllContacts().then(() => {
                    this.filterContacts();
                    this.updateTabCounts(); // Update counts without recreating tabs
                    this.updateActiveTab(true); // Update active state and center since user clicked
                    this.renderContactsGrid(this.containerEl.querySelector('.contacts-content') as HTMLElement);
                    this.renderSortControls(); // Update sort controls if needed
                });
            });
        });

        // Center the active tab in scroll view (initial render)
        this.updateActiveTab(true);
    }

    private scrollToActiveTab(): void {
        // Use setTimeout to ensure DOM is updated
        setTimeout(() => {
            const tabsContainer = this.containerEl.querySelector('.contacts-tabs') as HTMLElement;
            const activeTab = this.containerEl.querySelector('.contacts-tab.active') as HTMLElement;

            if (tabsContainer && activeTab) {
                const containerRect = tabsContainer.getBoundingClientRect();
                const activeRect = activeTab.getBoundingClientRect();

                // Calculate the scroll position to center the active tab
                const scrollLeft = activeTab.offsetLeft - (tabsContainer.clientWidth / 2) + (activeTab.clientWidth / 2);

                tabsContainer.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });
            }
        }, 10);
    }

    private updateActiveTab(shouldScroll: boolean = false): void {
        const tabs = this.containerEl.querySelectorAll('.contacts-tab');
        let hasChanged = false;

        // First, check if we need to change any active states
        tabs.forEach(tab => {
            const wasActive = tab.classList.contains('active');
            const tabText = tab.textContent || '';
            let shouldActivate = false;

            if (this.selectedType === 'all' && tabText.includes('All')) {
                shouldActivate = true;
            } else if (this.selectedType === 'People' && tabText.includes('People')) {
                shouldActivate = true;
            } else if (this.selectedType === 'Company' && tabText.includes('Companies')) {
                shouldActivate = true;
            } else if (this.selectedType === 'TradeUnion' && tabText.includes('Trade Unions')) {
                shouldActivate = true;
            } else if (this.selectedType === 'Organization' && tabText.includes('Organizations')) {
                shouldActivate = true;
            }

            // Update active state if needed
            if (wasActive && !shouldActivate) {
                tab.removeClass('active');
                hasChanged = true;
            } else if (!wasActive && shouldActivate) {
                tab.addClass('active');
                hasChanged = true;
            }
        });

        // Only scroll if there was a change or explicitly requested
        if (hasChanged || shouldScroll) {
            this.scrollToActiveTab();
        }
    }

    private updateTabCounts(): void {
        const tabs = this.containerEl.querySelectorAll('.contacts-tab');
        tabs.forEach(tab => {
            const tabText = tab.textContent || '';
            let count = 0;

            if (tabText.includes('All')) {
                count = this.filteredContacts.length;
            } else if (tabText.includes('People')) {
                count = this.filteredContacts.filter(c => c.contact.type === 'People').length;
            } else if (tabText.includes('Companies')) {
                count = this.filteredContacts.filter(c => c.contact.type === 'Company').length;
            } else if (tabText.includes('Trade Unions')) {
                count = this.filteredContacts.filter(c => c.contact.type === 'TradeUnion').length;
            } else if (tabText.includes('Organizations')) {
                count = this.filteredContacts.filter(c => c.contact.type === 'Organization').length;
            }

            // Update the count span
            const countSpan = tab.querySelector('.tab-count') as HTMLElement;
            if (countSpan) {
                countSpan.textContent = ` (${count})`;
            }
        });
    }

    private renderSortControls(): void {
        const actionButtons = this.containerEl.querySelector('.contacts-action-buttons') as HTMLElement;
        if (actionButtons) {
            // Clear existing sort dropdown
            const existingSortDropdown = actionButtons.querySelector('.contacts-sort-dropdown');
            if (existingSortDropdown) {
                existingSortDropdown.remove();
            }

            // Re-render sort dropdown
            this.renderSortDropdown(actionButtons);
        }
    }

    private renderSortDropdown(container: HTMLElement): void {
        // Only show sort dropdown for People type
        if (this.selectedType !== 'People') {
            return;
        }

        const dropdownContainer = container.createDiv({ cls: 'contacts-sort-dropdown' });

        const allSortOptions = [
            { mode: 'alphabetical', label: 'A-Z', icon: '🔤' },
            { mode: 'company', label: 'Company', icon: '🏢' },
            { mode: 'union', label: 'Union', icon: '🤝' },
            { mode: 'organization', label: 'Organization', icon: '🏛️' }
        ];

        const sortOptions = allSortOptions;

        // Validate and adjust current sort mode if it's no longer available
        const currentModeAvailable = sortOptions.some(opt => opt.mode === this.sortMode);
        if (!currentModeAvailable) {
            this.sortMode = 'alphabetical'; // Reset to alphabetical if current mode is unavailable
        }

        // Find current option
        const currentOption = sortOptions.find(opt => opt.mode === this.sortMode) || sortOptions[0];

        // Dropdown button
        const dropdownButton = dropdownContainer.createEl('button', {
            text: `📊 ${currentOption.label}`,
            cls: 'contacts-sort-dropdown-button',
            attr: { 'aria-haspopup': 'true', 'aria-expanded': 'false' }
        });

        // Dropdown menu (initially hidden)
        const dropdownMenu = dropdownContainer.createDiv({ cls: 'contacts-sort-dropdown-menu' });
        dropdownMenu.style.display = 'none';

        sortOptions.forEach(option => {
            const menuItem = dropdownMenu.createDiv({
                text: `${option.icon} ${option.label}`,
                cls: `contacts-sort-dropdown-item ${this.sortMode === option.mode ? 'active' : ''}`
            });

            menuItem.addEventListener('click', () => {
                this.sortMode = option.mode as 'alphabetical' | 'company' | 'union' | 'organization';
                this.filterContacts();
                this.updateTabCounts(); // Update tab counts after sorting change
                dropdownMenu.style.display = 'none';
                dropdownButton.setAttribute('aria-expanded', 'false');
                this.renderView();
            });
        });

        // Toggle dropdown
        dropdownButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdownMenu.style.display === 'block';
            dropdownMenu.style.display = isOpen ? 'none' : 'block';
            dropdownButton.setAttribute('aria-expanded', (!isOpen).toString());
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdownMenu.style.display = 'none';
            dropdownButton.setAttribute('aria-expanded', 'false');
        });
    }

    private sortContacts(contacts: ContactParseResult[]): void {
        contacts.sort((a, b) => {
            const aContact = a.contact as any;
            const bContact = b.contact as any;

            // Get display names for both contacts
            const aDisplayName = this.getDisplayName(a.contact, a.filename);
            const bDisplayName = this.getDisplayName(b.contact, b.filename);

            // For non-People types or alphabetical mode, always sort alphabetically
            if (this.selectedType !== 'People' || this.sortMode === 'alphabetical') {
                return aDisplayName.localeCompare(bDisplayName);
            }

            // For grouping modes (only for People type and only People contacts)
            let aGroupValue = '';
            let bGroupValue = '';

            if (this.sortMode === 'company') {
                aGroupValue = this.getFirstLinkText(aContact.company);
                bGroupValue = this.getFirstLinkText(bContact.company);
            } else if (this.sortMode === 'union') {
                aGroupValue = this.getFirstLinkText(aContact.tradeUnion);
                bGroupValue = this.getFirstLinkText(bContact.tradeUnion);
            } else if (this.sortMode === 'organization') {
                aGroupValue = this.getFirstLinkText(aContact.organization);
                bGroupValue = this.getFirstLinkText(bContact.organization);
            }

            // Empty values go to the end
            if (!aGroupValue && !bGroupValue) {
                return aDisplayName.localeCompare(bDisplayName);
            }
            if (!aGroupValue) return 1;
            if (!bGroupValue) return -1;

            // First sort by group
            const groupComparison = aGroupValue.localeCompare(bGroupValue);
            if (groupComparison !== 0) {
                return groupComparison;
            }

            // Then sort alphabetically within the group using display names
            return aDisplayName.localeCompare(bDisplayName);
        });
    }

    private cleanLinkText(text: string): string {
        const cleaned = text.replace(/^\[\[/, '').replace(/\]\]$/, '').trim();
        // Extract alias if available
        return cleaned.includes('|') ? cleaned.split('|')[1] : cleaned;
    }

    private getFirstLinkText(property: string | string[] | undefined): string {
        if (!property) return '';

        if (Array.isArray(property)) {
            return property.length > 0 ? this.cleanLinkText(property[0]) : '';
        } else {
            return this.cleanLinkText(property);
        }
    }

    private getDisplayName(contact: Contact, filename: string): string {
        return contact.aliases && contact.aliases.length > 0 && contact.aliases[0].trim()
            ? contact.aliases[0]
            : filename;
    }

    private getContactTypeCssClass(type: string): string {
        switch (type) {
            case 'TradeUnion':
                return 'tradeunion';
            case 'People':
                return 'people';
            case 'Company':
                return 'company';
            case 'Organization':
                return 'organization';
            default:
                return type.toLowerCase();
        }
    }

    private renderContactsGrid(container: HTMLElement): void {
        const existingGrid = container.querySelector('.contacts-grid');
        if (existingGrid) {
            existingGrid.remove();
        }

        const gridContainer = container.createDiv({ cls: 'contacts-grid' });

        if (this.filteredContacts.length === 0) {
            const emptyState = gridContainer.createDiv({ cls: 'contacts-empty-state' });
            emptyState.createEl('div', { text: '📝', cls: 'empty-icon' });
            emptyState.createEl('h3', { text: 'No contacts found' });
            emptyState.createEl('p', { text: 'Try adjusting your search or create a new contact.' });
            return;
        }

        this.filteredContacts.forEach(contactResult => {
            const card = this.createContactGridCard(contactResult);
            gridContainer.appendChild(card);
        });

        // Update results count
        const resultsCount = this.containerEl.querySelector('.contacts-results-count');
        if (resultsCount) {
            resultsCount.textContent = `${this.filteredContacts.length} contacts`;
        }
    }

    private createContactGridCard(contactResult: ContactParseResult): HTMLElement {
        const contact = contactResult.contact;
        const card = createDiv({ cls: `contact-grid-card ${this.getContactTypeCssClass(contact.type)}` });

        // Card header with image and basic info
        const cardHeader = card.createDiv({ cls: 'card-header' });

        // Image section
        const imageContainer = cardHeader.createDiv({ cls: 'card-image-container' });

        const imageInput: string | undefined = (contact as any).coverImage;

        const imagePath = this.getImagePath(imageInput);
        if (imagePath) {
            const img = imageContainer.createEl('img', {
                cls: 'card-image',
                attr: { src: this.getImageSrc(imagePath) }
            });
            img.onerror = () => {
                imageContainer.innerHTML = '<div class="card-image-placeholder">' + this.getTypeIcon(contact.type) + '</div>';
            };
        } else {
            imageContainer.innerHTML = '<div class="card-image-placeholder">' + this.getTypeIcon(contact.type) + '</div>';
        }

        // Add organization logo overlay for People
        if (contact.type === 'People') {
            const peopleContact = contact as any;
            let orgName: string | null = null;

            if (peopleContact.tradeUnion) {
                orgName = Array.isArray(peopleContact.tradeUnion) ? peopleContact.tradeUnion[0] : peopleContact.tradeUnion;
            } else if (peopleContact.company) {
                orgName = Array.isArray(peopleContact.company) ? peopleContact.company[0] : peopleContact.company;
            } else if (peopleContact.organization) {
                orgName = Array.isArray(peopleContact.organization) ? peopleContact.organization[0] : peopleContact.organization;
            }

            if (orgName) {
                const overlay = imageContainer.createDiv({ cls: 'card-org-logo-overlay' });
                this.loadOrgLogoForOverlay(overlay, orgName);
            }
        }

        // Info section
        const infoContainer = cardHeader.createDiv({ cls: 'card-info' });

        const displayName = contact.aliases && contact.aliases.length > 0 && contact.aliases[0].trim()
            ? contact.aliases[0]
            : contactResult.filename;
        const nameElement = infoContainer.createEl('h3', {
            text: displayName,
            cls: 'card-name'
        });

        const typeElement = infoContainer.createEl('div', {
            text: contact.type,
            cls: 'card-type'
        });

        // Show specific fields above tags based on contact type
        const fieldsContainer = infoContainer.createDiv({ cls: 'card-affiliations' });

        if (contact.type === 'People') {
            const peopleContact = contact as any;
            // People: TradeUnion, Company, Organization, Role
            if (peopleContact.tradeUnion) {
                const tradeUnions = Array.isArray(peopleContact.tradeUnion) ? peopleContact.tradeUnion : [peopleContact.tradeUnion];
                const displayTexts = tradeUnions.map(tradeUnion => {
                    const cleanTradeUnion = tradeUnion.replace(/^\[\[/, '').replace(/\]\]$/, '');
                    return cleanTradeUnion.includes('|') ? cleanTradeUnion.split('|')[1] : cleanTradeUnion;
                });
                fieldsContainer.createDiv({
                    text: `🤝 ${displayTexts.join(', ')}`,
                    cls: 'card-affiliation'
                });
            }
            if (peopleContact.company) {
                const companies = Array.isArray(peopleContact.company) ? peopleContact.company : [peopleContact.company];
                const displayTexts = companies.map(company => {
                    const cleanCompany = company.replace(/^\[\[/, '').replace(/\]\]$/, '');
                    return cleanCompany.includes('|') ? cleanCompany.split('|')[1] : cleanCompany;
                });
                fieldsContainer.createDiv({
                    text: `🏢 ${displayTexts.join(', ')}`,
                    cls: 'card-affiliation'
                });
            }
            if (peopleContact.organization) {
                const organizations = Array.isArray(peopleContact.organization) ? peopleContact.organization : [peopleContact.organization];
                const displayTexts = organizations.map(organization => {
                    const cleanOrganization = organization.replace(/^\[\[/, '').replace(/\]\]$/, '');
                    return cleanOrganization.includes('|') ? cleanOrganization.split('|')[1] : cleanOrganization;
                });
                fieldsContainer.createDiv({
                    text: `🏛️ ${displayTexts.join(', ')}`,
                    cls: 'card-affiliation'
                });
            }
            if (peopleContact.role) {
                fieldsContainer.createDiv({
                    text: `💼 ${peopleContact.role}`,
                    cls: 'card-affiliation'
                });
            }
            if (peopleContact.country && peopleContact.country.length > 0) {
                const countryValue = Array.isArray(peopleContact.country) ? peopleContact.country[0] : peopleContact.country;
                const cleanCountry = countryValue.replace(/^\[\[/, '').replace(/\]\]$/, '');
                const displayText = cleanCountry.includes('|') ? cleanCountry.split('|')[1] : cleanCountry;
                fieldsContainer.createDiv({
                    text: `🌍 ${displayText}`,
                    cls: 'card-affiliation'
                });
            }
        } else if (contact.type === 'Company') {
            const companyContact = contact as any;
            // Company: activeProjects
            if (companyContact.activeProjects && companyContact.activeProjects.length > 0) {
                fieldsContainer.createDiv({
                    text: `📋 ${companyContact.activeProjects.length} active project${companyContact.activeProjects.length !== 1 ? 's' : ''}`,
                    cls: 'card-affiliation'
                });
            }
        } else if (contact.type === 'TradeUnion') {
            const tradeUnionContact = contact as any;
            // TradeUnion: Country, activeProjects
            if (tradeUnionContact.country && tradeUnionContact.country.length > 0) {
                const countryValue = Array.isArray(tradeUnionContact.country) ? tradeUnionContact.country[0] : tradeUnionContact.country;
                const cleanCountry = countryValue.replace(/^\[\[/, '').replace(/\]\]$/, '');
                const displayText = cleanCountry.includes('|') ? cleanCountry.split('|')[1] : cleanCountry;
                fieldsContainer.createDiv({
                    text: `🌍 ${displayText}`,
                    cls: 'card-affiliation'
                });
            }
            if (tradeUnionContact.activeProjects && tradeUnionContact.activeProjects.length > 0) {
                fieldsContainer.createDiv({
                    text: `📋 ${tradeUnionContact.activeProjects.length} active project${tradeUnionContact.activeProjects.length !== 1 ? 's' : ''}`,
                    cls: 'card-affiliation'
                });
            }
        } else if (contact.type === 'Organization') {
            // Organization: Country only
            if (contact.country && contact.country.length > 0) {
                const countryValue = Array.isArray(contact.country) ? contact.country[0] : contact.country;
                const cleanCountry = countryValue.replace(/^\[\[/, '').replace(/\]\]$/, '');
                const displayText = cleanCountry.includes('|') ? cleanCountry.split('|')[1] : cleanCountry;
                fieldsContainer.createDiv({
                    text: `🌍 ${displayText}`,
                    cls: 'card-affiliation'
                });
            }
        }

        // Remove container if no fields were added
        if (fieldsContainer.children.length === 0) {
            fieldsContainer.remove();
        }

        // Tags if any - show all
        if (contact.tags && contact.tags.length > 0) {
            const tagsContainer = infoContainer.createDiv({ cls: 'card-tags' });
            contact.tags.forEach(tag => {
                tagsContainer.createSpan({ text: `#${tag}`, cls: 'card-tag' });
            });
        }

        // Description - limit to 500 characters
        if (contact.description) {
            const descriptionText = contact.description.length > 500
                ? contact.description.substring(0, 500) + '...'
                : contact.description;
            const summary = infoContainer.createDiv({
                text: descriptionText,
                cls: 'card-summary'
            });
        }

        // Removed quick-info section - all relevant fields are now above tags

        // Click handler
        card.addEventListener('click', (e) => {
            // Don't open if it's a right-click or if prevented by long press
            if (e.button === 2) return;
            this.app.workspace.openLinkText(contactResult.path, '', false);
        });

        return card;
    }

    private addQuickInfo(container: HTMLElement, contact: any): void {
        switch (contact.type) {
            case 'People':
                if (contact.email) {
                    const emailInfo = container.createDiv({ cls: 'quick-info-item' });
                    emailInfo.createSpan({ text: '✉️', cls: 'quick-info-icon' });
                    emailInfo.createSpan({ text: contact.email, cls: 'quick-info-text' });
                }
                if (contact.phone) {
                    const phoneInfo = container.createDiv({ cls: 'quick-info-item' });
                    phoneInfo.createSpan({ text: '📱', cls: 'quick-info-icon' });
                    phoneInfo.createSpan({ text: contact.phone, cls: 'quick-info-text' });
                }
                // Removed TradeUnion/Company/Organization/Role as they're now shown above tags
                break;
            case 'Company':
                // Removed Website/ContactInfo as they're now shown above tags
                if (contact.management && contact.management.length > 0) {
                    const mgmtInfo = container.createDiv({ cls: 'quick-info-item' });
                    mgmtInfo.createSpan({ text: '👔', cls: 'quick-info-icon' });
                    mgmtInfo.createSpan({ text: `Management: ${contact.management.slice(0, 2).join(', ')}${contact.management.length > 2 ? '...' : ''}`, cls: 'quick-info-text' });
                }
                break;
            case 'TradeUnion':
            case 'Organization':
                // Removed Website as it's now shown above tags
                if (contact.activeProjects && contact.activeProjects.length > 0) {
                    const projectsInfo = container.createDiv({ cls: 'quick-info-item' });
                    projectsInfo.createSpan({ text: '🚀', cls: 'quick-info-icon' });
                    projectsInfo.createSpan({ text: `${contact.activeProjects.length} active project${contact.activeProjects.length !== 1 ? 's' : ''}`, cls: 'quick-info-text' });
                }
                break;
        }

        if (contact.Country && contact.Country.length > 0) {
            const countryInfo = container.createDiv({ cls: 'quick-info-item' });
            countryInfo.createSpan({ text: '🌍', cls: 'quick-info-icon' });
            countryInfo.createSpan({
                text: contact.country.slice(0, 2).join(', ') + (contact.country.length > 2 ? '...' : ''),
                cls: 'quick-info-text'
            });
        }
    }

    private getTypeIcon(type: ObjectType): string {
        switch (type) {
            case 'People': return '👤';
            case 'Company': return '🏢';
            case 'TradeUnion': return '🤝';
            case 'Organization': return '🏛️';
            default: return '📄';
        }
    }

    private validateSortMode(): void {
        let isValid = false;

        switch (this.sortMode) {
            case 'alphabetical':
                isValid = true; // Always available
                break;
            case 'company':
                isValid = this.settings.enabledContactTypes.includes('Company');
                break;
            case 'union':
                isValid = this.settings.enabledContactTypes.includes('TradeUnion');
                break;
            case 'organization':
                isValid = this.settings.enabledContactTypes.includes('Organization');
                break;
            default:
                isValid = false;
        }

        if (!isValid) {
            this.sortMode = 'alphabetical';
        }
    }

    updateSettings(settings: ContactCardsSettings): void {
        this.settings = settings;

        // Validate selectedType is still enabled
        if (this.selectedType !== 'all' && !this.settings.enabledContactTypes.includes(this.selectedType as ObjectType)) {
            this.selectedType = 'all';
        }

        // Validate sortMode is still available
        this.validateSortMode();

        // Refresh the view
        this.renderView();
    }

    private filterContacts(): void {
        let filtered = this.allContacts;

        // Filter by type
        if (this.selectedType !== 'all') {
            filtered = filtered.filter(contact => contact.contact.type === this.selectedType);
        }

        // Filter by search query
        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(contact => {
                const c = contact.contact as any;

                // Build comprehensive search text from all properties
                const searchFields = [
                    contact.filename,
                    c.description || '',
                    c.role || '',
                    c.email || '',
                    c.phone || '',
                    c.LinkedIn || '',
                    c.website || '',
                    ...(Array.isArray(c.tradeUnion) ? c.tradeUnion : [c.tradeUnion || '']),
                    ...(Array.isArray(c.company) ? c.company : [c.company || '']),
                    ...(Array.isArray(c.organization) ? c.organization : [c.organization || '']),
                    ...(c.tags || []),
                    ...(c.country || []),
                    ...(c.activeProjects || []),
                    ...(c.management || []),
                    ...(c.ContactInfo || []),
                    ...(c.collections || []),
                    ...(c.aliases || [])
                ];

                // Clean link brackets and join all text
                const searchText = searchFields
                    .filter(field => field && field.toString().trim())
                    .map(field => field.toString().replace(/^\[\[/, '').replace(/\]\]$/, ''))
                    .join(' ')
                    .toLowerCase();

                return searchText.includes(query);
            });
        }

        // Sort the filtered contacts
        this.sortContacts(filtered);
        this.filteredContacts = filtered;
    }

    async refresh(): Promise<void> {
        // Update settings from plugin
        this.settings = this.plugin.settings;

        // Validate selectedType is still enabled
        if (this.selectedType !== 'all' && !this.settings.enabledContactTypes.includes(this.selectedType as ObjectType)) {
            this.selectedType = 'all';
        }

        // Validate sortMode is still available
        this.validateSortMode();

        // Force clear all cache to ensure fresh data
        this.linkResolver.invalidateCache();
        await this.loadAllContacts();
        this.filterContacts();
        this.updateTabCounts(); // Update tab counts after refresh
        this.renderView();
    }

    private async loadOrgLogoForOverlay(container: HTMLElement, orgName: string): Promise<void> {
        try {
            // Clean the organization name (remove [[]] if present)
            const cleanName = orgName.replace(/^\[\[/, '').replace(/\]\]$/, '');

            // Try to find the organization file
            const orgFile = this.app.vault.getAbstractFileByPath(cleanName + '.md') ||
                           this.app.metadataCache.getFirstLinkpathDest(cleanName, '');

            if (orgFile) {
                const orgContact = await this.linkResolver.parseContactFile(orgFile as any);
                if (orgContact?.contact && 'coverImage' in orgContact.contact && orgContact.contact.coverImage) {
                    const logoPath = this.getImagePath(orgContact.contact.coverImage);
                    if (logoPath) {
                        const img = container.createEl('img', {
                            attr: { src: this.getImageSrc(logoPath) }
                        });
                        img.onerror = () => {
                            container.innerHTML = '🏢';
                        };
                        return;
                    }
                }
            }
        } catch (error) {
            console.warn('Could not load organization logo for overlay:', error);
        }

        // Fallback to emoji
        container.innerHTML = '🏢';
    }


    private async openContactEditor(contactResult: ContactParseResult): Promise<void> {
        const file = this.app.vault.getAbstractFileByPath(contactResult.path);
        if (file && file.path) {
            await this.app.workspace.openLinkText(contactResult.path, '', false);
        } else {
            new Notice('Contact file not found');
        }
    }

    private async confirmDeleteContact(contactResult: ContactParseResult): Promise<void> {
        const contactName = contactResult.filename;

        const confirmed = await new Promise<boolean>((resolve) => {
            const modal = new Modal(this.app);
            modal.titleEl.setText('Delete Contact');
            modal.contentEl.empty();

            modal.contentEl.createEl('p', {
                text: `Are you sure you want to delete "${contactName}"?`
            });
            modal.contentEl.createEl('p', {
                text: 'This action cannot be undone.',
                cls: 'mod-warning'
            });

            const buttonContainer = modal.contentEl.createDiv({ cls: 'modal-button-container' });

            const cancelBtn = buttonContainer.createEl('button', { text: 'Cancel' });
            cancelBtn.addEventListener('click', () => {
                modal.close();
                resolve(false);
            });

            const deleteBtn = buttonContainer.createEl('button', {
                text: 'Delete',
                cls: 'mod-warning'
            });
            deleteBtn.addEventListener('click', () => {
                modal.close();
                resolve(true);
            });

            modal.open();
        });

        if (confirmed) {
            try {
                const file = this.app.vault.getAbstractFileByPath(contactResult.path);
                if (file) {
                    await this.app.vault.delete(file);
                    new Notice(`Contact "${contactName}" deleted successfully`);

                    // Refresh the view to remove the deleted contact
                    await this.refresh();
                }
            } catch (error) {
                console.error('Error deleting contact:', error);
                new Notice('Error deleting contact');
            }
        }
    }

    private extractLinkText(value: string): string {
        // Extract text from [[Link]] or [[Link|Alias]] format
        const linkMatch = value.match(/\[\[([^\]]+)\]\]/);
        if (linkMatch) {
            const linkContent = linkMatch[1];
            // If there's a pipe (alias), take the part before the pipe for the actual link
            return linkContent.includes('|') ? linkContent.split('|')[0].trim() : linkContent;
        }
        return value;
    }

    private getImagePath(imageInput: string): string | null {
        if (!imageInput?.trim()) return null;

        // If it's an Obsidian link like [[image.jpg]] or [[image.jpg|alias]]
        if (imageInput.includes('[[') && imageInput.includes(']]')) {
            // Extract the path from the link
            const linkText = this.extractLinkText(imageInput);

            // Try to resolve the link using Obsidian's link resolution
            const resolvedFile = this.app.metadataCache.getFirstLinkpathDest(linkText, '');
            if (resolvedFile) {
                console.log(`Resolved image link "${linkText}" to: ${resolvedFile.path}`);
                return resolvedFile.path;
            } else {
                console.log(`Could not resolve image link: "${linkText}"`);
            }

            // Fallback to direct path if link resolution fails
            return linkText;
        }

        // If it's already a direct path, return as-is
        return imageInput.trim();
    }

    private getImageSrc(imagePath: string): string {
        // Try different methods to get the image source
        try {
            // First try with adapter.getResourcePath (current method)
            const adapterPath = this.app.vault.adapter.getResourcePath(imagePath);
            if (adapterPath) {
                return adapterPath;
            }
        } catch (error) {
            console.warn('adapter.getResourcePath failed:', error);
        }

        try {
            // Try with vault.getResourcePath
            const file = this.app.vault.getAbstractFileByPath(imagePath) as TFile;
            if (file && file instanceof TFile) {
                const vaultPath = this.app.vault.getResourcePath(file);
                if (vaultPath) {
                    return vaultPath;
                }
            }
        } catch (error) {
            console.warn('vault.getResourcePath failed:', error);
        }

        // Fallback to direct path
        console.warn(`Using direct path for image: ${imagePath}`);
        return imagePath;
    }
}