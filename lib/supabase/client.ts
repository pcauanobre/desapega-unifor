import { createBrowserClient } from "@supabase/ssr";

/**
 * O QUE: cria o cliente Supabase pro navegador (componentes "use client").
 * POR QUE: sessão fica em cookie e o @supabase/ssr sincroniza com o server.
 * CHAMA: telas de login/cadastro e qualquer componente client que precise
 *        da sessão do usuário.
 * QUEBRA SE: faltar NEXT_PUBLIC_SUPABASE_URL ou _ANON_KEY no .env.local.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
