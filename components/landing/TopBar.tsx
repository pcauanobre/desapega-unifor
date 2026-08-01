import Link from "next/link";

/**
 * O QUE: a barra preta do topo da landing: campus à esquerda, links de
 *        apoio e "Entrar" à direita.
 * POR QUE: primeiro elemento do design; situa o visitante (é da Unifor).
 * CHAMA: landing (app/page.tsx).
 * QUEBRA SE: nada; é estática.
 */
export function TopBar() {
  return (
    <div className="bg-[#0B0F17] px-6 py-2.5 text-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <p className="text-white/90">
          <span className="mr-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#7FB0FF]">
            Campus
          </span>
          Universidade de Fortaleza, Ceará
        </p>
        <nav className="flex items-center gap-6 text-white/80">
          <a href="#como-funciona" className="transition-colors hover:text-white">
            Ajuda
          </a>
          <a href="#como-funciona" className="transition-colors hover:text-white">
            Regras do desapego
          </a>
          <Link href="/app" className="font-semibold text-white">
            Entrar
          </Link>
        </nav>
      </div>
    </div>
  );
}
