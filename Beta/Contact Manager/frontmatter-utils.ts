export class FrontmatterUtils {
    /**
     * Format a value for YAML frontmatter
     * @param value - The value to format
     * @param key - The property key (for special handling like tags)
     * @returns Formatted string for YAML frontmatter
     */
    static formatFrontmatterValue(value: any, key?: string): string {
        console.log(`🔧 FrontmatterUtils.formatFrontmatterValue called:`);
        console.log(`   Key: ${key}`);
        console.log(`   Value:`, value);
        console.log(`   Is Array:`, Array.isArray(value));

        if (value === null || value === undefined || value === '') {
            console.log(`   → Returning empty string`);
            return '';
        }

        if (Array.isArray(value)) {
            const filteredValue = value.filter(item => item && item.trim());
            if (filteredValue.length === 0) {
                console.log(`   → Array is empty after filtering, returning empty`);
                return '';
            }

            console.log(`   → Filtered array:`, filteredValue);

            // For all arrays (including tags), use proper JSON array format that Obsidian recognizes
            // Escape quotes if needed and format as JSON-style array
            const escapedValues = filteredValue.map(val => {
                // If value contains special characters, wrap in quotes
                if (val.includes('[') || val.includes(']') || val.includes(',') || val.includes(':')) {
                    return `"${val.replace(/"/g, '\\"')}"`;
                }
                return val;
            });
            const result = `[${escapedValues.join(', ')}]`;
            console.log(`   → Array result: "${result}"`);
            return result;
        }

        const result = String(value);
        console.log(`   → String result: "${result}"`);
        return result;
    }

    /**
     * Update frontmatter fields in a markdown content
     * @param content - Original markdown content with frontmatter
     * @param updates - Object with key-value pairs to update
     * @returns Updated markdown content
     */
    static updateFrontmatterFields(content: string, updates: Record<string, any>): string {
        console.log(`🔄 FrontmatterUtils.updateFrontmatterFields called with updates:`, updates);

        const frontmatterRegex = /^---\n(.*?)\n---/s;
        const match = content.match(frontmatterRegex);

        if (!match) {
            // No existing frontmatter, create new one
            const frontmatter = Object.entries(updates)
                .map(([key, value]) => `${key}: ${this.formatFrontmatterValue(value, key)}`)
                .join('\n');
            return `---\n${frontmatter}\n---\n\n${content}`;
        }

        // Update existing frontmatter
        let frontmatter = match[1];
        const lines = frontmatter.split('\n');
        const updatedLines: string[] = [];
        const processedKeys = new Set<string>();

        // Process existing lines
        for (const line of lines) {
            const colonIndex = line.indexOf(':');
            if (colonIndex === -1) {
                updatedLines.push(line);
                continue;
            }

            const key = line.substring(0, colonIndex).trim();
            if (updates.hasOwnProperty(key)) {
                const formattedValue = this.formatFrontmatterValue(updates[key], key);
                updatedLines.push(`${key}: ${formattedValue}`);
                processedKeys.add(key);
            } else {
                updatedLines.push(line);
            }
        }

        // Add any new properties that weren't in the original frontmatter
        for (const [key, value] of Object.entries(updates)) {
            if (key === 'type' || processedKeys.has(key)) continue;

            const formattedValue = this.formatFrontmatterValue(value, key);
            updatedLines.push(`${key}: ${formattedValue}`);
        }


        const newFrontmatter = updatedLines.join('\n');
        return content.replace(frontmatterRegex, `---\n${newFrontmatter}\n---`);
    }

    /**
     * Helper function to convert array to string for display purposes
     * @param arr - Array to convert
     * @returns Comma-separated string
     */
    static arrayToString(arr?: string[]): string {
        if (!arr || !Array.isArray(arr)) return '';
        return arr.join(', ');
    }

    /**
     * Helper function to convert string to array from form input
     * @param str - Comma-separated string
     * @returns Array of trimmed strings
     */
    static stringToArray(str: string): string[] {
        if (!str || !str.trim()) return [];
        return str.split(',').map(item => item.trim()).filter(item => item.length > 0);
    }
}