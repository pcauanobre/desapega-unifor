"use client";

import { useEffect } from "react";

/**
 * O QUE: registra o service worker (/sw.js) em produção; em dev faz o
 *        contrário e desregistra qualquer um que tenha ficado pra trás.
 * POR QUE: SW cacheando chunk em dev serve arquivo velho e vira caça-
 *          fantasma; o PWA de verdade se testa com npm run build + start.
 * CHAMA: montado no layout raiz, roda uma vez por carga de página.
 * QUEBRA SE: /sw.js sumir de public/ (o registro falha em silêncio).
 */
export function PwaRegistro() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((registros) => registros.forEach((r) => r.unregister()))
        .catch(() => {});
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
