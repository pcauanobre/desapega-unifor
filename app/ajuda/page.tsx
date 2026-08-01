import Link from "next/link";
import { TopBar } from "@/components/landing/TopBar";
import { HeaderNav } from "@/components/landing/HeaderNav";
import { Rodape } from "@/components/landing/Rodape";

const PERGUNTAS = [
  {
    q: "Como eu anuncio um item?",
    a: "Cria tua conta com matrícula e senha, clica em Quero anunciar e preenche o formulário: título, descrição, categoria, preço (ou marca como doação) e as fotos. O anúncio entra na vitrine na hora.",
  },
  {
    q: "Precisa pagar alguma coisa?",
    a: "Nada. O Desapega Unifor é um projeto de economia circular entre alunos, sem taxa e sem comissão. O valor combinado é 100% entre quem anuncia e quem compra.",
  },
  {
    q: "Como falo com quem anunciou?",
    a: "Na página do produto, entrando com tua conta, aparece o botão de WhatsApp de quem anunciou. Sem login o contato fica protegido.",
  },
  {
    q: "Onde a entrega acontece?",
    a: "Dentro do campus, de preferência no bloco indicado no anúncio. Combina o horário pelo WhatsApp e prioriza lugares movimentados.",
  },
  {
    q: "Quem pode usar?",
    a: "Alunos com matrícula ativa na Unifor. O cadastro pede matrícula, curso e senha.",
  },
  {
    q: "Vendi ou doei meu item, e agora?",
    a: "Entra em Meus anúncios e exclui o item, assim a vitrine fica sempre atual pra quem tá procurando.",
  },
];

/**
 * O QUE: a central de ajuda: perguntas frequentes em acordeão nativo.
 * POR QUE: rota dos links "Ajuda" e "Central de ajuda". Acordeão com
 *          <details> dispensa JavaScript e anima via CSS.
 * CHAMA: TopBar e footer.
 * QUEBRA SE: nada; é estática.
 */
export default function Ajuda() {
  return (
    <div className="pagina-1280 flex-1">
      <TopBar />
      <HeaderNav />
      <main className="container info-wrap">
        <span className="info-kicker">CENTRAL DE AJUDA</span>
        <h1 className="info-title">Como podemos ajudar?</h1>
        <p className="info-sub">
          As dúvidas mais comuns de quem tá chegando no Desapega. Se a tua não
          estiver aqui, chama no email do rodapé.
        </p>
        <div className="info-bloco">
          {PERGUNTAS.map(({ q, a }) => (
            <details key={q} className="faq-item">
              <summary className="faq-q">{q}</summary>
              <p className="faq-a">{a}</p>
            </details>
          ))}
        </div>
        <div className="info-cta">
          <Link className="btn btn-hero" href="/produtos">Ver os desapegos</Link>
          <Link className="btn btn-hero-ghost" href="/regras">Regras do desapego</Link>
        </div>
      </main>
      <Rodape />
    </div>
  );
}
