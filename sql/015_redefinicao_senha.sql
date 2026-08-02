-- 015: redefinição de senha por código de 6 dígitos enviado no email.
-- A tabela é PRIVADA do servidor: quem escreve e lê é a conexão direta
-- das rotas /api/senha (DATABASE_URL). Nenhum papel de API tem grant, e
-- a RLS fica ligada como segunda tranca.

create extension if not exists pgcrypto with schema extensions;

create table public.redefinicoes_senha (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text not null,
  otp text not null,
  tentativas int not null default 0,
  usado_em timestamptz,
  created_at timestamptz not null default now()
);

alter table public.redefinicoes_senha enable row level security;
revoke all on public.redefinicoes_senha from anon, authenticated;

create index redefinicoes_email_idx
  on public.redefinicoes_senha (email, created_at desc);
