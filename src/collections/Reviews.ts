import type { CollectionConfig } from 'payload';

// Kolekce pro recenze od zákazníků
export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'rating', 'product', 'publishedAt', 'status'],
    description: 'Zákaznické recenze - měly by být schváleny před publikací',
  },
  fields: [
    {
      name: 'authorName',
      type: 'text',
      required: true,
      label: 'Jméno autora',
      admin: {
        description: 'Jméno zákazníka, který zanechal recenzi',
      },
    },
    {
      name: 'authorEmail',
      type: 'email',
      required: true,
      label: 'E-mail autora',
      admin: {
        description: 'Nebudeme zveřejňovat, jen pro ověření',
      },
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      required: true,
      label: 'Hodnocení (1-5 hvězd)',
      admin: {
        step: 1,
        description: '1 = špatné, 5 = vynikající',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Nadpis recenze',
      admin: {
        description: 'Krátký shrnutí (např. "Překrásná a rychlá dodávka")',
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      label: 'Text recenze',
      admin: {
        description: 'Detailní popis zkušenosti',
      },
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      label: 'Produkt (nepovinný)',
      admin: {
        description: 'Pokud se recenze týká konkrétního produktu',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Čeká na schválení', value: 'pending' },
        { label: 'Zveřejněno', value: 'published' },
        { label: 'Odmítnuto', value: 'rejected' },
      ],
      defaultValue: 'pending',
      required: true,
      label: 'Stav',
      admin: {
        description: 'Pouze "Zveřejněno" se zobrazí na webu',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Datum publikace',
      admin: {
        description: 'Automaticky se vyplní při změně na "Zveřejněno"',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Zvýraznit recenzi',
      admin: {
        description: 'Zaškrtnutím se tato recenze zobrazí na homepage',
      },
      defaultValue: false,
    },
  ],
  timestamps: true,
};
