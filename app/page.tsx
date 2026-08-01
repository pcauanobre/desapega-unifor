"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Anuncio } from "@/lib/tipos";
import { TopBar } from "@/components/landing/TopBar";
import { HeaderBusca } from "@/components/landing/HeaderBusca";
import { StatsBar } from "@/components/landing/StatsBar";
import { CardAnuncio } from "@/components/CardAnuncio";
import { ComoFunciona } from "@/components/landing/ComoFunciona";
import { Rodape } from "@/components/landing/Rodape";

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
  const router = useRouter();
  const [anuncios, setAnuncios] = useState<Anuncio[] | null>(null);
  const [categoria, setCategoria] = useState("");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    fetch("/api/anuncios")
      .then(async (r) => {
        const corpo = await r.json();
        if (r.ok) setAnuncios(corpo.anuncios);
      })
      .catch(() => {});
  }, []);

  function irPraBusca() {
    const params = new URLSearchParams();
    if (categoria) params.set("categoria", categoria);
    if (busca.trim()) params.set("q", busca.trim());
    const query = params.toString();
    router.push(query ? `/produtos?${query}` : "/produtos");
  }

  return (
    <div className="pagina-1280 flex-1">
      <TopBar />
      <HeaderBusca
        categoria={categoria}
        busca={busca}
        onCategoria={setCategoria}
        onBusca={setBusca}
        onBuscar={irPraBusca}
      />

      <section className="hero">
        <div className="container hero-inner">
          <div>
            <h1 className="hero-title">
              O que sobra pra um, <em>serve pro outro</em>.
            </h1>
            <p className="hero-sub">
              O Desapega Unifor é o marketplace de economia circular do campus:
              alunos anunciam livros, calculadoras, jalecos e móveis que não
              usam mais, e quem tá chegando encontra tudo mais barato, ou de
              graça.
            </p>
            <div className="hero-ctas">
              <Link className="btn btn-hero" href="/produtos">
                Ver os desapegos
              </Link>
              <Link className="btn btn-hero-ghost" href="/entrar">
                Quero anunciar
              </Link>
            </div>
          </div>
          <div className="hero-art" />
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
