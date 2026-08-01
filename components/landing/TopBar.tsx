import Link from "next/link";

/**
 * O QUE: a barra utilitária navy do topo (campus + links + Entrar),
 *        markup do código fonte do design.
 * POR QUE: situa o visitante: isso aqui é da Unifor.
 * CHAMA: landing (app/page.tsx).
 * QUEBRA SE: as classes .utilbar-* do design.css mudarem.
 */
export function TopBar() {
  return (
    <div className="utilbar">
      <div className="container utilbar-inner">
        <div className="row gap-8">
          <span className="mono utilbar-tag">CAMPUS</span>
          <span>Universidade de Fortaleza, Ceará</span>
        </div>
        <div className="row gap-22">
          <Link href="/ajuda">Ajuda</Link>
          <Link href="/regras">Regras do desapego</Link>
          <Link href="/entrar" className="utilbar-login">
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
