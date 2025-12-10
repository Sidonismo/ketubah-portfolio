// Konfigurace podporovaných jazyků
export const locales = ['cs', 'en', 'he'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'cs';

export const localeConfig: Record<Locale, {
  name: string;
  nativeName: string;
  isRTL: boolean;
  flag: string;
  defaultCurrency: 'czk' | 'eur' | 'usd';
}> = {
  cs: {
    name: 'Czech',
    nativeName: 'Čeština',
    isRTL: false,
    flag: '🇨🇿',
    defaultCurrency: 'czk',
  },
  en: {
    name: 'English',
    nativeName: 'English',
    isRTL: false,
    flag: '🇬🇧',
    defaultCurrency: 'usd',
  },
  he: {
    name: 'Hebrew',
    nativeName: 'עברית',
    isRTL: true,
    flag: '🇮🇱',
    defaultCurrency: 'usd',
  },
};
