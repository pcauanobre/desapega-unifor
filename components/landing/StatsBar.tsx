/**
 * O QUE: a faixa branca de estatísticas simuladas, markup do design.
 * POR QUE: o edital pede estatísticas simuladas na landing. Números
 *          fictícios de propósito, num lugar só.
 * CHAMA: landing (app/page.tsx).
 * QUEBRA SE: nada; é estática.
 */
export function StatsBar() {
  return (
    <div className="statsbar">
      <div className="container statsbar-inner">
        <span>
          <strong>64</strong> itens circulando
        </span>
        <span className="statsbar-sep" />
        <span>
          <strong className="green">19</strong> doações
        </span>
        <span className="statsbar-sep" />
        <span>
          <strong>142</strong> alunos
        </span>
        <span className="statsbar-sep" />
        <span>
          <strong>R$ 4,7 mil</strong> economizados
        </span>
      </div>
    </div>
  );
}
