import type { Metadata } from "next";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductCard } from "@/components/catalog/product-card";
import { CategoryIcon } from "@/components/catalog/category-icon";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { parseSort, sortOptions } from "@/lib/catalog";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Produits",
  description: "Parcourez les produits vivriers frais des vendeurs béninois.",
};

const PAGE_SIZE = 12;

function one(v: string | string[] | undefined) {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

function buildHref(params: {
  q?: string;
  cat?: string;
  sort?: string;
  page?: number;
}) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.cat) sp.set("cat", params.cat);
  if (params.sort && params.sort !== "recent") sp.set("sort", params.sort);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return `/produits${qs ? `?${qs}` : ""}`;
}

export default async function ProduitsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = one(sp.q).trim();
  const cat = one(sp.cat);
  const sort = parseSort(sp.sort);
  const page = Math.max(1, Number(one(sp.page)) || 1);

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    ...(cat ? { category: { slug: cat } } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
        ? { price: "desc" }
        : sort === "rating"
          ? { ratingAvg: "desc" }
          : { publishedAt: "desc" };

  const [total, products, categories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
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

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="container py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl">Produits frais du Bénin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} produit{total > 1 ? "s" : ""} disponible{total > 1 ? "s" : ""}
            {q ? ` pour « ${q} »` : ""}.
          </p>
        </div>

        <form
          action="/produits"
          method="get"
          className="mb-5 flex flex-wrap items-center gap-3"
        >
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={q}
              placeholder="Rechercher un produit…"
              className="pl-9"
            />
          </div>
          {cat && <input type="hidden" name="cat" value={cat} />}
          {sort !== "recent" && <input type="hidden" name="sort" value={sort} />}
          <Button type="submit" variant="default">
            Rechercher
          </Button>
        </form>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <Link
            href={buildHref({ q, sort, cat: "" })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              !cat
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-muted",
            )}
          >
            Toutes
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={buildHref({ q, sort, cat: c.slug })}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                cat === c.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-muted",
              )}
            >
              <CategoryIcon name={c.icon} className="h-3.5 w-3.5" />
              {c.name}
            </Link>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Trier :</span>
          {sortOptions.map((s) => (
            <Link
              key={s.value}
              href={buildHref({ q, cat, sort: s.value })}
              className={cn(
                "rounded-md px-2.5 py-1 font-medium transition-colors",
                sort === s.value
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </Link>
          ))}
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Aucun produit trouvé"
            description="Essayez un autre mot-clé ou changez de catégorie."
            action={
              <Link href="/produits" className={buttonVariants({ variant: "outline" })}>
                Réinitialiser les filtres
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

        {pages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <Link
              href={buildHref({ q, cat, sort, page: Math.max(1, page - 1) })}
              aria-disabled={page <= 1}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                page <= 1 && "pointer-events-none opacity-50",
              )}
            >
              Précédent
            </Link>
            <span className="px-3 text-sm text-muted-foreground">
              Page {page} / {pages}
            </span>
            <Link
              href={buildHref({ q, cat, sort, page: Math.min(pages, page + 1) })}
              aria-disabled={page >= pages}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                page >= pages && "pointer-events-none opacity-50",
              )}
            >
              Suivant
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
