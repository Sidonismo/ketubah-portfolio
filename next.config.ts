import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { withPayload } from '@payloadcms/next/withPayload';
import path from 'path';

const withNextIntl = createNextIntlPlugin('./src/lib/i18n.ts');

const nextConfig: NextConfig = {
  // Webpack konfigurace pro aliasy
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@payload-config': path.resolve(__dirname, './payload.config.ts'),
    };
    return config;
  },

  // Bezpečnostní hlavičky
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ],

  // Optimalizace obrázků
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

// Kombinace next-intl a Payload pluginů
export default withPayload(withNextIntl(nextConfig));
