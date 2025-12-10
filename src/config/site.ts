// Konfigurace webu
export const siteConfig = {
  name: 'Ketubah Art Studio',
  description: 'Originální ketubot a Giclée tisky',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',

  // Kontaktní informace
  contact: {
    email: process.env.CONTACT_EMAIL || 'info@example.com',
  },

  // Sociální sítě
  social: {
    instagram: '',
  },

  // SEO výchozí hodnoty
  seo: {
    titleTemplate: '%s | Ketubah Art Studio',
    defaultTitle: 'Ketubah Art Studio',
  },
};
