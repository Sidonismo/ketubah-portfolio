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
        height: 200,
        position: 'centre',
      },
      {
        // Karta produktu - vertikální formát pro ketubot (3:4)
        name: 'card',
        width: 400,
        height: 533,
        position: 'centre',
      },
      {
        // Plná velikost - zachová originální poměr stran
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
