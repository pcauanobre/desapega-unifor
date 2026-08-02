import { NextRequest, NextResponse } from "next/server";
import { estourou, limiteDaRota } from "@/lib/rate-limit";

/**
 * O QUE: freio de flood na borda: toda rota /api passa por aqui e leva um
 *        teto de requisições por IP antes de tocar no banco.
 * POR QUE: uma linha de curl em loop derrubaria a cota do Supabase e do
 *          Brevo. Barrar na borda é mais barato que barrar na rota.
 * CHAMA: automático (config.matcher abaixo).
 * QUEBRA SE: nada; passou do teto responde 429 em JSON, com Retry-After.
 */
export function middleware(req: NextRequest) {
  const caminho = req.nextUrl.pathname;
  const { prefixo, max, janelaMs } = limiteDaRota(caminho);

  // Atrás da Vercel o IP real vem no x-forwarded-for (primeiro da lista).
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "desconhecido";

  if (estourou(`${ip}|${prefixo}`, max, janelaMs)) {
    return NextResponse.json(
      { erro: "Muitas requisições. Aguarde um pouco e tente de novo." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(janelaMs / 1000)) } },
    );
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
