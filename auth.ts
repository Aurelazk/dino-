import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function splitName(fullName?: string | null) {
  if (!fullName) return { firstName: "Client", lastName: "AgriMarket" };
  const [firstName, ...rest] = fullName.trim().split(/\s+/);
  return { firstName: firstName || "Client", lastName: rest.join(" ") || "-" };
}

const providers = [
  Credentials({
    name: "Identifiants",
    credentials: {
      email: { label: "E-mail", type: "email" },
      password: { label: "Mot de passe", type: "password" },
    },
    async authorize(raw) {
      const parsed = credentialsSchema.safeParse(raw);
      if (!parsed.success) return null;

      const email = parsed.data.email.toLowerCase().trim();
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.passwordHash || !user.isActive) return null;

      const valid = await verifyPassword(user.passwordHash, parsed.data.password);
      if (!valid) return null;

      return {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        image: user.avatarUrl,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }) as never,
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/connexion" },
  trustHost: true,
  providers,
  callbacks: {
    async signIn({ user, account }) {
      // Connexion sociale : rattacher/créer l'utilisateur en base.
      if (account?.provider === "google" && user.email) {
        const email = user.email.toLowerCase();
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
          user.id = existing.id;
          return true;
        }
        const { firstName, lastName } = splitName(user.name);
        const created = await prisma.user.create({
          data: {
            email,
            firstName,
            lastName,
            avatarUrl: user.image,
            emailVerifiedAt: new Date(),
          },
        });
        user.id = created.id;
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
          select: { id: true },
        });
        if (dbUser) token.sub = dbUser.id;
      }

      if (token.sub) {
        const accounts = await prisma.account.findMany({
          where: { userId: token.sub, isActive: true },
          select: { role: true },
        });
        token.roles = accounts.map((a) => a.role);
      }
      return token;
    },

    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      session.user.roles = (token.roles as string[] | undefined) ?? [];
      return session;
    },
  },
});
