import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DemoBanner } from "@/components/demo/demo-banner";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductCard } from "@/components/catalog/product-card";
import { CategoryIcon } from "@/components/catalog/category-icon";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Démo Acheteur",
  robots: { index: false },
};

export default async function DemoAcheteurPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { publishedAt: "desc" },
      take: 12,
      include: {
        category: { select: { name: true, icon: true } },
        sellerProfile: { select: { shopName: true, city: true, slug: true } },
        images: { orderBy: { position: "asc" }, take: 1 },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true, icon: true },
    }),
  ]);

  return (
    <div className="min-h-screen">
      <DemoBanner label="Espace Acheteur" />
      <SiteHeader />

      <main className="container py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Bonjour ! Voici les produits frais du jour.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Promenez-vous librement : cherchez, filtrez, ouvrez une fiche produit.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c.slug}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium"
            >
              <CategoryIcon name={c.icon} className="h-3.5 w-3.5" />
              {c.name}
            </span>
          ))}
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={Search}
            title="La démo se prépare"
            description="Les produits de démonstration arrivent. Revenez dans un instant."
            action={
              <Link href="/produits" className={buttonVariants({ variant: "outline" })}>
                Voir le catalogue réel
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  title: p.title,
                  slug: p.slug,
                  price: p.price,
                  unit: p.unit,
                  isOrganic: p.isOrganic,
                  isFresh: p.isFresh,
                  imageUrl: p.images[0]?.url ?? null,
                  ratingAvg: p.ratingAvg,
                  ratingCount: p.ratingCount,
                  category: p.category,
                  sellerProfile: p.sellerProfile,
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
