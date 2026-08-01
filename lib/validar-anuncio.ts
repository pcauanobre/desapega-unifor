import { CATEGORIAS, type Categoria } from "./categorias";

export type DadosAnuncio = {
  titulo: string;
  descricao: string;
  categoria: Categoria;
  preco: number | null;
  is_doacao: boolean;
  imagem_url: string | null;
  bloco: string | null;
  contato: string | null;
  fotos: string[] | null;
};

/**
 * O QUE: valida o corpo do "criar anúncio" campo a campo, com allow-list.
 * POR QUE: input de cliente é hostil por padrão. A API valida antes do
 *          banco e devolve erro claro por campo; o banco revalida via CHECK.
 * CHAMA: POST /api/anuncios.
 * QUEBRA SE: as regras daqui divergirem dos CHECKs da migration 001.
 */
export function validarAnuncio(body: unknown): {
  dados?: DadosAnuncio;
  erros?: string[];
} {
  const erros: string[] = [];
  const b = (typeof body === "object" && body !== null ? body : {}) as Record<
    string,
    unknown
  >;

  const titulo = typeof b.titulo === "string" ? b.titulo.trim() : "";
  if (titulo.length < 3 || titulo.length > 80)
    erros.push("titulo: entre 3 e 80 caracteres");

  const descricao = typeof b.descricao === "string" ? b.descricao.trim() : "";
  if (descricao.length < 10 || descricao.length > 500)
    erros.push("descricao: entre 10 e 500 caracteres");

  const categoria = b.categoria as Categoria;
  if (!CATEGORIAS.includes(categoria))
    erros.push("categoria: use uma das categorias da lista");

  const is_doacao = b.is_doacao === true;
  let preco: number | null = null;
  if (!is_doacao) {
    const p =
      typeof b.preco === "number" && Number.isFinite(b.preco) ? b.preco : null;
    if (p === null || p < 0 || p > 99999)
      erros.push("preco: obrigatório entre 0 e 99999 quando não é doação");
    else preco = Math.round(p * 100) / 100;
  }

  let imagem_url: string | null = null;
  if (typeof b.imagem_url === "string" && b.imagem_url.trim() !== "") {
    const limpa = urlValida(b.imagem_url);
    if (limpa) imagem_url = limpa;
    else erros.push("imagem_url: precisa ser uma URL http(s) válida");
  }

  const bloco =
    typeof b.bloco === "string" && b.bloco.trim() !== ""
      ? b.bloco.trim().slice(0, 40)
      : null;

  const contato =
    typeof b.contato === "string" && b.contato.trim() !== ""
      ? b.contato.trim().slice(0, 60)
      : null;

  let fotos: string[] | null = null;
  if (Array.isArray(b.fotos) && b.fotos.length > 0) {
    const limpas = b.fotos
      .filter((f): f is string => typeof f === "string")
      .map(urlValida)
      .filter((f): f is string => f !== null)
      .slice(0, 5);
    if (limpas.length !== b.fotos.length)
      erros.push("fotos: no máximo 5 URLs http(s) válidas");
    else fotos = limpas;
  }

  if (erros.length > 0) return { erros };
  return {
    dados: {
      titulo, descricao, categoria, preco, is_doacao,
      imagem_url: imagem_url ?? fotos?.[0] ?? null,
      bloco, contato, fotos,
    },
  };
}

/* URL http(s) normalizada, ou null se inválida. */
function urlValida(bruta: string): string | null {
  try {
    const u = new URL(bruta.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}
