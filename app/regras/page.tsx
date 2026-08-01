import Link from "next/link";
import { TopBar } from "@/components/landing/TopBar";
import { HeaderNav } from "@/components/landing/HeaderNav";
import { Rodape } from "@/components/landing/Rodape";

const REGRAS = [
  {
    t: "Só material de vida universitária",
    d: "Livros, apostilas, calculadoras, eletrônicos, jalecos, móveis de estudo e afins. Nada de item sem relação com o campus, perecível ou de origem duvidosa.",
  },
  {
    t: "Anúncio honesto",
    d: "Foto real, estado de conservação verdadeiro e defeito declarado na descrição. Surpresa boa é achar o item, não descobrir problema depois.",
  },
  {
    t: "Preço justo de desapego",
    d: "A ideia é circular, e o espírito é ajudar quem tá chegando. Revenda comercial e estoque de atravessador não têm vez aqui.",
  },
  {
    t: "Doação tem prioridade de espírito",
    d: "Se o item tá parado e tu não precisa do dinheiro, marca como doação. Calouro agradece e a roda gira mais rápido.",
  },
  {
    t: "Entrega dentro do campus",
    d: "Combina a retirada no bloco indicado, em horário de aula e lugar movimentado. Evita encontro fora da universidade.",
  },
  {
    t: "Respeito sempre",
    d: "Sem pressão, sem spam e sem mensagem fora de hora. Conversa de aluno pra aluno, do jeito que tu gostaria de ser tratado.",
  },
];

/**
 * O QUE: as regras da comunidade, numeradas, no visual do design.
 * POR QUE: rota do link "Regras do desapego" (topo e footer).
 * CHAMA: TopBar e footer.
 * QUEBRA SE: nada; é estática.
 */
export default function Regras() {
  return (
    <div className="pagina-1280 flex-1">
      <TopBar />
      <HeaderNav />
      <main className="container info-wrap">
        <span className="info-kicker">COMUNIDADE</span>
        <h1 className="info-title">Regras do desapego</h1>
        <p className="info-sub">
          Seis combinados simples que mantêm a vitrine útil e as trocas
          tranquilas pra todo mundo.
        </p>
        <div className="info-bloco">
          {REGRAS.map(({ t, d }, i) => (
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
          <Link className="btn btn-hero" href="/anunciar">Quero anunciar</Link>
          <Link className="btn btn-hero-ghost" href="/seguranca">Segurança nas trocas</Link>
        </div>
      </main>
      <Rodape />
    </div>
  );
}
