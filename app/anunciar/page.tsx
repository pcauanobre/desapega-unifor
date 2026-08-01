"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/landing/TopBar";
import { HeaderNav } from "@/components/landing/HeaderNav";

const OPCOES = [
  {
    href: "/anunciar/novo",
    img: "/escolha-anunciar.png",
    kicker: "PUBLICAR",
    titulo: "Anunciar um item",
    sub: "Suba as fotos, defina o preço e publique na vitrine em um minuto.",
    lado: "esq",
  },
  {
    href: "/meus-anuncios",
    img: "/escolha-meus.png",
    kicker: "ACOMPANHAR",
    titulo: "Meus anúncios",
    sub: "Acompanhe os cliques, edite ou encerre tudo que você publicou.",
    lado: "dir",
  },
];

/**
 * O QUE: a central do desapego: dois retângulos grandes com foto, um pra
 *        anunciar e outro pros seus anúncios. Hover acende um lado e
 *        apaga o outro; a entrada desliza das laterais.
 * POR QUE: quem clica em "Anunciar" quer uma das duas coisas; a escolha
 *          visual resolve em um clique.
 * CHAMA: botão Anunciar do header. Sem login, volta pro /entrar.
 * QUEBRA SE: as imagens escolha-*.png sumirem de public/.
 */
export default function CentralAnunciar() {
  const router = useRouter();
  const [foco, setFoco] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (!user) router.replace("/entrar");
      });
  }, [router]);

  return (
    <div className="pagina-1280 flex-1">
      <TopBar />
      <HeaderNav />
      <main className="container esc-wrap">
        <div>
          <Link className="pd-voltar" style={{ marginTop: 0 }} href="/produtos">
            ← Voltar
          </Link>
        </div>
        <span className="info-kicker">CENTRAL DO DESAPEGO</span>
        <h1 className="info-title">O que vamos fazer hoje?</h1>
        <div className="esc-grid">
          {OPCOES.map((o) => (
            <Link
              key={o.href}
              href={o.href}
              className={
                `esc-card esc-${o.lado}` +
                (foco === null ? "" : foco === o.href ? " is-on" : " is-off")
              }
              onMouseEnter={() => setFoco(o.href)}
              onMouseLeave={() => setFoco(null)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={o.img} alt="" className="esc-img" />
              <span className="esc-veu" />
              <span className="esc-texto">
                <span className="mono esc-kicker">{o.kicker}</span>
                <span className="esc-titulo">{o.titulo}</span>
                <span className="esc-sub">{o.sub}</span>
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
