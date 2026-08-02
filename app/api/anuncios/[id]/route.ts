import { NextRequest, NextResponse } from "next/server";
import { createClient, supabaseConfigurado } from "@/lib/supabase/server";
import { COLUNAS_PUBLICAS } from "@/lib/tipos";
import { validarAnuncio } from "@/lib/validar-anuncio";

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
  const { data, error } = await supabase
    .from("anuncios")
    .select(COLUNAS_PUBLICAS)
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
  // Cada visita à página do produto conta um clique (função no banco,
  // visitante não tem UPDATE direto na tabela).
  await supabase.rpc("registrar_clique", { p_id: id });
  return NextResponse.json({ anuncio: data });
}

/**
 * O QUE: edita um anúncio existente. Mesmo corpo do POST; responde a
 *        linha atualizada.
 * POR QUE: a RLS só deixa o dono atualizar, então id alheio vira 404.
 * CHAMA: formulário de edição em /anunciar/novo?editar=id.
 * QUEBRA SE: sem login (401) ou corpo inválido (400 com os campos).
 */
export async function PUT(
  req: NextRequest,
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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "o corpo precisa ser JSON" }, { status: 400 });
  }
  const { dados, erros } = validarAnuncio(body);
  if (!dados) {
    return NextResponse.json(
      { erro: "dados inválidos", campos: erros },
      { status: 400 },
    );
  }

  // Editar também renova o contato a partir do celular atual do perfil.
  const contato =
    ((user.user_metadata ?? {}).celular as string | undefined) ?? null;

  const { data, error } = await supabase
    .from("anuncios")
    .update({ ...dados, contato })
    .eq("id", id)
    .select(COLUNAS_PUBLICAS)
    .maybeSingle();

  if (error) {
    console.error("PUT /api/anuncios/[id]:", error.message);
    return NextResponse.json(
      { erro: "não deu pra salvar a edição agora" },
      { status: 500 },
    );
  }
  if (!data) {
    return NextResponse.json({ erro: "anúncio não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ anuncio: data });
}

/**
 * O QUE: marca um anúncio como vendido/doado (carimbo em vendido_em).
 * POR QUE: vendido não é apagado: sai da vitrine mas vira histórico e
 *          estatística no perfil público do autor. A RLS garante que só
 *          o dono consegue; id alheio responde 404.
 * CHAMA: botão de check dos meus anúncios.
 * QUEBRA SE: sem login (401) ou id que não é uuid (404 direto).
 */
export async function PATCH(
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
    .update({ vendido_em: new Date().toISOString() })
    .eq("id", id)
    .is("vendido_em", null)
    .select("id");

  if (error) {
    console.error("PATCH /api/anuncios/[id]:", error.message);
    return NextResponse.json(
      { erro: "não deu pra encerrar agora" },
      { status: 500 },
    );
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ erro: "anúncio não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
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
