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
            No cadastro: nome, email institucional (seu identificador de
            acesso) e senha (guardada com criptografia pelo serviço de
            autenticação, a gente nunca vê ela). No perfil e nos anúncios:
            as informações que você mesmo preenche, incluindo o contato de
            WhatsApp e o bloco de retirada.
          </p>
        </div>

        <div className="info-bloco">
          <h2 className="info-h">Pra que serve</h2>
          <p className="info-p">
            Mostrar seus anúncios na vitrine e permitir que outros alunos
            falem com você. O contato que você informar aparece na página do
            anúncio pra facilitar a troca, e informar é opcional.
          </p>
        </div>

        <div className="info-bloco">
          <h2 className="info-h">O que a gente NÃO faz</h2>
          <p className="info-p">
            Vender dado, compartilhar com terceiros, mandar spam ou usar sua
            informação fora daqui. Este é um projeto acadêmico do processo
            seletivo do laboratório VORTEX, sem fins comerciais.
          </p>
        </div>

        <div className="info-bloco">
          <h2 className="info-h">Seus direitos</h2>
          <p className="info-p">
            Quer apagar um anúncio? Tá na sua conta, é só excluir. Quer
            apagar a conta inteira e todos os dados? Dá pra fazer direto em
            Minha conta, na opção Apagar meus dados, ou mandando um email pra
            pedrocauaggn@gmail.com.
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
