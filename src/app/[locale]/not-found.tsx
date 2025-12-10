import { useTranslations } from 'next-intl';
import { Link } from '@/components/ui/Link';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">{t('title')}</h2>
      <p className="text-muted mb-8">{t('description')}</p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/"
          className="inline-block bg-primary text-black px-6 py-3 rounded font-medium hover:bg-primary-hover transition-colors"
        >
          {useTranslations('common')('backToHome')}
        </Link>
        <Link
          href="/products"
          className="inline-block border-2 border-black px-6 py-3 rounded font-medium hover:bg-black hover:text-white transition-colors"
        >
          {useTranslations('common')('products')}
        </Link>
      </div>
    </div>
  );
}
