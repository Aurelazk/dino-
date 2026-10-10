import { hash, verify } from "@node-rs/argon2";

// Paramètres recommandés OWASP pour Argon2id (≈ 19 Mio, 2 passes).
const OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export function hashPassword(password: string): Promise<string> {
  return hash(password, OPTIONS);
}

export function verifyPassword(
  storedHash: string,
  password: string,
): Promise<boolean> {
  return verify(storedHash, password).catch(() => false);
}
