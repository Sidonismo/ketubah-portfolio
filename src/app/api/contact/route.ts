import { NextRequest, NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validations';
import { sendContactEmail } from '@/lib/resend';

// Rate limiting - jednoduchá in-memory implementace
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // Max 5 požadavků
const RATE_LIMIT_WINDOW = 60 * 1000; // Za 1 minutu

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMITED', message: 'Příliš mnoho požadavků. Zkuste to znovu za minutu.' } },
        { status: 429 }
      );
    }

    // Parsování a validace dat
    const body = await request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Nevalidní data', details: errors } },
        { status: 400 }
      );
    }

    // Honeypot check
    if (result.data.honeypot) {
      // Tichý fail pro spamboty
      return NextResponse.json({ success: true });
    }

    // Odeslání emailu
    await sendContactEmail(result.data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Interní chyba serveru' } },
      { status: 500 }
    );
  }
}
