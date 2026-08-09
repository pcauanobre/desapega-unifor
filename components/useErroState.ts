"use client";

import { useCallback, useRef, useState } from "react";

export type ErroToque = { texto: string; tique: number } | null;

/**
 * O QUE: substituto de useState<string|null> pra erro de formulário: toda
 *        chamada com texto ganha um "tique" que sempre incrementa, mesmo
 *        repetindo a mesma mensagem.
 * POR QUE: setState com valor igual ao atual não re-renderiza (bailout do
 *          React), então errar a mesma coisa duas vezes seguidas não
 *          mexia no ErroToast. Com o tique sempre novo, o toast sempre
 *          reconhece como um erro "de novo" e reseta a animação/o timer.
 * CHAMA: qualquer form com estado de erro (ver ErroToast.tsx).
 * QUEBRA SE: nada; a API é a mesma de [erro, setErro] do useState.
 */
export function useErroState(): [ErroToque, (texto: string | null) => void] {
  const contador = useRef(0);
  const [erro, setErroInterno] = useState<ErroToque>(null);

  // identidade estável (useCallback, deps vazias) igual ao setState do
  // useState: sem isso, todo useEffect que usa setErro como dependência
  // reexecutava a cada render (a função mudava de referência sempre)
  const setErro = useCallback((texto: string | null) => {
    if (texto === null) {
      setErroInterno(null);
      return;
    }
    contador.current += 1;
    setErroInterno({ texto, tique: contador.current });
  }, []);

  return [erro, setErro];
}
