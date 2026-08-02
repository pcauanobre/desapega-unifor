import { NextRequest, NextResponse } from "next/server";
import { createClient, supabaseConfigurado } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * O QUE: o perfil público de um autor: nome, foto, curso, membro desde,
 *        último acesso e os contadores de vendas/doações/itens no ar.
 * POR QUE: os dados vêm da função perfil_publico do banco (migration 010),
 *          que expõe SÓ campos seguros; email e celular nunca passam aqui.
 * CHAMA: página /perfil/[id].
 * QUEBRA SE: id fora do formato uuid ou autor inexistente (404).
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!supabaseConfigurado()) {
    return NextResponse.json(
      { erro: "banco ainda não configurado: copie o .env.example pra .env.local" },
      { status: 503 },
    );
  }
  const { id } = await ctx.params;
  if (!UUID.test(id)) {
    return NextResponse.json({ erro: "perfil não encontrado" }, { status: 404 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("perfil_publico", { p_autor: id });

  if (error) {
    console.error("GET /api/perfil/[id]:", error.message);
    return NextResponse.json(
      { erro: "não deu pra carregar o perfil agora" },
      { status: 500 },
    );
  }
  if (!data) {
    return NextResponse.json({ erro: "perfil não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ perfil: data });
}
