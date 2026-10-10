"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingBasket,
  Store,
  User,
  X,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/produits", label: "Produits" },
];

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = React.useState(false);
  const [mobile, setMobile] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
    setMobile(false);
  }, [pathname]);

  const user = session?.user;
  const roles = user?.roles ?? [];
  const loading = status === "loading";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-display font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              A
            </span>
            AgriMarket
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {loading ? (
            <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {initials(user.name)}
                </span>
                <span className="hidden max-w-[10rem] truncate sm:inline">
                  {user.name}
                </span>
              </button>

              {open && (
                <>
                  <button
                    aria-hidden
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setOpen(false)}
                    tabIndex={-1}
                  />
                  <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-card">
                    <div className="border-b border-border px-4 py-3">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {roles.length ? (
                          roles.map((r) => (
                            <span
                              key={r}
                              className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
                            >
                              {r === "SELLER" ? "Vendeur" : r === "BUYER" ? "Acheteur" : r}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            Aucun espace
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-1.5">
                      <MenuLink href="/tableau-de-bord" icon={LayoutDashboard}>
                        Tableau de bord
                      </MenuLink>
                      {roles.includes("SELLER") ? (
                        <MenuLink href="/vendeur" icon={Store}>
                          Ma boutique
                        </MenuLink>
                      ) : (
                        <MenuLink href="/inscription" icon={Store}>
                          Devenir vendeur
                        </MenuLink>
                      )}
                      <MenuLink href="/produits" icon={ShoppingBasket}>
                        Acheter
                      </MenuLink>
                      <MenuLink href="/profil" icon={User}>
                        Mon profil
                      </MenuLink>
                    </div>
                    <div className="border-t border-border p-1.5">
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-error hover:bg-error/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
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
                className={cn(
                  buttonVariants({ variant: "accent", size: "md" }),
                  "hidden sm:inline-flex",
                )}
              >
                Créer un compte
              </Link>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Menu"
            onClick={() => setMobile((v) => !v)}
          >
            {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobile && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container flex flex-col gap-1 py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
            {!user && (
              <>
                <Link
                  href="/connexion"
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Se connecter
                </Link>
                <Link
                  href="/inscription"
                  className="rounded-md px-3 py-2 text-sm font-medium text-accent hover:bg-muted"
                >
                  Créer un compte
                </Link>
              </>
            )}
            {user && (
              <>
                <Link
                  href="/tableau-de-bord"
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Tableau de bord
                </Link>
                <Link
                  href="/produits"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  <Package className="h-4 w-4" /> Produits
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-error hover:bg-error/10"
                >
                  <LogOut className="h-4 w-4" /> Déconnexion
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MenuLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      {children}
    </Link>
  );
}
