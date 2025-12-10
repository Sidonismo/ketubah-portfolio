import type { CollectionConfig } from 'payload';

// Kolekce pro předdefinované barvy
export const Colors: CollectionConfig = {
  slug: 'colors',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: 'Název barvy',
      admin: {
        description: 'např. Zlatá, Modrá, Červená',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        description: 'např. gold, blue, red',
      },
    },
    {
      name: 'hexCode',
      type: 'text',
      required: true,
      label: 'HEX kód',
      admin: {
        description: 'např. #FFD700, #0000FF, #FF0000',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: 'Pořadí',
      admin: {
        description: 'Pro řazení v UI',
      },
    },
  ],
};
