# Error Handling Log - Ketubah Eshop

> **Účel:** Centrální dokumentace pro error handling strategie a aktuální známé problémy.
> **Aktualizace:** Průběžně během vývoje, promazává se nepotřebný balast.
> **Poslední aktualizace:** 2025-12-10

---

## 1. Kategorizace chyb

### 1.1 Klientské chyby (4xx)
| Kód | Typ | Popis | Reakce |
|-----|-----|-------|--------|
| 400 | Bad Request | Nevalidní vstup | Zobrazit validační chyby uživateli |
| 401 | Unauthorized | Nepřihlášen | Redirect na login |
| 403 | Forbidden | Nedostatečná oprávnění | Zobrazit chybovou stránku |
| 404 | Not Found | Stránka/produkt neexistuje | Zobrazit 404 stránku |
| 429 | Rate Limited | Příliš mnoho požadavků | Zobrazit upozornění, retry po X sekundách |

### 1.2 Serverové chyby (5xx)
| Kód | Typ | Popis | Reakce |
|-----|-----|-------|--------|
| 500 | Internal Error | Neočekávaná chyba | Log + obecná chybová zpráva |
| 502 | Bad Gateway | Upstream server nedostupný | Retry + fallback |
| 503 | Service Unavailable | Dočasně nedostupné | Maintenance stránka |
| 504 | Gateway Timeout | Timeout | Retry s exponential backoff |

### 1.3 Externí služby
| Služba | Typ chyby | Fallback strategie |
|--------|-----------|-------------------|
| PostgreSQL | Connection failed | Retry 3x, pak error page |
| Meilisearch | Nedostupný | Fallback na basic DB search |
| Resend | Email failed | Queue + retry, log error |
| ČNB API | Kurzy nedostupné | Použít poslední známé kurzy |

---

## 2. Error Boundary komponenty

### 2.1 Globální Error Boundary
```typescript
// app/error.tsx
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do error tracking služby (Sentry apod.)
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Něco se pokazilo</h2>
      <p className="text-gray-600 mb-4">Omlouváme se za komplikace.</p>
      <button
        onClick={reset}
        className="bg-primary text-black px-6 py-2 rounded"
      >
        Zkusit znovu
      </button>
    </div>
  );
}
```

### 2.2 Segment Error Boundary
```typescript
// app/[locale]/products/error.tsx
'use client';

export default function ProductsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="container mx-auto py-8">
      <h2>Nepodařilo se načíst produkty</h2>
      <button onClick={reset}>Zkusit znovu</button>
    </div>
  );
}
```

---

## 3. API Error Handling

### 3.1 Standardní API response formát
```typescript
// lib/api-response.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export function successResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, string[]>
): ApiResponse<never> {
  return {
    success: false,
    error: { code, message, details },
  };
}
```

### 3.2 API Route error wrapper
```typescript
// lib/api-handler.ts
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

type Handler = (req: NextRequest) => Promise<Response>;

export function withErrorHandler(handler: Handler): Handler {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      // Zod validační chyby
      if (error instanceof ZodError) {
        return NextResponse.json(
          errorResponse('VALIDATION_ERROR', 'Nevalidní data', formatZodErrors(error)),
          { status: 400 }
        );
      }

      // Známé aplikační chyby
      if (error instanceof AppError) {
        return NextResponse.json(
          errorResponse(error.code, error.message),
          { status: error.statusCode }
        );
      }

      // Neočekávané chyby
      console.error('Unexpected error:', error);
      return NextResponse.json(
        errorResponse('INTERNAL_ERROR', 'Interní chyba serveru'),
        { status: 500 }
      );
    }
  };
}
```

