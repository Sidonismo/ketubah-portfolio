# Troubleshooting

Řešení běžných problémů při vývoji.

---

## Payload CMS

### 404 na `/api/users/me`

**Příčina:** Chybí API route handler.

**Řešení:** Vytvořte `src/app/(payload)/api/[...slug]/route.ts`:
```typescript
import config from '@payload-config'
import { REST_DELETE, REST_GET, REST_OPTIONS, REST_PATCH, REST_POST, REST_PUT } from '@payloadcms/next/routes'

export const GET = REST_GET(config)
export const POST = REST_POST(config)
export const DELETE = REST_DELETE(config)
export const PATCH = REST_PATCH(config)
export const PUT = REST_PUT(config)
export const OPTIONS = REST_OPTIONS(config)
```

### ServerFunctionsProvider error

**Příčina:** Chybí `serverFunction` prop v layout.

**Řešení:** V `src/app/(payload)/layout.tsx` přidejte:
```typescript
import { handleServerFunctions } from '@payloadcms/next/layouts'

const serverFunction = async function (args) {
  'use server'
  return handleServerFunctions({ ...args, config, importMap })
}
```

### Media 403 Forbidden

**Příčina:** Chybí access control pro veřejné čtení.

**Řešení:** V `src/collections/Media.ts`:
```typescript
access: {
  read: () => true,
},
```

---

## PostgreSQL

### SCRAM-SHA-256 authentication failed

**Příčina:** Peer authentication nefunguje s connection pool.

**Řešení:**
```bash
sudo -u postgres psql -c "ALTER USER your_user WITH PASSWORD 'password'"
```

### SSL connection error

**Příčina:** Produkční SSL config v lokálním prostředí.

**Řešení:** V `payload.config.ts`:
```typescript
db: postgresAdapter({
  pool: {
    connectionString: process.env.DATABASE_URI,
    ssl: false,
  },
}),
```

---

## Next.js

### Hydration Error

**Příčina:** Browser extensions (password managery) modifikují DOM.

**Řešení:** Na input fieldy přidejte:
```tsx
<input suppressHydrationWarning autoComplete="off" />
```

### Pomalé načítání v dev mode

**Vysvětlení:** Normální - kompilace on-demand, žádné cachování.

**Test produkční rychlosti:**
```bash
npm run build && npm run start
```

---

## Lokalizace

### Payload create() ignoruje lokalizovaná data

**Příčina:** Payload neakceptuje `{ cs: ..., en: ... }` objekt při create.

**Řešení:** Create v default locale, pak update pro ostatní:
```typescript
const item = await payload.create({
  collection: 'categories',
  data: { name: 'Název CS' },
})

await payload.update({
  collection: 'categories',
  id: item.id,
  data: { name: 'Name EN' },
  locale: 'en',
})
```
