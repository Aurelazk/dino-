import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createProduct } from "./actions";
import { UNIT_VALUES } from "@/lib/validations/product";
import { unitLabels } from "@/lib/catalog";

export const metadata: Metadata = { title: "Nouveau produit" };

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  await requireUser();
  const { erreur } = await searchParams;

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="container max-w-2xl py-8 space-seller">
        <Link
          href="/vendeur"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Retour à ma boutique
        </Link>

        <h1 className="mb-1 text-2xl font-bold">Ajouter un produit</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Décrivez votre produit simplement. Il sera visible immédiatement dans le catalogue.
        </p>

        {erreur && (
          <div className="mb-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
            Certains champs sont incomplets. Vérifiez le titre, la catégorie, le prix et le stock.
          </div>
        )}

        <Card>
          <CardContent className="pt-6">
            <form action={createProduct} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Nom du produit</Label>
                <Input id="title" name="title" placeholder="Ex. Maïs jaune" required />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="categoryId">Catégorie</Label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    required
                    className="h-11 w-full rounded-md border border-input bg-card px-3.5 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  >
                    <option value="">— Choisir —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="unit">Unité de vente</Label>
                  <select
                    id="unit"
                    name="unit"
                    required
                    defaultValue="KG"
                    className="h-11 w-full rounded-md border border-input bg-card px-3.5 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  >
                    {UNIT_VALUES.map((u) => (
                      <option key={u} value={u}>
                        {unitLabels[u]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="price">Prix (FCFA)</Label>
                  <Input id="price" name="price" type="number" min={1} placeholder="500" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" name="stock" type="number" min={0} placeholder="100" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="minOrderQty">Commande min.</Label>
                  <Input id="minOrderQty" name="minOrderQty" type="number" min={1} defaultValue={1} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Où et comment ce produit a-t-il été cultivé ?"
                  className="w-full rounded-md border border-input bg-card px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                />
              </div>

              <label className="flex items-center gap-2.5 text-sm">
                <input
                  type="checkbox"
                  name="isOrganic"
                  value="true"
                  className="h-4 w-4 rounded border-input text-accent focus:ring-accent"
                />
                <span>Ce produit est certifié Bio</span>
              </label>

              <div className="flex gap-3 pt-1">
                <Button type="submit" variant="accent" size="lg">
                  <PlusCircle className="h-4 w-4" /> Publier le produit
                </Button>
                <Link
                  href="/vendeur"
                  className="inline-flex h-12 items-center rounded-md px-5 text-sm font-semibold text-muted-foreground hover:bg-muted"
                >
                  Annuler
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
