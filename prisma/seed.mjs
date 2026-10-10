import { PrismaClient } from "@prisma/client";
import { hash } from "@node-rs/argon2";

const prisma = new PrismaClient();

const PASSWORD = "Motdepasse1";
const opts = { memoryCost: 19456, timeCost: 2, parallelism: 1 };

const categories = [
  { name: "Céréales", slug: "cereales", icon: "Wheat", sortOrder: 1 },
  { name: "Légumes", slug: "legumes", icon: "Carrot", sortOrder: 2 },
  { name: "Fruits", slug: "fruits", icon: "Apple", sortOrder: 3 },
  { name: "Tubercules", slug: "tubercules", icon: "Salad", sortOrder: 4 },
  { name: "Volaille & viande", slug: "volaille-viande", icon: "Beef", sortOrder: 5 },
  { name: "Poissons", slug: "poissons", icon: "Fish", sortOrder: 6 },
  { name: "Œufs & lait", slug: "oeufs-lait", icon: "Egg", sortOrder: 7 },
  { name: "Intrants & semences", slug: "intrants-semences", icon: "Sprout", sortOrder: 8 },
];

const products = [
  { title: "Maïs jaune", slug: "mais-jaune", cat: "cereales", unit: "KG", price: 350, shop: "ferme-kotokoli", desc: "Maïs jaune séché, trié, idéal pour la consommation et l'alimentation animale." },
  { title: "Riz local parfumé", slug: "riz-local-parfume", cat: "cereales", unit: "KG", price: 650, shop: "cooperative-agonlin", desc: "Riz de la vallée de l'Ouémé, parfumé et non étuvé." },
  { title: "Mil", slug: "mil", cat: "cereales", unit: "KG", price: 400, shop: "cooperative-agonlin", desc: "Mil propre, sans cailloux, récolte de la saison." },
  { title: "Tomate fraîche", slug: "tomate-fraiche", cat: "legumes", unit: "KG", price: 500, shop: "ferme-kotokoli", desc: "Tomates fermes et mûres, cueillies du jour.", isOrganic: true },
  { title: "Piment", slug: "piment", cat: "legumes", unit: "KG", price: 1500, shop: "ferme-kotokoli", desc: "Piment local bien relevé." },
  { title: "Gombo frais", slug: "gombo-frais", cat: "legumes", unit: "KG", price: 400, shop: "ferme-kotokoli", desc: "Gombo tendre, parfait pour les sauces." },
  { title: "Oignon", slug: "oignon", cat: "legumes", unit: "KG", price: 600, shop: "cooperative-agonlin", desc: "Oignons rouges de bonne conservation." },
  { title: "Ananas pain de sucre", slug: "ananas-pain-de-sucre", cat: "fruits", unit: "PIECE", price: 500, shop: "cooperative-agonlin", desc: "Ananas sucré de la région du plateau.", isOrganic: true },
  { title: "Mangue", slug: "mangue", cat: "fruits", unit: "KG", price: 700, shop: "ferme-kotokoli", desc: "Mangues mûres, variété kent." },
  { title: "Banane douce", slug: "banane-douce", cat: "fruits", unit: "KG", price: 400, shop: "ferme-kotokoli", desc: "Bananes plantain et douces." },
  { title: "Igname", slug: "igname", cat: "tubercules", unit: "KG", price: 600, shop: "cooperative-agonlin", desc: "Igname pilée, qualité supérieure." },
  { title: "Manioc frais", slug: "manioc-frais", cat: "tubercules", unit: "KG", price: 300, shop: "cooperative-agonlin", desc: "Racines de manioc fraîches du jour." },
  { title: "Poulet fermier", slug: "poulet-fermier", cat: "volaille-viande", unit: "PIECE", price: 4500, shop: "ferme-kotokoli", desc: "Poulet élevé en plein air, environ 1,5 kg." },
  { title: "Tilapia frais", slug: "tilapia-frais", cat: "poissons", unit: "KG", price: 2000, shop: "ferme-kotokoli", desc: "Tilapia pêché du jour, calibre moyen." },
  { title: "Œufs de ferme (plateau de 30)", slug: "oeufs-ferme-plateau-30", cat: "oeufs-lait", unit: "CARTON", price: 2500, shop: "ferme-kotokoli", desc: "Plateau de 30 œufs frais de poules élevées au sol." },
  { title: "Semences de maïs améliorées", slug: "semences-mais", cat: "intrants-semences", unit: "SAC", price: 12000, shop: "cooperative-agonlin", desc: "Sac de 5 kg de semences certifiées à haut rendement." },
];

