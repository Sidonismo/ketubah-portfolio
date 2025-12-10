// Seed script pro Ketubah Eshop
// Naplní databázi testovacími daty včetně obrázků

import 'dotenv/config';
import { getPayload } from 'payload';
import config from '../payload.config';
import fs from 'fs';
import path from 'path';

// Pomocná funkce pro upload obrázku
async function uploadImage(
  payload: Awaited<ReturnType<typeof getPayload>>,
  filePath: string,
  alt: { cs: string; en: string; he: string }
) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  
  if (!fs.existsSync(absolutePath)) {
    console.warn(`  ⚠️ Obrázek nenalezen: ${absolutePath}`);
    return null;
  }

  const fileBuffer = fs.readFileSync(absolutePath);
  const fileName = path.basename(filePath);

  // Vytvoření media s CS alt
  const media = await payload.create({
    collection: 'media',
    data: { alt: alt.cs },
    file: {
      data: fileBuffer,
      name: fileName,
      mimetype: 'image/jpeg',
      size: fileBuffer.length,
    },
  });

  // Aktualizace EN a HE locale pro alt
  await payload.update({ collection: 'media', id: media.id, data: { alt: alt.en }, locale: 'en' });
  await payload.update({ collection: 'media', id: media.id, data: { alt: alt.he }, locale: 'he' });

  return media.id;
}

// ============================================================================
// DATA PRO SEED
// ============================================================================

