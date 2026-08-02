import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const ERRO_GENERICO = "Código inválido ou vencido. Peça um novo e tente de novo.";

/**
 * O QUE: confere o código sem trocar nada: é o portão entre a etapa do
 *        código e a tela de nova senha.
 * POR QUE: a pessoa só escolhe senha nova depois de provar posse do email
 *          (estrutura do fluxo de reset do AgenHub). Conferir não queima o
 *          código: a troca de verdade revalida ele. Tentativa errada conta
 *          no mesmo limite de 5.
 * CHAMA: etapa do código do "Esqueci minha senha".
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
      `select id, otp, tentativas from public.redefinicoes_senha
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

    return NextResponse.json({ ok: true });
  } catch (excecao) {
    console.error("[senha/conferir]:", (excecao as Error).message);
    return NextResponse.json(
      { erro: "não deu pra conferir agora" },
      { status: 500 },
    );
  }
}
