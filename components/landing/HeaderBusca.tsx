"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Brand } from "@/components/Brand";
import { CATEGORIAS } from "@/lib/categorias";
import { Droplist } from "@/components/Droplist";

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
  // getSession lê do armazenamento local (sem rede): o rótulo certo chega
  // junto com o primeiro paint do header, sem piscar nem sumir botão.
  const [logado, setLogado] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data }) => setLogado(Boolean(data.session)));
  }, []);

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
          <Droplist
            rotuloAria="Categoria"
            variante="busca"
            valor={categoria}
            onMudar={onCategoria}
            opcoes={[
              { valor: "", rotulo: "Todas as categorias" },
              ...CATEGORIAS.map((c) => ({ valor: c, rotulo: c })),
            ]}
          />
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
          <Link className="btn btn-white" href="/anunciar">
            {logado ? "Central de Anúncios" : "Quero anunciar"}
          </Link>
        </div>
      </div>
    </header>
  );
}
