import type { CollectionConfig } from 'payload';

// Kolekce pro dynamické stránky
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: 'Titulek',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        description: 'např. about, faq, cookies, how-to',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      localized: true,
      label: 'Obsah',
    },
    // FAQ sekce (volitelná)
    {
      name: 'faqItems',
      type: 'array',
      label: 'FAQ položky',
      admin: {
        description: 'Pro stránky typu FAQ/HowTo - generuje JSON-LD',
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
          localized: true,
          label: 'Otázka',
        },
        {
          name: 'answer',
          type: 'richText',
          required: true,
          localized: true,
          label: 'Odpověď',
        },
      ],
    },
    // Typ stránky
    {
      name: 'pageType',
      type: 'select',
      label: 'Typ stránky',
      options: [
        { label: 'Běžná stránka', value: 'default' },
        { label: 'FAQ / HowTo', value: 'faq' },
        { label: 'Právní (cookies, GDPR)', value: 'legal' },
      ],
      defaultValue: 'default',
    },
    // Zobrazení v navigaci
    {
      name: 'showInNav',
      type: 'checkbox',
      defaultValue: false,
      label: 'Zobrazit v navigaci',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'showInFooter',
      type: 'checkbox',
      defaultValue: false,
      label: 'Zobrazit v patičce',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'navOrder',
      type: 'number',
      defaultValue: 0,
      label: 'Pořadí v navigaci',
      admin: {
        position: 'sidebar',
      },
    },
    // SEO
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          localized: true,
          label: 'Meta titulek',
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          localized: true,
          label: 'Meta popis',
          admin: {
            description: 'Maximálně 160 znaků',
          },
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          label: 'OG obrázek',
        },
        {
          name: 'noIndex',
          type: 'checkbox',
          defaultValue: false,
          label: 'Neindexovat (noindex)',
        },
      ],
    },
  ],
  timestamps: true,
};
