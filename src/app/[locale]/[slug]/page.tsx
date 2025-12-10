import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/components/ui/Link';
import { FAQJsonLd } from '@/components/seo/FAQJsonLd';
import { getPageBySlug, getAllPageSlugs, type PageData } from '@/lib/queries';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// Rezervované cesty - tyto slug nebudou zpracovány touto routou
const RESERVED_SLUGS = ['products', 'contact', 'admin', 'api'];

// Funkce pro načtení stránky - zkusí Payload CMS, pak fallback na mock data
async function getPage(slug: string, locale: string): Promise<PageData | null> {
  // Kontrola rezervovaných cest
  if (RESERVED_SLUGS.includes(slug)) {
    return null;
  }

  // Zkusit načíst z Payload CMS
  const cmsPage = await getPageBySlug(slug, locale);
  if (cmsPage) {
    return cmsPage;
  }

  // Fallback na mock data pro základní stránky
  const mockPages: Record<string, {
    title: Record<string, string>;
    slug: string;
    pageType: 'default' | 'faq' | 'legal';
    content: Record<string, string>;
    faqItems?: Array<{
      question: Record<string, string>;
      answer: Record<string, string>;
    }>;
    seo?: {
      metaTitle?: Record<string, string>;
      metaDescription?: Record<string, string>;
    };
  }> = {
    about: {
      title: {
        cs: 'O mně',
        en: 'About Me',
        he: 'אודותיי',
      },
      slug: 'about',
      pageType: 'default',
      content: {
        cs: `<h2>Vítejte v Ketubah Art Studio</h2>
        <p>Jsem umělkyně specializující se na tvorbu originálních ketub - židovských svatebních smluv. Každá ketuba je jedinečné umělecké dílo, které kombinuje tradiční techniky s moderním designem.</p>
        <h3>Moje práce</h3>
        <p>Věnuji se tvorbě ketub již více než 10 let. Každý kus je ručně malovaný temperovými barvami na kvalitním pergamenu nebo papíru. Nabízím jak originální díla, tak kvalitní Giclée tisky.</p>
        <h3>Personalizace</h3>
        <p>Každá ketuba může být přizpůsobena vašim přáním - text, barvy, motivy. Kontaktujte mě pro více informací.</p>`,
        en: `<h2>Welcome to Ketubah Art Studio</h2>
        <p>I am an artist specializing in creating original ketubot - Jewish wedding contracts. Each ketubah is a unique work of art that combines traditional techniques with modern design.</p>
        <h3>My Work</h3>
        <p>I have been creating ketubot for over 10 years. Each piece is hand-painted with tempera paints on quality parchment or paper. I offer both original works and high-quality Giclée prints.</p>
        <h3>Personalization</h3>
        <p>Each ketubah can be customized to your wishes - text, colors, motifs. Contact me for more information.</p>`,
        he: `<h2>ברוכים הבאים לסטודיו לאמנות כתובה</h2>
        <p>אני אמנית המתמחה ביצירת כתובות מקוריות - חוזי נישואין יהודיים. כל כתובה היא יצירת אמנות ייחודית המשלבת טכניקות מסורתיות עם עיצוב מודרני.</p>
        <h3>העבודה שלי</h3>
        <p>אני יוצרת כתובות כבר יותר מ-10 שנים. כל יצירה מצוירת ביד בצבעי טמפרה על קלף או נייר איכותי. אני מציעה גם יצירות מקוריות וגם הדפסי ז׳יקלה איכותיים.</p>
        <h3>התאמה אישית</h3>
        <p>כל כתובה ניתנת להתאמה אישית לפי רצונכם - טקסט, צבעים, מוטיבים. צרו קשר לקבלת מידע נוסף.</p>`,
      },
      seo: {
        metaTitle: {
          cs: 'O mně | Ketubah Art Studio',
          en: 'About Me | Ketubah Art Studio',
          he: 'אודותיי | סטודיו לאמנות כתובה',
        },
        metaDescription: {
          cs: 'Poznejte příběh za Ketubah Art Studio. Originální ketubot a Giclée tisky nejvyšší kvality.',
          en: 'Discover the story behind Ketubah Art Studio. Original ketubot and highest quality Giclée prints.',
          he: 'גלו את הסיפור מאחורי סטודיו לאמנות כתובה. כתובות מקוריות והדפסי ז׳יקלה באיכות הגבוהה ביותר.',
        },
      },
    },
    faq: {
      title: {
        cs: 'Často kladené dotazy',
        en: 'Frequently Asked Questions',
        he: 'שאלות נפוצות',
      },
      slug: 'faq',
      pageType: 'faq',
      content: {
        cs: '<p>Zde najdete odpovědi na nejčastější dotazy ohledně ketub a procesu objednávky.</p>',
        en: '<p>Here you will find answers to the most common questions about ketubot and the ordering process.</p>',
        he: '<p>כאן תמצאו תשובות לשאלות הנפוצות ביותר לגבי כתובות ותהליך ההזמנה.</p>',
      },
      faqItems: [
        {
          question: {
            cs: 'Co je to ketuba?',
            en: 'What is a ketubah?',
            he: 'מהי כתובה?',
          },
          answer: {
            cs: 'Ketuba je tradiční židovská svatební smlouva, která stanovuje práva a povinnosti manžela vůči manželce. Dnes je často vytvářena jako umělecké dílo, které je důležitou součástí svatebního obřadu.',
            en: 'A ketubah is a traditional Jewish wedding contract that outlines the rights and responsibilities of the groom towards the bride. Today, it is often created as a work of art that is an important part of the wedding ceremony.',
            he: 'כתובה היא חוזה נישואין יהודי מסורתי המפרט את זכויותיו וחובותיו של החתן כלפי הכלה. כיום, היא נוצרת לעתים קרובות כיצירת אמנות שהיא חלק חשוב מטקס החתונה.',
          },
        },
        {
          question: {
            cs: 'Jaký je rozdíl mezi originálem a Giclée tiskem?',
            en: 'What is the difference between an original and a Giclée print?',
            he: 'מה ההבדל בין מקור להדפס ז׳יקלה?',
          },
          answer: {
            cs: 'Originál je ručně malované jedinečné dílo. Giclée tisk je vysoce kvalitní archivní tisk originálu na speciálním papíře, který zachovává věrnost barev a detailů.',
            en: 'An original is a hand-painted unique piece. A Giclée print is a high-quality archival print of the original on special paper that preserves color fidelity and details.',
            he: 'מקור הוא יצירה ייחודית מצוירת ביד. הדפס ז׳יקלה הוא הדפס ארכיוני באיכות גבוהה של המקור על נייר מיוחד ששומר על נאמנות הצבעים והפרטים.',
          },
        },
        {
          question: {
            cs: 'Jak dlouho trvá vytvoření ketuby?',
            en: 'How long does it take to create a ketubah?',
            he: 'כמה זמן לוקח ליצור כתובה?',
          },
          answer: {
            cs: 'Originální ketuba trvá obvykle 4-6 týdnů. Giclée tisk s personalizací je obvykle připraven do 2 týdnů.',
            en: 'An original ketubah usually takes 4-6 weeks. A Giclée print with personalization is usually ready within 2 weeks.',
            he: 'כתובה מקורית אורכת בדרך כלל 4-6 שבועות. הדפס ז׳יקלה עם התאמה אישית מוכן בדרך כלל תוך שבועיים.',
          },
        },
        {
          question: {
            cs: 'Můžete přizpůsobit text ketuby?',
            en: 'Can you customize the ketubah text?',
            he: 'האם ניתן להתאים את טקסט הכתובה?',
          },
          answer: {
            cs: 'Ano, text ketuby může být přizpůsoben vašim potřebám. Nabízím tradiční ortodoxní texty, konzervativní texty i moderní egalitární verze.',
            en: 'Yes, the ketubah text can be customized to your needs. I offer traditional Orthodox texts, Conservative texts, and modern egalitarian versions.',
            he: 'כן, ניתן להתאים את טקסט הכתובה לצרכים שלכם. אני מציעה טקסטים אורתודוקסיים מסורתיים, טקסטים קונסרבטיביים וגרסאות שוויוניות מודרניות.',
          },
        },
      ],
      seo: {
        metaTitle: {
          cs: 'FAQ | Ketubah Art Studio',
          en: 'FAQ | Ketubah Art Studio',
          he: 'שאלות נפוצות | סטודיו לאמנות כתובה',
        },
        metaDescription: {
          cs: 'Odpovědi na často kladené dotazy o ketubách, procesu objednávky a personalizaci.',
          en: 'Answers to frequently asked questions about ketubot, the ordering process, and personalization.',
          he: 'תשובות לשאלות נפוצות על כתובות, תהליך ההזמנה והתאמה אישית.',
        },
      },
    },
    privacy: {
      title: {
        cs: 'Ochrana soukromí',
        en: 'Privacy Policy',
        he: 'מדיניות פרטיות',
      },
      slug: 'privacy',
      pageType: 'legal',
      content: {
        cs: `<h2>Ochrana osobních údajů</h2>
        <p>Vaše soukromí je pro nás důležité. Tato stránka popisuje, jaké údaje shromažďujeme a jak s nimi nakládáme.</p>
        <h3>Jaké údaje shromažďujeme</h3>
        <p>Shromažďujeme pouze údaje, které nám dobrovolně poskytnete prostřednictvím kontaktního formuláře: jméno, e-mail a obsah zprávy.</p>
        <h3>Jak údaje používáme</h3>
        <p>Vaše údaje používáme výhradně pro účely odpovědi na vaše dotazy a komunikaci ohledně objednávek.</p>
        <h3>Sdílení údajů</h3>
        <p>Vaše osobní údaje nikdy neprodáváme ani nesdílíme s třetími stranami, kromě případů vyžadovaných zákonem.</p>
        <h3>Kontakt</h3>
        <p>V případě dotazů ohledně ochrany osobních údajů nás kontaktujte prostřednictvím kontaktního formuláře.</p>`,
        en: `<h2>Privacy Policy</h2>
        <p>Your privacy is important to us. This page describes what data we collect and how we handle it.</p>
        <h3>What Data We Collect</h3>
        <p>We only collect data that you voluntarily provide through the contact form: name, email, and message content.</p>
        <h3>How We Use Data</h3>
        <p>We use your data exclusively for responding to your inquiries and communication regarding orders.</p>
        <h3>Data Sharing</h3>
        <p>We never sell or share your personal data with third parties, except as required by law.</p>
        <h3>Contact</h3>
        <p>If you have questions about privacy, please contact us through the contact form.</p>`,
        he: `<h2>מדיניות פרטיות</h2>
        <p>הפרטיות שלכם חשובה לנו. דף זה מתאר אילו נתונים אנו אוספים וכיצד אנו מטפלים בהם.</p>
        <h3>אילו נתונים אנו אוספים</h3>
        <p>אנו אוספים רק נתונים שאתם מספקים מרצונכם דרך טופס יצירת הקשר: שם, אימייל ותוכן ההודעה.</p>
        <h3>כיצד אנו משתמשים בנתונים</h3>
        <p>אנו משתמשים בנתונים שלכם אך ורק לצורך מענה לפניותיכם ותקשורת בנוגע להזמנות.</p>
        <h3>שיתוף נתונים</h3>
        <p>אנו לעולם לא מוכרים או משתפים את הנתונים האישיים שלכם עם צדדים שלישיים, אלא אם נדרש על פי חוק.</p>
        <h3>יצירת קשר</h3>
        <p>אם יש לכם שאלות לגבי פרטיות, אנא צרו קשר דרך טופס יצירת הקשר.</p>`,
      },
      seo: {
        metaTitle: {
          cs: 'Ochrana soukromí | Ketubah Art Studio',
          en: 'Privacy Policy | Ketubah Art Studio',
          he: 'מדיניות פרטיות | סטודיו לאמנות כתובה',
        },
        metaDescription: {
          cs: 'Informace o ochraně osobních údajů na webu Ketubah Art Studio.',
          en: 'Information about personal data protection on the Ketubah Art Studio website.',
          he: 'מידע על הגנת נתונים אישיים באתר סטודיו לאמנות כתובה.',
        },
      },
    },
    cookies: {
      title: {
        cs: 'Cookies',
        en: 'Cookie Policy',
        he: 'מדיניות עוגיות',
      },
      slug: 'cookies',
      pageType: 'legal',
      content: {
        cs: `<h2>Zásady používání cookies</h2>
        <p>Tento web používá cookies pro zajištění základní funkcionality.</p>
        <h3>Co jsou cookies</h3>
        <p>Cookies jsou malé textové soubory, které se ukládají do vašeho prohlížeče při návštěvě webových stránek.</p>
        <h3>Jaké cookies používáme</h3>
        <ul>
        <li><strong>Nezbytné cookies</strong> - pro základní funkčnost webu (např. preference měny a jazyka)</li>
        <li><strong>Analytické cookies</strong> - pouze s vaším souhlasem, pro pochopení návštěvnosti webu</li>
        </ul>
        <h3>Správa cookies</h3>
        <p>Cookies můžete spravovat nebo zakázat v nastavení vašeho prohlížeče.</p>`,
        en: `<h2>Cookie Policy</h2>
        <p>This website uses cookies to ensure basic functionality.</p>
        <h3>What Are Cookies</h3>
        <p>Cookies are small text files that are stored in your browser when you visit a website.</p>
        <h3>What Cookies We Use</h3>
        <ul>
        <li><strong>Essential cookies</strong> - for basic website functionality (e.g., currency and language preferences)</li>
        <li><strong>Analytics cookies</strong> - only with your consent, to understand website traffic</li>
        </ul>
        <h3>Managing Cookies</h3>
        <p>You can manage or disable cookies in your browser settings.</p>`,
        he: `<h2>מדיניות עוגיות</h2>
        <p>אתר זה משתמש בעוגיות כדי להבטיח פונקציונליות בסיסית.</p>
        <h3>מהן עוגיות</h3>
        <p>עוגיות הן קבצי טקסט קטנים שנשמרים בדפדפן שלכם כשאתם מבקרים באתר.</p>
        <h3>באילו עוגיות אנו משתמשים</h3>
        <ul>
        <li><strong>עוגיות חיוניות</strong> - לפונקציונליות בסיסית של האתר (למשל, העדפות מטבע ושפה)</li>
        <li><strong>עוגיות אנליטיות</strong> - רק בהסכמתכם, להבנת תנועת האתר</li>
        </ul>
        <h3>ניהול עוגיות</h3>
        <p>ניתן לנהל או להשבית עוגיות בהגדרות הדפדפן שלכם.</p>`,
      },
      seo: {
        metaTitle: {
          cs: 'Cookies | Ketubah Art Studio',
          en: 'Cookie Policy | Ketubah Art Studio',
          he: 'מדיניות עוגיות | סטודיו לאמנות כתובה',
        },
        metaDescription: {
          cs: 'Informace o používání cookies na webu Ketubah Art Studio.',
          en: 'Information about cookie usage on the Ketubah Art Studio website.',
          he: 'מידע על שימוש בעוגיות באתר סטודיו לאמנות כתובה.',
        },
      },
    },
  };

  const page = mockPages[slug];
  if (!page) {
    return null;
  }

  return {
    id: slug,
    title: page.title[locale] || page.title.en,
    slug: page.slug,
    pageType: page.pageType,
    content: page.content[locale] || page.content.en,
    faqItems: page.faqItems?.map((item) => ({
      question: item.question[locale] || item.question.en,
      answer: item.answer[locale] || item.answer.en,
    })),
    seo: page.seo
      ? {
          metaTitle: page.seo.metaTitle?.[locale] || page.seo.metaTitle?.en,
          metaDescription: page.seo.metaDescription?.[locale] || page.seo.metaDescription?.en,
        }
      : undefined,
  };
}

