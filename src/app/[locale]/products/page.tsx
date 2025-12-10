import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductFilters } from '@/components/products/ProductFilters';
import { Pagination } from '@/components/products/Pagination';
import { getExchangeRates } from '@/lib/cnb';
import { getProducts, getCategories } from '@/lib/queries';
import { Link } from '@/components/ui/Link';

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
  const { page = '1', q, category } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'common' });
  const tProducts = await getTranslations({ locale, namespace: 'products' });

  const currentPage = parseInt(page, 10) || 1;

  // Paralelní načtení dat
  const [exchangeRates, productsData, categories] = await Promise.all([
    getExchangeRates(),
    getProducts({
      locale,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      category,
      search: q,
    }),
    getCategories(locale),
  ]);

  const { products, totalPages } = productsData;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-muted mb-6">
        <Link href="/" className="hover:text-text">{t('home')}</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-text">{tProducts('title')}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">{tProducts('title')}</h1>

        {/* Filtry kategorií */}
        <ProductFilters
          categories={categories}
          selectedCategory={category}
          locale={locale}
          labels={{
            all: tProducts('allCategories'),
            category: tProducts('category'),
          }}
        />
      </div>

      {/* Vyhledávací dotaz */}
      {q && (
        <p className="mb-6 text-muted">
          Výsledky pro: <span className="font-medium text-text">&quot;{q}&quot;</span>
        </p>
      )}

      {/* Grid produktů */}
      {products.length > 0 ? (
        <>
          <ProductGrid products={products} exchangeRates={exchangeRates} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/products"
          />
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted text-lg">{tProducts('noResults')}</p>
        </div>
      )}
    </div>
  );
}
