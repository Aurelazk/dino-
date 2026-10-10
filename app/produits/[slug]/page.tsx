import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Leaf,
  MapPin,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Star,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/layout/site-header";
import { CategoryIcon } from "@/components/catalog/category-icon";
import { ProductImage } from "@/components/catalog/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { unitLabels } from "@/lib/catalog";
import { formatXOF } from "@/lib/utils";

async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      category: true,
      sellerProfile: true,
      images: { orderBy: { position: "asc" } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Produit introuvable" };
  return { title: product.title, description: product.description ?? undefined };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const inStock = product.stock > 0;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="container py-8">
        <Link
          href="/produits"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Retour aux produits
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          <ProductImage
            src={product.images[0]?.url}
            alt={product.title}
            iconName={product.category.icon}
            className="h-72 w-full rounded-xl border border-border sm:h-96"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />

          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="default">{product.category.name}</Badge>
              {product.isOrganic && (
                <Badge variant="success">
                  <Leaf className="h-3 w-3" /> Bio
                </Badge>
              )}
              {inStock ? (
                <Badge variant="info">
                  <Package className="h-3 w-3" /> En stock ({product.stock})
                </Badge>
              ) : (
                <Badge variant="error">Rupture de stock</Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold">{product.title}</h1>

            {product.ratingCount > 0 && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-warning text-warning" />
                {product.ratingAvg.toFixed(1)} ({product.ratingCount} avis)
                {product.salesCount > 0 && ` · ${product.salesCount} vendus`}
              </p>
            )}

            <div className="mt-5 flex items-end gap-2">
              <span className="text-3xl font-extrabold text-primary">
                {formatXOF(product.price)}
              </span>
              <span className="pb-1 text-sm text-muted-foreground">
                / {unitLabels[product.unit]}
              </span>
            </div>

            {product.description && (
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            )}

            <div className="mt-5 flex items-center gap-3">
              <div className="flex items-center rounded-md border border-border">
                <button className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:bg-muted">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold">1</span>
                <button className="flex h-10 w-10 items-center justify-center text-muted-foreground hover:bg-muted">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button variant="accent" size="lg" disabled={!inStock}>
                <ShoppingCart className="h-4 w-4" />
                Ajouter au panier
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Minimum de commande : {product.minOrderQty} {unitLabels[product.unit]}
            </p>

            {product.sellerProfile && (
              <Card className="mt-6">
                <CardContent className="flex items-center gap-3 p-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <MarketplaceUserIcon />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 font-semibold">
                      {product.sellerProfile.shopName}
                      {product.sellerProfile.verification === "VERIFIED" && (
                        <BadgeCheck className="h-4 w-4 text-info" />
                      )}
                    </p>
                    {product.sellerProfile.city && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {product.sellerProfile.city}
                        {product.sellerProfile.region
                          ? `, ${product.sellerProfile.region}`
                          : ""}
                      </p>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    Voir la boutique
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function MarketplaceUserIcon() {
  return <CategoryIcon name="Sprout" className="h-5 w-5" />;
}
