import { App, TFile, CachedMetadata } from 'obsidian';
import { ContactCardsSettings, Contact, ObjectType, PeopleContact, CompanyContact, TradeUnionContact, OrganizationContact, ContactParseResult, FrontMatterCache } from './contact-types';

export class LinkResolver {
    private app: App;
    private settings: ContactCardsSettings;
    private contactCache: Map<string, ContactParseResult> = new Map();

    constructor(app: App, settings: ContactCardsSettings) {
        this.app = app;
        this.settings = settings;
    }

    updateSettings(settings: ContactCardsSettings): void {
        this.settings = settings;
        this.invalidateCache();
    }

    invalidateCache(): void {
        this.contactCache.clear();
    }

    invalidateFileCache(filePath: string): void {
        // Remove all cache entries for this file path
        const keysToDelete: string[] = [];
        for (const key of this.contactCache.keys()) {
            if (key.startsWith(filePath + ':')) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.contactCache.delete(key));
    }

    async getManagementForCompany(companyName: string): Promise<string[]> {
        const allPeople = await this.getAllPeopleContacts();
        return allPeople
            .filter(person => {
                const contact = person.contact as PeopleContact;
                let hasCompany = false;

                if (contact.company) {
                    if (Array.isArray(contact.company)) {
                        hasCompany = contact.company.some(comp => this.extractLinkText(comp) === companyName);
                    } else {
                        hasCompany = this.extractLinkText(contact.company) === companyName;
                    }
                }

                const hasManagersCollection = contact.collections &&
                    contact.collections.some(collection =>
                        this.extractLinkText(collection).toLowerCase().includes('managers')
                    );
                return hasCompany && hasManagersCollection;
            })
            .map(person => this.getDisplayName(person.filename));
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

    async getPeopleForOrganization(orgName: string, orgType: 'TradeUnion' | 'Organization'): Promise<string[]> {
        const allPeople = await this.getAllPeopleContacts();
        const property = orgType === 'TradeUnion' ? 'tradeUnion' : 'organization';

        return allPeople
            .filter(person => {
                const contact = person.contact as PeopleContact;
                const propertyValue = contact[property];
                if (!propertyValue) return false;

                if (Array.isArray(propertyValue)) {
                    return propertyValue.some(value => this.extractLinkText(value) === orgName);
                } else {
                    return this.extractLinkText(propertyValue) === orgName;
                }
            })
            .map(person => this.getDisplayName(person.filename));
    }

    async getAllContactsOfType<T extends Contact>(contactType: ObjectType): Promise<ContactParseResult[]> {
        const folders = this.getFoldersForContactType(contactType);
        const contacts: ContactParseResult[] = [];

        for (const folder of folders) {
            const folderContacts = await this.getContactsInFolder(folder, contactType);
            contacts.push(...folderContacts);
        }

        return contacts;
    }

    async getAllPeopleContacts(): Promise<ContactParseResult[]> {
        return this.getAllContactsOfType('People');
    }

    async getAllCompanyContacts(): Promise<ContactParseResult[]> {
        return this.getAllContactsOfType('Company');
    }

    async getAllTradeUnionContacts(): Promise<ContactParseResult[]> {
        return this.getAllContactsOfType('TradeUnion');
    }

    async getAllOrganizationContacts(): Promise<ContactParseResult[]> {
        return this.getAllContactsOfType('Organization');
    }

    async getContactsInFolder(folderPath: string, expectedType?: ObjectType): Promise<ContactParseResult[]> {
        const folder = this.app.vault.getAbstractFileByPath(folderPath);
        if (!folder) return [];

        const contacts: ContactParseResult[] = [];
        const files = this.app.vault.getMarkdownFiles().filter(file =>
            file.path.startsWith(folderPath + '/') || file.path === folderPath
        );

        for (const file of files) {
            const cacheKey = file.path + ':' + file.stat.mtime;
            let contactResult = this.contactCache.get(cacheKey);

            if (!contactResult) {
                contactResult = await this.parseContactFile(file);
                if (contactResult) {
                    this.contactCache.set(cacheKey, contactResult);
                }
            }

            if (contactResult && (!expectedType || contactResult.contact.type === expectedType)) {
                contacts.push(contactResult);
            }
        }

        return contacts;
    }

    async parseContactFile(file: TFile): Promise<ContactParseResult | null> {
        try {
            const metadata = this.app.metadataCache.getFileCache(file);
            if (!metadata?.frontmatter) return null;

            const frontmatter = metadata.frontmatter as FrontMatterCache;
            const rawType = frontmatter.type as string;
            const contactType = this.normalizeContactType(rawType);

            if (!contactType) {
                return null;
            }

            const contact = this.createContactFromFrontmatter(frontmatter, contactType, file);
            if (!contact) return null;

            return {
                contact,
                filename: file.basename,
                path: file.path
            };
        } catch (error) {
            console.error('Error parsing contact file:', file.path, error);
            return null;
        }
    }

    private createContactFromFrontmatter(frontmatter: FrontMatterCache, contactType: ObjectType, file?: TFile): Contact | null {
        try {
            const baseContact = {
                type: contactType,
                description: frontmatter.description || undefined,
                lastUpdated: this.getLastUpdatedValue(frontmatter.lastUpdated, file),
                tags: this.parseArrayField(frontmatter.tags),
                country: this.parseArrayField(frontmatter.country),
                collections: this.parseArrayField(frontmatter.collections),
                title: this.parseStringField(frontmatter.title),
                aliases: this.parseArrayField(frontmatter.aliases)
            };

            switch (contactType) {
                case 'People':
                    return {
                        ...baseContact,
                        type: 'People',
                        coverImage: this.parseStringField(frontmatter.coverImage),
                        phone: this.parseStringField(frontmatter.phone),
                        email: this.parseStringField(frontmatter.email),
                        role: this.parseStringField(frontmatter.role),
                        tradeUnion: this.parseArrayOrStringField(frontmatter.tradeUnion),
                        company: this.parseArrayOrStringField(frontmatter.company),
                        organization: this.parseArrayOrStringField(frontmatter.organization),
                        linkedin: this.parseStringField(frontmatter.linkedin)
                    } as PeopleContact;

                case 'Company':
                    return {
                        ...baseContact,
                        type: 'Company',
                        coverImage: this.parseStringField(frontmatter.coverImage),
                        activeProjects: this.parseArrayField(frontmatter.activeProjects),
                        contactInfo: this.parseStringField(frontmatter.contactInfo),
                        coordinator: this.parseArrayField(frontmatter.coordinator),
                        website: this.parseStringField(frontmatter.website),
                        folder: this.parseStringField(frontmatter.folder),
                        management: this.parseArrayField(frontmatter.management)
                    } as CompanyContact;

                case 'TradeUnion':
                    return {
                        ...baseContact,
                        type: 'TradeUnion',
                        coverImage: this.parseStringField(frontmatter.coverImage),
                        activeProjects: this.parseArrayField(frontmatter.activeProjects),
                        contactInfo: this.parseStringField(frontmatter.contactInfo),
                        website: this.parseStringField(frontmatter.website),
                        folder: this.parseStringField(frontmatter.folder),
                        people: this.parseArrayField(frontmatter.people)
                    } as TradeUnionContact;

                case 'Organization':
                    return {
                        ...baseContact,
                        type: 'Organization',
                        coverImage: this.parseStringField(frontmatter.coverImage),
                        activeProjects: this.parseArrayField(frontmatter.activeProjects),
                        contactInfo: this.parseStringField(frontmatter.contactInfo),
                        website: this.parseStringField(frontmatter.website),
                        folder: this.parseStringField(frontmatter.folder),
                        people: this.parseArrayField(frontmatter.people)
                    } as OrganizationContact;

                default:
                    return null;
            }
        } catch (error) {
            console.error('Error creating contact from frontmatter:', error);
            return null;
        }
    }

    private parseStringField(value: any): string | undefined {
        if (value === null || value === undefined || value === '') {
            return undefined;
        }
        const stringValue = String(value).trim();
        return stringValue.length > 0 ? stringValue : undefined;
    }

    private parseArrayField(value: any): string[] | undefined {
        if (!value) return undefined;
        if (Array.isArray(value)) return value.map(String).filter(item => item.trim().length > 0);
        if (typeof value === 'string') {
            const items = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
            return items.length > 0 ? items : undefined;
        }
        const stringValue = String(value).trim();
        return stringValue.length > 0 ? [stringValue] : undefined;
    }

    private parseArrayOrStringField(value: any): string | string[] | undefined {
        if (!value) return undefined;
        if (Array.isArray(value)) {
            const filtered = value.map(String).filter(item => item.trim().length > 0);
            return filtered.length > 0 ? filtered : undefined;
        }
        if (typeof value === 'string') {
            const trimmed = value.trim();
            return trimmed.length > 0 ? trimmed : undefined;
        }
        const stringValue = String(value).trim();
        return stringValue.length > 0 ? stringValue : undefined;
    }

    async refreshDynamicLinks(contactPath: string): Promise<void> {
        const file = this.app.vault.getAbstractFileByPath(contactPath) as TFile;
        if (!file) return;

        const contactResult = await this.parseContactFile(file);
        if (!contactResult) return;

        const contact = contactResult.contact;

        if (contact.type === 'People') {
            await this.updateRelatedOrganizations(contact as PeopleContact, contactResult.filename);
        } else if (contact.type === 'Company' && this.settings.autoCompleteCompanyManagement) {
            await this.updateCompanyManagement(contactResult.filename);
        } else if (contact.type === 'TradeUnion' && this.settings.autoCompleteTradeUnionPeople) {
            await this.updateOrganizationPeople(contactResult.filename, contact.type);
        } else if (contact.type === 'Organization' && this.settings.autoCompleteOrganizationPeople) {
            await this.updateOrganizationPeople(contactResult.filename, contact.type);
        }
    }

    private async updateRelatedOrganizations(person: PeopleContact, personName: string): Promise<void> {
        const displayName = this.getDisplayName(personName);

        if (person.company && this.settings.autoCompleteCompanyManagement) {
            await this.updateCompanyManagement(person.company);
        }

        if (person.tradeUnion && this.settings.autoCompleteTradeUnionPeople) {
            await this.updateOrganizationPeople(person.tradeUnion, 'TradeUnion');
        }

        if (person.organization && this.settings.autoCompleteOrganizationPeople) {
            await this.updateOrganizationPeople(person.organization, 'Organization');
        }
    }

    private async updateCompanyManagement(companyName: string): Promise<void> {
        const management = await this.getManagementForCompany(companyName);
        await this.updateContactField(companyName, 'Company', 'management', management);
    }

    private async updateOrganizationPeople(orgName: string, orgType: 'TradeUnion' | 'Organization'): Promise<void> {
        const cleanOrgName = this.extractLinkText(orgName);
        const people = await this.getPeopleForOrganization(cleanOrgName, orgType);
        await this.updateContactField(cleanOrgName, orgType, 'people', people);
    }

    private async updateContactField(contactName: string, contactType: ObjectType, fieldName: string, value: string[]): Promise<void> {
        const contacts = await this.getAllContactsOfType(contactType);
        const contact = contacts.find(c => this.getDisplayName(c.filename) === contactName);

        if (!contact) return;

        const file = this.app.vault.getAbstractFileByPath(contact.path) as TFile;
        if (!file) return;

        try {
            const content = await this.app.vault.read(file);
            // Format as links without sorting to preserve user's preferred order
            const formattedLinks = value.map(name => `[[${name}]]`);
            const updatedContent = this.updateFrontmatterField(content, fieldName, formattedLinks);

            await this.app.vault.modify(file, updatedContent);
            this.invalidateCache();
        } catch (error) {
            console.error('Error updating contact field:', error);
        }
    }

    private updateFrontmatterField(content: string, fieldName: string, value: string[]): string {
        const frontmatterRegex = /^---\n(.*?)\n---/s;
        const match = content.match(frontmatterRegex);

        if (!match) return content;

        const frontmatter = match[1];
        const lines = frontmatter.split('\n');
        const newLines: string[] = [];

        let skipUntilNextField = false;
        let fieldFound = false;

        // Process each line
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Check if this line starts a new field
            const isFieldStart = line.match(/^[a-zA-Z][a-zA-Z0-9_]*:/);

            if (line.startsWith(`${fieldName}:`)) {
                // Found our target field - mark it and start skipping
                fieldFound = true;
                skipUntilNextField = true;
                continue;
            } else if (skipUntilNextField && isFieldStart) {
                // Found start of next field - stop skipping
                skipUntilNextField = false;
            } else if (skipUntilNextField && line.trim().startsWith('-')) {
                // Skip list items of our target field
                continue;
            } else if (skipUntilNextField && line.trim() === '') {
                // Skip empty lines within our field
                continue;
            }

            // If we're not skipping, keep the line
            if (!skipUntilNextField) {
                newLines.push(line);
            }
        }

        // Generate new field content - always use list format for consistency
        let newFieldContent: string;
        if (value.length === 0) {
            newFieldContent = `${fieldName}:`;
        } else {
            const listItems = value.map(item => `  - "${item}"`).join('\n');
            newFieldContent = `${fieldName}:\n${listItems}`;
        }

        // Add the new field content
        if (fieldFound) {
            // Field existed, we removed it, now add the new version
            const updatedFrontmatter = newLines.join('\n').trim() + '\n' + newFieldContent;
            return content.replace(frontmatterRegex, `---\n${updatedFrontmatter}\n---`);
        } else {
            // Field didn't exist, append it
            const updatedFrontmatter = newLines.join('\n').trim() + '\n' + newFieldContent;
            return content.replace(frontmatterRegex, `---\n${updatedFrontmatter}\n---`);
        }
    }


    private getLastUpdatedValue(frontmatterValue: any, file?: TFile): string | undefined {
        if (frontmatterValue && frontmatterValue !== 'file.mtime') {
            return String(frontmatterValue);
        }
        if (file) {
            return new Date(file.stat.mtime).toISOString().split('T')[0];
        }
        return undefined;
    }

    private getDisplayName(filename: string): string {
        return filename.replace(/\.md$/, '');
    }

    private normalizeContactType(rawType: string): ObjectType | null {
        if (!rawType || typeof rawType !== 'string') {
            return null;
        }

        // Normalize to lowercase for comparison
        const normalizedType = rawType.toLowerCase().trim();

        // Map both lowercase and capitalized versions to the standard ObjectType
        switch (normalizedType) {
            case 'people':
            case 'person':
                return 'People';
            case 'company':
            case 'companies':
                return 'Company';
            case 'tradeunion':
            case 'trade union':
            case 'union':
                return 'TradeUnion';
            case 'organization':
            case 'organisation':
            case 'org':
                return 'Organization';
            default:
                return null;
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
                return [];
        }
    }

}