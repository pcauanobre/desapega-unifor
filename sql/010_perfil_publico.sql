-- 010: histórico de vendas e perfil público do vendedor.
-- "Vendido" deixa de ser DELETE: vira carimbo de data (vendido_em), assim
-- o perfil consegue mostrar histórico e contar vendas de verdade.

alter table public.anuncios
  add column vendido_em timestamptz;

-- autor_id passa a ser público: é só o identificador do perfil (uuid),
-- necessário pra linkar o vendedor; nenhum dado pessoal vai junto.
grant select (vendido_em, autor_id) on public.anuncios to anon, authenticated;

create index anuncios_autor_vendido_idx
  on public.anuncios (autor_id, vendido_em);

-- Perfil público: só campos que podem aparecer pra qualquer visitante.
-- NUNCA expor email, celular ou qualquer outro dado do auth.users aqui.
create or replace function public.perfil_publico(p_autor uuid)
returns json
language sql
security definer
set search_path = public
stable
as $$
  select json_build_object(
    'nome', coalesce(u.raw_user_meta_data->>'nome', 'Aluno'),
    'foto', u.raw_user_meta_data->>'foto_url',
    'curso', u.raw_user_meta_data->>'curso',
    'semestre', u.raw_user_meta_data->>'semestre',
    'desde', u.created_at,
    'ultimo_acesso', u.last_sign_in_at,
    'vendas', (select count(*) from public.anuncios a
                where a.autor_id = u.id and a.vendido_em is not null
                  and a.is_doacao = false),
    'doacoes', (select count(*) from public.anuncios a
                where a.autor_id = u.id and a.vendido_em is not null
                  and a.is_doacao = true),
    'no_ar', (select count(*) from public.anuncios a
                where a.autor_id = u.id and a.vendido_em is null)
  )
  from auth.users u
  where u.id = p_autor;
$$;

revoke all on function public.perfil_publico(uuid) from public;
grant execute on function public.perfil_publico(uuid) to anon, authenticated;
