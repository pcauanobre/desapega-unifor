-- 012: seed refeito com um autor de verdade por anúncio. Cada pessoa demo
-- vira um usuário no auth (com nome, curso, semestre e foto de perfil da
-- API pravatar.cc), então o perfil público mostra SÓ os anúncios dela.
-- Fotos de produto vêm do loremflickr.com por palavra-chave da categoria
-- (?lock trava a mesma imagem em toda visita). Cobre as 10 categorias e as
-- 4 tags da régua de conservação; 2 anúncios já nascem vendidos pra dar
-- vida ao histórico do perfil.
-- Rodar DEPOIS da 010 (vendido_em), da 011_estados_coerentes (tags), da
-- 011_novas_categorias (Odonto, Saúde e Esportes no CHECK) e da 013
-- (coluna demo, que aqui nasce true).
-- Pode rodar de novo: limpa a rodada anterior e replanta.

-- Limpa o seed antigo (pendurava tudo no primeiro usuário) e os demos.
delete from public.anuncios
  where autor_id in (select id from auth.users where email like '%@desapega.demo')
     or autor_id = (select id from auth.users order by created_at limit 1);
delete from auth.users where email like '%@desapega.demo';

with pessoas (email, nome, curso, semestre, foto, ultimo) as (values
  ('marina@desapega.demo',  'Marina Rocha',    'Eng. Civil',        '5º', 'https://i.pravatar.cc/300?img=47', '2 hours'),
  ('beatriz@desapega.demo', 'Beatriz Melo',    'Medicina',          '3º', 'https://i.pravatar.cc/300?img=45', '1 day'),
  ('rafael@desapega.demo',  'Rafael Torres',   'Ciência da Comp.',  '7º', 'https://i.pravatar.cc/300?img=12', '5 hours'),
  ('yuri@desapega.demo',    'Yuri Nogueira',   'Sistemas de Info.', '4º', 'https://i.pravatar.cc/300?img=15', '16 hours'),
  ('larissa@desapega.demo', 'Larissa Pontes',  'Design',            '6º', 'https://i.pravatar.cc/300?img=20', '9 hours'),
  ('diego@desapega.demo',   'Diego Alves',     'Administração',     '8º', 'https://i.pravatar.cc/300?img=53', '3 hours'),
  ('bruno@desapega.demo',   'Bruno Sales',     'Eng. Mecânica',     '2º', 'https://i.pravatar.cc/300?img=59', '13 hours'),
  ('caio@desapega.demo',    'Caio Martins',    'Eng. Elétrica',     '5º', 'https://i.pravatar.cc/300?img=11', '6 hours'),
  ('camila@desapega.demo',  'Camila Freitas',  'Eng. Elétrica',     '6º', 'https://i.pravatar.cc/300?img=26', '19 hours'),
  ('sofia@desapega.demo',   'Sofia Duarte',    'Psicologia',        '1º', 'https://i.pravatar.cc/300?img=40', '4 hours'),
  ('ana@desapega.demo',     'Ana Paula Neves', 'Enfermagem',        '4º', 'https://i.pravatar.cc/300?img=44', '5 hours'),
  ('joao@desapega.demo',    'João Vitor Ramos','Nutrição',          '2º', 'https://i.pravatar.cc/300?img=68', '25 hours'),
  ('leticia@desapega.demo', 'Letícia Barros',  'Arquitetura',       '9º', 'https://i.pravatar.cc/300?img=32', '11 hours'),
  ('isabela@desapega.demo', 'Isabela Castro',  'Direito',           '7º', 'https://i.pravatar.cc/300?img=24', '22 hours'),
  ('vitoria@desapega.demo', 'Vitória Farias',  'Odontologia',       '6º', 'https://i.pravatar.cc/300?img=31', '3 hours'),
  ('gustavo@desapega.demo', 'Gustavo Lopes',   'Odontologia',       '8º', 'https://i.pravatar.cc/300?img=64', '15 hours'),
  ('helena@desapega.demo',  'Helena Dias',     'Fisioterapia',      '5º', 'https://i.pravatar.cc/300?img=35', '8 hours'),
  ('thiago@desapega.demo',  'Thiago Prado',    'Educação Física',   '3º', 'https://i.pravatar.cc/300?img=60', '12 hours')
),
criados as (
  insert into auth.users
    (instance_id, id, aud, role, email, encrypted_password,
     email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
     created_at, updated_at, last_sign_in_at,
     confirmation_token, recovery_token, email_change,
     email_change_token_new, email_change_token_current,
     phone_change, phone_change_token, reauthentication_token)
  select '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
         'authenticated', 'authenticated', p.email,
         'demo-sem-login',                       -- hash inválido: ninguém loga
         now(), '{"provider":"email","providers":["email"]}'::jsonb,
         jsonb_build_object('nome', p.nome, 'foto_url', p.foto,
                            'curso', p.curso, 'semestre', p.semestre),
         now() - interval '90 days', now(), now() - p.ultimo::interval,
         '', '', '', '', '', '', '', ''
  from pessoas p
  returning id, email, raw_user_meta_data
)
insert into public.anuncios
  (titulo, descricao, categoria, preco, is_doacao, imagem_url, estado,
   autor_nome, autor_curso, bloco, contato, fotos, created_at, vendido_em,
   autor_id, demo)
