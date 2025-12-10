# Error Handling Log - Ketubah Eshop

> **Účel:** Centrální dokumentace pro error handling strategie a aktuální známé problémy.
> **Aktualizace:** Průběžně během vývoje, promazává se nepotřebný balast.
> **Poslední aktualizace:** 2025-12-09

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

## 7. Aktuální známé problémy

> Tato sekce se průběžně aktualizuje. Vyřešené problémy se mažou.

| ID | Popis | Severity | Status | Poznámka |
|----|-------|----------|--------|----------|
| EDGE-001 | Edge Runtime nepodporuje Node.js `crypto` | High | Dokumentováno | Viz sekce 6.1-6.3 - používat bcryptjs nebo Node.js runtime |
| NEXT15-001 | `params` a `searchParams` jsou nyní Promise | High | Vyřešeno | Implementováno v projektu - všechny dynamic routes používají async/await |
| FETCH-001 | Cookies se neodesílají bez `credentials: 'include'` | Medium | Dokumentováno | Viz sekce 6.5 - nutné pro JWT autentizaci |
| REACT19-001 | `setState` v `useEffect` způsobuje ESLint error | Medium | Vyřešeno | Použít `useSyncExternalStore` pro external state (cookies) |

---

## 8. Monitoring checklist

- [ ] Sentry/podobná služba nakonfigurována
- [x] Error boundary komponenty implementovány
- [ ] API error wrapper použit na všech endpoints
- [ ] Fallback strategie otestovány
- [ ] Strukturované logy funkční
- [ ] Alerting nastaven pro kritické chyby

---

*Tento log je součástí projektu Ketubah Eshop. Viz hlavní [PRD dokument](./PRD_KETUBAH_ESHOP.md).*
