-- 002: dados de demonstração pra vitrine não nascer vazia.
-- Rodar DEPOIS de criar a primeira conta no app: o seed usa o primeiro
-- usuário cadastrado como autor de todos os anúncios de exemplo.
-- Fotos: picsum.photos com seed fixa (sempre a mesma foto pro mesmo item).

insert into public.anuncios
  (titulo, descricao, categoria, preco, is_doacao, imagem_url, autor_id, autor_nome)
select t.titulo, t.descricao, t.categoria, t.preco, t.is_doacao, t.imagem_url,
       u.id, coalesce(u.raw_user_meta_data->>'nome', 'Aluno Unifor')
from (values
  ('Livro Cálculo Vol. 1 (Guidorizzi)',
   'Usado um semestre, sem rabisco. Capa com marca de uso leve.',
   'Livros', 45.00, false, 'https://picsum.photos/seed/calculo/640/480'),
  ('Calculadora HP 50g',
   'Funcionando perfeita, com capa e cabo. Ideal pra engenharia.',
   'Eletrônicos', 180.00, false, 'https://picsum.photos/seed/hp50g/640/480'),
  ('Jaleco tamanho M',
   'Usei em 2 semestres de laboratório. Lavado e sem manchas.',
   'Vestuário', null, true, 'https://picsum.photos/seed/jaleco/640/480'),
  ('Kit Arduino Uno + protoboard',
   'Kit completo com jumpers, leds e sensores básicos. Pouco uso.',
   'Computação', 95.00, false, 'https://picsum.photos/seed/arduino/640/480'),
  ('Apostilas de Física 1 e 2',
   'Xerox encadernada das apostilas com exercícios resolvidos.',
   'Engenharia', 20.00, false, 'https://picsum.photos/seed/fisica/640/480'),
  ('Cadeira de escritório',
   'Cadeira giratória em bom estado, saindo por mudança.',
   'Móveis', 120.00, false, 'https://picsum.photos/seed/cadeira/640/480'),
  ('Livro Algoritmos (Cormen)',
   'Edição em português. Doando pra quem tá começando computação.',
   'Livros', null, true, 'https://picsum.photos/seed/cormen/640/480'),
  ('Mochila pra notebook 15"',
   'Mochila reforçada com forro. Zíper novo trocado.',
   'Outros', 40.00, false, 'https://picsum.photos/seed/mochila/640/480')
) as t (titulo, descricao, categoria, preco, is_doacao, imagem_url)
cross join (select id, raw_user_meta_data from auth.users order by created_at limit 1) as u;
