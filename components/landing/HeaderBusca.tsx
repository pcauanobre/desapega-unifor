"use client";

import Link from "next/link";
import { Brand } from "@/components/Brand";
import { CATEGORIAS } from "@/lib/categorias";

type Props = {
  categoria: string;
  busca: string;
  onCategoria: (v: string) => void;
  onBusca: (v: string) => void;
  onBuscar: () => void;
};

/**
 * O QUE: o header azul do design: marca, busca com categoria acoplada e os
 *        CTAs "Quero anunciar" / "Quero buscar".
 * POR QUE: markup idêntico ao código fonte; a diferença é que aqui a busca
 *          controla o filtro real da vitrine.
 * CHAMA: landing (app/page.tsx).
 * QUEBRA SE: as classes .header/.search do design.css mudarem.
 */
export function HeaderBusca({ categoria, busca, onCategoria, onBusca, onBuscar }: Props) {
  return (
    <header className="header">
      <div className="container header-inner">
        <Brand />

        <form
          className="search"
          onSubmit={(e) => {
            e.preventDefault();
            onBuscar();
          }}
        >
          <select
            className="search-cat"
            aria-label="Categoria"
            value={categoria}
            onChange={(e) => onCategoria(e.target.value)}
          >
            <option value="">Todas as categorias</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            className="search-input"
            type="text"
            placeholder="Buscar item"
            value={busca}
            onChange={(e) => onBusca(e.target.value)}
          />
          <button className="search-btn" type="submit">
            <span className="search-icon">⌕</span>Buscar
          </button>
        </form>

        <div className="header-actions">
          <Link className="btn btn-white" href="/entrar">
            Quero anunciar
          </Link>
          <a
            className="btn btn-ghost"
            href="#vitrine"
            onClick={(e) => {
              e.preventDefault();
              onBuscar();
            }}
          >
            Quero buscar
          </a>
        </div>
      </div>
    </header>
  );
}
