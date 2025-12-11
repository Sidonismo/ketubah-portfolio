# PRD: Vícejazyčný Eshop s Portfoliem Ketubot

## 1. Přehled projektu

### 1.1 Popis
Moderní, responzivní a SEO-friendly eshop pro prodej Giclée tisků a originálních obrazů ketubot (židovských svatebních smluv). Aplikace podporuje vícejazyčnost včetně RTL jazyků, obsahuje plnotextové vyhledávání a administrační rozhraní pro správu obsahu.

### 1.2 Technologický stack
- **Framework:** Next.js 15+ s Edge Runtime
- **Lokalizace:** next-intl
- **CMS/Admin:** Payload CMS 3.x
- **Databáze:** PostgreSQL (Vercel Postgres nebo vlastní)
- **Vyhledávání:** Meilisearch (OSS, self-hosted)
- **Email:** Resend API
- **Autentizace:** Payload CMS built-in auth (využívá vestavěnou JWT autentizaci)
- **Validace:** Zod schemas
- **Styling:** Tailwind CSS

### 1.3 Terminologie
- **Ketuba** (jednotné číslo) / **Ketubot** (množné číslo) - židovská svatební smlouva
- **Giclée** - vysoce kvalitní inkoustový tisk

---

## 2. Architektura

### 2.1 Struktura projektu
```
ketubah-eshop/
├── src/
│   ├── app/
│   │   ├── (payload)/                  # Payload CMS admin (route group)
│   │   │   ├── admin/[[...segments]]/page.tsx
│   │   │   ├── api/[...slug]/route.ts  # Payload REST API
│   │   │   └── layout.tsx
│   │   ├── [locale]/
│   │   │   ├── page.tsx                # Úvodní stránka
│   │   │   ├── layout.tsx              # Locale layout
│   │   │   ├── loading.tsx             # Global loading skeleton
│   │   │   ├── not-found.tsx           # 404 stránka
│   │   │   ├── [slug]/page.tsx         # Dynamické stránky (O mně, FAQ...)
│   │   │   ├── contact/page.tsx        # Kontaktní formulář
│   │   │   └── products/
│   │   │       ├── page.tsx            # Seznam produktů (paginated)
│   │   │       ├── loading.tsx         # Products loading skeleton
│   │   │       └── [slug]/
│   │   │           ├── page.tsx        # Detail produktu
│   │   │           └── loading.tsx     # Product detail skeleton
│   │   ├── api/
│   │   │   ├── search/route.ts         # Meilisearch API endpoint
│   │   │   ├── contact/route.ts        # Resend email endpoint
│   │   │   └── cron/exchange-rates/route.ts  # ČNB kurzy cron
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   ├── layout.tsx                  # Root layout
│   │   └── error.tsx                   # Error boundary
│   ├── collections/
│   │   ├── Users.ts
│   │   ├── Products.ts
│   │   ├── Media.ts
│   │   ├── Pages.ts
│   │   ├── Categories.ts
│   │   ├── Languages.ts
│   │   ├── Colors.ts
│   │   ├── Tags.ts
│   │   ├── ExchangeRates.ts
│   │   └── index.ts                    # Re-export všech kolekcí
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   └── CurrencySwitcher.tsx
│   │   ├── products/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGallery.tsx      # PhotoSwipe lightbox
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductFilters.tsx      # Filtry kategorií
│   │   │   └── Pagination.tsx
│   │   ├── search/
│   │   │   └── SearchBar.tsx
│   │   ├── seo/
│   │   │   ├── JsonLd.tsx
│   │   │   ├── ProductJsonLd.tsx
│   │   │   ├── FAQJsonLd.tsx
│   │   │   └── BreadcrumbsJsonLd.tsx
│   │   └── ui/
│   │       ├── Link.tsx                # Lokalizovaný link
│   │       ├── CookieConsent.tsx
│   │       └── NavigationProgress.tsx  # Loading bar při navigaci
│   ├── lib/
│   │   ├── i18n.ts
│   │   ├── payload.ts
│   │   ├── queries.ts                  # CMS query helpers
│   │   ├── meilisearch.ts
│   │   ├── resend.ts
│   │   ├── cnb.ts
│   │   ├── currency.ts
│   │   ├── validations.ts              # Zod schemas
│   │   └── utils.ts
│   ├── config/
│   │   ├── locales.ts
│   │   └── site.ts
│   ├── messages/
│   │   ├── cs.json
│   │   ├── en.json
│   │   └── he.json
│   └── middleware.ts
├── docs/                               # Dokumentace
├── scripts/
│   └── seed.ts                         # Seed script pro DB
├── public/
│   └── media/                          # Uploadnuté obrázky
├── payload.config.ts
├── tailwind.config.ts
└── .env.local
```

### 2.2 Environment Variables
```env
# Databáze
DATABASE_URI=postgresql://user:password@localhost:5432/ketubah_eshop

# Payload CMS (využívá vlastní JWT, nepotřebuje separátní JWT_SECRET)
PAYLOAD_SECRET=min_32_znaku_nahodny_retezec

# Veřejná URL
NEXT_PUBLIC_SITE_URL=https://example.com

# Meilisearch (volitelné - fallback na PostgreSQL LIKE)
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_ADMIN_KEY=masterKey

# Resend (email)
RESEND_API_KEY=re_...
CONTACT_EMAIL=info@example.com
```

