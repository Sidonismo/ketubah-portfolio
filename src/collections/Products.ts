import type { CollectionConfig } from 'payload';

// Kolekce pro produkty (ketubot)
export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'popularity', 'createdAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: 'Název',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
      label: 'Popis',
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      localized: true,
      label: 'Krátký popis',
      admin: {
        description: 'Maximálně 200 znaků',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      label: 'Kategorie',
    },
    // Ceny (admin zadává pouze CZK, EUR/USD se přepočítává automaticky)
    {
      name: 'prices',
      type: 'group',
      label: 'Ceny',
      fields: [
        {
          name: 'giclee',
          type: 'number',
          min: 0,
          label: 'Giclée tisk (CZK)',
          admin: {
            description: 'Cena v CZK - EUR/USD se přepočítá automaticky podle kurzů ČNB',
          },
        },
        {
          name: 'gicleeAvailable',
          type: 'checkbox',
          defaultValue: true,
          label: 'Giclée tisk k dispozici',
        },
        {
          name: 'original',
          type: 'number',
          min: 0,
          label: 'Originál (CZK)',
          admin: {
            description: 'Cena v CZK - EUR/USD se přepočítá automaticky podle kurzů ČNB',
          },
        },
        {
          name: 'originalAvailable',
          type: 'checkbox',
          defaultValue: true,
          label: 'Originál k dispozici',
        },
      ],
    },
    // Rozměry produktu
    {
      name: 'dimensions',
      type: 'group',
      label: 'Rozměry',
      fields: [
        {
          name: 'width',
          type: 'number',
          min: 0,
          label: 'Šířka (cm)',
        },
        {
          name: 'height',
          type: 'number',
          min: 0,
          label: 'Výška (cm)',
        },
        {
          name: 'unit',
          type: 'select',
          defaultValue: 'cm',
          options: [
            { label: 'cm', value: 'cm' },
            { label: 'in', value: 'in' },
          ],
        },
      ],
    },
    // Obrázky
    {
      name: 'images',
      type: 'array',
      required: true,
      minRows: 1,
      label: 'Obrázky',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
          localized: true,
          required: true,
          label: 'Alternativní text',
        },
        {
          name: 'isMain',
          type: 'checkbox',
          defaultValue: false,
          label: 'Hlavní obrázek',
        },
      ],
    },
    // Popularita
    {
      name: 'popularity',
      type: 'number',
      min: 0,
      max: 5,
      defaultValue: 0,
      label: 'Popularita',
      admin: {
        position: 'sidebar',
        description: 'Hodnocení 0-5 hvězdiček pro řazení na úvodní stránce',
      },
    },
    // Dostupnost
    {
      name: 'inStock',
      type: 'checkbox',
      defaultValue: true,
      label: 'Skladem',
      admin: {
        position: 'sidebar',
      },
    },
    // Tagy (klíčová slova)
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      label: 'Klíčová slova',
      admin: {
        description: 'Klíčová slova pro filtrování a zobrazení na detailu',
      },
    },
    // Barvy produktu
    {
      name: 'colors',
      type: 'relationship',
      relationTo: 'colors',
      hasMany: true,
      label: 'Barvy',
      admin: {
        description: 'Barevná paleta produktu pro filtrování a zobrazení',
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
      ],
    },
  ],
  timestamps: true,
};
