import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Pagination } from '@/components/products/Pagination';
import { getExchangeRates } from '@/lib/cnb';

interface ProductsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; q?: string; category?: string }>;
}

const ITEMS_PER_PAGE = 6;

export async function generateMetadata({
  params,
}: ProductsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'products' });

  return {
    title: t('title'),
  };
}

export default async function ProductsPage({
  params,
  searchParams,
}: ProductsPageProps) {
  const { locale } = await params;
  const { page = '1', q, category: _category } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'products' });

  const currentPage = parseInt(page, 10) || 1;

  // Načtení kurzů měn
  const exchangeRates = await getExchangeRates();

  // TODO: Načtení produktů z Payload CMS
  // Pro teď použijeme placeholder data
  const mockProducts = Array.from({ length: 12 }, (_, i) => ({
    slug: `ketubah-${i + 1}`,
    name: `Ketubah ${i + 1}`,
    shortDescription: `Krásná ručně malovaná ketuba s tradičními motivy. Každý kus je originál s možností personalizace.`,
    prices: {
      giclee: 5900 + i * 1000,
      gicleeAvailable: true,
      original: 15000 + i * 5000,
      originalAvailable: i % 3 === 0,
    },
    images: [
      {
        image: { url: '/placeholder.jpg' },
        alt: `Ketubah ${i + 1}`,
        isMain: true,
      },
    ],
  }));

  // Paginace
  const totalItems = mockProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = mockProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-muted mb-6">
        <span>Domů</span>
        <span className="mx-2">/</span>
        <span className="font-medium text-text">{t('title')}</span>
      </nav>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>

        {/* TODO: Filtry */}
        <button className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 transition-colors">
          {t('filters')}
        </button>
      </div>

      {/* Vyhledávací dotaz */}
      {q && (
        <p className="mb-6 text-muted">
          Výsledky pro: <span className="font-medium text-text">&quot;{q}&quot;</span>
        </p>
      )}

      {/* Grid produktů */}
      {paginatedProducts.length > 0 ? (
        <>
          <ProductGrid products={paginatedProducts} exchangeRates={exchangeRates} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/products"
          />
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted text-lg">{t('noResults')}</p>
        </div>
      )}
    </div>
  );
}
