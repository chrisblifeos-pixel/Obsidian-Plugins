# ContactManager Plugin for Obsidian

A comprehensive contact management system for Obsidian that handles four types of contacts: **People**, **Companies**, **Trade Unions**, and **Organizations**. This plugin provides a modern contacts browser, dynamic relationship tracking, beautiful contact cards, and an intuitive creation wizard.

## Features

### 📱 Modern Contacts Browser
- **Grid-based interface**: Browse all contacts in a responsive grid layout
- **Search and filtering**: Find contacts by name, tags, or content
- **Type-based tabs**: Filter by People, Companies, Trade Unions, or Organizations
- **Quick actions**: Create new contacts directly from the browser
- **Contact previews**: See key information at a glance

### 🏢 Four Contact Types
- **People**: Individual contacts with profile images, roles, and organization links
- **Company**: Business organizations with management tracking and logos
- **Trade Union**: Labor unions with member tracking and project management
- **Organization**: Other organizations with people and project tracking

### 🎨 Modern Contact Cards
- **Professional layout**: Based on modern card design principles
- **Image sections**: Profile pictures and organization logos with gradients
- **Smart positioning**: Cards appear only under "Contact Card" heading
- **Type-specific styling**: Each contact type has distinct visual styling and colors
- **Responsive design**: Adapts to different screen sizes

### 🔗 Dynamic Relationship Management
- **Auto-populated sections**: Management, People fields update automatically (configurable)
- **Bidirectional linking**: Changes in one contact automatically update related contacts
- **Smart filtering**: Specific conditions for each relationship type
- **Toggle control**: Enable/disable auto-completion per contact type

### 🧙‍♂️ Contact Creation Wizard
- **Guided creation process**: Step-by-step wizard for creating contacts
- **Image handling**: Upload or select existing images for profiles and logos
- **Template system**: Customizable templates for each contact type
- **Smart folder management**: Automatic file organization

## Installation

### From Obsidian Community Plugins
1. Open Obsidian Settings
2. Go to Community Plugins
3. Search for "Contact Cards"
4. Install and enable the plugin

### Manual Installation
1. Download the latest release from GitHub
2. Extract the files to `{VaultFolder}/.obsidian/plugins/contact-cards/`
3. Reload Obsidian
4. Enable the plugin in Settings > Community Plugins

## Quick Start

### 1. Configure Settings
Go to Settings > Contact Cards and configure:
- **Contact Types**: Enable/disable each contact type as needed
- **Auto-completion**: Configure automatic field updates for management and people fields
- **Folders**: Set folders for each contact type
- **Templates**: Customize creation templates

### 2. Create Your First Contact
1. Click the Contact Cards ribbon icon (👤+) or use Command Palette
2. Select contact type (People/Company/Trade Union/Organization)
3. Fill in the information
4. Upload or select an image (optional)
5. Click "Create Contact"

### 3. Link Contacts
Use the standard Obsidian linking syntax in contact fields:
```yaml
Company: [[Acme Corporation]]
TradeUnion: [[Local 123]]
Organization: [[Tech Workers Alliance]]
```

## Contact Types

### People Contact
```yaml
---
type: People
CoverImage: Images/Profiles/john_doe.jpg
Phone: +1 (555) 123-4567
Email: john@example.com
Country: United States
Role: Software Engineer
TradeUnion: [[Local 123]]
Company: ["[[Acme Corporation]]", "[[Tech Startup Inc]]"]  # Multiple companies supported
Organization: ["[[Tech Workers Alliance]]", "[[Open Source Foundation]]"]  # Multiple organizations supported
Linkedin: https://linkedin.com/in/johndoe
description: Experienced software engineer with a passion for open source
---
```

### Company Contact
```yaml
---
type: Company
OrganizationLogo: Images/Logos/acme_corp.png
description: Leading technology company
LastUpdated: 2024-01-15
ActiveProjects: [[Project Alpha]], [[Project Beta]]
ContactInfo: contact@acme.com
Coordinator: [[Jane Smith]], [[Bob Johnson]]
Website: https://acme.com
Folder: [[Acme Corporation Folder]]
Management: # Auto-populated based on People contacts
---
```

### Trade Union Contact
```yaml
---
type: TradeUnion
OrganizationLogo: Images/Logos/local_123.png
description: Local chapter of tech workers union
LastUpdated: 2024-01-15
ActiveProjects: [[Wage Negotiation]], [[Safety Initiative]]
ContactInfo: info@local123.org
Website: https://local123.org
Folder: [[Local 123 Folder]]
People: # Auto-populated based on People contacts
---
```

