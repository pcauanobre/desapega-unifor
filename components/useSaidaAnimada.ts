"use client";

import { useRef, useState } from "react";

/* Casa com a duração dos keyframes fadeOut/popOut do design.css. */
const DURACAO = 240;

/**
 * O QUE: saída animada de popup: fecharCom() liga a classe "is-saindo" no
 *        overlay e só roda o fechamento de verdade quando a animação acaba.
 * POR QUE: desmontar o overlay direto engole a animação de fechamento.
 * CHAMA: AvisoLegal, FiltrosPopup, EditorFoto e o popup de apagar da conta.
 * QUEBRA SE: a DURACAO descolar dos 240ms do is-saindo no design.css.
 */
export function useSaidaAnimada() {
  const [saindo, setSaindo] = useState(false);
  const agendado = useRef(false);

  /* Clique repetido durante a saída é ignorado (um fechamento por vez). */
  function fecharCom(fechar: () => void) {
    if (agendado.current) return;
    agendado.current = true;
    setSaindo(true);
    setTimeout(() => {
      fechar();
      agendado.current = false;
      setSaindo(false);
    }, DURACAO);
  }

  return { saindo, fecharCom };
}
