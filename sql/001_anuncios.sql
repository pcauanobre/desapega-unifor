-- 001: tabela de anúncios do Desapega Unifor
-- Rodar no SQL Editor do Supabase. Segurança fica toda aqui: RLS decide
-- quem lê e quem grava, a API só repassa a sessão do usuário.

create table public.anuncios (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null check (char_length(titulo) between 3 and 80),
  descricao   text not null check (char_length(descricao) between 10 and 500),
  categoria   text not null check (categoria in
    ('Livros','Computação','Engenharia','Eletrônicos','Vestuário','Móveis','Outros')),
  preco       numeric(10,2) check (preco is null or preco >= 0),
  is_doacao   boolean not null default false,
  imagem_url  text,
  autor_id    uuid not null references auth.users (id) on delete cascade,
  autor_nome  text not null check (char_length(autor_nome) between 2 and 60),
  created_at  timestamptz not null default now(),
  -- ou é doação, ou tem preço. Nunca os dois vazios.
  constraint preco_ou_doacao check (is_doacao or preco is not null)
);

alter table public.anuncios enable row level security;

revoke all on public.anuncios from anon, authenticated;
grant select on public.anuncios to anon, authenticated;
grant insert, delete on public.anuncios to authenticated;

-- Vitrine é pública por design: qualquer visitante vê os anúncios.
-- A tabela não guarda contato nem dado sensível, só o que vai no card.
create policy "vitrine_publica" on public.anuncios
  for select to anon, authenticated
  using (true);

-- Só usuário logado anuncia, e sempre como ele mesmo.
create policy "anunciar_como_si_mesmo" on public.anuncios
  for insert to authenticated
  with check (autor_id = (select auth.uid()));

-- Excluir só o que é seu.
create policy "excluir_so_o_dono" on public.anuncios
  for delete to authenticated
  using (autor_id = (select auth.uid()));

-- Índices pras consultas da vitrine (recentes primeiro, filtro por
-- categoria) e do "meus anúncios".
create index anuncios_created_at_idx on public.anuncios (created_at desc);
create index anuncios_categoria_idx  on public.anuncios (categoria);
create index anuncios_autor_idx      on public.anuncios (autor_id);
