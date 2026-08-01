-- 002: dados de demonstração da vitrine, os 12 itens do design.
-- Rodar DEPOIS do 003 (coluna estado) e depois de existir o primeiro
-- usuário (o seed usa o primeiro cadastrado como autor de todos).
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
  ('Notebook Dell Inspiron i5 8GB SSD',
   'Bateria segurando bem, formatado. Acompanha carregador.',
   'Computação', 1250.00, false, 'https://picsum.photos/seed/delly/640/480', 'Bom estado',
   'Rafael T. · Ciência da Comp.', '9 hours'),
  ('Escrivaninha de MDF 1,10m com gaveta',
   'Sem cupim, com marcas leves de uso. Retirar no campus.',
   'Móveis', 90.00, false, 'https://picsum.photos/seed/escrivaninha/640/480', 'Usado',
   'Letícia B. · Arquitetura', '12 hours'),
  ('Kit desenho técnico (esquadros e escalímetro)',
   'Completo, doando pra quem tá entrando em engenharia.',
   'Engenharia', null, true, 'https://picsum.photos/seed/desenho/640/480', 'Bom estado',
   'Bruno S. · Eng. Mecânica', '14 hours'),
  ('Teclado mecânico ABNT2 switch red',
   'Pouquíssimo uso, sem keycap faltando. Com cabo removível.',
   'Computação', 130.00, false, 'https://picsum.photos/seed/teclado/640/480', 'Como novo',
   'Yuri N. · Sistemas de Info.', '18 hours'),
  ('Multímetro digital DT-830B',
   'Medindo certinho, com pontas de prova novas.',
   'Eletrônicos', 55.00, false, 'https://picsum.photos/seed/multimetro/640/480', 'Funcionando',
   'Camila F. · Eng. Elétrica', '20 hours'),
  ('Sobotta — Atlas de Anatomia Humana Vol. 2',
   'Edição conservada, sem páginas soltas. Ótimo pra ciclo básico.',
   'Livros', 120.00, false, 'https://picsum.photos/seed/sobotta/640/480', 'Bom estado',
   'Pedro L. · Medicina', '1 day'),
  ('Cadeira giratória com apoio de braço',
   'Regulagem de altura funcionando. Saindo por mudança.',
   'Móveis', 220.00, false, 'https://picsum.photos/seed/cadeira/640/480', 'Usado',
   'Isabela C. · Direito', '25 hours'),
  ('Camiseta da atlética tam. G',
   'Usada em 2 jogos, sem furo. Doando pra quem chegou agora.',
   'Vestuário', null, true, 'https://picsum.photos/seed/camiseta/640/480', 'Usado',
   'João V. · Nutrição', '26 hours')
) as t (titulo, descricao, categoria, preco, is_doacao, imagem_url, estado, autor_nome, faz)
cross join (select id from auth.users order by created_at limit 1) as u;
