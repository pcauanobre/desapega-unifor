/**
 * O QUE: aplica um arquivo .sql no Postgres do projeto, lendo a
 *        DATABASE_URL do .env.local.
 * POR QUE: migration roda do terminal, sem colar SQL no painel na mão.
 * CHAMA: node scripts/aplicar-sql.cjs sql/001_anuncios.sql
 * QUEBRA SE: .env.local sem DATABASE_URL, ou SQL com erro (mostra e sai 1).
 */
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const envPath = path.join(__dirname, "..", ".env.local");
for (const linha of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = linha.match(/^([A-Z_]+)=(.+)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const arquivo = process.argv[2];
if (!arquivo) {
  console.error("uso: node scripts/aplicar-sql.cjs <arquivo.sql>");
  process.exit(1);
}
const sql = fs.readFileSync(path.join(__dirname, "..", arquivo), "utf8");

(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(sql);
    console.log("aplicado:", arquivo);
  } finally {
    await client.end();
  }
})().catch((e) => {
  console.error("erro:", e.message);
  process.exit(1);
});
