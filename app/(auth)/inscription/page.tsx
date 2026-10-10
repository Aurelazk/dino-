import type { Metadata } from "next";
import { SignupFlow } from "@/components/auth/signup-flow";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Inscription — AgriMarket",
  description:
    "Créez votre compte acheteur ou vendeur sur AgriMarket et rejoignez la marketplace des produits vivriers.",
};

export default function InscriptionPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-grain px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <SignupFlow />
    </main>
  );
}
