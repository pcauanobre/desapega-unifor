"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

/**
 * O QUE: a barra utilitária navy do topo. Mostra "Entrar" pra visitante e
 *        "Minha conta" pra quem tá logado.
 * POR QUE: o site inteiro precisa de um caminho óbvio pra conta.
 * CHAMA: todas as páginas desktop.
 * QUEBRA SE: as classes .utilbar-* do design.css mudarem.
 */
export function TopBar() {
  const [logado, setLogado] = useState<boolean | null>(null);

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data }) => setLogado(Boolean(data.session)));
  }, []);

  return (
    <div className="utilbar">
      <div className="container utilbar-inner">
        <div className="row gap-8">
          <span className="mono utilbar-tag">CAMPUS</span>
          <span>Universidade de Fortaleza, Ceará</span>
        </div>
        <div className="row gap-22">
          <Link href="/regras">Regras do desapego</Link>
          {logado ? (
            <Link href="/conta" className="utilbar-login">
              Minha conta
            </Link>
          ) : (
            <Link href="/entrar" className="utilbar-login">
              Entrar
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
