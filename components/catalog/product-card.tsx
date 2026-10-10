import Link from "next/link";
import { MapPin, Leaf, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/catalog/product-image";
import { unitLabels } from "@/lib/catalog";
import { formatXOF } from "@/lib/utils";
import type { Unit } from "@prisma/client";

export interface ProductCardData {
  title: string;
  slug: string;
  price: number;
  unit: Unit;
  isOrganic: boolean;
  isFresh: boolean;
  imageUrl?: string | null;
  ratingAvg: number;
  ratingCount: number;
  category: { name: string; icon: string | null };
  sellerProfile: { shopName: string; city: string | null; slug: string } | null;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/produits/${product.slug}`}
      className="group overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-card"
    >
      <div className="relative h-40 overflow-hidden">
        <ProductImage
          src={product.imageUrl}
          alt={product.title}
          iconName={product.category.icon}
          className="h-40 w-full"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/25 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {product.isOrganic && (
            <Badge variant="success">
              <Leaf className="h-3 w-3" /> Bio
            </Badge>
          )}
        </div>
        <div className="absolute right-3 top-3">
          <Badge variant="outline" className="bg-card/90">
            {product.category.name}
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <h3 className="truncate font-semibold leading-tight">{product.title}</h3>

        {product.sellerProfile && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {product.sellerProfile.shopName}
              {product.sellerProfile.city ? ` · ${product.sellerProfile.city}` : ""}
            </span>
          </p>
        )}

        <div className="mt-3 flex items-end justify-between">
          <div>
            <span className="text-lg font-bold text-primary">
              {formatXOF(product.price)}
            </span>
            <span className="text-xs text-muted-foreground"> / {unitLabels[product.unit]}</span>
          </div>
          {product.ratingCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" />
              {product.ratingAvg.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
