'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

export function SearchBar() {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);

    // Debounced navigation
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value.trim()) {
      timeoutRef.current = setTimeout(() => {
        router.push(`/${locale}/products?q=${encodeURIComponent(value.trim())}`);
        setIsOpen(false);
      }, 300);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (query.trim()) {
      router.push(`/${locale}/products?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Search button (collapsed) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label={t('search')}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>

      {/* Search input (expanded) */}
      {isOpen && (
        <form
          onSubmit={handleSubmit}
          className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-lg p-2 w-64 z-50"
        >
          <input
            type="search"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={t('search')}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
        </form>
      )}
    </div>
  );
}
