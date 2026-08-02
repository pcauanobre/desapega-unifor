/* Traz os avatares dos perfis de demonstração pro nosso Storage.
   Eles apontavam pro pravatar.cc, um host externo que a CSP do projeto
   bloqueia (e que pode sair do ar, como o loremflickr saiu). */
const fs = require("fs");
const crypto = require("crypto");
const RAIZ = "C:/Users/Pedro Cauã/Desktop/ProjetoVortex/projeto";
const sharp = require(RAIZ + "/node_modules/sharp");
const { Client } = require(RAIZ + "/node_modules/pg");
const { createClient } = require(RAIZ + "/node_modules/@supabase/supabase-js");

for (const linha of fs.readFileSync(RAIZ + "/.env.local", "utf8").split(/\r?\n/)) {
  const m = linha.match(/^([A-Z_]+)=(.+)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const CONTA_UPLOAD = "thiago@desapega.demo";
const TEMP = "TempAvatar" + Math.random().toString(36).slice(2) + "9!";

const apelido = (nome) =>
  nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

(async () => {
  const pg = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await pg.connect();

  const { rows: usuarios } = await pg.query(
    `select id, raw_user_meta_data->>'nome' as nome,
            raw_user_meta_data->>'foto_url' as foto
       from auth.users
      where raw_user_meta_data->>'foto_url' is not null
        and raw_user_meta_data->>'foto_url' not like '%supabase.co%'
      order by created_at`,
  );
  console.log(`avatares em host externo: ${usuarios.length}`);
  if (!usuarios.length) return pg.end();

  const { rows: conta } = await pg.query(
    "select id, encrypted_password from auth.users where email = $1",
    [CONTA_UPLOAD],
  );
  const hashOriginal = conta[0].encrypted_password;
  await pg.query(
    "update auth.users set encrypted_password = extensions.crypt($1, extensions.gen_salt('bf', 10)) where id = $2",
    [TEMP, conta[0].id],
  );

  let ok = 0;
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

    for (const u of usuarios) {
      try {
        const r = await fetch(u.foto, {
          headers: { "User-Agent": "Mozilla/5.0" },
          redirect: "follow",
          signal: AbortSignal.timeout(25000),
        });
        if (!r.ok) throw new Error("http " + r.status);
        const bruto = Buffer.from(await r.arrayBuffer());

        // Avatar é quadrado e pequeno: 400px basta e economiza banda.
        const buf = await sharp(bruto)
          .resize(400, 400, { fit: "cover", position: "attention" })
          .webp({ quality: 84 })
          .toBuffer();

        const versao = crypto.createHash("sha1").update(buf).digest("hex").slice(0, 8);
        const caminho = `${uid}/avatares/${apelido(u.nome)}-${versao}.webp`;
        const { data: antigos } = await sb.storage
          .from("fotos")
          .list(`${uid}/avatares`, { search: apelido(u.nome) });
        const velhas = (antigos ?? [])
          .map((f) => `${uid}/avatares/${f.name}`)
          .filter((c) => c !== caminho);
        if (velhas.length) await sb.storage.from("fotos").remove(velhas);

        const { error } = await sb.storage
          .from("fotos")
          .upload(caminho, buf, { contentType: "image/webp" });
        if (error) throw new Error(error.message);

        const publica = sb.storage.from("fotos").getPublicUrl(caminho).data.publicUrl;
        await pg.query(
          `update auth.users
              set raw_user_meta_data = jsonb_set(raw_user_meta_data, '{foto_url}', to_jsonb($1::text))
            where id = $2`,
          [publica, u.id],
        );
        ok++;
        console.log(`  ok: ${u.nome}`);
      } catch (e) {
        console.log(`  FALHOU ${u.nome}: ${e.message}`);
      }
    }
    await sb.auth.signOut();
  } finally {
    await pg.query("update auth.users set encrypted_password = $1 where id = $2", [
      hashOriginal,
      conta[0].id,
    ]);
  }

  console.log(`\navatares internalizados: ${ok}/${usuarios.length}`);
  await pg.end();
})().catch((e) => {
  console.error("erro:", e.message);
  process.exit(1);
});
