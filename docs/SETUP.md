# Setup Guide

## Požadavky

- Node.js 20.9.0+
- PostgreSQL 14+
- pnpm (doporučeno) nebo npm

## Instalace

```bash
cd ketubah-eshop
npm install
```

## Databáze

### PostgreSQL setup

```bash
# Vytvoření databáze
sudo -u postgres createdb ketubah_eshop

# Nastavení hesla pro uživatele (pokud používáte password auth)
sudo -u postgres psql -c "ALTER USER your_user WITH PASSWORD 'your_password'"
```

### Environment variables

Vytvořte `.env.local`:

```env
DATABASE_URI=postgresql://user:password@localhost:5432/ketubah_eshop
PAYLOAD_SECRET=min_32_chars_random_string
NEXT_PUBLIC_SITE_URL=http://localhost:3000
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_ADMIN_KEY=masterKey
RESEND_API_KEY=re_...
CONTACT_EMAIL=your@email.com
```

## Spuštění

```bash
# Development
npm run dev

# Production build
npm run build
npm run start
```

## Seed data

```bash
npm run seed
```

Vytvoří:
- Admin: `admin@ketubah.cz` / `admin123`
- 13 produktů s obrázky
- 4 kategorie, 12 barev, 12 tagů
- 4 stránky (About, FAQ, Cookies, Privacy)

## Admin panel

URL: http://localhost:3000/admin
