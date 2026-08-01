"use client";

import { useState } from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

/**
 * O QUE: carrossel de fotos do produto: foto grande com setas, contador
 *        e miniaturas clicáveis. Troca com crossfade (key remonta a img).
 * POR QUE: a página de produto pede galeria bonita; feito à mão pra não
 *          puxar lib de carrossel só pra isso.
 * CHAMA: /produtos/[id].
 * QUEBRA SE: lista de fotos vazia (aí nem renderiza).
 */
export function Carrossel({ fotos, titulo }: { fotos: string[]; titulo: string }) {
  const [atual, setAtual] = useState(0);
  if (fotos.length === 0) return null;

  const anterior = () => setAtual((atual - 1 + fotos.length) % fotos.length);
  const proxima = () => setAtual((atual + 1) % fotos.length);

  return (
    <div>
      <div className="pd-foto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={atual} src={fotos[atual]} alt={`${titulo}, foto ${atual + 1}`} />
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
    </div>
  );
}
