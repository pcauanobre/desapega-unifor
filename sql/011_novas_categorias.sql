-- 011: novas categorias: Odonto, Saúde e Esportes.
-- A lista do CHECK precisa bater com CATEGORIAS em lib/categorias.ts,
-- senão o insert nessas categorias passa na API e falha no banco.
-- A lista nova só acrescenta valores, então nenhum anúncio antigo quebra.

alter table public.anuncios
  drop constraint anuncios_categoria_check;

alter table public.anuncios
  add constraint anuncios_categoria_check check (categoria in
    ('Livros','Computação','Engenharia','Odonto','Saúde','Eletrônicos',
     'Vestuário','Móveis','Esportes','Outros'));
