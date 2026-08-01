import Link from "next/link";
import { TopBar } from "@/components/landing/TopBar";
import { HeaderNav } from "@/components/landing/HeaderNav";
import { Rodape } from "@/components/landing/Rodape";
import { PERGUNTAS } from "@/lib/faq";
import { FaqItem } from "@/components/FaqItem";

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
          As dúvidas mais comuns de quem tá chegando no Desapega. Se a sua não
          estiver aqui, chame no email do rodapé.
        </p>
        <div className="info-bloco">
          {PERGUNTAS.map(({ q, a }) => (
            <FaqItem key={q} q={q} a={a} />
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
