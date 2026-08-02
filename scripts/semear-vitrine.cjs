/**
 * O QUE: semeia a vitrine de demonstração: sobe as fotos da pasta local,
 *        troca a imagem dos anúncios existentes e cria os que faltam.
 * POR QUE: os 50 itens de demonstração precisam de foto própria (nada de
 *          host externo, que já saiu do ar uma vez) e de dados coerentes.
 * CHAMA: node scripts/semear-vitrine.cjs (só o dono do projeto roda).
 * QUEBRA SE: a pasta de fotos não existir ou faltar DATABASE_URL.
 *
 * Detalhe:
   1. corta em 4:3 e converte pra WebP (mesmo formato do upload do app)
   2. sobe pro nosso Storage
   3. troca a foto dos anúncios que já existem
   4. cria os anúncios novos, com autor demo coerente com o curso
   Roda quantas vezes quiser: o upload é upsert e os itens novos são
   identificados pelo título (não duplica). */
const fs = require("fs");
const path = require("path");
const RAIZ = "C:/Users/Pedro Cauã/Desktop/ProjetoVortex/projeto";
const PASTA = "C:/Users/Pedro Cauã/Desktop/fotos-desapega";
const sharp = require(RAIZ + "/node_modules/sharp");
const { Client } = require(RAIZ + "/node_modules/pg");
const { createClient } = require(RAIZ + "/node_modules/@supabase/supabase-js");

