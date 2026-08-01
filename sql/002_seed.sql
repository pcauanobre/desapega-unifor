-- 002: dados de demonstração pra vitrine não nascer vazia.
-- Rodar DEPOIS do 003 (coluna estado) e depois de existir o primeiro
-- usuário (o seed usa o primeiro cadastrado como autor).
-- Fotos: picsum.photos com seed fixa (sempre a mesma foto pro mesmo item).

-- Limpa só os anúncios do usuário demo antes de reinserir (idempotente).
delete from public.anuncios
where autor_id = (select id from auth.users order by created_at limit 1);

insert into public.anuncios
  (titulo, descricao, categoria, preco, is_doacao, imagem_url, estado, autor_nome, created_at, autor_id)
select t.titulo, t.descricao, t.categoria, t.preco, t.is_doacao, t.imagem_url, t.estado,
       t.autor_nome, now() - t.faz::interval, u.id
from (values
  ('Cálculo Vol. 1 — Guidorizzi (6ª ed.)',
   'Usado um semestre, sem rabisco. Capa com marca de uso leve.',
   'Livros', 45.00, false, 'https://picsum.photos/seed/calculo/640/480', 'Bom estado',
   'Marina R. · Eng. Civil', '2 hours'),
  ('Calculadora HP 12C Platinum',
   'Funcionando perfeita, com capa e pilha nova. Ideal pras engenharias.',
   'Engenharia', 180.00, false, 'https://picsum.photos/seed/hp12c/640/480', 'Como novo',
   'Diego A. · Administração', '4 hours'),
  ('Jaleco branco manga longa tam. M',
   'Usei em 2 semestres de laboratório. Lavado e sem manchas.',
   'Vestuário', null, true, 'https://picsum.photos/seed/jaleco/640/480', 'Usado',
   'Ana Paula · Enfermagem', '5 hours'),
  ('Arduino Uno R3 + jumpers e protoboard',
   'Kit completo com leds e sensores básicos. Pouco uso.',
   'Eletrônicos', 60.00, false, 'https://picsum.photos/seed/arduino/640/480', 'Funcionando',
   'Caio M. · Eng. Elétrica', '7 hours'),
  ('Apostilas de Física 1 e 2',
   'Xerox encadernada com exercícios resolvidos das duas cadeiras.',
   'Engenharia', 20.00, false, 'https://picsum.photos/seed/fisica/640/480', 'Bom estado',
   'Bruno T. · Eng. Mecânica', '10 hours'),
  ('Cadeira de escritório giratória',
   'Em bom estado, saindo por mudança. Retirar no campus.',
   'Móveis', 120.00, false, 'https://picsum.photos/seed/cadeira/640/480', 'Usado',
   'Letícia F. · Arquitetura', '14 hours'),
  ('Algoritmos: Teoria e Prática (Cormen)',
   'Edição em português. Doando pra quem tá começando computação.',
   'Livros', null, true, 'https://picsum.photos/seed/cormen/640/480', 'Bom estado',
   'Pedro C. · Ciência da Computação', '20 hours'),
  ('Notebook stand + mochila 15"',
   'Suporte de alumínio e mochila reforçada com forro.',
   'Computação', 40.00, false, 'https://picsum.photos/seed/mochila/640/480', 'Como novo',
   'Julia S. · Design', '32 hours'),
  ('Mouse e teclado gamer (combo)',
   'Combo usado em bom estado, RGB funcionando. Troco por nada, é venda.',
   'Computação', 70.00, false, 'https://picsum.photos/seed/teclado/640/480', 'Bom estado',
   'Rafael N. · Ciência da Computação', '26 hours'),
  ('Multímetro digital com pontas novas',
   'Medindo certinho, pontas novas na caixa. Ideal pros laboratórios.',
   'Eletrônicos', 35.00, false, 'https://picsum.photos/seed/multimetro/640/480', 'Funcionando',
   'Sofia L. · Eng. Elétrica', '18 hours'),
  ('Tênis branco pouco usado (42)',
   'Comprei errado e usei duas vezes. Doando pra quem servir.',
   'Vestuário', null, true, 'https://picsum.photos/seed/tenis/640/480', 'Como novo',
   'Gabriel V. · Ed. Física', '22 hours'),
  ('Escrivaninha compacta com gaveta',
   'Perfeita pra quarto de república. Desmonto e ajudo a levar.',
   'Móveis', 90.00, false, 'https://picsum.photos/seed/escrivaninha/640/480', 'Bom estado',
   'Camila O. · Psicologia', '40 hours')
) as t (titulo, descricao, categoria, preco, is_doacao, imagem_url, estado, autor_nome, faz)
cross join (select id from auth.users order by created_at limit 1) as u;
