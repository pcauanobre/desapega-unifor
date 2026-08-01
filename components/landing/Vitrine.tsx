"use client";

import { useEffect } from "react";
import type { Anuncio } from "@/lib/tipos";
import { CATEGORIAS } from "@/lib/categorias";
import { CardAnuncio } from "@/components/CardAnuncio";
import { Droplist } from "@/components/Droplist";

type Props = {
  anuncios: Anuncio[] | null;
  filtrados: Anuncio[];
  extras: Anuncio[];
  mostrandoSkeleton: boolean;
  carregandoMais: boolean;
  erro: string | null;
  categoria: string;
  onCategoria: (v: string) => void;
  ordenar: string;
  onOrdenar: (v: string) => void;
  onCarregarMais: () => void;
};

/**
 * O QUE: a seção "Últimos desapegos" no markup do design: título, ordenar
 *        (com "Só doações"), chips com contador, grid, skeletons com
 *        shimmer e o botão "Carregar mais itens".
 * POR QUE: idêntica ao código fonte, mas com dados reais da API.
 * CHAMA: landing (app/page.tsx), que é dona do estado.
 * QUEBRA SE: as classes .shelf/.chips/.grid/.sk do design.css mudarem.
 */
export function Vitrine(props: Props) {
  const {
    anuncios, filtrados, extras, mostrandoSkeleton, carregandoMais, erro,
    categoria, onCategoria, ordenar, onOrdenar, onCarregarMais,
  } = props;

  const contar = (c: string) =>
    (anuncios ?? []).filter((a) => (c === "" ? true : a.categoria === c)).length;
  const carregando = mostrandoSkeleton || (anuncios === null && !erro);
  const lista = [...filtrados, ...extras];

  // Abriu o espaço de skeleton do "carregar mais": desce a página até ele.
  useEffect(() => {
    if (carregandoMais) {
      document
        .getElementById("skeleton-mais")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [carregandoMais]);

  return (
    <main className="shelf" id="vitrine">
      <div className="container shelf-head">
        <div className="shelf-head-row">
          <div>
            <h1 className="shelf-title">Últimos desapegos</h1>
            <p className="shelf-sub">
              Itens anunciados por alunos da Unifor nas últimas 48 horas.
            </p>
          </div>
          <div className="row gap-10">
            <span className="shelf-sortlabel">Ordenar por</span>
            <Droplist
              rotuloAria="Ordenar por"
              valor={ordenar}
              onMudar={onOrdenar}
              opcoes={[
                { valor: "recentes", rotulo: "Mais recentes" },
                { valor: "menor", rotulo: "Menor preço" },
                { valor: "maior", rotulo: "Maior preço" },
                { valor: "doacoes", rotulo: "Só doações" },
              ]}
            />
          </div>
        </div>
        <div className="chips">
          {["", ...CATEGORIAS].map((c) => (
            <button
              key={c || "todos"}
              className={"chip" + (categoria === c ? " is-active" : "")}
              onClick={() => onCategoria(c)}
            >
              {c === "" ? "Todos" : c}
              <span className="chip-count">{contar(c)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="container shelf-body">
        {erro ? (
          <p className="shelf-sub">{erro}</p>
        ) : carregando ? (
          <div className="grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div className="sk" key={i}>
                <div className="sk-bar sk-photo" />
                <div className="sk-bar sk-line-1" />
                <div className="sk-bar sk-line-2" />
                <div className="sk-foot">
                  <i />
                  <i />
                </div>
              </div>
            ))}
          </div>
        ) : lista.length === 0 ? (
          <p className="shelf-sub">
            Nenhum anúncio nessa busca ainda. Seja a primeira pessoa a desapegar!
          </p>
        ) : (
          <div className="grid">
            {lista.map((a, i) => (
              <CardAnuncio key={`${i}-${a.id}`} anuncio={a} />
            ))}
          </div>
        )}
        {carregandoMais && (
          <div className="grid" id="skeleton-mais" style={{ marginTop: 22 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="sk" key={i}>
                <div className="sk-bar sk-photo" />
                <div className="sk-bar sk-line-1" />
                <div className="sk-bar sk-line-2" />
                <div className="sk-foot">
                  <i />
                  <i />
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="shelf-more">
          <button
            className="btn btn-outline"
            onClick={onCarregarMais}
            disabled={carregandoMais || carregando}
          >
            {carregandoMais && <span className="spinner azul" />}
            {carregandoMais ? "Carregando itens…" : "Carregar mais itens"}
          </button>
        </div>
      </div>
    </main>
  );
}
