/*
 * Service worker do Desapega Unifor, escrito à mão (sem Workbox, sem lib).
 *
 * Estratégia, em três regras:
 * 1. install: pré-cacheia o casco do app (rotas principais, manifest,
 *    ícones), então abrir o app instalado funciona mesmo sem rede.
 * 2. estáticos (_next/static, fontes, imagens, fotos do Storage): cache
 *    primeiro. Esses arquivos têm hash no nome ou mudam raramente, buscar
 *    de novo é desperdício.
 * 3. navegação e /api: rede primeiro, cache como plano B. Com internet o
 *    dado vem sempre fresco; sem internet a vitrine mostra a última versão
 *    vista, que é o combinado do modo offline.
 *
 * A versão participa do nome do cache: mudar a versão descarta os caches
 * antigos no activate, sem sobrar lixo de deploy passado.
 */
const VERSAO = "desapega-v2";
const CASCO = [
  "/",
  "/produtos",
  "/manifest.json",
  "/icone-192.png",
  "/icone-512.png",
  "/mark-blue.svg",
  "/mark-white.svg",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(VERSAO)
      .then((cache) => cache.addAll(CASCO))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) =>
        Promise.all(
          nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/* Estático = pode servir do cache sem medo (hash no nome ou muda raro). */
function ehEstatico(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    url.hostname.endsWith(".supabase.co") ||
    /\.(png|jpg|jpeg|svg|webp|ico|woff2?)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (evento) => {
  const req = evento.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (ehEstatico(url)) {
    evento.respondWith(cachePrimeiro(req));
    return;
  }
  if (req.mode === "navigate" || url.pathname.startsWith("/api/")) {
    evento.respondWith(redePrimeiro(req));
  }
});

async function cachePrimeiro(req) {
  const cache = await caches.open(VERSAO);
  const salvo = await cache.match(req);
  if (salvo) return salvo;
  const resposta = await fetch(req);
  if (resposta.ok) cache.put(req, resposta.clone());
  return resposta;
}

async function redePrimeiro(req) {
  const cache = await caches.open(VERSAO);
  try {
    const resposta = await fetch(req);
    if (resposta.ok) cache.put(req, resposta.clone());
    return resposta;
  } catch {
    const salvo = await cache.match(req);
    if (salvo) return salvo;
    // Navegação sem rede e sem cache da rota: entrega o casco da vitrine.
    if (req.mode === "navigate") {
      const casco = await cache.match("/produtos");
      if (casco) return casco;
    }
    return new Response(JSON.stringify({ erro: "sem conexão" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}
