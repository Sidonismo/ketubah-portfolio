# Development Log - Ketubah Eshop

> Průběžný záznam vývoje projektu

---

## 2025-12-10: Inicializace projektu

### Vytvořeno

**Fáze 1 - Základy:**
- Next.js 15.5.7 projekt s TypeScript
- Tailwind CSS 4 konfigurace
- next-intl lokalizace (cs, en, he s RTL podporou)
- Payload CMS 3.x konfigurace s PostgreSQL adaptérem
- Middleware pro i18n routing

**Kolekce Payload CMS:**
- Users - admin uživatelé
- Media - obrázky s automatickými velikostmi (thumbnail, card, full)
- Languages - správa jazyků
- Categories - kategorie produktů
- Colors - předdefinované barvy
- Tags - klíčová slova
- ExchangeRates - kurzy měn z ČNB
- Products - produkty (ketubot) s lokalizací
- Pages - dynamické stránky

**Lib helpers:**
- `payload.ts` - Payload klient singleton
- `meilisearch.ts` - vyhledávání s vícejazyčnou podporou
- `resend.ts` - odesílání kontaktních emailů
- `cnb.ts` - načítání kurzů z ČNB API
- `currency.ts` - převod a formátování cen
- `validations.ts` - Zod schémata
- `utils.ts` - pomocné funkce

**Komponenty:**
- Layout: Header, Footer, LanguageSwitcher, CurrencySwitcher
- Products: ProductCard, ProductGrid, ProductGallery, Pagination
- Search: SearchBar
- SEO: JsonLd, ProductJsonLd, FAQJsonLd, BreadcrumbsJsonLd
- UI: Link (lokalizovaný s automatickým locale prefixem)

**Stránky:**
- `/[locale]` - úvodní stránka s hero sekcí a bento gridem
- `/[locale]/products` - seznam produktů s paginací
- `/[locale]/products/[slug]` - detail produktu s galerií (PhotoSwipe)
- `/[locale]/contact` - kontaktní formulář s honeypot anti-spam
- `/[locale]/not-found` - 404 stránka

**API Routes:**
- `/api/contact` - POST endpoint s rate limiting, Zod validací a Resend integrací

### Opravy a vylepšení

**ProductCard komponenta:**
- Odstraněno "Mám zájem" tlačítko z karet produktů
- Přidán `shortDescription` s line-clamp-2 pro náhled
- Tlačítko "Mám zájem" pouze v detailu produktu (lepší UX)

**Kontaktní formulář:**
- Opravena hydration error způsobená browser extensions (password managery)
- Přidán `suppressHydrationWarning` na všechny input fieldy
- Přidány `autoComplete` atributy pro lepší kompatibilitu

**Google Fonts optimalizace:**
- Implementováno `next/font/google` pro optimální loading
- **Inter** font pro latinkové jazyky (cs, en) - subsets: latin, latin-ext
- **Noto Sans Hebrew** pro hebrejštinu (he) - subsets: hebrew, weights: 400-700
- CSS variables: `--font-sans`, `--font-hebrew`
- Automatické přepínání fontu podle locale (RTL/LTR)
- `display: swap` pro prevenci FOIT (Flash of Invisible Text)

**Dokumentace:**
- ERROR_HANDLING_LOG.md: přidána sekce o next-intl layoutech
- ERROR_HANDLING_LOG.md: přidána mapa API endpointů a health check pattern
- ERROR_HANDLING_LOG.md: přidána sekce o Hydration Errors
- Vytvořen GitHub repozitář `ketubah-portfolio`

**SEO:**
- `sitemap.ts` - dynamická sitemap pro všechny jazyky
- `robots.ts` - robots.txt

### Technické poznámky

- Použit `useSyncExternalStore` pro CurrencySwitcher místo `useEffect` + `setState` (React 19 best practice)
- PhotoSwipe galerie vyžaduje type casting pro Next.js Image ref
- Mock data pro produkty - TODO: napojit na Payload CMS

### Co zbývá

1. ~~Nastavit PostgreSQL databázi~~ ✅
2. ~~Nastavit Payload Admin panel~~ ⚠️ (vytvořeno, ale vyžaduje debugging)
3. Napojit stránky na Payload CMS (nahradit mock data)
4. Vytvořit seed data pro databázi
5. Nastavit Meilisearch a indexování
6. Vytvořit dynamickou stránku `/[locale]/[slug]`
7. Nakonfigurovat Resend doménu
8. Přidat Cookie Consent banner

---

## 2025-12-10 (večer): PostgreSQL a Payload Admin Setup

### PostgreSQL databáze

**Vytvořená databáze:**
- Název: `ketubah_eshop`
- Connection string: `postgresql://elda:dev_password_123@localhost:5432/ketubah_eshop`
- 27 tabulek automaticky vytvořených Payload CMS

**Řešené problémy:**
1. **SCRAM-SHA-256 autentizace** - peer authentication nefungovala s connection pool
   - Řešení: Nastavit heslo pro PostgreSQL uživatele `elda`
   - `ALTER USER elda WITH PASSWORD 'dev_password_123'`
   
