"use client";

import { useEffect, useRef, useState } from "react";
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
 * O QUE: visualizador de foto em tela cheia: fundo escuro, foto inteira,
 *        setas e miniaturas pra passar, contador, fechar no X, no Esc ou
 *        clicando no fundo. No celular passa arrastando o dedo.
 * POR QUE: no card a foto é pequena e cortada; quem vai comprar quer ver
 *          o item de perto antes de chamar no WhatsApp.
 * CHAMA: Carrossel, ao clicar na foto grande ou numa miniatura.
 * QUEBRA SE: nada; sem foto o componente nem é montado.
 */
export function FotoTelaCheia({ fotos, titulo, inicial, onFechar }: Props) {
  const [atual, setAtual] = useState(inicial);
  const toqueX = useRef<number | null>(null);

  const anterior = () => setAtual((i) => (i - 1 + fotos.length) % fotos.length);
  const proxima = () => setAtual((i) => (i + 1) % fotos.length);

  useEffect(() => {
    function tecla(e: KeyboardEvent) {
      if (e.key === "Escape") onFechar();
      if (e.key === "ArrowLeft") anterior();
      if (e.key === "ArrowRight") proxima();
    }
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fotos.length]);

  return (
    <div
      className="fs-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos de ${titulo}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar();
      }}
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

      <button className="fs-fechar" onClick={onFechar} aria-label="Fechar">
        <CloseIcon sx={{ fontSize: 24 }} />
      </button>
      {fotos.length > 1 && (
        <span className="fs-conta mono">
          {atual + 1}/{fotos.length}
        </span>
      )}

      <div className="fs-palco" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={atual} src={fotos[atual]} alt={`${titulo}, foto ${atual + 1}`} />
      </div>

      {fotos.length > 1 && (
        <>
          <button className="fs-seta fs-esq" onClick={anterior} aria-label="Foto anterior">
            <ChevronLeftIcon sx={{ fontSize: 30 }} />
          </button>
          <button className="fs-seta fs-dir" onClick={proxima} aria-label="Próxima foto">
            <ChevronRightIcon sx={{ fontSize: 30 }} />
          </button>
          <div className="fs-thumbs" onClick={(e) => e.stopPropagation()}>
            {fotos.map((foto, i) => (
              <button
                key={i}
                className={"fs-thumb" + (i === atual ? " is-active" : "")}
                onClick={() => setAtual(i)}
                aria-label={`Ver foto ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={foto} alt="" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
