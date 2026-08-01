import Link from "next/link";
import type { Anuncio } from "@/lib/tipos";
import { tempoRelativo } from "@/lib/tempo";

/**
 * O QUE: o card de anúncio no markup exato do design: foto (ou placeholder
 *        listrado com legenda), badge de estado, categoria em mono, título,
 *        vendedor + tempo, e preço ou tag de DOAÇÃO.
 * POR QUE: um card só pra landing e pro app, fiel ao código fonte.
 * CHAMA: vitrine da landing e feed do /app.
 * QUEBRA SE: as classes .card-* do design.css mudarem.
 */
export function CardAnuncio({ anuncio }: { anuncio: Anuncio }) {
  return (
    <Link className="card" href="/entrar">
      <div className="card-photo">
        {anuncio.imagem_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={anuncio.imagem_url} alt={anuncio.titulo} loading="lazy" />
        ) : (
          <span className="card-photo-label">
            foto · {anuncio.titulo.toLowerCase().slice(0, 28)}
          </span>
        )}
        {anuncio.estado && <span className="card-cond">{anuncio.estado}</span>}
      </div>
      <div className="card-body">
        <div className="card-cat">{anuncio.categoria.toUpperCase()}</div>
        <h3 className="card-title">{anuncio.titulo}</h3>
        <div className="card-foot">
          <span className="card-seller">
            <b>{anuncio.autor_nome}</b>
            <span>{tempoRelativo(anuncio.created_at)}</span>
          </span>
          {anuncio.is_doacao ? (
            <span className="card-donation">DOAÇÃO</span>
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
