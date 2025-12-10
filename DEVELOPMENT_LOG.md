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

1. Nastavit PostgreSQL databázi
2. Napojit stránky na Payload CMS (nahradit mock data)
3. Nastavit Meilisearch a indexování
4. Vytvořit dynamickou stránku `/[locale]/[slug]`
5. Nakonfigurovat Resend doménu
6. Přidat Cookie Consent banner

---

*Log vytvořen: 2025-12-10*
