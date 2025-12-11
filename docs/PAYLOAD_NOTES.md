# Payload CMS Notes

Poznámky a reference k Payload CMS 3.x pro tento projekt.

## Softwarové požadavky

- **Package manager:** pnpm (preferovaný), npm, nebo yarn
- **Node.js:** verze 20.9.0+
- **Databáze:** MongoDB, PostgreSQL nebo SQLite

## Instalace

### Rychlý start
```bash
npx create-payload-app
```

### Přidání do existující Next.js aplikace

**Požadavek:** Next.js verze 15 nebo vyšší

#### 1. Instalace balíčků
```bash
pnpm i payload @payloadcms/next @payloadcms/richtext-lexical sharp graphql
```

Pro npm (může vyžadovat legacy peer deps):
```bash
npm i --legacy-peer-deps
```

#### 2. Database Adapter
```bash
# MongoDB
pnpm i @payloadcms/db-mongodb

# PostgreSQL
pnpm i @payloadcms/db-postgres

# SQLite
pnpm i @payloadcms/db-sqlite
```

#### 3. Struktura složek v /app
```
app/
├─ (payload)/
│  └── // Payload soubory (nekopírovat, neměnit)
├─ (my-app)/
│  └── // Soubory aplikace
```

Payload soubory se kopírují z Blank Template:
- [Celý template](https://github.com/payloadcms/payload/tree/main/templates/blank)
- [(payload) složka](https://github.com/payloadcms/payload/tree/main/templates/blank/src/app/%28payload%29)

#### 4. Next.js konfigurace

V `next.config.mjs` (nebo s `"type": "module"` v package.json):

```javascript
import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    reactCompiler: false,
  },
}

export default withPayload(nextConfig)
```

#### 5. Payload Config

Soubor `payload.config.ts` v rootu projektu:

```typescript
import sharp from 'sharp'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { postgresAdapter } from '@payloadcms/db-postgres' // nebo mongooseAdapter
import { buildConfig } from 'payload'

export default buildConfig({
  editor: lexicalEditor(),
  collections: [],
  secret: process.env.PAYLOAD_SECRET || '',
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
})
```

#### 6. TypeScript config

V `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@payload-config": ["./payload.config.ts"]
    }
  }
}
```

#### 7. Spuštění
```bash
pnpm dev
```

Admin panel: http://localhost:3000/admin

## Důležité poznámky

- Payload je plně ESM projekt
- Soubory v `(payload)` složce se **needitují** - pouze importují dependencies z `@payloadcms/next`
- `PAYLOAD_SECRET` musí být komplexní a bezpečný řetězec (min. 32 znaků)

---

## Authentication Operations

Povolení autentizace na Collection automaticky vystaví dodatečné auth operace v Local API, REST API a GraphQL API.

### Access

Vrací co přihlášený uživatel může a nemůže dělat s collections a globals.

**REST API:**
```
GET http://localhost:3000/api/access
```

**Příklad odpovědi:**
```json
{
  "canAccessAdmin": true,
  "collections": {
    "pages": {
      "create": { "permission": true },
      "read": { "permission": true },
      "update": { "permission": true },
      "delete": { "permission": true },
      "fields": {
        "title": {
          "create": { "permission": true },
          "read": { "permission": true },
          "update": { "permission": true }
        }
      }
    }
  }
}
```

**Document access:**
- Global: `GET /api/global-slug/access`
- Collection dokument: `GET /api/collection-slug/access/:id`

### Me

Vrací přihlášeného uživatele s tokenem nebo `null`.

**REST API:**
```
GET http://localhost:3000/api/[collection-slug]/me
```

**Příklad odpovědi:**
```json
{
  "user": {
    "email": "dev@payloadcms.com",
    "createdAt": "2020-12-27T21:16:45.645Z",
    "updatedAt": "2021-01-02T18:37:41.588Z",
    "id": "5ae8f9bde69e394e717c8832"
  },
  "token": "34o4345324...",
  "exp": 1609619861
}
```

### Login

Přijímá email a heslo. Vrací přihlášeného uživatele a token. Automaticky nastavuje HTTP-only cookie.

**REST API:**
```javascript
const res = await fetch('http://localhost:3000/api/[collection-slug]/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'dev@payloadcms.com',
    password: 'heslo',
  }),
})
```

**Local API:**
```typescript
const result = await payload.login({
  collection: 'collection-slug',
  data: {
    email: 'dev@payloadcms.com',
    password: 'heslo',
  },
})
```

### Logout

HTTP-only cookies nelze odstranit přímo v JS, proto Payload vystavuje logout operaci.

**REST API:**
```javascript
const res = await fetch(
  'http://localhost:3000/api/[collection-slug]/logout?allSessions=false',
  { method: 'POST', headers: { 'Content-Type': 'application/json' } },
)
```

**S sessions:** `allSessions=true` ukončí všechny sessions uživatele.

### Refresh Token

Obnovuje JWT tokeny. Vyžaduje nevypršený token.

**REST API:**
```
POST http://localhost:3000/api/[collection-slug]/refresh-token
```

**Odpověď obsahuje:** `user`, `refreshedToken`, `exp`

### Verify by Email

Ověření emailu pomocí verification tokenu. Nastaví `_verified` na `true`.

**REST API:**
```
POST http://localhost:3000/api/[collection-slug]/verify/${TOKEN_HERE}
```

**Local API:**
```typescript
const result = await payload.verifyEmail({
  collection: 'collection-slug',
  token: 'TOKEN_HERE',
})
```

**Poznámka:** Verification token je unikátní a liší se od forgot password tokenu. Najdete ho jako skryté pole `_verificationToken` na user dokumentu (s `showHiddenFields: true`).

### Unlock

Odemknutí uživatele, který se zablokoval příliš mnoha neúspěšnými pokusy.

**REST API:**
```
POST http://localhost:3000/api/[collection-slug]/unlock
```

**Local API:**
```typescript
const result = await payload.unlock({
  collection: 'collection-slug',
})
```

### Forgot Password

Odešle email s odkazem na reset hesla.

**REST API:**
```javascript
const res = await fetch(
  'http://localhost:3000/api/[collection-slug]/forgot-password',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dev@payloadcms.com' }),
  },
)
```

**Local API:**
```typescript
const token = await payload.forgotPassword({
  collection: 'collection-slug',
  data: { email: 'dev@payloadcms.com' },
  disableEmail: false, // lze vypnout auto-generování emailu
})
```

**Tip:** `disableEmail: true` je užitečné pro programatické vytváření účtů bez nastavení hesla.

### Reset Password

Reset hesla pomocí tokenu z forgot password.

**REST API:**
```javascript
const res = await fetch('http://localhost:3000/api/[collection-slug]/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'TOKEN_GOES_HERE',
    password: 'nove-heslo',
  }),
})
```

**Odpověď obsahuje:** `user`, `token`, `exp`
