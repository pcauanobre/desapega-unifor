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
import { Revelar } from "@/components/Revelar";

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
            De aluno pra aluno, <em>o comércio circular do campus</em>.
          </h1>
          <p className="hero-sub">
            O marketplace dos alunos da Unifor pra quem quer vender o que
            não usa mais ou até mesmo doar. Desapegue agora mesmo e combine
            tudo direto com o anunciante.
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

      <Revelar>
        <StatsBar />
      </Revelar>

      <section className="preview">
        <Revelar>
          <div className="container preview-head">
            <div>
              <h2 className="shelf-title">Últimos desapegos</h2>
              <p className="shelf-sub">O que acabou de chegar na vitrine.</p>
            </div>
            <Link className="preview-link" href="/produtos">
              Ver todos os itens →
            </Link>
          </div>
        </Revelar>
        <div className="container">
          <div className="grid">
            {(anuncios ?? []).slice(0, 4).map((a, i) => (
              <Revelar key={a.id} atraso={i * 90}>
                <CardAnuncio anuncio={a} />
              </Revelar>
            ))}
          </div>
        </div>
      </section>

      <Revelar>
        <ComoFunciona />
      </Revelar>
      <Rodape />
    </div>
  );
}