---

## 3. Datový model (Payload Collections)

### 3.1 Users (Administrátoři)
```typescript
// collections/Users.ts
{
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      options: [
        { label: 'Admin', value: 'admin' },
      ],
    },
  ],
}
```

### 3.2 Languages (Jazyky)
```typescript
// collections/Languages.ts
{
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
      // např. 'cs', 'en', 'he', 'de'
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      // např. 'Čeština', 'English', 'עברית'
    },
    {
      name: 'nativeName',
      type: 'text',
      required: true,
      // název jazyka v daném jazyce
    },
    {
      name: 'isRTL',
      type: 'checkbox',
      defaultValue: false,
      // true pro hebrejštinu, arabštinu atd.
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'flagEmoji',
      type: 'text',
      // např. '🇨🇿', '🇬🇧', '🇮🇱'
    },
    {
      name: 'defaultCurrency',
      type: 'select',
      required: true,
      options: [
        { label: 'CZK', value: 'czk' },
        { label: 'EUR', value: 'eur' },
        { label: 'USD', value: 'usd' },
      ],
      // Výchozí měna pro daný jazyk (cs→CZK, en→USD, he→USD)
    },
  ],
}
```

**Workflow správy jazyků:**
1. Admin přidá/odebere jazyk v kolekci Languages
2. Admin vyplní překlady pro produkty a stránky v novém jazyce
3. Po dokončení překladů → redeploy aplikace
4. Jazyk se zobrazí na webu až po redeploy a pouze pokud má `isActive: true`

**Poznámka:** Jazyk se na webu zobrazí pouze tehdy, když:
- Je `isActive: true` v databázi
- Existují překlady UI v `messages/{locale}.json`
- Proběhl redeploy aplikace

**Synchronizace s config/locales.ts:**
- `config/locales.ts` definuje statický seznam jazyků pro build-time
- Kolekce Languages v DB slouží pro runtime metadata (flagEmoji, defaultCurrency, isRTL)
- Při přidání nového jazyka je třeba aktualizovat obojí a provést redeploy

### 3.3 Media (Obrázky)
```typescript
// collections/Media.ts
{
  slug: 'media',
  access: {
    // Veřejné čtení médií (pro zobrazení obrázků na webu)
    read: () => true,
  },
  upload: {
    staticDir: 'public/media',
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 150,
        height: 150,
        position: 'centre',
      },
      {
        name: 'card',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'full',
        width: 1200,
        height: undefined,
        position: 'centre',
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      label: 'Alternativní text',
      admin: {
        description: 'Popis obrázku pro screen readery a SEO',
      },
    },
  ],
}
```

### 3.4 Colors (Předdefinované barvy)
```typescript
// collections/Colors.ts
{
  slug: 'colors',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      // např. 'Zlatá', 'Modrá', 'Červená'
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      // např. 'gold', 'blue', 'red'
    },
    {
      name: 'hexCode',
      type: 'text',
      required: true,
      // např. '#FFD700', '#0000FF', '#FF0000'
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      // Pro řazení v UI
    },
  ],
}
```

### 3.5 Tags (Klíčová slova)
```typescript
// collections/Tags.ts
{
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      // např. 'Tradiční', 'Moderní', 'Jeruzalém'
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
  ],
}
```

### 3.6 Categories (Kategorie produktů)
```typescript
// collections/Categories.ts
{
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          localized: true,
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          localized: true,
        },
      ],
    },
  ],
}
```

### 3.7 Products (Produkty - Ketubot)
```typescript
// collections/Products.ts
import { lexicalEditor } from '@payloadcms/richtext-lexical';

{
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
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
      editor: lexicalEditor(),
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      localized: true,
      maxLength: 200,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
    },
    // Ceny (admin zadává pouze CZK, EUR/USD se přepočítává automaticky)
    {
      name: 'prices',
      type: 'group',
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
      admin: {
        description: 'Barevná paleta produktu pro filtrování a zobrazení',
      },
    },
    // SEO
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          localized: true,
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          localized: true,
          maxLength: 160,
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
  timestamps: true,
}
```

### 3.8 ExchangeRates (Kurzy měn)
```typescript
// collections/ExchangeRates.ts
{
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
    },
    {
      name: 'eurRate',
      type: 'number',
      required: true,
      // Kurz CZK/EUR z ČNB
    },
    {
      name: 'usdRate',
      type: 'number',
      required: true,
      // Kurz CZK/USD z ČNB
    },
    {
      name: 'source',
      type: 'text',
      defaultValue: 'CNB',
    },
  ],
}
```

