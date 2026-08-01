import { CATEGORIAS, type Categoria } from "./categorias";

export type DadosAnuncio = {
  titulo: string;
  descricao: string;
  categoria: Categoria;
  preco: number | null;
  is_doacao: boolean;
  imagem_url: string | null;
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
    try {
      const u = new URL(b.imagem_url.trim());
      if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error();
      imagem_url = u.toString();
    } catch {
      erros.push("imagem_url: precisa ser uma URL http(s) válida");
    }
  }

  if (erros.length > 0) return { erros };
  return {
    dados: { titulo, descricao, categoria, preco, is_doacao, imagem_url },
  };
}
