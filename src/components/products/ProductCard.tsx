'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/components/ui/Link';
import { useCurrency } from '@/components/layout/CurrencySwitcher';
import { formatConvertedPrice } from '@/lib/currency';
import type { ExchangeRates } from '@/lib/cnb';

interface ProductCardProps {
  product: {
    slug: string;
    name: string;
    shortDescription?: string;
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
  };
  exchangeRates: ExchangeRates;
}

export function ProductCard({ product, exchangeRates }: ProductCardProps) {
  const t = useTranslations('products');
  const currency = useCurrency();

  // Získání hlavního obrázku
  const mainImage = product.images.find((img) => img.isMain) || product.images[0];
  const imageUrl = mainImage?.image?.sizes?.card?.url || mainImage?.image?.url || '/placeholder.jpg';

  // Nejnižší dostupná cena
  const lowestPrice = product.prices.gicleeAvailable && product.prices.giclee
    ? product.prices.giclee
    : product.prices.original;

  return (
    <div className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Obrázek */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-[4/3] bg-card-bg">
        {/* Badge pro originál */}
        {product.prices.originalAvailable && (
          <span className="absolute top-2 left-2 z-10 bg-green-500 text-white text-xs px-2 py-1 rounded">
            {t('originalAvailable')}
          </span>
        )}

        {/* Rám obrázku */}
        <div className="absolute inset-4 border-4 border-frame bg-white p-2">
          <div className="relative w-full h-full">
            <Image
              src={imageUrl}
              alt={mainImage?.alt || product.name}
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-lg mb-1 hover:text-primary-hover transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.shortDescription && (
          <p className="text-sm text-muted mb-2 line-clamp-2">
            {product.shortDescription}
          </p>
        )}

        {lowestPrice && (
          <p className="text-sm text-muted">
            {t('from')} <span className="font-bold text-text">{formatConvertedPrice(lowestPrice, currency, exchangeRates)}</span>
          </p>
        )}
      </div>
    </div>
  );
}
