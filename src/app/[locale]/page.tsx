import { getTranslations } from 'next-intl/server';
import { Link } from '@/components/ui/Link';
import type { Metadata } from 'next';
import { getPopularProducts, getFeaturedReviews, getReviewsStats } from '@/lib/queries';
import { getExchangeRates } from '@/lib/cnb';
import { formatConvertedPrice, getDefaultCurrency } from '@/lib/currency';
import Image from 'next/image';
import { WebsiteJsonLd, OrganizationJsonLd } from '@/components/seo/JsonLd';
import { ReviewsSection } from '@/components/home/ReviewsSection';
import { siteConfig } from '@/config/site';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });

  return {
    title: t('hero.title'),
    description: t('hero.description'),
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });

  // Paralelní načtení populárních produktů, recenzí, kurzů měn a statistik
  const [popularProducts, exchangeRates, reviews, reviewsStats] = await Promise.all([
    getPopularProducts(locale, 5),
    getExchangeRates(),
    getFeaturedReviews(3),
    getReviewsStats(),
  ]);

  const currency = getDefaultCurrency(locale);

  // Hlavní produkt (největší, první v gridu)
  const mainProduct = popularProducts[0];
  // Ostatní produkty
  const otherProducts = popularProducts.slice(1, 5);

  return (
    <>
      {/* JSON-LD pro homepage */}
      <WebsiteJsonLd
        name={siteConfig.name}
        url={`${siteConfig.url}/${locale}`}
        description={t('hero.description')}
      />
      <OrganizationJsonLd
        name={siteConfig.name}
        url={siteConfig.url}
        logo={`${siteConfig.url}/logo.png`}
        email={siteConfig.contact.email}
      />

      <main className="min-h-screen">
        {/* Hero sekce - dvě vrstvy gradientů:
            1. Top layer: dekorativní gradient (fialová → žlutá → tyrkysová, opacity 0.08)
            2. Bottom layer: primární gradient (růžová → modrá, opacity 0.35/0.3)
        */}
        <section style={{ backgroundImage: 'linear-gradient(to right, rgba(28, 5, 31, 0.08), rgba(31, 28, 5, 0.08), rgba(5, 31, 28, 0.08), rgba(31, 28, 5, 0.08), rgba(28, 5, 31, 0.08)), linear-gradient(135deg, white, rgb(255 220 230 / 0.35), rgb(220 240 255 / 0.3), white)' }} className="relative">
          <div className="container mx-auto px-4 py-16 relative">
            {/* Dvousloupcový layout: text vlevo, featured obrázek vpravo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Textová sekce s badge, nadpisem a CTA tlačítkem */}

              <div className="relative z-10">
                {/* Malý badge nahoře pro zdůraznění */}
                <span className="inline-block bg-primary text-black px-3 py-1 text-sm rounded-full mb-4">
                  {t('hero.badge')}
                </span>
                {/* Hlavní nadpis posazený nahoře */}
                <h1 className="text-4xl lg:text-6xl font-bold mb-12">
                  {t('hero.title')}
                </h1>

                {/* Popis s neutrální barvou */}
                <p className="text-muted text-lg mb-6">
                  {t('hero.description')}
                </p>
                {/* CTA tlačítko s border, hover efekt změní na solid background */}
                <Link
                  href="/products"
                  className="inline-block border-2 border-black px-6 py-3 font-medium hover:bg-black hover:text-white transition-colors"
                >
                  {t('hero.cta')}
                </Link>

                {/* Dekorativní osmička - symbol nekonečna - pouze na lg obrazovkách */}
                <div className="mt-12 hidden lg:flex justify-start">
                  <svg width="300" height="240" viewBox="0 0 300 140" fill="none" className="opacity-5">
                    <path d="M20 70C20 35 50 15 90 15C130 15 150 35 150 70C150 105 130 125 90 125C50 125 20 105 20 70M150 70C150 35 170 15 210 15C250 15 280 35 280 70C280 105 250 125 210 125C170 125 150 105 150 70"
                      stroke="rgb(130 80 130)" strokeWidth="30" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Featured obrázek - portrait formát (3:4) s hover zoomem */}
              <div className="relative bg-card-bg rounded-lg aspect-[3/4] overflow-hidden lg:mt-0">
                {/* Dekorativní osmička za obrázkem */}
                <svg className="absolute -right-20 -bottom-20 opacity-25 pointer-events-none -z-10" width="350" height="180" viewBox="0 0 350 180" fill="none">
                  <path d="M25 90C25 45 60 15 115 15C170 15 195 45 195 90C195 135 170 165 115 165C60 165 25 135 25 90M195 90C195 45 220 15 275 15C330 15 365 45 365 90C365 135 330 165 275 165C220 165 195 135 195 90"
                    stroke="rgb(130 80 130)" strokeWidth="20" strokeLinecap="round" />
                </svg>
                {mainProduct?.images[0]?.image?.url ? (
                  <Link href={`/products/${mainProduct.slug}`} className="block w-full h-full">
                    {/* Obrázek s contain fit (zachová poměr stran) a hover zoom efektem */}
                    <Image
                      src={mainProduct.images[0].image.url}
                      alt={mainProduct.images[0].alt || mainProduct.name}
                      fill
                      className="object-contain hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                    {/* Přechodový gradient na spodu pro čitelnost textu */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                      <h3 className="text-white font-bold text-lg">{mainProduct.name}</h3>
                      {mainProduct.prices.giclee && (
                        <p className="text-white/80 text-sm">
                          {formatConvertedPrice(mainProduct.prices.giclee, currency, exchangeRates)}
                        </p>
                      )}
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-muted">Featured Ketuba</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Novinky sekce - dvě vrstvy gradientů:
            1. Top layer: dekorativní gradient (fialová → žlutá → tyrkysová, opacity 0.08)
            2. Bottom layer: primární gradient (žlutá → oranžová, opacity 0.1-0.35)
        */}
        <section style={{ backgroundImage: 'linear-gradient(to right, rgba(28, 5, 31, 0.08), rgba(31, 28, 5, 0.08), rgba(5, 31, 28, 0.08), rgba(31, 28, 5, 0.08), rgba(28, 5, 31, 0.08)), linear-gradient(to right, rgb(254 252 232 / 0.1), rgb(253 230 138 / 0.3), rgb(254 215 170 / 0.35))' }}>
          <div className="container mx-auto px-4 py-16">
            {/* Dvousloupcový layout s reordering: na mobilu obrázek nahoře, na desktopech text vlevo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Text sekce s badge, nadpisem, featurami a CTA */}
              <div className="order-2 lg:order-1">
                <span className="inline-block bg-primary text-black px-3 py-1 text-sm rounded-full mb-4">
                  {t('news.badge')}
                </span>
                {/* Nadpis sekce */}
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  {t('news.title')}
                </h2>
                {/* Popis s zvýšenou řádkovací výškou pro čitelnost */}
                <p className="text-muted text-lg mb-6 leading-relaxed">
                  {t('news.description')}
                </p>
                {/* Seznam features s ikonami zaškrtnutí */}
                <ul className="space-y-3 mb-6">
                  {/* Feature 1 - checkmark ikona vlevo */}
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-muted">{t('news.feature1')}</span>
                  </li>
                  {/* Feature 2 - checkmark ikona vlevo */}
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-muted">{t('news.feature2')}</span>
                  </li>
                  {/* Feature 3 - checkmark ikona vlevo */}
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-muted">{t('news.feature3')}</span>
                  </li>
                </ul>
                {/* CTA tlačítko se solidním background (na rozdíl od hero tlačítka) */}
                <Link
                  href="/products"
                  className="inline-block bg-primary text-black px-6 py-3 rounded font-bold hover:bg-primary-hover transition-colors"
                >
                  {t('news.cta')}
                </Link>
              </div>

              {/* Obrázek vpravo s reordering (na mobilu nahoře) */}
              <div className="order-1 lg:order-2">
                {/* Landscape formát (4:3) s větším border-radius a shadow */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  {otherProducts[0]?.images[0]?.image?.url ? (
                    /* Obrázek s cover fit (vyplní prostor) */
                    <Image
                      src={otherProducts[0].images[0].image.url}
                      alt={otherProducts[0].images[0].alt || t('news.imageAlt')}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    /* Fallback placeholder s gradientem */
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-muted">{t('news.imageAlt')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nejpopulárnější ketubot sekce - dvě vrstvy gradientů:
            1. Top layer: dekorativní gradient (fialová → žlutá → tyrkysová, opacity 0.08)
            2. Bottom layer: primární gradient (růžová zdola nahoru, opacity 0.4)
        */}
        <section style={{ backgroundImage: 'linear-gradient(to right, rgba(28, 5, 31, 0.08), rgba(31, 28, 5, 0.08), rgba(5, 31, 28, 0.08), rgba(31, 28, 5, 0.08), rgba(28, 5, 31, 0.08)), linear-gradient(to top, rgb(255 182 193 / 0.4), white)' }}>
          <div className="container mx-auto px-4 py-16">
            {/* Nadpis a popis sekce */}
            <h2 className="text-3xl font-bold mb-2">{t('popular.title')}</h2>
            <p className="text-muted mb-8">{t('popular.description')}</p>

            {/* Asymetrický grid: hlavní produkt vlevo (4 sloupce), 4 menší produkty vpravo (2x2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 lg:grid-rows-8 gap-4">
              {/* HLAVNÍ PRODUKT - velký (4 sloupce, 8 řad na desktopu) */}
              <div className="relative bg-card-bg rounded-lg overflow-hidden group lg:col-span-4 lg:row-span-8">
                {mainProduct ? (
                  <Link href={`/products/${mainProduct.slug}`} className="block w-full h-full">
                    {/* Portrait formát (0.707 = 1/√2) s hover zoomem */}
                    <div className="w-full h-full relative aspect-[0.707]">
                      <Image
                        src={mainProduct.images[0]?.image?.url}
                        alt={mainProduct.images[0]?.alt || mainProduct.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {/* Overlay s informacemi - viditelný i bez hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                      <h3 className="text-white font-bold text-lg">{mainProduct.name}</h3>
                      {/* Badge pro dostupné originály */}
                      {mainProduct.prices.originalAvailable && (
                        <span className="inline-block bg-green-500 text-white text-xs px-2 py-0.5 rounded mt-1">
                          Originál dostupný
                        </span>
                      )}
                    </div>
                  </Link>
                ) : (
                  /* Fallback placeholder */
                  <div className="flex items-center justify-center h-full aspect-[0.707]">
                    <span className="text-muted">Ketuba 1</span>
                  </div>
                )}
              </div>

              {/* VEDLEJŠÍ PRODUKTY - 4 menší položky v 2x2 gridu vpravo */}
              {otherProducts.map((product, i) => {
                /* Grid pozice: 2 produkty v 1. řadě (top-right), 2 v 2. řadě (bottom-right) */
                const desktopPositions = [
                  "lg:col-span-2 lg:row-span-4 lg:col-start-5",        /* Top-left (col 5-6) */
                  "lg:col-span-2 lg:row-span-4 lg:col-start-7",        /* Top-right (col 7-8) */
                  "lg:col-span-2 lg:row-span-4 lg:col-start-5 lg:row-start-5", /* Bottom-left */
                  "lg:col-span-2 lg:row-span-4  lg:col-start-7 lg:row-start-5", /* Bottom-right */
                ];

                return (
                  <div
                    key={product.slug}
                    className={`relative bg-card-bg rounded-lg overflow-hidden group ${desktopPositions[i] || ""}`}
                  >
                    <Link href={`/products/${product.slug}`} className="block w-full h-full">
                      {/* Portrait obrázek s hover zoomem */}
                      <div className="w-full h-full relative aspect-[0.707]">
                        <Image
                          src={product.images[0]?.image?.url}
                          alt={product.images[0]?.alt || product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      {/* Malý overlay s jménem (truncated kvůli prostoru) */}
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                        <h3 className="text-white font-medium text-sm truncate">{product.name}</h3>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Call-to-action tlačítko na konci sekce */}
            <div className="text-center mt-8">
              <Link
                href="/products"
                className="inline-block border-2 border-black px-6 py-3 font-medium hover:bg-black hover:text-white transition-colors"
              >
                {t('hero.cta')}
              </Link>
            </div>
          </div>
        </section>

        {/* Sekce s recenzemi - dvě vrstvy gradientů:
            1. Top layer: dekorativní gradient (fialová → žlutá → tyrkysová, opacity 0.08)
            2. Bottom layer: primární gradient (modrá → oranžová, opacity 0.05)
        */}
        <ReviewsSection reviews={reviews} stats={reviewsStats} />
      </main>
    </>
  );
}
