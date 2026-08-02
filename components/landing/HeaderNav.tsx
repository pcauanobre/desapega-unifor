"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeaderBusca } from "@/components/landing/HeaderBusca";

/**
 * O QUE: o header azul com busca pra páginas que NÃO são a vitrine
 *        (LP, produto, ajuda...). Buscar aqui navega pra /produtos
 *        levando categoria e termo na URL.
 * POR QUE: a vitrine filtra no lugar; as outras páginas mandam pra lá.
 *          Um componente só pra não duplicar esse estado em cada página.
 * CHAMA: LP, /produtos/[id] e páginas informativas.
 * QUEBRA SE: /produtos parar de ler ?categoria= e ?q=.
 */
export function HeaderNav() {
  const router = useRouter();
  const [categoria, setCategoria] = useState("");
  const [busca, setBusca] = useState("");

  function irPraBusca(categoriaEscolhida?: string) {
    const cat = categoriaEscolhida ?? categoria;
    const params = new URLSearchParams();
    if (cat) params.set("categoria", cat);
    if (busca.trim()) params.set("q", busca.trim());
    const query = params.toString();
    router.push(query ? `/produtos?${query}` : "/produtos");
  }

  return (
    <HeaderBusca
      categoria={categoria}
      busca={busca}
      onCategoria={setCategoria}
      onBusca={setBusca}
      onBuscar={irPraBusca}
    />
  );
}