### 3.3 Custom Error třída
```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} nebyl nalezen`, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super('UNAUTHORIZED', 'Přístup zamítnut', 401);
  }
}
```

### 3.4 API a Route Endpoints Map

**Implementované API endpointy:**

| Endpoint | Metoda | Účel | Status |
|----------|--------|------|--------|
| `/api/contact` | POST | Kontaktní formulář (Resend email) | ✅ Implementováno |

**Implementované frontend routes:**

| Route | Soubor | Účel | Status |
|-------|--------|------|--------|
| `/[locale]` | `app/[locale]/page.tsx` | Homepage | ✅ Implementováno |
| `/[locale]/products` | `app/[locale]/products/page.tsx` | Seznam produktů | ✅ Implementováno |
| `/[locale]/products/[slug]` | `app/[locale]/products/[slug]/page.tsx` | Detail produktu | ✅ Implementováno |
| `/[locale]/contact` | `app/[locale]/contact/page.tsx` | Kontaktní formulář | ✅ Implementováno |

**Chybějící endpointy (dle PRD):**

| Endpoint | Metoda | Účel | Status |
|----------|--------|------|--------|
| `/api/search` | GET | Meilisearch vyhledávání | ❌ TBD |
| `/api/cron/exchange-rates` | GET | Aktualizace kurzů ČNB | ❌ TBD |
| `/api/health` | GET | Health check endpoint | ❌ TBD |
| `/[locale]/[slug]` | - | Dynamické stránky (about, faq, cookies) | ❌ TBD |

**Doporučení:** Implementovat `/api/health` endpoint pro monitoring dostupnosti služeb:

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    postgres: false,
    meilisearch: false,
    resend: false,
  };

  try {
    // Check PostgreSQL
    const { payload } = await import('@/lib/payload');
    await payload.find({ collection: 'users', limit: 1 });
    checks.postgres = true;
  } catch (e) {
    console.error('Postgres health check failed:', e);
  }

  try {
    // Check Meilisearch
    const { meilisearch } = await import('@/lib/meilisearch');
    await meilisearch.health();
    checks.meilisearch = true;
  } catch (e) {
    console.error('Meilisearch health check failed:', e);
  }

  try {
    // Check Resend (simple API key validation)
    checks.resend = !!process.env.RESEND_API_KEY;
  } catch (e) {
    console.error('Resend health check failed:', e);
  }

  const allHealthy = Object.values(checks).every(v => v);

  return NextResponse.json(
    { 
      status: allHealthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: allHealthy ? 200 : 503 }
  );
}
```

---

## 4. Fallback strategie

### 4.1 ČNB kurzy - fallback
```typescript
// lib/cnb.ts
export async function getExchangeRates(): Promise<ExchangeRates> {
  try {
    // Pokus o načtení z ČNB API
    return await fetchCNBRates();
  } catch (error) {
    console.error('ČNB API error, using cached rates:', error);
    
    // Fallback: poslední známé kurzy z DB
    const cached = await payload.find({
      collection: 'exchange-rates',
      sort: '-date',
      limit: 1,
    });
    
    if (cached.docs.length > 0) {
      return cached.docs[0];
    }
    
    // Ultimátní fallback: hardcoded kurzy
    return {
      date: new Date(),
      eurRate: 25.0,
      usdRate: 23.0,
      source: 'fallback',
    };
  }
}
```

### 4.2 Meilisearch - fallback
```typescript
// lib/search.ts
export async function searchProducts(query: string, locale: string) {
  try {
    return await meilisearchClient.index('products').search(query, {
      filter: [`locale = "${locale}"`],
    });
  } catch (error) {
    console.error('Meilisearch error, falling back to DB:', error);
    
    // Fallback: základní PostgreSQL LIKE search
    return await payload.find({
      collection: 'products',
      where: {
        or: [
          { name: { contains: query } },
          { description: { contains: query } },
        ],
      },
      locale,
    });
  }
}
```

---

## 5. Logging

### 5.1 Log levels
| Level | Použití |
|-------|---------|
| `error` | Chyby vyžadující pozornost |
| `warn` | Potenciální problémy, fallbacky |
| `info` | Důležité operace (login, objednávka) |
| `debug` | Detaily pro debugging (pouze dev) |

### 5.2 Strukturovaný logging
```typescript
// lib/logger.ts
const log = {
  error: (message: string, meta?: object) => {
    console.error(JSON.stringify({ level: 'error', message, ...meta, timestamp: new Date().toISOString() }));
  },
  warn: (message: string, meta?: object) => {
    console.warn(JSON.stringify({ level: 'warn', message, ...meta, timestamp: new Date().toISOString() }));
  },
  info: (message: string, meta?: object) => {
    console.info(JSON.stringify({ level: 'info', message, ...meta, timestamp: new Date().toISOString() }));
  },
};

export default log;
```

---

## 6. Edge Runtime omezení

> **Důležité:** Vercel Edge Runtime nepodporuje Node.js nativní moduly. Toto je fundamentální omezení platformy.

