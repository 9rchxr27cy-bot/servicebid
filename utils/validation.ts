import { z } from 'zod';

const phoneRegex = /^(\+352|6)\d{8}$/;
const postalCodeRegex = /^(L-)?\d{4}$/;

export const profileSchema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().regex(phoneRegex, "Format invalide (+352 ou 6XXXXXXXX)"),
  languages: z.array(z.string()).min(1, "Sélectionnez au moins une langue"),
  
  // Smart Address Fields
  postalCode: z.string().regex(postalCodeRegex, "4 chiffres requis (ex: 1234)"),
  locality: z.string().min(2, "Localité requise"),
  street: z.string().min(2, "Rue requise"),
  number: z.string().min(1, "N° requis"),
  
  // Logistics metadata - aligned with Address type property names
  residence: z.string().optional(),
  floor: z.string().optional(),
  hasElevator: z.boolean(),
  easyParking: z.boolean(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;