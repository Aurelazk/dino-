"use client";

import * as React from "react";
import Image from "next/image";
import { CategoryIcon } from "@/components/catalog/category-icon";
import { cn } from "@/lib/utils";

export function ProductImage({
  src,
  alt,
  iconName,
  className,
  sizes,
  priority,
}: {
  src?: string | null;
  alt: string;
  iconName?: string | null;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-secondary to-muted",
          className,
        )}
      >
        <CategoryIcon name={iconName} className="h-14 w-14 text-primary/40" />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "400px"}
        priority={priority}
        onError={() => setFailed(true)}
        onLoad={() => setLoaded(true)}
        className={cn(
          "object-cover transition-transform duration-500 group-hover:scale-105",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
