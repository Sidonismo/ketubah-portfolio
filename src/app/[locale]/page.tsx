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
        {/* Hero sekce */}
        <section className="container mx-auto px-4 py-16">
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
      </section>

      {/* Nejpopulárnější ketubot sekce */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-2">{t('popular.title')}</h2>
        <p className="text-muted mb-8">{t('popular.description')}</p>

        {/* Bento grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Hlavní produkt (2x2) */}
          <div className="col-span-2 row-span-2 relative bg-card-bg rounded-lg overflow-hidden group">
            {mainProduct ? (
              <Link href={`/products/${mainProduct.slug}`} className="block w-full h-full aspect-square">
                {mainProduct.images[0]?.image?.url ? (
                  <Image
                    src={mainProduct.images[0].image.url}
                    alt={mainProduct.images[0].alt || mainProduct.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
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
              <div className="aspect-square flex items-center justify-center">
                <span className="text-muted">Ketuba A (2x2)</span>
              </div>
            )}
          </div>

          {/* Ostatní produkty (1x1) */}
          {otherProducts.map((product) => (
            <div
              key={product.slug}
              className="relative bg-card-bg rounded-lg overflow-hidden group"
            >
              <Link href={`/products/${product.slug}`} className="block w-full h-full aspect-square">
                {product.images[0]?.image?.url ? (
                  <Image
                    src={product.images[0].image.url}
                    alt={product.images[0].alt || product.name}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                  <h3 className="text-white font-medium text-sm truncate">{product.name}</h3>
                </div>
              </Link>
            </div>
          ))}

          {/* Placeholder pokud není dostatek produktů */}
          {Array.from({ length: Math.max(0, 4 - otherProducts.length) }).map((_, i) => (
            <div
              key={`placeholder-${i}`}
              className="bg-card-bg rounded-lg aspect-square flex items-center justify-center"
            >
              <span className="text-muted">Ketuba {String.fromCharCode(66 + otherProducts.length + i)}</span>
            </div>
          ))}
        </div>

        {/* CTA pro zobrazení všech produktů */}
        <div className="text-center mt-8">
          <Link
            href="/products"
            className="inline-block border-2 border-black px-6 py-3 font-medium hover:bg-black hover:text-white transition-colors"
          >
            {t('hero.cta')}
          </Link>
        </div>
      </section>
    </main>
    </>
  );
}
