import Link from "next/link";
import { TopBar } from "@/components/landing/TopBar";
import { HeaderNav } from "@/components/landing/HeaderNav";
import { Rodape } from "@/components/landing/Rodape";

const DICAS = [
  {
    t: "Combine em lugar movimentado",
    d: "Praça central, entrada dos blocos, biblioteca. Horário de aula é o melhor: campus cheio, troca rápida.",
  },
  {
    t: "Confira o item antes de pagar",
    d: "Ligue o eletrônico, folheie o livro, teste a calculadora. Pagamento só depois de ver que tá tudo certo.",
  },
  {
    t: "Nada de pagamento antecipado",
    d: "Sinal, reserva paga e transferência antes da entrega não fazem parte do jogo. Item na mão, aí sim.",
  },
  {
    t: "Conversa fica no WhatsApp",
    d: "O contato do anúncio é o canal oficial. Combinados por lá ficam registrados se precisar comprovar algo.",
  },
  {
    t: "Desconfiou? Recue",
    d: "Preço bom demais, pressa excessiva ou mudança de local na última hora são sinais. Cancele sem culpa.",
  },
  {
    t: "Viu abuso? Avise a gente",
    d: "Anúncio fora das regras ou comportamento estranho: mande pro email da central que a gente olha.",
  },
];

/**
 * O QUE: dicas de segurança pras trocas dentro do campus.
 * POR QUE: rota do link "Segurança nas trocas" do footer.
 * CHAMA: TopBar e footer.
 * QUEBRA SE: nada; é estática.
 */
export default function Seguranca() {
  return (
    <div className="pagina-1280 flex-1">
      <TopBar />
      <HeaderNav />
      <main className="container info-wrap">
        <span className="info-kicker">SEGURANÇA</span>
        <h1 className="info-title">Trocas seguras no campus</h1>
        <p className="info-sub">
          O Desapega aproxima as pessoas, e a troca em si é por conta de vocês.
          Seis hábitos que deixam tudo tranquilo.
        </p>
        <div className="info-bloco">
          {DICAS.map(({ t, d }, i) => (
            <div key={t} className="regra">
              <span className="regra-num">{i + 1}</span>
              <span>
                <b>{t}</b>
                <p>{d}</p>
              </span>
            </div>
          ))}
        </div>
        <div className="info-cta">
          <Link className="btn btn-hero" href="/produtos">Ver os desapegos</Link>
          <Link className="btn btn-hero-ghost" href="/ajuda">Central de ajuda</Link>
        </div>
      </main>
      <Rodape />
    </div>
  );
}
