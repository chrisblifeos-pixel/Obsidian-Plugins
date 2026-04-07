import { App, PluginSettingTab, Setting, TFolder } from 'obsidian';
import ContactCardsPlugin from '../main';
import { ContactCardsSettings, ObjectType } from './contact-types';

export class ContactCardsSettingTab extends PluginSettingTab {
    plugin: ContactCardsPlugin;
    private allFolders: string[] = [];

    constructor(app: App, plugin: ContactCardsPlugin) {
        super(app, plugin);
        this.plugin = plugin;
        this.getAllFolders();
    }

    private getAllFolders(): void {
        const folderSet = new Set<string>();
        const addFolder = (folder: TFolder) => {
            folderSet.add(folder.path);
            folder.children.forEach(child => {
                if (child instanceof TFolder) {
                    addFolder(child);
                }
            });
        };

        this.app.vault.getAllLoadedFiles().forEach(file => {
            if (file instanceof TFolder) {
                addFolder(file);
            }
        });

        // Convert to array, remove duplicates, and sort
        this.allFolders = Array.from(folderSet).sort();
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'ContactManager Settings' });

        // Instructions section
        this.addInstructionsSection();

        // Enabled Contact Types section
        containerEl.createEl('h3', { text: 'Enabled Contact Types' });
        containerEl.createEl('p', {
            text: 'Select which contact types you want to use. Disabled types won\'t appear in menus or settings.',
            cls: 'setting-item-description'
        });

        this.addContactTypeToggle('People', 'Always enabled - required for the plugin to function');

        this.addContactTypeToggle('Company', 'Companies and organizations');
        if (this.plugin.settings.enabledContactTypes.includes('Company')) {
            this.addAutoCompleteToggle('Auto-complete Company Management', 'autoCompleteCompanyManagement',
                'Automatically update management field when people are added/removed');
        }

        this.addContactTypeToggle('TradeUnion', 'Trade unions and labor organizations');
        if (this.plugin.settings.enabledContactTypes.includes('TradeUnion')) {
            this.addAutoCompleteToggle('Auto-complete TradeUnion People', 'autoCompleteTradeUnionPeople',
                'Automatically update people field when members are added/removed');
        }

        this.addContactTypeToggle('Organization', 'General organizations and institutions');
        if (this.plugin.settings.enabledContactTypes.includes('Organization')) {
            this.addAutoCompleteToggle('Auto-complete Organization People', 'autoCompleteOrganizationPeople',
                'Automatically update people field when members are added/removed');
        }

        containerEl.createEl('h3', { text: 'Folder Configuration' });
        containerEl.createEl('p', {
            text: 'Configure which folders contain each type of contact. Use the + button to add multiple folders.',
            cls: 'setting-item-description'
        });

        // Show folder settings only for enabled contact types
        if (this.plugin.settings.enabledContactTypes.includes('People')) {
            this.addMultipleFolderSetting('People Folders', 'peopleFolders',
                'Folders containing People contacts');
        }

        if (this.plugin.settings.enabledContactTypes.includes('Company')) {
            this.addMultipleFolderSetting('Company Folders', 'companyFolders',
                'Folders containing Company contacts');
        }

        if (this.plugin.settings.enabledContactTypes.includes('TradeUnion')) {
            this.addMultipleFolderSetting('Trade Union Folders', 'tradeUnionFolders',
                'Folders containing Trade Union contacts');
        }

        if (this.plugin.settings.enabledContactTypes.includes('Organization')) {
            this.addMultipleFolderSetting('Organization Folders', 'organizationFolders',
                'Folders containing Organization contacts');
        }


        containerEl.createEl('h3', { text: 'Templates' });
        containerEl.createEl('p', {
            text: 'Templates used when creating new contacts. Use {{title}} for the contact name and {{date}} for the current date.',
            cls: 'setting-item-description'
        });

        // Show template settings only for enabled contact types
        if (this.plugin.settings.enabledContactTypes.includes('People')) {
            this.addTemplateSetting('People Template', 'peopleTemplate');
        }

        if (this.plugin.settings.enabledContactTypes.includes('Company')) {
            this.addTemplateSetting('Company Template', 'companyTemplate');
        }

        if (this.plugin.settings.enabledContactTypes.includes('TradeUnion')) {
            this.addTemplateSetting('Trade Union Template', 'tradeUnionTemplate');
        }

        if (this.plugin.settings.enabledContactTypes.includes('Organization')) {
            this.addTemplateSetting('Organization Template', 'organizationTemplate');
        }
    }

    private createAutocompleteInput(container: HTMLElement, placeholder: string, initialValue: string, onChangeCallback: (value: string) => void): HTMLInputElement {
        const inputContainer = container.createDiv({ cls: 'autocomplete-container' });
        const input = inputContainer.createEl('input', {
            type: 'text',
            placeholder: placeholder,
            value: initialValue,
            cls: 'autocomplete-input'
        });

        const suggestionsList = inputContainer.createDiv({ cls: 'autocomplete-suggestions' });
        suggestionsList.style.display = 'none';

        let selectedIndex = -1;

        const showSuggestions = (query: string) => {
            // Filter folders, remove duplicates and limit results
            const filtered = Array.from(new Set(
                this.allFolders.filter(folder =>
                    folder.toLowerCase().includes(query.toLowerCase()) && folder !== query
                )
            )).slice(0, 8);

            suggestionsList.empty();
            if (filtered.length === 0) {
                suggestionsList.style.display = 'none';
                return;
            }

            filtered.forEach((folder, index) => {
                const suggestion = suggestionsList.createDiv({
                    text: folder,
                    cls: 'autocomplete-suggestion'
                });

                suggestion.addEventListener('click', () => {
                    input.value = folder;
                    suggestionsList.style.display = 'none';
                    onChangeCallback(folder);
                });

                if (index === selectedIndex) {
                    suggestion.addClass('selected');
                }
            });

            suggestionsList.style.display = 'block';
        };

        input.addEventListener('input', (e) => {
            const value = (e.target as HTMLInputElement).value;
            selectedIndex = -1;
            if (value.length > 0) {
                showSuggestions(value);
            } else {
                suggestionsList.style.display = 'none';
            }
            onChangeCallback(value);
        });

        input.addEventListener('keydown', (e) => {
            const suggestions = suggestionsList.querySelectorAll('.autocomplete-suggestion');

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
                updateSelection();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelection();
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                const selectedSuggestion = suggestions[selectedIndex] as HTMLElement;
                input.value = selectedSuggestion.textContent || '';
                suggestionsList.style.display = 'none';
                onChangeCallback(input.value);
            } else if (e.key === 'Escape') {
                suggestionsList.style.display = 'none';
                selectedIndex = -1;
            }
        });

        const updateSelection = () => {
            const suggestions = suggestionsList.querySelectorAll('.autocomplete-suggestion');
            suggestions.forEach((suggestion, index) => {
                if (index === selectedIndex) {
                    suggestion.addClass('selected');
                } else {
                    suggestion.removeClass('selected');
                }
            });
        };

        input.addEventListener('blur', (e) => {
            // Delay hiding to allow click events on suggestions
            setTimeout(() => {
                suggestionsList.style.display = 'none';
            }, 150);
        });

        return input;
    }

    addSingleFolderSetting(name: string, settingKey: keyof ContactCardsSettings, description?: string): void {
        const setting = new Setting(this.containerEl)
            .setName(name)
            .setDesc(description || `Configure ${name.toLowerCase()}`);

        const currentValue = this.plugin.settings[settingKey] as string;

        this.createAutocompleteInput(
            setting.controlEl,
            'Folder path',
            currentValue,
            async (value) => {
                (this.plugin.settings[settingKey] as string) = value;
                await this.plugin.saveSettings();
            }
        );
    }

    addMultipleFolderSetting(name: string, settingKey: keyof ContactCardsSettings, description?: string): void {
        const setting = new Setting(this.containerEl)
            .setName(name)
            .setDesc(description || `Configure ${name.toLowerCase()}`);

        const foldersContainer = setting.controlEl.createDiv({ cls: 'multiple-folders-container' });

        const renderFolders = () => {
            foldersContainer.empty();

            // Get current folders from settings each time
            const currentFolders = this.plugin.settings[settingKey] as string[];

            currentFolders.forEach((folder, index) => {
                const folderRow = foldersContainer.createDiv({ cls: 'folder-row' });

                this.createAutocompleteInput(
                    folderRow,
                    'Folder path',
                    folder,
                    async (value) => {
                        // Get fresh array from settings and update only the specific index
                        const freshFolders = [...(this.plugin.settings[settingKey] as string[])];
                        freshFolders[index] = value;
                        (this.plugin.settings[settingKey] as string[]) = freshFolders;
                        await this.plugin.saveSettings();
                    }
                );

                const removeButton = folderRow.createEl('button', {
                    text: '−',
                    cls: 'folder-remove-button'
                });

                removeButton.addEventListener('click', async () => {
                    // Get fresh array from settings and remove the specific index
                    const freshFolders = [...(this.plugin.settings[settingKey] as string[])];
                    freshFolders.splice(index, 1);
                    (this.plugin.settings[settingKey] as string[]) = freshFolders;
                    await this.plugin.saveSettings();
                    renderFolders();
                });
            });

            // Add button
            const addButton = foldersContainer.createEl('button', {
                text: '+ Add Folder',
                cls: 'folder-add-button'
            });

            addButton.addEventListener('click', async () => {
                // Get fresh array from settings and add new empty folder
                const freshFolders = [...(this.plugin.settings[settingKey] as string[])];
                freshFolders.push('');
                (this.plugin.settings[settingKey] as string[]) = freshFolders;
                await this.plugin.saveSettings();
                renderFolders();
            });
        };

        renderFolders();
    }

    addTemplateSetting(name: string, settingKey: keyof ContactCardsSettings): void {
        new Setting(this.containerEl)
            .setName(name)
            .setDesc(`Template used when creating new ${name.toLowerCase().replace(' template', '')} contacts`)
            .addTextArea(text => {
                text.setPlaceholder('Template content with frontmatter')
                    .setValue(this.plugin.settings[settingKey] as string)
                    .onChange(async (value) => {
                        (this.plugin.settings[settingKey] as string) = value;
                        await this.plugin.saveSettings();
                    });
                text.inputEl.rows = 10;
                text.inputEl.cols = 50;
                return text;
            });
    }

    getFoldersForContactType(contactType: ObjectType): string[] {
        switch (contactType) {
            case 'People':
                return this.plugin.settings.peopleFolders;
            case 'Company':
                return this.plugin.settings.companyFolders;
            case 'TradeUnion':
                return this.plugin.settings.tradeUnionFolders;
            case 'Organization':
                return this.plugin.settings.organizationFolders;
            default:
                return [];
        }
    }

    getTemplateForContactType(contactType: ObjectType): string {
        switch (contactType) {
            case 'People':
                return this.plugin.settings.peopleTemplate;
            case 'Company':
                return this.plugin.settings.companyTemplate;
            case 'TradeUnion':
                return this.plugin.settings.tradeUnionTemplate;
            case 'Organization':
                return this.plugin.settings.organizationTemplate;
            default:
                return '';
        }
    }

    private addContactTypeToggle(contactType: ObjectType, description: string): void {
        const isEnabled = this.plugin.settings.enabledContactTypes.includes(contactType);
        const isPeopleType = contactType === 'People';

        new Setting(this.containerEl)
            .setName(contactType)
            .setDesc(description)
            .addToggle(toggle => {
                toggle.setValue(isEnabled)
                    .setDisabled(isPeopleType) // People type is always enabled
                    .onChange(async (value) => {
                        if (isPeopleType) return; // Prevent disabling People type

                        const enabledTypes = [...this.plugin.settings.enabledContactTypes];

                        if (value && !enabledTypes.includes(contactType)) {
                            enabledTypes.push(contactType);
                        } else if (!value) {
                            const index = enabledTypes.indexOf(contactType);
                            if (index > -1) {
                                enabledTypes.splice(index, 1);
                            }
                        }

                        this.plugin.settings.enabledContactTypes = enabledTypes;
                        await this.plugin.saveSettings();

                        // Refresh the display to show/hide folder/template sections
                        this.display();
                    });
            });
    }

    private addInstructionsSection(): void {
        const instructionsContainer = this.containerEl.createDiv({ cls: 'instructions-section' });

        // Instructions header with toggle button
        const instructionsHeader = instructionsContainer.createDiv({ cls: 'instructions-header' });
        const toggleButton = instructionsHeader.createEl('button', {
            text: '📖 Plugin Instructions',
            cls: 'instructions-toggle-button'
        });

        // Instructions content (initially hidden)
        const instructionsContent = instructionsContainer.createDiv({
            cls: 'instructions-content',
            attr: { style: 'display: none;' }
        });

        // Language selector
        const languageContainer = instructionsContent.createDiv({ cls: 'language-selector' });
        languageContainer.createEl('label', { text: 'Language: ', cls: 'language-label' });

        const languageSelect = languageContainer.createEl('select', { cls: 'language-select' });
        const languages = [
            { code: 'en', name: 'English' },
            { code: 'es', name: 'Español' },
            { code: 'fr', name: 'Français' },
            { code: 'jp', name: '日本語' }
        ];

        languages.forEach(lang => {
            languageSelect.createEl('option', {
                value: lang.code,
                text: lang.name
            });
        });

        // Instructions text container
        const instructionsText = instructionsContent.createDiv({ cls: 'instructions-text' });

        // Toggle functionality
        let isExpanded = false;
        toggleButton.addEventListener('click', () => {
            isExpanded = !isExpanded;
            instructionsContent.style.display = isExpanded ? 'block' : 'none';
            toggleButton.textContent = isExpanded ? '📖 Plugin Instructions ▼' : '📖 Plugin Instructions ►';

            if (isExpanded) {
                this.updateInstructionsText(instructionsText, languageSelect.value);
            }
        });

        // Language change functionality
        languageSelect.addEventListener('change', () => {
            this.updateInstructionsText(instructionsText, languageSelect.value);
        });

        // Initialize with English
        this.updateInstructionsText(instructionsText, 'en');
    }

    private updateInstructionsText(container: HTMLElement, language: string): void {
        const instructions = this.getInstructions(language);
        container.innerHTML = instructions;
    }

    private getInstructions(language: string): string {
        const instructions: Record<string, string> = {
            en: `
                <h4>🎯 What is ContactManager?</h4>
                <p>ContactManager helps you organize professional contacts, companies, trade unions, and organizations in your Obsidian vault with interactive contact cards and automatic relationship detection.</p>

                <h4>🔍 Contact Manager View</h4>
                <p>The main plugin interface (access via ribbon icon 👥 or command palette) with:</p>
                <ul>
                    <li><strong>Browse:</strong> All contacts organized by type tabs</li>
                    <li><strong>Search:</strong> Real-time filtering across all contact properties</li>
                    <li><strong>Sort:</strong> Alphabetically or by organization</li>
                    <li><strong>Create Button:</strong> Quick contact creation from the view</li>
                    <li><strong>Navigation:</strong> Click any contact to open its file</li>
                </ul>

                <h4>📄 Contact Cards in Notes</h4>
                <p>Interactive cards that automatically appear in contact files, showing:</p>
                <ul>
                    <li><strong>Profile Information:</strong> Photo, name, role, contact details</li>
                    <li><strong>Relationships:</strong> Related contacts with color coding</li>
                    <li><strong>Management Hierarchy:</strong> People in management roles (green)</li>
                    <li><strong>Trade Union Members:</strong> Union representatives (red)</li>
                    <li><strong>Organization Members:</strong> Affiliated people (purple)</li>
                    <li><strong>Interactive Navigation:</strong> Click names to jump to related contacts</li>
                </ul>

                <h4>⚙️ Initial Setup</h4>
                <p><strong>1. Enable Contact Types:</strong> Choose which types you need (People, Company, TradeUnion, Organization)</p>
                <p><strong>2. Configure Auto-completion:</strong> Enable/disable automatic field updates for management and people fields</p>
                <p><strong>3. Configure Folders:</strong> Set folders where each contact type will be stored</p>
                <p><strong>4. Customize Templates:</strong> Adjust the default templates for each contact type if needed</p>

                <h4>📝 Creating Contacts</h4>
                <p><strong>Method 1:</strong> Use the "Create" button in Contact Manager view</p>
                <p><strong>Method 2:</strong> Command palette ("Create Contact")</p>
                <p><strong>Method 3:</strong> Right-click in file explorer and select "Create Contact"</p>
                <p>The plugin will guide you through selecting the type and entering basic information.</p>

                <h4>📋 Functional Properties by Contact Type</h4>
                <p><strong>People:</strong></p>
                <ul>
                    <li><strong>type:</strong> "People" (required)</li>
                    <li><strong>coverImage:</strong> Profile photo ([[ImageName.jpg]] or path/image.jpg)</li>
                    <li><strong>role:</strong> Job title - displayed on card</li>
                    <li><strong>email, phone:</strong> Contact information - displayed on card</li>
                    <li><strong>company:</strong> [[CompanyName]] - creates relationship link</li>
                    <li><strong>organization:</strong> [[OrganizationName]] - creates relationship link</li>
                    <li><strong>tradeUnion:</strong> [[UnionName]] - creates relationship link</li>
                    <li><strong>collections:</strong> ["TradeUnion"] - required for union member detection</li>
                </ul>

                <p><strong>Companies/Organizations/Trade Unions:</strong></p>
                <ul>
                    <li><strong>type:</strong> "Company"/"Organization"/"TradeUnion" (required)</li>
                    <li><strong>coverImage:</strong> Logo - displayed on card and as overlay on member cards</li>
                    <li><strong>website:</strong> URL - displayed as clickable link</li>
                    <li><strong>contactInfo:</strong> General contact details - displayed on card</li>
                    <li><strong>management:</strong> [["PersonName1", "PersonName2"]] - shows management section</li>
                    <li><strong>people:</strong> [["PersonName1", "PersonName2"]] - shows members section (Organizations/Unions)</li>
                </ul>

                <p><strong>Universal Properties:</strong></p>
                <ul>
                    <li><strong>description:</strong> Displayed in card description section</li>
                    <li><strong>tags:</strong> Obsidian tags for organization</li>
                    <li><strong>lastUpdated:</strong> Leave empty for automatic tracking</li>
                </ul>

                <h4>🔗 How Relationships Work</h4>
                <p>The plugin automatically detects relationships when auto-completion is enabled:</p>
                <ul>
                    <li><strong>Company Management:</strong> People with company + collections including "Managers"</li>
                    <li><strong>TradeUnion Contacts:</strong> People with tradeUnion + collections including "Officers"</li>
                    <li><strong>Organization Members:</strong> People with organization field pointing to the organization</li>
                </ul>
                <p><strong>Auto-completion behavior:</strong> When enabled, the plugin automatically updates management/people fields when contacts are modified. When disabled, you can manually manage these relationships.</p>

                <h4>💡 Tips</h4>
                <ul>
                    <li>Use consistent naming for contact files</li>
                    <li>Add profile photos with coverImage property</li>
                    <li>Disable unused contact types to simplify interface</li>
                    <li>Use [[WikiLinks]] format for all contact references</li>
                </ul>
            `,
            es: `
                <h4>🎯 ¿Qué es ContactManager?</h4>
                <p>ContactManager te ayuda a organizar contactos profesionales, empresas, sindicatos y organizaciones en tu vault de Obsidian con tarjetas de contacto interactivas y detección automática de relaciones.</p>

                <h4>🔍 Vista Gestor de Contactos</h4>
                <p>La interfaz principal del plugin (acceso vía icono 👥 o paleta de comandos) con:</p>
                <ul>
                    <li><strong>Explorar:</strong> Todos los contactos organizados en pestañas por tipo</li>
                    <li><strong>Buscar:</strong> Filtrado en tiempo real en todas las propiedades</li>
                    <li><strong>Ordenar:</strong> Alfabéticamente o por organización</li>
                    <li><strong>Botón Crear:</strong> Creación rápida de contactos desde la vista</li>
                    <li><strong>Navegación:</strong> Clic en cualquier contacto para abrir su archivo</li>
                </ul>

                <h4>📄 Tarjetas de Contacto en Notas</h4>
                <p>Tarjetas interactivas que aparecen automáticamente en archivos de contacto, mostrando:</p>
                <ul>
                    <li><strong>Información de Perfil:</strong> Foto, nombre, rol, detalles de contacto</li>
                    <li><strong>Relaciones:</strong> Contactos relacionados con código de colores</li>
                    <li><strong>Jerarquía de Gestión:</strong> Personas en roles de gestión (verde)</li>
                    <li><strong>Miembros Sindicales:</strong> Representantes sindicales (rojo)</li>
                    <li><strong>Miembros de Organización:</strong> Personas afiliadas (púrpura)</li>
                    <li><strong>Navegación Interactiva:</strong> Haz clic en nombres para saltar a contactos relacionados</li>
                </ul>

                <h4>⚙️ Configuración Inicial</h4>
                <p><strong>1. Habilitar Tipos de Contacto:</strong> Elige qué tipos necesitas (Personas, Empresa, Sindicato, Organización)</p>
                <p><strong>2. Configurar Auto-completado:</strong> Habilitar/deshabilitar actualización automática de campos de gestión y personas</p>
                <p><strong>3. Configurar Carpetas:</strong> Define las carpetas donde se almacenará cada tipo de contacto</p>
                <p><strong>4. Personalizar Plantillas:</strong> Ajusta las plantillas predeterminadas según necesites</p>

                <h4>📝 Crear Contactos</h4>
                <p><strong>Método 1:</strong> Usa el botón "Create" en la vista Gestor de Contactos</p>
                <p><strong>Método 2:</strong> Paleta de comandos ("Create Contact")</p>
                <p><strong>Método 3:</strong> Clic derecho en explorador de archivos y selecciona "Create Contact"</p>
                <p>El plugin te guiará en la selección del tipo y entrada de información básica.</p>

                <h4>📋 Propiedades Funcionales por Tipo de Contacto</h4>
                <p><strong>Personas:</strong></p>
                <ul>
                    <li><strong>type:</strong> "People" (requerido)</li>
                    <li><strong>coverImage:</strong> Foto de perfil ([[NombreImagen.jpg]] o ruta/imagen.jpg)</li>
                    <li><strong>role:</strong> Título del trabajo - se muestra en la tarjeta</li>
                    <li><strong>email, phone:</strong> Información de contacto - se muestra en la tarjeta</li>
                    <li><strong>company:</strong> [[NombreEmpresa]] - crea enlace de relación</li>
                    <li><strong>organization:</strong> [[NombreOrganización]] - crea enlace de relación</li>
                    <li><strong>tradeUnion:</strong> [[NombreSindicato]] - crea enlace de relación</li>
                    <li><strong>collections:</strong> ["TradeUnion"] - requerido para detección de miembros sindicales</li>
                </ul>

                <p><strong>Empresas/Organizaciones/Sindicatos:</strong></p>
                <ul>
                    <li><strong>type:</strong> "Company"/"Organization"/"TradeUnion" (requerido)</li>
                    <li><strong>coverImage:</strong> Logo - se muestra en tarjeta y como overlay en tarjetas de miembros</li>
                    <li><strong>website:</strong> URL - se muestra como enlace clicable</li>
                    <li><strong>contactInfo:</strong> Detalles de contacto generales - se muestra en tarjeta</li>
                    <li><strong>management:</strong> [["NombrePersona1", "NombrePersona2"]] - muestra sección de gestión</li>
                    <li><strong>people:</strong> [["NombrePersona1", "NombrePersona2"]] - muestra sección de miembros (Organizaciones/Sindicatos)</li>
                </ul>

                <p><strong>Propiedades Universales:</strong></p>
                <ul>
                    <li><strong>description:</strong> Se muestra en la sección de descripción de la tarjeta</li>
                    <li><strong>tags:</strong> Etiquetas de Obsidian para organización</li>
                    <li><strong>lastUpdated:</strong> Dejar vacío para seguimiento automático</li>
                </ul>

                <h4>🔗 Cómo Funcionan las Relaciones</h4>
                <p>El plugin detecta automáticamente relaciones cuando el auto-completado está habilitado:</p>
                <ul>
                    <li><strong>Gestión de Empresa:</strong> Personas con company + collections que incluyan "Managers"</li>
                    <li><strong>Contactos de Sindicato:</strong> Personas con tradeUnion + collections que incluyan "Officers"</li>
                    <li><strong>Miembros de Organización:</strong> Personas con campo organization apuntando a la organización</li>
                </ul>
                <p><strong>Comportamiento del auto-completado:</strong> Cuando está habilitado, el plugin actualiza automáticamente los campos management/people cuando se modifican los contactos. Cuando está deshabilitado, puedes gestionar estas relaciones manualmente.</p>

                <h4>💡 Consejos</h4>
                <ul>
                    <li>Usa nombres consistentes para archivos de contactos</li>
                    <li>Añade fotos de perfil con la propiedad coverImage</li>
                    <li>Deshabilita tipos de contacto no utilizados para simplificar la interfaz</li>
                    <li>Usa formato [[WikiLinks]] para todas las referencias de contactos</li>
                </ul>
            `,
            fr: `
                <h4>🎯 Qu'est-ce que ContactManager?</h4>
                <p>ContactManager vous aide à organiser les contacts professionnels, entreprises, syndicats et organisations dans votre coffre Obsidian avec des cartes de contact interactives et détection automatique des relations.</p>

                <h4>🔍 Vue Gestionnaire de Contacts</h4>
                <p>L'interface principale du plugin (accès via icône 👥 ou palette de commandes) avec:</p>
                <ul>
                    <li><strong>Parcourir:</strong> Tous les contacts organisés en onglets par type</li>
                    <li><strong>Rechercher:</strong> Filtrage en temps réel sur toutes les propriétés</li>
                    <li><strong>Trier:</strong> Alphabétiquement ou par organisation</li>
                    <li><strong>Bouton Créer:</strong> Création rapide de contacts depuis la vue</li>
                    <li><strong>Navigation:</strong> Cliquez sur n'importe quel contact pour ouvrir son fichier</li>
                </ul>

                <h4>📄 Cartes de Contact dans les Notes</h4>
                <p>Cartes interactives qui apparaissent automatiquement dans les fichiers de contact, montrant:</p>
                <ul>
                    <li><strong>Informations de Profil:</strong> Photo, nom, rôle, coordonnées</li>
                    <li><strong>Relations:</strong> Contacts liés avec codage couleur</li>
                    <li><strong>Hiérarchie de Gestion:</strong> Personnes en rôles de gestion (vert)</li>
                    <li><strong>Membres Syndicaux:</strong> Représentants syndicaux (rouge)</li>
                    <li><strong>Membres d'Organisation:</strong> Personnes affiliées (violet)</li>
                    <li><strong>Navigation Interactive:</strong> Cliquez sur les noms pour aller aux contacts liés</li>
                </ul>

                <h4>⚙️ Configuration Initiale</h4>
                <p><strong>1. Activer les Types de Contact:</strong> Choisissez les types dont vous avez besoin (Personnes, Entreprise, Syndicat, Organisation)</p>
                <p><strong>2. Configurer l'Auto-complétion:</strong> Activer/désactiver la mise à jour automatique des champs de gestion et personnes</p>
                <p><strong>3. Configurer les Dossiers:</strong> Définissez les dossiers où chaque type de contact sera stocké</p>
                <p><strong>4. Personnaliser les Modèles:</strong> Ajustez les modèles par défaut selon vos besoins</p>

                <h4>📝 Créer des Contacts</h4>
                <p><strong>Méthode 1:</strong> Utilisez le bouton "Create" dans la vue Gestionnaire de Contacts</p>
                <p><strong>Méthode 2:</strong> Palette de commandes ("Create Contact")</p>
                <p><strong>Méthode 3:</strong> Clic droit dans l'explorateur de fichiers et sélectionnez "Create Contact"</p>
                <p>Le plugin vous guidera dans la sélection du type et la saisie des informations de base.</p>

                <h4>📋 Propriétés Fonctionnelles par Type de Contact</h4>
                <p><strong>Personnes:</strong></p>
                <ul>
                    <li><strong>type:</strong> "People" (requis)</li>
                    <li><strong>coverImage:</strong> Photo de profil ([[NomImage.jpg]] ou chemin/image.jpg)</li>
                    <li><strong>role:</strong> Titre du poste - affiché sur la carte</li>
                    <li><strong>email, phone:</strong> Informations de contact - affichées sur la carte</li>
                    <li><strong>company:</strong> [[NomEntreprise]] - crée un lien de relation</li>
                    <li><strong>organization:</strong> [[NomOrganisation]] - crée un lien de relation</li>
                    <li><strong>tradeUnion:</strong> [[NomSyndicat]] - crée un lien de relation</li>
                    <li><strong>collections:</strong> ["TradeUnion"] - requis pour la détection de membres syndicaux</li>
                </ul>

                <p><strong>Entreprises/Organisations/Syndicats:</strong></p>
                <ul>
                    <li><strong>type:</strong> "Company"/"Organization"/"TradeUnion" (requis)</li>
                    <li><strong>coverImage:</strong> Logo - affiché sur la carte et comme overlay sur les cartes de membres</li>
                    <li><strong>website:</strong> URL - affiché comme lien cliquable</li>
                    <li><strong>contactInfo:</strong> Coordonnées générales - affichées sur la carte</li>
                    <li><strong>management:</strong> [["NomPersonne1", "NomPersonne2"]] - affiche section de gestion</li>
                    <li><strong>people:</strong> [["NomPersonne1", "NomPersonne2"]] - affiche section de membres (Organisations/Syndicats)</li>
                </ul>

                <p><strong>Propriétés Universelles:</strong></p>
                <ul>
                    <li><strong>description:</strong> Affichée dans la section description de la carte</li>
                    <li><strong>tags:</strong> Étiquettes Obsidian pour organisation</li>
                    <li><strong>lastUpdated:</strong> Laisser vide pour suivi automatique</li>
                </ul>

                <h4>🔗 Comment Fonctionnent les Relations</h4>
                <p>Le plugin détecte automatiquement les relations quand l'auto-complétion est activée:</p>
                <ul>
                    <li><strong>Gestion d'Entreprise:</strong> Personnes avec company + collections incluant "Managers"</li>
                    <li><strong>Contacts Syndicaux:</strong> Personnes avec tradeUnion + collections incluant "Officers"</li>
                    <li><strong>Membres d'Organisation:</strong> Personnes avec champ organization pointant vers l'organisation</li>
                </ul>
                <p><strong>Comportement d'auto-complétion:</strong> Quand activé, le plugin met automatiquement à jour les champs management/people lors de modifications de contacts. Quand désactivé, vous pouvez gérer ces relations manuellement.</p>

                <h4>💡 Conseils</h4>
                <ul>
                    <li>Utilisez des noms cohérents pour les fichiers de contact</li>
                    <li>Ajoutez des photos de profil avec la propriété coverImage</li>
                    <li>Désactivez les types de contact inutilisés pour simplifier l'interface</li>
                    <li>Utilisez le format [[WikiLinks]] pour toutes les références de contacts</li>
                </ul>
            `,
            jp: `
                <h4>🎯 ContactManagerとは？</h4>
                <p>ContactManagerは、Obsidian vaultでプロ用連絡先、会社、労働組合、組織をインタラクティブな連絡先カードと自動関係検出で整理するのに役立ちます。</p>

                <h4>🔍 連絡先管理ビュー</h4>
                <p>プラグインのメインインターフェース（リボンアイコン👥またはコマンドパレットでアクセス）に含まれるもの:</p>
                <ul>
                    <li><strong>閲覧:</strong> タイプ別タブで整理された全連絡先</li>
                    <li><strong>検索:</strong> 全プロパティのリアルタイムフィルタリング</li>
                    <li><strong>ソート:</strong> アルファベット順または組織別</li>
                    <li><strong>作成ボタン:</strong> ビューからの迅速な連絡先作成</li>
                    <li><strong>ナビゲーション:</strong> 任意の連絡先をクリックしてファイルを開く</li>
                </ul>

                <h4>📄 ノート内の連絡先カード</h4>
                <p>連絡先ファイルに自動的に表示されるインタラクティブカード:</p>
                <ul>
                    <li><strong>プロフィール情報:</strong> 写真、名前、役職、連絡先詳細</li>
                    <li><strong>関係:</strong> 色分けされた関連連絡先</li>
                    <li><strong>管理階層:</strong> 管理役職の人物（緑）</li>
                    <li><strong>労働組合メンバー:</strong> 組合代表者（赤）</li>
                    <li><strong>組織メンバー:</strong> 関連人物（紫）</li>
                    <li><strong>インタラクティブナビゲーション:</strong> 名前をクリックして関連連絡先にジャンプ</li>
                </ul>

                <h4>⚙️ 初期設定</h4>
                <p><strong>1. 連絡先タイプを有効化:</strong> 必要なタイプを選択（人物、会社、労働組合、組織）</p>
                <p><strong>2. オートコンプリートを設定:</strong> 管理および人物フィールドの自動更新を有効/無効にする</p>
                <p><strong>3. フォルダを設定:</strong> 各連絡先タイプを保存するフォルダを設定</p>
                <p><strong>4. テンプレートをカスタマイズ:</strong> 必要に応じてデフォルトテンプレートを調整</p>

                <h4>📝 連絡先の作成</h4>
                <p><strong>方法1:</strong> 連絡先管理ビューの「Create」ボタンを使用</p>
                <p><strong>方法2:</strong> コマンドパレット（"Create Contact"）</p>
                <p><strong>方法3:</strong> ファイルエクスプローラーで右クリックして「Create Contact」を選択</p>
                <p>プラグインがタイプ選択と基本情報入力をガイドします。</p>

                <h4>📋 連絡先タイプ別機能プロパティ</h4>
                <p><strong>人物:</strong></p>
                <ul>
                    <li><strong>type:</strong> "People"（必須）</li>
                    <li><strong>coverImage:</strong> プロフィール写真（[[ImageName.jpg]] または path/image.jpg）</li>
                    <li><strong>role:</strong> 職位 - カードに表示</li>
                    <li><strong>email, phone:</strong> 連絡先情報 - カードに表示</li>
                    <li><strong>company:</strong> [[CompanyName]] - 関係リンクを作成</li>
                    <li><strong>organization:</strong> [[OrganizationName]] - 関係リンクを作成</li>
                    <li><strong>tradeUnion:</strong> [[UnionName]] - 関係リンクを作成</li>
                    <li><strong>collections:</strong> ["TradeUnion"] - 組合メンバー検出に必要</li>
                </ul>

                <p><strong>会社/組織/労働組合:</strong></p>
                <ul>
                    <li><strong>type:</strong> "Company"/"Organization"/"TradeUnion"（必須）</li>
                    <li><strong>coverImage:</strong> ロゴ - カードとメンバーカードのオーバーレイに表示</li>
                    <li><strong>website:</strong> URL - クリック可能なリンクとして表示</li>
                    <li><strong>contactInfo:</strong> 一般連絡先詳細 - カードに表示</li>
                    <li><strong>management:</strong> [["PersonName1", "PersonName2"]] - 管理セクションを表示</li>
                    <li><strong>people:</strong> [["PersonName1", "PersonName2"]] - メンバーセクションを表示（組織/組合）</li>
                </ul>

                <p><strong>共通プロパティ:</strong></p>
                <ul>
                    <li><strong>description:</strong> カードの説明セクションに表示</li>
                    <li><strong>tags:</strong> 整理用のObsidianタグ</li>
                    <li><strong>lastUpdated:</strong> 自動追跡のため空白にしておく</li>
                </ul>

                <h4>🔗 関係の仕組み</h4>
                <p>オートコンプリートが有効な場合、プラグインは自動的に関係を検出します:</p>
                <ul>
                    <li><strong>会社管理:</strong> company + collections に "Managers" を含む人物</li>
                    <li><strong>労働組合連絡先:</strong> tradeUnion + collections に "Officers" を含む人物</li>
                    <li><strong>組織メンバー:</strong> organization フィールドがその組織を指す人物</li>
                </ul>
                <p><strong>オートコンプリートの動作:</strong> 有効な場合、連絡先が変更されると management/people フィールドが自動的に更新されます。無効な場合、これらの関係を手動で管理できます。</p>

                <h4>💡 ヒント</h4>
                <ul>
                    <li>連絡先ファイルには一貫した命名を使用</li>
                    <li>coverImageプロパティでプロフィール写真を追加</li>
                    <li>未使用の連絡先タイプを無効にしてインターフェースを簡素化</li>
                    <li>全ての連絡先参照に[[WikiLinks]]形式を使用</li>
                </ul>
            `
        };

        return instructions[language] || instructions.en;
    }

    private addAutoCompleteToggle(name: string, settingKey: keyof ContactCardsSettings, description: string): void {
        new Setting(this.containerEl)
            .setName(name)
            .setDesc(description)
            .setClass('contact-manager-subconfiguration')
            .addToggle(toggle => {
                toggle.setValue(this.plugin.settings[settingKey] as boolean)
                    .onChange(async (value) => {
                        (this.plugin.settings[settingKey] as boolean) = value;
                        await this.plugin.saveSettings();
                    });
            });
    }
}