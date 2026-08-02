-- 002: dados de demonstração da vitrine, os 12 itens do design, agora com
-- os campos da página de produto (curso, bloco, contato, carrossel).
-- Rodar DEPOIS do 003 e do 004, com o primeiro usuário já criado.
-- Fotos: picsum.photos com seed fixa; o carrossel repete o item com
-- enquadramentos diferentes (sufixo -2 e -3).

delete from public.anuncios
where autor_id = (select id from auth.users order by created_at limit 1);

insert into public.anuncios
  (titulo, descricao, categoria, preco, is_doacao, imagem_url, estado,
   autor_nome, autor_curso, bloco, contato, fotos, created_at, autor_id)
select t.titulo, t.descricao, t.categoria, t.preco, t.is_doacao, t.imagem_url, t.estado,
       t.autor_nome, t.autor_curso, t.bloco, t.contato,
       array['https://picsum.photos/seed/' || t.foto_seed || '/900/675',
             'https://picsum.photos/seed/' || t.foto_seed || '-2/900/675',
             'https://picsum.photos/seed/' || t.foto_seed || '-3/900/675'],
       now() - t.faz::interval, u.id
from (values
  ('Cálculo Vol. 1 — Guidorizzi (6ª ed.)',
   'Usado um semestre, sem rabisco. Capa com marca de uso leve. Acompanha marcador e resumo das 4 primeiras unidades.',
   'Livros', 45.00, false, 'https://picsum.photos/seed/calculo/900/675', 'Bom estado',
   'Marina R.', 'Eng. Civil', 'Bloco J', '(85) 98811-2233', 'calculo', '2 hours'),
  ('Calculadora HP 12C Platinum',
   'Funcionando perfeita, com capa e pilha nova. Ideal pras engenharias e pros negócios.',
   'Engenharia', 180.00, false, 'https://picsum.photos/seed/hp12c/900/675', 'Como novo',
   'Diego A.', 'Administração', 'Bloco D', '(85) 98822-3344', 'hp12c', '4 hours'),
  ('Jaleco branco manga longa tam. M',
   'Usei em 2 semestres de laboratório. Lavado e sem manchas, com bordado removível.',
   'Vestuário', null, true, 'https://picsum.photos/seed/jaleco/900/675', 'Usado',
   'Ana Paula', 'Enfermagem', 'Bloco S', '(85) 98833-4455', 'jaleco', '5 hours'),
  ('Arduino Uno R3 + jumpers e protoboard',
   'Kit completo com leds e sensores básicos. Pouco uso, tudo testado antes de anunciar.',
   'Eletrônicos', 60.00, false, 'https://picsum.photos/seed/arduino/900/675', 'Funcionando',
   'Caio M.', 'Eng. Elétrica', 'Bloco J', '(85) 98844-5566', 'arduino', '7 hours'),
  ('Notebook Dell Inspiron i5 8GB SSD',
   'Bateria segurando bem, formatado. Acompanha carregador original e capa de neoprene.',
   'Computação', 1250.00, false, 'https://picsum.photos/seed/delly/900/675', 'Bom estado',
   'Rafael T.', 'Ciência da Comp.', 'Bloco K', '(85) 98855-6677', 'delly', '9 hours'),
  ('Escrivaninha de MDF 1,10m com gaveta',
   'Sem cupim, com marcas leves de uso. Retirada combinada no estacionamento do campus.',
   'Móveis', 90.00, false, 'https://picsum.photos/seed/escrivaninha/900/675', 'Usado',
   'Letícia B.', 'Arquitetura', 'Estacionamento', '(85) 98866-7788', 'escrivaninha', '12 hours'),
  ('Kit desenho técnico (esquadros e escalímetro)',
   'Completo, doando pra quem tá entrando em engenharia. Só buscar comigo no bloco.',
   'Engenharia', null, true, 'https://picsum.photos/seed/desenho/900/675', 'Bom estado',
   'Bruno S.', 'Eng. Mecânica', 'Bloco J', '(85) 98877-8899', 'desenho', '14 hours'),
  ('Teclado mecânico ABNT2 switch red',
   'Pouquíssimo uso, sem keycap faltando. Com cabo removível e case original.',
   'Computação', 130.00, false, 'https://picsum.photos/seed/teclado/900/675', 'Como novo',
   'Yuri N.', 'Sistemas de Info.', 'Bloco K', '(85) 98888-9900', 'teclado', '18 hours'),
  ('Multímetro digital DT-830B',
   'Medindo certinho, com pontas de prova novas e bateria reserva.',
   'Eletrônicos', 55.00, false, 'https://picsum.photos/seed/multimetro/900/675', 'Funcionando',
   'Camila F.', 'Eng. Elétrica', 'Bloco J', '(85) 98899-0011', 'multimetro', '20 hours'),
  ('Sobotta — Atlas de Anatomia Humana Vol. 2',
   'Edição conservada, sem páginas soltas. Ótimo pro ciclo básico da saúde.',
   'Livros', 120.00, false, 'https://picsum.photos/seed/sobotta/900/675', 'Bom estado',
   'Pedro L.', 'Medicina', 'Biblioteca central', '(85) 98900-1122', 'sobotta', '1 day'),
  ('Cadeira giratória com apoio de braço',
   'Regulagem de altura funcionando. Saindo por mudança, retirada à noite de preferência.',
   'Móveis', 220.00, false, 'https://picsum.photos/seed/cadeira/900/675', 'Usado',
   'Isabela C.', 'Direito', 'Estacionamento sul', '(85) 98911-2233', 'cadeira', '25 hours'),
  ('Camiseta da atlética tam. G',
   'Usada em 2 jogos, sem furo. Doando pra quem chegou agora e quer entrar no clima.',
   'Vestuário', null, true, 'https://picsum.photos/seed/camiseta/900/675', 'Usado',
   'João V.', 'Nutrição', 'Praça central', '(85) 98922-3344', 'camiseta', '26 hours')
) as t (titulo, descricao, categoria, preco, is_doacao, imagem_url, estado,
        autor_nome, autor_curso, bloco, contato, foto_seed, faz)
cross join (select id from auth.users order by created_at limit 1) as u;
