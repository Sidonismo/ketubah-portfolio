import { JsonLd } from './JsonLd';

interface ProductJsonLdProps {
  name: string;
  description: string;
  image: string | string[];
  url: string;
  sku: string;
  price?: number;
  priceCurrency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
}

export function ProductJsonLd({
  name,
  description,
  image,
  url,
  sku,
  price,
  priceCurrency = 'CZK',
  availability = 'InStock',
}: ProductJsonLdProps) {
  const images = Array.isArray(image) ? image : [image];

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: images,
    sku,
    url,
    ...(price && {
      offers: {
        '@type': 'Offer',
        price: price.toString(),
        priceCurrency,
        availability: `https://schema.org/${availability}`,
        url,
      },
    }),
  };

  return <JsonLd data={data} />;
}
