interface MailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Envoi d'e-mail via Resend si RESEND_API_KEY est défini,
 * sinon fallback console (développement local sans fournisseur).
 */
export async function sendEmail({ to, subject, html, text }: MailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "AgriMarket <no-reply@agrimarket.bj>";

  if (!apiKey) {
    console.info(
      `\n[mail:dev] → ${to}\nSujet : ${subject}\n${text}\n(Configurez RESEND_API_KEY pour envoyer réellement.)\n`,
    );
    return { delivered: false as const, provider: "console" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend error ${res.status}: ${detail}`);
  }

  return { delivered: true as const, provider: "resend" };
}

export function verificationEmail(link: string) {
  return {
    subject: "Confirmez votre adresse e-mail — AgriMarket",
    text: `Bienvenue sur AgriMarket !\n\nConfirmez votre adresse e-mail en ouvrant ce lien :\n${link}\n\nCe lien expire dans 24 heures.`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:auto">
        <h1 style="color:#2E7D32">Bienvenue sur AgriMarket</h1>
        <p>Confirmez votre adresse e-mail pour activer votre compte.</p>
        <p style="margin:24px 0">
          <a href="${link}" style="background:#2E7D32;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600">
            Confirmer mon e-mail
          </a>
        </p>
        <p style="color:#6B7280;font-size:13px">Ou copiez ce lien : ${link}</p>
        <p style="color:#6B7280;font-size:13px">Ce lien expire dans 24 heures.</p>
      </div>`.trim(),
  };
}
