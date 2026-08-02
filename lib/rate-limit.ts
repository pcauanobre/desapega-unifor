/**
 * O QUE: rate limit de janela deslizante por IP, em memória do servidor.
 * POR QUE: a Data API do Supabase não tem limite nativo, e sem teto um
 *          script sozinho varre a vitrine inteira ou martela o envio de
 *          email. Guarda só o carimbo das requisições recentes: sem banco
 *          no caminho, o custo por request fica em microssegundos.
 * CHAMA: middleware.ts, na borda de todas as rotas /api.
 * QUEBRA SE: nada. Limitação conhecida: a contagem é por instância do
 *            servidor (em serverless, por lambda quente). Vale como freio
 *            de flood; o limite por email dos códigos continua no banco,
 *            que é global e não depende de instância.
 */
type Janela = { marcas: number[] };

const memoria = new Map<string, Janela>();
let ultimaLimpeza = Date.now();

/* Cada rota tem seu teto: leitura é generosa, escrita e email são duros. */
export const LIMITES: { prefixo: string; max: number; janelaMs: number }[] = [
  { prefixo: "/api/senha/enviar", max: 5, janelaMs: 15 * 60_000 },
  { prefixo: "/api/cadastro/enviar", max: 5, janelaMs: 15 * 60_000 },
  { prefixo: "/api/senha/", max: 20, janelaMs: 15 * 60_000 },
  { prefixo: "/api/cadastro/", max: 20, janelaMs: 15 * 60_000 },
  { prefixo: "/api/perfil/", max: 120, janelaMs: 60_000 },
  { prefixo: "/api/anuncios", max: 100, janelaMs: 60_000 },
  { prefixo: "/api/", max: 120, janelaMs: 60_000 },
];

export function limiteDaRota(caminho: string) {
  return LIMITES.find((l) => caminho.startsWith(l.prefixo)) ?? LIMITES[LIMITES.length - 1];
}

/**
 * Registra a batida e diz se passou do teto. `chave` costuma ser
 * IP + prefixo da rota, pra um flood no email não travar a vitrine.
 */
export function estourou(chave: string, max: number, janelaMs: number): boolean {
  const agora = Date.now();

  // Faxina periódica: sem isso o Map cresce com IP que nunca mais volta.
  if (agora - ultimaLimpeza > 5 * 60_000) {
    const corte = agora - 60 * 60_000;
    for (const [k, v] of memoria) {
      if (v.marcas.length === 0 || v.marcas[v.marcas.length - 1] < corte) memoria.delete(k);
    }
    ultimaLimpeza = agora;
  }

  const janela = memoria.get(chave) ?? { marcas: [] };
  const inicio = agora - janelaMs;
  const recentes = janela.marcas.filter((t) => t > inicio);
  recentes.push(agora);
  memoria.set(chave, { marcas: recentes });
  return recentes.length > max;
}
