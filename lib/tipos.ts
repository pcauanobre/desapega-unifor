import type { Categoria } from "./categorias";

export type EstadoDoItem =
  | "Como novo"
  | "Bom estado"
  | "Usado"
  | "Funcionando";

/**
 * O QUE: o formato de um anúncio, igual à tabela `anuncios` do banco.
 * POR QUE: um tipo só pro dado circular igual entre API, vitrine e forms.
 * CHAMA: importado por qualquer arquivo que leia ou grave anúncio.
 * QUEBRA SE: a migration mudar coluna e este tipo não acompanhar.
 */
export type Anuncio = {
  id: string;
  titulo: string;
  descricao: string;
  categoria: Categoria;
  preco: number | null;
  is_doacao: boolean;
  imagem_url: string | null;
  estado: EstadoDoItem | null;
  autor_nome: string;
  autor_curso: string | null;
  bloco: string | null;
  fotos: string[] | null;
  contato: string | null;
  created_at: string;
  /* Só chega pra usuário logado (privilégio por coluna no banco): */
  autor_id?: string;
};

/**
 * O QUE: a lista de colunas públicas de anúncio, usada nos selects.
 * POR QUE: autor_id é restrito a usuário logado; pedir "*" como anônimo
 *          falharia no privilégio de coluna. A lista é a fonte única do
 *          que é público.
 * CHAMA: rotas GET de /api/anuncios.
 * QUEBRA SE: divergir dos GRANTs das migrations 004 e 005.
 */
export const COLUNAS_PUBLICAS =
  "id,titulo,descricao,categoria,preco,is_doacao,imagem_url,estado," +
  "autor_nome,autor_curso,created_at,bloco,fotos,contato";