### 6.1 Nepodporované Node.js moduly
Edge Runtime běží na V8 enginu v izolovaném kontextu a podporuje pouze Web APIs:

| Modul | Status | Alternativa |
|-------|--------|-------------|
| `crypto` | ❌ Nepodporováno | Web Crypto API (`crypto.subtle`) |
| `fs` | ❌ Nepodporováno | - |
| `net` | ❌ Nepodporováno | - |
| `child_process` | ❌ Nepodporováno | - |
| `bcrypt` | ❌ Nepodporováno | `bcryptjs` (čistý JS) |

### 6.2 Dopad na projekt

| Komponenta | Runtime | Poznámka |
|------------|---------|----------|
| `middleware.ts` | Edge (default) | Používat pouze Edge-kompatibilní knihovny |
| JWT (`jose`) | ✅ Edge OK | jose používá Web Crypto API |
| `bcrypt` | ❌ Edge FAIL | Použít `bcryptjs` nebo hashování v Node.js API route |
| Payload CMS | Node.js only | API routes musí mít `runtime: "nodejs"` |
| Meilisearch client | ✅ Edge OK | Používá fetch API |

### 6.3 Řešení pro autentizaci
```typescript
// middleware.ts - Edge Runtime (default)
// ✅ jose pro JWT validaci (Edge-kompatibilní)
import { jwtVerify } from 'jose';

// app/api/auth/login/route.ts - Node.js Runtime
export const runtime = 'nodejs'; // Explicitně Node.js pro bcrypt
import bcrypt from 'bcrypt'; // nebo bcryptjs pro univerzální kompatibilitu
```

### 6.4 Next.js 15: Async `params` a `searchParams` (Breaking Change)

> **Důležité:** V Next.js 15 jsou `params` a `searchParams` nyní **Promise** - musí se awaitovat!

**Starý vzor (Next.js 14):**
```typescript
// ❌ Nefunguje v Next.js 15
export default function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = params; // synchronní přístup
  return <div>{slug}</div>;
}
```

**Nový vzor (Next.js 15):**
```typescript
// ✅ Správně v Next.js 15
interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params; // musí být async + await
  return <div>{slug}</div>;
}
```

**Typické chyby:**
```
Property 'slug' does not exist on type 'Promise<{ slug: string }>'
Route "/products/[slug]" used params.slug. params should be awaited before using its properties.
```

**Migrace pomocí codemod:**
```bash
npx @next/codemod@canary next-async-request-api .
```

**Dopad na projekt:**
| Soubor | Změna potřebná |
|--------|----------------|
| `app/[locale]/products/[slug]/page.tsx` | `await params` |
| `app/[locale]/[slug]/page.tsx` | `await params` |
| `generateMetadata` funkce | `await params` |
| Route Handlers s dynamic segments | `await params` |

### 6.5 Fetch a cookies: `credentials: 'include'`

> **Důležité:** Pro odesílání cookies v fetch požadavcích je nutné nastavit `credentials: 'include'`.

**Problém:**
Fetch API defaultně **neodesílá cookies** při cross-origin požadavcích a v některých případech ani při same-origin.

```typescript
// ❌ Cookies se neodešlou
const response = await fetch('/api/auth/me');

// ✅ Cookies se odešlou
const response = await fetch('/api/auth/me', {
  credentials: 'include',
});
```

**Možnosti `credentials`:**
| Hodnota | Popis |
|---------|-------|
| `omit` | Nikdy neodesílat cookies |
| `same-origin` | Odesílat pouze pro same-origin požadavky (default) |
| `include` | Vždy odesílat cookies (i cross-origin) |

**Použití v projektu:**
```typescript
// lib/api-client.ts
export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    credentials: 'include', // Důležité pro JWT v cookies
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}
```

**Typické příznaky chybějícího `credentials: 'include'`:**
- JWT token v cookie není přečten na serveru
- Uživatel je náhodně odhlášen
- API vrací 401 i přes platné přihlášení