for (const linha of fs.readFileSync(RAIZ + "/.env.local", "utf8").split(/\r?\n/)) {
  const m = linha.match(/^([A-Z_]+)=(.+)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const CONTA_UPLOAD = "thiago@desapega.demo";
const TEMP = "TempFotos" + Math.random().toString(36).slice(2) + "9!";

/* arquivo -> título do anúncio que JÁ existe no banco */
const EXISTENTES = {
  "livros-guidorizzi": "Cálculo Vol. 1 — Guidorizzi (6ª ed.)",
  "livros-bioquimica": "Livro de Bioquímica Ilustrada",
  "livros-sobotta": "Sobotta — Atlas de Anatomia Vol. 2",
  "comp-notebook": "Notebook Dell Inspiron i5 8GB SSD",
  "comp-monitor": "Monitor 24 polegadas Full HD",
  "comp-teclado": "Teclado mecânico ABNT2 switch red",
  "comp-mouse": "Mouse sem fio com receptor USB",
  "eng-hp12c": "Calculadora HP 12C Platinum",
  "eng-kitdesenho": "Kit desenho técnico completo",
  "elet-arduino": "Arduino Uno R3 + protoboard e jumpers",
  "elet-fone": "Fone bluetooth over-ear lacrado",
  "elet-multimetro": "Multímetro digital DT-830B",
  "saude-estetoscopio": "Estetoscópio duplo adulto",
  "saude-pressao": "Medidor de pressão aneroide completo",
  "odonto-instrumental": "Kit instrumental odonto (espelho, sonda e pinça)",
  "odonto-arcada": "Macromodelo de arcada dentária com escova",
  "vest-jaleco": "Jaleco branco manga longa tam. M",
  "vest-camiseta": "Camiseta da atlética tam. G",
  "moveis-cadeira": "Cadeira giratória com apoio de braço",
  "moveis-escrivaninha": "Escrivaninha de MDF 1,10m com gaveta",
  "esp-volei": "Bola de vôlei oficial",
  "esp-beachtennis": "Raquete de beach tennis com capa",
  "outros-violao": "Violão de nylon com capa",
  "outros-garrafa": "Garrafa térmica 1L inox",
};

/* itens novos: [arquivo, titulo, descricao, categoria, estado, preco|null,
   doacao, bloco, autor] */
const NOVOS = [
  ["livros-vademecum", "Vade Mecum Saraiva 2025", "Edição deste ano, sem grifo e sem orelha dobrada. Usei um semestre só.", "Livros", "Como novo", 90, false, "Bloco M", "Isabela Castro"],
  ["livros-chiavenato", "Introdução à Administração — Chiavenato", "Clássico da graduação. Capa com marca de uso, miolo inteiro.", "Livros", "Bem conservado", 55, false, "Bloco D", "Diego Alves"],
  ["comp-ssd", "SSD 480GB SATA", "Tirei do notebook quando troquei por um maior. Formatado e testado.", "Computação", "Bem conservado", 120, false, "Bloco S", "Rafael Torres"],
  ["eng-paquimetro", "Paquímetro digital 150mm", "Bateria nova, mostrador limpo. Vem com o estojo original.", "Engenharia", "Como novo", 95, false, "Bloco J", "Bruno Sales"],
  ["eng-capacete", "Capacete de segurança branco (EPI)", "Usei nas visitas técnicas do semestre passado. Casquete sem trinca.", "Engenharia", "Bem conservado", 35, false, "Bloco J", "Marina Rocha"],
  ["eng-prancheta", "Prancheta A3 com régua paralela", "Régua desliza lisinho. Ocupa espaço demais no meu quarto.", "Engenharia", "Com marcas de uso", 70, false, "Bloco L", "Letícia Barros"],
  ["elet-caixasom", "Caixa de som bluetooth portátil", "Bateria segura umas 6 horas. Vem com o cabo de carga.", "Eletrônicos", "Bem conservado", 85, false, "Centro de Convivência (CC)", "Yuri Nogueira"],
  ["elet-carregador", "Carregador rápido USB-C 30W", "Comprei junto com o celular e nunca usei, ficou de reserva.", "Eletrônicos", "Novo", 45, false, "Bloco S", "Camila Freitas"],
  ["saude-oximetro", "Oxímetro de dedo digital", "Bateu certinho nas aulas práticas. Com pilhas novas.", "Saúde", "Como novo", 60, false, "Bloco B", "Ana Paula Neves"],
  ["saude-martelo", "Martelo de reflexos neurológico", "Usei na disciplina de semiologia. Cabo sem folga.", "Saúde", "Bem conservado", 40, false, "Bloco B", "Beatriz Melo"],
  ["saude-kitenfermagem", "Kit de enfermagem (tesoura, pinça e garrote)", "Comprei duplicado no início do curso. Tudo em inox.", "Saúde", "Novo", null, true, "Bloco B", "Helena Dias"],
  ["odonto-fotopolimerizador", "Fotopolimerizador LED sem fio", "Carrega rápido e mantém a intensidade. Vem com o protetor ocular.", "Odonto", "Bem conservado", 320, false, "Bloco O", "Gustavo Lopes"],
  ["odonto-manequim", "Manequim odontológico de bancada", "Aguentou dois semestres de prática. Fixação firme na bancada.", "Odonto", "Com marcas de uso", 250, false, "Bloco O", "Vitória Farias"],
  ["odonto-brocas", "Kit de brocas odontológicas", "Sobrou do kit da faculdade. Todas esterilizadas e no estojo.", "Odonto", "Como novo", 70, false, "Bloco O", "Gustavo Lopes"],
  ["vest-tenis", "Tênis de corrida nº 41", "Corri poucas vezes, entrada do solado quase intacta.", "Vestuário", "Bem conservado", 110, false, "Ginásio", "Thiago Prado"],
  ["vest-moletom", "Moletom do curso tam. M", "Lavado, sem bolinha no tecido. Ficou grande em mim.", "Vestuário", "Bem conservado", 50, false, "Centro de Convivência (CC)", "Larissa Pontes"],
  ["vest-camisasocial", "Camisa social branca tam. M", "Usei numa apresentação e nunca mais. Sem mancha.", "Vestuário", "Como novo", null, true, "Bloco D", "Diego Alves"],
  ["moveis-estante", "Estante de livros com 4 prateleiras", "Aguenta peso de livro grosso. Desmonto pra facilitar a retirada.", "Móveis", "Bem conservado", 160, false, "Estacionamento norte", "Sofia Duarte"],
  ["moveis-luminaria", "Luminária de mesa articulada", "Braço firme, lâmpada LED inclusa. Boa pra estudar de madrugada.", "Móveis", "Como novo", 45, false, "Bloco L", "Larissa Pontes"],
  ["moveis-puff", "Puff redondo cinza", "Tecido sem rasgo. Estou mudando de quarto e não cabe.", "Móveis", "Com marcas de uso", null, true, "Estacionamento sul", "Letícia Barros"],
  ["esp-halteres", "Par de halteres 5kg", "Revestimento intacto. Peguei academia e não uso mais em casa.", "Esportes", "Bem conservado", 80, false, "Ginásio", "Thiago Prado"],
  ["esp-yoga", "Tapete de yoga com alça", "Antiderrapante, higienizado. Vem com a alça de transporte.", "Esportes", "Como novo", 55, false, "Ginásio", "Helena Dias"],
  ["esp-bicicleta", "Bicicleta aro 26", "Freio revisado e pneus bons. Ando a pé pro campus agora.", "Esportes", "Com marcas de uso", 420, false, "Estacionamento norte", "Caio Martins"],
  ["outros-mochila", "Mochila para notebook 15,6\"", "Compartimento acolchoado, zíperes funcionando. Sem furo.", "Outros", "Bem conservado", 75, false, "Centro de Convivência (CC)", "João Vitor Ramos"],
  ["outros-ventilador", "Ventilador de mesa 30cm", "Três velocidades, silencioso. Salvou meu verão na república.", "Outros", "Com marcas de uso", 60, false, "Estacionamento sul", "Caio Martins"],
  ["outros-cafeteira", "Cafeteira francesa 350ml", "Vidro sem trinca e filtro novo. Café de madrugada garantido.", "Outros", "Como novo", null, true, "Cantina central", "Sofia Duarte"],
];

async function paraWebp(arquivo) {
  return sharp(arquivo)
    .resize(1280, 960, { fit: "cover", position: "attention" })
    .webp({ quality: 82 })
    .toBuffer();
}

(async () => {
  const pg = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await pg.connect();

  const { rows: conta } = await pg.query(
    "select id, encrypted_password from auth.users where email = $1",
    [CONTA_UPLOAD],
  );
  const hashOriginal = conta[0].encrypted_password;
  await pg.query(
    "update auth.users set encrypted_password = extensions.crypt($1, extensions.gen_salt('bf', 10)) where id = $2",
    [TEMP, conta[0].id],
  );

  let trocadas = 0;
  let criados = 0;
  const semFoto = [];

  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
    const { data: sessao, error: erroLogin } = await sb.auth.signInWithPassword({
      email: CONTA_UPLOAD,
      password: TEMP,
    });
    if (erroLogin) throw new Error("login: " + erroLogin.message);
    const uid = sessao.user.id;

    /* sobe todas as fotos de um item (-1, -2, -3) e devolve as URLs */
    async function subirFotos(base) {
      const urls = [];
      for (const n of [1, 2, 3]) {
        const achado = ["jpg", "jpeg", "png", "webp"]
          .map((ext) => path.join(PASTA, `${base}-${n}.${ext}`))
          .find((p) => fs.existsSync(p));
        if (!achado) continue;
        const buf = await paraWebp(achado);
        const caminho = `${uid}/demo/${base}-${n}.webp`;
        // Apaga antes de subir: o bucket tem política de INSERT e DELETE,
        // não de UPDATE, então upsert em arquivo existente seria negado.
        await sb.storage.from("fotos").remove([caminho]);
        const { error } = await sb.storage
          .from("fotos")
          .upload(caminho, buf, { contentType: "image/webp" });
        if (error) throw new Error(`upload ${base}-${n}: ${error.message}`);
        urls.push(sb.storage.from("fotos").getPublicUrl(caminho).data.publicUrl);
      }
      return urls;
    }

    // 1) troca a foto dos que já existem
    for (const [base, titulo] of Object.entries(EXISTENTES)) {
      const urls = await subirFotos(base);
      if (urls.length === 0) {
        semFoto.push(base);
        continue;
      }
      const { rowCount } = await pg.query(
        "update public.anuncios set imagem_url = $1, fotos = $2 where titulo = $3",
        [urls[0], urls, titulo],
      );
      if (rowCount > 0) trocadas++;
      console.log(`  troca: ${base} (${urls.length} foto(s))`);
    }

    // 2) cria os novos
    for (const [base, titulo, desc, cat, estado, preco, doacao, bloco, autor] of NOVOS) {
      const { rows: existe } = await pg.query(
        "select 1 from public.anuncios where titulo = $1 limit 1",
        [titulo],
      );
      if (existe.length > 0) {
        console.log(`  pula (já existe): ${titulo}`);
        continue;
      }
      const urls = await subirFotos(base);
      if (urls.length === 0) {
        semFoto.push(base);
        continue;
      }
      // reaproveita a identidade do autor demo (curso, contato e id)
      const { rows: dono } = await pg.query(
        "select autor_id, autor_nome, autor_curso, contato from public.anuncios where autor_nome = $1 limit 1",
        [autor],
      );
      if (dono.length === 0) {
        console.log(`  FALHOU (autor não achado): ${autor}`);
        continue;
      }
      await pg.query(
        `insert into public.anuncios
           (titulo, descricao, categoria, estado, preco, is_doacao, bloco,
            imagem_url, fotos, autor_id, autor_nome, autor_curso, contato, demo,
            created_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,true,
                 now() - (random() * interval '6 days'))`,
        [titulo, desc, cat, estado, preco, doacao, bloco, urls[0], urls,
         dono[0].autor_id, dono[0].autor_nome, dono[0].autor_curso, dono[0].contato],
      );
      criados++;
      console.log(`  novo: ${titulo}`);
    }

    await sb.auth.signOut();
  } finally {
    await pg.query("update auth.users set encrypted_password = $1 where id = $2", [
      hashOriginal,
      conta[0].id,
    ]);
  }

  const { rows: fim } = await pg.query(
    "select categoria, count(*)::int as n from public.anuncios group by categoria order by categoria",
  );
  console.log(`\nfotos trocadas: ${trocadas} | anúncios criados: ${criados}`);
  if (semFoto.length) console.log("sem arquivo de foto: " + semFoto.join(", "));
  console.log("\npor categoria:");
  fim.forEach((c) => console.log(`  ${c.categoria.padEnd(14)} ${c.n}`));
  await pg.end();
})().catch((e) => {
  console.error("erro:", e.message);
  process.exit(1);
});
