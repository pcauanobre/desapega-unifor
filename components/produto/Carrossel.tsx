"use client";

import { useState } from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import { FotoTelaCheia } from "@/components/produto/FotoTelaCheia";

/**
 * O QUE: carrossel de fotos do produto: foto grande com setas, contador
 *        e miniaturas clicáveis. Troca com crossfade (key remonta a img).
 * POR QUE: a página de produto pede galeria bonita; feito à mão pra não
 *          puxar lib de carrossel só pra isso.
 * CHAMA: /produtos/[id].
 * QUEBRA SE: lista de fotos vazia (aí nem renderiza).
 */
export function Carrossel({
  fotos,
  titulo,
  demo = false,
}: {
  fotos: string[];
  titulo: string;
  demo?: boolean;
}) {
  const [atual, setAtual] = useState(0);
  const [cheia, setCheia] = useState(false);
  if (fotos.length === 0) return null;

  const anterior = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAtual((atual - 1 + fotos.length) % fotos.length);
  };
  const proxima = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAtual((atual + 1) % fotos.length);
  };

  return (
    <div>
      {/* a foto grande abre em tela cheia (clique ou Enter) */}
      <div
        className="pd-foto pd-foto-abre"
        role="button"
        tabIndex={0}
        aria-label="Ver foto em tela cheia"
        onClick={() => setCheia(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setCheia(true);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={atual} src={fotos[atual]} alt={`${titulo}, foto ${atual + 1}`} />
        <span className="pd-lupa">
          <ZoomOutMapIcon sx={{ fontSize: 18 }} />
        </span>
        {demo && <span className="card-demo mono">DEMO</span>}
        {fotos.length > 1 && (
          <>
            <button className="pd-seta pd-seta-esq" onClick={anterior} aria-label="Foto anterior">
              <ChevronLeftIcon />
            </button>
            <button className="pd-seta pd-seta-dir" onClick={proxima} aria-label="Próxima foto">
              <ChevronRightIcon />
            </button>
            <span className="pd-conta mono">
              {atual + 1}/{fotos.length}
            </span>
          </>
        )}
      </div>
      {fotos.length > 1 && (
        <div className="pd-thumbs">
          {fotos.map((foto, i) => (
            <button
              key={i}
              className={"pd-thumb" + (i === atual ? " is-active" : "")}
              onClick={() => setAtual(i)}
              aria-label={`Ver foto ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto} alt="" />
            </button>
          ))}
        </div>
      )}

      {cheia && (
        <FotoTelaCheia
          fotos={fotos}
          titulo={titulo}
          inicial={atual}
          onFechar={() => setCheia(false)}
        />
      )}
    </div>
  );
}