### 3.9 Pages (Dynamické stránky)
```typescript
// collections/Pages.ts
{
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      // např. 'about', 'faq', 'cookies', 'how-to'
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      localized: true,
      editor: lexicalEditor(),
    },
    // FAQ sekce (volitelná)
    {
      name: 'faqItems',
      type: 'array',
      label: 'FAQ položky',
      admin: {
        description: 'Pro stránky typu FAQ/HowTo - generuje JSON-LD',
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'answer',
          type: 'richText',
          required: true,
          localized: true,
        },
      ],
    },
    // Typ stránky
    {
      name: 'pageType',
      type: 'select',
      options: [
        { label: 'Běžná stránka', value: 'default' },
        { label: 'FAQ / HowTo', value: 'faq' },
        { label: 'Právní (cookies, GDPR)', value: 'legal' },
      ],
      defaultValue: 'default',
    },
    // Zobrazení v navigaci
    {
      name: 'showInNav',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'showInFooter',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'navOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
    // SEO
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          localized: true,
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          localized: true,
          maxLength: 160,
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'noIndex',
          type: 'checkbox',
          defaultValue: false,
          label: 'Neindexovat (noindex)',
        },
      ],
    },
  ],
  timestamps: true,
}
```

---

## 4. Design Inspiration (Reference Screenshots)

### 4.1 Homepage
**Vizuální reference:** Dynamický, umělecký design s důrazem na portfolio.

**Hero sekce:**
- Dvousloupcový layout: Text vlevo (40%) | Featured obrázek vpravo (60%)
- "Nejnovější práce" badge (žlutý, malý štítek)
- Velký nadpis (h1, bold, černý)
- Krátký popis služeb (šedý text)
- "Prohlédnout portfolio" tlačítko (outlined, černé)
- Velký featured obrázek ketuby (zaoblené rohy)

**Nejpopulárnější ketubot sekce:**
- Nadpis "Nejpopulárnější ketubot" (velký, bold)
- Podnadpis s krátkým popisem
- **Bento/Masonry grid layout:**
  - Různě velké karty (některé 2x2, některé 1x1, některé 2x1)
  - Karty s obrázky přes celou plochu
  - Název produktu overlay v levém dolním rohu (bílý text na tmavém)
  - Hover efekt: jemné ztmavení nebo scale
- Grid 3-4 produktů s nejvyšší popularitou (popularity >= 4)
- Kliknutí → detail produktu
- Grid příklad (inspirace):
  ```
  ┌────────────┬──────┐
  │            │  B   │
  │     A      ├──────┤
  │   (2x2)    │  C   │
  ├──────┬─────┴──────┤
  │  D   │     E      │
  └──────┴───────────-┘
  ```

### 4.2 Seznam produktů (Portfolio)
**Vizuální reference:** Moderní, čistý design s důrazem na produktové obrázky.

**Layout:**
- Čistý bílý background s minimalistickým designem
- Grid 3 sloupce (responsive: 2 na tabletu, 1 na mobilu)
- Breadcrumbs navigace (Domů / Portfolio)
- Tlačítko "Filtry" vpravo nahoře

**Header:**
- Logo vlevo
- Horizontální navigace (Domů, O mně, Portfolio, Kontakt)
- Přepínač jazyků
- Přepínač měn (CZK/EUR/USD)
- Social media ikony (Instagram)

**Produktová karta:**
- Obrázek produktu v černém rámu (simulace zarámovaného obrazu)
- Světle šedé pozadí obrázku
- Název produktu pod obrázkem (tmavý text)
- Cena (tučně) ve vybrané měně
- "Mám zájem" tlačítko (žluté, full-width)
- "Originál dostupný" badge (volitelný, zelený štítek)

**Filtry:**
- Kategorie (dropdown/checkboxy)
- Barvy (color swatches)
- Klíčová slova (tagy)

**Footer:**
- Tmavé pozadí (téměř černé)
- Logo a tagline vlevo
- Sloupce odkazů (O mně, FAQ | Právní, Cookies, Ochrana soukromí)
- Copyright text

