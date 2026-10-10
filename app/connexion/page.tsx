import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace AgriMarket (acheteur ou vendeur).",
};

export default function ConnexionPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-grain px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
