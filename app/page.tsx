import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Leaf,
  ShoppingBasket,
  Sparkles,
  Store,
  Truck,
  Wallet,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const spaces = [
  {
    icon: ShoppingBasket,
    title: "Espace Acheteur",
    accent: "text-primary",
    ring: "bg-primary",
    desc: "Produits frais, panier, commandes et paiements — dans une interface apaisée en vert.",
    href: "/inscription",
    cta: "Acheter",
    demo: "/demo/acheteur",
  },
  {
    icon: Store,
    title: "Espace Vendeur",
    accent: "text-warning",
    ring: "bg-warning",
    desc: "Boutique, stock, commandes et encaissements — accent orange pour agir vite.",
    href: "/inscription",
    cta: "Vendre",
    demo: "/demo/vendeur",
  },
];

const features = [
  { icon: Leaf, title: "Frais & local", desc: "Direct des producteurs béninois." },
  { icon: Wallet, title: "Mobile Money", desc: "MTN, Moov, carte ou à la livraison." },
  { icon: Truck, title: "Livraison suivie", desc: "Zones et frais transparents." },
  { icon: BadgeCheck, title: "Vendeurs vérifiés", desc: "Profils contrôlés et notés." },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              A
            </span>
            AgriMarket
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/connexion"
              className={cn(
                buttonVariants({ variant: "ghost", size: "md" }),
                "hidden sm:inline-flex",
              )}
            >
              Se connecter
            </Link>
            <Link
              href="/inscription"
              className={buttonVariants({ variant: "accent", size: "md" })}
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="bg-grain">
          <div className="container grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
            <div className="animate-fade-up">
              <Badge variant="default" className="mb-4">
                <Leaf className="h-3.5 w-3.5" /> Produits vivriers du Bénin
              </Badge>
              <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                Vendez au{" "}
                <span className="text-primary">juste prix</span>, achetez{" "}
                <span className="text-warning">frais</span>.
              </h1>
              <p className="mt-5 max-w-lg text-lg text-muted-foreground">
                AgriMarket connecte producteurs, grossistes et acheteurs béninois.
                Paiement Mobile Money, carte, ou à la livraison — en FCFA.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/inscription"
                  className={cn(
                    buttonVariants({ variant: "accent", size: "lg" }),
                    "inline-flex items-center gap-2",
                  )}
                >
                  Commencer maintenant <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#espaces"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  Découvrir les espaces
                </Link>
              </div>
            </div>

            <Card className="animate-scale-in">
              <CardContent className="p-6">
                <p className="mb-4 text-sm font-semibold text-muted-foreground">
                  Inscription en 2 étapes
                </p>
                <div className="space-y-3">
                  <Input placeholder="Ex. Awa Dossou" defaultValue="" aria-label="Nom" />
                  <Input placeholder="vous@exemple.bj" aria-label="E-mail" />
                  <Input placeholder="Cotonou" aria-label="Ville" />
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="success">Producteur</Badge>
                    <Badge variant="warning">Grossiste</Badge>
                    <Badge variant="info">Transformateur</Badge>
                    <Badge variant="outline">Détaillant</Badge>
                  </div>
                  <Link
                    href="/inscription"
                    className={cn(
                      buttonVariants({ variant: "accent", size: "lg", full: true }),
                      "inline-flex",
                    )}
                  >
                    Choisir mon espace
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="container py-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <Card key={f.title} className="border-none shadow-soft">
                <CardContent className="flex items-start gap-3 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{f.title}</p>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="espaces" className="container py-14">
          <h2 className="text-center text-3xl font-bold">Deux espaces, deux intentions</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
            Une même plateforme, une expérience dédiée à chaque rôle — avec son propre accent
            couleur et ses propres permissions.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {spaces.map((s) => (
              <Card
                key={s.title}
                className={s.title.includes("Vendeur") ? "space-seller" : "space-buyer"}
              >
                <CardContent className="p-8">
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-lg text-white ${s.ring}`}>
                    <s.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-muted-foreground">{s.desc}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link
                      href={s.href}
                      className={cn(
                        buttonVariants({ variant: "accent" }),
                        "inline-flex items-center gap-2",
                      )}
                    >
                      {s.cta} <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href={s.demo}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "inline-flex items-center gap-2",
                      )}
                    >
                      <Sparkles className="h-4 w-4" /> Essayer la démo
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="container flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} AgriMarket — Vendez au juste prix.</p>
          <p>Bénin · FCFA (XOF)</p>
        </div>
      </footer>
    </div>
  );
}
