-- 004: campos da página de produto: fotos (carrossel), bloco de retirada,
-- contato do anunciante e curso do autor.
-- Contato é dado pessoal: sai do acesso público. Quem não tá logado nem
-- consegue selecionar a coluna (privilégio por coluna do Postgres).

alter table public.anuncios
  add column bloco       text   check (bloco is null or char_length(bloco) <= 40),
  add column contato     text   check (contato is null or char_length(contato) <= 60),
  add column autor_curso text   check (autor_curso is null or char_length(autor_curso) <= 60),
  add column fotos       text[] check (fotos is null or array_length(fotos, 1) <= 5);

-- Troca o acesso "tabela inteira" por acesso coluna a coluna.
revoke select on public.anuncios from anon, authenticated;

grant select (id, titulo, descricao, categoria, preco, is_doacao, imagem_url,
              estado, autor_nome, autor_curso, created_at, bloco, fotos)
  on public.anuncios to anon;

grant select (id, titulo, descricao, categoria, preco, is_doacao, imagem_url,
              estado, autor_nome, autor_curso, created_at, bloco, fotos,
              contato, autor_id)
  on public.anuncios to authenticated;
