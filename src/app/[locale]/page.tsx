import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/components/ui/Link';
import type { Metadata } from 'next';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });

  return {
    title: t('hero.title'),
    description: t('hero.description'),
  };
}

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <main className="min-h-screen">
      {/* Hero sekce */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Text */}
          <div>
            <span className="inline-block bg-primary text-black px-3 py-1 text-sm rounded-full mb-4">
              {t('hero.badge')}
            </span>
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">
              {t('hero.title')}
            </h1>
            <p className="text-muted text-lg mb-6">
              {t('hero.description')}
            </p>
            <Link
              href="/products"
              className="inline-block border-2 border-black px-6 py-3 font-medium hover:bg-black hover:text-white transition-colors"
            >
              {t('hero.cta')}
            </Link>
          </div>

          {/* Featured obrázek - placeholder */}
          <div className="bg-card-bg rounded-lg aspect-[4/3] flex items-center justify-center">
            <span className="text-muted">Featured Ketuba</span>
          </div>
        </div>
      </section>

      {/* Nejpopulárnější ketubot sekce */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-2">{t('popular.title')}</h2>
        <p className="text-muted mb-8">{t('popular.description')}</p>

        {/* Bento grid - placeholder */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2 row-span-2 bg-card-bg rounded-lg aspect-square flex items-center justify-center">
            <span className="text-muted">Ketuba A (2x2)</span>
          </div>
          <div className="bg-card-bg rounded-lg aspect-square flex items-center justify-center">
            <span className="text-muted">Ketuba B</span>
          </div>
          <div className="bg-card-bg rounded-lg aspect-square flex items-center justify-center">
            <span className="text-muted">Ketuba C</span>
          </div>
          <div className="bg-card-bg rounded-lg aspect-square flex items-center justify-center">
            <span className="text-muted">Ketuba D</span>
          </div>
          <div className="bg-card-bg rounded-lg aspect-square flex items-center justify-center">
            <span className="text-muted">Ketuba E</span>
          </div>
        </div>
      </section>
    </main>
  );
}
