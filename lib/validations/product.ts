import { z } from "zod";

export const UNIT_VALUES = [
  "KG",
  "SAC",
  "TAS",
  "LITRE",
  "CAISSE",
  "CARTON",
  "PIECE",
  "BOTTE",
  "POT",
  "REGIME",
] as const;

export const productSchema = z.object({
  title: z.string().trim().min(3, "Titre trop court").max(120),
  categoryId: z.string().min(1, "Choisissez une catégorie"),
  unit: z.enum(UNIT_VALUES),
  price: z.coerce.number().int("Prix invalide").positive("Prix invalide"),
  stock: z.coerce.number().int().min(0, "Stock invalide"),
  minOrderQty: z.coerce.number().int().min(1).default(1),
  description: z.string().trim().max(1000).optional(),
  isOrganic: z.coerce.boolean().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
