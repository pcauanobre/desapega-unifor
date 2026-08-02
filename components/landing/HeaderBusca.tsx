"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import TuneIcon from "@mui/icons-material/Tune";
import { createClient } from "@/lib/supabase/client";
import { BotaoInstalar } from "@/components/BotaoInstalar";
import { SaudacaoApp } from "@/components/SaudacaoApp";
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
  /* Só a vitrine passa: ícone de filtros na barra (mobile, após buscar). */
  onFiltros?: () => void;
  filtrosAtivos?: boolean;
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
export function HeaderBusca({
  categoria, busca, onCategoria, onBusca, onBuscar, onFiltros, filtrosAtivos,
}: Props) {
  // getSession lê do armazenamento local (sem rede): o rótulo certo chega
  // junto com o primeiro paint do header, sem piscar nem sumir botão.
  const [logado, setLogado] = useState(false);
  const [focada, setFocada] = useState(false);
  /* Depois da primeira abertura o header fica sem a animação de entrada
     PRA SEMPRE: se ela voltasse, o header inteiro refazia o fade ao fechar. */
  const [jaAbriu, setJaAbriu] = useState(false);
  const [voltando, setVoltando] = useState(false);
  const [tagEscolhida, setTagEscolhida] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const { saindo, fecharCom } = useSaidaAnimada();
  const pathname = usePathname();

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data }) => setLogado(Boolean(data.session)));
  }, []);

  /* FLIP: mede onde a barra está no header, fixa ela no meio da tela e
     anima a viagem entre os dois pontos (a barra literalmente se move). */
  function abrirBusca() {
    if (focada) return;
    const el = formRef.current;
    const antes = el?.getBoundingClientRect();
    setTagEscolhida(categoria);
    setJaAbriu(true);
    setFocada(true);
    requestAnimationFrame(() => {
      const depois = el?.getBoundingClientRect();
      if (!el || !antes || !depois) return;
      el.style.transition = "none";
      el.style.transform =
        `translate(${antes.left - depois.left}px, ${antes.top - depois.top}px)`;
      requestAnimationFrame(() => {
        el.style.transition = "transform 380ms cubic-bezier(.2,.8,.2,1)";
        el.style.transform = "";
      });
    });
  }

  function fecharBusca() {
    fecharCom(() => {
      const el = formRef.current;
      if (el) {
        el.style.transform = "";
        el.style.transition = "";
      }
      setFocada(false);
      /* a barra reaparece no topo com um fade in curto */
      setVoltando(true);
      setTimeout(() => setVoltando(false), 360);
    });
  }

  /* Tag só marca; quem dispara a busca é o Confirmar (ou o Enter). */
  function confirmar() {
    onCategoria(tagEscolhida);
    onBuscar(tagEscolhida);
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

  /* Conta e meus anúncios são abas de gestão: no mobile a busca sai. */
  const semBusca =
    pathname.startsWith("/conta") || pathname.startsWith("/meus-anuncios");

  return (
    <header
      className={
        "header" +
        (focada ? " busca-aberta" : "") +
        (jaAbriu ? " sem-anim" : "") +
        (semBusca ? " sem-busca" : "")
      }
    >
      <div className="container header-inner">
        <Brand />

        {focada && (
          <div
            className={"busca-veu" + (saindo ? " is-saindo" : "")}
            onClick={fecharBusca}
          />
        )}
        <form
          ref={formRef}
          className={
            "search" +
            (focada ? " focada" : "") +
            (saindo ? " is-saindo" : "") +
            (voltando ? " voltando" : "")
          }
          onSubmit={(e) => {
            e.preventDefault();
            // No teclado do celular, Enter só recolhe o teclado; a busca
            // dispara no botão Confirmar. No desktop, Enter busca normal.
            if (focada && window.matchMedia("(max-width: 760px)").matches) {
              (document.activeElement as HTMLElement | null)?.blur();
              return;
            }
            if (focada) confirmar();
            else onBuscar();
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
            onFocus={abrirBusca}
          />
          {onFiltros && (
            <button
              type="button"
              className={"busca-filtros" + (filtrosAtivos ? " ativo" : "")}
              onClick={onFiltros}
              aria-label="Filtros"
            >
              <TuneIcon sx={{ fontSize: 19 }} />
            </button>
          )}
          <button className="search-btn" type="submit">
            <span className="search-icon">⌕</span>Buscar
          </button>
        </form>

        {focada && <span className="busca-lugar" />}

        {focada && (
          <div className={"busca-tags" + (saindo ? " is-saindo" : "")}>
            <p className="busca-tags-t">BUSCAR POR CATEGORIA</p>
            <div className="busca-tags-lista">
              <button
                type="button"
                className={"busca-tag" + (tagEscolhida === "" ? " is-on" : "")}
                onClick={() => setTagEscolhida("")}
              >
                Todas
              </button>
              {CATEGORIAS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={"busca-tag" + (tagEscolhida === c ? " is-on" : "")}
                  onClick={() => setTagEscolhida(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-primary btn-block busca-confirmar"
              onClick={confirmar}
            >
              Confirmar
            </button>
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
      {/* no mobile a utilbar (dona do botão desktop) some; este fica
          ancorado no topo direito do header azul. Dentro do app instalado
          o Instalar não existe e a saudação assume o mesmo canto. */}
      <BotaoInstalar mobile />
      <SaudacaoApp />
    </header>
  );
}
