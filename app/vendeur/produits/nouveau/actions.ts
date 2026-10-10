"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations/product";
import { slugify } from "@/lib/tokens";

export async function createProduct(formData: FormData) {
  const user = await requireUser();
  const seller = user.accounts.find((a) => a.role === "SELLER");
  if (!seller) redirect("/inscription");

  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    categoryId: formData.get("categoryId"),
    unit: formData.get("unit"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    minOrderQty: formData.get("minOrderQty") || 1,
    description: formData.get("description") || undefined,
    isOrganic: formData.get("isOrganic") ?? undefined,
  });

  if (!parsed.success) {
    redirect("/vendeur/produits/nouveau?erreur=champs");
  }

  const d = parsed.data;
  const slug = `${slugify(d.title)}-${Math.random().toString(36).slice(2, 7)}`;

  await prisma.product.create({
    data: {
      slug,
      title: d.title,
      description: d.description ?? null,
      unit: d.unit,
      price: d.price,
      stock: d.stock,
      minOrderQty: d.minOrderQty,
      isOrganic: Boolean(d.isOrganic),
      status: "ACTIVE",
      publishedAt: new Date(),
      categoryId: d.categoryId,
      sellerAccountId: seller.id,
      sellerProfileId: seller.sellerProfile?.id ?? null,
    },
  });

  revalidatePath("/vendeur");
  revalidatePath("/produits");
  redirect("/vendeur?produit=ajoute");
}