// 13 produktů s romantickými texty
const productsData = [
  {
    slug: 'eternal-love',
    image: 'public/media/seed/ketubah-01.jpg',
    category: 'traditional',
    colors: ['gold', 'blue'],
    tags: ['floral', 'classic'],
    prices: { giclee: 4900, original: 18000 },
    popularity: 5,
    name: { cs: 'Věčná láska', en: 'Eternal Love', he: 'אהבה נצחית' },
    shortDescription: {
      cs: 'Kde se setkávají dvě duše, tam začíná věčnost.',
      en: 'Where two souls meet, eternity begins.',
      he: 'במקום שבו נפגשות שתי נשמות, שם מתחילה הנצח.',
    },
  },
  {
    slug: 'garden-of-eden',
    image: 'public/media/seed/ketubah-02.jpg',
    category: 'traditional',
    colors: ['green', 'gold'],
    tags: ['floral', 'nature'],
    prices: { giclee: 5400, original: 22000 },
    popularity: 5,
    name: { cs: 'Zahrada Eden', en: 'Garden of Eden', he: 'גן עדן' },
    shortDescription: {
      cs: 'V zahradě lásky kvete každý okamžik společného života.',
      en: 'In the garden of love, every moment of shared life blooms.',
      he: 'בגן האהבה, כל רגע של חיים משותפים פורח.',
    },
  },
  {
    slug: 'jerusalem-gold',
    image: 'public/media/seed/ketubah-03.jpg',
    category: 'traditional',
    colors: ['gold', 'blue'],
    tags: ['jerusalem', 'classic'],
    prices: { giclee: 5900, original: 25000 },
    popularity: 4,
    name: { cs: 'Jeruzalémské zlato', en: 'Jerusalem Gold', he: 'זהב ירושלים' },
    shortDescription: {
      cs: 'Zlaté světlo svatého města ozařuje cestu vaší lásky.',
      en: 'The golden light of the holy city illuminates your path of love.',
      he: 'אור הזהב של העיר הקדושה מאיר את דרך אהבתכם.',
    },
  },
  {
    slug: 'tree-of-life',
    image: 'public/media/seed/ketubah-04.jpg',
    category: 'traditional',
    colors: ['green', 'brown'],
    tags: ['nature', 'symbolic'],
    prices: { giclee: 4500, original: 16000 },
    popularity: 5,
    name: { cs: 'Strom života', en: 'Tree of Life', he: 'עץ החיים' },
    shortDescription: {
      cs: 'Vaše kořeny propletené, vaše větve sahají k nebi.',
      en: 'Your roots intertwined, your branches reaching for the sky.',
      he: 'השורשים שלכם שזורים, הענפים שלכם מגיעים לשמיים.',
    },
  },
  {
    slug: 'seven-blessings',
    image: 'public/media/seed/ketubah-05.jpg',
    category: 'traditional',
    colors: ['purple', 'gold'],
    tags: ['classic', 'symbolic'],
    prices: { giclee: 6200, original: 28000 },
    popularity: 4,
    name: { cs: 'Sedm požehnání', en: 'Seven Blessings', he: 'שבע ברכות' },
    shortDescription: {
      cs: 'Sedm požehnání pro sedm dní týdne, pro každý den vaší lásky.',
      en: 'Seven blessings for seven days of the week, for every day of your love.',
      he: 'שבע ברכות לשבעת ימי השבוע, לכל יום של אהבתכם.',
    },
  },
  {
    slug: 'dancing-hearts',
    image: 'public/media/seed/ketubah-06.jpg',
    category: 'modern',
    colors: ['red', 'pink'],
    tags: ['romantic', 'contemporary'],
    prices: { giclee: 3900, original: 15000 },
    popularity: 5,
    name: { cs: 'Tančící srdce', en: 'Dancing Hearts', he: 'לבבות רוקדים' },
    shortDescription: {
      cs: 'Když srdce tančí ve stejném rytmu, zrodí se láska.',
      en: 'When hearts dance to the same rhythm, love is born.',
      he: 'כאשר לבבות רוקדים באותו קצב, נולדת אהבה.',
    },
  },
  {
    slug: 'starlight-promise',
    image: 'public/media/seed/ketubah-07.jpg',
    category: 'modern',
    colors: ['blue', 'silver'],
    tags: ['celestial', 'contemporary'],
    prices: { giclee: 4200, original: 17000 },
    popularity: 4,
    name: { cs: 'Hvězdný slib', en: 'Starlight Promise', he: 'הבטחת כוכבים' },
    shortDescription: {
      cs: 'Pod hvězdami skládáme slib, který září věčně.',
      en: 'Under the stars we make a promise that shines eternally.',
      he: 'תחת הכוכבים אנו נותנים הבטחה שזורחת לנצח.',
    },
  },
  {
    slug: 'ocean-dreams',
    image: 'public/media/seed/ketubah-08.jpg',
    category: 'modern',
    colors: ['blue', 'turquoise'],
    tags: ['nature', 'contemporary'],
    prices: { giclee: 4700, original: 19000 },
    popularity: 3,
    name: { cs: 'Oceánské sny', en: 'Ocean Dreams', he: 'חלומות האוקיינוס' },
    shortDescription: {
      cs: 'Hluboká jako oceán, nekonečná jako vlny - naše láska.',
      en: 'Deep as the ocean, endless as the waves - our love.',
      he: 'עמוקה כאוקיינוס, אינסופית כגלים - האהבה שלנו.',
    },
  },
  {
    slug: 'geometric-harmony',
    image: 'public/media/seed/ketubah-09.jpg',
    category: 'abstract',
    colors: ['gold', 'black'],
    tags: ['geometric', 'minimalist'],
    prices: { giclee: 3500, original: 14000 },
    popularity: 3,
    name: { cs: 'Geometrická harmonie', en: 'Geometric Harmony', he: 'הרמוניה גיאומטרית' },
    shortDescription: {
      cs: 'V geometrii vztahu každá linie směřuje k sobě.',
      en: 'In the geometry of relationship, every line leads to each other.',
      he: 'בגיאומטריה של מערכת יחסים, כל קו מוביל זה לזה.',
    },
  },
  {
    slug: 'infinite-circles',
    image: 'public/media/seed/ketubah-10.jpg',
    category: 'abstract',
    colors: ['purple', 'blue'],
    tags: ['geometric', 'symbolic'],
    prices: { giclee: 4100, original: 16500 },
    popularity: 4,
    name: { cs: 'Nekonečné kruhy', en: 'Infinite Circles', he: 'עיגולים אינסופיים' },
    shortDescription: {
      cs: 'Kruhy bez začátku a konce, jako naše láska.',
      en: 'Circles without beginning or end, like our love.',
      he: 'עיגולים ללא התחלה או סוף, כמו האהבה שלנו.',
    },
  },
  {
    slug: 'watercolor-sunset',
    image: 'public/media/seed/ketubah-11.jpg',
    category: 'abstract',
    colors: ['orange', 'pink'],
    tags: ['artistic', 'romantic'],
    prices: { giclee: 4400, original: 18500 },
    popularity: 5,
    name: { cs: 'Akvarelový západ', en: 'Watercolor Sunset', he: 'שקיעה באקוורל' },
    shortDescription: {
      cs: 'Každý západ slunce je slibem nového úsvitu společně.',
      en: 'Every sunset is a promise of a new dawn together.',
      he: 'כל שקיעה היא הבטחה לשחר חדש יחד.',
    },
  },
  {
    slug: 'our-story',
    image: 'public/media/seed/ketubah-12.jpg',
    category: 'personalized',
    colors: ['gold', 'white'],
    tags: ['custom', 'romantic'],
    prices: { giclee: 6500, original: 32000 },
    popularity: 4,
    name: { cs: 'Náš příběh', en: 'Our Story', he: 'הסיפור שלנו' },
    shortDescription: {
      cs: 'Každý pár má svůj jedinečný příběh hodný vyprávění.',
      en: 'Every couple has their unique story worth telling.',
      he: 'לכל זוג יש סיפור ייחודי שראוי לספר.',
    },
  },
  {
    slug: 'two-souls',
    image: 'public/media/seed/ketubah-13.jpg',
    category: 'personalized',
    colors: ['silver', 'blue'],
    tags: ['custom', 'symbolic'],
    prices: { giclee: 7200, original: 38000 },
    popularity: 5,
    name: { cs: 'Dvě duše', en: 'Two Souls', he: 'שתי נשמות' },
    shortDescription: {
      cs: 'Dvě duše, které se našly, aby spolu tančily věčností.',
      en: 'Two souls that found each other to dance through eternity.',
      he: 'שתי נשמות שמצאו זו את זו כדי לרקוד יחד לנצח.',
    },
  },
];

