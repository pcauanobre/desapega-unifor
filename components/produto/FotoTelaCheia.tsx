"use client";

import { useEffect, useRef, useState } from "react";
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

/**
 * O QUE: visualizador de foto em tela cheia: fundo escuro, foto no centro,
 *        setas, miniaturas, teclado e swipe. Fecha no X, no Esc ou no fundo.
 * POR QUE: no card a foto é pequena e cortada; quem vai comprar quer ver o
 *          item de perto antes de chamar no WhatsApp.
 * CHAMA: CardAnuncio (lupa) e Carrossel (foto grande do produto).
 * QUEBRA SE: nada. Detalhe importante: o conteúdo é montado por PORTAL no
 *            body. Sem isso, `position: fixed` se ancora no ancestral que
 *            tem transform (o card tem animação de entrada) e o overlay
 *            fica presoo dentro do card em vez de cobrir a tela.
 */
export function FotoTelaCheia({ fotos, titulo, inicial, onFechar }: Props) {
  const [atual, setAtual] = useState(inicial);
  const toqueX = useRef<number | null>(null);
  /* O portal precisa do document, que não existe no servidor: só depois
     que o efeito rodou (ou seja, já no navegador) é que ele monta. */
  const [destino, setDestino] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setDestino(document.body);
  }, []);

  useEffect(() => {
    function tecla(e: KeyboardEvent) {
      if (e.key === "Escape") onFechar();
      if (e.key === "ArrowLeft") setAtual((i) => (i - 1 + fotos.length) % fotos.length);
      if (e.key === "ArrowRight") setAtual((i) => (i + 1) % fotos.length);
    }
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [fotos.length, onFechar]);

  if (!destino) return null;

  const anterior = () => setAtual((i) => (i - 1 + fotos.length) % fotos.length);
  const proxima = () => setAtual((i) => (i + 1) % fotos.length);

  return createPortal(
    <div
      className="visor"
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos de ${titulo}`}
      onClick={onFechar}
      onTouchStart={(e) => {
        toqueX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (toqueX.current === null) return;
        const dx = e.changedTouches[0].clientX - toqueX.current;
        if (Math.abs(dx) > 50) (dx > 0 ? anterior : proxima)();
        toqueX.current = null;
      }}
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
          <button className="visor-x" onClick={onFechar} aria-label="Fechar">
            <CloseIcon sx={{ fontSize: 22 }} />
          </button>
        </span>
      </header>

      <figure className="visor-palco" onClick={(e) => e.stopPropagation()}>
        {fotos.length > 1 && (
          <button className="visor-seta esq" onClick={anterior} aria-label="Foto anterior">
            <ChevronLeftIcon sx={{ fontSize: 28 }} />
          </button>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={atual} src={fotos[atual]} alt={`${titulo}, foto ${atual + 1}`} />
        {fotos.length > 1 && (
          <button className="visor-seta dir" onClick={proxima} aria-label="Próxima foto">
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
    destino,
  );
}
