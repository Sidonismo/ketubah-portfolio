import type { CollectionConfig } from 'payload';

// Kolekce pro kategorie produktů
export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: 'Název kategorie',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        description: 'URL-friendly název (např. traditional, modern)',
      },
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
      label: 'Popis',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Obrázek kategorie',
    },
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
        },
      ],
    },
  ],
};
