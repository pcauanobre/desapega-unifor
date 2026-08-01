-- 007: toda conta nasce com o email já confirmado, direto no banco.
-- O projeto não usa confirmação por email: cadastro entra na hora.
-- (Sem isso, o painel com "Confirm email" ligado trava o login de
-- conta nova, que foi exatamente o bug visto em produção local.)

create or replace function public.autoconfirmar_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.email_confirmed_at := coalesce(new.email_confirmed_at, now());
  return new;
end;
$$;

drop trigger if exists autoconfirmar_email on auth.users;
create trigger autoconfirmar_email
  before insert on auth.users
  for each row execute function public.autoconfirmar_email();
