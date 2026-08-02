import Link from "next/link";
import { Brand } from "@/components/Brand";
import { LocalizacaoMapa } from "@/components/landing/LocalizacaoMapa";

/**
 * O QUE: o footer navy de 4 colunas do design, com todos os links vivos:
 *        categorias filtram a vitrine, plataforma leva às páginas
 *        informativas, contato tem o endereço da Unifor (hover abre um
 *        mini mapa), telefone, email e Instagram.
 * POR QUE: markup do código fonte, agora com navegação real.
 * CHAMA: todas as páginas desktop.
 * QUEBRA SE: as rotas /regras, /seguranca, /doacoes ou /ajuda mudarem.
 */
export function Rodape() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <Brand pequena />
          <p className="footer-desc">
            Compra, venda e doação de materiais entre estudantes da
            Universidade de Fortaleza.
          </p>
        </div>
        <div className="footer-col">
          <span className="footer-head mono">CATEGORIAS</span>
          <Link href="/produtos?categoria=Livros">Livros</Link>
          <Link href="/produtos?categoria=Computação">Computação</Link>
          <Link href="/produtos?categoria=Engenharia">Engenharia</Link>
          <Link href="/produtos?categoria=Eletrônicos">Eletrônicos</Link>
        </div>
        <div className="footer-col">
          <span className="footer-head mono">PLATAFORMA</span>
          <Link href="/#como-funciona">Como funciona</Link>
          <Link href="/regras">Regras do desapego</Link>
          <Link href="/seguranca">Segurança nas trocas</Link>
          <Link href="/doacoes">Doações</Link>
        </div>
        <div className="footer-col">
          <span className="footer-head mono">CONTATO</span>
          <LocalizacaoMapa>
            <a href="mailto:desapega@unifor.br">desapega@unifor.br</a>
            <a href="tel:+558534773000">(85) 3477-3000</a>
            <a href="https://www.instagram.com/unifor" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <Link href="/ajuda">Central de ajuda</Link>
          </LocalizacaoMapa>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Desapega Unifor</span>
        <span>Projeto acadêmico, sem vínculo oficial com a Unifor</span>
        <span className="mono">Fortaleza, CE</span>
      </div>
    </footer>
  );
}
