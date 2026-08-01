-- 006: bucket público de fotos (upload só logado, cada um mexe no que é
-- seu) e a função de apagar a própria conta com tudo dentro.

insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

create policy "fotos_leitura_publica" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'fotos');

create policy "fotos_upload_logado" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'fotos' and owner_id = (select auth.uid())::text);

create policy "fotos_dono_apaga" on storage.objects
  for delete to authenticated
  using (bucket_id = 'fotos' and owner_id = (select auth.uid())::text);

-- Apaga anúncios e a própria conta. SECURITY DEFINER porque mexe em
-- auth.users; o guard da primeira linha trava sem sessão.
create or replace function public.deletar_minha_conta()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'sem sessão ativa';
  end if;
  delete from public.anuncios where autor_id = auth.uid();
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.deletar_minha_conta() from public, anon;
grant execute on function public.deletar_minha_conta() to authenticated;
