import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Mail, MapPin, Phone, Store, ShoppingBasket } from "lucide-react";
import { requireUser } from "@/lib/session";
import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Mon profil" };

export default async function ProfilPage() {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="container max-w-3xl py-8">
        <h1 className="mb-6 text-2xl font-bold">Mon profil</h1>

        <Card>
          <CardHeader className="flex-row items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-lg font-bold text-accent-foreground">
              {user.firstName[0]}
              {user.lastName[0]}
            </span>
            <div>
              <CardTitle>
                {user.firstName} {user.lastName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Membre depuis{" "}
                {new Intl.DateTimeFormat("fr-FR", {
                  month: "long",
                  year: "numeric",
                }).format(user.createdAt)}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row icon={Mail} label="E-mail">
              {user.email}
              {user.emailVerifiedAt ? (
                <Badge variant="success" className="ml-2">
                  Vérifié
                </Badge>
              ) : (
                <Badge variant="warning" className="ml-2">
                  À vérifier
                </Badge>
              )}
            </Row>
            <Row icon={Phone} label="Téléphone">
              {user.phone ?? "Non renseigné"}
            </Row>
            <Row icon={MapPin} label="Ville">
              {user.city ?? "Non renseignée"}
            </Row>
            <Row icon={CalendarDays} label="Langue">
              Français
            </Row>
          </CardContent>
        </Card>

        <h2 className="mb-3 mt-8 text-lg font-semibold">Mes espaces</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {user.accounts.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-center gap-3 p-5">
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg text-white",
                    a.role === "SELLER" ? "bg-warning" : "bg-primary",
                  )}
                >
                  {a.role === "SELLER" ? (
                    <Store className="h-5 w-5" />
                  ) : (
                    <ShoppingBasket className="h-5 w-5" />
                  )}
                </span>
                <div>
                  <p className="font-semibold">
                    {a.role === "SELLER" ? "Vendeur" : "Acheteur"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {a.role === "SELLER"
                      ? a.sellerProfile?.shopName ?? "Sans boutique"
                      : "Compte acheteur"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!user.accounts.some((a) => a.role === "SELLER") && (
          <Card className="mt-4">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
              <p className="text-sm text-muted-foreground">
                Vous vendez des produits ? Ouvrez votre boutique en quelques minutes.
              </p>
              <Link
                href="/inscription"
                className={cn(buttonVariants({ variant: "accent" }), "inline-flex")}
              >
                Devenir vendeur
              </Link>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8 border-error/30">
          <CardHeader>
            <CardTitle className="text-error">Zone sensible</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              La suppression du compte et l&apos;export des données seront disponibles
              prochainement (avec confirmation par e-mail).
            </p>
            <span className={cn(buttonVariants({ variant: "outline" }), "pointer-events-none opacity-60")}>
              Supprimer mon compte
            </span>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="w-24 text-muted-foreground">{label}</span>
      <span className="flex items-center font-medium">{children}</span>
    </div>
  );
}
