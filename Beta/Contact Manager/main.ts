import { App, Plugin, PluginSettingTab, Notice, TFile, MarkdownView, WorkspaceLeaf } from 'obsidian';
import { ContactCardsSettings, DEFAULT_SETTINGS, ObjectType, Contact } from './src/contact-types';
import { ContactCardsSettingTab } from './src/settings-tab';
import { LinkResolver } from './src/link-resolver';
import { FileManager } from './src/file-manager';
import { ContactCreator } from './src/contact-creator';
import { ContactCardView } from './src/contact-card-view';
import { ContactsView, CONTACTS_VIEW_TYPE } from './src/contacts-view';

export default class ContactCardsPlugin extends Plugin {
    settings: ContactCardsSettings;
    linkResolver: LinkResolver;
    fileManager: FileManager;
    contactCardView: ContactCardView;
    private lastRefreshTime: number = 0;
    private refreshCooldown: number = 30000; // 30 seconds

    async onload() {
        await this.loadSettings();

        this.linkResolver = new LinkResolver(this.app, this.settings);
        this.fileManager = new FileManager(this.app, this.settings);
        this.contactCardView = new ContactCardView(this.app, this.settings, this.linkResolver);

        // Register contacts view
        this.registerView(
            CONTACTS_VIEW_TYPE,
            (leaf) => new ContactsView(leaf, this)
        );

        this.registerEvents();
        this.addCommands();
        this.addRibbonButton();
        this.setupMarkdownPostProcessor();
        this.addSettingTab(new ContactCardsSettingTab(this.app, this));

        console.log('ContactManager Plugin loaded');
    }

    onunload() {
        console.log('Contact Cards Plugin unloaded');
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);

        if (this.linkResolver) {
            this.linkResolver.updateSettings(this.settings);
        }
        if (this.fileManager) {
            this.fileManager.updateSettings(this.settings);
        }
        if (this.contactCardView) {
            this.contactCardView.updateSettings(this.settings);
        }

