import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * O QUE: recebe { email, otp, senha } e, se o código bater, troca a senha
 *        da conta (bcrypt via pgcrypto, mesmo formato do Supabase Auth).
 * POR QUE: o código é a prova de posse do email. Regras anti brute force:
 *          vale 15 minutos, morre no primeiro uso e aguenta no máximo 5
 *          tentativas erradas. O erro é sempre o mesmo texto, sem revelar
 *          se o problema foi código, validade ou conta.
 * CHAMA: segunda etapa do "Esqueci minha senha" do /entrar.
 * QUEBRA SE: DATABASE_URL faltar no ambiente.
 */
const ERRO_GENERICO = "Código inválido ou vencido. Peça um novo e tente de novo.";

export async function POST(req: NextRequest) {
  let body: { email?: string; otp?: string; senha?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "o corpo precisa ser JSON" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const otp = (body.otp ?? "").trim();
  const senha = body.senha ?? "";

  if (!/.+@.+\..+/.test(email) || !/^\d{6}$/.test(otp)) {
    return NextResponse.json({ erro: ERRO_GENERICO }, { status: 400 });
  }
  if (senha.length < 6 || senha.length > 72) {
    return NextResponse.json(
      { erro: "A nova senha precisa ter pelo menos 6 caracteres." },
      { status: 400 },
    );
  }

  const pg = db();
  try {
    const { rows } = await pg.query(
      `select id, user_id, otp, tentativas from public.redefinicoes_senha
        where email = $1 and usado_em is null
          and created_at > now() - interval '15 minutes'
        order by created_at desc limit 1`,
      [email],
    );
    const registro = rows[0];

    if (!registro || registro.tentativas >= 5) {
      return NextResponse.json({ erro: ERRO_GENERICO }, { status: 400 });
    }
    if (registro.otp !== otp) {
      await pg.query(
        `update public.redefinicoes_senha set tentativas = tentativas + 1 where id = $1`,
        [registro.id],
      );
      return NextResponse.json({ erro: ERRO_GENERICO }, { status: 400 });
    }

    // Código certo: queima ele e troca a senha na mesma transação.
    const cliente = await pg.connect();
    try {
      await cliente.query("begin");
      await cliente.query(
        `update public.redefinicoes_senha set usado_em = now() where id = $1`,
        [registro.id],
      );
      await cliente.query(
        `update auth.users
            set encrypted_password = extensions.crypt($1, extensions.gen_salt('bf', 10)),
                updated_at = now()
          where id = $2`,
        [senha, registro.user_id],
      );
      await cliente.query("commit");
    } catch (excecao) {
      await cliente.query("rollback");
      throw excecao;
    } finally {
      cliente.release();
    }

    return NextResponse.json({ ok: true });
  } catch (excecao) {
    console.error("[senha/confirmar]:", (excecao as Error).message);
    return NextResponse.json(
      { erro: "não deu pra redefinir agora" },
      { status: 500 },
    );
  }
}
