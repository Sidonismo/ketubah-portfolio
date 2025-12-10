import type { CollectionConfig } from 'payload';

// Kolekce pro klíčová slova/tagy
export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: 'Název tagu',
      admin: {
        description: 'např. Tradiční, Moderní, Jeruzalém',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
    },
  ],
};
