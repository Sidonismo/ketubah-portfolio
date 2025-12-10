import { ProductCard } from './ProductCard';
import type { ExchangeRates } from '@/lib/cnb';

interface Product {
  slug: string;
  name: string;
  prices: {
    giclee?: number;
    gicleeAvailable?: boolean;
    original?: number;
    originalAvailable?: boolean;
  };
  images: Array<{
    image: {
      url?: string;
      sizes?: {
        card?: { url?: string };
      };
    };
    alt: string;
    isMain?: boolean;
  }>;
}

interface ProductGridProps {
  products: Product[];
  exchangeRates: ExchangeRates;
}

export function ProductGrid({ products, exchangeRates }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.slug}
          product={product}
          exchangeRates={exchangeRates}
        />
      ))}
    </div>
  );
}
