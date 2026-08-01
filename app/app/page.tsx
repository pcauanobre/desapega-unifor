"use client";

import { useEffect, useState } from "react";
import type { Anuncio } from "@/lib/tipos";

/**
 * O QUE: vitrine base do app: busca os anúncios na API e lista em cards.
 * POR QUE: primeiro esqueleto funcional da rota /app. O visual final e as
 *          abas (anunciar, meus anúncios) entram com o design mobile.
 * CHAMA: CTA da landing aponta pra cá; futura start_url do PWA.
 * QUEBRA SE: API fora do ar ou .env.local sem as chaves (mostra o aviso).
 */
export default function AppHome() {
  const [anuncios, setAnuncios] = useState<Anuncio[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/anuncios")
      .then(async (r) => {
        const corpo = await r.json();
        if (!r.ok) throw new Error(corpo.erro ?? "erro ao listar");
        setAnuncios(corpo.anuncios);
      })
      .catch((e: Error) => setErro(e.message));
  }, []);

  return (
    <main className="flex-1 bg-neutral-50">
      <header className="bg-[#004AF7] px-4 py-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-horizontal.svg" alt="Desapega Unifor" className="h-9" />
      </header>

      <section className="mx-auto max-w-xl px-4 py-6">
        {erro && (
          <p className="rounded-lg bg-amber-100 p-4 text-sm text-amber-900">
            {erro}
          </p>
        )}

        {!erro && anuncios === null && (
          <p className="p-4 text-sm text-neutral-500">Carregando anúncios…</p>
        )}

        {!erro && anuncios !== null && anuncios.length === 0 && (
          <p className="p-4 text-sm text-neutral-500">
            Nenhum anúncio ainda. Seja a primeira pessoa a desapegar!
          </p>
        )}

        {!erro && anuncios !== null && anuncios.length > 0 && (
          <ul className="grid grid-cols-2 gap-4">
            {anuncios.map((a) => (
              <CardAnuncio key={a.id} anuncio={a} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

/* Card simples da vitrine base (o definitivo vem com o design mobile). */
function CardAnuncio({ anuncio }: { anuncio: Anuncio }) {
  return (
    <li className="overflow-hidden rounded-lg bg-white shadow-sm">
      {anuncio.imagem_url && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={anuncio.imagem_url}
          alt={anuncio.titulo}
          className="h-32 w-full object-cover"
        />
      )}
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-[#131A40]">
          {anuncio.titulo}
        </p>
        <p className="text-xs text-neutral-500">{anuncio.categoria}</p>
        {anuncio.is_doacao ? (
          <span className="mt-1 inline-block rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
            DOAÇÃO
          </span>
        ) : (
          <p className="mt-1 text-sm font-bold text-[#004AF7]">
            R$ {Number(anuncio.preco).toFixed(2).replace(".", ",")}
          </p>
        )}
      </div>
    </li>
  );
}
