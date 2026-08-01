import { Brand } from "@/components/Brand";

/**
 * O QUE: o footer navy de 4 colunas do design: marca + descrição,
 *        categorias, plataforma e contato, com a linha de copyright.
 * POR QUE: markup idêntico ao código fonte.
 * CHAMA: landing (app/page.tsx).
 * QUEBRA SE: as classes .footer-* do design.css mudarem.
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
          <a href="#">Livros</a>
          <a href="#">Computação</a>
          <a href="#">Engenharia</a>
          <a href="#">Eletrônicos</a>
        </div>
        <div className="footer-col">
          <span className="footer-head mono">PLATAFORMA</span>
          <a href="#">Como funciona</a>
          <a href="#">Regras do desapego</a>
          <a href="#">Segurança nas trocas</a>
          <a href="#">Doações</a>
        </div>
        <div className="footer-col">
          <span className="footer-head mono">CONTATO</span>
          <a href="#">desapega@unifor.br</a>
          <a href="#">Instagram</a>
          <a href="#">Central de ajuda</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Desapega Unifor</span>
        <span className="mono">Fortaleza, CE</span>
      </div>
    </footer>
  );
}
