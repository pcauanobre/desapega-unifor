import { NextRequest, NextResponse } from "next/server";
import { webcrypto } from "node:crypto";
import { db } from "@/lib/db";
import { enviarEmailCadastro } from "@/lib/email-redefinicao";

/* Só aluno da Unifor cria conta; o servidor REFORÇA o domínio (o check do
   formulário é só conforto, quem manda é a borda). */
const DOMINIO_UNIFOR = "@edu.unifor.br";

/**
 * O QUE: primeiro passo do cadastro: recebe { email, nome }, valida o
 *        domínio institucional e envia o código de confirmação por email.
 * POR QUE: conta só nasce com email que a pessoa provou que possui. Rate
 *          limit de 5 envios por email a cada 15 minutos segura flood.
 * CHAMA: formulário "Criar conta" do /entrar.
 * QUEBRA SE: DATABASE_URL ou BREVO_API_KEY faltarem no ambiente.
 */
export async function POST(req: NextRequest) {
  let body: { email?: string; nome?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "o corpo precisa ser JSON" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const nome = (body.nome ?? "").trim().slice(0, 80) || "Aluno";

  if (!/.+@.+\..+/.test(email) || email.length > 200) {
    return NextResponse.json({ erro: "email inválido" }, { status: 400 });
  }
  if (!email.endsWith(DOMINIO_UNIFOR)) {
    return NextResponse.json(
      { erro: `Só dá pra criar conta com o email institucional (nome${DOMINIO_UNIFOR}).` },
      { status: 400 },
    );
  }

  try {
    const pg = db();

    const { rows: recentes } = await pg.query(
      `select count(*)::int as total from public.codigos_cadastro
        where email = $1 and created_at > now() - interval '15 minutes'`,
      [email],
    );
    if (recentes[0].total >= 5) {
      return NextResponse.json(
        { erro: "Muitos pedidos de código. Aguarde alguns minutos." },
        { status: 429 },
      );
    }

    const { rows: existentes } = await pg.query(
      `select 1 from auth.users where lower(email) = $1 limit 1`,
      [email],
    );
    if (existentes.length > 0) {
      return NextResponse.json(
        { erro: "Esse email já tem conta. É só entrar." },
        { status: 409 },
      );
    }

    const buf = new Uint32Array(1);
    webcrypto.getRandomValues(buf);
    const otp = String(100000 + (buf[0] % 900000));

    await pg.query(
      `update public.codigos_cadastro set usado_em = now()
        where email = $1 and usado_em is null`,
      [email],
    );
    await pg.query(
      `insert into public.codigos_cadastro (email, otp) values ($1, $2)`,
      [email, otp],
    );

    const enviado = await enviarEmailCadastro(email, nome, otp);
    if (!enviado) {
      return NextResponse.json(
        { erro: "não deu pra enviar o código agora" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (excecao) {
    console.error("[cadastro/enviar]:", (excecao as Error).message);
    return NextResponse.json(
      { erro: "não deu pra enviar o código agora" },
      { status: 500 },
    );
  }
}
