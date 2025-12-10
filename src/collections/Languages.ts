import type { CollectionConfig } from 'payload';

// Kolekce pro správu jazyků
export const Languages: CollectionConfig = {
  slug: 'languages',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      label: 'Kód jazyka',
      admin: {
        description: 'např. cs, en, he, de',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Název jazyka',
      admin: {
        description: 'např. Čeština, English, עברית',
      },
    },
    {
      name: 'nativeName',
      type: 'text',
      required: true,
      label: 'Název v daném jazyce',
    },
    {
      name: 'isRTL',
      type: 'checkbox',
      defaultValue: false,
      label: 'RTL jazyk',
      admin: {
        description: 'Zaškrtněte pro hebrejštinu, arabštinu atd.',
      },
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
      label: 'Výchozí jazyk',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Aktivní',
    },
    {
      name: 'flagEmoji',
      type: 'text',
      label: 'Emoji vlajky',
      admin: {
        description: 'např. 🇨🇿, 🇬🇧, 🇮🇱',
      },
    },
    {
      name: 'defaultCurrency',
      type: 'select',
      required: true,
      label: 'Výchozí měna',
      options: [
        { label: 'CZK', value: 'czk' },
        { label: 'EUR', value: 'eur' },
        { label: 'USD', value: 'usd' },
      ],
      admin: {
        description: 'Výchozí měna pro daný jazyk',
      },
    },
  ],
};
