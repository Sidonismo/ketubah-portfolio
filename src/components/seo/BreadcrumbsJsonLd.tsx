import { JsonLd } from './JsonLd';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsJsonLdProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbsJsonLd({ items }: BreadcrumbsJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLd data={data} />;
}
