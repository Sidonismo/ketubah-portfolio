import { getPayloadClient } from './payload';
import type { Where } from 'payload';

// Typy pro produkty
export interface ProductImage {
  image: {
    url: string;
    width?: number;
    height?: number;
  };
  alt: string;
  isMain?: boolean;
}

export interface ProductCategory {
  name: string;
  slug: string;
}

export interface ProductTag {
  name: string;
  slug: string;
}

export interface ProductColor {
  name: string;
  hexCode: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  description?: string;
  prices: {
    giclee?: number;
    gicleeAvailable?: boolean;
    original?: number;
    originalAvailable?: boolean;
  };
  dimensions?: {
    width?: number;
    height?: number;
    unit?: string;
  };
  images: ProductImage[];
  category?: ProductCategory;
  tags?: ProductTag[];
  colors?: ProductColor[];
  popularity?: number;
  inStock?: boolean;
}

export interface PaginatedProducts {
  products: Product[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

// Pomocná funkce pro serializaci Payload dat
function serializeProduct(doc: Record<string, unknown>): Product {
  // Extrakce hlavního obrázku z images array
  const images = (doc.images as Array<Record<string, unknown>> || []).map((img) => {
    const imageData = img.image as Record<string, unknown> | undefined;
    return {
      image: {
        url: imageData?.url as string || '/placeholder.jpg',
        width: imageData?.width as number | undefined,
        height: imageData?.height as number | undefined,
      },
      alt: (img.alt as string) || (doc.name as string) || '',
      isMain: img.isMain as boolean | undefined,
    };
  });

  // Extrakce kategorie
  const categoryData = doc.category as Record<string, unknown> | undefined;
  const category = categoryData
    ? {
        name: categoryData.name as string || '',
        slug: categoryData.slug as string || '',
      }
    : undefined;

  // Extrakce tagů
  const tagsData = doc.tags as Array<Record<string, unknown>> | undefined;
  const tags = tagsData?.map((tag) => ({
    name: tag.name as string || '',
    slug: tag.slug as string || '',
  }));

  // Extrakce barev
  const colorsData = doc.colors as Array<Record<string, unknown>> | undefined;
  const colors = colorsData?.map((color) => ({
    name: color.name as string || '',
    hexCode: color.hexCode as string || '#000000',
  }));

  // Extrakce cen
  const pricesData = doc.prices as Record<string, unknown> | undefined;
  const prices = {
    giclee: pricesData?.giclee as number | undefined,
    gicleeAvailable: pricesData?.gicleeAvailable as boolean | undefined,
    original: pricesData?.original as number | undefined,
    originalAvailable: pricesData?.originalAvailable as boolean | undefined,
  };

  // Extrakce rozměrů
  const dimensionsData = doc.dimensions as Record<string, unknown> | undefined;
  const dimensions = dimensionsData
    ? {
        width: dimensionsData.width as number | undefined,
        height: dimensionsData.height as number | undefined,
        unit: dimensionsData.unit as string | undefined,
      }
    : undefined;

  // Extrakce description (může být richText nebo string)
  let description = '';
  if (typeof doc.description === 'string') {
    description = doc.description;
  } else if (doc.description && typeof doc.description === 'object') {
    // RichText je objekt - převedeme na HTML string
    description = richTextToHtml(doc.description);
  }

  return {
    id: doc.id as string,
    slug: doc.slug as string,
    name: doc.name as string,
    shortDescription: doc.shortDescription as string | undefined,
    description,
    prices,
    dimensions,
    images: images.length > 0 ? images : [{ image: { url: '/placeholder.jpg' }, alt: doc.name as string || '' }],
    category,
    tags,
    colors,
    popularity: doc.popularity as number | undefined,
    inStock: doc.inStock as boolean | undefined,
  };
}

// Převod Payload RichText na HTML
function richTextToHtml(richText: unknown): string {
  if (!richText || typeof richText !== 'object') return '';

  const rt = richText as { root?: { children?: Array<Record<string, unknown>> } };
  if (!rt.root?.children) return '';

  return rt.root.children.map((node) => nodeToHtml(node)).join('');
}

function nodeToHtml(node: Record<string, unknown>): string {
  const type = node.type as string;
  const children = node.children as Array<Record<string, unknown>> | undefined;
  const text = node.text as string | undefined;

  // Textový uzel
  if (text !== undefined) {
    let result = text;
    if (node.bold) result = `<strong>${result}</strong>`;
    if (node.italic) result = `<em>${result}</em>`;
    if (node.underline) result = `<u>${result}</u>`;
    return result;
  }

  // Element uzly
  const childrenHtml = children?.map((child) => nodeToHtml(child)).join('') || '';

  switch (type) {
    case 'paragraph':
      return `<p>${childrenHtml}</p>`;
    case 'heading':
      const tag = node.tag as string || 'h2';
      return `<${tag}>${childrenHtml}</${tag}>`;
    case 'list':
      const listType = node.listType as string;
      const listTag = listType === 'number' ? 'ol' : 'ul';
      return `<${listTag}>${childrenHtml}</${listTag}>`;
    case 'listitem':
      return `<li>${childrenHtml}</li>`;
    case 'link':
      const url = (node.fields as Record<string, unknown>)?.url as string || '#';
      return `<a href="${url}">${childrenHtml}</a>`;
    default:
      return childrenHtml;
  }
}

// Mock data pro případ, že databáze není dostupná
const mockProducts: Product[] = Array.from({ length: 12 }, (_, i) => ({
  id: `mock-${i + 1}`,
  slug: `ketubah-${i + 1}`,
  name: `Jerusalem Ketubah ${i + 1}`,
  shortDescription: 'Tradiční ketuba s motivem Jeruzaléma, ručně malovaná temperovými barvami na pergamenu.',
  description: '<p>Tato ketuba je inspirována starými jeruzalémskými motivy a kombinuje tradiční techniky s moderním designem. Každý kus je originál, ručně malovaný temperovými barvami.</p><p>Ketuba může být personalizována podle vašich požadavků - text, barvy, velikost.</p>',
  prices: {
    giclee: 5900 + i * 1000,
    gicleeAvailable: true,
    original: 15000 + i * 5000,
    originalAvailable: i % 3 === 0,
  },
  dimensions: {
    width: 50,
    height: 70,
    unit: 'cm',
  },
  images: [
    { image: { url: '/placeholder.jpg', width: 1200, height: 900 }, alt: `Ketubah ${i + 1} - hlavní`, isMain: true },
    { image: { url: '/placeholder.jpg', width: 1200, height: 900 }, alt: `Ketubah ${i + 1} - detail 1` },
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
  popularity: i % 5,
  inStock: true,
}));

/**
 * Načtení seznamu produktů s paginací
 */
export async function getProducts(options: {
  locale: string;
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}): Promise<PaginatedProducts> {
  const { locale, page = 1, limit = 6, category, search } = options;

  try {
    const payload = await getPayloadClient();

    // Sestavení where podmínky
    const baseWhere: Where = {
      inStock: { equals: true },
    };

    const conditions: Where[] = [baseWhere];

    if (category) {
      conditions.push({ 'category.slug': { equals: category } });
    }

    if (search) {
      conditions.push({
        or: [
          { name: { contains: search } },
          { shortDescription: { contains: search } },
        ],
      });
    }

    const where: Where = conditions.length > 1 ? { and: conditions } : baseWhere;

    const result = await payload.find({
      collection: 'products',
      where,
      limit,
      page,
      depth: 2, // Načtení vztahů (category, tags, colors, images)
      locale: locale as 'cs' | 'en' | 'he',
      sort: '-popularity',
    });

    return {
      products: result.docs.map((doc) => serializeProduct(doc as Record<string, unknown>)),
      totalItems: result.totalDocs,
      totalPages: result.totalPages,
      currentPage: result.page || page,
    };
  } catch (error) {
    console.error('Error fetching products from Payload:', error);
    // Fallback na mock data
    const startIndex = (page - 1) * limit;
    const paginatedMock = mockProducts.slice(startIndex, startIndex + limit);
    return {
      products: paginatedMock,
      totalItems: mockProducts.length,
      totalPages: Math.ceil(mockProducts.length / limit),
      currentPage: page,
    };
  }
}

/**
 * Načtení jednoho produktu podle slug
 */
export async function getProductBySlug(
  slug: string,
  locale: string
): Promise<Product | null> {
  try {
    const payload = await getPayloadClient();

    const result = await payload.find({
      collection: 'products',
      where: {
        slug: { equals: slug },
      },
      depth: 2,
      locale: locale as 'cs' | 'en' | 'he',
      limit: 1,
    });

    if (result.docs.length === 0) {
      return null;
    }

    return serializeProduct(result.docs[0] as Record<string, unknown>);
  } catch (error) {
    console.error('Error fetching product from Payload:', error);
    // Fallback na mock data
    const mockProduct = mockProducts.find((p) => p.slug === slug);
    return mockProduct || null;
  }
}

/**
 * Načtení populárních produktů pro homepage
 */
export async function getPopularProducts(
  locale: string,
  limit: number = 4
): Promise<Product[]> {
  try {
    const payload = await getPayloadClient();

    const result = await payload.find({
      collection: 'products',
      where: {
        popularity: { greater_than_equal: 4 },
        inStock: { equals: true },
      },
      depth: 2,
      locale: locale as 'cs' | 'en' | 'he',
      limit,
      sort: '-popularity',
    });

    return result.docs.map((doc) => serializeProduct(doc as Record<string, unknown>));
  } catch (error) {
    console.error('Error fetching popular products:', error);
    // Fallback na mock data s nejvyšší popularitou
    return mockProducts
      .filter((p) => (p.popularity || 0) >= 4)
      .slice(0, limit);
  }
}

/**
 * Načtení souvisejících produktů (stejná kategorie)
 */
export async function getRelatedProducts(
  categorySlug: string,
  currentSlug: string,
  locale: string,
  limit: number = 4
): Promise<Product[]> {
  try {
    const payload = await getPayloadClient();

    const result = await payload.find({
      collection: 'products',
      where: {
        'category.slug': { equals: categorySlug },
        slug: { not_equals: currentSlug },
        inStock: { equals: true },
      },
      depth: 2,
      locale: locale as 'cs' | 'en' | 'he',
      limit,
      sort: '-popularity',
    });

    return result.docs.map((doc) => serializeProduct(doc as Record<string, unknown>));
  } catch (error) {
    console.error('Error fetching related products:', error);
    // Fallback na mock data
    return mockProducts
      .filter((p) => p.slug !== currentSlug)
      .slice(0, limit);
  }
}

/**
 * Načtení všech kategorií
 */
export async function getCategories(locale: string) {
  try {
    const payload = await getPayloadClient();

    const result = await payload.find({
      collection: 'categories',
      locale: locale as 'cs' | 'en' | 'he',
      limit: 100,
    });

    return result.docs.map((doc) => ({
      id: doc.id,
      name: doc.name as string,
      slug: doc.slug as string,
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [
      { id: '1', name: 'Tradiční', slug: 'traditional' },
      { id: '2', name: 'Moderní', slug: 'modern' },
      { id: '3', name: 'Minimalistické', slug: 'minimalist' },
    ];
  }
}

/**
 * Typy pro stránky
 */
export interface PageData {
  id: string;
  title: string;
  slug: string;
  pageType: 'default' | 'faq' | 'legal';
  content: string;
  faqItems?: Array<{
    question: string;
    answer: string;
  }>;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

/**
 * Načtení stránky podle slug
 */
export async function getPageBySlug(
  slug: string,
  locale: string
): Promise<PageData | null> {
  try {
    const payload = await getPayloadClient();

    const result = await payload.find({
      collection: 'pages',
      where: {
        slug: { equals: slug },
      },
      depth: 1,
      locale: locale as 'cs' | 'en' | 'he',
      limit: 1,
    });

    if (result.docs.length === 0) {
      return null;
    }

    const doc = result.docs[0] as Record<string, unknown>;

    // Převod obsahu (RichText nebo string)
    let content = '';
    if (typeof doc.content === 'string') {
      content = doc.content;
    } else if (doc.content && typeof doc.content === 'object') {
      content = richTextToHtml(doc.content);
    }

    // Zpracování FAQ items
    const faqItemsData = doc.faqItems as Array<Record<string, unknown>> | undefined;
    const faqItems = faqItemsData?.map((item) => {
      let answer = '';
      if (typeof item.answer === 'string') {
        answer = item.answer;
      } else if (item.answer && typeof item.answer === 'object') {
        answer = richTextToHtml(item.answer);
      }
      return {
        question: item.question as string || '',
        answer,
      };
    });

    // SEO data
    const seoData = doc.seo as Record<string, unknown> | undefined;

    return {
      id: doc.id as string,
      title: doc.title as string || '',
      slug: doc.slug as string || '',
      pageType: (doc.pageType as 'default' | 'faq' | 'legal') || 'default',
      content,
      faqItems,
      seo: seoData
        ? {
            metaTitle: seoData.metaTitle as string | undefined,
            metaDescription: seoData.metaDescription as string | undefined,
          }
        : undefined,
    };
  } catch (error) {
    console.error('Error fetching page from Payload:', error);
    return null;
  }
}

/**
 * Načtení všech slug stránek pro generateStaticParams
 */
export async function getAllPageSlugs(): Promise<string[]> {
  try {
    const payload = await getPayloadClient();

    const result = await payload.find({
      collection: 'pages',
      limit: 100,
      depth: 0,
    });

    return result.docs.map((doc) => doc.slug as string);
  } catch (error) {
    console.error('Error fetching page slugs:', error);
    return ['about', 'faq', 'privacy', 'cookies'];
  }
}

/**
 * Typy pro recenze
 */
export interface Review {
  id: string;
  authorName: string;
  rating: number;
  title: string;
  content: string;
  product?: {
    name: string;
    slug: string;
  };
  publishedAt: string;
  featured: boolean;
}

/**
 * Načtení featured recenzí pro homepage
 */
export async function getFeaturedReviews(limit: number = 3): Promise<Review[]> {
  try {
    const payload = await getPayloadClient();

    const result = await payload.find({
      collection: 'reviews',
      where: {
        status: { equals: 'published' },
        featured: { equals: true },
      },
      depth: 1,
      limit,
      sort: '-publishedAt',
    });

    return result.docs.map((doc) => ({
      id: doc.id as string,
      authorName: doc.authorName as string || '',
      rating: doc.rating as number || 0,
      title: doc.title as string || '',
      content: doc.content as string || '',
      product: (doc.product as Record<string, unknown>)
        ? {
            name: (doc.product as Record<string, unknown>).name as string || '',
            slug: (doc.product as Record<string, unknown>).slug as string || '',
          }
        : undefined,
      publishedAt: doc.publishedAt as string || '',
      featured: doc.featured as boolean || false,
    }));
  } catch (error) {
    console.error('Error fetching featured reviews:', error);
    return [];
  }
}

/**
 * Načtení statistik recenzí (průměr, počet)
 */
export async function getReviewsStats(): Promise<{
  totalReviews: number;
  averageRating: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
}> {
  try {
    const payload = await getPayloadClient();

    const result = await payload.find({
      collection: 'reviews',
      where: {
        status: { equals: 'published' },
      },
      limit: 1000,
      depth: 0,
    });

    const reviews = result.docs;
    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        fiveStarCount: 0,
        fourStarCount: 0,
        threeStarCount: 0,
        twoStarCount: 0,
        oneStarCount: 0,
      };
    }

    const ratings = reviews.map((r) => r.rating as number || 0);
    const averageRating = ratings.reduce((a, b) => a + b, 0) / totalReviews;

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      fiveStarCount: ratings.filter((r) => r === 5).length,
      fourStarCount: ratings.filter((r) => r === 4).length,
      threeStarCount: ratings.filter((r) => r === 3).length,
      twoStarCount: ratings.filter((r) => r === 2).length,
      oneStarCount: ratings.filter((r) => r === 1).length,
    };
  } catch (error) {
    console.error('Error fetching reviews stats:', error);
    return {
      totalReviews: 0,
      averageRating: 0,
      fiveStarCount: 0,
      fourStarCount: 0,
      threeStarCount: 0,
      twoStarCount: 0,
      oneStarCount: 0,
    };
  }
}
