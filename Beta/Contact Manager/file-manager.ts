import { App, TFile, TFolder, normalizePath } from 'obsidian';
import { ContactCardsSettings, ObjectType } from './contact-types';
import { FrontmatterUtils } from './frontmatter-utils';

export class FileManager {
    private app: App;
    private settings: ContactCardsSettings;

    constructor(app: App, settings: ContactCardsSettings) {
        this.app = app;
        this.settings = settings;
    }

    updateSettings(settings: ContactCardsSettings): void {
        this.settings = settings;
    }

    async createContactFile(
        contactName: string,
        contactType: ObjectType,
        folderPath?: string,
        initialData: Record<string, any> = {}
    ): Promise<TFile | null> {
        try {
            const targetFolder = folderPath || this.getDefaultFolderForType(contactType);
            const template = this.getTemplateForType(contactType);
            const fileName = this.sanitizeFileName(contactName);
            const filePath = normalizePath(`${targetFolder}/${fileName}.md`);

            await this.ensureFolderExists(targetFolder);

            if (this.app.vault.getAbstractFileByPath(filePath)) {
                throw new Error(`File already exists: ${filePath}`);
            }

            const content = this.processTemplate(template, contactName, initialData);
            const file = await this.app.vault.create(filePath, content);

            return file;
        } catch (error) {
            console.error('Error creating contact file:', error);
            return null;
        }
    }

    // Deprecated: This method is no longer used since contact creation was simplified
    // async moveImageToContactFolder(
    //     imageFile: File,
    //     contactType: ObjectType,
    //     suggestedName?: string
    // ): Promise<string | null> {
    //     try {
    //         const targetFolder = contactType === 'People'
    //             ? 'Images/Profiles'  // Hardcoded fallback
    //             : 'Images/Logos';    // Hardcoded fallback

    //         await this.ensureFolderExists(targetFolder);
    //
    //         const fileName = suggestedName || imageFile.name;
    //         const sanitizedName = this.sanitizeFileName(fileName);
    //         const filePath = normalizePath(`${targetFolder}/${sanitizedName}`);
    //
    //         if (this.app.vault.getAbstractFileByPath(filePath)) {
    //             const timestamp = Date.now();
    //             const nameParts = sanitizedName.split('.');
    //             const extension = nameParts.pop();
    //             const baseName = nameParts.join('.');
    //             const newPath = normalizePath(`${targetFolder}/${baseName}_${timestamp}.${extension}`);
    //
    //             const arrayBuffer = await imageFile.arrayBuffer();
    //             await this.app.vault.createBinary(newPath, arrayBuffer);
    //             return newPath;
    //         } else {
    //             const arrayBuffer = await imageFile.arrayBuffer();
    //             await this.app.vault.createBinary(filePath, arrayBuffer);
    //             return filePath;
    //         }
    //     } catch (error) {
    //         console.error('Error moving image file:', error);
    //         return null;
    //     }
    // }

    // Deprecated: This method is no longer used since contact creation was simplified
    // async copyImageToContactFolder(
    //     sourcePath: string,
    //     contactType: ObjectType,
    //     suggestedName?: string
    // ): Promise<string | null> {
    //     try {
    //         const sourceFile = this.app.vault.getAbstractFileByPath(sourcePath) as TFile;
    //         if (!sourceFile) {
    //             throw new Error(`Source file not found: ${sourcePath}`);
    //         }
    //
    //         const targetFolder = contactType === 'People'
    //             ? 'Images/Profiles'  // Hardcoded fallback
    //             : 'Images/Logos';    // Hardcoded fallback
    //
    //         await this.ensureFolderExists(targetFolder);
    //
    //         const fileName = suggestedName || sourceFile.name;
    //         const sanitizedName = this.sanitizeFileName(fileName);
    //         const filePath = normalizePath(`${targetFolder}/${sanitizedName}`);
    //
    //         if (this.app.vault.getAbstractFileByPath(filePath)) {
    //             const timestamp = Date.now();
    //             const nameParts = sanitizedName.split('.');
    //             const extension = nameParts.pop();
    //             const baseName = nameParts.join('.');
    //             const newPath = normalizePath(`${targetFolder}/${baseName}_${timestamp}.${extension}`);
    //
    //             await this.app.vault.copy(sourceFile, newPath);
    //             return newPath;
    //         } else {
    //             await this.app.vault.copy(sourceFile, filePath);
    //             return filePath;
    //         }
    //     } catch (error) {
    //         console.error('Error copying image file:', error);
    //         return null;
    //     }
    // }

