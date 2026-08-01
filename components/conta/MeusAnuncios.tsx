"use client";

import { useEffect, useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import type { Anuncio } from "@/lib/tipos";
import { CardAnuncio } from "@/components/CardAnuncio";

/**
 * O QUE: a grade "meus anúncios" da conta, com excluir em cada card.
 * POR QUE: quem vendeu ou doou tira o item do ar na hora, direto da conta.
 * CHAMA: /conta.
 * QUEBRA SE: a API mudar GET ?autor=me ou o DELETE por id.
 */
export function MeusAnuncios() {
  const [anuncios, setAnuncios] = useState<Anuncio[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [apagando, setApagando] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/anuncios?autor=me")
      .then(async (r) => {
        const corpo = await r.json();
        if (!r.ok) throw new Error(corpo.erro ?? "erro ao listar");
        setAnuncios(corpo.anuncios);
      })
      .catch((e: Error) => setErro(e.message));
  }, []);

  async function excluir(id: string) {
    if (apagando) return;
    setApagando(id);
    const r = await fetch(`/api/anuncios/${id}`, { method: "DELETE" });
    setApagando(null);
    if (r.ok) setAnuncios((atuais) => (atuais ?? []).filter((a) => a.id !== id));
  }

  if (erro) return <p className="shelf-sub">{erro}</p>;
  if (anuncios === null) return <p className="shelf-sub">Carregando teus anúncios…</p>;
  if (anuncios.length === 0)
    return <p className="shelf-sub">Tu ainda não anunciou nada. Bora desapegar?</p>;

  return (
    <div className="grid ct-grid">
      {anuncios.map((a) => (
        <div className="ct-item" key={a.id}>
          <CardAnuncio anuncio={a} />
          <button
            className="btn ct-excluir"
            onClick={() => excluir(a.id)}
            disabled={apagando === a.id}
          >
            <DeleteOutlineIcon sx={{ fontSize: 17 }} />
            {apagando === a.id ? "Excluindo…" : "Excluir anúncio"}
          </button>
        </div>
      ))}
    </div>
  );
}
