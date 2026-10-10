import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { generateToken, hashToken, slugify } from "@/lib/tokens";
import { sendEmail, verificationEmail } from "@/lib/mail";
import { signupSchema } from "@/lib/validations/auth";

export const runtime = "nodejs";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json(
      { error: "Données invalides.", fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const email = data.email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Un compte existe déjà avec cet e-mail.", fieldErrors: { email: "E-mail déjà utilisé" } },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(data.password);

  try {
    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email,
        phone: data.phone,
        passwordHash,
        country: "BJ",
        city: data.city,
        accounts: {
          create: {
            role: data.role,
            ...(data.role === "SELLER"
              ? {
                  sellerProfile: {
                    create: {
                      sellerType: data.sellerType!,
                      shopName: data.shopName!,
                      slug: `${slugify(data.shopName!)}-${Math.random().toString(36).slice(2, 7)}`,
                      description: data.shopDescription || null,
                      city: data.city,
                    },
                  },
                }
              : {
                  buyerProfile: { create: {} },
                }),
          },
        },
      },
      select: { id: true, email: true },
    });

    const rawToken = generateToken();
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: hashToken(rawToken),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 h
      },
    });

    const link = `${APP_URL}/api/auth/verify-email?token=${rawToken}`;
    await sendEmail({ to: user.email, ...verificationEmail(link) }).catch((err) => {
      console.error("[signup] échec envoi e-mail:", err);
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[signup] erreur:", err);
    return NextResponse.json(
      { error: "Une erreur est survenue. Réessayez." },
      { status: 500 },
    );
  }
}
