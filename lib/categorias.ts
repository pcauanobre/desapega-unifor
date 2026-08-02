/**
 * O QUE: a lista fixa de categorias do marketplace, fonte única da verdade.
 * POR QUE: front (chips e select) e API (validação) usam a MESMA lista, e o
 *          banco valida de novo via CHECK. Categoria nova entra só aqui e na
 *          migration.
 * CHAMA: filtros da vitrine, formulário de anunciar e validação da API.
 * QUEBRA SE: mudar um nome aqui sem mudar o CHECK do banco (o insert falha).
 */
export const CATEGORIAS = [
  "Livros",
  "Computação",
  "Engenharia",
  "Odonto",
  "Saúde",
  "Eletrônicos",
  "Vestuário",
  "Móveis",
  "Esportes",
  "Outros",
] as const;

export type Categoria = (typeof CATEGORIAS)[number];
