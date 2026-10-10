import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      accounts: {
        where: { isActive: true },
        include: { sellerProfile: true, buyerProfile: true },
      },
    },
  });

  if (!user) return null;
  return { ...user, roles: session.user.roles ?? [] };
}

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getSessionUser>>>;

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/connexion?suivant=/tableau-de-bord");
  return user;
}

export function hasRole(user: SessionUser, role: string) {
  return user.accounts.some((a) => a.role === role);
}
