import { useTranslations } from 'next-intl';
import { Link } from '@/components/ui/Link';

export function Footer() {
  const t = useTranslations('footer');
  const tCommon = useTranslations('common');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="text-white" style={{ background: 'linear-gradient(to right, #1C051F, #1F1C05, #051F1C, #1F1C05, #1C051F)' }}>
      {/* Footer s dekorativním gradientem: fialová → žlutá → tyrkysová */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo a tagline */}
          <div>
            <h3 className="text-xl font-bold mb-2">Ketubah Art Studio</h3>
            <p className="text-gray-400">{t('tagline')}</p>
          </div>

          {/* Odkazy */}
          <div>
            <h4 className="font-semibold mb-4">{t('links')}</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                {tCommon('about')}
              </Link>
              <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                {tCommon('faq')}
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                {tCommon('contact')}
              </Link>
            </nav>
          </div>

          {/* Právní */}
          <div>
            <h4 className="font-semibold mb-4">{t('legal')}</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                {t('privacy')}
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                {t('cookies')}
              </Link>
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          {t('copyright', { year: currentYear })}
        </div>
      </div>
    </footer>
  );
}
