"use client";

import { useEffect, useState } from "react";
import type { Anuncio } from "@/lib/tipos";
import { Logo } from "@/components/Logo";
import { CardAnuncio } from "@/components/CardAnuncio";

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
      <header className="bg-[#0A5CFF] px-4 py-3">
        <Logo fundo="azul" simboloAltura={36} />
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
          <div className="grid grid-cols-2 gap-4">
            {anuncios.map((a) => (
              <CardAnuncio key={a.id} anuncio={a} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

