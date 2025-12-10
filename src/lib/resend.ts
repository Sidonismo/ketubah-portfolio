import { Resend } from 'resend';

// Resend klient pro odesílání emailů
export const resend = new Resend(process.env.RESEND_API_KEY);

// Kontaktní email
export const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'info@example.com';

// Odeslání kontaktního formuláře
export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  productId?: string;
  productName?: string;
}) {
  const { name, email, subject, message, productId, productName } = data;

  const productInfo = productId
    ? `<p><strong>Produkt:</strong> ${productName || productId}</p>`
    : '';

  return await resend.emails.send({
    from: 'Ketubah Art Studio <noreply@ketubah.art>',
    to: CONTACT_EMAIL,
    subject: `[Kontakt] ${subject}`,
    replyTo: email,
    html: `
      <h2>Nová zpráva z kontaktního formuláře</h2>
      <p><strong>Od:</strong> ${name} (${email})</p>
      <p><strong>Předmět:</strong> ${subject}</p>
      ${productInfo}
      <hr />
      <p><strong>Zpráva:</strong></p>
      <p>${message.replace(/\n/g, '<br />')}</p>
    `,
  });
}
