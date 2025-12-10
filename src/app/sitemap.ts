import type { MetadataRoute } from 'next';
import { locales } from '@/config/locales';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// TODO: Načíst produkty a stránky z Payload CMS
async function getProducts() {
  // Mock data
  return Array.from({ length: 12 }, (_, i) => ({
    slug: `ketubah-${i + 1}`,
    updatedAt: new Date().toISOString(),
  }));
}

async function getPages() {
  // Mock data
  return [
    { slug: 'about', updatedAt: new Date().toISOString() },
    { slug: 'faq', updatedAt: new Date().toISOString() },
    { slug: 'privacy', updatedAt: new Date().toISOString() },
    { slug: 'cookies', updatedAt: new Date().toISOString() },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const pages = await getPages();

  const urls: MetadataRoute.Sitemap = [];

  // Statické stránky pro každý jazyk
  const staticPages = ['', '/products', '/contact'];

  for (const locale of locales) {
    // Statické stránky
    for (const page of staticPages) {
      urls.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}${page}`])
          ),
        },
      });
    }

    // Produkty
    for (const product of products) {
      urls.push({
        url: `${BASE_URL}/${locale}/products/${product.slug}`,
        lastModified: new Date(product.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}/products/${product.slug}`])
          ),
        },
      });
    }

    // Dynamické stránky
    for (const page of pages) {
      urls.push({
        url: `${BASE_URL}/${locale}/${page.slug}`,
        lastModified: new Date(page.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}/${page.slug}`])
          ),
        },
      });
    }
  }

  return urls;
}
