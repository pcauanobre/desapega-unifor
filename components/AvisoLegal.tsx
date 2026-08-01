"use client";

import { useEffect, useState } from "react";

/**
 * O QUE: popup de aviso legal da LP: projeto acadêmico do processo
 *        seletivo, sem vínculo oficial com a universidade, dados
 *        fictícios, e remoção de marca sob solicitação.
 * POR QUE: o site usa nome e referências da Unifor como contexto do
 *          exercício; o aviso deixa a natureza do projeto explícita.
 * CHAMA: LP (app/page.tsx). Aparece uma vez por navegador (localStorage).
 * QUEBRA SE: nada; sem localStorage ele só aparece de novo.
 */
export function AvisoLegal() {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("desapega-aviso-visto")) return;
    const id = requestAnimationFrame(() => setAberto(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function fechar() {
    localStorage.setItem("desapega-aviso-visto", "1");
    setAberto(false);
  }

  if (!aberto) return null;

  return (
    <div className="aviso-overlay" role="dialog" aria-modal="true" aria-label="Aviso legal">
      <div className="aviso-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mark-blue.svg" alt="" style={{ height: 40 }} />
        <h2 className="aviso-titulo">Aviso importante</h2>
        <p className="aviso-p">
          Este site é um projeto acadêmico, criado exclusivamente como parte
          do processo seletivo do laboratório VORTEX. Ele não tem vínculo
          oficial com a Universidade de Fortaleza.
        </p>
        <p className="aviso-p">
          O nome, as cores e as referências à universidade aparecem apenas pra
          dar contexto realista ao exercício. Os anúncios são fictícios e
          nenhuma transação real acontece por aqui.
        </p>
        <p className="aviso-p">
          Logo, nome, domínio e qualquer elemento associado à Unifor podem ser
          removidos de imediato mediante simples solicitação.
        </p>
        <p className="aviso-mini">Contato: pedrocauaggn@gmail.com</p>
        <button className="btn btn-primary btn-block" onClick={fechar}>
          Entendi, continuar
        </button>
      </div>
    </div>
  );
}
