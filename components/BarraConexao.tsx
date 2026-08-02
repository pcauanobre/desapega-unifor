"use client";

import { useEffect, useState } from "react";

/**
 * O QUE: a faixa de conexão no topo da página (acima do header, empurrando
 *        o conteúdo): vermelha sem internet, verde na volta, sumindo
 *        depois de 2s. Entra e sai deslizando.
 * POR QUE: com o cache offline o app continua de pé sem rede; sem aviso, a
 *          pessoa não sabe que está vendo dado guardado.
 * CHAMA: layout raiz, antes de tudo, pra ficar acima do header.
 * QUEBRA SE: nada; navegador sem os eventos online/offline não mostra.
 */
export function BarraConexao() {
  const [estado, setEstado] = useState<"off" | "voltou" | null>(null);
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    let timerSumir: ReturnType<typeof setTimeout>;
    let timerFim: ReturnType<typeof setTimeout>;

    function caiu() {
      setSaindo(false);
      setEstado("off");
    }
    function voltou() {
      setSaindo(false);
      setEstado("voltou");
      // 2s no verde, aí recolhe com animação antes de sumir de vez.
      timerSumir = setTimeout(() => setSaindo(true), 2000);
      timerFim = setTimeout(() => {
        setEstado(null);
        setSaindo(false);
      }, 2320);
    }

    window.addEventListener("offline", caiu);
    window.addEventListener("online", voltou);
    // Abriu já sem rede: a faixa aparece de cara (fora do corpo do efeito
    // pra não disparar render em cascata na montagem).
    const inicial = setTimeout(() => {
      if (!navigator.onLine) setEstado("off");
    }, 0);

    return () => {
      window.removeEventListener("offline", caiu);
      window.removeEventListener("online", voltou);
      clearTimeout(inicial);
      clearTimeout(timerSumir);
      clearTimeout(timerFim);
    };
  }, []);

  if (!estado) return null;

  return (
    <div
      className={
        "conexao " +
        (estado === "off" ? "conexao-off" : "conexao-on") +
        (saindo ? " is-saindo" : "")
      }
      role="status"
    >
      {estado === "off"
        ? "Sem conexão disponível, mostrando dados limitados."
        : "Conectado novamente"}
    </div>
  );
}
