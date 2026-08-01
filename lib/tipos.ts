import type { Categoria } from "./categorias";

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
  autor_id: string;
  autor_nome: string;
  created_at: string;
};
