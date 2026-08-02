"use client";

import { useEffect, useState } from "react";
import { BloquearScroll } from "@/components/BloquearScroll";
import { useSaidaAnimada } from "@/components/useSaidaAnimada";

/**
 * O QUE: popup de aviso legal do site: projeto acadêmico do processo
 *        seletivo, sem vínculo oficial com a universidade, dados
 *        fictícios, e remoção de marca sob solicitação.
 * POR QUE: o site usa nome e referências da Unifor como contexto do
 *          exercício; o aviso deixa a natureza do projeto explícita.
 * CHAMA: layout raiz: toda visita vê o aviso, em qualquer página de
 *        entrada, uma vez por sessão do navegador (sessionStorage).
 * QUEBRA SE: nada; sem sessionStorage ele só aparece de novo.
 */
export function AvisoLegal() {
  const [aberto, setAberto] = useState(false);
  const { saindo, fecharCom } = useSaidaAnimada();

  useEffect(() => {
    if (sessionStorage.getItem("desapega-aviso-visto")) return;
    const id = requestAnimationFrame(() => setAberto(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function fechar() {
    sessionStorage.setItem("desapega-aviso-visto", "1");
    fecharCom(() => setAberto(false));
  }

  if (!aberto) return null;

  return (
    <div
      className={"aviso-overlay" + (saindo ? " is-saindo" : "")}
      role="dialog"
      aria-modal="true"
      aria-label="Aviso legal"
    >
      <BloquearScroll />
      <div className="aviso-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mark-blue.svg" alt="" style={{ height: 40 }} />
        <h2 className="aviso-titulo">Aviso importante</h2>
        <p className="aviso-p">
          Este site é um projeto acadêmico, criado exclusivamente como parte
          do processo seletivo do laboratório{" "}
          <a href="https://vortex.unifor.br/" target="_blank" rel="noopener noreferrer">
            <b>VORTEX</b>
          </a>
          . Ele não tem vínculo oficial com a Universidade de Fortaleza.
        </p>
        <p className="aviso-p">
          Apesar de ter nascido como exercício, a plataforma funciona de
          verdade: dá pra criar conta, anunciar itens e encontrar quem quer
          comprar, vender ou doar dentro do campus. Os itens que já aparecem
          na vitrine são de demonstração.
        </p>
        <p className="aviso-p">
          O nome, as cores e as referências à universidade aparecem pra dar
          contexto ao exercício. Logo, nome, domínio e qualquer elemento
          associado à Unifor podem ser removidos de imediato mediante simples
          solicitação.
        </p>
        <p className="aviso-mini">Contato: pedrocauaggn@gmail.com</p>
        <button className="btn btn-primary btn-block" onClick={fechar}>
          Entendi, continuar
        </button>
      </div>
    </div>
  );
}
