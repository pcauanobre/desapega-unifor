-- 008: contador de cliques do anúncio e permissão de EDITAR o próprio
-- anúncio (update só do dono, via RLS).

alter table public.anuncios
  add column cliques integer not null default 0;

grant select (cliques) on public.anuncios to anon, authenticated;
grant update on public.anuncios to authenticated;

create policy "atualizar_so_o_dono" on public.anuncios
  for update to authenticated
  using (autor_id = (select auth.uid()))
  with check (autor_id = (select auth.uid()));

-- Visitante não tem UPDATE na tabela; o clique entra por esta função,
-- que só sabe fazer uma coisa: somar 1 no contador.
create or replace function public.registrar_clique(p_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.anuncios set cliques = cliques + 1 where id = p_id;
$$;

revoke all on function public.registrar_clique(uuid) from public;
grant execute on function public.registrar_clique(uuid) to anon, authenticated;