// Generování statických parametrů pro všechny stránky
export async function generateStaticParams() {
  // Zkusit načíst z CMS, jinak fallback
  const cmsSlugs = await getAllPageSlugs();
  const slugs = cmsSlugs.length > 0 ? cmsSlugs : ['about', 'faq', 'privacy', 'cookies'];
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getPage(slug, locale);

  if (!page) {
    return { title: 'Page not found' };
  }

  return {
    title: page.seo?.metaTitle || page.title,
    description: page.seo?.metaDescription,
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });

  const page = await getPage(slug, locale);
  if (!page) {
    notFound();
  }

  return (
    <>
      {/* FAQ JSON-LD pro SEO */}
      {page.pageType === 'faq' && page.faqItems && (
        <FAQJsonLd
          items={page.faqItems.map((item) => ({
            question: item.question,
            answer: item.answer,
          }))}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="text-sm text-muted mb-6">
          <Link href="/" className="hover:text-text">
            {t('home')}
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-text">{page.title}</span>
        </nav>

        {/* Hlavní obsah */}
        <article className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">{page.title}</h1>

          {/* Obsah stránky */}
          <div
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />

          {/* FAQ sekce */}
          {page.pageType === 'faq' && page.faqItems && page.faqItems.length > 0 && (
            <div className="space-y-6">
              {page.faqItems.map((item, index) => (
                <details
                  key={index}
                  className="group border border-gray-200 rounded-lg overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-4 cursor-pointer bg-card-bg hover:bg-gray-100 transition-colors font-medium">
                    {item.question}
                    <span className="ml-4 text-gray-500 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <div
                    className="p-4 prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: item.answer }}
                  />
                </details>
              ))}
            </div>
          )}

          {/* Zpětný odkaz pro právní stránky */}
          {page.pageType === 'legal' && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <Link
                href="/"
                className="text-primary hover:text-primary-hover transition-colors"
              >
                ← {t('backToHome')}
              </Link>
            </div>
          )}
        </article>
      </div>
    </>
  );
}
