-- 014: marca os anúncios de demonstração. A tag azul do card e a checkbox
-- "Mostrar itens de demonstração" do filtro leem esta coluna; anúncio de
-- gente real nasce com demo = false.

alter table public.anuncios
  add column demo boolean not null default false;

-- SELECT por coluna, padrão das migrations 004/005/008/010.
grant select (demo) on public.anuncios to anon, authenticated;

-- Os demos existentes são os anúncios das contas de seed.
update public.anuncios a set demo = true
  from auth.users u
  where u.id = a.autor_id and u.email like '%@desapega.demo';
