import { getTranslations } from 'next-intl/server';
import { Link } from '@/components/ui/Link';
import type { Metadata } from 'next';
import { getPopularProducts } from '@/lib/queries';
import { getExchangeRates } from '@/lib/cnb';
import { formatConvertedPrice, getDefaultCurrency } from '@/lib/currency';
import Image from 'next/image';
import { WebsiteJsonLd, OrganizationJsonLd } from '@/components/seo/JsonLd';
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

  // Paralelní načtení populárních produktů a kurzů měn
  const [popularProducts, exchangeRates] = await Promise.all([
    getPopularProducts(locale, 5),
    getExchangeRates(),
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
        {/* Hero sekce - světlé pozadí */}
        <section className="bg-gradient-to-br from-white via-gray-50 to-white">
          <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Text */}
          <div>
            <span className="inline-block bg-primary text-black px-3 py-1 text-sm rounded-full mb-4">
              {t('hero.badge')}
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">
              {t('hero.title')}
            </h1>
            <p className="text-muted text-lg mb-6">
              {t('hero.description')}
            </p>
            <Link
              href="/products"
              className="inline-block border-2 border-black px-6 py-3 font-medium hover:bg-black hover:text-white transition-colors"
            >
              {t('hero.cta')}
            </Link>
          </div>

          {/* Featured obrázek */}
          <div className="relative bg-card-bg rounded-lg aspect-[3/4] overflow-hidden">
            {mainProduct?.images[0]?.image?.url ? (
              <Link href={`/products/${mainProduct.slug}`} className="block w-full h-full">
                <Image
                  src={mainProduct.images[0].image.url}
                  alt={mainProduct.images[0].alt || mainProduct.name}
                  fill
                  className="object-contain hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
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

        {/* Novinky sekce - barevný gradient */}
        <section className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
          <div className="container mx-auto px-4 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Text vlevo */}
              <div className="order-2 lg:order-1">
                <span className="inline-block bg-primary text-black px-3 py-1 text-sm rounded-full mb-4">
                  {t('news.badge')}
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  {t('news.title')}
                </h2>
                <p className="text-muted text-lg mb-6 leading-relaxed">
                  {t('news.description')}
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-muted">{t('news.feature1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-muted">{t('news.feature2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-muted">{t('news.feature3')}</span>
                  </li>
                </ul>
                <Link
                  href="/products"
                  className="inline-block bg-primary text-black px-6 py-3 rounded font-bold hover:bg-primary-hover transition-colors"
                >
                  {t('news.cta')}
                </Link>
              </div>

              {/* Obrázek vpravo */}
              <div className="order-1 lg:order-2">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  {otherProducts[0]?.images[0]?.image?.url ? (
                    <Image
                      src={otherProducts[0].images[0].image.url}
                      alt={otherProducts[0].images[0].alt || t('news.imageAlt')}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-muted">{t('news.imageAlt')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nejpopulárnější ketubot sekce - světlejší pozadí */}
        <section className="bg-gradient-to-bl from-white via-slate-50 to-gray-50">
          <div className="container mx-auto px-4 py-16">
  <h2 className="text-3xl font-bold mb-2">{t('popular.title')}</h2>
  <p className="text-muted mb-8">{t('popular.description')}</p>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 lg:grid-rows-8 gap-4">
    {/* --- MAIN PRODUCT (col-span 2, row-span 8) --- */}
    <div className="relative bg-card-bg rounded-lg overflow-hidden group lg:col-span-4 lg:row-span-8">
      {mainProduct ? (
        <Link href={`/products/${mainProduct.slug}`} className="block w-full h-full">
          <div className="w-full h-full relative aspect-[0.707]">
            <Image
              src={mainProduct.images[0]?.image?.url}
              alt={mainProduct.images[0]?.alt || mainProduct.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <h3 className="text-white font-bold text-lg">{mainProduct.name}</h3>
            {mainProduct.prices.originalAvailable && (
              <span className="inline-block bg-green-500 text-white text-xs px-2 py-0.5 rounded mt-1">
                Originál dostupný
              </span>
            )}
          </div>
        </Link>
      ) : (
        <div className="flex items-center justify-center h-full aspect-[0.707]">
          <span className="text-muted">Ketuba 1</span>
        </div>
      )}
    </div>

    {/* --- OTHER PRODUCTS --- */}
    {otherProducts.map((product, i) => {
      const desktopPositions = [
        "lg:col-span-2 lg:row-span-4 lg:col-start-5",
        "lg:col-span-2 lg:row-span-4 lg:col-start-7",
        "lg:col-span-2 lg:row-span-4 lg:col-start-5 lg:row-start-5",
        "lg:col-span-2 lg:row-span-4  lg:col-start-7 lg:row-start-5",
      ];

      return (
        <div
          key={product.slug}
          className={`relative bg-card-bg rounded-lg overflow-hidden group ${desktopPositions[i] || ""}`}
        >
          <Link href={`/products/${product.slug}`} className="block w-full h-full">
            <div className="w-full h-full relative aspect-[0.707]">
              <Image
                src={product.images[0]?.image?.url}
                alt={product.images[0]?.alt || product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
              <h3 className="text-white font-medium text-sm truncate">{product.name}</h3>
            </div>
          </Link>
        </div>
      );
    })}
  </div>

          {/* CTA */}
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
      </main>
    </>
  );
}
