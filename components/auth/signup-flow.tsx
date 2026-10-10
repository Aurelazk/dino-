"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  ShoppingBasket,
  Sparkles,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  sellerTypeLabels,
  signupSchema,
  type Role,
  type SellerType,
} from "@/lib/validations/auth";

type Values = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  sellerType: SellerType | "";
  shopName: string;
  shopDescription: string;
  acceptTerms: boolean;
};

const EMPTY: Values = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  city: "",
  sellerType: "",
  shopName: "",
  shopDescription: "",
  acceptTerms: false,
};

const roles: {
  value: Role;
  title: string;
  tagline: string;
  points: string[];
  icon: typeof ShoppingBasket;
}[] = [
  {
    value: "BUYER",
    title: "Je veux acheter",
    tagline: "Trouvez des produits frais au juste prix, près de chez vous.",
    points: [
      "Parcourir les produits des producteurs locaux",
      "Payer par Mobile Money, carte ou à la livraison",
      "Suivre vos commandes en temps réel",
    ],
    icon: ShoppingBasket,
  },
  {
    value: "SELLER",
    title: "Je veux vendre",
    tagline: "Vendez votre production et touchez plus de clients.",
    points: [
      "Ouvrir votre boutique en quelques minutes",
      "Gérer vos produits et vos commandes",
      "Recevoir vos paiements en toute sécurité",
    ],
    icon: Store,
  },
];

