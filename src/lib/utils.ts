import { type ClassValue, clsx } from 'clsx';

// Utility pro spojování CSS tříd (bez tailwind-merge pro jednoduchost)
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Generování slug z textu
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Odstranění diakritiky
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Zkrácení textu na určitý počet znaků
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

// Formátování data
export function formatDate(date: Date | string, locale: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Debounce funkce
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Získání hlavního obrázku produktu
export function getMainImage(
  images: Array<{ image: unknown; isMain?: boolean }>
): unknown {
  const mainImage = images.find((img) => img.isMain);
  return mainImage?.image || images[0]?.image;
}
