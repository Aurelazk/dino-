import { z } from "zod";

export const roleEnum = z.enum(["BUYER", "SELLER"]);
export type Role = z.infer<typeof roleEnum>;

// Aligné sur l'enum Prisma `SellerType`.
export const sellerTypeEnum = z.enum([
  "PRODUCER",
  "MERCHANT",
  "COOPERATIVE",
  "PROCESSOR",
]);
export type SellerType = z.infer<typeof sellerTypeEnum>;

const phoneRegex = /^(?:\+?229)?\s?0?1?\d{8,9}$/;

export const signupSchema = z
  .object({
    role: roleEnum,
    firstName: z.string().trim().min(2, "Prénom trop court").max(50),
    lastName: z.string().trim().min(2, "Nom trop court").max(50),
    email: z.string().trim().email("Adresse e-mail invalide"),
    phone: z.string().trim().regex(phoneRegex, "Numéro de téléphone invalide"),
    password: z
      .string()
      .min(8, "8 caractères minimum")
      .regex(/[A-Za-z]/, "Doit contenir une lettre")
      .regex(/\d/, "Doit contenir un chiffre"),
    country: z.string().min(2).default("Bénin"),
    city: z.string().trim().min(2, "Ville requise").max(60),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "Vous devez accepter les conditions" }),
    }),
    // Champs vendeur (optionnels côté acheteur)
    sellerType: sellerTypeEnum.optional(),
    shopName: z.string().trim().max(80).optional(),
    shopDescription: z.string().trim().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "SELLER") {
      if (!data.sellerType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sellerType"],
          message: "Choisissez un type de vendeur",
        });
      }
      if (!data.shopName || data.shopName.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["shopName"],
          message: "Nom de la boutique / exploitation requis",
        });
      }
    }
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const sellerTypeLabels: Record<SellerType, string> = {
  PRODUCER: "Producteur / Agriculteur",
  MERCHANT: "Grossiste / Commerçant",
  COOPERATIVE: "Coopérative",
  PROCESSOR: "Transformateur agroalimentaire",
};
