"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Brand } from "@/components/Brand";
import { CATEGORIAS } from "@/lib/categorias";
import { Droplist } from "@/components/Droplist";
import { useSaidaAnimada } from "@/components/useSaidaAnimada";

type Props = {
  categoria: string;
  busca: string;
  onCategoria: (v: string) => void;
  onBusca: (v: string) => void;
  /* No toque numa tag o estado do caller ainda não virou; a categoria
     escolhida vai por parâmetro pra busca sair certa na hora. */
  onBuscar: (categoriaEscolhida?: string) => void;
};

/**
 * O QUE: o header azul do design: marca, busca com categoria acoplada e os
 *        CTAs "Quero anunciar" / "Quero buscar". No mobile a busca é
 *        imersiva: focar o campo escurece o fundo, sobe o input e mostra
 *        as categorias como tags.
 * POR QUE: markup idêntico ao código fonte; a diferença é que aqui a busca
 *          controla o filtro real da vitrine.
 * CHAMA: landing (app/page.tsx).
 * QUEBRA SE: as classes .header/.search/.busca-* do design.css mudarem.
 */
export function HeaderBusca({ categoria, busca, onCategoria, onBusca, onBuscar }: Props) {
  // getSession lê do armazenamento local (sem rede): o rótulo certo chega
  // junto com o primeiro paint do header, sem piscar nem sumir botão.
  const [logado, setLogado] = useState(false);
  const [focada, setFocada] = useState(false);
  const { saindo, fecharCom } = useSaidaAnimada();
  const pathname = usePathname();

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data }) => setLogado(Boolean(data.session)));
  }, []);

  function fecharBusca() {
    fecharCom(() => setFocada(false));
  }

  function buscarPorTag(c: string) {
    onCategoria(c);
    onBuscar(c);
    fecharBusca();
  }

  useEffect(() => {
    if (!focada) return;
    function tecla(e: KeyboardEvent) {
      if (e.key === "Escape") fecharBusca();
    }
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focada]);

  return (
    <header className="header">
      <div className="container header-inner">
        <Brand />

        {focada && (
          <div
            className={"busca-veu" + (saindo ? " is-saindo" : "")}
            onClick={fecharBusca}
          />
        )}
        <form
          className={"search" + (focada ? " focada" : "") + (saindo ? " is-saindo" : "")}
          onSubmit={(e) => {
            e.preventDefault();
            onBuscar();
            if (focada) fecharBusca();
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
            onFocus={() => setFocada(true)}
          />
          <button className="search-btn" type="submit">
            <span className="search-icon">⌕</span>Buscar
          </button>
        </form>

        {focada && (
          <div className={"busca-tags" + (saindo ? " is-saindo" : "")}>
            <p className="busca-tags-t">BUSCAR POR CATEGORIA</p>
            <div className="busca-tags-lista">
              <button type="button" className="busca-tag" onClick={() => buscarPorTag("")}>
                Todas
              </button>
              {CATEGORIAS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="busca-tag"
                  onClick={() => buscarPorTag(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="header-actions">
          {/* já tá na central? o botão de ir pra ela não faz sentido */}
          {pathname !== "/anunciar" && (
            <Link className="btn btn-white" href="/anunciar">
              {logado ? "Central de Anúncios" : "Quero anunciar"}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
