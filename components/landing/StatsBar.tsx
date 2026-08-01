const ESTATISTICAS = [
  { numero: "347", rotulo: "itens circulando", cor: "text-[#071C3D]" },
  { numero: "112", rotulo: "doações", cor: "text-[#0B7C57]" },
  { numero: "580", rotulo: "alunos", cor: "text-[#071C3D]" },
  { numero: "R$ 21 mil", rotulo: "economizados", cor: "text-[#071C3D]" },
];

/**
 * O QUE: a faixa branca de estatísticas simuladas do sistema.
 * POR QUE: o edital pede estatísticas simuladas na landing; os números são
 *          fictícios de propósito e ficam num lugar só pra ajustar fácil.
 * CHAMA: landing (app/page.tsx).
 * QUEBRA SE: nada; é estática.
 */
export function StatsBar() {
  return (
    <div className="border-b border-[#EDF1F8] bg-white px-6 py-4">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-10 gap-y-2">
        {ESTATISTICAS.map((e, i) => (
          <p key={e.rotulo} className={i > 0 ? "border-l border-[#EDF1F8] pl-10" : ""}>
            <span className={`font-[family-name:var(--font-sora)] font-bold ${e.cor}`}>
              {e.numero}
            </span>{" "}
            <span className="text-sm text-[#5A6480]">{e.rotulo}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
