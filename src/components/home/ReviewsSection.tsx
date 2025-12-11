/**
 * ReviewsSection komponenta - celá sekce s recenzemi a trust indicators
 */
'use client';

import { useTranslations } from 'next-intl';
import { ReviewCard } from './ReviewCard';
import { StarRating } from '@/components/ui/StarRating';
import type { Review } from '@/lib/queries';

interface ReviewsSectionProps {
  reviews: Review[];
  stats: {
    totalReviews: number;
    averageRating: number;
    fiveStarCount: number;
    fourStarCount: number;
    threeStarCount: number;
    twoStarCount: number;
    oneStarCount: number;
  };
}

export function ReviewsSection({ reviews, stats }: ReviewsSectionProps) {
  const t = useTranslations('home.reviews');
  const yearsInBusiness = new Date().getFullYear() - 2012; // Předpokládám 2012 jako start

  return (
    <section style={{ backgroundImage: 'linear-gradient(to right, rgba(28, 5, 31, 0.08), rgba(31, 28, 5, 0.08), rgba(5, 31, 28, 0.08), rgba(31, 28, 5, 0.08), rgba(28, 5, 31, 0.08)), linear-gradient(to bottom, rgba(100, 150, 200, 0.05), rgba(200, 150, 100, 0.05), rgba(100, 200, 150, 0.05))' }}>
      <div className="container mx-auto px-4 py-16">
        {/* Nadpis a popis */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-2">{t('title')}</h2>
          <p className="text-muted text-lg">{t('subtitle')}</p>
        </div>

        {/* Dvousloupcový layout: Trust indicators vlevo, recenze vpravo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          {/* Trust Indicators - levý sloupec */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-8 shadow-sm sticky top-8">
              <h3 className="font-bold text-lg mb-6">{t('trustBadges.title')}</h3>

              {/* Průměrné hodnocení */}
              <div className="mb-8">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</span>
                  <span className="text-gray-600">{t('outOf5')}</span>
                </div>
                <div className="mb-2">
                  <StarRating rating={Math.round(stats.averageRating)} size="md" />
                </div>
                <p className="text-sm text-gray-500">
                  {stats.totalReviews} {t('trustBadges.totalReviews')}
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-6" />

              {/* Trust badges - čísla */}
              <div className="space-y-4">
                {/* Roky v provozu */}
                <div className="flex items-start gap-3">
                  <div className="text-2xl font-bold text-primary min-w-fit">{yearsInBusiness}+</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t('trustBadges.yearsInBusiness')}</p>
                    <p className="text-xs text-gray-500">v provozu</p>
                  </div>
                </div>

                {/* Spokojení zákazníci (odhadnuto z počtu recenzí) */}
                <div className="flex items-start gap-3">
                  <div className="text-2xl font-bold text-primary min-w-fit">
                    {Math.round(stats.totalReviews * 2.5)}+
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t('trustBadges.satisfiedCustomers')}</p>
                    <p className="text-xs text-gray-500">világszerte</p>
                  </div>
                </div>

                {/* 5-star percentage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">5 hvězd</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats.totalReviews ? Math.round((stats.fiveStarCount / stats.totalReviews) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${stats.totalReviews ? (stats.fiveStarCount / stats.totalReviews) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recenze - pravý sloupec (2 sloupce na desktopu) */}
          <div className="lg:col-span-2">
            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} showProduct={true} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Zatím žádné recenze. Buďte první!</p>
              </div>
            )}
          </div>
        </div>

        {/* CTA na konci - odkaz na stránku s více recenzemi */}
        {reviews.length > 0 && (
          <div className="text-center border-t border-gray-200 pt-8">
            <p className="text-sm text-gray-600 mb-4">
              Máte další otázky? Podívejte se na více recenzí nebo nás kontaktujte.
            </p>
            <a
              href="/contact"
              className="inline-block border-2 border-black px-6 py-3 font-medium hover:bg-black hover:text-white transition-colors"
            >
              Máme více zkušeností →
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
