import { NextRequest, NextResponse } from "next/server";
import { createClient, supabaseConfigurado } from "@/lib/supabase/server";

const SEM_BANCO = {
  erro: "banco ainda não configurado: copie o .env.example pra .env.local",
};
import { CATEGORIAS, type Categoria } from "@/lib/categorias";
import { COLUNAS_PUBLICAS } from "@/lib/tipos";
import { validarAnuncio } from "@/lib/validar-anuncio";

/**
 * O QUE: lista anúncios em JSON, recentes primeiro (máx 30). Filtros
 *        opcionais: ?categoria=Livros e ?autor=me (exige login).
 * POR QUE: filtro roda no banco, não no navegador: a lista pode crescer e
 *          o celular não precisa baixar tudo pra jogar fora depois.
 * CHAMA: vitrine da landing, feed mobile e aba "meus anúncios".
 * QUEBRA SE: o banco estiver fora ou a categoria vier fora da lista (400).
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  if (!supabaseConfigurado()) {
    return NextResponse.json(SEM_BANCO, { status: 503 });
  }
  const supabase = await createClient();
  const categoria = req.nextUrl.searchParams.get("categoria");
  const autor = req.nextUrl.searchParams.get("autor");
  const vendidos = req.nextUrl.searchParams.get("vendidos") === "1";

  let query = supabase
    .from("anuncios")
    .select(COLUNAS_PUBLICAS)
    // Teto alto de propósito: a vitrine pagina no cliente (8 + 4 por
    // clique) e os contadores dos chips contam a lista inteira, então
    // cortar aqui deixaria categoria com número errado.
    .limit(200);

  // Vitrine mostra o que tá no ar MAIS o que foi vendido nos últimos 3
  // dias (marcado como vendido no card): a pessoa vê que o item saiu, em
  // vez dele sumir do nada. Depois disso some sozinho. O histórico
  // completo (?vendidos=1) é por autor, pro perfil público.
  if (vendidos) {
    query = query
      .not("vendido_em", "is", null)
      .order("vendido_em", { ascending: false });
  } else {
    const corte = new Date(Date.now() - 3 * 24 * 60 * 60_000).toISOString();
    query = query
      .or(`vendido_em.is.null,vendido_em.gte.${corte}`)
      .order("created_at", { ascending: false });
  }

  if (categoria) {
    if (!CATEGORIAS.includes(categoria as Categoria)) {
      return NextResponse.json({ erro: "categoria inválida" }, { status: 400 });
    }
    query = query.eq("categoria", categoria);
  }

  if (autor === "me") {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { erro: "faça login pra ver seus anúncios" },
        { status: 401 },
      );
    }
    query = query.eq("autor_id", user.id);
  } else if (autor) {
    // Perfil público de qualquer autor, pelo uuid.
    if (!UUID.test(autor)) {
      return NextResponse.json({ erro: "autor inválido" }, { status: 400 });
    }
    query = query.eq("autor_id", autor);
  } else if (vendidos) {
    // Histórico só existe no contexto de um autor.
    return NextResponse.json({ erro: "autor obrigatório" }, { status: 400 });
  }

  const { data, error } = await query;
  if (error) {
    console.error("GET /api/anuncios:", error.message);
    return NextResponse.json(
      { erro: "não deu pra listar os anúncios agora" },
      { status: 500 },
    );
  }
  return NextResponse.json({ anuncios: data });
}

/**
 * O QUE: cria um anúncio. Corpo JSON com titulo, descricao, categoria,
 *        preco OU is_doacao, e imagem_url opcional. Responde 201 com a linha.
 * POR QUE: a identidade NUNCA vem do corpo: autor_id e autor_nome saem da
 *          sessão (cookie). Cliente não escolhe quem ele é.
 * CHAMA: formulário de anunciar do app mobile.
 * QUEBRA SE: sem login (401), corpo inválido (400 com a lista de campos),
 *            ou banco fora (500 genérico, detalhe só no log).
 */
export async function POST(req: NextRequest) {
  if (!supabaseConfigurado()) {
    return NextResponse.json(SEM_BANCO, { status: 503 });
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ erro: "faça login pra anunciar" }, { status: 401 });
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

  // Identidade pública do anúncio vem da conta, nunca do corpo da request.
  const meta = user.user_metadata ?? {};
  const autor_nome = (meta.nome as string | undefined) ?? "Aluno";
  const autor_curso = (meta.curso as string | undefined) ?? null;
  // O WhatsApp do anúncio é o celular do perfil: uma fonte só, sem campo
  // repetido no formulário.
  const contato = (meta.celular as string | undefined) ?? null;

  const { data, error } = await supabase
    .from("anuncios")
    .insert({ ...dados, autor_id: user.id, autor_nome, autor_curso, contato })
    .select(COLUNAS_PUBLICAS)
    .single();

  if (error) {
    console.error("POST /api/anuncios:", error.message);
    return NextResponse.json(
      { erro: "não deu pra criar o anúncio agora" },
      { status: 500 },
    );
  }
  return NextResponse.json({ anuncio: data }, { status: 201 });
}