**Barevná paleta:**
- Primární: Žlutá (#FFE500 nebo podobná) pro CTA
- Pozadí: Bílá (#FFFFFF)
- Text: Tmavě šedá/černá
- Footer: Tmavě šedá (#1A1A1A)
- Akcenty: Černá pro rámy a badges

### 4.3 Detail produktu
**Vizuální reference:** Dvousloupcový layout s galerií a informacemi.

**Layout:**
- Breadcrumbs (Domů / Kategorie / Název produktu)
- Dva sloupce: Galerie (40-50%) | Info (50-60%)
- Pod hlavním obsahem: Popis + Související produkty

**Galerie (levý sloupec):**
- Hlavní velký obrázek s ikonou lupy (lightbox/zoom)
- Thumbnail galerie pod hlavním obrázkem (dynamický počet podle nahraných obrázků)
- Aktivní thumbnail zvýrazněn
- Klik na thumbnail → změna hlavního obrázku

**Produktové info (pravý sloupec):**
- Kategorie tagy nahoře - malé štítky
- Ceny: Giclée tisk / Originál (ve vybrané měně)
- Název produktu (h1, velký)
- Krátký popis (šedý text, 2-3 řádky)
- "Mám zájem" tlačítko (žluté) → otevře kontaktní formulář s předvyplněným produktem
- Tagy/klíčová slova produktu (malé pill badges)
- Barevná paleta produktu (color swatches)

**Sekce popisu:**
- Nadpis "Popis"
- Dlouhý popis produktu (richText)
- Informace o technice, rozměrech
- Sekce o autorovi

**Související produkty:**
- Nadpis "Související ketubot"
- Horizontální scroll nebo grid max 4 produkty
- Menší produktové karty (obrázek, název, cena, "Mám zájem")

### 4.4 Tailwind CSS implementace
```css
/* Primární barvy */
--color-primary: #FFE500;      /* Žlutá pro CTA */
--color-primary-hover: #E6CE00;
--color-text: #1A1A1A;         /* Tmavý text */
--color-text-muted: #6B7280;   /* Šedý text */
--color-background: #FFFFFF;   /* Bílé pozadí */
--color-footer: #1A1A1A;       /* Tmavá patička */
--color-card-bg: #F5F5F5;      /* Pozadí karet */
--color-frame: #000000;        /* Černé rámy */
```

### 4.5 Wireframe komponenty

**ProductCard.tsx:**
```
┌─────────────────────────┐
│ [Originál]              │  ← Badge (volitelný, pokud je originál dostupný)
│  ┌───────────────────┐  │
│  │                   │  │
│  │    [Obrázek]      │  │  ← Obrázek v černém rámu
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  Název produktu         │  ← Název (font-medium)
│  Krátký popis...        │  ← shortDescription (line-clamp-2)
│  od 5 900 Kč            │  ← Cena (ve vybrané měně)
│                         │
└─────────────────────────┘
```
**Poznámka:** Tlačítko "Mám zájem" je pouze na detailu produktu (lepší UX).

**ProductGallery.tsx:**
```
┌─────────────────────────────┐
│                         [🔍]│  ← Zoom icon
│                             │
│      [Hlavní obrázek]       │
│                             │
│                             │
└─────────────────────────────┘
┌────┐┌────┐┌────┐┌────┐┌────┐
│ 1  ││ 2  ││ 3  ││ ...│     │  ← Thumbnails (dynamický počet)
└────┘└────┘└────┘└────┘
```

**Homepage Hero:**
```
┌─────────────────────────────────────────────────────────┐
│ [Nejnovější práce]                                      │
│                          ┌────────────────────────┐     │
│ Ketubah Art              │                        │     │
│ Studio                   │   [Featured Ketuba]    │     │
│                          │                        │     │
│ Krátký popis služeb...   │                        │     │
│                          └────────────────────────┘     │
│ ┌───────────────────┐                                   │
│ │ Prohlédnout portfolio │                               │
│ └───────────────────┘                                   │
└─────────────────────────────────────────────────────────┘
```

### 4.6 Responzivní breakpointy
- **Desktop (≥1024px):** 3 sloupce grid, 2 sloupce detail, bento grid
- **Tablet (768-1023px):** 2 sloupce grid, 1 sloupec detail (galerie nahoře)
- **Mobile (<768px):** 1 sloupec grid, 1 sloupec detail, vertikální stack

### 4.7 Interakce a animace
- Hover na kartě: jemný shadow/scale (transform: scale(1.02))
- Hover na "Mám zájem" tlačítku: tmavší žlutá
- Thumbnail click: okamžitá změna hlavního obrázku
- **Lightbox:** react-photoswipe-gallery (PhotoSwipe v5 wrapper)
  - SSR friendly
  - Gesture support (zoom, swipe)
  - Keyboard navigation
  ```bash
  npm install photoswipe react-photoswipe-gallery
  ```
- Smooth scroll pro related products na mobilu
- Bento grid: hover overlay s názvem produktu

---

## 5. Frontend implementace

### 5.1 Lokalizace a i18n

#### config/locales.ts
```typescript
export const locales = ['cs', 'en', 'he'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'cs';

export const localeConfig: Record<Locale, {
  name: string;
  nativeName: string;
  isRTL: boolean;
  flag: string;
}> = {
  cs: { name: 'Czech', nativeName: 'Čeština', isRTL: false, flag: '🇨🇿' },
  en: { name: 'English', nativeName: 'English', isRTL: false, flag: '🇬🇧' },
  he: { name: 'Hebrew', nativeName: 'עברית', isRTL: true, flag: '🇮🇱' },
};
```

#### middleware.ts
```typescript
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/config/locales';

// Payload CMS 3.x má vlastní vestavěnou autentizaci
// Pro admin routes není potřeba custom JWT middleware - Payload to řeší interně
// Middleware pouze zajišťuje i18n routing pro veřejné stránky

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Admin routes jsou chráněny přímo Payload CMS autentizací
  // Přeskočíme i18n middleware pro admin a API admin cesty
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    return;
  }

  // i18n routing pro veřejné stránky
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Vyloučit statické soubory a media
    '/((?!_next|media|favicon.ico).*)',
  ],
};
```

### 5.2 Layout s RTL podporou

#### app/[locale]/layout.tsx
```typescript
import { Suspense } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, localeConfig, type Locale } from '@/config/locales';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CookieConsent } from '@/components/ui/CookieConsent';
import { NavigationProgress } from '@/components/ui/NavigationProgress';

// Next.js 15: params je Promise
interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validace locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();
  const config = localeConfig[locale as Locale];
  const dir = config?.isRTL ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body className={`${dir === 'rtl' ? 'font-hebrew' : 'font-sans'}`}>
        <NextIntlClientProvider messages={messages}>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieConsent />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### 5.3 Stránky

#### Úvodní stránka (app/[locale]/page.tsx)
- Hero sekce s hlavním obrázkem
- Sekce "Nejpopulárnější ketubot" (produkty s popularity >= 4)
- Krátký popis služeb
- CTA tlačítka (Prohlédnout portfolio, Kontaktovat)
- JSON-LD: WebSite, Organization

#### Seznam produktů (app/[locale]/products/page.tsx)
- Grid produktových karet (6 na stránku)
- SEO-friendly paginace (`?page=2`)
- Filtrování podle kategorií
- Instant search bar
- Breadcrumbs
- JSON-LD: ItemList, BreadcrumbList

#### Detail produktu (app/[locale]/products/[slug]/page.tsx)
- Galerie obrázků (hlavní + thumbnaily)
- Název, popis (richText)
- Ceny (Giclée / Originál) ve vybrané měně
- Tlačítko "Mám zájem" → kontaktní formulář
- Související produkty
- JSON-LD: Product, Offer, BreadcrumbList

#### Kontaktní formulář (app/[locale]/contact/page.tsx)
- Formulářová pole: jméno, email, předmět, zpráva, product_id (hidden)
- Honeypot field proti spamu
- Rate limiting
- CSRF ochrana
- Validace Zod
- Odeslání přes Resend API

#### Dynamické stránky (app/[locale]/[slug]/page.tsx)
- Obsah z Pages kolekce
- Podmíněné zobrazení FAQ s JSON-LD FAQPage
- Breadcrumbs

#### 404 stránka (app/[locale]/not-found.tsx)
- Vícejazyčná chybová zpráva
- Odkazy na úvodní stránku a produkty
- Vyhledávací pole

### 5.4 SEO komponenty

#### JSON-LD struktury
```typescript
// Product JSON-LD
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "...",
  "description": "...",
  "image": ["..."],
  "offers": {
    "@type": "Offer",
    "price": "...",
    "priceCurrency": "CZK|EUR|USD",
    "availability": "https://schema.org/InStock",
    "url": "..."
  }
}

// FAQ JSON-LD
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "...",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "..."
      }
    }
  ]
}

