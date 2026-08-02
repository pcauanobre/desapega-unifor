import { Pool } from "pg";

/**
 * O QUE: pool única de conexão direta do servidor com o Postgres.
 * POR QUE: o fluxo de redefinição de senha precisa ler auth.users e
 *          gravar códigos, coisas que a anon key não alcança de propósito.
 *          Isto NUNCA roda no navegador: DATABASE_URL só existe no servidor.
 * CHAMA: rotas /api/senha.
 * QUEBRA SE: DATABASE_URL faltar no ambiente.
 */
const globalPg = globalThis as unknown as { poolPg?: Pool };

export function db(): Pool {
  globalPg.poolPg ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 3,
  });
  return globalPg.poolPg;
}
