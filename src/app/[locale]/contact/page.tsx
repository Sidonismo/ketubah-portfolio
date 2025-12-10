'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

export default function ContactPage() {
  const t = useTranslations('contact');
  const searchParams = useSearchParams();
  const productSlug = searchParams.get('product');

  // Inicializace s produktem hned při renderování
  const [formData, setFormData] = useState(() => ({
    name: '',
    email: '',
    subject: productSlug ? `Zájem o produkt: ${productSlug}` : '',
    message: '',
    productId: productSlug || '',
    honeypot: '',
  }));

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          productId: '',
          honeypot: '',
        });
      } else {
        setStatus('error');
        setErrorMessage(result.error?.message || t('error'));
      }
    } catch {
      setStatus('error');
      setErrorMessage(t('error'));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

      {status === 'success' ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {t('success')}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot - skryté pole pro anti-spam */}
          <input
            type="text"
            name="honeypot"
            value={formData.honeypot}
            onChange={handleChange}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Jméno */}
          <div suppressHydrationWarning>
            <label htmlFor="name" className="block font-medium mb-2">
              {t('name')} *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              suppressHydrationWarning
            />
          </div>

          {/* Email */}
          <div suppressHydrationWarning>
            <label htmlFor="email" className="block font-medium mb-2">
              {t('email')} *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              suppressHydrationWarning
            />
          </div>

          {/* Předmět */}
          <div suppressHydrationWarning>
            <label htmlFor="subject" className="block font-medium mb-2">
              {t('subject')} *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              minLength={5}
              maxLength={200}
              autoComplete="off"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              suppressHydrationWarning
            />
          </div>

          {/* Zpráva */}
          <div suppressHydrationWarning>
            <label htmlFor="message" className="block font-medium mb-2">
              {t('message')} *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              minLength={10}
              maxLength={5000}
              rows={6}
              autoComplete="off"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              suppressHydrationWarning
            />
          </div>

          {/* Chybová zpráva */}
          {status === 'error' && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errorMessage}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-primary text-black py-3 rounded font-bold text-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? t('sending') : t('send')}
          </button>
        </form>
      )}
    </div>
  );
}
