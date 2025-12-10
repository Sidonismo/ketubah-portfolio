import { MeiliSearch } from 'meilisearch';

// Meilisearch klient
export const meilisearch = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_ADMIN_KEY,
});

// Search-only klient pro frontend
export const searchClient = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_SEARCH_KEY,
});

// Index produktů
export const productsIndex = meilisearch.index('products');

// Konfigurace indexu pro vícejazyčné vyhledávání
export async function configureProductsIndex() {
  await productsIndex.updateSettings({
    searchableAttributes: [
      'name_cs',
      'name_en',
      'name_he',
      'description_cs',
      'description_en',
      'description_he',
      'tags',
    ],
    filterableAttributes: ['category', 'inStock', 'popularity', 'colors', 'tags'],
    sortableAttributes: ['popularity', 'createdAt', 'prices.giclee'],
  });
}

// Mapping locale na suffix pole
const LOCALE_SUFFIX: Record<string, string> = {
  cs: '_cs',
  en: '_en',
  he: '_he',
};

// Vyhledávání produktů
export async function searchProducts(
  query: string,
  locale: string,
  options?: {
    limit?: number;
    offset?: number;
    filter?: string[];
  }
) {
  const suffix = LOCALE_SUFFIX[locale] || '_cs';

  return await productsIndex.search(query, {
    limit: options?.limit || 10,
    offset: options?.offset || 0,
    filter: options?.filter,
    attributesToRetrieve: [
      `name${suffix}`,
      'slug',
      'images',
      'prices',
      'category',
      'inStock',
    ],
    attributesToSearchOn: [`name${suffix}`, `description${suffix}`],
  });
}
