"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Anuncio } from "@/lib/tipos";
import { TopBar } from "@/components/landing/TopBar";
import { HeaderBusca } from "@/components/landing/HeaderBusca";
import { StatsBar } from "@/components/landing/StatsBar";
import { Vitrine } from "@/components/landing/Vitrine";
import { Rodape } from "@/components/landing/Rodape";

/* Tempos de skeleton do código fonte do design (sensação de app real). */
const DELAY = { filtro: 700, mais: 900 };

/**
 * O QUE: a landing pública no layout do código fonte do design, dona do
 *        estado de busca, filtro e ordenação. Dados reais da API.
 * POR QUE: a busca do header e os chips mexem na MESMA lista; o estado
 *          mora aqui e desce por props. O skeleton nas trocas de filtro
 *          vem do comportamento do próprio design.
 * CHAMA: rota raiz do site.
 * QUEBRA SE: a API mudar o formato { anuncios: [...] }.
 */
export default function Home() {
  const [anuncios, setAnuncios] = useState<Anuncio[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [categoria, setCategoria] = useState("");
  const [busca, setBusca] = useState("");
  const [ordenar, setOrdenar] = useState("recentes");
  const [mostrandoSkeleton, setMostrandoSkeleton] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/anuncios")
      .then(async (r) => {
        const corpo = await r.json();
        if (!r.ok) throw new Error(corpo.erro ?? "erro ao listar");
        setAnuncios(corpo.anuncios);
      })
      .catch((e: Error) => setErro(e.message));
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  /* Mostra o skeleton por um tempo curto e aplica a mudança, como no design. */
  function comSkeleton(ms: number, aplicar: () => void) {
    setMostrandoSkeleton(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      aplicar();
      setMostrandoSkeleton(false);
    }, ms);
  }

  const filtrados = useMemo(() => {
    let lista = anuncios ?? [];
    if (categoria) lista = lista.filter((a) => a.categoria === categoria);
    if (busca.trim()) {
      const termo = busca.trim().toLowerCase();
      lista = lista.filter((a) => a.titulo.toLowerCase().includes(termo));
    }
    if (ordenar === "menor") {
      lista = [...lista].sort((a, b) => (a.preco ?? 0) - (b.preco ?? 0));
    } else if (ordenar === "maior") {
      lista = [...lista].sort((a, b) => (b.preco ?? 0) - (a.preco ?? 0));
    } else if (ordenar === "doacoes") {
      lista = lista.filter((a) => a.is_doacao);
    }
    return lista;
  }, [anuncios, categoria, busca, ordenar]);

  return (
    <div className="pagina-1280 flex-1">
      <TopBar />
      <HeaderBusca
        categoria={categoria}
        busca={busca}
        onCategoria={(c) => comSkeleton(DELAY.filtro, () => setCategoria(c))}
        onBusca={setBusca}
        onBuscar={() =>
          document.getElementById("vitrine")?.scrollIntoView({ behavior: "smooth" })
        }
      />
      <StatsBar />
      <Vitrine
        anuncios={anuncios}
        filtrados={filtrados}
        mostrandoSkeleton={mostrandoSkeleton}
        erro={erro}
        categoria={categoria}
        onCategoria={(c) => comSkeleton(DELAY.filtro, () => setCategoria(c))}
        ordenar={ordenar}
        onOrdenar={setOrdenar}
        onCarregarMais={() => comSkeleton(DELAY.mais, () => undefined)}
      />
      <Rodape />
    </div>
  );
}
