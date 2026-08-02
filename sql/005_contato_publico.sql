-- 005: o contato do anúncio passa a ser público (decisão de produto:
-- facilitar a troca sem exigir conta; quem anuncia escolhe o que expõe
-- no formulário e pode não informar contato).

grant select (contato) on public.anuncios to anon;