### Organization Contact
```yaml
---
type: Organization
OrganizationLogo: Images/Logos/tech_alliance.png
description: Alliance of technology workers
LastUpdated: 2024-01-15
ActiveProjects: [[Industry Survey]], [[Advocacy Campaign]]
ContactInfo: hello@techalliance.org
Website: https://techalliance.org
Folder: [[Tech Alliance Folder]]
People: # Auto-populated based on People contacts
---
```

## Commands

The plugin provides several commands accessible via Command Palette:

- **Create New Contact**: Open the contact creation wizard
- **Create People Contact**: Directly create a people contact
- **Create Company Contact**: Directly create a company contact
- **Create Trade Union Contact**: Directly create a trade union contact
- **Create Organization Contact**: Directly create an organization contact
- **Refresh Contact Links**: Refresh all dynamic relationships
- **Refresh Current Contact Links**: Refresh links for current contact

## Dynamic Relationships

### How It Works
The plugin automatically maintains relationships between contacts when auto-completion is enabled:

1. **Company Management**: People with `company` field + collections including "Managers"
2. **TradeUnion Contacts**: People with `tradeUnion` field + collections including "Officers"
3. **Organization Members**: People with `organization` field pointing to the organization
4. **Auto-refresh**: Relationships update automatically when contacts are created, modified, or deleted (if enabled)

### Auto-completion Settings
- **Configurable**: Each contact type has its own toggle for auto-completion
- **When enabled**: Fields update automatically based on relationship conditions
- **When disabled**: You can manually manage relationships in frontmatter

### Example Scenario
1. Create a company "Acme Corp"
2. Create a person "John Doe" with `Company: [[Acme Corp]]` and `collections: ["Managers"]`
3. The "Acme Corp" contact automatically shows "John Doe" in the Management section (if auto-completion enabled)
4. Create a trade union "Local 123" and set John's `tradeUnion: [[Local 123]]` and `collections: ["Officers"]`
5. John now appears in Local 123's Contacts section

## Customization

### Templates
Customize templates in Settings > Contact Cards. Templates support:
- `{{title}}`: Contact name
- `{{date}}`: Current date
- Any custom placeholders you define

### Styling
The plugin respects Obsidian's theme system and provides:
- Light/dark theme support
- CSS custom properties for easy customization
- Responsive design for mobile use

### Advanced Configuration
- **Multiple folders**: Each contact type can use multiple folders
- **Custom image folders**: Separate folders for profiles and logos
- **Project integration**: Link contacts to project notes

## Troubleshooting

### Contact Cards Not Appearing
1. Check that the file is in a configured contact folder
2. Verify the `type` field in frontmatter
3. Try refreshing the contact links

### Dynamic Links Not Updating
1. Use the "Refresh Contact Links" command
2. Check that contact names match exactly (case-sensitive)
3. Verify folder configuration in settings

### Images Not Loading
1. Check image file paths in frontmatter
2. Verify image folders are configured correctly
3. Ensure image files exist and are accessible

## Development

### Building the Plugin
```bash
npm install
npm run build
```

### Development Mode
```bash
npm run dev
```

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join the conversation in GitHub Discussions
- **Documentation**: Check the wiki for detailed guides

## Changelog

### 1.0.5
- **Multiple relationship values support**: People contacts now support arrays for company, tradeUnion, and organization fields
- **Enhanced GridCard display**: Multiple values shown in single line with commas (e.g., "🏢 Tetra Pak, DS Smith, Lecta")
- **Improved NoteCard display**: Multiple companies/unions/organizations displayed as separate clickable links with commas
- **Smart sorting system**:
  - All contact types (except People) sort alphabetically by display name
  - People tab includes sorting options: A-Z, Company, Union, Organization grouping
  - Sorting uses display names (aliases when available) instead of filenames
- **Dynamic tab counters**: Contact type tabs show real-time counts based on search results
- **Enhanced auto-completion**: Uses "includes" matching instead of exact matching for multiple relationships
- **Comprehensive search**: Search functionality includes all array values for better discoverability

### 1.0.4
- Added auto-completion toggle settings for management and people fields
- Fixed TradeUnion GridCard color accent and country display issues
- Made website and project links clickable in NoteCards
- Updated relationship detection conditions:
  - Company Management: company + "Managers" in collections
  - TradeUnion Contacts: tradeUnion + "Officers" in collections
  - Organization Members: organization field pointing to organization
- Improved auto-completion consistency and YAML list formatting

### 1.0.3
- Enhanced contact card architecture with NoteCard and GridCard views
- Added clickable links for websites and projects
- Fixed automatic field updates and deprecated legacy properties
- Improved country field display without brackets
- Updated color schemes for different contact types

### 1.0.0
- Initial release
- Four contact types with dynamic relationships
- Contact creation wizard
- Responsive contact cards
- Image management system
- Template customization
- Auto-updating LastUpdated fields

---

Built with ❤️ for the Obsidian community.