// Kategorie
const categoriesData = [
  { slug: 'traditional', name: { cs: 'Tradiční', en: 'Traditional', he: 'מסורתי' } },
  { slug: 'modern', name: { cs: 'Moderní', en: 'Modern', he: 'מודרני' } },
  { slug: 'abstract', name: { cs: 'Abstraktní', en: 'Abstract', he: 'מופשט' } },
  { slug: 'personalized', name: { cs: 'Personalizované', en: 'Personalized', he: 'מותאם אישית' } },
];

// Barvy
const colorsData = [
  { slug: 'gold', name: { cs: 'Zlatá', en: 'Gold', he: 'זהב' }, hexCode: '#D4AF37' },
  { slug: 'blue', name: { cs: 'Modrá', en: 'Blue', he: 'כחול' }, hexCode: '#1E3A8A' },
  { slug: 'green', name: { cs: 'Zelená', en: 'Green', he: 'ירוק' }, hexCode: '#166534' },
  { slug: 'red', name: { cs: 'Červená', en: 'Red', he: 'אדום' }, hexCode: '#B91C1C' },
  { slug: 'purple', name: { cs: 'Purpurová', en: 'Purple', he: 'סגול' }, hexCode: '#7C3AED' },
  { slug: 'pink', name: { cs: 'Růžová', en: 'Pink', he: 'ורוד' }, hexCode: '#DB2777' },
  { slug: 'brown', name: { cs: 'Hnědá', en: 'Brown', he: 'חום' }, hexCode: '#78350F' },
  { slug: 'silver', name: { cs: 'Stříbrná', en: 'Silver', he: 'כסף' }, hexCode: '#9CA3AF' },
  { slug: 'turquoise', name: { cs: 'Tyrkysová', en: 'Turquoise', he: 'טורקיז' }, hexCode: '#0D9488' },
  { slug: 'orange', name: { cs: 'Oranžová', en: 'Orange', he: 'כתום' }, hexCode: '#EA580C' },
  { slug: 'black', name: { cs: 'Černá', en: 'Black', he: 'שחור' }, hexCode: '#171717' },
  { slug: 'white', name: { cs: 'Bílá', en: 'White', he: 'לבן' }, hexCode: '#FAFAFA' },
];

