import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/** Génère un jeton aléatoire (à envoyer à l'utilisateur, jamais stocké en clair). */
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/** Empreinte déterministe du jeton, seule valeur persistée en base. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function tokensEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}
