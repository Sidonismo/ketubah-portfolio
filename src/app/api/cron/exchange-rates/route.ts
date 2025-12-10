import { NextRequest, NextResponse } from 'next/server';
import { fetchCNBRates } from '@/lib/cnb';
import { getPayloadClient } from '@/lib/payload';

/**
 * GET /api/cron/exchange-rates - Aktualizace kurzů měn z ČNB
 *
 * Vercel Cron: volat denně v 8:00 UTC (9:00 CET)
 * V vercel.json přidejte:
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/exchange-rates",
 *       "schedule": "0 8 * * *"
 *     }
 *   ]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Ověření autorizace (Vercel Cron nebo admin klíč)
    const authHeader = request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Vercel Cron posílá hlavičku Authorization: Bearer <CRON_SECRET>
    const isVercelCron = authHeader === `Bearer ${cronSecret}`;
    const isAdminKey = authHeader === `Bearer ${process.env.MEILISEARCH_ADMIN_KEY}`;

    if (!isVercelCron && !isAdminKey && cronSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Načtení kurzů z ČNB
    const rates = await fetchCNBRates();

    // Uložení do Payload CMS
    try {
      const payload = await getPayloadClient();

      // Kontrola, zda už existuje záznam pro dnešní datum
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingRate = await payload.find({
        collection: 'exchange-rates',
        where: {
          date: {
            equals: today.toISOString().split('T')[0],
          },
        },
        limit: 1,
      });

      if (existingRate.docs.length > 0) {
        // Aktualizace existujícího záznamu
        await payload.update({
          collection: 'exchange-rates',
          id: existingRate.docs[0].id,
          data: {
            eurRate: rates.eurRate,
            usdRate: rates.usdRate,
            source: rates.source,
          },
        });
      } else {
        // Vytvoření nového záznamu
        await payload.create({
          collection: 'exchange-rates',
          data: {
            date: today.toISOString().split('T')[0],
            eurRate: rates.eurRate,
            usdRate: rates.usdRate,
            source: rates.source,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Exchange rates updated',
        rates: {
          date: rates.date.toISOString(),
          eurRate: rates.eurRate,
          usdRate: rates.usdRate,
          source: rates.source,
        },
      });
    } catch (dbError) {
      // Pokud databáze není dostupná, vrátíme alespoň kurzy
      console.error('Database error:', dbError);
      return NextResponse.json({
        success: true,
        message: 'Exchange rates fetched (database unavailable)',
        rates: {
          date: rates.date.toISOString(),
          eurRate: rates.eurRate,
          usdRate: rates.usdRate,
          source: rates.source,
        },
        warning: 'Could not save to database',
      });
    }
  } catch (error) {
    console.error('Exchange rate cron error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch exchange rates',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