// Tagy
const tagsData = [
  { slug: 'floral', name: { cs: 'Květinový', en: 'Floral', he: 'פרחוני' } },
  { slug: 'classic', name: { cs: 'Klasický', en: 'Classic', he: 'קלאסי' } },
  { slug: 'nature', name: { cs: 'Příroda', en: 'Nature', he: 'טבע' } },
  { slug: 'jerusalem', name: { cs: 'Jeruzalém', en: 'Jerusalem', he: 'ירושלים' } },
  { slug: 'symbolic', name: { cs: 'Symbolický', en: 'Symbolic', he: 'סמלי' } },
  { slug: 'romantic', name: { cs: 'Romantický', en: 'Romantic', he: 'רומנטי' } },
  { slug: 'contemporary', name: { cs: 'Současný', en: 'Contemporary', he: 'עכשווי' } },
  { slug: 'celestial', name: { cs: 'Nebeský', en: 'Celestial', he: 'שמימי' } },
  { slug: 'geometric', name: { cs: 'Geometrický', en: 'Geometric', he: 'גיאומטרי' } },
  { slug: 'minimalist', name: { cs: 'Minimalistický', en: 'Minimalist', he: 'מינימליסטי' } },
  { slug: 'artistic', name: { cs: 'Umělecký', en: 'Artistic', he: 'אמנותי' } },
  { slug: 'custom', name: { cs: 'Na míru', en: 'Custom', he: 'מותאם' } },
];

// Stránky
const pagesData = [
  {
    slug: 'about',
    title: { cs: 'O mně', en: 'About Me', he: 'עליי' },
    metaDescription: { cs: 'Poznejte příběh umělkyně tvořící unikátní ketubot', en: 'Discover the story of the artist creating unique ketubahs', he: 'גלו את הסיפור של האמנית היוצרת כתובות ייחודיות' },
    pageType: 'default',
  },
  {
    slug: 'faq',
    title: { cs: 'Časté otázky', en: 'FAQ', he: 'שאלות נפוצות' },
    metaDescription: { cs: 'Odpovědi na nejčastější otázky o ketubách a objednávkách', en: 'Answers to the most common questions about ketubahs and orders', he: 'תשובות לשאלות הנפוצות ביותר על כתובות והזמנות' },
    pageType: 'faq',
  },
  {
    slug: 'cookies',
    title: { cs: 'Cookies', en: 'Cookies', he: 'עוגיות' },
    metaDescription: { cs: 'Informace o používání cookies na našem webu', en: 'Information about the use of cookies on our website', he: 'מידע על השימוש בעוגיות באתר שלנו' },
    pageType: 'legal',
  },
  {
    slug: 'privacy',
    title: { cs: 'Ochrana soukromí', en: 'Privacy Policy', he: 'מדיניות פרטיות' },
    metaDescription: { cs: 'Zásady ochrany osobních údajů', en: 'Privacy policy and data protection', he: 'מדיניות פרטיות והגנה על נתונים' },
    pageType: 'legal',
  },
];

// Pomocná funkce pro prázdný richText (Lexical)
const emptyRichText = {
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Obsah bude doplněn.', version: 1 }],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
};

// ============================================================================
// SEED FUNKCE
// ============================================================================

