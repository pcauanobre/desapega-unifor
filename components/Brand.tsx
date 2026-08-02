import Link from "next/link";

/**
 * O QUE: a marca do código fonte do design: símbolo branco + divisor +
 *        "Desapega Unifor" empilhado. Variante pequena pro footer.
 * POR QUE: header e footer usam o mesmo bloco com classes diferentes;
 *          um componente evita divergência.
 * CHAMA: HeaderBusca e Rodape.
 * QUEBRA SE: mark-white.svg sumir de public/ ou as classes .brand-* do
 *            design.css mudarem.
 */
export function Brand({ pequena = false }: { pequena?: boolean }) {
  return (
    <Link className="brand" href="/">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/mark-white.svg"
        alt="Desapega Unifor"
        className={pequena ? "brand-mark brand-mark-sm" : "brand-mark"}
      />
      {!pequena && <span className="brand-divider" />}
      <span className="brand-name">
        <span className={pequena ? "brand-name-1 sm" : "brand-name-1"}>
          Desapega
        </span>
        <span className={pequena ? "brand-name-2 sm alt" : "brand-name-2"}>
          Unifor
        </span>
      </span>
    </Link>
  );
}
