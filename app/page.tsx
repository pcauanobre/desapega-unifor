"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Anuncio } from "@/lib/tipos";
import { TopBar } from "@/components/landing/TopBar";
import { HeaderNav } from "@/components/landing/HeaderNav";
import { StatsBar } from "@/components/landing/StatsBar";
import { CardAnuncio } from "@/components/CardAnuncio";
import { ComoFunciona } from "@/components/landing/ComoFunciona";
import { Rodape } from "@/components/landing/Rodape";
import { AvisoLegal } from "@/components/AvisoLegal";

/**
 * O QUE: a LP de apresentação (rota /): hero explicando a proposta,
 *        estatísticas, prévia dos 4 últimos desapegos e como funciona.
 *        O CTA principal leva pra vitrine completa em /produtos.
 * POR QUE: o Pedro definiu a rota raiz como apresentação; a prévia da
 *          vitrine fica aqui porque a landing do edital pede os últimos
 *          itens anunciados nela.
 * CHAMA: rota raiz do site.
 * QUEBRA SE: a API mudar o formato { anuncios: [...] }.
 */
export default function Home() {
  const [anuncios, setAnuncios] = useState<Anuncio[] | null>(null);

  useEffect(() => {
    fetch("/api/anuncios")
      .then(async (r) => {
        const corpo = await r.json();
        if (r.ok) setAnuncios(corpo.anuncios);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="pagina-1280 flex-1">
      <AvisoLegal />
      <TopBar />
      <HeaderNav />

      <section className="hero">
        <div className="container hero-inner">
          <h1 className="hero-title">
            Compra, vende e doa <em>sem sair do campus</em>.
          </h1>
          <p className="hero-sub">
            Aquele livro, a calculadora ou o jaleco parado no armário de
            alguém pode ser exatamente o que você precisa. Anuncia em um
            minuto e combina tudo direto no WhatsApp, de aluno pra aluno.
          </p>
          <div className="hero-ctas">
            <Link className="btn btn-hero" href="/produtos">
              Ver os desapegos
            </Link>
            <Link className="btn btn-hero-ghost" href="/anunciar">
              Quero anunciar
            </Link>
          </div>
        </div>
      </section>

      <StatsBar />

      <section className="preview">
        <div className="container preview-head">
          <div>
            <h2 className="shelf-title">Últimos desapegos</h2>
            <p className="shelf-sub">O que acabou de chegar na vitrine.</p>
          </div>
          <Link className="preview-link" href="/produtos">
            Ver todos os itens →
          </Link>
        </div>
        <div className="container">
          <div className="grid">
            {(anuncios ?? []).slice(0, 4).map((a) => (
              <CardAnuncio key={a.id} anuncio={a} />
            ))}
          </div>
        </div>
      </section>

      <ComoFunciona />
      <Rodape />
    </div>
  );
}
