"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { BloquearScroll } from "@/components/BloquearScroll";

type Props = {
  fotos: string[];
  titulo: string;
  inicial: number;
  onFechar: () => void;
};

/* Duração do fade de saída. Precisa bater com o 220ms do .visor.saindo
   no design.css, senão o visor some antes da animação terminar. */
const SAIDA = 220;

/**
 * O QUE: visualizador de foto em tela cheia: fundo escuro, foto no centro,
 *        setas, miniaturas, teclado e swipe. Fecha no X, no Esc, no fundo
 *        ou arrastando pra baixo, sempre com animação de saída.
 * POR QUE: no card a foto é pequena e cortada; quem vai comprar quer ver o
 *          item de perto antes de chamar no WhatsApp.
 * CHAMA: CardAnuncio (lupa) e Carrossel (foto grande do produto).
 * QUEBRA SE: nada. Detalhe importante: o conteúdo é montado por PORTAL no
 *            body. Sem isso, `position: fixed` se ancora no ancestral que
 *            tem transform (o card tem animação de entrada) e o overlay
 *            fica preso dentro do card em vez de cobrir a tela.
 */
export function FotoTelaCheia({ fotos, titulo, inicial, onFechar }: Props) {
  const [atual, setAtual] = useState(inicial);
  const toque = useRef<{ x: number; y: number } | null>(null);
  /* Quanto a foto já desceu enquanto o dedo arrasta (feedback do gesto). */
  const [puxada, setPuxada] = useState(0);
  const [arrastando, setArrastando] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const relogio = useRef<number | null>(null);

  /* Fecha em duas etapas: marca a saída, deixa a animação rodar e só
     então avisa quem abriu. O relógio também barra a segunda chamada,
     pra dois Esc seguidos não agendarem dois onFechar. */
  const fechar = useCallback(
    (arrastado = false) => {
      if (relogio.current) return;
      setArrastando(false);
      setSaindo(true);
      // Fechou arrastando: a foto continua descendo até sair da tela.
      if (arrastado) setPuxada(window.innerHeight);
      relogio.current = window.setTimeout(onFechar, SAIDA);
    },
    [onFechar],
  );

  useEffect(() => {
    function tecla(e: KeyboardEvent) {
      if (e.key === "Escape") fechar();
      if (e.key === "ArrowLeft") setAtual((i) => (i - 1 + fotos.length) % fotos.length);
      if (e.key === "ArrowRight") setAtual((i) => (i + 1) % fotos.length);
    }
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [fotos.length, fechar]);

  useEffect(() => {
    return () => {
      if (relogio.current) clearTimeout(relogio.current);
    };
  }, []);

  /* O portal precisa do document, que não existe na renderização do
     servidor. Na prática o componente só monta depois de um clique, mas
     a checagem mantém a renderização no servidor segura. */
  if (typeof document === "undefined") return null;

  const anterior = () => setAtual((i) => (i - 1 + fotos.length) % fotos.length);
  const proxima = () => setAtual((i) => (i + 1) % fotos.length);

  return createPortal(
    <div
      className={"visor" + (saindo ? " saindo" : "")}
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos de ${titulo}`}
      onClick={() => fechar()}
      onTouchStart={(e) => {
        if (saindo) return;
        toque.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }}
      onTouchMove={(e) => {
        if (!toque.current) return;
        const dy = e.touches[0].clientY - toque.current.y;
        const dx = e.touches[0].clientX - toque.current.x;
        // Só acompanha o dedo se o gesto for claramente pra baixo.
        if (dy > 0 && Math.abs(dy) > Math.abs(dx)) {
          setArrastando(true);
          setPuxada(dy);
        }
      }}
      onTouchEnd={(e) => {
        if (!toque.current) return;
        const dx = e.changedTouches[0].clientX - toque.current.x;
        const dy = e.changedTouches[0].clientY - toque.current.y;
        toque.current = null;

        // Arrastou pra baixo o bastante: fecha (gesto de galeria de celular).
        if (dy > 110 && Math.abs(dy) > Math.abs(dx)) {
          fechar(true);
          return;
        }
        // Soltou antes do limite: a foto volta pelo transition do palco.
        setArrastando(false);
        setPuxada(0);
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
          (dx > 0 ? anterior : proxima)();
        }
      }}
      style={
        arrastando
          ? {
              // some junto com a distância, como no visualizador nativo
              opacity: Math.max(0.35, 1 - puxada / 400),
              transition: "none",
            }
          : undefined
      }
    >
      <BloquearScroll />

      <header className="visor-topo" onClick={(e) => e.stopPropagation()}>
        <span className="visor-titulo">{titulo}</span>
        <span className="visor-direita">
          {fotos.length > 1 && (
            <span className="visor-conta mono">
              {atual + 1} / {fotos.length}
            </span>
          )}
          <button className="visor-x" onClick={() => fechar()} aria-label="Fechar">
            <CloseIcon sx={{ fontSize: 22 }} />
          </button>
        </span>
      </header>

      <figure
        className="visor-palco"
        style={
          puxada > 0
            ? {
                transform: `translateY(${puxada}px) scale(${Math.max(0.8, 1 - puxada / 900)})`,
                transition: arrastando ? "none" : undefined,
              }
            : undefined
        }
      >
        {/* só a imagem e as setas barram o fechamento; o resto da figura é
            área "vazia" no desktop (a foto não preenche tudo) e clicar
            nela tem que fechar igual clicar no fundo */}
        {fotos.length > 1 && (
          <button
            className="visor-seta esq"
            onClick={(e) => {
              e.stopPropagation();
              anterior();
            }}
            aria-label="Foto anterior"
          >
            <ChevronLeftIcon sx={{ fontSize: 28 }} />
          </button>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={atual}
          src={fotos[atual]}
          alt={`${titulo}, foto ${atual + 1}`}
          onClick={(e) => e.stopPropagation()}
        />
        {fotos.length > 1 && (
          <button
            className="visor-seta dir"
            onClick={(e) => {
              e.stopPropagation();
              proxima();
            }}
            aria-label="Próxima foto"
          >
            <ChevronRightIcon sx={{ fontSize: 28 }} />
          </button>
        )}
      </figure>

      {fotos.length > 1 ? (
        <footer className="visor-tiras" onClick={(e) => e.stopPropagation()}>
          {fotos.map((foto, i) => (
            <button
              key={i}
              className={"visor-tira" + (i === atual ? " on" : "")}
              onClick={() => setAtual(i)}
              aria-label={`Ver foto ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto} alt="" />
            </button>
          ))}
        </footer>
      ) : (
        <footer className="visor-tiras" />
      )}
    </div>,
    document.body,
  );
}
