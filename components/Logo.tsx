type Props = {
  fundo: "azul" | "branco";
  simboloAltura?: number;
};

/**
 * O QUE: lockup oficial da marca: símbolo (D com casinha) + "Desapega
 *        Unifor" tipografado em Sora, com divisor de 1px e gap de 14px,
 *        conforme o pacote de design.
 * POR QUE: o nome é tipografia, não imagem. Componente único garante a
 *          mesma cor e espaçamento em toda tela.
 * CHAMA: landing, header do app e telas de login.
 * QUEBRA SE: mark-white.svg/mark-blue.svg sumirem de public/ ou a fonte
 *            Sora sair do layout.
 */
export function Logo({ fundo, simboloAltura = 46 }: Props) {
  const noAzul = fundo === "azul";
  return (
    <span className="flex items-center" style={{ gap: 14 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={noAzul ? "/mark-white.svg" : "/mark-blue.svg"}
        alt=""
        style={{ height: simboloAltura }}
      />
      <span
        aria-hidden
        className={
          noAzul ? "w-px self-stretch bg-white/30" : "w-px self-stretch bg-[#071C3D]/15"
        }
      />
      <span className="font-[family-name:var(--font-sora)] leading-tight tracking-[-0.01em]">
        <span
          className={`block text-lg font-bold ${noAzul ? "text-white" : "text-[#0A5CFF]"}`}
        >
          Desapega
        </span>
        <span
          className={`block text-sm font-medium ${noAzul ? "text-[#BFD5FF]" : "text-[#5A6480]"}`}
        >
          Unifor
        </span>
      </span>
    </span>
  );
}