    async ensureFolderExists(folderPath: string): Promise<void> {
        const normalizedPath = normalizePath(folderPath);
        const folder = this.app.vault.getAbstractFileByPath(normalizedPath);

        if (!folder) {
            await this.app.vault.createFolder(normalizedPath);
        } else if (!(folder instanceof TFolder)) {
            throw new Error(`Path exists but is not a folder: ${normalizedPath}`);
        }
    }

    private getDefaultFolderForType(contactType: ObjectType): string {
        switch (contactType) {
            case 'People':
                return this.settings.peopleFolders[0] || 'People';
            case 'Company':
                return this.settings.companyFolders[0] || 'Companies';
            case 'TradeUnion':
                return this.settings.tradeUnionFolders[0] || 'TradeUnions';
            case 'Organization':
                return this.settings.organizationFolders[0] || 'Organizations';
            default:
                return 'Contacts';
        }
    }

    private getTemplateForType(contactType: ObjectType): string {
        switch (contactType) {
            case 'People':
                return this.settings.peopleTemplate;
            case 'Company':
                return this.settings.companyTemplate;
            case 'TradeUnion':
                return this.settings.tradeUnionTemplate;
            case 'Organization':
                return this.settings.organizationTemplate;
            default:
                return '';
        }
    }

    private processTemplate(template: string, contactName: string, data: Record<string, any>): string {
        console.log('🔧 FileManager.processTemplate called with data:', data);

        // First handle standard placeholders
        let processed = template
            .replace(/\{\{title\}\}/g, contactName)
            .replace(/\{\{date\}\}/g, this.getCurrentDate());

        // Handle placeholder substitution
        for (const [key, value] of Object.entries(data)) {
            const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            processed = processed.replace(placeholder, String(value));
        }

        // Now update the frontmatter with actual data
        const frontmatterMatch = processed.match(/^---\n([\s\S]*?)\n---/);
        if (frontmatterMatch) {
            let frontmatter = frontmatterMatch[1];

            // Update fields in frontmatter
            for (const [key, value] of Object.entries(data)) {
                if (key === 'name' || key === 'folder') continue; // Skip metadata fields

                const fieldRegex = new RegExp(`^${key}:\\s*$`, 'm');
                if (fieldRegex.test(frontmatter)) {
                    // Field exists but is empty
                    frontmatter = frontmatter.replace(fieldRegex, `${key}: ${FrontmatterUtils.formatFrontmatterValue(value, key)}`);
                } else if (!frontmatter.includes(`${key}:`)) {
                    // Field doesn't exist, add it after type
                    const objectTypeMatch = frontmatter.match(/^type:.*$/m);
                    if (objectTypeMatch) {
                        const insertAfter = objectTypeMatch.index! + objectTypeMatch[0].length;
                        frontmatter = frontmatter.slice(0, insertAfter) +
                                    `\n${key}: ${FrontmatterUtils.formatFrontmatterValue(value, key)}` +
                                    frontmatter.slice(insertAfter);
                    }
                }
            }

            processed = processed.replace(frontmatterMatch[0], `---\n${frontmatter}\n---`);
        }

        return processed;
    }


    private getCurrentDate(): string {
        return new Date().toISOString().split('T')[0];
    }

    private sanitizeFileName(fileName: string): string {
        return fileName
            .replace(/[<>:"/\\|?*]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    getFoldersForContactType(contactType: ObjectType): string[] {
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

    async getImageFiles(folderPath: string): Promise<TFile[]> {
        const folder = this.app.vault.getAbstractFileByPath(folderPath);
        if (!folder) return [];

        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'];

        return this.app.vault.getFiles().filter(file => {
            const isInFolder = file.path.startsWith(folderPath + '/');
            const hasImageExtension = imageExtensions.some(ext =>
                file.path.toLowerCase().endsWith(ext)
            );
            return isInFolder && hasImageExtension;
        });
    }

    async validateImagePath(imagePath: string): Promise<boolean> {
        if (!imagePath) return false;

        const file = this.app.vault.getAbstractFileByPath(imagePath);
        return file instanceof TFile;
    }

    async updateContactFrontmatter(
        filePath: string,
        updates: Record<string, any>
    ): Promise<boolean> {
        try {
            const file = this.app.vault.getAbstractFileByPath(filePath) as TFile;
            if (!file) return false;

            const content = await this.app.vault.read(file);
            const updatedContent = FrontmatterUtils.updateFrontmatterFields(content, updates);

            if (updatedContent !== content) {
                await this.app.vault.modify(file, updatedContent);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error updating contact frontmatter:', error);
            return false;
        }
    }

}