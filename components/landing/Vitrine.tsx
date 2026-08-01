"use client";

import type { Anuncio } from "@/lib/tipos";
import { CATEGORIAS } from "@/lib/categorias";
import { CardAnuncio } from "@/components/CardAnuncio";

type Props = {
  anuncios: Anuncio[] | null;
  filtrados: Anuncio[];
  mostrandoSkeleton: boolean;
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
    anuncios, filtrados, mostrandoSkeleton, erro,
    categoria, onCategoria, ordenar, onOrdenar, onCarregarMais,
  } = props;

  const contar = (c: string) =>
    (anuncios ?? []).filter((a) => (c === "" ? true : a.categoria === c)).length;
  const carregando = mostrandoSkeleton || (anuncios === null && !erro);

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
            <select
              className="select"
              value={ordenar}
              onChange={(e) => onOrdenar(e.target.value)}
            >
              <option value="recentes">Mais recentes</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
              <option value="doacoes">Só doações</option>
            </select>
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
        ) : filtrados.length === 0 ? (
          <p className="shelf-sub">
            Nenhum anúncio nessa busca ainda. Seja a primeira pessoa a desapegar!
          </p>
        ) : (
          <div className="grid">
            {filtrados.map((a) => (
              <CardAnuncio key={a.id} anuncio={a} />
            ))}
          </div>
        )}
        <div className="shelf-more">
          <button
            className="btn btn-outline"
            onClick={onCarregarMais}
            disabled={mostrandoSkeleton}
          >
            {mostrandoSkeleton && <span className="spinner azul" />}
            {mostrandoSkeleton ? "Carregando itens…" : "Carregar mais itens"}
          </button>
        </div>
      </div>
    </main>
  );
}
