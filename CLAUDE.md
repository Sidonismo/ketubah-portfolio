# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multilingual e-shop for selling Giclée prints and original Ketubot (Jewish wedding contracts).

## Documentation

- **[docs/PRD_KETUBAH_ESHOP.md](./docs/PRD_KETUBAH_ESHOP.md)** - Complete product requirements, architecture, data models, and implementation phases
- **[docs/ERROR_HANDLING_LOG.md](./docs/ERROR_HANDLING_LOG.md)** - Error handling strategies, Edge Runtime limitations, Next.js 15 breaking changes
- **[DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md)** - Development progress log

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
