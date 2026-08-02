-- 017: o contato deixa de ser coluna pública e passa a sair um por vez.
--
-- O problema: com grant de SELECT na coluna, um único request na Data API
-- ("select=contato" sem filtro) baixava o telefone de TODOS os anunciantes
-- de uma vez. Telefone é PII: dá spam, dá golpe.
--
-- A correção mantém a decisão de produto (visitante sem conta continua
-- vendo o contato do anúncio que abriu) e mata a varredura em massa:
-- o telefone sai só por esta função, uma linha por chamada, com o rate
-- limit da borda na frente.

revoke select (contato) on public.anuncios from anon, authenticated;

create or replace function public.contato_do_anuncio(p_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select contato from public.anuncios where id = p_id and vendido_em is null;
$$;

revoke all on function public.contato_do_anuncio(uuid) from public;
grant execute on function public.contato_do_anuncio(uuid) to anon, authenticated;
