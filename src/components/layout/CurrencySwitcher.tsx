'use client';

import { useSyncExternalStore } from 'react';
import { useLocale } from 'next-intl';
import Cookies from 'js-cookie';
import { type Currency, getDefaultCurrency, currencySymbols } from '@/lib/currency';

const CURRENCY_COOKIE = 'preferred_currency';
const currencies: Currency[] = ['czk', 'eur', 'usd'];

// External store pro měnu - řeší SSR hydration
let currentCurrency: Currency | null = null;
const listeners = new Set<() => void>();

function getCurrencySnapshot(): Currency | null {
  return currentCurrency;
}

function getCurrencyServerSnapshot(): Currency | null {
  return null; // Na serveru nemáme přístup k cookies
}

function subscribeToCurrency(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function setCurrencyValue(value: Currency) {
  currentCurrency = value;
  Cookies.set(CURRENCY_COOKIE, value, { expires: 365 });
  listeners.forEach((listener) => listener());
}

function initCurrency(defaultCurrency: Currency) {
  if (currentCurrency !== null) return;

  if (typeof window !== 'undefined') {
    const saved = Cookies.get(CURRENCY_COOKIE) as Currency | undefined;
    currentCurrency = saved && currencies.includes(saved) ? saved : defaultCurrency;
  }
}

export function CurrencySwitcher() {
  const locale = useLocale();
  const defaultCurrency = getDefaultCurrency(locale);

  // Inicializace při prvním renderování
  initCurrency(defaultCurrency);

  const currency = useSyncExternalStore(
    subscribeToCurrency,
    getCurrencySnapshot,
    getCurrencyServerSnapshot
  );

  // Fallback na default pokud ještě není načteno
  const displayCurrency = currency ?? defaultCurrency;

  const handleChange = (newCurrency: Currency) => {
    setCurrencyValue(newCurrency);
  };

  return (
    <div className="relative">
      <select
        value={displayCurrency}
        onChange={(e) => handleChange(e.target.value as Currency)}
        className="appearance-none bg-transparent border border-gray-300 rounded px-3 py-1 pr-8 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {currencies.map((curr) => (
          <option key={curr} value={curr}>
            {currencySymbols[curr]} {curr.toUpperCase()}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );
}

// Hook pro získání aktuální měny
export function useCurrency(): Currency {
  const locale = useLocale();
  const defaultCurrency = getDefaultCurrency(locale);

  initCurrency(defaultCurrency);

  const currency = useSyncExternalStore(
    subscribeToCurrency,
    getCurrencySnapshot,
    getCurrencyServerSnapshot
  );

  return currency ?? defaultCurrency;
}
