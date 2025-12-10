'use client';

import { useState, useCallback, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import Cookies from 'js-cookie';
import { Link } from './Link';

const COOKIE_CONSENT_KEY = 'ketubah_cookie_consent';

type ConsentState = 'pending' | 'accepted' | 'declined';

// Hook pro čtení cookie stavu bez hydration mismatch
function useConsentState(): ConsentState {
  const subscribe = useCallback((callback: () => void) => {
    // Poslouchání na změny cookies není standardní, ale můžeme sledovat storage
    window.addEventListener('storage', callback);
    return () => window.removeEventListener('storage', callback);
  }, []);

  const getSnapshot = useCallback((): ConsentState => {
    const savedConsent = Cookies.get(COOKIE_CONSENT_KEY);
    if (savedConsent === 'accepted' || savedConsent === 'declined') {
      return savedConsent;
    }
    return 'pending';
  }, []);

  const getServerSnapshot = useCallback((): ConsentState => {
    // Na serveru vždy vracíme 'accepted' aby se banner nezobrazoval při SSR
    return 'accepted';
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function CookieConsent() {
  const t = useTranslations('cookies');
  const consentState = useConsentState();
  const [isVisible, setIsVisible] = useState(true);

  const handleAccept = () => {
    Cookies.set(COOKIE_CONSENT_KEY, 'accepted', { expires: 365 });
    setIsVisible(false);
    // Inicializace analytických cookies (pokud existují)
    initAnalytics();
    // Vynucení re-renderu přes změnu lokálního stavu
    window.dispatchEvent(new Event('storage'));
  };

  const handleDecline = () => {
    Cookies.set(COOKIE_CONSENT_KEY, 'declined', { expires: 365 });
    setIsVisible(false);
    window.dispatchEvent(new Event('storage'));
  };

  // Inicializace analytics (placeholder pro budoucí implementaci)
  const initAnalytics = () => {
    // TODO: Zde přidat inicializaci GA4 nebo jiné analytics
    console.log('Analytics initialized with consent');
  };

  // Nezobrazovat, pokud už byl souhlas udělen nebo odmítnut
  if (consentState !== 'pending' || !isVisible) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg animate-in slide-in-from-bottom duration-300"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div className="container mx-auto max-w-4xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p id="cookie-consent-description" className="text-sm text-gray-700">
            {t('message')}
            {' '}
            <Link
              href="/cookies"
              className="text-primary hover:text-primary-hover underline"
            >
              {t('learnMore')}
            </Link>
          </p>
        </div>

        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            type="button"
          >
            {t('decline')}
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm bg-primary text-black font-medium rounded hover:bg-primary-hover transition-colors"
            type="button"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
