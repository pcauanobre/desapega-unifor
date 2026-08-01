"use client";

import type { Anuncio } from "@/lib/tipos";
import { CATEGORIAS } from "@/lib/categorias";
import { CardAnuncio } from "@/components/CardAnuncio";

type Props = {
  anuncios: Anuncio[] | null;
  filtrados: Anuncio[];
  erro: string | null;
  categoria: string;
  onCategoria: (v: string) => void;
  ordenar: string;
  onOrdenar: (v: string) => void;
};

/**
 * O QUE: a seção "Últimos desapegos": título, ordenação, chips de categoria
 *        com contador e a grade de cards.
 * POR QUE: é a vitrine pública exigida pelo edital, com filtro básico por
 *          categoria. Contadores saem da lista carregada.
 * CHAMA: landing (app/page.tsx), que é dona do estado.
 * QUEBRA SE: a API mudar o formato da resposta.
 */
export function Vitrine(props: Props) {
  const { anuncios, filtrados, erro, categoria, onCategoria, ordenar, onOrdenar } = props;
  const contagem = (c: string) =>
    (anuncios ?? []).filter((a) => (c === "" ? true : a.categoria === c)).length;

  return (
    <section id="vitrine" className="bg-[#F3F6FC] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-[family-name:var(--font-sora)] text-4xl font-bold text-[#071C3D]">
              Últimos desapegos
            </h2>
            <p className="mt-2 text-[#5A6480]">
              Itens anunciados por alunos da Unifor nas últimas 48 horas.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-[#5A6480]">
            Ordenar por
            <select
              value={ordenar}
              onChange={(e) => onOrdenar(e.target.value)}
              className="rounded-lg border border-[#D9E2F2] bg-white px-3 py-2 text-sm font-medium text-[#071C3D] outline-none"
            >
              <option value="recentes">Mais recentes</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
            </select>
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {["", ...CATEGORIAS].map((c) => {
            const ativo = categoria === c;
            return (
              <button
                key={c || "todos"}
                onClick={() => onCategoria(c)}
                className={
                  ativo
                    ? "flex items-center gap-2 rounded-lg bg-[#0A5CFF] px-4 py-2 text-sm font-semibold text-white"
                    : "flex items-center gap-2 rounded-lg border border-[#D9E2F2] bg-white px-4 py-2 text-sm font-medium text-[#071C3D] transition-colors hover:border-[#0A5CFF]"
                }
              >
                {c === "" ? "Todos" : c}
                <span
                  className={
                    ativo
                      ? "rounded bg-white/25 px-1.5 text-xs font-bold"
                      : "text-xs text-[#8DA2C0]"
                  }
                >
                  {contagem(c)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          {erro && (
            <p className="rounded-xl bg-amber-100 p-4 text-sm text-amber-900">{erro}</p>
          )}
          {!erro && anuncios === null && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-2xl bg-white" />
              ))}
            </div>
          )}
          {!erro && anuncios !== null && filtrados.length === 0 && (
            <p className="rounded-xl bg-white p-6 text-center text-sm text-[#5A6480]">
              Nenhum anúncio nessa busca ainda. Seja a primeira pessoa a desapegar!
            </p>
          )}
          {!erro && filtrados.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filtrados.map((a) => (
                <CardAnuncio key={a.id} anuncio={a} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
