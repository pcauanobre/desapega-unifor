"use client";

import { useState } from "react";
import Link from "next/link";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PlaceIcon from "@mui/icons-material/Place";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import type { Anuncio } from "@/lib/tipos";
import { quandoPublicado } from "@/lib/tempo";
import { encurtarLocal } from "@/lib/locais";

/**
 * O QUE: o card de anúncio da vitrine com mini-carrossel de fotos (setas
 *        aparecem no hover, sem sair do card), badge de estado, título,
 *        vendedor e a linha de local + quando ("Bloco K | Hoje, 14:18").
 * POR QUE: navegar as fotos direto na vitrine, estilo classificados.
 *          As setas usam preventDefault pra não abrir o anúncio sem querer.
 * CHAMA: vitrine da landing e /produtos.
 * QUEBRA SE: as classes .card-* e .mini-* do design.css mudarem.
 */
export function CardAnuncio({
  anuncio,
  atraso = 0,
}: {
  anuncio: Anuncio;
  atraso?: number;
}) {
  const fotos = anuncio.fotos?.length
    ? anuncio.fotos
    : anuncio.imagem_url
      ? [anuncio.imagem_url]
      : [];
  const [atual, setAtual] = useState(0);

  function trocarFoto(e: React.MouseEvent, delta: number) {
    e.preventDefault();
    e.stopPropagation();
    setAtual((atual + delta + fotos.length) % fotos.length);
  }

  return (
    <Link
      className="card"
      href={`/produtos/${anuncio.id}`}
      style={atraso > 0 ? { animationDelay: `${atraso}ms` } : undefined}
    >
      <div className="card-photo">
        {fotos.length > 0 ? (
          <div
            className="mini-trilho"
            style={{ transform: `translateX(-${atual * 100}%)` }}
          >
            {fotos.map((foto, i) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={i} src={foto} alt={anuncio.titulo} loading="lazy" />
            ))}
          </div>
        ) : (
          <span className="card-photo-label">
            foto · {anuncio.titulo.toLowerCase().slice(0, 28)}
          </span>
        )}
        {anuncio.estado && <span className="card-cond">{anuncio.estado}</span>}
        {fotos.length > 1 && (
          <>
            <button
              className="mini-seta mini-esq"
              onClick={(e) => trocarFoto(e, -1)}
              aria-label="Foto anterior"
            >
              <ChevronLeftIcon sx={{ fontSize: 18 }} />
            </button>
            <button
              className="mini-seta mini-dir"
              onClick={(e) => trocarFoto(e, 1)}
              aria-label="Próxima foto"
            >
              <ChevronRightIcon sx={{ fontSize: 18 }} />
            </button>
            <span className="mini-pontos">
              {fotos.map((_, i) => (
                <span
                  key={i}
                  className={"mini-ponto" + (i === atual ? " ativo" : "")}
                />
              ))}
            </span>
          </>
        )}
      </div>
      <div className="card-body">
        <div className="card-cat">{anuncio.categoria.toUpperCase()}</div>
        <h3 className="card-title">{anuncio.titulo}</h3>
        <div className="card-foot">
          <span className="card-local">
            <PlaceIcon sx={{ fontSize: 16 }} />
            <span className="card-bloco">
              <span className="card-bloco-nome">{encurtarLocal(anuncio.bloco)}</span>
              <span className="sep">|</span>
            </span>
            <span className="quando">{quandoPublicado(anuncio.created_at)}</span>
          </span>
          {anuncio.is_doacao ? (
            <span className="card-doacao-txt">
              <VolunteerActivismIcon sx={{ fontSize: 15 }} />
              Doação
            </span>
          ) : (
            <span className="card-price">{brl(anuncio.preco)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* "R$ 1.250" sem centavos, formato do design (brl em app.js). */
function brl(valor: number | null): string {
  return (
    "R$ " +
    Number(valor ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })
  );
}
