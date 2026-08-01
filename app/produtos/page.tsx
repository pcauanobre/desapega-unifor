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
 * O QUE: a página de produtos (vitrine completa). Regras de interação:
 *        o dropdown do header só vale ao clicar em Buscar; os chips
 *        filtram na hora; "carregar mais" abre um espaço de skeleton
 *        embaixo, desce até ele e aí os itens aparecem.
 * POR QUE: a rota / virou LP de apresentação; a vitrine cheia mora aqui.
 * CHAMA: CTAs da LP, logo do login e redirect pós-login apontam pra cá.
 * QUEBRA SE: a API mudar o formato { anuncios: [...] }.
 */
export default function Produtos() {
  const [anuncios, setAnuncios] = useState<Anuncio[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [categoria, setCategoria] = useState("");
  const [categoriaHeader, setCategoriaHeader] = useState("");
  const [busca, setBusca] = useState("");
  const [ordenar, setOrdenar] = useState("recentes");
  const [mostrandoSkeleton, setMostrandoSkeleton] = useState(false);
  const [extras, setExtras] = useState<Anuncio[]>([]);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Filtros iniciais vindos da URL (?categoria=&q=&doacoes=), aplicados
    // junto com a chegada dos dados pra não disparar render em cascata.
    const params = new URLSearchParams(window.location.search);
    const categoriaInicial = params.get("categoria") ?? "";
    const buscaInicial = params.get("q") ?? "";
    const soDoacoes = params.get("doacoes") !== null;

    fetch("/api/anuncios")
      .then(async (r) => {
        const corpo = await r.json();
        if (!r.ok) throw new Error(corpo.erro ?? "erro ao listar");
        setAnuncios(corpo.anuncios);
        if (categoriaInicial) {
          setCategoria(categoriaInicial);
          setCategoriaHeader(categoriaInicial);
        }
        if (buscaInicial) setBusca(buscaInicial);
        if (soDoacoes) setOrdenar("doacoes");
      })
      .catch((e: Error) => setErro(e.message));
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  /* Mostra o skeleton por um tempo curto e aplica a mudança, como no design.
     Qualquer filtro novo zera as páginas extras do "carregar mais". */
  function comSkeleton(ms: number, aplicar: () => void) {
    setMostrandoSkeleton(true);
    setCarregandoMais(false);
    setExtras([]);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      aplicar();
      setMostrandoSkeleton(false);
    }, ms);
  }

  /* Chip: filtra na hora (comportamento do design) e sincroniza o dropdown. */
  function filtrarPorChip(c: string) {
    setCategoriaHeader(c);
    comSkeleton(DELAY.filtro, () => setCategoria(c));
  }

  /* Botão Buscar: só aqui a seleção pendente do dropdown passa a valer. */
  function aplicarBusca() {
    comSkeleton(DELAY.filtro, () => setCategoria(categoriaHeader));
    document.getElementById("vitrine")?.scrollIntoView({ behavior: "smooth" });
  }

  /* Carregar mais: abre o espaço de skeleton (a Vitrine desce até ele) e
     depois anexa os itens embaixo dos atuais. */
  function carregarMais() {
    if (carregandoMais || !anuncios) return;
    setCarregandoMais(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setExtras((atuais) => [...atuais, ...anuncios]);
      setCarregandoMais(false);
    }, DELAY.mais);
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
        categoria={categoriaHeader}
        busca={busca}
        onCategoria={setCategoriaHeader}
        onBusca={(v) => {
          setBusca(v);
          setExtras([]);
        }}
        onBuscar={aplicarBusca}
      />
      <StatsBar />
      <Vitrine
        anuncios={anuncios}
        filtrados={filtrados}
        extras={extras}
        mostrandoSkeleton={mostrandoSkeleton}
        carregandoMais={carregandoMais}
        erro={erro}
        categoria={categoria}
        onCategoria={filtrarPorChip}
        ordenar={ordenar}
        onOrdenar={(v) => {
          setOrdenar(v);
          setExtras([]);
        }}
        onCarregarMais={carregarMais}
      />
      <Rodape />
    </div>
  );
}
