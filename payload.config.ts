import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

import {
  Users,
  Media,
  Languages,
  Categories,
  Colors,
  Tags,
  ExchangeRates,
  Products,
  Pages,
} from './src/collections';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },

  // Kolekce
  collections: [
    Users,
    Media,
    Languages,
    Categories,
    Colors,
    Tags,
    ExchangeRates,
    Products,
    Pages,
  ],

  // Editor
  editor: lexicalEditor(),

  // Databáze
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
      // Explicitně vypnout SSL a heslo pro lokální vývoj
      ssl: false,
    },
  }),

  // Lokalizace
  localization: {
    locales: [
      { label: 'Čeština', code: 'cs' },
      { label: 'English', code: 'en' },
      { label: 'עברית', code: 'he' },
    ],
    defaultLocale: 'cs',
    fallback: true,
  },

  // Secret pro JWT
  secret: process.env.PAYLOAD_SECRET || 'a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8',

  // TypeScript generování typů
  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },

  // Sharp pro image resizing
  sharp,
});
