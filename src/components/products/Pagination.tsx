'use client';

import { useSearchParams } from 'next/navigation';
import { Link } from '@/components/ui/Link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  // Vytvoření URL s page parametrem
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  // Generování čísel stránek
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const showPages = 5;

    if (totalPages <= showPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Vždy zobrazit první stránku
    pages.push(1);

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) pages.push('ellipsis');

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) pages.push('ellipsis');

    // Vždy zobrazit poslední stránku
    pages.push(totalPages);

    return pages;
  };

  return (
    <nav className="flex justify-center items-center gap-2 mt-8" aria-label="Pagination">
      {/* Předchozí */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
        >
          &laquo;
        </Link>
      ) : (
        <span className="px-3 py-2 border border-gray-200 rounded text-gray-400 cursor-not-allowed">
          &laquo;
        </span>
      )}

      {/* Čísla stránek */}
      {getPageNumbers().map((page, index) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-3 py-2">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={createPageUrl(page)}
            className={`px-3 py-2 border rounded transition-colors ${
              page === currentPage
                ? 'bg-primary border-primary font-bold'
                : 'border-gray-300 hover:bg-gray-100'
            }`}
          >
            {page}
          </Link>
        )
      )}

      {/* Další */}
      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
        >
          &raquo;
        </Link>
      ) : (
        <span className="px-3 py-2 border border-gray-200 rounded text-gray-400 cursor-not-allowed">
          &raquo;
        </span>
      )}
    </nav>
  );
}
