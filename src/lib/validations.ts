import { z } from 'zod';

// Validační schema pro kontaktní formulář
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Jméno musí mít alespoň 2 znaky')
    .max(100, 'Jméno může mít maximálně 100 znaků'),
  email: z
    .string()
    .email('Neplatná e-mailová adresa'),
  subject: z
    .string()
    .min(5, 'Předmět musí mít alespoň 5 znaků')
    .max(200, 'Předmět může mít maximálně 200 znaků'),
  message: z
    .string()
    .min(10, 'Zpráva musí mít alespoň 10 znaků')
    .max(5000, 'Zpráva může mít maximálně 5000 znaků'),
  productId: z.string().optional(),
  productName: z.string().optional(),
  honeypot: z
    .string()
    .max(0, 'Spam detekován'), // Musí být prázdné
});

export type ContactFormData = z.infer<typeof contactSchema>;
