import type { Anuncio } from "@/lib/tipos";
import { tempoRelativo } from "@/lib/tempo";

/**
 * O QUE: o card de anúncio da vitrine, no layout do design: foto com badge
 *        de estado, categoria em caixa alta, título, autor + tempo, e preço
 *        ou tag de DOAÇÃO.
 * POR QUE: um card só pra landing e pro app mobile, mesma cara em tudo.
 * CHAMA: vitrine da landing e feed do /app.
 * QUEBRA SE: o tipo Anuncio mudar sem atualizar aqui.
 */
export function CardAnuncio({ anuncio }: { anuncio: Anuncio }) {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-44 bg-[repeating-linear-gradient(45deg,#E8EEF9_0,#E8EEF9_12px,#F3F7FD_12px,#F3F7FD_24px)]">
        {anuncio.imagem_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={anuncio.imagem_url}
            alt={anuncio.titulo}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <p className="flex h-full items-center justify-center font-mono text-xs text-[#8DA2C0]">
            foto · {anuncio.titulo.toLowerCase().slice(0, 24)}
          </p>
        )}
        {anuncio.estado && (
          <span className="absolute left-3 top-3 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-[#071C3D] shadow-sm">
            {anuncio.estado}
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8DA2C0]">
          {anuncio.categoria}
        </p>
        <h3 className="mt-1 line-clamp-2 font-[family-name:var(--font-sora)] text-[17px] font-bold leading-snug text-[#071C3D]">
          {anuncio.titulo}
        </h3>

        <div className="mt-3 flex items-end justify-between gap-2 border-t border-[#EDF1F8] pt-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[#071C3D]">
              {anuncio.autor_nome}
            </p>
            <p className="text-xs text-[#8DA2C0]">
              {tempoRelativo(anuncio.created_at)}
            </p>
          </div>
          {anuncio.is_doacao ? (
            <span className="rounded-lg bg-[#E6F7F0] px-3 py-1.5 text-xs font-bold tracking-wide text-[#0B7C57]">
              DOAÇÃO
            </span>
          ) : (
            <p className="whitespace-nowrap font-[family-name:var(--font-sora)] text-xl font-bold text-[#0A5CFF]">
              R$ {formatarPreco(anuncio.preco)}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

/* Preço inteiro sem centavos ("R$ 45"), com centavos só quando existem. */
function formatarPreco(preco: number | null): string {
  const n = Number(preco ?? 0);
  return Number.isInteger(n)
    ? String(n)
    : n.toFixed(2).replace(".", ",");
}
