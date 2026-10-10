import type { Unit } from "@prisma/client";
import type { ProductCardData } from "@/components/catalog/product-card";

export interface DemoCategory {
  name: string;
  slug: string;
  icon: string;
}

export const demoCategories: DemoCategory[] = [
  { name: "Céréales", slug: "cereales", icon: "Wheat" },
  { name: "Légumes", slug: "legumes", icon: "Carrot" },
  { name: "Fruits", slug: "fruits", icon: "Apple" },
  { name: "Tubercules", slug: "tubercules", icon: "Salad" },
  { name: "Volaille & viande", slug: "volaille-viande", icon: "Beef" },
  { name: "Poissons", slug: "poissons", icon: "Fish" },
  { name: "Œufs & lait", slug: "oeufs-lait", icon: "Egg" },
  { name: "Intrants & semences", slug: "intrants-semences", icon: "Sprout" },
];

const categoryBySlug = new Map(demoCategories.map((c) => [c.slug, c]));

const shops = {
  "ferme-kotokoli": {
    shopName: "Ferme Kotokoli",
    city: "Porto-Novo",
    slug: "ferme-kotokoli",
  },
  "cooperative-agonlin": {
    shopName: "Coopérative Agonlin",
    city: "Abomey",
    slug: "cooperative-agonlin",
  },
} as const;

type ShopSlug = keyof typeof shops;

interface DemoProductSeed {
  title: string;
  slug: string;
  price: number;
  unit: Unit;
  cat: string;
  shop: ShopSlug;
  isOrganic?: boolean;
}

const productSeeds: DemoProductSeed[] = [
  { title: "Maïs jaune", slug: "mais-jaune", cat: "cereales", unit: "KG", price: 350, shop: "ferme-kotokoli" },
  { title: "Riz local parfumé", slug: "riz-local-parfume", cat: "cereales", unit: "KG", price: 650, shop: "cooperative-agonlin" },
  { title: "Mil", slug: "mil", cat: "cereales", unit: "KG", price: 400, shop: "cooperative-agonlin" },
  { title: "Tomate fraîche", slug: "tomate-fraiche", cat: "legumes", unit: "KG", price: 500, shop: "ferme-kotokoli", isOrganic: true },
  { title: "Piment", slug: "piment", cat: "legumes", unit: "KG", price: 1500, shop: "ferme-kotokoli" },
  { title: "Gombo frais", slug: "gombo-frais", cat: "legumes", unit: "KG", price: 400, shop: "ferme-kotokoli" },
  { title: "Oignon", slug: "oignon", cat: "legumes", unit: "KG", price: 600, shop: "cooperative-agonlin" },
  { title: "Ananas pain de sucre", slug: "ananas-pain-de-sucre", cat: "fruits", unit: "PIECE", price: 500, shop: "cooperative-agonlin", isOrganic: true },
  { title: "Mangue", slug: "mangue", cat: "fruits", unit: "KG", price: 700, shop: "ferme-kotokoli" },
  { title: "Banane douce", slug: "banane-douce", cat: "fruits", unit: "KG", price: 400, shop: "ferme-kotokoli" },
  { title: "Igname", slug: "igname", cat: "tubercules", unit: "KG", price: 600, shop: "cooperative-agonlin" },
  { title: "Manioc frais", slug: "manioc-frais", cat: "tubercules", unit: "KG", price: 300, shop: "cooperative-agonlin" },
  { title: "Poulet fermier", slug: "poulet-fermier", cat: "volaille-viande", unit: "PIECE", price: 4500, shop: "ferme-kotokoli" },
  { title: "Tilapia frais", slug: "tilapia-frais", cat: "poissons", unit: "KG", price: 2000, shop: "ferme-kotokoli" },
  { title: "Œufs de ferme (plateau de 30)", slug: "oeufs-ferme-plateau-30", cat: "oeufs-lait", unit: "CARTON", price: 2500, shop: "ferme-kotokoli" },
  { title: "Semences de maïs améliorées", slug: "semences-mais", cat: "intrants-semences", unit: "SAC", price: 12000, shop: "cooperative-agonlin" },
];

function imageUrl(slug: string) {
  return `https://picsum.photos/seed/agri-${slug}/800/600`;
}

function categoryFor(slug: string): { name: string; icon: string } {
  const cat = categoryBySlug.get(slug);
  return { name: cat?.name ?? slug, icon: cat?.icon ?? "Leaf" };
}

export const demoProducts: ProductCardData[] = productSeeds.map((p) => ({
  title: p.title,
  slug: p.slug,
  price: p.price,
  unit: p.unit,
  isOrganic: Boolean(p.isOrganic),
  isFresh: true,
  imageUrl: imageUrl(p.slug),
  ratingAvg: 4.5,
  ratingCount: 8,
  category: categoryFor(p.cat),
  sellerProfile: shops[p.shop],
}));

export interface DemoShopProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  unit: Unit;
  isOrganic: boolean;
  isFresh: boolean;
  images: { url: string }[];
  ratingAvg: number;
  ratingCount: number;
  category: { name: string; icon: string | null };
  sellerProfile: { shopName: string; city: string | null; slug: string };
}

export interface DemoShop {
  shopName: string;
  slug: string;
  city: string | null;
  region: string | null;
  coverUrl: string;
  logoUrl: string;
  verification: string;
  ratingAvg: number;
  products: DemoShopProduct[];
}

export const demoShop: DemoShop = {
  shopName: shops["ferme-kotokoli"].shopName,
  slug: shops["ferme-kotokoli"].slug,
  city: shops["ferme-kotokoli"].city,
  region: "Ouémé",
  coverUrl: "https://picsum.photos/seed/agri-shop-ferme-kotokoli/1200/400",
  logoUrl: "https://picsum.photos/seed/agri-logo-ferme-kotokoli/256/256",
  verification: "VERIFIED",
  ratingAvg: 4.6,
  products: productSeeds
    .filter((p) => p.shop === "ferme-kotokoli")
    .slice(0, 8)
    .map((p) => ({
      id: `demo-${p.slug}`,
      title: p.title,
      slug: p.slug,
      price: p.price,
      unit: p.unit,
      isOrganic: Boolean(p.isOrganic),
      isFresh: true,
      images: [{ url: imageUrl(p.slug) }],
      ratingAvg: 4.5,
      ratingCount: 8,
      category: categoryFor(p.cat),
      sellerProfile: shops["ferme-kotokoli"],
    })),
};
