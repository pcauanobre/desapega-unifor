"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Anuncio } from "@/lib/tipos";
import { TopBar } from "@/components/landing/TopBar";
import { HeaderBusca } from "@/components/landing/HeaderBusca";
import { Vitrine } from "@/components/landing/Vitrine";
import { Rodape } from "@/components/landing/Rodape";
import type { Filtros } from "@/components/FiltrosPopup";

/* Skeletons do design + paginação da vitrine (8 de cara, +4 por clique). */
const DELAY = { filtro: 700, mais: 900 };
const PAGINA = { inicial: 8, mais: 4 };

/**
 * O QUE: a página de produtos (vitrine completa). Regras de interação:
 *        o dropdown do header só vale ao clicar em Buscar; os chips
 *        filtram na hora; "carregar mais" revela a próxima página com
 *        skeleton e desabilita quando tudo do filtro já está em vista.
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
  const [filtros, setFiltros] = useState<Filtros | null>(null);
  const [mostrandoSkeleton, setMostrandoSkeleton] = useState(false);
  const [visiveis, setVisiveis] = useState(PAGINA.inicial);
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
     Qualquer filtro novo volta a vitrine pra primeira página. */
  function comSkeleton(ms: number, aplicar: () => void) {
    setMostrandoSkeleton(true);
    setCarregandoMais(false);
    setVisiveis(PAGINA.inicial);
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

  /* Teto do slider de preço: o maior preço da vitrine, arredondado pra
     cima de 50 em 50 (mínimo 100 pra faixa não nascer esmagada). */
  const tetoPreco = useMemo(() => {
    const maior = Math.max(0, ...(anuncios ?? []).map((a) => a.preco ?? 0));
    return Math.max(100, Math.ceil(maior / 50) * 50);
  }, [anuncios]);

  const filtrados = useMemo(() => {
    let lista = anuncios ?? [];
    if (categoria) lista = lista.filter((a) => a.categoria === categoria);
    if (busca.trim()) {
      const termo = busca.trim().toLowerCase();
      lista = lista.filter((a) => a.titulo.toLowerCase().includes(termo));
    }
    if (filtros) {
      const f = filtros;
      lista = lista.filter((a) => {
        if (f.estados.length && (!a.estado || !f.estados.includes(a.estado))) {
          return false;
        }
        if (a.is_doacao) return f.doacoes;
        const p = a.preco ?? 0;
        return p >= f.min && (f.max >= tetoPreco || p <= f.max);
      });
    }
    if (ordenar === "menor") {
      lista = [...lista].sort((a, b) => (a.preco ?? 0) - (b.preco ?? 0));
    } else if (ordenar === "maior") {
      lista = [...lista].sort((a, b) => (b.preco ?? 0) - (a.preco ?? 0));
    } else if (ordenar === "doacoes") {
      lista = lista.filter((a) => a.is_doacao);
    }
    return lista;
  }, [anuncios, categoria, busca, ordenar, filtros, tetoPreco]);

  /* Carregar mais: abre o espaço de skeleton (a Vitrine desce até ele) e
     depois revela a próxima página dos filtrados. */
  function carregarMais() {
    if (carregandoMais || visiveis >= filtrados.length) return;
    setCarregandoMais(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setVisiveis((v) => v + PAGINA.mais);
      setCarregandoMais(false);
    }, DELAY.mais);
  }

  return (
    <div className="pagina-1280 flex-1">
      <TopBar />
      <HeaderBusca
        categoria={categoriaHeader}
        busca={busca}
        onCategoria={setCategoriaHeader}
        onBusca={(v) => {
          setBusca(v);
          setVisiveis(PAGINA.inicial);
        }}
        onBuscar={aplicarBusca}
      />
      <Vitrine
        anuncios={anuncios}
        filtrados={filtrados.slice(0, PAGINA.inicial)}
        extras={filtrados.slice(PAGINA.inicial, visiveis)}
        temMais={visiveis < filtrados.length}
        mostrandoSkeleton={mostrandoSkeleton}
        carregandoMais={carregandoMais}
        erro={erro}
        categoria={categoria}
        onCategoria={filtrarPorChip}
        ordenar={ordenar}
        onOrdenar={(v) => {
          setOrdenar(v);
          setVisiveis(PAGINA.inicial);
        }}
        onCarregarMais={carregarMais}
        tetoPreco={tetoPreco}
        filtros={filtros}
        onFiltrar={(f) => comSkeleton(DELAY.filtro, () => setFiltros(f))}
      />
      <Rodape />
    </div>
  );
}