select t.titulo, t.descricao, t.categoria, t.preco::numeric, t.is_doacao,
       'https://loremflickr.com/900/675/' || t.kw || '?lock=' || t.trava,
       t.estado,
       c.raw_user_meta_data->>'nome', c.raw_user_meta_data->>'curso',
       t.bloco, t.contato,
       array['https://loremflickr.com/900/675/' || t.kw || '?lock=' || t.trava,
             'https://loremflickr.com/900/675/' || t.kw || '?lock=' || (t.trava + 1),
             'https://loremflickr.com/900/675/' || t.kw || '?lock=' || (t.trava + 2)],
       now() - t.faz::interval,
       case when t.vendido_faz is null then null
            else now() - t.vendido_faz::interval end,
       c.id, true
from (values
  -- Livros
  ('marina@desapega.demo', 'Cálculo Vol. 1 — Guidorizzi (6ª ed.)',
   'Usei um semestre, sem rabisco. Capa com marca leve de uso, acompanha resumo das 4 primeiras unidades.',
   'Livros', '45', false, 'Bem conservado', 'Bloco J', '(85) 98811-2233', 'book,math', 110, '2 hours', null),
  ('beatriz@desapega.demo', 'Sobotta — Atlas de Anatomia Vol. 2',
   'Edição conservada, sem páginas soltas, com algumas marcações a lápis. Ótimo pro ciclo básico da saúde.',
   'Livros', '120', false, 'Com marcas de uso', 'Biblioteca', '(85) 98822-3344', 'anatomy,book', 120, '24 hours', null),
  -- Computação
  ('rafael@desapega.demo', 'Notebook Dell Inspiron i5 8GB SSD',
   'Bateria segurando bem, formatado. Vai com carregador original e capa de neoprene.',
   'Computação', '1250', false, 'Bem conservado', 'Bloco K', '(85) 98833-4455', 'laptop', 130, '9 hours', null),
  ('yuri@desapega.demo', 'Teclado mecânico ABNT2 switch red',
   'Pouquíssimo uso, sem keycap faltando. Cabo removível e case original na caixa.',
   'Computação', '130', false, 'Como novo', 'Bloco K', '(85) 98844-5566', 'keyboard', 140, '18 hours', null),
  ('larissa@desapega.demo', 'Monitor 24 polegadas Full HD',
   'Tela sem risco nem pixel morto. Vendo porque montei setup com ultrawide. Cabo HDMI incluso.',
   'Computação', '380', false, 'Bem conservado', 'Centro de Convivência (CC)', '(85) 98855-6677', 'computer,monitor', 150, '11 hours', null),
  -- Engenharia
  ('diego@desapega.demo', 'Calculadora HP 12C Platinum',
   'Perfeita, com capa e pilha nova. Ideal pras engenharias e pro pessoal de negócios.',
   'Engenharia', '180', false, 'Como novo', 'Bloco D', '(85) 98866-7788', 'calculator', 160, '4 hours', null),
  ('bruno@desapega.demo', 'Kit desenho técnico completo',
   'Esquadros, escalímetro e compasso. Doando pra quem tá entrando em engenharia ou arquitetura.',
   'Engenharia', null, true, 'Bem conservado', 'Bloco J', '(85) 98877-8899', 'geometry,ruler', 170, '14 hours', null),
  -- Eletrônicos
  ('caio@desapega.demo', 'Arduino Uno R3 + protoboard e jumpers',
   'Kit com leds e sensores básicos, tudo testado antes de anunciar. Vai numa maleta organizadora.',
   'Eletrônicos', '60', false, 'Como novo', 'Bloco J', '(85) 98888-9900', 'arduino', 180, '7 hours', null),
  ('camila@desapega.demo', 'Multímetro digital DT-830B',
   'Medindo certinho, pontas de prova novas e bateria reserva. Marcas de bancada na carcaça.',
   'Eletrônicos', '55', false, 'Com marcas de uso', 'Bloco J', '(85) 98899-0011', 'multimeter', 190, '20 hours', null),
  ('sofia@desapega.demo', 'Fone bluetooth over-ear lacrado',
   'Ganhei outro de presente e esse nem saiu da caixa. Aproveita que é preço de desapego.',
   'Eletrônicos', '90', false, 'Novo', 'Centro de Convivência (CC)', '(85) 98900-1122', 'headphones', 200, '6 hours', null),
  -- Vestuário
  ('ana@desapega.demo', 'Jaleco branco manga longa tam. M',
   'Usei em 2 semestres de laboratório. Lavado, sem manchas e com bordado removível.',
   'Vestuário', null, true, 'Bem conservado', 'Bloco S', '(85) 98911-2233', 'doctor,coat', 210, '5 hours', null),
  ('joao@desapega.demo', 'Camiseta da atlética tam. G',
   'Usada em 2 jogos, sem furo. Doando pra quem chegou agora e quer entrar no clima.',
   'Vestuário', null, true, 'Com marcas de uso', 'Centro de Convivência (CC)', '(85) 98922-3344', 'tshirt', 220, '26 hours', null),
  -- Móveis
  ('leticia@desapega.demo', 'Escrivaninha de MDF 1,10m com gaveta',
   'Sem cupim, com marcas leves de uso. Retirada combinada no estacionamento do campus.',
   'Móveis', '90', false, 'Com marcas de uso', 'Estacionamento sul', '(85) 98933-4455', 'desk,wood', 230, '12 hours', null),
  ('isabela@desapega.demo', 'Cadeira giratória com apoio de braço',
   'Regulagem de altura funcionando. Saindo por mudança, retirada à noite de preferência.',
   'Móveis', '220', false, 'Bem conservado', 'Estacionamento norte', '(85) 98944-5566', 'office,chair', 240, '25 hours', null),
  -- Outros
  ('bruno@desapega.demo', 'Violão de nylon com capa',
   'Cordas trocadas mês passado, afinação firme. Perfeito pra roda no intervalo.',
   'Outros', '150', false, 'Bem conservado', 'Ginásio', '(85) 98877-8899', 'acoustic,guitar', 250, '16 hours', null),
  ('marina@desapega.demo', 'Garrafa térmica 1L inox',
   'Ganhei duas iguais, essa tá zerada na caixa. Segura o gelo o dia inteiro.',
   'Outros', null, true, 'Novo', 'Cantina central', '(85) 98811-2233', 'thermos,bottle', 260, '10 hours', null),
  -- Odonto
  ('vitoria@desapega.demo', 'Kit instrumental odonto (espelho, sonda e pinça)',
   'Aço inox, esterilizado e guardado no estojo. Usei em 2 semestres de clínica.',
   'Odonto', '75', false, 'Bem conservado', 'Bloco S', '(85) 98955-6677', 'dentist', 290, '3 hours', null),
  ('gustavo@desapega.demo', 'Macromodelo de arcada dentária com escova',
   'Padrão das aulas de anatomia dental. Sem peça faltando e articulação firme.',
   'Odonto', '50', false, 'Como novo', 'Bloco S', '(85) 98966-7788', 'teeth,dentist', 300, '15 hours', null),
  -- Saúde
  ('helena@desapega.demo', 'Estetoscópio duplo adulto',
   'Ausculta limpa, olivas novas. Vai com a bag e ficha de identificação.',
   'Saúde', '110', false, 'Como novo', 'Bloco S', '(85) 98977-8899', 'stethoscope', 310, '8 hours', null),
  ('beatriz@desapega.demo', 'Medidor de pressão aneroide completo',
   'Calibrado, braçadeira sem desgaste. Perfeito pras práticas de semiologia.',
   'Saúde', '85', false, 'Bem conservado', 'Biblioteca', '(85) 98822-3344', 'doctor,medical', 320, '21 hours', null),
  -- Esportes
  ('thiago@desapega.demo', 'Raquete de beach tennis com capa',
   'Fibra de carbono, sem trinca. Saindo porque comprei o modelo novo.',
   'Esportes', '140', false, 'Bem conservado', 'Ginásio', '(85) 98988-9900', 'tennis,racket', 330, '12 hours', null),
  ('joao@desapega.demo', 'Bola de vôlei oficial',
   'Pouco uso em quadra coberta, calibrada. Doando pro treino dos calouros.',
   'Esportes', null, true, 'Com marcas de uso', 'Ginásio', '(85) 98922-3344', 'volleyball', 340, '23 hours', null),
  -- Já vendidos: alimentam o histórico e as estatísticas do perfil.
  ('rafael@desapega.demo', 'Mouse sem fio com receptor USB',
   'Funcionando perfeito, só troquei por um gamer. Pilha nova inclusa.',
   'Computação', '40', false, 'Como novo', 'Bloco K', '(85) 98833-4455', 'computer,mouse', 270, '5 days', '3 days'),
  ('ana@desapega.demo', 'Livro de Bioquímica Ilustrada',
   'Doei pra uma caloura da saúde. Edição antiga mas completinha.',
   'Livros', null, true, 'Com marcas de uso', 'Bloco S', '(85) 98911-2233', 'chemistry,book', 280, '8 days', '5 days')
) as t (email, titulo, descricao, categoria, preco, is_doacao, estado,
        bloco, contato, kw, trava, faz, vendido_faz)
join criados c on c.email = t.email;
