"use client";

import Link from "next/link";
import SearchIcon from "@mui/icons-material/Search";
import { Logo } from "@/components/Logo";
import { CATEGORIAS } from "@/lib/categorias";

type Props = {
  categoria: string;
  busca: string;
  onCategoria: (v: string) => void;
  onBusca: (v: string) => void;
};

/**
 * O QUE: o header azul da landing: marca, busca com seletor de categoria
 *        acoplado (estilo portal da universidade) e os dois CTAs.
 * POR QUE: é a peça central do design. A busca controla o filtro da
 *          vitrine na mesma página, então só recebe e emite estado.
 * CHAMA: landing (app/page.tsx).
 * QUEBRA SE: a lista de categorias mudar de formato.
 */
export function HeaderBusca({ categoria, busca, onCategoria, onBusca }: Props) {
  return (
    <header className="bg-[#0A5CFF] px-6 py-5">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6">
        <Logo fundo="azul" simboloAltura={46} />

        <form
          className="flex min-w-0 flex-1 overflow-hidden rounded-lg bg-white"
          onSubmit={(e) => {
            e.preventDefault();
            document.getElementById("vitrine")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <select
            value={categoria}
            onChange={(e) => onCategoria(e.target.value)}
            className="border-r border-neutral-200 bg-white px-3 py-3 text-sm text-[#071C3D] outline-none"
            aria-label="Categoria"
          >
            <option value="">Todas as categorias</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            value={busca}
            onChange={(e) => onBusca(e.target.value)}
            placeholder="Buscar item"
            className="min-w-0 flex-1 px-4 py-3 text-sm text-[#071C3D] outline-none placeholder:text-neutral-400"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 bg-[#071C3D] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0B2B5C]"
          >
            <SearchIcon sx={{ fontSize: 18 }} />
            Buscar
          </button>
        </form>

        <div className="flex gap-3">
          <Link
            href="/app"
            className="rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#0A5CFF] transition-transform hover:scale-[1.02]"
          >
            Quero anunciar
          </Link>
          <a
            href="#vitrine"
            className="rounded-lg border border-white/70 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            Quero buscar
          </a>
        </div>
      </div>
    </header>
  );
}
