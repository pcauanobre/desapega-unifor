/**
 * O QUE: cria o usuário demo "Equipe Desapega" via API pública de cadastro.
 * POR QUE: os anúncios do seed precisam de um autor real em auth.users.
 *          Usa a MESMA rota de signup que o app vai usar, nada de acesso
 *          privilegiado.
 * CHAMA: node scripts/criar-usuario-demo.cjs (antes do 002_seed.sql)
 * QUEBRA SE: .env.local ausente. Se o usuário já existir, só avisa e segue.
 */
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env.local");
for (const linha of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = linha.match(/^([A-Z_]+)=(.+)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const { createClient } = require("@supabase/supabase-js");

(async () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const { data, error } = await supabase.auth.signUp({
    email: "desapega.unifor.demo@gmail.com",
    password: "desapega-demo-2026",
    options: { data: { nome: "Equipe Desapega" } },
  });
  if (error) {
    console.log("aviso:", error.message);
    return;
  }
  console.log("usuário demo criado:", data.user?.id);
})();
