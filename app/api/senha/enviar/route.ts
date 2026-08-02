import { NextRequest, NextResponse } from "next/server";
import { webcrypto } from "node:crypto";
import { db } from "@/lib/db";
import { enviarEmailRedefinicao } from "@/lib/email-redefinicao";

/**
 * O QUE: recebe { email } e, se a conta existir, envia um código de 6
 *        dígitos por email (Brevo). A resposta diz se a conta existe
 *        (campo "existe") pro formulário barrar typo de email na hora.
 * POR QUE: decisão de produto: avisar "esse email não tem conta" vale
 *          mais aqui que esconder quais emails têm cadastro (o dano de
 *          enumerar emails institucionais é baixo e o rate limit de 5
 *          envios por email a cada 15 minutos segura sondagem e flood).
 * CHAMA: fluxo "Esqueci minha senha" do /entrar.
 * QUEBRA SE: DATABASE_URL ou BREVO_API_KEY faltarem no ambiente.
 */
export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "o corpo precisa ser JSON" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!/.+@.+\..+/.test(email) || email.length > 200) {
    return NextResponse.json({ erro: "email inválido" }, { status: 400 });
  }

  try {
    const pg = db();

    // Rate limit por email: 5 pedidos a cada 15 minutos, contando todos.
    const { rows: recentes } = await pg.query(
      `select count(*)::int as total from public.redefinicoes_senha
        where email = $1 and created_at > now() - interval '15 minutes'`,
      [email],
    );
    if (recentes[0].total >= 5) {
      return NextResponse.json(
        { erro: "Muitos pedidos de código. Aguarde alguns minutos." },
        { status: 429 },
      );
    }

    const { rows: usuarios } = await pg.query(
      `select id, coalesce(raw_user_meta_data->>'nome', 'Aluno') as nome
         from auth.users where lower(email) = $1 limit 1`,
      [email],
    );

    if (usuarios.length > 0) {
      // Código de 6 dígitos por CSPRNG (Math.random é previsível).
      const buf = new Uint32Array(1);
      webcrypto.getRandomValues(buf);
      const otp = String(100000 + (buf[0] % 900000));

      // Um código ativo por vez: os anteriores morrem agora.
      await pg.query(
        `update public.redefinicoes_senha set usado_em = now()
          where email = $1 and usado_em is null`,
        [email],
      );
      await pg.query(
        `insert into public.redefinicoes_senha (user_id, email, otp)
         values ($1, $2, $3)`,
        [usuarios[0].id, email, otp],
      );

      const enviado = await enviarEmailRedefinicao(email, usuarios[0].nome, otp);
      if (!enviado) {
        console.error("[senha/enviar] envio falhou pra conta existente");
        return NextResponse.json(
          { erro: "não deu pra enviar o código agora" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ ok: true, existe: usuarios.length > 0 });
  } catch (excecao) {
    console.error("[senha/enviar]:", (excecao as Error).message);
    return NextResponse.json(
      { erro: "não deu pra enviar o código agora" },
      { status: 500 },
    );
  }
}
