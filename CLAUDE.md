# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multilingual e-shop for selling Giclée prints and original Ketubot (Jewish wedding contracts).

## Documentation

Veškerá dokumentace je ve složce `docs/`:

- **[PRD_KETUBAH_ESHOP.md](./docs/PRD_KETUBAH_ESHOP.md)** - Product requirements, architecture, data models
- **[CHANGELOG.md](./docs/CHANGELOG.md)** - Přehled změn podle data
- **[SETUP.md](./docs/SETUP.md)** - Instalace a konfigurace
- **[TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)** - Řešení běžných problémů
- **[PAYLOAD_NOTES.md](./docs/PAYLOAD_NOTES.md)** - Payload CMS dokumentace
- **[ERROR_HANDLING_LOG.md](./docs/ERROR_HANDLING_LOG.md)** - Edge Runtime, Next.js 15 specifika

## Quick Reference

**Tech Stack:** Next.js 15, Payload CMS 3.x, PostgreSQL, Meilisearch, next-intl, Tailwind CSS 4, Zod

**Development Commands:**
```bash
npm run dev              # Development server (requires PostgreSQL)
npm run build            # Production build
npm run typecheck        # TypeScript check
npm run lint             # ESLint
npm run payload:generate-types  # Generate Payload CMS types
```

**Code Style:**
- Comments in Czech
- Prices in CZK only (EUR/USD auto-converted via ČNB rates)
- Use Payload CMS built-in auth

## Project Structure

```
ketubah-eshop/
├── src/
│   ├── app/[locale]/     # Localized pages (cs, en, he with RTL)
│   ├── components/       # React components (layout, products, seo, ui)
│   ├── collections/      # Payload CMS collections
│   ├── lib/              # Utilities (currency, cnb, meilisearch, resend)
│   ├── config/           # App config (locales, site)
│   └── messages/         # UI translations
├── payload.config.ts     # Payload CMS configuration
└── .env.local            # Environment variables (not committed)
```

## Environment Variables Required

```
DATABASE_URI=postgresql://...
PAYLOAD_SECRET=min_32_chars
NEXT_PUBLIC_SITE_URL=https://...
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_ADMIN_KEY=...
RESEND_API_KEY=re_...
CONTACT_EMAIL=...
```
