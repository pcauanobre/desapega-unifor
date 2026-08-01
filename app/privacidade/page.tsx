import Link from "next/link";
import { TopBar } from "@/components/landing/TopBar";
import { HeaderNav } from "@/components/landing/HeaderNav";
import { Rodape } from "@/components/landing/Rodape";

/**
 * O QUE: a política de privacidade, curta e em português de gente.
 * POR QUE: o aceite do cadastro linka pra cá; todo dado coletado tá
 *          listado com o motivo.
 * CHAMA: checkbox do cadastro em /entrar.
 * QUEBRA SE: nada; é estática.
 */
export default function Privacidade() {
  return (
    <div className="pagina-1280 flex-1">
      <TopBar />
      <HeaderNav />
      <main className="container info-wrap">
        <span className="info-kicker">PRIVACIDADE</span>
        <h1 className="info-title">Política de privacidade</h1>
        <p className="info-sub">
          O Desapega Unifor coleta o mínimo necessário pra plataforma
          funcionar, e nada além disso.
        </p>

        <div className="info-bloco">
          <h2 className="info-h">O que a gente guarda</h2>
          <p className="info-p">
            No cadastro: matrícula (vira teu identificador de acesso), nome,
            curso e senha (guardada com criptografia pelo serviço de
            autenticação, a gente nunca vê ela). Num anúncio: as informações
            que tu mesmo preenche, incluindo o contato de WhatsApp e o bloco
            de retirada.
          </p>
        </div>

        <div className="info-bloco">
          <h2 className="info-h">Pra que serve</h2>
          <p className="info-p">
            Mostrar teus anúncios na vitrine e permitir que outros alunos
            falem contigo. Teu contato só aparece pra quem tá logado na
            plataforma, visitante anônimo não tem acesso.
          </p>
        </div>

        <div className="info-bloco">
          <h2 className="info-h">O que a gente NÃO faz</h2>
          <p className="info-p">
            Vender dado, compartilhar com terceiros, mandar spam ou usar tua
            informação fora daqui. Este é um projeto acadêmico do processo
            seletivo do laboratório VORTEX, sem fins comerciais.
          </p>
        </div>

        <div className="info-bloco">
          <h2 className="info-h">Teus direitos</h2>
          <p className="info-p">
            Quer apagar um anúncio? Tá na tua conta, exclui na hora. Quer
            apagar a conta inteira e todos os dados? Manda um email pra
            pedrocauaggn@gmail.com que a remoção é feita de imediato.
          </p>
        </div>

        <div className="info-cta">
          <Link className="btn btn-hero" href="/entrar">Criar minha conta</Link>
          <Link className="btn btn-hero-ghost" href="/regras">Regras do desapego</Link>
        </div>
      </main>
      <Rodape />
    </div>
  );
}