        // Refresh all open contacts views when settings change
        this.refreshAllContactsViews();
    }

    private refreshAllContactsViews(): void {
        const contactsViews = this.app.workspace.getLeavesOfType(CONTACTS_VIEW_TYPE);
        contactsViews.forEach(leaf => {
            const view = leaf.view as ContactsView;
            if (view && view.refresh) {
                view.refresh();
            }
        });
    }

    private refreshContactCardsInOpenNotes(): void {
        const markdownViews = this.app.workspace.getLeavesOfType('markdown');
        markdownViews.forEach(leaf => {
            const view = leaf.view as MarkdownView;
            if (view && view.file && this.isContactFile(view.file)) {
                // Force re-render of the markdown preview
                if (view.previewMode) {
                    (view.previewMode as any).rerender(true);
                }
            }
        });
    }

    private registerEvents(): void {
        // Only listen for essential events, not aggressive auto-refresh
        this.registerEvent(
            this.app.vault.on('create', this.onFileCreate.bind(this))
        );

        this.registerEvent(
            this.app.vault.on('rename', this.onFileRename.bind(this))
        );

        this.registerEvent(
            this.app.vault.on('delete', this.onFileDelete.bind(this))
        );

        // Listen for editor mode changes to refresh when exiting edit mode
        this.registerEvent(
            this.app.workspace.on('active-leaf-change', this.onActiveLeafChange.bind(this))
        );
    }

    private addCommands(): void {
        this.addCommand({
            id: 'open-contacts-view',
            name: 'Open Contacts View',
            callback: () => {
                this.openContactsView();
            }
        });

        this.addCommand({
            id: 'create-contact',
            name: 'Create New Contact',
            callback: () => {
                this.openContactCreator();
            }
        });

        this.addCommand({
            id: 'create-people-contact',
            name: 'Create People Contact',
            callback: () => {
                this.openContactCreator('People');
            }
        });

        this.addCommand({
            id: 'create-company-contact',
            name: 'Create Company Contact',
            callback: () => {
                this.openContactCreator('Company');
            }
        });

        this.addCommand({
            id: 'create-trade-union-contact',
            name: 'Create Trade Union Contact',
            callback: () => {
                this.openContactCreator('TradeUnion');
            }
        });

        this.addCommand({
            id: 'create-organization-contact',
            name: 'Create Organization Contact',
            callback: () => {
                this.openContactCreator('Organization');
            }
        });

        this.addCommand({
            id: 'refresh-contact-links',
            name: 'Refresh Contact Links',
            callback: async () => {
                await this.refreshAllContactLinks();
            }
        });

        this.addCommand({
            id: 'refresh-current-contact-links',
            name: 'Refresh Current Contact Links',
            checkCallback: (checking: boolean) => {
                const activeFile = this.app.workspace.getActiveFile();
                if (activeFile && this.isContactFile(activeFile)) {
                    if (!checking) {
                        this.linkResolver.refreshDynamicLinks(activeFile.path);
                        new Notice('Contact links refreshed!');
                    }
                    return true;
                }
                return false;
            }
        });
    }

    private addRibbonButton(): void {
        const ribbonIconEl = this.addRibbonIcon('users', 'Open Contacts', (evt: MouseEvent) => {
            this.openContactsView();
        });

        ribbonIconEl.addClass('contact-cards-ribbon-icon');
    }

    async openContactsView(): Promise<void> {
        const existing = this.app.workspace.getLeavesOfType(CONTACTS_VIEW_TYPE);
        if (existing.length > 0) {
            this.app.workspace.revealLeaf(existing[0]);
            return;
        }

        const leaf = this.app.workspace.getRightLeaf(false);
        await leaf.setViewState({
            type: CONTACTS_VIEW_TYPE,
            active: true
        });

        this.app.workspace.revealLeaf(leaf);
    }

    private setupMarkdownPostProcessor(): void {
        this.registerMarkdownPostProcessor(async (element: HTMLElement, context: any) => {
            await this.processContactCard(element, context);
        });
    }

    private async processContactCard(element: HTMLElement, context: any): Promise<void> {
        if (!context.sourcePath) return;

        const file = this.app.vault.getAbstractFileByPath(context.sourcePath) as TFile;
        if (!file || !this.isContactFile(file)) return;

        try {
            const contactResult = await this.linkResolver.parseContactFile(file);
            if (!contactResult) return;

            // Check if this element is the right place for the card
            await this.contactCardView.renderCard(contactResult.contact, element, file.path);
        } catch (error) {
            console.error('Error processing contact card:', error);
        }
    }

    private openContactCreator(preselectedType?: ObjectType): void {
        const creator = new ContactCreator(
            this.app,
            this.settings,
            this.fileManager,
            preselectedType
        );
        creator.open();
    }

    private async onFileOpen(file: TFile | null): Promise<void> {
        if (!file || !this.isContactFile(file)) return;

        try {
            await this.linkResolver.refreshDynamicLinks(file.path);
        } catch (error) {
            console.error('Error refreshing links on file open:', error);
        }
    }

    private async onFileCreate(file: TFile): Promise<void> {
        if (!this.isContactFile(file)) return;

        try {
            // Only invalidate cache, don't refresh UI immediately
            this.linkResolver.invalidateFileCache(file.path);
        } catch (error) {
            console.error('Error handling file creation:', error);
        }
    }

    private async onActiveLeafChange(): Promise<void> {
        try {
            // Check if we should refresh (rate limited)
            if (this.shouldRefresh()) {
                this.refreshContactCardsInOpenNotes();
                this.updateLastRefreshTime();
            }
        } catch (error) {
            console.error('Error handling leaf change:', error);
        }
    }

    private async onFileRename(file: TFile, oldPath: string): Promise<void> {
        if (!this.isContactFile(file)) return;

        try {
            // Invalidate cache and refresh links, but don't refresh UI immediately
            this.linkResolver.invalidateCache();
            await this.refreshAllContactLinks();
        } catch (error) {
            console.error('Error handling file rename:', error);
        }
    }

    private async onFileDelete(file: TFile): Promise<void> {
        if (!this.isContactFile(file)) return;

        try {
            // Invalidate cache and refresh links, refresh UI since file is gone
            this.linkResolver.invalidateCache();
            await this.refreshAllContactLinks();
            this.refreshAllContactsViews();
        } catch (error) {
            console.error('Error handling file deletion:', error);
        }
    }

    private shouldRefresh(): boolean {
        const now = Date.now();
        return (now - this.lastRefreshTime) >= this.refreshCooldown;
    }

    private updateLastRefreshTime(): void {
        this.lastRefreshTime = Date.now();
    }

    public forceRefresh(): void {
        // Public method for manual refresh (like the refresh button)
        this.refreshContactCardsInOpenNotes();
        this.refreshAllContactsViews();
        this.updateLastRefreshTime();
    }

    private async refreshAllContactLinks(): Promise<void> {
        try {
            const allContacts = [
                ...(await this.linkResolver.getAllContactsOfType('People')),
                ...(await this.linkResolver.getAllContactsOfType('Company')),
                ...(await this.linkResolver.getAllContactsOfType('TradeUnion')),
                ...(await this.linkResolver.getAllContactsOfType('Organization'))
            ];

            for (const contact of allContacts) {
                await this.linkResolver.refreshDynamicLinks(contact.path);
            }

            new Notice(`Refreshed links for ${allContacts.length} contacts`);
        } catch (error) {
            console.error('Error refreshing all contact links:', error);
            new Notice('Error refreshing contact links');
        }
    }

    private isContactFile(file: TFile): boolean {
        if (!file || file.extension !== 'md') return false;

        const allFolders = [
            ...this.settings.peopleFolders,
            ...this.settings.companyFolders,
            ...this.settings.tradeUnionFolders,
            ...this.settings.organizationFolders
        ];

        return allFolders.some(folder =>
            file.path.startsWith(folder + '/') || file.path === folder
        );
    }

    private async isContactFileByContent(file: TFile): Promise<boolean> {
        try {
            const metadata = this.app.metadataCache.getFileCache(file);
            const frontmatter = metadata?.frontmatter;

            if (!frontmatter) return false;

            const contactType = frontmatter.type;
            return contactType && ['People', 'Company', 'TradeUnion', 'Organization'].includes(contactType);
        } catch (error) {
            return false;
        }
    }

    public async createContactFromTemplate(
        name: string,
        type: ObjectType,
        folder?: string,
        data: Record<string, any> = {}
    ): Promise<TFile | null> {
        return await this.fileManager.createContactFile(name, type, folder, data);
    }

    public async getContactsInFolder(folderPath: string): Promise<Contact[]> {
        const contacts = await this.linkResolver.getContactsInFolder(folderPath);
        return contacts.map(result => result.contact);
    }

    public async getContactByPath(filePath: string): Promise<Contact | null> {
        const file = this.app.vault.getAbstractFileByPath(filePath) as TFile;
        if (!file) return null;

        const result = await this.linkResolver.parseContactFile(file);
        return result ? result.contact : null;
    }

    public getLinkResolver(): LinkResolver {
        return this.linkResolver;
    }

    public getFileManager(): FileManager {
        return this.fileManager;
    }

    public getContactCardView(): ContactCardView {
        return this.contactCardView;
    }
}