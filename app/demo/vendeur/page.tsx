import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  Eye,
  Package,
  Plus,
  Star,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DemoBanner } from "@/components/demo/demo-banner";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductCard } from "@/components/catalog/product-card";
import { ProductImage } from "@/components/catalog/product-image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, formatXOF } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Démo Vendeur",
  robots: { index: false },
};

const demoOrders = [
  { ref: "CMD-2481", buyer: "Awa D.", total: 7500, status: "À préparer", tone: "warning" as const },
  { ref: "CMD-2479", buyer: "Ibrahim S.", total: 12000, status: "Expédiée", tone: "info" as const },
  { ref: "CMD-2475", buyer: "Ruth A.", total: 4500, status: "Livrée", tone: "success" as const },
];

export default async function DemoVendeurPage() {
  const shop = await prisma.sellerProfile.findFirst({
    orderBy: { createdAt: "asc" },
    include: {
      account: { select: { user: { select: { firstName: true, lastName: true } } } },
      products: {
        where: { status: "ACTIVE" },
        orderBy: { publishedAt: "desc" },
        take: 8,
        include: {
          category: { select: { name: true, icon: true } },
          sellerProfile: { select: { shopName: true, city: true, slug: true } },
          images: { orderBy: { position: "asc" }, take: 1 },
        },
      },
    },
  });

  if (!shop) {
    return (
      <div className="min-h-screen">
        <DemoBanner label="Espace Vendeur" />
        <SiteHeader />
        <main className="container py-12">
          <EmptyState
            icon={Package}
            title="La démo se prépare"
            description="La boutique de démonstration n'est pas encore disponible."
          />
        </main>
      </div>
    );
  }

  const stats = [
    { icon: Wallet, label: "Ventes (30 j)", value: formatXOF(487500) },
    { icon: Package, label: "Commandes", value: "37" },
    { icon: Eye, label: "Vues produits", value: "1 284" },
    { icon: Star, label: "Note moyenne", value: shop.ratingAvg.toFixed(1) },
  ];

  return (
    <div className="min-h-screen">
      <DemoBanner label="Espace Vendeur" />
      <SiteHeader />

      <main className="container py-8 space-seller">
        <div className="relative overflow-hidden rounded-xl border border-border">
          {shop.coverUrl ? (
            <ProductImage
              src={shop.coverUrl}
              alt={shop.shopName}
              className="h-40 w-full sm:h-56"
              sizes="100vw"
            />
          ) : (
            <div className="h-40 w-full bg-gradient-to-br from-warning/30 to-muted sm:h-56" />
          )}
          <div className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-4 border-card bg-warning text-white shadow-card">
                {shop.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={shop.logoUrl}
                    alt={shop.shopName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="h-7 w-7" />
                )}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold sm:text-2xl">{shop.shopName}</h1>
                  {shop.verification === "VERIFIED" && (
                    <Badge variant="success">Vérifié</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {shop.city}
                  {shop.region ? ` · ${shop.region}` : ""} · {shop.products.length} produits
                  en ligne
                </p>
              </div>
            </div>
            <Link
              href="/vendeur/produits/nouveau"
              className={cn(buttonVariants({ variant: "accent" }), "inline-flex items-center gap-2")}
            >
              <Plus className="h-4 w-4" /> Ajouter un produit
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary">
                  <s.icon className="h-4 w-4" />
                </div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="mt-0.5 text-lg font-bold">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Commandes récentes</h2>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-success" /> +12% cette semaine
            </span>
          </div>
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {demoOrders.map((o) => (
                <div key={o.ref} className="flex items-center gap-4 px-5 py-3.5 text-sm">
                  <span className="w-20 font-mono text-xs text-muted-foreground">{o.ref}</span>
                  <span className="flex-1 font-medium">{o.buyer}</span>
                  <span className="font-semibold">{formatXOF(o.total)}</span>
                  <Badge variant={o.tone}>{o.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Ma boutique</h2>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <BarChart3 className="h-3.5 w-3.5" /> Aperçu comme un client
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {shop.products.map((p) => (
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
          <p className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowUpRight className="h-3.5 w-3.5" /> Ces chiffres sont fictifs : ils illustrent
            votre futur tableau de bord.
          </p>
        </section>
      </main>
    </div>
  );
}
