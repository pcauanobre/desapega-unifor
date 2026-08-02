/**
 * O QUE: monta e envia o email do código de redefinição via Brevo (API
 *        HTTP), com o visual da marca em tabela de email old-school.
 * POR QUE: cliente de email não renderiza CSS moderno; o layout precisa
 *          ser tabela com estilo inline pra abrir igual no Gmail/Outlook.
 * CHAMA: rota /api/senha/enviar.
 * QUEBRA SE: BREVO_API_KEY faltar no ambiente (o envio falha e é logado).
 */
const FONTE = `'Plus Jakarta Sans','Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif`;

/* Cliente de email não renderiza SVG nem data URI: o ícone é um PNG
   hospedado no bucket público do Storage (subido uma vez, URL fixa). */
const LOGO_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/fotos/023065de-1f1d-408c-a9a3-cd9d45379251/marca/icone-email.png`;

export async function enviarEmailRedefinicao(
  email: string,
  nome: string,
  otp: string,
): Promise<boolean> {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F6FA;font-family:${FONTE};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F6FA;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border-radius:12px;border:1px solid #E7EAF2;overflow:hidden;box-shadow:0 2px 12px rgba(7,28,61,0.08);">
        <tr><td style="background:linear-gradient(135deg,#071C3D 0%,#0B2A5B 45%,#0A5CFF 100%);padding:28px 32px 24px;text-align:center;">
          <img src="${LOGO_URL}" alt="Desapega Unifor" width="64" height="64" style="display:block;margin:0 auto 12px;border:0;outline:none;border-radius:14px;" />
          <p style="margin:0;font-size:22px;font-weight:800;color:#FFFFFF;font-family:${FONTE};letter-spacing:-0.5px;">Desapega <span style="color:#BFD5FF;font-weight:500;">Unifor</span></p>
        </td></tr>
        <tr><td style="padding:32px 36px 8px;">
          <p style="margin:0 0 18px;font-size:16px;font-weight:700;color:#0847CC;font-family:${FONTE};">Olá, ${nome}</p>
          <p style="margin:0 0 24px;font-size:14px;color:#10162B;line-height:1.6;font-family:${FONTE};">
            Você pediu pra redefinir a senha da sua conta. Use o código abaixo na tela de recuperação:
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;width:100%;">
            <tr><td align="center" style="background:#F2F6FF;border:1px solid #D7DDE8;border-radius:8px;padding:24px 20px;">
              <p style="margin:0 0 12px;font-size:11px;color:#5A6480;text-transform:uppercase;letter-spacing:3px;font-family:${FONTE};font-weight:600;">Código de verificação</p>
              <p style="margin:0 0 10px;font-size:38px;font-weight:800;color:#0847CC;letter-spacing:14px;font-family:${FONTE};">${otp}</p>
              <p style="margin:0;font-size:13px;color:#B91C1C;font-style:italic;font-family:${FONTE};">Válido por 15 minutos</p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 36px 32px;">
          <table cellpadding="0" cellspacing="0" style="width:100%;border-left:3px solid #0A5CFF;background:#F5F8FF;border-radius:4px;">
            <tr><td style="padding:18px 22px;">
              <p style="margin:0 0 10px;font-size:13px;color:#10162B;line-height:1.6;font-family:${FONTE};">Digite este código na tela de recuperação e escolha a nova senha.</p>
              <p style="margin:0 0 10px;font-size:13px;color:#10162B;line-height:1.6;font-family:${FONTE};">Mantenha o código em segredo: ninguém do Desapega vai pedir ele.</p>
              <p style="margin:0;font-size:13px;color:#10162B;line-height:1.6;font-family:${FONTE};">Se você não pediu a redefinição, ignore este email e nada muda.</p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:14px 32px;background:#F5F6FA;border-top:1px solid #E7EAF2;text-align:center;">
          <p style="margin:0;font-size:11px;color:#5A6480;font-family:${FONTE};">Enviado por <strong style="color:#0847CC;">Desapega Unifor</strong> · projeto acadêmico</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const resposta = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY ?? "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Desapega Unifor", email: "pedrocauaggn@gmail.com" },
      to: [{ email, name: nome }],
      subject: "Desapega Unifor — Código de redefinição de senha",
      htmlContent: html,
    }),
  });

  if (!resposta.ok) {
    console.error("[senha/enviar] Brevo:", resposta.status, await resposta.text());
    return false;
  }
  return true;
}
