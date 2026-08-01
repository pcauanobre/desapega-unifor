import Link from "next/link";
import { TopBar } from "@/components/landing/TopBar";
import { HeaderNav } from "@/components/landing/HeaderNav";
import { Rodape } from "@/components/landing/Rodape";

/**
 * O QUE: a página das doações: explica a tag verde e leva pra vitrine
 *        já filtrada em "Só doações".
 * POR QUE: rota do link "Doações" do footer; doação é o coração da
 *          economia circular do projeto.
 * CHAMA: TopBar e footer. O CTA usa /produtos?doacoes=1.
 * QUEBRA SE: /produtos parar de ler ?doacoes=.
 */
export default function Doacoes() {
  return (
    <div className="pagina-1280 flex-1">
      <TopBar />
      <HeaderNav />
      <main className="container info-wrap">
        <span className="info-kicker">ECONOMIA CIRCULAR</span>
        <h1 className="info-title">Doações</h1>
        <p className="info-sub">
          Todo item com a tag verde de DOAÇÃO é de graça. Quem anuncia marca a
          opção de doação no formulário, o preço some e o item entra na
          vitrine pronto pra mudar o semestre de alguém.
        </p>

        <div className="info-bloco">
          <h2 className="info-h">Por que doar?</h2>
          <p className="info-p">
            Aquele livro do primeiro semestre, o jaleco que não serve mais, o
            kit de desenho parado na gaveta: pra você é espaço ocupado, pra quem
            tá chegando é economia de verdade. A doação encurta o caminho de
            quem mais precisa e mantém material bom circulando dentro do
            campus.
          </p>
        </div>

        <div className="info-bloco">
          <h2 className="info-h">Como funciona na prática</h2>
          <p className="info-p">
            Anuncie normal, ligue a chave de doação e combine a retirada pelo
            WhatsApp como em qualquer troca. Vale a regra da casa: quem chegou
            primeiro e busca no combinado, leva.
          </p>
        </div>

        <div className="info-cta">
          <Link className="btn btn-hero" href="/produtos?doacoes=1">
            Ver só as doações
          </Link>
          <Link className="btn btn-hero-ghost" href="/anunciar">
            Quero doar um item
          </Link>
        </div>
      </main>
      <Rodape />
    </div>
  );
}
