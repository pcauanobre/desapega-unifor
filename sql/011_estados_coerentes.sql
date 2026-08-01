-- 011: régua única de conservação no estado do item. Sai a dupla confusa
-- "Usado"/"Funcionando" (misturava conservação com funcionamento), entra
-- a escala Novo / Como novo / Bem conservado / Com marcas de uso.

alter table public.anuncios
  drop constraint if exists anuncios_estado_check;

-- Reclassifica o que já existe pro valor mais próximo da régua nova.
update public.anuncios set estado = 'Bem conservado'
  where estado in ('Bom estado', 'Funcionando');
update public.anuncios set estado = 'Com marcas de uso'
  where estado = 'Usado';

alter table public.anuncios
  add constraint anuncios_estado_check
  check (estado in ('Novo', 'Como novo', 'Bem conservado', 'Com marcas de uso'));
