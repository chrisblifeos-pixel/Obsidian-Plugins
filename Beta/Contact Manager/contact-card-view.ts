import { App, Component, MarkdownRenderer, TFile } from 'obsidian';
import { ContactCardsSettings, Contact, ObjectType, PeopleContact, CompanyContact, TradeUnionContact, OrganizationContact } from './contact-types';
import { LinkResolver } from './link-resolver';

export class ContactCardView extends Component {
    private app: App;
    private settings: ContactCardsSettings;
    private linkResolver: LinkResolver;

    constructor(app: App, settings: ContactCardsSettings, linkResolver: LinkResolver) {
        super();
        this.app = app;
        this.settings = settings;
        this.linkResolver = linkResolver;
    }

    updateSettings(settings: ContactCardsSettings): void {
        this.settings = settings;
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

    private matchesLinkOrArray(property: string | string[] | undefined, targetName: string): boolean {
        if (!property) return false;

        if (Array.isArray(property)) {
            return property.some(value => this.extractLinkText(value) === targetName);
        } else {
            return this.extractLinkText(property) === targetName;
        }
    }

    async renderCard(contact: Contact, container: HTMLElement, filePath: string): Promise<void> {
        // Look for "Contact Card" heading in the document
        const contactInfoHeading = this.findContactInformationHeading(container);
        if (!contactInfoHeading) return;

        // Find the parent container of the heading
        let insertPoint = contactInfoHeading.parentElement;
        if (!insertPoint) return;

        // Check if card already exists in this section
        const existingCard = insertPoint.querySelector('.contact-note-card');
        if (existingCard) {
            existingCard.remove(); // Remove existing card to replace it
        }

        // Find the next sibling after the heading to insert the card
        let nextElement = contactInfoHeading.nextElementSibling;

        // Create card container
        const cardContainer = createDiv({ cls: 'contact-card-container' });
        const card = cardContainer.createDiv({ cls: `contact-note-card ${contact.type.toLowerCase()}` });

        // Insert the card right after the heading
        if (nextElement) {
            insertPoint.insertBefore(cardContainer, nextElement);
        } else {
            insertPoint.appendChild(cardContainer);
        }

        switch (contact.type) {
            case 'People':
                await this.renderNoteCardPeople(contact as PeopleContact, card, filePath);
                break;
            case 'Company':
                await this.renderNoteCardCompany(contact as CompanyContact, card, filePath);
                break;
            case 'TradeUnion':
                await this.renderNoteCardTradeUnion(contact as TradeUnionContact, card, filePath);
                break;
            case 'Organization':
                await this.renderNoteCardOrganization(contact as OrganizationContact, card, filePath);
                break;
        }

        this.addEditButton(card, contact, filePath);
        this.addCardInteractivity(card, contact, filePath);
    }

    private findContactInformationHeading(container: HTMLElement): HTMLElement | null {
        // Look for "Contact Card" heading
        const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
        for (const heading of Array.from(headings)) {
            if (heading.textContent?.toLowerCase().includes('contact card')) {
                return heading as HTMLElement;
            }
        }
        return null;
    }

    private async renderNoteCardPeople(contact: PeopleContact, container: HTMLElement, filePath: string): Promise<void> {
        // Main layout: image section + content sections
        const mainLayout = container.createDiv({ cls: 'card-layout' });

        // Left section - Image and basic info
        const leftSection = mainLayout.createDiv({ cls: 'card-left-section' });

        // Profile image
        const imageContainer = leftSection.createDiv({ cls: 'card-image-section' });
        const imagePath = this.getImagePath(contact.coverImage);
        if (imagePath) {
            const img = imageContainer.createEl('img', {
                cls: 'card-profile-image',
                attr: { src: this.getImageSrc(imagePath) }
            });
            img.onerror = () => {
                imageContainer.innerHTML = '<div class="card-image-placeholder">👤</div>';
            };
        } else {
            imageContainer.innerHTML = '<div class="card-image-placeholder">👤</div>';
        }

        // Organization logo overlay with priority: TradeUnion > Company > Organization
        let orgName: string | null = null;

        if (contact.tradeUnion) {
            orgName = Array.isArray(contact.tradeUnion) ? contact.tradeUnion[0] : contact.tradeUnion;
        } else if (contact.company) {
            orgName = Array.isArray(contact.company) ? contact.company[0] : contact.company;
        } else if (contact.organization) {
            orgName = Array.isArray(contact.organization) ? contact.organization[0] : contact.organization;
        }

        if (orgName) {
            const logoOverlay = imageContainer.createDiv({ cls: 'card-logo-overlay' });
            // Try to load organization logo
            this.loadOrganizationLogo(logoOverlay, orgName);
        }

        // Right section - Information
        const rightSection = mainLayout.createDiv({ cls: 'card-right-section' });

        // Header with name
        const header = rightSection.createDiv({ cls: 'card-header-section' });
        const displayName = contact.aliases && contact.aliases.length > 0 && contact.aliases[0].trim()
            ? contact.aliases[0]
            : this.getContactName(filePath);
        header.createEl('h3', { text: displayName, cls: 'card-contact-name' });

        // Info sections
        const infoGrid = rightSection.createDiv({ cls: 'card-info-grid' });

        // Basic info
        if (contact.tradeUnion || contact.company || contact.organization || contact.role || contact.email || contact.phone || contact.linkedin) {
            const basicInfo = infoGrid.createDiv({ cls: 'card-info-section' });

            if (contact.tradeUnion) {
                const tradeUnionDiv = basicInfo.createDiv({ cls: 'card-info-item' });
                tradeUnionDiv.createSpan({ text: 'Trade Union: ' });

                const tradeUnions = Array.isArray(contact.tradeUnion) ? contact.tradeUnion : [contact.tradeUnion];
                tradeUnions.forEach((tradeUnion, index) => {
                    if (!tradeUnion) return;

                    // Extract link text and alias
                    const cleanTradeUnion = tradeUnion.replace(/^\[\[/, '').replace(/\]\]$/, '');
                    const displayText = cleanTradeUnion.includes('|') ? cleanTradeUnion.split('|')[1] : cleanTradeUnion;
                    const linkTarget = cleanTradeUnion.includes('|') ? cleanTradeUnion.split('|')[0] : cleanTradeUnion;

                    const tradeUnionLink = tradeUnionDiv.createEl('a', {
                        text: displayText,
                        cls: 'contact-link'
                    });
                    tradeUnionLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.app.workspace.openLinkText(linkTarget, '', false);
                    });

                    if (index < tradeUnions.length - 1) {
                        tradeUnionDiv.createSpan({ text: ', ' });
                    }
                });
            }
            if (contact.company) {
                const companyDiv = basicInfo.createDiv({ cls: 'card-info-item' });
                companyDiv.createSpan({ text: 'Company: ' });

                const companies = Array.isArray(contact.company) ? contact.company : [contact.company];
                companies.forEach((company, index) => {
                    if (!company) return;

                    // Extract link text and alias
                    const cleanCompany = company.replace(/^\[\[/, '').replace(/\]\]$/, '');
                    const displayText = cleanCompany.includes('|') ? cleanCompany.split('|')[1] : cleanCompany;
                    const linkTarget = cleanCompany.includes('|') ? cleanCompany.split('|')[0] : cleanCompany;

                    const companyLink = companyDiv.createEl('a', {
                        text: displayText,
                        cls: 'contact-link'
                    });
                    companyLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.app.workspace.openLinkText(linkTarget, '', false);
                    });

                    if (index < companies.length - 1) {
                        companyDiv.createSpan({ text: ', ' });
                    }
                });
            }
            if (contact.organization) {
                const orgDiv = basicInfo.createDiv({ cls: 'card-info-item' });
                orgDiv.createSpan({ text: 'Organization: ' });

                const organizations = Array.isArray(contact.organization) ? contact.organization : [contact.organization];
                organizations.forEach((organization, index) => {
                    if (!organization) return;

                    // Extract link text and alias
                    const cleanOrganization = organization.replace(/^\[\[/, '').replace(/\]\]$/, '');
                    const displayText = cleanOrganization.includes('|') ? cleanOrganization.split('|')[1] : cleanOrganization;
                    const linkTarget = cleanOrganization.includes('|') ? cleanOrganization.split('|')[0] : cleanOrganization;

                    const orgLink = orgDiv.createEl('a', {
                        text: displayText,
                        cls: 'contact-link'
                    });
                    orgLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.app.workspace.openLinkText(linkTarget, '', false);
                    });

                    if (index < organizations.length - 1) {
                        orgDiv.createSpan({ text: ', ' });
                    }
                });
            }
            if (contact.role) basicInfo.createDiv({ cls: 'card-info-item', text: `Role: ${contact.role}` });
            if (contact.email) basicInfo.createDiv({ cls: 'card-info-item', text: `Email: ${contact.email}` });
            if (contact.phone) basicInfo.createDiv({ cls: 'card-info-item', text: `Phone: ${contact.phone}` });
            if (contact.linkedin) {
                const linkedinDiv = basicInfo.createDiv({ cls: 'card-info-item' });
                linkedinDiv.createEl('a', {
                    text: 'LinkedIn',
                    attr: { href: contact.linkedin, target: '_blank' },
                    cls: 'linkedin-link'
                });
            }
        }

        // Tags
        if (contact.tags && contact.tags.length > 0) {
            const tagsSection = infoGrid.createDiv({ cls: 'card-tags-section' });
            tagsSection.createDiv({ cls: 'card-section-label', text: 'tags' });
            const tagsContainer = tagsSection.createDiv({ cls: 'card-tags-container' });
            contact.tags.forEach(tag => {
                tagsContainer.createSpan({ text: `#${tag}`, cls: 'card-tag-note' });
            });
        }

        // Description
        if (contact.description) {
            const summarySection = rightSection.createDiv({ cls: 'card-summary-section' });
            summarySection.createDiv({ cls: 'card-summary-text', text: contact.description });
        }
    }

    private async renderNoteCardCompany(contact: CompanyContact, container: HTMLElement, filePath: string): Promise<void> {
        const mainLayout = container.createDiv({ cls: 'card-layout' });

        // Left section - Logo and basic info
        const leftSection = mainLayout.createDiv({ cls: 'card-left-section' });

        const imageContainer = leftSection.createDiv({ cls: 'card-image-section' });
        const imagePath = this.getImagePath(contact.coverImage);
        if (imagePath) {
            const img = imageContainer.createEl('img', {
                cls: 'card-company-logo',
                attr: { src: this.getImageSrc(imagePath) }
            });
            img.onerror = () => {
                imageContainer.innerHTML = '<div class="card-image-placeholder">🏢</div>';
            };
        } else {
            imageContainer.innerHTML = '<div class="card-image-placeholder">🏢</div>';
        }

        // Right section
        const rightSection = mainLayout.createDiv({ cls: 'card-right-section' });

        // Header
        const header = rightSection.createDiv({ cls: 'card-header-section' });
        const displayName = contact.aliases && contact.aliases.length > 0 && contact.aliases[0].trim()
            ? contact.aliases[0]
            : this.getContactName(filePath);
        header.createEl('h3', { text: displayName, cls: 'card-contact-name' });

        // Info grid
        const infoGrid = rightSection.createDiv({ cls: 'card-info-grid' });

        // Basic company info
        const basicInfo = infoGrid.createDiv({ cls: 'card-info-section' });
        if (contact.contactInfo) basicInfo.createDiv({ cls: 'card-info-item', text: `Contact: ${contact.contactInfo}` });
        if (contact.website) {
            const websiteDiv = basicInfo.createDiv({ cls: 'card-info-item' });
            websiteDiv.createSpan({ text: 'Website: ' });
            const websiteLink = websiteDiv.createEl('a', {
                text: contact.website,
                cls: 'contact-link external-link',
                attr: {
                    href: contact.website,
                    target: '_blank',
                    rel: 'noopener noreferrer'
                }
            });
        }

        // Active Projects
        if (contact.activeProjects && contact.activeProjects.length > 0) {
            const projectsDiv = basicInfo.createDiv({ cls: 'card-info-item' });
            projectsDiv.createSpan({ text: 'Projects: ' });
            contact.activeProjects.forEach((project, index) => {
                const projectName = this.extractLinkText(project);
                const projectLink = projectsDiv.createEl('a', {
                    text: projectName,
                    cls: 'card-project-link'
                });
                projectLink.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await this.app.workspace.openLinkText(projectName, '', false);
                });
                if (index < contact.activeProjects.length - 1) {
                    projectsDiv.createSpan({ text: ', ' });
                }
            });
        }

        // Management section - combine dynamic calculation and static management field
        const dynamicManagementPeople = await this.getManagementForCompany(filePath);
        const staticManagement = contact.management || [];

        // Create a combined list avoiding duplicates
        const allManagers = new Map<string, {name: string, path: string, source: 'dynamic' | 'static', isLink?: boolean}>();

        // Add dynamic management people
        dynamicManagementPeople.forEach(person => {
            allManagers.set(person.name.toLowerCase(), {
                name: person.name,
                path: person.path,
                source: 'dynamic'
            });
        });

        // Add static management links
        staticManagement.forEach(manager => {
            const managerName = this.extractLinkText(manager);
            const managerKey = managerName.toLowerCase();

            if (!allManagers.has(managerKey)) {
                const isLink = manager.includes('[[') && manager.includes(']]');
                allManagers.set(managerKey, {
                    name: managerName,
                    path: isLink ? manager.replace(/^\[\[/, '').replace(/\]\]$/, '').split('|')[0] : managerName,
                    source: 'static',
                    isLink: isLink
                });
            }
        });

        if (allManagers.size > 0) {
            const managementSection = infoGrid.createDiv({ cls: 'card-management-section' });
            managementSection.createDiv({ cls: 'card-section-label', text: 'Management' });
            const managementList = managementSection.createDiv({ cls: 'card-management-list' });

            // Sort management alphabetically by name
            const sortedManagers = Array.from(allManagers.values()).sort((a, b) => a.name.localeCompare(b.name));

            sortedManagers.forEach(manager => {
                const managerItem = managementList.createDiv({ cls: 'card-management-item' });

                const canCreateLink = manager.source === 'dynamic' || (manager.source === 'static' && manager.isLink);

                if (canCreateLink) {
                    // Clickable link with the same styling for all management links
                    const link = managerItem.createEl('a', {
                        text: manager.name,
                        cls: 'card-management-link'
                    });
                    link.addEventListener('click', async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        await this.app.workspace.openLinkText(manager.path, '', false);
                    });
                } else {
                    // Plain text for non-linkable static entries
                    managerItem.textContent = manager.name;
                }
            });
        }

        // Trade Union section - show people who work for this company and have tradeUnion info
        const tradeUnionPeople = await this.getTradeUnionPeopleForCompany(filePath);
        if (tradeUnionPeople.length > 0) {
            const tradeUnionSection = infoGrid.createDiv({ cls: 'card-union-section' });
            tradeUnionSection.createDiv({ cls: 'card-section-label', text: 'Trade Union Representatives' });
            const tradeUnionList = tradeUnionSection.createDiv({ cls: 'card-management-list' });

            // Sort trade union people alphabetically by name
            const sortedTradeUnionPeople = tradeUnionPeople.sort((a, b) => a.name.localeCompare(b.name));

            sortedTradeUnionPeople.forEach(person => {
                const personItem = tradeUnionList.createDiv({ cls: 'card-management-item' });
                const link = personItem.createEl('a', {
                    text: person.name,
                    cls: 'card-management-link card-trade-union-link'
                });
                link.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await this.app.workspace.openLinkText(person.path, '', false);
                });

                if (person.tradeUnion) {
                    const unionInfo = personItem.createEl('span', {
                        text: ` (${person.tradeUnion})`,
                        cls: 'card-trade-union-org'
                    });
                }
            });
        }

        // Tags
        if (contact.tags && contact.tags.length > 0) {
            const tagsSection = infoGrid.createDiv({ cls: 'card-tags-section' });
            const tagsContainer = tagsSection.createDiv({ cls: 'card-tags-container' });
            contact.tags.forEach(tag => {
                tagsContainer.createSpan({ text: `#${tag}`, cls: 'card-tag-note' });
            });
        }

        // Description
        if (contact.description) {
            const summarySection = rightSection.createDiv({ cls: 'card-summary-section' });
            summarySection.createDiv({ cls: 'card-summary-text', text: contact.description });
        }
    }

    private async renderNoteCardTradeUnion(contact: TradeUnionContact, container: HTMLElement, filePath: string): Promise<void> {
        const mainLayout = container.createDiv({ cls: 'card-layout' });

        // Left section
        const leftSection = mainLayout.createDiv({ cls: 'card-left-section' });

        const imageContainer = leftSection.createDiv({ cls: 'card-image-section' });
        const imagePath = this.getImagePath(contact.coverImage);
        if (imagePath) {
            const img = imageContainer.createEl('img', {
                cls: 'card-company-logo',
                attr: { src: this.getImageSrc(imagePath) }
            });
            img.onerror = () => {
                imageContainer.innerHTML = '<div class="card-image-placeholder">🤝</div>';
            };
        } else {
            imageContainer.innerHTML = '<div class="card-image-placeholder">🤝</div>';
        }

        // Right section
        const rightSection = mainLayout.createDiv({ cls: 'card-right-section' });

        const header = rightSection.createDiv({ cls: 'card-header-section' });
        const displayName = contact.aliases && contact.aliases.length > 0 && contact.aliases[0].trim()
            ? contact.aliases[0]
            : this.getContactName(filePath);
        header.createEl('h3', { text: displayName, cls: 'card-contact-name' });

        const infoGrid = rightSection.createDiv({ cls: 'card-info-grid' });

        // Basic info
        const basicInfo = infoGrid.createDiv({ cls: 'card-info-section' });
        if (contact.contactInfo) basicInfo.createDiv({ cls: 'card-info-item', text: `Contact: ${contact.contactInfo}` });
        if (contact.website) {
            const websiteDiv = basicInfo.createDiv({ cls: 'card-info-item' });
            websiteDiv.createSpan({ text: 'Website: ' });
            const websiteLink = websiteDiv.createEl('a', {
                text: contact.website,
                cls: 'card-website-link',
                attr: {
                    href: contact.website,
                    target: '_blank'
                }
            });
        }

        if (contact.activeProjects && contact.activeProjects.length > 0) {
            const projectsDiv = basicInfo.createDiv({ cls: 'card-info-item' });
            projectsDiv.createSpan({ text: 'Projects: ' });
            contact.activeProjects.forEach((project, index) => {
                const projectName = this.extractLinkText(project);
                const projectLink = projectsDiv.createEl('a', {
                    text: projectName,
                    cls: 'card-project-link'
                });
                projectLink.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await this.app.workspace.openLinkText(projectName, '', false);
                });
                if (index < contact.activeProjects.length - 1) {
                    projectsDiv.createSpan({ text: ', ' });
                }
            });
        }

        // Contacts section - show people who are officers of this trade union
        const tradeUnionMembers = await this.getMembersForTradeUnion(filePath);
        if (tradeUnionMembers.length > 0) {
            const membersSection = infoGrid.createDiv({ cls: 'card-union-section' });
            membersSection.createDiv({ cls: 'card-section-label', text: 'Contacts' });
            const membersList = membersSection.createDiv({ cls: 'card-management-list' });

            // Sort members alphabetically by name
            const sortedMembers = tradeUnionMembers.sort((a, b) => a.name.localeCompare(b.name));

            sortedMembers.forEach(person => {
                const personItem = membersList.createDiv({ cls: 'card-management-item' });
                const link = personItem.createEl('a', {
                    text: person.name,
                    cls: 'card-management-link card-trade-union-link'
                });
                link.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await this.app.workspace.openLinkText(person.path, '', false);
                });
            });
        }

        // Tags
        if (contact.tags && contact.tags.length > 0) {
            const tagsSection = infoGrid.createDiv({ cls: 'card-tags-section' });
            const tagsContainer = tagsSection.createDiv({ cls: 'card-tags-container' });
            contact.tags.forEach(tag => {
                tagsContainer.createSpan({ text: `#${tag}`, cls: 'card-tag-note' });
            });
        }

        // Description
        if (contact.description) {
            const summarySection = rightSection.createDiv({ cls: 'card-summary-section' });
            summarySection.createDiv({ cls: 'card-summary-text', text: contact.description });
        }
    }

    private async renderNoteCardOrganization(contact: OrganizationContact, container: HTMLElement, filePath: string): Promise<void> {
        const mainLayout = container.createDiv({ cls: 'card-layout' });

        // Left section
        const leftSection = mainLayout.createDiv({ cls: 'card-left-section' });

        const imageContainer = leftSection.createDiv({ cls: 'card-image-section' });
        const imagePath = this.getImagePath(contact.coverImage);
        if (imagePath) {
            const img = imageContainer.createEl('img', {
                cls: 'card-company-logo',
                attr: { src: this.getImageSrc(imagePath) }
            });
            img.onerror = () => {
                imageContainer.innerHTML = '<div class="card-image-placeholder">🏛️</div>';
            };
        } else {
            imageContainer.innerHTML = '<div class="card-image-placeholder">🏛️</div>';
        }

        // Right section
        const rightSection = mainLayout.createDiv({ cls: 'card-right-section' });

        const header = rightSection.createDiv({ cls: 'card-header-section' });
        const displayName = contact.aliases && contact.aliases.length > 0 && contact.aliases[0].trim()
            ? contact.aliases[0]
            : this.getContactName(filePath);
        header.createEl('h3', { text: displayName, cls: 'card-contact-name' });

        const infoGrid = rightSection.createDiv({ cls: 'card-info-grid' });

        // Basic info
        const basicInfo = infoGrid.createDiv({ cls: 'card-info-section' });
        if (contact.contactInfo) basicInfo.createDiv({ cls: 'card-info-item', text: `Contact: ${contact.contactInfo}` });
        if (contact.website) {
            const websiteDiv = basicInfo.createDiv({ cls: 'card-info-item' });
            websiteDiv.createSpan({ text: 'Website: ' });
            const websiteLink = websiteDiv.createEl('a', {
                text: contact.website,
                cls: 'card-website-link',
                attr: {
                    href: contact.website,
                    target: '_blank'
                }
            });
        }

        if (contact.activeProjects && contact.activeProjects.length > 0) {
            const projectsDiv = basicInfo.createDiv({ cls: 'card-info-item' });
            projectsDiv.createSpan({ text: 'Projects: ' });
            contact.activeProjects.forEach((project, index) => {
                const projectName = this.extractLinkText(project);
                const projectLink = projectsDiv.createEl('a', {
                    text: projectName,
                    cls: 'card-project-link'
                });
                projectLink.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await this.app.workspace.openLinkText(projectName, '', false);
                });
                if (index < contact.activeProjects.length - 1) {
                    projectsDiv.createSpan({ text: ', ' });
                }
            });
        }

        // Members section - show people who are members of this organization
        const organizationMembers = await this.getMembersForOrganization(filePath);
        if (organizationMembers.length > 0) {
            const membersSection = infoGrid.createDiv({ cls: 'card-members-section' });
            membersSection.createDiv({ cls: 'card-section-label', text: 'Members' });
            const membersList = membersSection.createDiv({ cls: 'card-management-list' });

            // Sort members alphabetically by name
            const sortedMembers = organizationMembers.sort((a, b) => a.name.localeCompare(b.name));

            sortedMembers.forEach(person => {
                const personItem = membersList.createDiv({ cls: 'card-management-item' });
                const link = personItem.createEl('a', {
                    text: person.name,
                    cls: 'card-management-link card-members-link'
                });
                link.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await this.app.workspace.openLinkText(person.path, '', false);
                });
            });
        }

        // Tags
        if (contact.tags && contact.tags.length > 0) {
            const tagsSection = infoGrid.createDiv({ cls: 'card-tags-section' });
            const tagsContainer = tagsSection.createDiv({ cls: 'card-tags-container' });
            contact.tags.forEach(tag => {
                tagsContainer.createSpan({ text: `#${tag}`, cls: 'card-tag-note' });
            });
        }

        // Description
        if (contact.description) {
            const summarySection = rightSection.createDiv({ cls: 'card-summary-section' });
            summarySection.createDiv({ cls: 'card-summary-text', text: contact.description });
        }
    }


    private async renderFieldIfExists(
        container: HTMLElement,
        label: string,
        value?: string,
        type: 'text' | 'email' | 'phone' | 'url' = 'text'
    ): Promise<void> {
        if (!value?.trim()) return;

        const field = container.createDiv({ cls: 'contact-field' });

        // For LinkedIn URLs, don't show the label, just the link
        if (type === 'url' && label.toLowerCase() === 'linkedin') {
            field.createEl('a', {
                text: 'LinkedIn',
                attr: { href: value, target: '_blank' },
                cls: 'field-value linkedin-link'
            });
            return;
        }

        field.createEl('span', { text: label + ': ', cls: 'field-label' });

        const valueElement = field.createEl('span', { cls: 'field-value' });

        switch (type) {
            case 'email':
                valueElement.createEl('a', {
                    text: value,
                    attr: { href: `mailto:${value}` }
                });
                break;
            case 'phone':
                valueElement.createEl('a', {
                    text: value,
                    attr: { href: `tel:${value}` }
                });
                break;
            case 'url':
                // For LinkedIn, show just "LinkedIn" as link text, otherwise show the URL
                const linkText = label.toLowerCase() === 'linkedin' ? 'LinkedIn' : value;
                valueElement.createEl('a', {
                    text: linkText,
                    attr: { href: value, target: '_blank' }
                });
                break;
            default:
                valueElement.setText(value);
        }
    }

    private async renderArrayFieldIfExists(container: HTMLElement, label: string, values?: string[]): Promise<void> {
        if (!values?.length) return;

        const field = container.createDiv({ cls: 'contact-field' });
        field.createEl('span', { text: label + ': ', cls: 'field-label' });

        const valueContainer = field.createDiv({ cls: 'field-value array-value' });

        for (let i = 0; i < values.length; i++) {
            const value = values[i].trim();
            if (!value) continue;

            if (value.startsWith('[[') && value.endsWith(']]')) {
                const linkText = value.slice(2, -2);
                const link = valueContainer.createEl('a', {
                    text: linkText,
                    cls: 'internal-link'
                });
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.app.workspace.openLinkText(linkText, '', false);
                });
            } else {
                valueContainer.createSpan({ text: value });
            }

            if (i < values.length - 1) {
                valueContainer.createSpan({ text: ', ', cls: 'separator' });
            }
        }
    }

    private async renderLinkFieldIfExists(container: HTMLElement, label: string, value?: string | string[]): Promise<void> {
        if (!value) return;

        const field = container.createDiv({ cls: 'contact-field' });
        field.createEl('span', { text: label + ': ', cls: 'field-label' });

        const valueElement = field.createEl('span', { cls: 'field-value' });

        // Handle array format
        const actualValue = Array.isArray(value) ? value[0] : value;
        if (!actualValue?.trim()) return;

        // Clean the link text by removing [[ ]] brackets if present
        const linkText = actualValue.startsWith('[[') && actualValue.endsWith(']]')
            ? actualValue.slice(2, -2)
            : actualValue;

        // Extract alias if available
        const displayText = linkText.includes('|') ? linkText.split('|')[1] : linkText;
        const linkTarget = linkText.includes('|') ? linkText.split('|')[0] : linkText;

        // Always create clickable links with blue underlined styling
        const link = valueElement.createEl('a', {
            text: displayText,
            cls: 'contact-link'
        });
        link.addEventListener('click', (e) => {
            e.preventDefault();
            this.app.workspace.openLinkText(linkTarget, '', false);
        });
    }

    private async renderExternalLinkFieldIfExists(container: HTMLElement, label: string, value?: string): Promise<void> {
        if (!value?.trim()) return;

        const field = container.createDiv({ cls: 'contact-field' });
        field.createEl('span', { text: label + ': ', cls: 'field-label' });

        const valueElement = field.createEl('span', { cls: 'field-value' });

        // Create external link that opens in browser/external app
        const link = valueElement.createEl('a', {
            text: value,
            cls: 'contact-link external-link',
            attr: {
                href: value,
                target: '_blank',
                rel: 'noopener noreferrer'
            }
        });
    }

    private async renderMarkdownField(container: HTMLElement, label: string, value: string): Promise<void> {
        if (!value?.trim()) return;

        const field = container.createDiv({ cls: 'contact-field markdown-field' });
        field.createEl('div', { text: label + ':', cls: 'field-label' });

        const valueContainer = field.createDiv({ cls: 'field-value markdown-value' });
        await MarkdownRenderer.renderMarkdown(value, valueContainer, '', this);
    }

    private async renderTagsIfExists(container: HTMLElement, label: string, tags?: string[]): Promise<void> {
        if (!tags?.length) return;

        const field = container.createDiv({ cls: 'contact-field tags-field' });
        field.createEl('span', { text: label + ': ', cls: 'field-label' });

        const tagsContainer = field.createDiv({ cls: 'field-value tags-container' });

        tags.forEach(tag => {
            // Clean the tag name - remove # if it exists and any extra spaces
            const cleanTag = tag.replace(/^#/, '').trim();
            if (!cleanTag) return;

            const tagElement = tagsContainer.createEl('a', {
                text: `#${cleanTag}`,
                cls: 'tag-item internal-link'
            });

            // Make tags clickable - open tag search in Obsidian
            tagElement.addEventListener('click', (e) => {
                e.preventDefault();
                // Use Obsidian's built-in tag search
                (this.app as any).internalPlugins.plugins['global-search'].instance.openGlobalSearch(`tag:#${cleanTag}`);
            });
        });
    }

    private async renderDynamicDropdown(
        container: HTMLElement,
        label: string,
        filePath: string,
        orgType: 'Company' | 'TradeUnion' | 'Organization'
    ): Promise<void> {
        const field = container.createDiv({ cls: 'contact-field dropdown-field' });
        field.createEl('span', { text: label + ': ', cls: 'field-label' });

        const dropdownContainer = field.createDiv({ cls: 'dropdown-container' });
        const dropdown = dropdownContainer.createDiv({ cls: 'dropdown-list' });

        try {
            let items: string[] = [];
            const contactName = this.getContactName(filePath);

            switch (orgType) {
                case 'Company':
                    items = await this.linkResolver.getManagementForCompany(contactName);
                    break;
                case 'TradeUnion':
                    items = await this.linkResolver.getPeopleForOrganization(contactName, 'TradeUnion');
                    break;
                case 'Organization':
                    items = await this.linkResolver.getPeopleForOrganization(contactName, 'Organization');
                    break;
            }

            if (items.length === 0) {
                dropdown.createDiv({ text: `No ${label.toLowerCase()} found`, cls: 'dropdown-empty' });
            } else {
                items.forEach(item => {
                    const itemElement = dropdown.createDiv({ text: item, cls: 'dropdown-item' });
                    itemElement.addEventListener('click', () => {
                        this.app.workspace.openLinkText(item, '', false);
                    });
                });
            }
        } catch (error) {
            console.error('Error rendering dynamic dropdown:', error);
            dropdown.createDiv({ text: 'Error loading data', cls: 'dropdown-error' });
        }
    }

    private addEditButton(container: HTMLElement, contact: Contact, filePath: string): void {
        const editButton = container.createEl('button', {
            text: '✏️',
            cls: 'contact-edit-button',
            attr: { title: 'Edit contact' }
        });

        editButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            await this.openContactEditor(contact, filePath);
        });
    }

    private addCardInteractivity(container: HTMLElement, contact: Contact, filePath: string): void {
        container.addEventListener('click', (e) => {
            if (e.target && (e.target as HTMLElement).closest('.contact-edit-button')) {
                return;
            }

            if (e.target && (e.target as HTMLElement).closest('a')) {
                return;
            }

            this.app.workspace.openLinkText(filePath, '', false);
        });

        container.style.cursor = 'pointer';
    }

    private getContactName(filePath: string): string {
        const fileName = filePath.split('/').pop() || '';
        return fileName.replace(/\.md$/, '');
    }

    private async loadOrganizationLogo(container: HTMLElement, orgName: string): Promise<void> {
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
                            cls: 'card-logo-overlay-img',
                            attr: { src: this.app.vault.adapter.getResourcePath(logoPath) }
                        });
                        img.onerror = () => {
                            container.innerHTML = '🏢';
                        };
                        return;
                    }
                }
            }
        } catch (error) {
            console.warn('Could not load organization logo:', error);
        }

        // Fallback to emoji
        container.innerHTML = '🏢';
    }


    private async openContactEditor(contact: Contact, filePath: string): Promise<void> {
        const file = this.app.vault.getAbstractFileByPath(filePath);
        if (file && file.path) {
            await this.app.workspace.openLinkText(filePath, '', false);
        }
    }

    private async confirmDeleteContact(contact: Contact, filePath: string): Promise<void> {
        const contactName = this.getContactName(filePath);

        const confirmed = await new Promise<boolean>((resolve) => {
            const modal = new (this.app as any).constructor.Modal(this.app);
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
                const file = this.app.vault.getAbstractFileByPath(filePath);
                if (file) {
                    await this.app.vault.delete(file);
                    new (this.app as any).Notice(`Contact "${contactName}" deleted successfully`);
                }
            } catch (error) {
                console.error('Error deleting contact:', error);
                new (this.app as any).Notice('Error deleting contact');
            }
        }
    }

    private async getTradeUnionPeopleForCompany(companyFilePath: string): Promise<{name: string, path: string, tradeUnion: string}[]> {
        try {
            const companyName = this.getContactName(companyFilePath);
            const allPeople = await this.linkResolver.getAllContactsOfType('People');
            const tradeUnionPeople: {name: string, path: string, tradeUnion: string}[] = [];

            for (const personResult of allPeople) {
                const person = personResult.contact as PeopleContact;

                // Check if this person works for this company and has trade union info
                if (person.company && person.tradeUnion) {
                    if (this.matchesLinkOrArray(person.company, companyName)) {
                        const tradeUnionName = Array.isArray(person.tradeUnion)
                            ? this.extractLinkText(person.tradeUnion[0])
                            : this.extractLinkText(person.tradeUnion);
                        tradeUnionPeople.push({
                            name: personResult.filename,
                            path: personResult.path,
                            tradeUnion: tradeUnionName
                        });
                    }
                }
            }

            return tradeUnionPeople;
        } catch (error) {
            console.error('Error getting trade union people for company:', error);
            return [];
        }
    }

    private async getMembersForTradeUnion(tradeUnionFilePath: string): Promise<{name: string, path: string}[]> {
        try {
            const tradeUnionName = this.getContactName(tradeUnionFilePath);
            const allPeople = await this.linkResolver.getAllContactsOfType('People');
            const members: {name: string, path: string}[] = [];

            for (const personResult of allPeople) {
                const person = personResult.contact as PeopleContact;

                // Check if person's tradeUnion matches this trade union
                const tradeUnionMatch = this.matchesLinkOrArray(person.tradeUnion, tradeUnionName);

                // Check if person's collections include 'Officers'
                const hasOfficersCollection = person.collections &&
                    person.collections.some(collection =>
                        this.extractLinkText(collection).toLowerCase().includes('officers')
                    );

                if (tradeUnionMatch && hasOfficersCollection) {
                    members.push({
                        name: personResult.filename,
                        path: personResult.path
                    });
                }
            }

            return members;
        } catch (error) {
            console.error('Error getting members for trade union:', error);
            return [];
        }
    }

    private async getMembersForOrganization(organizationFilePath: string): Promise<{name: string, path: string}[]> {
        try {
            const organizationName = this.getContactName(organizationFilePath);
            const allPeople = await this.linkResolver.getAllContactsOfType('People');
            const members: {name: string, path: string}[] = [];

            for (const personResult of allPeople) {
                const person = personResult.contact as PeopleContact;

                // Check if person's organization matches this organization
                const organizationMatch = this.matchesLinkOrArray(person.organization, organizationName);

                if (organizationMatch) {
                    members.push({
                        name: personResult.filename,
                        path: personResult.path
                    });
                }
            }

            return members;
        } catch (error) {
            console.error('Error getting members for organization:', error);
            return [];
        }
    }

    private async getManagementForCompany(companyFilePath: string): Promise<{name: string, path: string}[]> {
        try {
            const companyName = this.getContactName(companyFilePath);
            const allPeople = await this.linkResolver.getAllContactsOfType('People');
            const managers: {name: string, path: string}[] = [];

            for (const personResult of allPeople) {
                const person = personResult.contact as PeopleContact;

                // Check if this person works for this company and has managers collection
                const hasCompany = this.matchesLinkOrArray(person.company, companyName);
                const hasManagersCollection = person.collections &&
                    person.collections.some(collection =>
                        this.extractLinkText(collection).toLowerCase().includes('managers')
                    );

                if (hasCompany && hasManagersCollection) {
                    managers.push({
                        name: personResult.filename,
                        path: personResult.path
                    });
                }
            }

            return managers;
        } catch (error) {
            console.error('Error getting management for company:', error);
            return [];
        }
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