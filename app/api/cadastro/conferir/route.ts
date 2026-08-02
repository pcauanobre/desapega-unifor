import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const ERRO_GENERICO = "Código inválido ou vencido. Peça um novo e tente de novo.";

/**
 * O QUE: confere o código do cadastro e QUEIMA ele no acerto (o signUp
 *        acontece em seguida, o código já cumpriu o papel).
 * POR QUE: prova de posse do email antes da conta nascer. Vale 15
 *          minutos, aguenta 5 tentativas e o erro é sempre o mesmo texto.
 * CHAMA: popup do código do "Criar conta".
 * QUEBRA SE: DATABASE_URL faltar no ambiente.
 */
export async function POST(req: NextRequest) {
  let body: { email?: string; otp?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "o corpo precisa ser JSON" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const otp = (body.otp ?? "").trim();
  if (!/.+@.+\..+/.test(email) || !/^\d{6}$/.test(otp)) {
    return NextResponse.json({ erro: ERRO_GENERICO }, { status: 400 });
  }

  try {
    const pg = db();
    const { rows } = await pg.query(
      `select id, otp, tentativas from public.codigos_cadastro
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
        `update public.codigos_cadastro set tentativas = tentativas + 1 where id = $1`,
        [registro.id],
      );
      return NextResponse.json({ erro: ERRO_GENERICO }, { status: 400 });
    }

    await pg.query(
      `update public.codigos_cadastro set usado_em = now() where id = $1`,
      [registro.id],
    );
    return NextResponse.json({ ok: true });
  } catch (excecao) {
    console.error("[cadastro/conferir]:", (excecao as Error).message);
    return NextResponse.json(
      { erro: "não deu pra conferir agora" },
      { status: 500 },
    );
  }
}