const sellers = [
  {
    email: "kofi@test.bj",
    firstName: "Kofi",
    lastName: "Mensah",
    phone: "+2290197000002",
    sellerType: "PRODUCER",
    shopName: "Ferme Kotokoli",
    slug: "ferme-kotokoli",
    city: "Porto-Novo",
    region: "Ouémé",
    description: "Exploitation maraîchère et avicole familiale à Porto-Novo.",
  },
  {
    email: "coop@test.bj",
    firstName: "Coopérative",
    lastName: "Agonlin",
    phone: "+2290197000003",
    sellerType: "COOPERATIVE",
    shopName: "Coopérative Agonlin",
    slug: "cooperative-agonlin",
    city: "Abomey",
    region: "Zou",
    description: "Coopérative de producteurs de céréales, tubercules et fruits.",
  },
];

async function main() {
  const passwordHash = await hash(PASSWORD, opts);

  const catBySlug = {};
  for (const c of categories) {
    catBySlug[c.slug] = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon, sortOrder: c.sortOrder },
      create: c,
    });
  }

  const shopBySlug = {};
  for (const s of sellers) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.phone,
        passwordHash,
        city: s.city,
        emailVerifiedAt: new Date(),
      },
    });

    const account = await prisma.account.upsert({
      where: { userId_role: { userId: user.id, role: "SELLER" } },
      update: {},
      create: { userId: user.id, role: "SELLER" },
    });

    const coverUrl = `https://picsum.photos/seed/agri-shop-${s.slug}/1200/400`;
    const logoUrl = `https://picsum.photos/seed/agri-logo-${s.slug}/256/256`;
    const profile = await prisma.sellerProfile.upsert({
      where: { accountId: account.id },
      update: { coverUrl, logoUrl },
      create: {
        accountId: account.id,
        sellerType: s.sellerType,
        shopName: s.shopName,
        slug: s.slug,
        description: s.description,
        city: s.city,
        region: s.region,
        coverUrl,
        logoUrl,
        verification: "VERIFIED",
        verifiedAt: new Date(),
        ratingAvg: 4.6,
        ratingCount: 12,
      },
    });
    shopBySlug[s.slug] = { account, profile };
  }

  for (const p of products) {
    const seller = shopBySlug[p.shop];
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: { price: p.price, status: "ACTIVE" },
      create: {
        slug: p.slug,
        title: p.title,
        description: p.desc,
        unit: p.unit,
        price: p.price,
        stock: 100,
        isOrganic: Boolean(p.isOrganic),
        status: "ACTIVE",
        publishedAt: new Date(),
        categoryId: catBySlug[p.cat].id,
        sellerAccountId: seller.account.id,
        sellerProfileId: seller.profile.id,
        ratingAvg: 4.5,
        ratingCount: 8,
        salesCount: 20,
      },
    });

    const imgUrl = `https://picsum.photos/seed/agri-${p.slug}/800/600`;
    const existing = await prisma.productImage.findFirst({
      where: { productId: product.id },
    });
    if (existing) {
      await prisma.productImage.update({
        where: { id: existing.id },
        data: { url: imgUrl, alt: p.title },
      });
    } else {
      await prisma.productImage.create({
        data: { productId: product.id, url: imgUrl, alt: p.title, position: 0 },
      });
    }
  }

  console.log(
    `Seed OK — ${categories.length} catégories, ${sellers.length} vendeurs, ${products.length} produits.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