async function seed() {
  console.log('🌱 Začínám seedování databáze...\n');

  const payload = await getPayload({ config });

  try {
    // 1. Admin uživatel
    console.log('👤 Kontroluji admin uživatele...');
    const existingUsers = await payload.find({ collection: 'users', limit: 1 });
    if (existingUsers.totalDocs === 0) {
      await payload.create({
        collection: 'users',
        data: { email: 'admin@ketubah.cz', password: 'admin123', role: 'admin' },
      });
      console.log('✅ Admin vytvořen: admin@ketubah.cz / admin123');
    } else {
      console.log('ℹ️  Admin již existuje');
    }

    // 2. Jazyky
    console.log('\n🌍 Kontroluji jazyky...');
    const existingLangs = await payload.find({ collection: 'languages', limit: 1 });
    if (existingLangs.totalDocs === 0) {
      await Promise.all([
        payload.create({ collection: 'languages', data: { code: 'cs', name: 'Čeština', nativeName: 'Čeština', flagEmoji: '🇨🇿', isRTL: false, isActive: true, defaultCurrency: 'czk' } }),
        payload.create({ collection: 'languages', data: { code: 'en', name: 'English', nativeName: 'English', flagEmoji: '🇬🇧', isRTL: false, isActive: true, defaultCurrency: 'eur' } }),
        payload.create({ collection: 'languages', data: { code: 'he', name: 'Hebrew', nativeName: 'עברית', flagEmoji: '🇮🇱', isRTL: true, isActive: true, defaultCurrency: 'usd' } }),
      ]);
      console.log('✅ Jazyky vytvořeny');
    } else {
      console.log('ℹ️  Jazyky již existují');
    }

    // 3. Kategorie
    console.log('\n📁 Vytvářím kategorie...');
    const categoryMap: Record<string, number | string> = {};
    for (const cat of categoriesData) {
      const existing = await payload.find({ collection: 'categories', where: { slug: { equals: cat.slug } }, limit: 1 });
      if (existing.totalDocs === 0) {
        try {
          // Vytvoření v CS (default locale)
          const created = await payload.create({
            collection: 'categories',
            data: { slug: cat.slug, name: cat.name.cs },
          });
          categoryMap[cat.slug] = created.id;
          
          // Aktualizace EN locale
          await payload.update({
            collection: 'categories',
            id: created.id,
            data: { name: cat.name.en },
            locale: 'en',
          });
          
          // Aktualizace HE locale
          await payload.update({
            collection: 'categories',
            id: created.id,
            data: { name: cat.name.he },
            locale: 'he',
          });
          
          console.log(`  ✅ ${cat.name.cs}`);
        } catch (catError: unknown) {
          const err = catError as { data?: { errors?: unknown[] } };
          console.error('  ❌ Chyba kategorie:', err.data?.errors || catError);
          throw catError;
        }
      } else {
        categoryMap[cat.slug] = existing.docs[0].id;
        console.log(`  ℹ️  ${cat.name.cs} již existuje`);
      }
    }

    // 4. Barvy
    console.log('\n🎨 Vytvářím barvy...');
    const colorMap: Record<string, number | string> = {};
    for (const color of colorsData) {
      const existing = await payload.find({ collection: 'colors', where: { slug: { equals: color.slug } }, limit: 1 });
      if (existing.totalDocs === 0) {
        const created = await payload.create({
          collection: 'colors',
          data: { slug: color.slug, name: color.name.cs, hexCode: color.hexCode },
        });
        colorMap[color.slug] = created.id;
        
        // Aktualizace EN a HE locale
        await payload.update({ collection: 'colors', id: created.id, data: { name: color.name.en }, locale: 'en' });
        await payload.update({ collection: 'colors', id: created.id, data: { name: color.name.he }, locale: 'he' });
      } else {
        colorMap[color.slug] = existing.docs[0].id;
      }
    }
    console.log(`✅ ${colorsData.length} barev připraveno`);

    // 5. Tagy
    console.log('\n🏷️  Vytvářím tagy...');
    const tagMap: Record<string, number | string> = {};
    for (const tag of tagsData) {
      const existing = await payload.find({ collection: 'tags', where: { slug: { equals: tag.slug } }, limit: 1 });
      if (existing.totalDocs === 0) {
        const created = await payload.create({
          collection: 'tags',
          data: { slug: tag.slug, name: tag.name.cs },
        });
        tagMap[tag.slug] = created.id;
        
        // Aktualizace EN a HE locale
        await payload.update({ collection: 'tags', id: created.id, data: { name: tag.name.en }, locale: 'en' });
        await payload.update({ collection: 'tags', id: created.id, data: { name: tag.name.he }, locale: 'he' });
      } else {
        tagMap[tag.slug] = existing.docs[0].id;
      }
    }
    console.log(`✅ ${tagsData.length} tagů připraveno`);

    // 6. Produkty s obrázky
    console.log('\n🖼️  Nahrávám obrázky a vytvářím produkty...');
    for (let i = 0; i < productsData.length; i++) {
      const product = productsData[i];
      const existing = await payload.find({ collection: 'products', where: { slug: { equals: product.slug } }, limit: 1 });
      if (existing.totalDocs > 0) {
        console.log(`  ℹ️  ${product.name.cs} již existuje`);
        continue;
      }

      // Upload obrázku
      const imageId = await uploadImage(payload, product.image, {
        cs: `Ketuba ${product.name.cs}`,
        en: `Ketubah ${product.name.en}`,
        he: `כתובה ${product.name.he}`,
      });

      // Vytvoření produktu (CS) - obrázky mají lokalizovaný alt
      const created = await payload.create({
        collection: 'products',
        data: {
          slug: product.slug,
          name: product.name.cs,
          shortDescription: product.shortDescription.cs,
          prices: { giclee: product.prices.giclee, gicleeAvailable: true, original: product.prices.original, originalAvailable: true },
          dimensions: { width: 40 + (i % 5) * 5, height: 50 + (i % 4) * 5, unit: 'cm' },
          category: categoryMap[product.category],
          colors: product.colors.map(c => colorMap[c]).filter(Boolean),
          tags: product.tags.map(t => tagMap[t]).filter(Boolean),
          images: imageId ? [{ image: imageId, alt: `Ketuba ${product.name.cs}`, isMain: true }] : [],
          featured: product.popularity >= 4,
          popularity: product.popularity,
          status: 'published',
        },
      });
      
      // Aktualizace EN locale (včetně alt v images)
      await payload.update({
        collection: 'products',
        id: created.id,
        data: {
          name: product.name.en,
          shortDescription: product.shortDescription.en,
          images: imageId ? [{ image: imageId, alt: `Ketubah ${product.name.en}`, isMain: true }] : [],
        },
        locale: 'en',
      });
      
      // Aktualizace HE locale (včetně alt v images)
      await payload.update({
        collection: 'products',
        id: created.id,
        data: {
          name: product.name.he,
          shortDescription: product.shortDescription.he,
          images: imageId ? [{ image: imageId, alt: `כתובה ${product.name.he}`, isMain: true }] : [],
        },
        locale: 'he',
      });
      
      console.log(`  ✅ ${product.name.cs}`);
    }

    // 7. Stránky
    console.log('\n📄 Vytvářím stránky...');
    for (const page of pagesData) {
      const existing = await payload.find({ collection: 'pages', where: { slug: { equals: page.slug } }, limit: 1 });
      if (existing.totalDocs > 0) {
        console.log(`  ℹ️  ${page.title.cs} již existuje`);
        continue;
      }
      
      // Vytvoření stránky (CS)
      const created = await payload.create({
        collection: 'pages',
        data: {
          slug: page.slug,
          title: page.title.cs,
          content: emptyRichText,
          pageType: page.pageType,
          seo: { metaDescription: page.metaDescription.cs },
          status: 'published',
        },
      });
      
      // Aktualizace EN a HE locale
      await payload.update({
        collection: 'pages',
        id: created.id,
        data: { title: page.title.en, content: emptyRichText, seo: { metaDescription: page.metaDescription.en } },
        locale: 'en',
      });
      await payload.update({
        collection: 'pages',
        id: created.id,
        data: { title: page.title.he, content: emptyRichText, seo: { metaDescription: page.metaDescription.he } },
        locale: 'he',
      });
      
      console.log(`  ✅ ${page.title.cs}`);
    }

    // 8. Kurzy měn
    console.log('\n💱 Kontroluji kurzy měn...');
    const existingRates = await payload.find({ collection: 'exchange-rates', limit: 1 });
    if (existingRates.totalDocs === 0) {
      await payload.create({
        collection: 'exchange-rates',
        data: { date: new Date().toISOString().split('T')[0], eurRate: 25.2, usdRate: 23.5 },
      });
      console.log('✅ Výchozí kurzy nastaveny (EUR: 25.2, USD: 23.5)');
    } else {
      console.log('ℹ️  Kurzy již existují');
    }

    console.log('\n🎉 Seedování dokončeno!');
    console.log('\n📋 Přihlašovací údaje:');
    console.log('   Email: admin@ketubah.cz');
    console.log('   Heslo: admin123');
    console.log('\n🔗 Admin panel: http://localhost:3000/admin');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Chyba při seedování:', error);
    process.exit(1);
  }
}

seed();