2. **SSL/TLS connection** - produkční pool config nepotřebný v local dev
   - Řešení: Přidán `ssl: false` do `payload.config.ts`

**Generovaný PAYLOAD_SECRET:**
```
a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8
```

### Payload Admin Panel

**Vytvořené soubory:**
- `src/app/(payload)/admin/[[...segments]]/page.tsx` - admin route handler
- `src/app/(payload)/layout.tsx` - admin layout wrapper
- `src/app/(payload)/custom.scss` - custom Payload styles (prázdný)

**Aktuální stav:**
- Route vytvořena na `/admin`
- Používá relativní import: `import config from '../../../../../payload.config'`
- ⚠️ **Problém:** Webpack compilation loop s Fast Refresh errors
- ⚠️ **Problém:** CSS import errors z `@payloadcms/next/dist/prod/styles.css`

**Pokus o module resolution:**
1. Přidán alias `@payload-config` do `tsconfig.json` - nefungoval
2. Přidán webpack alias do `next.config.ts` - nefungoval
3. Změněno na relativní importy - stále compilation issues

### Seed Script

**Vytvořeno:**
- `scripts/seed.ts` - populace databáze s výchozími daty
- NPM script: `npm run seed`

**Připravená data:**
- Admin user: `admin@ketubah.cz` / `admin123`
- 3 jazyky (cs, en, he)
- 4 kategorie (Tradiční, Moderní, Abstraktní, Personalizované)
- 8 barev
- 10 tagů
- 1 testovací produkt s lokalizací

**Aktuální stav:**
- ⚠️ Script nemůže načíst env variables z `.env.local`
- Workaround: Hardcoded env vars v souboru (dočasné řešení)
- Nespuštěno kvůli problémům s admin panelem

### Environment Variables (.env.local)

```env
DATABASE_URI=postgresql://elda:dev_password_123@localhost:5432/ketubah_eshop
PAYLOAD_SECRET=a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8
NEXT_PUBLIC_SITE_URL=http://localhost:3000
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_ADMIN_KEY=masterKey
MEILISEARCH_SEARCH_KEY=searchOnlyKey
RESEND_API_KEY=re_Sb66ejh7_DjhtkM8E6jDAHzTzutDYX6yK
CONTACT_EMAIL=sidonismo@gmail.com
```

### Diagnostika a debugging

**Zkušenosti s Payload 3.x + Next.js 15:**
- Module resolution je problematický s App Router
- `@payload-config` alias nefunguje spolehlivě
- Relativní importy fungují lépe ale ne bez komplikací
- CSS importy z Payload packages způsobují webpack errors
- Fast Refresh má problémy s admin routes

**Next steps:**
1. Vyřešit webpack compilation loop
2. Odstranit nebo opravit CSS import issues
3. Úspěšně otevřít admin panel na `/admin`
4. Vytvořit prvního admin uživatele
5. Spustit seed script a naplnit databázi

---

## 2025-12-11: Analýza a plánování seed dat

### Stav projektu

**Kompletnost:** ~92%

| Oblast | Hotovo | Celkem | Stav |
|--------|--------|--------|------|
| Kolekce Payload | 9 | 9 | ✅ 100% |
| Komponenty | 12 | 14 | ⚠️ ~85% |
| Stránky | 5 | 6 | ⚠️ ~83% |
| API Routes | 3 | 3 | ✅ 100% |
| Lib funkce | 8 | 8 | ✅ 100% |

**Blokující problémy:**
1. 🔴 Payload Admin webpack compilation loop
2. 🔴 Databáze prázdná (seed script nespuštěn)
3. 🟡 Meilisearch nenakonfigurován

**Chybějící funkcionality:**
- Filtry produktů (kategorie, barvy, tagy)
- Dynamická stránka `[slug]` napojená na CMS
- Cookie Consent integrace do layoutu
- Payload hooks pro Meilisearch sync

### Rozhodnutí o seed datech

| Položka | Rozhodnutí |
|---------|------------|
| **Obrázky** | Wikimedia Commons (public domain ketubot) |
| **Počet produktů** | 13 produktů |
| **Texty** | Romantické/poetické názvy a popisy (cs/en/he) |
| **Krátký popis** | 1-2 věty, poetický |
| **Dlouhý popis** | Odstavec s technickými detaily |
| **Ceny Giclée** | 3 900 - 8 900 Kč |
| **Ceny Originál** | 15 000 - 45 000 Kč |
| **Stránky** | Home, About, FAQ, Cookies, Privacy |

### Plánované produkty

