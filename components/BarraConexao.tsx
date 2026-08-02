"use client";

import { useEffect, useState } from "react";

/**
 * O QUE: a linha de conexão no topo: vermelha enquanto estiver offline,
 *        verde com "Conectado novamente" na volta, sumindo após 2s.
 * POR QUE: com o cache offline o app continua funcionando sem internet;
 *          sem um aviso, a pessoa nem percebe que tá vendo dado guardado.
 * CHAMA: layout raiz, vale pro site e pro app instalado.
 * QUEBRA SE: nada; browsers sem os eventos online/offline só não mostram.
 */
export function BarraConexao() {
  const [estado, setEstado] = useState<"off" | "voltou" | null>(null);

  useEffect(() => {
    function caiu() {
      setEstado("off");
    }
    function voltou() {
      setEstado("voltou");
      setTimeout(() => {
        setEstado((atual) => (atual === "voltou" ? null : atual));
      }, 2000);
    }
    window.addEventListener("offline", caiu);
    window.addEventListener("online", voltou);
    // Já abriu sem internet? A linha aparece de cara (fora do corpo do
    // efeito pra não disparar render em cascata na montagem).
    const inicial = setTimeout(() => {
      if (!navigator.onLine) setEstado("off");
    }, 0);
    return () => {
      window.removeEventListener("offline", caiu);
      window.removeEventListener("online", voltou);
      clearTimeout(inicial);
    };
  }, []);

  if (!estado) return null;
  return (
    <div className={"conexao " + (estado === "off" ? "conexao-off" : "conexao-on")}>
      {estado === "off" ? "Sem conexão. Mostrando a última versão vista." : "Conectado novamente"}
    </div>
  );
}
