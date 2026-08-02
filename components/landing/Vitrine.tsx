"use client";

import { useEffect, useRef, useState } from "react";
import TuneIcon from "@mui/icons-material/Tune";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import type { Anuncio } from "@/lib/tipos";
import { CATEGORIAS } from "@/lib/categorias";
import { CardAnuncio } from "@/components/CardAnuncio";
import { Droplist } from "@/components/Droplist";
import { FiltrosPopup, type Filtros } from "@/components/FiltrosPopup";

type Props = {
  anuncios: Anuncio[] | null;
  filtrados: Anuncio[];
  extras: Anuncio[];
  temMais: boolean;
  mostrandoSkeleton: boolean;
  carregandoMais: boolean;
  erro: string | null;
  categoria: string;
  onCategoria: (v: string) => void;
  ordenar: string;
  onOrdenar: (v: string) => void;
  onCarregarMais: () => void;
  tetoPreco: number;
  filtros: Filtros | null;
  onFiltrar: (f: Filtros | null) => void;
  /* contador: cada incremento vindo da barra de busca abre o popup */
  abrirFiltros: number;
};

/**
 * O QUE: a seção "Últimos desapegos" do design: título, ordenar (com "Só
 *        doações"), chips com contador, grid, skeletons com shimmer e o
 *        botão "Carregar mais itens", desabilitado quando tudo que casa
 *        com o filtro já está em vista (temMais=false).
 * POR QUE: idêntica ao código fonte, mas com dados reais da API.
 * CHAMA: /produtos (app/produtos/page.tsx), que é dona do estado.
 * QUEBRA SE: as classes .shelf/.chips/.grid/.sk do design.css mudarem.
 */
export function Vitrine(props: Props) {
  const {
    anuncios, filtrados, extras, temMais, mostrandoSkeleton, carregandoMais,
    erro, categoria, onCategoria, ordenar, onOrdenar, onCarregarMais,
    tetoPreco, filtros, onFiltrar, abrirFiltros,
  } = props;
  const [filtroAberto, setFiltroAberto] = useState(false);
  /* Dica de que os chips rolam (mobile): anima até o primeiro toque. */
  const [dicaRolagem, setDicaRolagem] = useState(true);
  const chipsRef = useRef<HTMLDivElement>(null);
  const animandoDica = useRef(false);

  // A espiadinha é rolagem DE VERDADE (scrollTo suave), não transform:
  // transform deslocava a régua pra fora da caixa e cortava chip no meio.
  // O snap fica desligado só durante o vai-e-volta (senão ele puxa a régua
  // de volta pro encaixe no mesmo instante e a espiadinha morre invisível).
  useEffect(() => {
    if (!dicaRolagem) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const alvo = chipsRef.current;
    if (!alvo) return;

    function espiar() {
      if (!alvo || alvo.scrollWidth <= alvo.clientWidth || alvo.scrollLeft > 1) return;
      animandoDica.current = true;
      alvo.style.scrollSnapType = "none";
      // easing manual: fluido e no ritmo próprio (o smooth nativo é seco)
      rolarSuave(alvo, 52, 540);
      setTimeout(() => rolarSuave(alvo, 0, 540), 820);
      setTimeout(() => {
        alvo.style.scrollSnapType = "";
        animandoDica.current = false;
      }, 1600);
    }

    let intervalo: ReturnType<typeof setInterval> | undefined;
    const inicial = setTimeout(() => {
      espiar();
      intervalo = setInterval(espiar, 3800);
    }, 1200);

    return () => {
      clearTimeout(inicial);
      if (intervalo) clearInterval(intervalo);
      alvo.style.scrollSnapType = "";
    };
  }, [dicaRolagem]);

  // O ícone de filtros da barra de busca (mobile) abre o mesmo popup.
  // Ajuste durante o render (sem efeito): o contador da prop subiu, abre.
  const [pedidoVisto, setPedidoVisto] = useState(0);
  if (abrirFiltros > pedidoVisto) {
    setPedidoVisto(abrirFiltros);
    setFiltroAberto(true);
  }

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
              Itens anunciados por alunos da Unifor.
            </p>
          </div>
          <div className="row gap-10">
            <button
              className={"fx-botao" + (filtros ? " ativo" : "")}
              onClick={() => setFiltroAberto(true)}
            >
              <TuneIcon sx={{ fontSize: 17 }} /> Filtros
            </button>
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
        <div
          ref={chipsRef}
          className="chips"
          /* a dica só morre com gesto REAL (dedo/roda); evento de scroll
             não conta, porque a própria espiadinha e o snap disparam ele */
          onPointerDown={() => setDicaRolagem(false)}
          onWheel={() => setDicaRolagem(false)}
        >
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
            <Skeletons quantos={8} />
          </div>
        ) : lista.length === 0 ? (
          <div className="ma-vazio">
            <span className="ma-vazio-ico">
              <SearchOffIcon sx={{ fontSize: 32 }} />
            </span>
            <h2 className="ma-vazio-t">Nenhum anúncio nessa busca</h2>
            <p className="ma-vazio-p">
              Tente outra categoria, ajuste os filtros ou seja a primeira
              pessoa a desapegar!
            </p>
          </div>
        ) : (
          <div className="grid">
            {lista.map((a, i) => (
              <CardAnuncio
                key={`${i}-${a.id}`}
                anuncio={a}
                /* itens anexados pelo "carregar mais" sobem em onda, um a um */
                atraso={i >= filtrados.length ? (i - filtrados.length) * 65 : 0}
              />
            ))}
          </div>
        )}
        {carregandoMais && (
          <div className="grid" id="skeleton-mais" style={{ marginTop: 22 }}>
            <Skeletons quantos={4} />
          </div>
        )}
        {/* sem resultado (ou com erro) não existe "mais" pra carregar */}
        {!erro && (carregando || lista.length > 0) && (
          <div className="shelf-more">
            <button
              className="btn btn-outline"
              onClick={onCarregarMais}
              disabled={carregandoMais || carregando || !temMais}
            >
              {carregandoMais && <span className="spinner azul" />}
              {carregandoMais ? "Carregando itens…" : "Carregar mais itens"}
            </button>
          </div>
        )}
      </div>

      {filtroAberto && (
        <FiltrosPopup
          teto={tetoPreco}
          atual={filtros}
          onFechar={() => setFiltroAberto(false)}
          onAplicar={(f) => {
            setFiltroAberto(false);
            onFiltrar(f);
          }}
        />
      )}
    </main>
  );
}

/* Rolagem animada com easeInOutQuad: o smooth nativo é rápido e sem
   controle de duração; aqui a espiadinha define o próprio ritmo. */
function rolarSuave(el: HTMLElement, ate: number, ms: number) {
  const de = el.scrollLeft;
  const inicio = performance.now();
  function passo(agora: number) {
    const t = Math.min(1, (agora - inicio) / ms);
    const suave = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    el.scrollLeft = de + (ate - de) * suave;
    if (t < 1) requestAnimationFrame(passo);
  }
  requestAnimationFrame(passo);
}

/* Cards de skeleton com shimmer (8 na carga inicial, 4 no "carregar mais"). */
function Skeletons({ quantos }: { quantos: number }) {
  return (
    <>
      {Array.from({ length: quantos }).map((_, i) => (
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
    </>
  );
}