export function SignupFlow() {
  const router = useRouter();
  const [role, setRole] = React.useState<Role | null>(null);
  const [step, setStep] = React.useState<1 | 2>(1);
  const [values, setValues] = React.useState<Values>(EMPTY);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);

  const space = role === "SELLER" ? "space-seller" : "space-buyer";

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  function chooseRole(next: Role) {
    setRole(next);
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;

    const parsed = signupSchema.safeParse({
      ...values,
      role,
      country: "Bénin",
      sellerType: values.sellerType || undefined,
      shopName: values.shopName || undefined,
      shopDescription: values.shopDescription || undefined,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Veuillez corriger les champs en rouge.");
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          role,
          country: "Bénin",
          sellerType: values.sellerType || undefined,
          shopName: values.shopName || undefined,
          shopDescription: values.shopDescription || undefined,
        }),
      });

      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
        fieldErrors?: Record<string, string>;
      };

      if (!res.ok) {
        if (payload.fieldErrors) setErrors(payload.fieldErrors);
        toast.error(payload.error ?? "Inscription impossible.");
        return;
      }

      toast.success(
        role === "SELLER"
          ? "Boutique créée ! Vérifiez votre e-mail pour activer votre compte vendeur."
          : "Compte créé ! Vérifiez votre e-mail pour l'activer.",
      );
      setValues(EMPTY);
      router.push("/connexion?inscription=1");
    } catch {
      toast.error("Impossible de contacter le serveur. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={cn(space, "w-full max-w-3xl")}>
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            A
          </span>
          AgriMarket
        </Link>
        <h1 className="text-2xl font-bold sm:text-3xl">
          {step === 1 ? "Créer votre compte" : "Vos informations"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {step === 1
            ? "Dites-nous comment vous souhaitez utiliser AgriMarket."
            : role === "SELLER"
              ? "Renseignez votre profil vendeur."
              : "Quelques informations et c'est parti."}
        </p>
      </div>

      {/* Étapes */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={cn(
              "h-1.5 rounded-full transition-all",
              s <= step ? "w-12 bg-accent" : "w-6 bg-border",
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="role"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {roles.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => chooseRole(r.value)}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 text-left shadow-soft transition-all hover:-translate-y-1 hover:border-accent hover:shadow-glow"
                >
                  <div
                    className={cn(
                      "mb-4 flex h-12 w-12 items-center justify-center rounded-lg text-white transition-transform group-hover:scale-110",
                      r.value === "BUYER" ? "bg-primary" : "bg-accent",
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="text-lg font-semibold">{r.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{r.tagline}</p>
                  <ul className="mt-4 space-y-2">
                    {r.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <span className="text-muted-foreground">{p}</span>
                      </li>
                    ))}
                  </ul>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                    Continuer <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <span className="text-muted-foreground">
                      Espace{" "}
                      <strong className="text-foreground">
                        {role === "SELLER" ? "Vendeur" : "Acheteur"}
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="ml-auto text-xs font-semibold text-accent hover:underline"
                    >
                      Changer
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Prénom" error={errors.firstName}>
                      <Input
                        value={values.firstName}
                        onChange={(e) => set("firstName", e.target.value)}
                        placeholder="Awa"
                        autoComplete="given-name"
                      />
                    </Field>
                    <Field label="Nom" error={errors.lastName}>
                      <Input
                        value={values.lastName}
                        onChange={(e) => set("lastName", e.target.value)}
                        placeholder="Dossou"
                        autoComplete="family-name"
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="E-mail" error={errors.email}>
                      <Input
                        type="email"
                        value={values.email}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="vous@exemple.bj"
                        autoComplete="email"
                      />
                    </Field>
                    <Field label="Téléphone" error={errors.phone}>
                      <Input
                        type="tel"
                        value={values.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        placeholder="+229 01 97 00 00 00"
                        autoComplete="tel"
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Ville" error={errors.city}>
                      <Input
                        value={values.city}
                        onChange={(e) => set("city", e.target.value)}
                        placeholder="Cotonou"
                      />
                    </Field>
                    <Field label="Mot de passe" error={errors.password}>
                      <Input
                        type="password"
                        value={values.password}
                        onChange={(e) => set("password", e.target.value)}
                        placeholder="8 caractères minimum"
                        autoComplete="new-password"
                      />
                    </Field>
                  </div>

                  {role === "SELLER" && (
                    <div className="space-y-4 rounded-lg border border-dashed border-accent/40 bg-accent/5 p-4">
                      <p className="text-sm font-semibold text-accent">
                        Profil vendeur
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Type de vendeur" error={errors.sellerType}>
                          <select
                            value={values.sellerType}
                            onChange={(e) =>
                              set("sellerType", e.target.value as SellerType | "")
                            }
                            className="h-11 w-full rounded-md border border-input bg-card px-3.5 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                          >
                            <option value="">— Choisir —</option>
                            {(
                              Object.entries(sellerTypeLabels) as [
                                SellerType,
                                string,
                              ][]
                            ).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field
                          label="Nom de la boutique / exploitation"
                          error={errors.shopName}
                        >
                          <Input
                            value={values.shopName}
                            onChange={(e) => set("shopName", e.target.value)}
                            placeholder="Ferme Kotokoli"
                          />
                        </Field>
                      </div>
                      <Field label="Description (optionnel)">
                        <textarea
                          value={values.shopDescription}
                          onChange={(e) => set("shopDescription", e.target.value)}
                          rows={3}
                          placeholder="Présentez votre activité en quelques mots…"
                          className="w-full rounded-md border border-input bg-card px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                        />
                      </Field>
                      <Field label="Pièce justificative (optionnel)">
                        <Input type="file" accept="image/*,application/pdf" />
                      </Field>
                    </div>
                  )}

                  <label className="flex items-start gap-2.5 text-sm">
                    <input
                      type="checkbox"
                      checked={values.acceptTerms}
                      onChange={(e) => set("acceptTerms", e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-input text-accent focus:ring-accent"
                    />
                    <span className="text-muted-foreground">
                      J&apos;accepte les{" "}
                      <a href="#" className="font-medium text-accent hover:underline">
                        conditions d&apos;utilisation
                      </a>{" "}
                      et la{" "}
                      <a href="#" className="font-medium text-accent hover:underline">
                        politique de confidentialité
                      </a>
                      .
                    </span>
                  </label>
                  {errors.acceptTerms ? (
                    <p className="text-xs font-medium text-error">
                      {errors.acceptTerms}
                    </p>
                  ) : null}

                  <div className="flex flex-col gap-3 pt-1 sm:flex-row-reverse">
                    <Button
                      type="submit"
                      variant="accent"
                      size="lg"
                      full
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Création…
                        </>
                      ) : (
                        <>
                          Créer mon compte
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="lg"
                      onClick={() => setStep(1)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Retour
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="font-semibold text-accent hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs font-medium text-error">{error}</p> : null}
    </div>
  );
}
