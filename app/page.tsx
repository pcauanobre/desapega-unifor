"use client";

import { useEffect, useMemo, useState } from "react";
import type { Anuncio } from "@/lib/tipos";
import { TopBar } from "@/components/landing/TopBar";
import { HeaderBusca } from "@/components/landing/HeaderBusca";
import { StatsBar } from "@/components/landing/StatsBar";
import { Vitrine } from "@/components/landing/Vitrine";
import { ComoFunciona } from "@/components/landing/ComoFunciona";
import { Rodape } from "@/components/landing/Rodape";

/**
 * O QUE: a landing pública, dona do estado de busca/filtro/ordenação.
 *        Carrega os anúncios uma vez e filtra no cliente.
 * POR QUE: a busca do header e os chips da vitrine mexem na MESMA lista,
 *          então o estado mora aqui em cima e desce por props.
 * CHAMA: rota raiz do site.
 * QUEBRA SE: a API mudar o formato { anuncios: [...] }.
 */
export default function Home() {
  const [anuncios, setAnuncios] = useState<Anuncio[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [categoria, setCategoria] = useState("");
  const [busca, setBusca] = useState("");
  const [ordenar, setOrdenar] = useState("recentes");

  useEffect(() => {
    fetch("/api/anuncios")
      .then(async (r) => {
        const corpo = await r.json();
        if (!r.ok) throw new Error(corpo.erro ?? "erro ao listar");
        setAnuncios(corpo.anuncios);
      })
      .catch((e: Error) => setErro(e.message));
  }, []);

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
    }
    return lista;
  }, [anuncios, categoria, busca, ordenar]);

  return (
    <div className="flex-1">
      <TopBar />
      <HeaderBusca
        categoria={categoria}
        busca={busca}
        onCategoria={setCategoria}
        onBusca={setBusca}
      />
      <StatsBar />
      <Vitrine
        anuncios={anuncios}
        filtrados={filtrados}
        erro={erro}
        categoria={categoria}
        onCategoria={setCategoria}
        ordenar={ordenar}
        onOrdenar={setOrdenar}
      />
      <ComoFunciona />
      <Rodape />
    </div>
  );
}
