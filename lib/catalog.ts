import type { Unit } from "@prisma/client";

export const unitLabels: Record<Unit, string> = {
  KG: "kg",
  SAC: "sac",
  TAS: "tas",
  LITRE: "L",
  CAISSE: "caisse",
  CARTON: "carton",
  PIECE: "pièce",
  BOTTE: "botte",
  POT: "pot",
  REGIME: "régime",
};

export const sortOptions = [
  { value: "recent", label: "Plus récents" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "rating", label: "Mieux notés" },
] as const;

export type SortValue = (typeof sortOptions)[number]["value"];

export function parseSort(value?: string | string[]): SortValue {
  const v = Array.isArray(value) ? value[0] : value;
  return (sortOptions.find((s) => s.value === v)?.value ?? "recent") as SortValue;
}
