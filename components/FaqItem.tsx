"use client";

import { useState } from "react";

/**
 * O QUE: um item do acordeão de FAQ com abertura E fechamento animados
 *        (altura via grid 0fr→1fr, que transiciona nos dois sentidos).
 * POR QUE: o <details> nativo não anima o fechar de jeito nenhum, e a
 *          animação de abrir só rodava no primeiro clique.
 * CHAMA: FaqSecao da LP e a página /ajuda.
 * QUEBRA SE: as classes .faq-* do design.css mudarem.
 */
export function FaqItem({ q, a }: { q: string; a: string }) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className={"faq-item" + (aberto ? " is-aberto" : "")}>
      <button
        type="button"
        className="faq-q"
        aria-expanded={aberto}
        onClick={() => setAberto(!aberto)}
      >
        {q}
      </button>
      <div className="faq-dobra">
        <p className="faq-a">{a}</p>
      </div>
    </div>
  );
}
