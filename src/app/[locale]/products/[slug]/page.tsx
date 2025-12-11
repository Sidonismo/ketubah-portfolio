import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductGallery } from '@/components/products/ProductGallery';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Link } from '@/components/ui/Link';
import { getExchangeRates } from '@/lib/cnb';
import { formatConvertedPrice, getDefaultCurrency } from '@/lib/currency';
import { getProductBySlug, getRelatedProducts } from '@/lib/queries';
import { BreadcrumbsJsonLd, ProductJsonLd } from '@/components/seo/JsonLd';
import { siteConfig } from '@/config/site';

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug, locale);

  if (!product) {
    return { title: 'Product not found' };
  }

  return {
    title: product.name,
    description: product.shortDescription,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'products' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  const product = await getProductBySlug(slug, locale);
  if (!product) {
    notFound();
  }

  const exchangeRates = await getExchangeRates();
  const currency = getDefaultCurrency(locale);
  const relatedProducts = await getRelatedProducts(
    product.category?.slug || 'traditional',
    slug,
    locale,
    4
  );

  // Breadcrumbs data pro JSON-LD
  const breadcrumbItems = [
    { name: tCommon('home'), url: `${siteConfig.url}/${locale}` },
    { name: t('title'), url: `${siteConfig.url}/${locale}/products` },
    { name: product.name, url: `${siteConfig.url}/${locale}/products/${product.slug}` },
  ];

  // Product offers pro JSON-LD (ceny v CZK)
  const offers = [];
  if (product.prices.gicleeAvailable && product.prices.giclee) {
    offers.push({
      price: product.prices.giclee,
      priceCurrency: 'CZK',
      availability: 'https://schema.org/InStock',
      name: t('gicleePrice'),
    });
  }
  if (product.prices.originalAvailable && product.prices.original) {
    offers.push({
      price: product.prices.original,
      priceCurrency: 'CZK',
      availability: 'https://schema.org/InStock',
      name: t('originalPrice'),
    });
  }

  return (
    <>
      {/* JSON-LD pro product detail */}
      <BreadcrumbsJsonLd items={breadcrumbItems} />
      <ProductJsonLd
        name={product.name}
        description={product.shortDescription}
        image={product.images[0]?.image?.url}
        url={`${siteConfig.url}/${locale}/products/${product.slug}`}
        offers={offers}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="text-sm text-muted mb-6">
        <Link href="/" className="hover:text-text">{tCommon('home')}</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-text">{t('title')}</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-text">{product.name}</span>
      </nav>

      {/* Hlavní obsah */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Galerie */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Info */}
        <div>
          {/* Kategorie */}
          {product.category && (
            <span className="inline-block bg-gray-100 text-sm px-3 py-1 rounded-full mb-4">
              {product.category.name}
            </span>
          )}

          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <p className="text-muted mb-6">{product.shortDescription}</p>

          {/* Ceny */}
          <div className="space-y-3 mb-6">
            {product.prices.gicleeAvailable && product.prices.giclee && (
              <div className="flex justify-between items-center p-4 bg-card-bg rounded">
                <span>{t('gicleePrice')}</span>
                <span className="font-bold text-lg">
                  {formatConvertedPrice(product.prices.giclee, currency, exchangeRates)}
                </span>
              </div>
            )}
            {product.prices.originalAvailable && product.prices.original && (
              <div className="flex justify-between items-center p-4 bg-card-bg rounded border-2 border-green-500">
                <span className="flex items-center gap-2">
                  {t('originalPrice')}
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                    {t('originalAvailable')}
                  </span>
                </span>
                <span className="font-bold text-lg">
                  {formatConvertedPrice(product.prices.original, currency, exchangeRates)}
                </span>
              </div>
            )}
          </div>

          {/* Rozměry */}
          {product.dimensions && (
            <p className="text-sm text-muted mb-4">
              {t('dimensions')}: {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit}
            </p>
          )}

          {/* CTA */}
          <Link
            href={`/contact?product=${product.slug}`}
            className="block w-full bg-primary text-black text-center py-3 rounded font-bold text-lg hover:bg-primary-hover transition-colors mb-6"
          >
            {t('interested')}
          </Link>

          {/* Tagy */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {product.tags.map((tag) => (
                <span
                  key={tag.slug}
                  className="text-sm border border-gray-300 px-3 py-1 rounded-full"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Barvy */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <span
                  key={color.hexCode}
                  className="w-8 h-8 rounded-full border border-gray-300"
                  style={{ backgroundColor: color.hexCode }}
                  title={color.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Popis */}
      {product.description && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">{t('description')}</h2>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </section>
      )}

      {/* Související produkty */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">{t('relatedProducts')}</h2>
          <ProductGrid products={relatedProducts} exchangeRates={exchangeRates} />
        </section>
      )}
    </div>
    </>
  );
}
