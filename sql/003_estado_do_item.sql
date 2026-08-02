-- 003: estado de conservação do item, mostrado como badge no card
-- (Como novo / Bom estado / Usado / Funcionando). Opcional: sem estado,
-- o card simplesmente não mostra badge.

alter table public.anuncios
  add column estado text
  check (estado in ('Como novo','Bom estado','Usado','Funcionando'));
