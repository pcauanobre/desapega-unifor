import { PERGUNTAS } from "@/lib/faq";
import { Revelar } from "@/components/Revelar";

/**
 * O QUE: a seção de FAQ do fim da LP: acordeão nativo com as mesmas
 *        perguntas da central de ajuda, revelando em cascata no scroll.
 * POR QUE: dúvida respondida na própria landing segura o visitante que
 *          ainda não confiou o suficiente pra clicar em nada.
 * CHAMA: LP (app/page.tsx). Conteúdo vem de lib/faq.
 * QUEBRA SE: as classes .faq-* do design.css mudarem.
 */
export function FaqSecao() {
  return (
    <section className="faqsec" id="faq">
      <div className="container faqsec-inner">
        <Revelar>
          <span className="info-kicker">FAQ</span>
          <h2 className="shelf-title">Dúvidas frequentes</h2>
          <p className="shelf-sub">O essencial pra começar a desapegar sem medo.</p>
        </Revelar>
        <div className="faqsec-lista">
          {PERGUNTAS.map(({ q, a }, i) => (
            <Revelar key={q} atraso={Math.min(i * 70, 350)}>
              <details className="faq-item">
                <summary className="faq-q">{q}</summary>
                <p className="faq-a">{a}</p>
              </details>
            </Revelar>
          ))}
        </div>
      </div>
    </section>
  );
}
