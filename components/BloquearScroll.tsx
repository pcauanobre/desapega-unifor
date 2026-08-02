"use client";

import { useEffect } from "react";

/**
 * O QUE: trava a rolagem da página enquanto estiver montado.
 * POR QUE: popup aberto com fundo rolando é desorientador; renderiza este
 *          componente dentro de qualquer overlay e o fundo congela.
 * CHAMA: popups de aviso, anúncio publicado, perfil completo e confirmação.
 * QUEBRA SE: nada; ao desmontar devolve o scroll como estava.
 */
export function BloquearScroll() {
  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, []);
  return null;
}
