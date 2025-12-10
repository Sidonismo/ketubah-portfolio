import type { CollectionConfig } from 'payload';

// Kolekce pro média/obrázky
export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    // Veřejné čtení médií (pro zobrazení obrázků na webu)
    read: () => true,
  },
  upload: {
    staticDir: 'public/media',
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 150,
        height: 150,
        position: 'centre',
      },
      {
        name: 'card',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'full',
        width: 1200,
        height: undefined,
        position: 'centre',
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      label: 'Alternativní text',
      admin: {
        description: 'Popis obrázku pro screen readery a SEO',
      },
    },
  ],
};
