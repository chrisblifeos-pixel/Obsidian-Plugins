import { App, Modal, Setting, TFile, Notice } from 'obsidian';
import { ContactCardsSettings, ObjectType } from './contact-types';
import { FileManager } from './file-manager';

export class ContactCreator extends Modal {
    private settings: ContactCardsSettings;
    private fileManager: FileManager;
    private preselectedType?: ObjectType;
    private nameInput: string = '';
    private selectedFolder: string = '';

    constructor(
        app: App,
        settings: ContactCardsSettings,
        fileManager: FileManager,
        preselectedType?: ObjectType
    ) {
        super(app);
        this.settings = settings;
        this.fileManager = fileManager;
        this.preselectedType = preselectedType;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('contact-creator-modal');

        contentEl.createEl('h2', { text: 'Create New Contact' });

        if (!this.preselectedType || !this.settings.enabledContactTypes.includes(this.preselectedType)) {
            this.renderTypeSelection(contentEl);
        } else {
            this.renderNameInput(contentEl, this.preselectedType);
        }
    }

    onClose() {
        this.nameInput = '';
        this.selectedFolder = '';
    }

    private renderTypeSelection(container: HTMLElement): void {
        const typeContainer = container.createDiv({ cls: 'contact-type-selection' });
        typeContainer.createEl('h3', { text: 'Select Contact Type' });

        const buttonContainer = typeContainer.createDiv({ cls: 'contact-type-buttons' });

        const types: { type: ObjectType; label: string; icon: string }[] = [
            { type: 'People', label: 'People', icon: '👤' },
            { type: 'Company', label: 'Company', icon: '🏢' },
            { type: 'TradeUnion', label: 'Trade Union', icon: '🤝' },
            { type: 'Organization', label: 'Organization', icon: '🏛️' }
        ];

        // Filter types by enabled contact types
        const enabledTypes = types.filter(({ type }) =>
            this.settings.enabledContactTypes.includes(type)
        );

        enabledTypes.forEach(({ type, label, icon }) => {
            const button = buttonContainer.createEl('button', {
                cls: 'contact-type-button',
                text: `${icon} ${label}`
            });

            button.addEventListener('click', () => {
                container.empty();
                this.renderNameInput(container, type);
            });
        });
    }

    private renderNameInput(container: HTMLElement, contactType: ObjectType): void {
        const formContainer = container.createDiv({ cls: 'contact-form' });

        formContainer.createEl('h3', { text: `Create ${contactType} Contact` });

        // Basic Information Section
        const basicSection = formContainer.createDiv({ cls: 'form-section' });
        basicSection.createEl('h4', { text: 'Basic Information' });

        // Name input
        new Setting(basicSection)
            .setName('Name')
            .setDesc(`Name of the ${contactType.toLowerCase()}`)
            .addText(text => text
                .setPlaceholder(`Enter ${contactType.toLowerCase()} name`)
                .onChange(value => {
                    this.nameInput = value;
                }));

        // Folder selection
        new Setting(basicSection)
            .setName('Folder')
            .setDesc('Choose which folder to create the contact in')
            .addDropdown(dropdown => {
                const folders = this.getFoldersForContactType(contactType);
                folders.forEach(folder => {
                    dropdown.addOption(folder, folder);
                });
                dropdown.onChange(value => {
                    this.selectedFolder = value;
                });
                this.selectedFolder = folders[0];
                return dropdown;
            });

        // Action buttons
        this.renderFormActions(formContainer, contactType);
    }

    private renderFormActions(container: HTMLElement, contactType: ObjectType): void {
        const actionsContainer = container.createDiv({ cls: 'form-actions' });

        // Cancel button
        const cancelButton = actionsContainer.createEl('button', {
            text: 'Cancel',
            cls: 'contact-form-button-secondary'
        });
        cancelButton.addEventListener('click', () => {
            this.close();
        });

        // Create button
        const createButton = actionsContainer.createEl('button', {
            text: `Create ${contactType}`,
            cls: 'contact-form-button-primary'
        });
        createButton.addEventListener('click', async () => {
            await this.createContact(contactType);
        });
    }

    private async createContact(contactType: ObjectType): Promise<void> {
        if (!this.nameInput.trim()) {
            new Notice('Please enter a name for the contact');
            return;
        }

        try {
            const createdFile = await this.fileManager.createContactFile(
                this.nameInput,
                contactType,
                this.selectedFolder
            );

            if (createdFile) {
                new Notice(`${contactType} contact "${this.nameInput}" created successfully!`);

                // Open the newly created file
                await this.app.workspace.getLeaf().openFile(createdFile);

                this.close();
            } else {
                new Notice(`Failed to create ${contactType} contact`);
            }
        } catch (error) {
            console.error('Error creating contact:', error);
            new Notice(`Error creating ${contactType} contact: ${error.message}`);
        }
    }

    private getFoldersForContactType(contactType: ObjectType): string[] {
        switch (contactType) {
            case 'People':
                return this.settings.peopleFolders;
            case 'Company':
                return this.settings.companyFolders;
            case 'TradeUnion':
                return this.settings.tradeUnionFolders;
            case 'Organization':
                return this.settings.organizationFolders;
            default:
                return [''];
        }
    }
}