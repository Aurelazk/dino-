import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  LayoutDashboard,
  Package,
  Receipt,
  ShoppingBasket,
  Store,
  Wallet,
} from "lucide-react";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function DashboardPage() {
  const user = await requireUser();

  const buyerAccounts = user.accounts.filter((a) => a.role === "BUYER");
  const sellerAccounts = user.accounts.filter((a) => a.role === "SELLER");

  const sellerIds = sellerAccounts.map((a) => a.id);
  const productCount = sellerIds.length
    ? await prisma.product.count({ where: { sellerAccountId: { in: sellerIds } } })
    : 0;
  const orderCount = await prisma.order.count({
    where: { OR: [{ buyerAccountId: { in: user.accounts.map((a) => a.id) } }, { sellerAccountId: { in: sellerIds } }] },
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="container py-8">
        <div className="mb-8 flex items-start gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <LayoutDashboard className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Bonjour {user.firstName} 👋
            </h1>
            <p className="text-sm text-muted-foreground">
              Bienvenue dans votre espace AgriMarket.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Package} label="Produits" value={productCount} />
          <StatCard icon={Receipt} label="Commandes" value={orderCount} />
          <StatCard icon={Store} label="Espaces" value={user.accounts.length} />
        </div>

        <h2 className="mb-4 mt-10 text-lg font-semibold">Mes espaces</h2>

        <div className="grid gap-6 md:grid-cols-2">
          {buyerAccounts.length > 0 && (
            <Card className="space-buyer">
              <CardContent className="p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ShoppingBasket className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">Espace Acheteur</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Parcourez le catalogue, gérez votre panier et vos commandes.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href="/produits"
                    className={cn(buttonVariants({ variant: "accent" }), "inline-flex items-center gap-2")}
                  >
                    Parcourir les produits <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {sellerAccounts.length > 0 ? (
            <Card className="space-seller">
              <CardContent className="p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Store className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">Espace Vendeur</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {sellerAccounts[0]?.sellerProfile?.shopName ?? "Votre boutique"} — gérez vos
                  produits et vos ventes.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href="/vendeur"
                    className={cn(buttonVariants({ variant: "accent" }), "inline-flex items-center gap-2")}
                  >
                    Ma boutique <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Store className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">Devenir vendeur</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ouvrez votre boutique et vendez votre production au juste prix.
                </p>
                <Link
                  href="/inscription"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "mt-5 inline-flex items-center gap-2",
                  )}
                >
                  Créer un espace vendeur <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="mt-6">
          <CardContent className="flex flex-wrap items-center gap-3 p-5">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            <p className="flex-1 text-sm text-muted-foreground">
              Paiements Mobile Money, carte bancaire ou à la livraison — bientôt disponibles dans
              votre espace.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <Card className="border-none shadow-soft">
      <CardContent className="flex items-center gap-3 p-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
