import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * O QUE: cria o cliente Supabase pro lado servidor (rotas da API e Server
 *        Components), lendo a sessão do usuário a partir dos cookies.
 * POR QUE: é assim que as rotas sabem QUEM tá logado sem receber token por
 *          parâmetro. A RLS do banco decide o que esse usuário pode fazer.
 * CHAMA: app/api/anuncios/* (POST e DELETE precisam do usuário real).
 * QUEBRA SE: faltar as envs públicas, ou se for chamado fora de request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // chamado de um Server Component: ignora, o refresh fica pro client
          }
        },
      },
    },
  );
}
