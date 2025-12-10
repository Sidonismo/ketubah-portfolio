'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

interface Category {
  id: string | number;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory?: string;
  locale: string;
  labels: {
    all: string;
    category: string;
  };
}

export function ProductFilters({
  categories,
  selectedCategory,
  locale,
  labels,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleCategoryChange = (categorySlug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (categorySlug) {
      params.set('category', categorySlug);
    } else {
      params.delete('category');
    }

    // Reset na první stránku při změně filtru
    params.delete('page');

    startTransition(() => {
      router.push(`/${locale}/products?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Tlačítko "Vše" */}
      <button
        onClick={() => handleCategoryChange(null)}
        disabled={isPending}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          !selectedCategory
            ? 'bg-primary text-black'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } ${isPending ? 'opacity-50 cursor-wait' : ''}`}
      >
        {labels.all}
      </button>

      {/* Tlačítka kategorií */}
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryChange(category.slug)}
          disabled={isPending}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === category.slug
              ? 'bg-primary text-black'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } ${isPending ? 'opacity-50 cursor-wait' : ''}`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
