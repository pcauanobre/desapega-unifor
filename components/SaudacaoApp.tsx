"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * O QUE: a saudação do app instalado ("Boa noite, Pedro!") no canto do
 *        header, no lugar onde o navegador mostraria o botão de instalar.
 * POR QUE: dentro do app o Instalar não existe mais; o espaço vira um
 *          toque pessoal. Sem conta, fica a saudação sozinha.
 * CHAMA: HeaderBusca. Só renderiza em modo standalone (app instalado).
 * QUEBRA SE: nada; no navegador comum ele simplesmente não aparece.
 */
export function SaudacaoApp() {
  const [texto, setTexto] = useState<string | null>(null);

  useEffect(() => {
    if (!window.matchMedia("(display-mode: standalone)").matches) return;
    const hora = new Date().getHours();
    const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        const nome = (data.session?.user.user_metadata?.nome as string | undefined)
          ?.trim()
          .split(" ")[0];
        setTexto(`${saudacao}${nome ? `, ${nome}` : ""}!`);
      });
  }, []);

  if (!texto) return null;
  return <span className="saudacao-app">{texto}</span>;
}
