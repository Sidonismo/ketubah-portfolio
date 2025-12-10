import type { CollectionConfig } from 'payload';

// Kolekce pro kurzy měn z ČNB
export const ExchangeRates: CollectionConfig = {
  slug: 'exchange-rates',
  admin: {
    useAsTitle: 'date',
  },
  fields: [
    {
      name: 'date',
      type: 'date',
      required: true,
      unique: true,
      label: 'Datum',
    },
    {
      name: 'eurRate',
      type: 'number',
      required: true,
      label: 'Kurz EUR',
      admin: {
        description: 'Kolik CZK za 1 EUR',
      },
    },
    {
      name: 'usdRate',
      type: 'number',
      required: true,
      label: 'Kurz USD',
      admin: {
        description: 'Kolik CZK za 1 USD',
      },
    },
    {
      name: 'source',
      type: 'text',
      defaultValue: 'CNB',
      label: 'Zdroj',
    },
  ],
};
