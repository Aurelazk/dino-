import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, ShoppingBasket, Store } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Démos",
  description: "Essayez AgriMarket sans compte : espaces Acheteur et Vendeur en mode démo.",
  robots: { index: false },
};

const demos = [
  {
    icon: ShoppingBasket,
    title: "Démo Acheteur",
    desc: "Parcourez le catalogue, ouvrez une fiche produit, découvrez les vendeurs.",
    duration: "2 à 3 min",
    href: "/demo/acheteur",
    tone: "primary" as const,
  },
  {
    icon: Store,
    title: "Démo Vendeur",
    desc: "Découvrez une boutique remplie : produits, ventes, portefeuille.",
    duration: "3 à 5 min",
    href: "/demo/vendeur",
    tone: "warning" as const,
  },
];

export default function DemosPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="container py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">Essayez sans créer de compte</h1>
          <p className="mt-3 text-muted-foreground">
            Chaque démo ouvre l&apos;espace réel sur des données fictives. Aucune donnée réelle,
            aucun paiement, aucun e-mail envoyé.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-6 md:grid-cols-2">
          {demos.map((d) => (
            <Card key={d.title}>
              <CardContent className="p-6">
                <div
                  className={cn(
                    "mb-4 flex h-12 w-12 items-center justify-center rounded-lg text-white",
                    d.tone === "primary" ? "bg-primary" : "bg-warning",
                  )}
                >
                  <d.icon className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold">{d.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{d.desc}</p>
                <p className="mt-3 text-xs font-medium text-muted-foreground">
                  Durée estimée : {d.duration}
                </p>
                <Link
                  href={d.href}
                  className={cn(
                    buttonVariants({ variant: "accent" }),
                    "mt-5 inline-flex items-center gap-2",
                  )}
                >
                  Essayer <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-10 flex max-w-3xl items-center gap-3 rounded-xl border border-dashed border-border bg-card/50 p-5 text-sm text-muted-foreground">
          <ShieldCheck className="h-5 w-5 shrink-0 text-info" />
          Vos essais restent dans un bac à sable isolé et sont oubliés à la sortie. La démo
          Administrateur est réservée à l&apos;équipe.
        </div>
      </main>
    </div>
  );
}
