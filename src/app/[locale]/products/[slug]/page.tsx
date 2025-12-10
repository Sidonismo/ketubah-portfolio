import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductGallery } from '@/components/products/ProductGallery';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Link } from '@/components/ui/Link';
import { getExchangeRates } from '@/lib/cnb';
import { formatConvertedPrice, getDefaultCurrency } from '@/lib/currency';

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// TODO: Načtení produktu z Payload CMS
async function getProduct(slug: string, _locale: string) {
  // Mock data pro teď
  if (slug.startsWith('ketubah-')) {
    const id = parseInt(slug.replace('ketubah-', ''), 10);
    return {
      slug,
      name: `Jerusalem Ketubah ${id}`,
      shortDescription: 'Tradiční ketuba s motivem Jeruzaléma, ručně malovaná temperovými barvami na pergamenu.',
      description: '<p>Tato ketuba je inspirována starými jeruzalémskými motivy a kombinuje tradiční techniky s moderním designem. Každý kus je originál, ručně malovaný temperovými barvami.</p><p>Ketuba může být personalizována podle vašich požadavků - text, barvy, velikost.</p>',
      prices: {
        giclee: 5900 + id * 1000,
        gicleeAvailable: true,
        original: 15000 + id * 5000,
        originalAvailable: id % 3 === 0,
      },
      dimensions: {
        width: 50,
        height: 70,
        unit: 'cm',
      },
      images: [
        { image: { url: '/placeholder.jpg', width: 1200, height: 900 }, alt: `${slug} - hlavní`, isMain: true },
        { image: { url: '/placeholder.jpg', width: 1200, height: 900 }, alt: `${slug} - detail 1` },
        { image: { url: '/placeholder.jpg', width: 1200, height: 900 }, alt: `${slug} - detail 2` },
      ],
      category: { name: 'Tradiční', slug: 'traditional' },
      tags: [
        { name: 'Jeruzalém', slug: 'jerusalem' },
        { name: 'Tradiční', slug: 'traditional' },
      ],
      colors: [
        { name: 'Zlatá', hexCode: '#FFD700' },
        { name: 'Modrá', hexCode: '#1E40AF' },
      ],
    };
  }
  return null;
}

// TODO: Načtení souvisejících produktů
async function getRelatedProducts(_categorySlug: string, _currentSlug: string) {
  return Array.from({ length: 4 }, (_, i) => ({
    slug: `ketubah-${i + 10}`,
    name: `Related Ketubah ${i + 1}`,
    prices: {
      giclee: 5900 + i * 1000,
      gicleeAvailable: true,
      original: 15000 + i * 5000,
      originalAvailable: i % 2 === 0,
    },
    images: [
      { image: { url: '/placeholder.jpg' }, alt: `Related ${i + 1}`, isMain: true },
    ],
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProduct(slug, locale);

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

  const product = await getProduct(slug, locale);
  if (!product) {
    notFound();
  }

  const exchangeRates = await getExchangeRates();
  const currency = getDefaultCurrency(locale);
  const relatedProducts = await getRelatedProducts(product.category.slug, slug);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-muted mb-6">
        <Link href="/" className="hover:text-text">Domů</Link>
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
          <span className="inline-block bg-gray-100 text-sm px-3 py-1 rounded-full mb-4">
            {product.category.name}
          </span>

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
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">{t('description')}</h2>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      </section>

      {/* Související produkty */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">{t('relatedProducts')}</h2>
          <ProductGrid products={relatedProducts} exchangeRates={exchangeRates} />
        </section>
      )}
    </div>
  );
}
