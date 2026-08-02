"use client";

import { useEffect, useRef, useState } from "react";

/* Números simulados, mas só de coisas que o sistema consegue medir de
   verdade: contagem de anúncios, doações, contas e cliques registrados. */
const DADOS = [
  { ate: 64, rotulo: "itens circulando" },
  { ate: 19, rotulo: "doações", verde: true },
  { ate: 142, rotulo: "alunos cadastrados" },
  { ate: 816, rotulo: "cliques nos anúncios" },
];

/**
 * O QUE: a faixa branca de estatísticas com contadores que sobem do zero
 *        até o valor quando a faixa entra na tela.
 * POR QUE: o edital pede estatísticas simuladas na landing; o count-up
 *          dá vida sem inventar métrica que o sistema não teria como saber.
 * CHAMA: landing (app/page.tsx).
 * QUEBRA SE: nada; sem observer os números só aparecem direto.
 */
export function StatsBar() {
  return (
    <div className="statsbar">
      <div className="container statsbar-inner">
        {DADOS.map((d, i) => (
          <span key={d.rotulo} style={{ display: "contents" }}>
            {i > 0 && <span className="statsbar-sep" />}
            <span>
              <Contador ate={d.ate} verde={d.verde} /> {d.rotulo}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* Conta de 0 até o alvo em ~1.3s com desaceleração no final, uma vez só. */
function Contador({ ate, verde }: { ate: number; verde?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const [valor, setValor] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let quadro = 0;
    const obs = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        obs.disconnect();
        const inicio = performance.now();
        const DURACAO = 1300;
        function passo(agora: number) {
          const t = Math.min(1, (agora - inicio) / DURACAO);
          const suave = 1 - Math.pow(1 - t, 3);
          setValor(Math.round(ate * suave));
          if (t < 1) quadro = requestAnimationFrame(passo);
        }
        quadro = requestAnimationFrame(passo);
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(quadro);
    };
  }, [ate]);

  return (
    <strong ref={ref} className={verde ? "green" : undefined}>
      {valor.toLocaleString("pt-BR")}
    </strong>
  );
}
