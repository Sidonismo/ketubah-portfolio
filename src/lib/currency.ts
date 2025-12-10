import type { ExchangeRates } from './cnb';

export type Currency = 'czk' | 'eur' | 'usd';

// Převod ceny z CZK na cílovou měnu
export function convertPrice(
  priceInCZK: number,
  targetCurrency: Currency,
  rates: ExchangeRates
): number {
  switch (targetCurrency) {
    case 'czk':
      return priceInCZK;
    case 'eur':
      return Math.round(priceInCZK / rates.eurRate);
    case 'usd':
      return Math.round(priceInCZK / rates.usdRate);
    default:
      return priceInCZK;
  }
}

// Formátovače pro jednotlivé měny
const formatters: Record<Currency, Intl.NumberFormat> = {
  czk: new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }),
  eur: new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }),
  usd: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }),
};

// Formátování ceny
export function formatPrice(price: number, currency: Currency): string {
  return formatters[currency].format(price);
}

// Formátování ceny s převodem
export function formatConvertedPrice(
  priceInCZK: number,
  targetCurrency: Currency,
  rates: ExchangeRates
): string {
  const converted = convertPrice(priceInCZK, targetCurrency, rates);
  return formatPrice(converted, targetCurrency);
}

// Symboly měn
export const currencySymbols: Record<Currency, string> = {
  czk: 'Kč',
  eur: '€',
  usd: '$',
};

// Výchozí měna podle locale
export function getDefaultCurrency(locale: string): Currency {
  switch (locale) {
    case 'cs':
      return 'czk';
    case 'en':
    case 'he':
    default:
      return 'usd';
  }
}
