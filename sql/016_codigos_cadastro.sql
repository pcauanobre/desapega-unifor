-- 016: código de confirmação de email no cadastro.
-- Mesma mecânica do reset de senha: 6 dígitos, 15 minutos de validade,
-- 5 tentativas e um uso só. Tabela privada do servidor (RLS ligada e
-- grants revogados; só a conexão direta das rotas /api/cadastro toca).

create table public.codigos_cadastro (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  otp text not null,
  tentativas int not null default 0,
  usado_em timestamptz,
  created_at timestamptz not null default now()
);

alter table public.codigos_cadastro enable row level security;
revoke all on public.codigos_cadastro from anon, authenticated;

create index codigos_cadastro_email_idx
  on public.codigos_cadastro (email, created_at desc);
