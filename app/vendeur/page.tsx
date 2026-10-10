import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  MapPin,
  Package,
  PlusCircle,
  Star,
  Store,
} from "lucide-react";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductImage } from "@/components/catalog/product-image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatXOF } from "@/lib/utils";
import { unitLabels } from "@/lib/catalog";

export const metadata: Metadata = { title: "Ma boutique" };

export default async function SellerPage() {
  const user = await requireUser();
  const sellerAccounts = user.accounts.filter((a) => a.role === "SELLER");

  if (sellerAccounts.length === 0) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <main className="container py-16">
          <EmptyState
            icon={Store}
            title="Vous n'avez pas encore d'espace vendeur"
            description="Créez un espace vendeur pour ouvrir votre boutique et publier vos produits."
            action={
              <Link href="/inscription" className={buttonVariants({ variant: "accent" })}>
                Créer un espace vendeur
              </Link>
            }
          />
        </main>
      </div>
    );
  }

  const profile = sellerAccounts[0]?.sellerProfile ?? null;
  const products = await prisma.product.findMany({
    where: { sellerAccountId: { in: sellerAccounts.map((a) => a.id) } },
    orderBy: { createdAt: "desc" },
    include: { category: { select: { name: true } } },
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="container py-8 space-seller">
        {profile?.coverUrl && (
          <ProductImage
            src={profile.coverUrl}
            alt={profile.shopName}
            className="mb-4 h-36 w-full rounded-xl border border-border sm:h-52"
            sizes="100vw"
          />
        )}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-accent text-accent-foreground">
              {profile?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.logoUrl}
                  alt={profile.shopName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Store className="h-7 w-7" />
              )}
            </span>
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold">
                {profile?.shopName ?? "Ma boutique"}
                {profile?.verification === "VERIFIED" && (
                  <BadgeCheck className="h-5 w-5 text-info" />
                )}
              </h1>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {[profile?.city, profile?.region].filter(Boolean).join(", ") ||
                  "Localisation non renseignée"}
              </p>
            </div>
          </div>
          <Link
            href="/vendeur/produits/nouveau"
            className={cn(buttonVariants({ variant: "accent" }), "inline-flex items-center gap-2")}
          >
            <PlusCircle className="h-4 w-4" /> Ajouter un produit
          </Link>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <MiniStat icon={Package} label="Produits" value={products.length} />
          <MiniStat icon={Star} label="Note" value={profile?.ratingAvg?.toFixed(1) ?? "—"} />
          <MiniStat icon={BadgeCheck} label="Statut" value={profile?.verification === "VERIFIED" ? "Vérifié" : "En attente"} />
        </div>

        <h2 className="mb-4 text-lg font-semibold">Mes produits</h2>

        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Aucun produit"
            description="Ajoutez votre premier produit pour commencer à vendre."
            action={
              <Link
                href="/vendeur/produits/nouveau"
                className={buttonVariants({ variant: "accent" })}
              >
                Ajouter un produit
              </Link>
            }
          />
        ) : (
          <Card>
            <div className="divide-y divide-border">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center gap-3 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.category.name} · {p.stock} en stock
                    </p>
                  </div>
                  <span className="font-semibold text-primary">
                    {formatXOF(p.price)}
                    <span className="text-xs font-normal text-muted-foreground">
                      {" "}
                      / {unitLabels[p.unit]}
                    </span>
                  </span>
                  <Badge variant={p.status === "ACTIVE" ? "success" : "outline"}>
                    {p.status === "ACTIVE" ? "En ligne" : "Brouillon"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="border-none shadow-soft">
      <CardContent className="flex items-center gap-3 p-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xl font-bold leading-none">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
