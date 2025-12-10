import { getRequestConfig } from 'next-intl/server';
import { locales, type Locale } from '@/config/locales';

export default getRequestConfig(async ({ requestLocale }) => {
  // Načti locale z requestu
  let locale = await requestLocale;

  // Validace - pokud locale není podporované, použij výchozí
  if (!locale || !locales.includes(locale as Locale)) {
    locale = 'cs';
  }

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  };
});
