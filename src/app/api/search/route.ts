import { NextRequest, NextResponse } from 'next/server';
import { searchProducts, productsIndex } from '@/lib/meilisearch';
import { z } from 'zod';

// Validační schéma pro query parametry
const searchParamsSchema = z.object({
  q: z.string().min(1).max(100),
  locale: z.enum(['cs', 'en', 'he']).default('cs'),
  limit: z.coerce.number().min(1).max(50).default(10),
  offset: z.coerce.number().min(0).default(0),
  category: z.string().optional(),
  inStock: z.enum(['true', 'false']).optional(),
});

/**
 * GET /api/search - Vyhledávání produktů přes Meilisearch
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validace parametrů
    const validationResult = searchParamsSchema.safeParse({
      q: searchParams.get('q'),
      locale: searchParams.get('locale') || 'cs',
      limit: searchParams.get('limit') || '10',
      offset: searchParams.get('offset') || '0',
      category: searchParams.get('category') || undefined,
      inStock: searchParams.get('inStock') || undefined,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { q, locale, limit, offset, category, inStock } = validationResult.data;

    // Sestavení filtrů
    const filters: string[] = [];
    if (category) {
      filters.push(`category = "${category}"`);
    }
    if (inStock === 'true') {
      filters.push('inStock = true');
    }

    // Vyhledávání
    const results = await searchProducts(q, locale, {
      limit,
      offset,
      filter: filters.length > 0 ? filters : undefined,
    });

    // Transformace výsledků pro frontend
    const localeSuffix = `_${locale}` as const;
    const products = results.hits.map((hit) => ({
      slug: hit.slug,
      name: hit[`name${localeSuffix}`] || hit.name_cs || '',
      images: hit.images,
      prices: hit.prices,
      category: hit.category,
      inStock: hit.inStock,
    }));

    return NextResponse.json({
      products,
      total: results.estimatedTotalHits,
      query: q,
      processingTimeMs: results.processingTimeMs,
    });
  } catch (error) {
    console.error('Search error:', error);

    // Kontrola, zda je Meilisearch dostupný
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { error: 'Search service unavailable' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/search/index - Reindexace produktů (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Jednoduchá autorizace přes API klíč
    const authHeader = request.headers.get('Authorization');
    const expectedKey = process.env.MEILISEARCH_ADMIN_KEY;

    if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { products } = body;

    if (!Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Products array required' },
        { status: 400 }
      );
    }

    // Přidání dokumentů do indexu
    const task = await productsIndex.addDocuments(products, { primaryKey: 'id' });

    return NextResponse.json({
      success: true,
      taskUid: task.taskUid,
      message: `Indexing ${products.length} products`,
    });
  } catch (error) {
    console.error('Index error:', error);
    return NextResponse.json(
      { error: 'Indexing failed' },
      { status: 500 }
    );
  }
}
