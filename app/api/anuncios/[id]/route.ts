import { NextRequest, NextResponse } from "next/server";
import { createClient, supabaseConfigurado } from "@/lib/supabase/server";
import { COLUNAS_PUBLICAS } from "@/lib/tipos";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * O QUE: devolve UM anúncio pelo id, pra página de produto.
 * POR QUE: visitante recebe só as colunas públicas; usuário logado recebe
 *          também o contato (o banco garante isso por privilégio de coluna,
 *          a rota só escolhe a lista certa).
 * CHAMA: /produtos/[id].
 * QUEBRA SE: id fora do formato uuid (404) ou anúncio inexistente (404).
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
    return NextResponse.json({ erro: "anúncio não encontrado" }, { status: 404 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const colunas = user ? `${COLUNAS_PUBLICAS},contato` : COLUNAS_PUBLICAS;

  const { data, error } = await supabase
    .from("anuncios")
    .select(colunas)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("GET /api/anuncios/[id]:", error.message);
    return NextResponse.json(
      { erro: "não deu pra carregar o anúncio agora" },
      { status: 500 },
    );
  }
  if (!data) {
    return NextResponse.json({ erro: "anúncio não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ anuncio: data });
}

/**
 * O QUE: apaga um anúncio pelo id. Responde { ok: true } ou erro em JSON.
 * POR QUE: a RLS do banco só deixa apagar linha do próprio autor, então
 *          mesmo que alguém chame a rota com id alheio, o banco nega e a
 *          resposta vira 404 (sem revelar se o anúncio existe).
 * CHAMA: botão de excluir da aba "meus anúncios".
 * QUEBRA SE: sem login (401) ou id que não é uuid (404 direto).
 */
export async function DELETE(
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
    return NextResponse.json({ erro: "anúncio não encontrado" }, { status: 404 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ erro: "faça login" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("anuncios")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    console.error("DELETE /api/anuncios/[id]:", error.message);
    return NextResponse.json(
      { erro: "não deu pra excluir agora" },
      { status: 500 },
    );
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ erro: "anúncio não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
