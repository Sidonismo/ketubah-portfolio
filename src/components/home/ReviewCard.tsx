/**
 * ReviewCard komponenta - jednotlivá recenze
 */
import { StarRating } from '@/components/ui/StarRating';
import { Link } from '@/components/ui/Link';
import type { Review } from '@/lib/queries';

interface ReviewCardProps {
  review: Review;
  showProduct?: boolean;
}

export function ReviewCard({ review, showProduct = true }: ReviewCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
      {/* Hvězdičky a jméno */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 flex-1">{review.authorName}</h3>
        <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
          {new Date(review.publishedAt).toLocaleDateString('cs-CZ', {
            year: 'numeric',
            month: 'short',
          })}
        </span>
      </div>

      {/* Hvězdičky */}
      <div className="mb-3">
        <StarRating rating={review.rating} size="sm" />
      </div>

      {/* Nadpis recenze */}
      <h4 className="font-bold text-sm mb-2 text-gray-900">{review.title}</h4>

      {/* Text recenze - omezit na 2-3 řádky */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">{review.content}</p>

      {/* Produkt (pokud existuje) */}
      {showProduct && review.product && (
        <div className="mb-4">
          <Link
            href={`/products/${review.product.slug}`}
            className="text-xs text-primary hover:underline"
          >
            ← O produktu: {review.product.name}
          </Link>
        </div>
      )}

      {/* Read more link */}
      <button
        title={review.content}
        className="text-primary text-sm font-medium hover:underline mt-auto pt-2 border-t border-gray-200"
      >
        Přečíst celou recenzi →
      </button>
    </div>
  );
}