| # | Slug | Název (CS) | Kategorie |
|---|------|------------|-----------|
| 1 | `eternal-love` | Věčná láska | Tradiční |
| 2 | `garden-of-eden` | Zahrada Eden | Tradiční |
| 3 | `jerusalem-gold` | Jeruzalémské zlato | Tradiční |
| 4 | `tree-of-life` | Strom života | Tradiční |
| 5 | `seven-blessings` | Sedm požehnání | Tradiční |
| 6 | `dancing-hearts` | Tančící srdce | Moderní |
| 7 | `starlight-promise` | Hvězdný slib | Moderní |
| 8 | `ocean-dreams` | Oceánské sny | Moderní |
| 9 | `geometric-harmony` | Geometrická harmonie | Abstraktní |
| 10 | `infinite-circles` | Nekonečné kruhy | Abstraktní |
| 11 | `watercolor-sunset` | Akvarelový západ | Abstraktní |
| 12 | `our-story` | Náš příběh | Personalizované |
| 13 | `two-souls` | Dvě duše | Personalizované |

### Plánované kategorie

| Slug | CS | EN | HE |
|------|----|----|-----|
| `traditional` | Tradiční | Traditional | מסורתי |
| `modern` | Moderní | Modern | מודרני |
| `abstract` | Abstraktní | Abstract | מופשט |
| `personalized` | Personalizované | Personalized | מותאם אישית |

### Další kroky

1. ✅ Opravit Payload Admin panel (webpack loop)
2. ✅ Rozšířit seed script o 13 produktů a stránky
3. ✅ Spustit seed script
4. ⏳ Nakonfigurovat Meilisearch
5. ⏳ Implementovat filtry produktů
6. ⏳ Integrovat CookieConsent do layoutu

---

## 2025-12-10: Oprava Payload Admin + Seed Databáze ✅

### Oprava Payload Admin panelu

**Problém:** ServerFunctionsProvider error - "requires a serverFunction prop"

**Řešení:** Aktualizace `src/app/(payload)/layout.tsx`:
```typescript
// Přidány klíčové importy a funkce:
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import { ServerFunctionClient } from 'payload'
import { importMap } from './admin/importMap'
import '@payloadcms/next/css'

// Přidána serverFunction prop:
const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

// V RootLayout přidáno:
<RootLayout importMap={importMap} config={config} serverFunction={serverFunction}>
```

**Výsledek:** Admin panel nyní funguje na `/admin` ✅

### Seed Script - Kompletní data

**Rozšířený seed script** (`scripts/seed.ts`):
- Přidána funkce `uploadImage()` pro upload obrázků z `public/media/seed/`
- Správná práce s Payload lokalizací (create + update per locale)
- Robustní error handling

**Vytvořená data v databázi:**

| Kolekce | Počet | Poznámka |
|---------|-------|----------|
| **Produkty** | 13 | S obrázky, lokalizované názvy a popisy |
| **Kategorie** | 4 | Tradiční, Moderní, Abstraktní, Personalizované |
| **Barvy** | 12 | gold, blue, green, red, purple, pink, brown, silver, turquoise, orange, black, white |
| **Tagy** | 12 | floral, classic, nature, jerusalem, symbolic, romantic, contemporary, celestial, geometric, minimalist, artistic, custom |
| **Stránky** | 4 | About, FAQ, Cookies, Privacy |
| **Media** | 14 | 13 ketuba obrázků + 1 existující |
| **Uživatelé** | 1 | admin@ketubah.cz |
| **Jazyky** | 3 | cs, en, he |
| **Kurzy měn** | 1 | EUR: 25.2, USD: 23.5 |

**Obrázky produktů:**
- Umístění: `public/media/seed/ketubah-01.jpg` až `ketubah-13.jpg`
- Uživatelsky nahrané reálné fotografie ketubotů
- Alt texty lokalizované pro cs/en/he

**Ceny produktů:**
- Giclée tisky: 3 500 - 7 200 Kč
- Originály: 14 000 - 38 000 Kč

### Technické poznámky - Payload lokalizace

**Důležité:** Payload CMS neakceptuje lokalizovaná data jako objekt `{ cs: ..., en: ..., he: ... }` při `create()`.

Správný postup:
1. `create()` s daty v default locale (cs)
2. `update()` s `locale: 'en'` pro anglická data
3. `update()` s `locale: 'he'` pro hebrejská data

Příklad:
```typescript
// 1. Vytvoření v CS
const created = await payload.create({
  collection: 'categories',
  data: { slug: 'traditional', name: 'Tradiční' },
});

// 2. Aktualizace EN
await payload.update({
  collection: 'categories',
  id: created.id,
  data: { name: 'Traditional' },
  locale: 'en',
});

// 3. Aktualizace HE
await payload.update({
  collection: 'categories',
  id: created.id,
  data: { name: 'מסורתי' },
  locale: 'he',
});
```

### Přihlašovací údaje

```
Email: admin@ketubah.cz
Heslo: admin123
URL: http://localhost:3000/admin
```

### Další kroky

1. ⏳ Nakonfigurovat Meilisearch (Docker container, indexování)
2. ⏳ Implementovat filtry produktů na stránce `/products`
3. ⏳ Napojit stránky na CMS data (nahradit mock data)
4. ⏳ Integrovat CookieConsent komponentu do layoutu
5. ⏳ Přidat Payload hooks pro automatickou Meilisearch synchronizaci

---

*Poslední aktualizace: 2025-12-10 14:00*
