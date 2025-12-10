import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/config/locales';

// Payload CMS 3.x má vlastní vestavěnou autentizaci
// Pro admin routes není potřeba custom JWT middleware - Payload to řeší interně
// Middleware pouze zajišťuje i18n routing pro veřejné stránky

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export const config = {
  // Vyloučit statické soubory, media, admin a API cesty
  matcher: ['/((?!_next|media|admin|api|favicon.ico).*)'],
};
