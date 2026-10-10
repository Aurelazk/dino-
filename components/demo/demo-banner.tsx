import Link from "next/link";
import { Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DemoBanner({ label }: { label?: string }) {
  return (
    <div className="sticky top-0 z-50 border-b border-black/10 bg-[#1F2937] text-white">
      <div className="container flex h-11 items-center gap-3 text-sm">
        <Sparkles className="h-4 w-4 shrink-0 text-warning" />
        <span className="truncate">
          Vous êtes en mode démo{label ? ` — ${label}` : ""}. Rien n&apos;est réel ici.
        </span>
        <span className="ml-auto hidden items-center gap-2 sm:flex">
          <Link
            href="/inscription"
            className={cn(buttonVariants({ variant: "accent", size: "sm" }))}
          >
            Créer mon compte
          </Link>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-white hover:bg-white/10",
            )}
          >
            Quitter la démo
          </Link>
        </span>
      </div>
    </div>
  );
}
