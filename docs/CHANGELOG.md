# Changelog

Přehled změn v projektu Ketubah E-shop.

---

## 2025-12-11

### Přidáno
- **Payload API routes** - chyběl `src/app/(payload)/api/[...slug]/route.ts`, opraveno 404 na `/api/users/me`
- **Media access control** - veřejné čtení médií (`read: () => true`)
- **Loading komponenty** - skeleton loadery pro stránky (`loading.tsx`)
- **NavigationProgress** - progress bar při navigaci mezi stránkami
- **PAYLOAD_NOTES.md** - dokumentace Payload CMS (instalace, auth operace)

### Opraveno
- **Footer hardcoded texty** - nahrazeny překlady z `tCommon()`
- **SearchBar mizení** - odstraněn debounce, input se zavře jen při submit nebo kliknutí mimo

### Změněno
- **ProductFilters** - při < 7 výsledcích kliknutí na filtr zruší search query

---

## 2025-12-10

### Přidáno
- **Payload Admin panel** - funkční na `/admin`
- **Seed data** - 13 produktů, 4 kategorie, 12 barev, 12 tagů, 4 stránky
- **ProductFilters** - filtry podle kategorií s URL parametry
- **CookieConsent** - integrován do layoutu

### Opraveno
- **ServerFunctionsProvider** - chyběla `serverFunction` prop v layout
- **Build chyby** - syntaxe admin page, importMap cesta, unused params

### Technické
- PostgreSQL databáze `ketubah_eshop` s 27 tabulkami
- Payload lokalizace: create() + update() per locale
- Sharp integrace pro image resizing

---

## 2025-12-09

### Přidáno
- **Next.js 15** projekt s TypeScript
- **Tailwind CSS 4** konfigurace
- **next-intl** lokalizace (cs, en, he s RTL)
- **Payload CMS 3.x** s PostgreSQL adaptérem
- **9 kolekcí**: Users, Media, Languages, Categories, Colors, Tags, ExchangeRates, Products, Pages
- **Komponenty**: Header, Footer, ProductCard, ProductGrid, ProductGallery, SearchBar, JsonLd
- **Stránky**: Home, Products, Product Detail, Contact, 404
- **API**: Contact endpoint s rate limiting

### Technické
- Google Fonts: Inter + Noto Sans Hebrew
- PhotoSwipe galerie
- Honeypot anti-spam
- Sitemap + robots.txt