### 6.6 Reference
- [Next.js: Dynamic APIs are Asynchronous](https://nextjs.org/docs/messages/sync-dynamic-apis)
- [Next.js: Node.js moduly v Edge Runtime](https://nextjs.org/docs/messages/node-module-in-edge-runtime)
- [Vercel Edge Runtime dokumentace](https://vercel.com/docs/functions/runtimes/edge)
- [GitHub diskuze k crypto omezení](https://github.com/vercel/next.js/discussions/51753)

---

## 7. next-intl Layout Konfigurace

> **Důležité:** Při použití next-intl s `[locale]` segmentem je kritické správně nakonfigurovat root a locale layouty.

### 7.1 Problém: Duplicitní `<html>` a `<body>` tagy

**Symptomy:**
- Next.js vrací 404 pro všechny routy
- Routy se nerozpoznávají
- Chyba: "Multiple root layouts detected"

**Příčina:**
Když `app/layout.tsx` i `app/[locale]/layout.tsx` obsahují `<html>` a `<body>` tagy, dochází ke konfliktu. V Next.js může mít `<html>` a `<body>` pouze jeden layout na segment.

### 7.2 Správná struktura

```
app/
  layout.tsx           // ✅ MINIMAL – pouze `return children` (bez html/body)
  not-found.tsx        // ✅ Client component s vlastní html/body (mimo locale)
  [locale]/
    layout.tsx         // ✅ Jediný s <html><body> + NextIntlClientProvider
    not-found.tsx      // ✅ Not found pro locale routes
    page.tsx
```

**Root Layout (app/layout.tsx):**
```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children; // Pouze předání children, žádné HTML tagy!
}
```

**Locale Layout (app/[locale]/layout.tsx):**
```typescript
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

**Root Not Found (app/not-found.tsx):**
```typescript
'use client';

export default function RootNotFound() {
  return (
    <html lang="cs">
      <body>
        <h1>404 - Stránka nenalezena</h1>
      </body>
    </html>
  );
}
```

### 7.3 Validace

**Middleware logy by měly ukazovat:**
```
🔒 Middleware check: /
🌍 Redirecting to /cs (307)
🔒 Middleware check: /cs
🌍 Locale resolved → 200
○ Compiling /[locale] ...
```

### 7.4 Další časté problémy

**Duplikátní klíče v JSON překladech:**
```json
// ❌ Způsobí silent runtime crash
{
  "common": {
    "submit": "Odeslat",
    "submit": "Potvrdit"  // Duplikát!
  }
}
```

**Řešení:** Vždy validovat JSON soubory a používat pouze unikátní klíče.

---

## 8. Hydration Errors

> **Důležité:** Hydration errors vznikají, když se server-rendered HTML liší od client-rendered verze.

### 8.1 Problém: Browser Extensions modifikují DOM

**Symptomy:**
- Hydration error ve formulářích
- Chyba: "Hydration failed because the server rendered HTML didn't match the client"
- Viditelné v polích s `type="email"` nebo `type="password"`

**Příčina:**
Browser extensions (zejména password managery jako 1Password, LastPass, Bitwarden) přidávají do input polí:
- Ikonky/tlačítka pro automatické vyplnění
- Skryté prvky pro detekci polí
- Inline styles a atributy

To způsobuje nesoulad mezi server HTML a client HTML.

### 8.2 Řešení

**1. Suppress Hydration Warning na input fields:**

```typescript
// ✅ Správně - s suppressHydrationWarning
<div suppressHydrationWarning>
  <label htmlFor="email">Email *</label>
  <input
    type="email"
    id="email"
    name="email"
    value={formData.email}
    onChange={handleChange}
    autoComplete="email"
    suppressHydrationWarning
  />
</div>
```

**2. Explicitní autocomplete atributy:**

```typescript
// Pomáhá browser extensionům správně identifikovat pole
autoComplete="email"      // Pro email
autoComplete="name"       // Pro jméno
autoComplete="off"        // Pro předmět/zprávu
```

**3. Kdy používat suppressHydrationWarning:**

- ✅ Formulářové inputy (email, password, text)
- ✅ Client components s proměnlivým obsahem
- ❌ NIKDY na statický obsah
- ❌ NIKDY jako "quick fix" pro skutečné hydration problémy

### 8.3 Další časté příčiny Hydration Errors

**Date/Time formatting:**
```typescript
// ❌ Špatně - timezone differ server vs client
<div>{new Date().toLocaleString()}</div>

// ✅ Správně - unified timestamp
<div suppressHydrationWarning>
  {new Date().toLocaleString('cs-CZ', { timeZone: 'UTC' })}
</div>
```

**Random values:**
```typescript
// ❌ Špatně - různé hodnoty server vs client
<div id={Math.random()}>...</div>

// ✅ Správně - deterministické ID
import { useId } from 'react';
const id = useId();
<div id={id}>...</div>
```

**Conditional rendering based on window:**
```typescript
// ❌ Špatně - undefined na serveru
{typeof window !== 'undefined' && <Component />}

// ✅ Správně - useEffect nebo suppressHydrationWarning
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
{mounted && <Component />}
```

---

## 9. Aktuální známé problémy

> Tato sekce se průběžně aktualizuje. Vyřešené problémy se mažou.

| ID | Popis | Severity | Status | Poznámka |
|----|-------|----------|--------|----------|
| EDGE-001 | Edge Runtime nepodporuje Node.js `crypto` | High | Dokumentováno | Viz sekce 6.1-6.3 - používat bcryptjs nebo Node.js runtime |
| NEXT15-001 | `params` a `searchParams` jsou nyní Promise | High | Vyřešeno | Implementováno v projektu - všechny dynamic routes používají async/await |
| FETCH-001 | Cookies se neodesílají bez `credentials: 'include'` | Medium | Dokumentováno | Viz sekce 6.5 - nutné pro JWT autentizaci |
| REACT19-001 | `setState` v `useEffect` způsobuje ESLint error | Medium | Vyřešeno | Použít `useSyncExternalStore` pro external state (cookies) |
| I18N-001 | Duplicitní `<html>/<body>` v root a locale layoutech | High | Dokumentováno | Viz sekce 7 - root layout musí být minimální |
| HYDRATION-001 | Browser extensions způsobují hydration errors ve formulářích | Low | Vyřešeno | Viz sekce 8 - použít suppressHydrationWarning na input fields |
| PAYLOAD-001 | ServerFunctionsProvider requires serverFunction prop | High | ✅ Vyřešeno | Viz sekce 11 - nutné přidat serverFunction, importMap do layout.tsx |
| PAYLOAD-002 | Lokalizovaná data nelze předat jako objekt při create() | High | ✅ Vyřešeno | Viz sekce 11 - create v default locale, pak update pro další locales |

---

## 10. Monitoring checklist

- [ ] Sentry/podobná služba nakonfigurována
- [x] Error boundary komponenty implementovány
- [ ] API error wrapper použit na všech endpoints
- [ ] Fallback strategie otestovány
- [ ] Strukturované logy funkční
- [ ] Alerting nastaven pro kritické chyby

---

## 11. Payload CMS 3.x + Next.js 15 - Kritické poznatky

### 11.1 Payload Admin Panel Setup (PAYLOAD-001)

**Problém:** Admin panel vrací 500 error s hláškou:
```
Error: ServerFunctionsProvider requires a serverFunction prop to be passed
```

**Příčina:** Payload 3.x vyžaduje explicitní `serverFunction` prop v admin layout pro Server Actions.

**Řešení:** Aktualizovat `src/app/(payload)/layout.tsx`:

```typescript
import React from 'react';
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts';
import { ServerFunctionClient } from 'payload';

import config from '../../../payload.config';
import { importMap } from './admin/importMap';
import '@payloadcms/next/css';

type Args = {
  children: React.ReactNode;
};

// Kritické - musí být server function s 'use server'
const serverFunction: ServerFunctionClient = async function (args) {
  'use server';
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

export default function Layout({ children }: Args) {
  return (
    <RootLayout 
      importMap={importMap} 
      config={config} 
      serverFunction={serverFunction}  // ← Toto je klíčové!
    >
      {children}
    </RootLayout>
  );
}
```

**Kritické soubory:**
- `src/app/(payload)/layout.tsx` - admin layout
- `src/app/(payload)/admin/importMap.ts` - automaticky generovaný Payload importy

### 11.2 Lokalizace dat v Payload CMS (PAYLOAD-002)

**Problém:** Při `payload.create()` nelze předat lokalizovaná data jako objekt:
```typescript
// ❌ NEFUNGUJE - ValidationError: "This field is required"
await payload.create({
  collection: 'categories',
  data: {
    slug: 'traditional',
    name: { cs: 'Tradiční', en: 'Traditional', he: 'מסורתי' }, // ← Chyba!
  },
});
```

**Příčina:** Payload očekává při `create()` prostý string pro lokalizované pole, ne objekt.

**Řešení:** Vytvořit v default locale, pak aktualizovat ostatní:

```typescript
// ✅ SPRÁVNĚ - create + update pattern
// 1. Vytvoření v default locale (cs)
const created = await payload.create({
  collection: 'categories',
  data: { slug: 'traditional', name: 'Tradiční' },
});

// 2. Aktualizace EN locale
await payload.update({
  collection: 'categories',
  id: created.id,
  data: { name: 'Traditional' },
  locale: 'en',
});

// 3. Aktualizace HE locale
await payload.update({
  collection: 'categories',
  id: created.id,
  data: { name: 'מסורתי' },
  locale: 'he',
});
```

**Poznámka k `locale: 'all'`:**
- Parametr `locale: 'all'` funguje pro **čtení** dat, ne pro zápis
- Při čtení vrací objekt se všemi locales
- Při zápisu stále očekává prosté hodnoty

### 11.3 Pole v arrays s lokalizovanými fields

**Problém:** Array fields (např. `images` v Products) mohou mít lokalizovaná sub-fields (např. `alt`).

```typescript
// Products.images field definition:
{
  name: 'images',
  type: 'array',
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'alt', type: 'text', localized: true, required: true }, // ← Lokalizované!
  ],
}
```

**Řešení:** Při update pro jinou locale musíte znovu předat celé pole images:

```typescript
// Vytvoření produktu (CS)
const product = await payload.create({
  collection: 'products',
  data: {
    slug: 'eternal-love',
    name: 'Věčná láska',
    images: [{ image: imageId, alt: 'Ketuba Věčná láska', isMain: true }],
    // ...
  },
});

// Update EN - musíte předat images znovu s EN alt
await payload.update({
  collection: 'products',
  id: product.id,
  data: {
    name: 'Eternal Love',
    images: [{ image: imageId, alt: 'Ketubah Eternal Love', isMain: true }],
  },
  locale: 'en',
});
```

### 11.4 dotenv v seed scriptech

**Problém:** TypeScript seed script nenačítá `.env.local` automaticky.

**Řešení:** 
1. Zkopírovat `.env.local` na `.env`: `cp .env.local .env`
2. V seed scriptu použít: `import 'dotenv/config';` na prvním řádku
3. Nainstalovat dotenv: `npm install dotenv`

---

## 12. Lessons Learned pro příštího vývojáře

### 12.1 Co funguje dobře

1. **next-intl 4.x** - Lokalizace funguje skvěle, RTL podpora out of box
2. **Payload CMS 3.x** - Po správném nastavení velmi produktivní
3. **PostgreSQL adapter** - Stabilní, bez problémů
4. **Lexical Editor** - Bohatý editor bez dodatečné konfigurace

### 12.2 Na co si dát pozor

| Oblast | Problém | Doporučení |
|--------|---------|------------|
| **Payload Admin** | ServerFunctions setup | Vždy kopírovat z oficiálních templates, ne psát od nuly |
| **Lokalizace** | Create neakceptuje objekt | Vždy použít create + update pattern |
| **Seed scripty** | dotenv nenačítá .env.local | Používat `.env` nebo `dotenv/config` import |
| **Array fields** | Lokalizované sub-fields | Při locale update předat celé pole znovu |
| **Next.js 15** | Async params/searchParams | Všechny dynamic routes musí být async |

### 12.3 Doporučený workflow pro nové kolekce

1. Definovat kolekci v `src/collections/`
2. Přidat do `payload.config.ts`
3. Spustit `npm run dev` - Payload vytvoří tabulky
4. Napsat seed data s create + update pattern
5. Testovat v admin panelu

### 12.4 Užitečné příkazy

```bash
# Seed databázi
npm run seed

# Regenerovat Payload types
npx payload generate:types

# Kontrola databáze
psql postgresql://elda:dev_password_123@localhost:5432/ketubah_eshop -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"

# Počet záznamů v tabulkách
psql postgresql://elda:dev_password_123@localhost:5432/ketubah_eshop -c "SELECT 'products', count(*) FROM products UNION ALL SELECT 'categories', count(*) FROM categories;"
```

---

*Tento log je součástí projektu Ketubah Eshop. Viz hlavní [PRD dokument](./PRD_KETUBAH_ESHOP.md).*