// Breadcrumbs JSON-LD
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [...]
}
```

### 5.5 Sitemap a Robots

#### app/sitemap.ts
```typescript
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ['cs', 'en', 'he'];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  // Statické stránky
  const staticPages = ['', '/products', '/contact'];
  
  // Dynamické produkty
  const products = await payload.find({ collection: 'products', limit: 1000 });
  
  // Dynamické stránky
  const pages = await payload.find({ collection: 'pages', limit: 100 });
  
  const urls: MetadataRoute.Sitemap = [];
  
  // Generovat URL pro každý jazyk
  for (const locale of locales) {
    // Statické
    for (const page of staticPages) {
      urls.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: page === '' ? 1.0 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map(l => [l, `${baseUrl}/${l}${page}`])
          ),
        },
      });
    }
    
    // Produkty
    for (const product of products.docs) {
      urls.push({
        url: `${baseUrl}/${locale}/products/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
    
    // Dynamické stránky
    for (const page of pages.docs) {
      urls.push({
        url: `${baseUrl}/${locale}/${page.slug}`,
        lastModified: page.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }
  
  return urls;
}
```

#### app/robots.ts
```typescript
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/admin/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

---

## 6. Vyhledávání (Meilisearch)

### 6.1 Indexování (Vícejazyčná strategie)
- **Strategie:** Jeden index s jazykově specifickými poli (localizedAttributes)
- Při vytvoření/aktualizaci produktu → sync do Meilisearch
- Payload hook `afterChange` pro automatickou synchronizaci
- Indexované atributy:
  - `name_cs`, `name_en`, `name_he` (lokalizované názvy)
  - `description_cs`, `description_en`, `description_he`
  - `slug`, `category`, `tags`, `colors`
- Konfigurace lokalizovaných atributů v Meilisearch:
```json
{
  "localizedAttributes": [
    { "locales": ["ces"], "attributePatterns": ["*_cs"] },
    { "locales": ["eng"], "attributePatterns": ["*_en"] },
    { "locales": ["heb"], "attributePatterns": ["*_he"] }
  ]
}
```
- Searchable attributes: name_{locale}, description_{locale}, tags
- Filterable attributes: category, inStock, popularity, colors, tags

### 6.2 Search API endpoint
```typescript
// app/api/search/route.ts
import { meilisearch } from '@/lib/meilisearch';

const LOCALE_TO_FIELD: Record<string, string> = {
  cs: '_cs',
  en: '_en',
  he: '_he',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const locale = searchParams.get('locale') || 'cs';
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
  
  const suffix = LOCALE_TO_FIELD[locale] || '_cs';
  
  const results = await meilisearch.index('products').search(query, {
    limit,
    attributesToRetrieve: [
      `name${suffix}`,
      'slug',
      'images',
      'prices',
      'category'
    ],
    attributesToSearchOn: [`name${suffix}`, `description${suffix}`],
  });
  
  return Response.json(results);
}
```

### 6.3 Frontend komponenta
- Debounced input (200ms)
- SWR/React Query pro caching
- Skeleton loading
- Highlight matching text
- Keyboard navigation (↑↓ Enter)
- Prohledává produkty i FAQ

---

## 7. Měny a kurzy (ČNB)

### 7.1 Přehled
- Admin zadává ceny pouze v CZK
- Ceny v EUR a USD se automaticky přepočítávají podle kurzů ČNB
- Kurzy se aktualizují jednou denně (cron job nebo při prvním requestu dne)
- Výchozí měna se určuje podle zvoleného jazyka:
  - `cs` → CZK
  - `en` → USD  
  - `he` → USD

### 7.2 ČNB API integrace
```typescript
// lib/cnb.ts
const CNB_URL = 'https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt';

interface ExchangeRates {
  date: Date;
  eurRate: number;  // Kolik CZK za 1 EUR
  usdRate: number;  // Kolik CZK za 1 USD
}

export async function fetchCNBRates(): Promise<ExchangeRates> {
  const response = await fetch(CNB_URL);
  const text = await response.text();
  
  // Parsování CNB formátu (pipe-separated values)
  // Vrací kurzy EUR a USD
  // ...
}
```

### 7.3 Převod měn
```typescript
// lib/currency.ts
export type Currency = 'czk' | 'eur' | 'usd';

export function convertPrice(
  priceInCZK: number,
  targetCurrency: Currency,
  rates: { eurRate: number; usdRate: number }
): number {
  switch (targetCurrency) {
    case 'czk':
      return priceInCZK;
    case 'eur':
      return Math.round(priceInCZK / rates.eurRate);
    case 'usd':
      return Math.round(priceInCZK / rates.usdRate);
  }
}

export function formatPrice(price: number, currency: Currency): string {
  const formatters: Record<Currency, Intl.NumberFormat> = {
    czk: new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }),
    eur: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
    usd: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
  };
  return formatters[currency].format(price);
}
```

### 7.4 Cron job pro aktualizaci kurzů
- **Vercel Cron:** `vercel.json` s cron konfiguací pro `/api/cron/exchange-rates`
- **Alternativa:** GitHub Actions workflow spouštěný jednou denně
- Spouští se jednou denně (např. v 8:00 CET)
- Ukládá kurzy do kolekce ExchangeRates
- Fallback: pokud ČNB API není dostupné, použije poslední známé kurzy

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/exchange-rates",
      "schedule": "0 7 * * *"
    }
  ]
}
```

### 7.5 Frontend - přepínač měn
- Výchozí měna podle jazyka (z kolekce Languages - pole defaultCurrency)
- Uživatel může měnu změnit manuálně (uloženo v localStorage)
- Přepínač měn v headeru vedle přepínače jazyků

---

## 8. Kontaktní formulář (Resend)

### 8.1 Validační schema
```typescript
const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(5).max(200),
  message: z.string().min(10).max(5000),
  productId: z.string().optional(),
  honeypot: z.string().max(0), // musí být prázdné
});
```

### 8.2 API endpoint
```typescript
// app/api/contact/route.ts
export async function POST(request: Request) {
  // Rate limiting (např. 5 req/min per IP)
  // CSRF validace
  // Zod validace
  // Honeypot check
  
  const { name, email, subject, message, productId } = await request.json();
  
  await resend.emails.send({
    from: 'noreply@example.com',
    to: process.env.CONTACT_EMAIL,
    subject: `[Kontakt] ${subject}`,
    html: `
      <p><strong>Od:</strong> ${name} (${email})</p>
      <p><strong>Předmět:</strong> ${subject}</p>
      ${productId ? `<p><strong>Produkt:</strong> ${productId}</p>` : ''}
      <p><strong>Zpráva:</strong></p>
      <p>${message}</p>
    `,
    replyTo: email,
  });
  
  return Response.json({ success: true });
}
```

---

## 9. Administrace

### 9.1 Payload Admin UI
- Přístup na `/admin`
- JWT autentizace (24h session)
- Jeden admin uživatel (nepotřebujeme role management)

### 9.2 Správa jazyků
- Přidání nového jazyka v kolekci Languages
- Aktivace/deaktivace jazyků
- RTL flag pro správné zobrazení
- Po přidání jazyka → aktualizovat:
  - `config/locales.ts`
  - `middleware.ts` matcher
  - `messages/{locale}.json`

### 9.3 Workflow přidání produktu
1. Upload obrázků do Media kolekce
2. Vytvoření/výběr kategorie
3. Výběr barev a tagů
4. Vyplnění produktu ve všech aktivních jazycích
5. Nastavení cen v CZK (EUR/USD se přepočítá automaticky)
6. SEO metadata
7. Uložení → automatický sync do Meilisearch

---

## 10. Výkon a optimalizace

### 10.1 Caching strategie
- ISR pro produktové stránky (revalidate: 60s)
- SSG pro statické stránky
- SWR pro search results
- CDN pro media soubory

### 10.2 Obrázky
- next/image s automatickou optimalizací
- AVIF/WebP formáty
- Lazy loading (kromě LCP obrázků)
- Responsive sizes

### 10.3 Core Web Vitals
- Server Components pro rychlý TTFB
- Skeleton komponenty
- next/font s display: swap
- Kritické CSS inline

---

## 11. Bezpečnost

### 11.1 Autentizace
- Payload CMS vestavěná autentizace (interní JWT)
- Secure HTTP-only cookies (spravuje Payload)
- Konfigurovatelná expirace session v `payload.config.ts`
- Pro případy mimo Payload (např. API routes): bcrypt-ts pro Edge Runtime kompatibilitu

```typescript
// Příklad pro Edge Runtime kompatibilní hashování (pokud potřeba mimo Payload)
import { hash, compare } from 'bcrypt-ts';

// Hashování hesla
const hashedPassword = await hash(password, 10);

// Ověření hesla
const isValid = await compare(password, hashedPassword);
```

### 11.2 Ochrana
- CSRF tokeny pro formuláře
- Rate limiting na API endpoints
- Input sanitizace
- SQL injection ochrana (Payload ORM)
- XSS ochrana (React escaping)

### 11.3 Headers
```typescript
// next.config.js
headers: [
  {
    source: '/:path*',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ],
  },
],
```

---

## 12. Testování a monitoring

### 12.1 Testování
- Unit testy: Zod schemas, utility funkce
- Integration testy: API endpoints
- E2E testy: Playwright pro kritické user flows

### 12.2 Monitoring
- Google Search Console
- Bing Webmaster Tools
- GA4 s enhanced e-commerce events
- Lighthouse CI v pipeline

### 12.3 Dokumentace a logy
Dokumentace je ve složce `docs/`:
- `CHANGELOG.md` - přehled změn podle data
- `SETUP.md` - instalace a konfigurace
- `TROUBLESHOOTING.md` - řešení běžných problémů
- `PAYLOAD_NOTES.md` - Payload CMS dokumentace
- `ERROR_HANDLING_LOG.md` - error handling strategie
- Error tracking (Sentry nebo podobné)

---

## 13. Deployment checklist

### 13.1 Pre-deploy
- [ ] Všechny env proměnné nastaveny
- [ ] PostgreSQL připojení ověřeno
- [ ] Meilisearch běží a je nakonfigurován
- [ ] Build bez chyb (`npm run build`)
- [ ] TypeScript bez chyb (`npm run typecheck`)
- [ ] Lint bez chyb (`npm run lint`)

### 13.2 Post-deploy
- [ ] Hlavní stránky načítají (/, /products, /contact)
- [ ] Admin přihlášení funguje
- [ ] Vyhledávání vrací výsledky
- [ ] Kontaktní formulář odesílá emaily
- [ ] Sitemap.xml dostupná
- [ ] Robots.txt správný
- [ ] JSON-LD validní (Rich Results Test)
- [ ] OG tags fungují (Facebook Debugger)

---

## 14. Fáze implementace

### Fáze 1: Základy (Core)
1. Inicializace Next.js projektu
2. Konfigurace Tailwind CSS
3. Nastavení next-intl a základní překlady
4. Konfigurace Payload CMS s PostgreSQL
5. Vytvoření základních kolekcí (Users, Media)
6. Middleware pro i18n a auth

### Fáze 2: Datová vrstva
1. Kolekce Products, Categories, Pages, Languages
2. Kolekce Colors, Tags, ExchangeRates
3. Payload hooks pro validaci
4. Upload a zpracování obrázků
5. Seed data pro testování

### Fáze 3: Měny a kurzy
1. Integrace ČNB API pro kurzy měn
2. Cron job pro denní aktualizaci kurzů
3. Funkce pro převod CZK → EUR/USD
4. Přepínač měn v headeru
5. Ukládání preference měny do localStorage

### Fáze 4: Frontend - Veřejná část
1. Layout komponenty (Header, Footer, Navigation)
2. LanguageSwitcher s RTL podporou
3. CurrencySwitcher komponenta
4. Úvodní stránka
5. Seznam produktů s paginací a filtry (kategorie, barvy, tagy)
6. Detail produktu s galerií
7. Dynamické stránky

### Fáze 5: SEO a vyhledávání
1. generateMetadata pro všechny stránky
2. JSON-LD komponenty
3. Sitemap a robots.txt
4. Meilisearch integrace
5. Search komponenta

### Fáze 6: Kontakt a finalizace
1. Kontaktní formulář + Resend
2. 404 stránka
3. Cookie banner (pokud potřeba)
4. Performance optimalizace
5. Testování a bugfixes

### Fáze 7: Deploy a dokumentace
1. Deployment na Vercel/vlastní server
2. DNS a SSL konfigurace
3. Monitoring setup
4. Dokumentace pro admina
5. DEVELOPMENT_LOG aktualizace

---

## 15. Příkazy pro vývoj

```bash
# Instalace závislostí
npm install

# Development server
npm run dev

# Build
npm run build

# Type check
npm run typecheck

# Lint
npm run lint

# Vyčistit cache
rm -rf .next

# Payload generate types
npm run payload:generate-types

# Meilisearch reindex
npm run meilisearch:reindex
```

---

## 16. Poznámky pro implementaci

### České komentáře
```typescript
// ✅ SPRÁVNĚ - české komentáře
// Načti všechny ketubot z databáze
const ketubas = await payload.find({ collection: 'products' });

// Validace povinných polí
if (!name || !price) {
  throw new Error('Název a cena jsou povinné');
}
```

### Pojmenování
- Ketuba (jednotné číslo)
- Ketubot (množné číslo)
- Giclée (tisk)

### RTL podpora
- Tailwind `rtl:` prefix pro RTL-specifické styly
- `dir="rtl"` na html elementu
- Testovat s hebrejštinou

---

## 17. GDPR a Cookie Consent

### 17.1 Požadavky
- Explicitní souhlas před nastavením non-essential cookies (analytics, marketing)
- Granulární volby (přijmout vše, odmítnout, spravovat preference)
- Snadný přístup k nastavení a možnost změnit souhlas
- Odkaz na cookie/privacy policy

### 17.2 Implementace
**Knihovna:** react-cookie-consent + js-cookie

```bash
npm install react-cookie-consent js-cookie
npm install -D @types/js-cookie
```

**Komponenta CookieConsent.tsx:**
```typescript
'use client';

import CookieConsent from 'react-cookie-consent';
import Cookies from 'js-cookie';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function CookieConsentBanner() {
  const t = useTranslations('cookies');

  const handleAccept = () => {
    // Inicializovat analytics pouze po souhlasu
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
  };

  const handleDecline = () => {
    // Explicitně odmítnout cookies
    Cookies.remove('_ga');
    Cookies.remove('_gid');
  };

  return (
    <CookieConsent
      location="bottom"
      buttonText={t('accept')}
      declineButtonText={t('decline')}
      enableDeclineButton
      cookieName="cookieConsent"
      style={{ background: '#1A1A1A' }}
      buttonStyle={{ backgroundColor: '#FFE500', color: '#000' }}
      declineButtonStyle={{ backgroundColor: '#6B7280', color: '#fff' }}
      expires={365}
      onAccept={handleAccept}
      onDecline={handleDecline}
    >
      {t('message')} <Link href="/cookies" className="underline">{t('learnMore')}</Link>
    </CookieConsent>
  );
}
```

### 17.3 Google Analytics s Consent Mode
```typescript
// app/[locale]/layout.tsx
import Script from 'next/script';

// GA4 s Consent Mode - defaultně blokuje cookies
<Script
  id="gtag-consent-default"
  strategy="beforeInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('consent', 'default', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
      });
    `,
  }}
