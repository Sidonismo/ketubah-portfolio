// Integrace s ČNB API pro kurzy měn

const CNB_URL =
  'https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt';

export interface ExchangeRates {
  date: Date;
  eurRate: number; // Kolik CZK za 1 EUR
  usdRate: number; // Kolik CZK za 1 USD
  source: string;
}

// Parsování ČNB formátu
function parseCNBResponse(text: string): ExchangeRates {
  const lines = text.split('\n');

  // První řádek obsahuje datum
  const dateParts = lines[0].split(' ')[0].split('.');
  const date = new Date(
    parseInt(dateParts[2]),
    parseInt(dateParts[1]) - 1,
    parseInt(dateParts[0])
  );

  let eurRate = 25.0; // Fallback
  let usdRate = 23.0; // Fallback

  // Parsování řádků s kurzem (formát: země|měna|množství|kód|kurz)
  for (const line of lines.slice(2)) {
    const parts = line.split('|');
    if (parts.length < 5) continue;

    const code = parts[3];
    const amount = parseFloat(parts[2]);
    const rate = parseFloat(parts[4].replace(',', '.'));

    if (code === 'EUR') {
      eurRate = rate / amount;
    } else if (code === 'USD') {
      usdRate = rate / amount;
    }
  }

  return { date, eurRate, usdRate, source: 'CNB' };
}

// Načtení aktuálních kurzů z ČNB
export async function fetchCNBRates(): Promise<ExchangeRates> {
  const response = await fetch(CNB_URL, {
    next: { revalidate: 3600 }, // Cache na 1 hodinu
  });

  if (!response.ok) {
    throw new Error(`ČNB API error: ${response.status}`);
  }

  const text = await response.text();
  return parseCNBResponse(text);
}

// Fallback kurzy pokud ČNB API není dostupné
export const FALLBACK_RATES: ExchangeRates = {
  date: new Date(),
  eurRate: 25.0,
  usdRate: 23.0,
  source: 'fallback',
};

// Získání kurzů s fallbackem
export async function getExchangeRates(): Promise<ExchangeRates> {
  try {
    return await fetchCNBRates();
  } catch (error) {
    console.error('ČNB API error, using fallback rates:', error);
    return FALLBACK_RATES;
  }
}
