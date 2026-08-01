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
  autor_id: string;
  bloco: string | null;
  fotos: string[] | null;
  contato: string | null;
  cliques: number;
  vendido_em: string | null;
  created_at: string;
};

/**
 * O QUE: o que a função perfil_publico do banco devolve sobre um autor.
 * POR QUE: só campos que podem aparecer pra qualquer visitante; email e
 *          celular NUNCA entram aqui.
 * CHAMA: /api/perfil/[id] e a página /perfil/[id].
 * QUEBRA SE: a migration 010 mudar o json_build_object sem mudar isto.
 */
export type PerfilPublico = {
  nome: string;
  foto: string | null;
  curso: string | null;
  semestre: string | null;
  desde: string;
  ultimo_acesso: string | null;
  vendas: number;
  doacoes: number;
  no_ar: number;
};

/**
 * O QUE: a lista de colunas públicas de anúncio, usada nos selects.
 * POR QUE: pedir "*" traria coluna sem grant e falharia no privilégio de
 *          coluna. A lista é a fonte única do que é público (autor_id
 *          entrou na migration 010 pra linkar o perfil do vendedor).
 * CHAMA: rotas GET de /api/anuncios.
 * QUEBRA SE: divergir dos GRANTs das migrations 004, 005, 008 e 010.
 */
export const COLUNAS_PUBLICAS =
  "id,titulo,descricao,categoria,preco,is_doacao,imagem_url,estado," +
  "autor_nome,autor_curso,autor_id,created_at,bloco,fotos,contato,cliques,vendido_em";