/>
```

### 17.4 Překlady (messages/{locale}.json)
```json
{
  "cookies": {
    "message": "Tento web používá cookies pro zlepšení vašeho zážitku.",
    "accept": "Přijmout vše",
    "decline": "Odmítnout",
    "learnMore": "Více informací"
  }
}
```

---

## 18. Error Handling

Detailní strategie pro zpracování chyb je dokumentována v samostatném souboru:

📄 **[ERROR_HANDLING_LOG.md](./ERROR_HANDLING_LOG.md)**

Tento log obsahuje:
- Kategorizaci typů chyb
- Error boundary komponenty
- API error handling patterns
- Logging a monitoring strategie
- Aktuální známé problémy a jejich řešení

---

## 19. Reference

- Next.js dokumentace: https://nextjs.org/docs
- next-intl: https://next-intl-docs.vercel.app
- Payload CMS: https://payloadcms.com/docs
- Meilisearch: https://www.meilisearch.com/docs
- Resend: https://resend.com/docs
- Zod: https://zod.dev
- Tailwind CSS: https://tailwindcss.com/docs
- ČNB kurzy: https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/

---

*Dokument vytvořen: 2024*
*Verze: 1.4*
*Poslední aktualizace: 2025-12-11*

### Changelog v1.4:
- Aktualizována struktura projektu (src/, docs/, scripts/)
- Přidán Payload API route handler a (payload) route group
- Přidány loading.tsx skeleton komponenty
- Přidána NavigationProgress komponenta
- Přidána ProductFilters komponenta
- Media collection: přidán public access control
- ProductCard: odstraněno tlačítko "Mám zájem" (pouze v detailu)
- Layout: Next.js 15 async params, CookieConsent integrace
- Dokumentace přesunuta do docs/ složky (CHANGELOG, SETUP, TROUBLESHOOTING)

### Changelog v1.3:
- Opravena autentizace: použití vestavěné Payload CMS auth místo custom JWT
- Přidána vícejazyčná strategie pro Meilisearch (localizedAttributes)
- Nahrazeno bcrypt za bcrypt-ts (Edge Runtime kompatibilita)
- Přidána konkrétní lightbox knihovna (react-photoswipe-gallery)
- Doplněna synchronizace Languages kolekce s config/locales.ts
- Přidána sekce 17: GDPR a Cookie Consent
