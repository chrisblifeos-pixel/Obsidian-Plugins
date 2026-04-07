export type ObjectType = 'People' | 'Company' | 'TradeUnion' | 'Organization';

export interface BaseContact {
    type: ObjectType;
    description?: string;
    lastUpdated?: string;
    tags?: string[];
    country?: string[];
    collections?: string[];
    title?: string;
    aliases?: string[];
}

export interface PeopleContact extends BaseContact {
    type: 'People';
    coverImage?: string;
    phone?: string;
    email?: string;
    role?: string;
    tradeUnion?: string | string[];
    company?: string | string[];
    organization?: string | string[];
    linkedin?: string;
}

export interface CompanyContact extends BaseContact {
    type: 'Company';
    coverImage?: string;
    activeProjects?: string[];
    contactInfo?: string;
    coordinator?: string[];
    website?: string;
    folder?: string;
    management?: string[];
}

export interface TradeUnionContact extends BaseContact {
    type: 'TradeUnion';
    coverImage?: string;
    activeProjects?: string[];
    contactInfo?: string;
    website?: string;
    folder?: string;
    people?: string[];
}

export interface OrganizationContact extends BaseContact {
    type: 'Organization';
    coverImage?: string;
    activeProjects?: string[];
    contactInfo?: string;
    website?: string;
    folder?: string;
    people?: string[];
}

export type Contact = PeopleContact | CompanyContact | TradeUnionContact | OrganizationContact;

export interface ContactCardsSettings {
    enabledContactTypes: ObjectType[];
    peopleFolders: string[];
    companyFolders: string[];
    tradeUnionFolders: string[];
    organizationFolders: string[];
    peopleTemplate: string;
    companyTemplate: string;
    tradeUnionTemplate: string;
    organizationTemplate: string;
    autoCompleteCompanyManagement: boolean;
    autoCompleteTradeUnionPeople: boolean;
    autoCompleteOrganizationPeople: boolean;
}

export const DEFAULT_SETTINGS: ContactCardsSettings = {
    enabledContactTypes: ['People', 'Company', 'TradeUnion', 'Organization'],
    peopleFolders: ['People'],
    companyFolders: ['Companies'],
    tradeUnionFolders: ['TradeUnions'],
    organizationFolders: ['Organizations'],
    autoCompleteCompanyManagement: true,
    autoCompleteTradeUnionPeople: true,
    autoCompleteOrganizationPeople: true,
    peopleTemplate: `---
aliases: []
collections:
company:
country:
coverImage:
description:
email:
lastUpdated:
linkedin:
organization:
phone:
role:
tags:
title:
tradeUnion:
type: People
related: []
---

## Contact Card

## Notes

`,
    companyTemplate: `---
type: Company
coverImage:
description:
lastUpdated:
activeProjects:
contactInfo:
coordinator:
website:
folder:
management:
tags:
country:
collections:
title:
aliases: []
related: []
---

## Contact Card

## Notes

`,
    tradeUnionTemplate: `---
aliases: []
activeProjects:
collections:
contactInfo:
country:
description:
folder:
lastUpdated:
coverImage:
people:
tags:
title:
type: TradeUnion
website:
related: []
---

## Contact Card

## Notes

`,
    organizationTemplate: `---
activeProjects:
aliases: []
collections:
contactInfo:
country:
coverImage:
description:
folder:
lastUpdated:
people:
tags:
title:
type: Organization
website:
related: []
---

## Contact Card

## Notes

`
};

export interface ContactParseResult {
    contact: Contact;
    filename: string;
    path: string;
}

export interface FrontMatterCache {
    [key: string]: any;
}