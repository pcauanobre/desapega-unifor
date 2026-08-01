"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from "@mui/icons-material/Edit";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/landing/TopBar";
import { HeaderNav } from "@/components/landing/HeaderNav";
import { Rodape } from "@/components/landing/Rodape";
import { MeusAnuncios } from "@/components/conta/MeusAnuncios";

type Perfil = {
  nome: string; email: string; foto: string;
  celular: string; curso: string; semestre: string; bloco: string;
};

/**
 * O QUE: a página da conta: perfil completo, meus anúncios com excluir,
 *        sair, editar perfil e a zona de perigo que apaga TUDO.
 * POR QUE: o aluno é dono dos próprios dados; apagar a conta remove os
 *          anúncios e o usuário de uma vez (função no banco).
 * CHAMA: link "Minha conta" do topo.
 * QUEBRA SE: sem sessão (volta pro /entrar).
 */
export default function Conta() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [apagando, setApagando] = useState(false);
  const [senhaConfirma, setSenhaConfirma] = useState("");
  const [erroApagar, setErroApagar] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (!user) {
          router.replace("/entrar");
          return;
        }
        const m = user.user_metadata ?? {};
        setPerfil({
          nome: (m.nome as string) ?? "Aluno",
          email: user.email ?? "",
          foto: (m.foto_url as string) ?? "",
          celular: (m.celular as string) ?? "",
          curso: (m.curso as string) ?? "",
          semestre: (m.semestre as string) ?? "",
          bloco: (m.bloco_padrao as string) ?? "",
        });
      });
  }, [router]);

  async function sair() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function apagarTudo() {
    if (apagando || !perfil) return;
    if (senhaConfirma.length < 6) {
      setErroApagar("Digite tua senha pra confirmar.");
      return;
    }
    setApagando(true);
    setErroApagar(null);
    const supabase = createClient();

    // Reautentica antes do irreversível: só o dono da senha apaga a conta.
    const { error: senhaErrada } = await supabase.auth.signInWithPassword({
      email: perfil.email,
      password: senhaConfirma,
    });
    if (senhaErrada) {
      setApagando(false);
      setErroApagar("Senha incorreta.");
      return;
    }

    const { error } = await supabase.rpc("deletar_minha_conta");
    if (error) {
      setApagando(false);
      setErroApagar("Não deu pra apagar agora. Tenta de novo.");
      return;
    }
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="pagina-1280 flex-1">
      <TopBar />
      <HeaderNav />
      <main className="container info-wrap" style={{ maxWidth: 1000 }}>
        <span className="info-kicker">MINHA CONTA</span>

        {perfil && (
          <div className="ct-perfil">
            <span className="wiz-avatar">
              {perfil.foto ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={perfil.foto} alt="Foto de perfil" />
              ) : (
                <PersonIcon sx={{ fontSize: 40 }} />
              )}
            </span>
            <div className="ct-dados">
              <h1 className="ct-nome">{perfil.nome}</h1>
              <p className="ct-linha">{perfil.email}</p>
              <p className="ct-linha">
                {[perfil.curso, perfil.semestre && `${perfil.semestre} semestre`, perfil.bloco]
                  .filter(Boolean)
                  .join(" · ") || "Perfil ainda sem curso e semestre"}
              </p>
              {perfil.celular && <p className="ct-linha">{perfil.celular}</p>}
            </div>
            <div className="ct-acoes">
              <Link className="btn btn-hero-ghost" href="/bem-vindo">
                <EditIcon sx={{ fontSize: 16 }} /> Editar perfil
              </Link>
              <button className="btn wiz-voltar" onClick={sair}>
                <LogoutIcon sx={{ fontSize: 16 }} /> Sair
              </button>
            </div>
          </div>
        )}

        <div className="info-bloco">
          <h2 className="info-h">Meus anúncios</h2>
          <MeusAnuncios />
        </div>

        <div className="ct-perigo">
          <div>
            <h2 className="info-h">Apagar meus dados</h2>
            <p className="info-p">
              Remove tua conta, teu perfil e TODOS os teus anúncios de uma
              vez. Sem volta.
            </p>
          </div>
          <button className="btn ct-apagar" onClick={() => setConfirmando(true)}>
            Apagar tudo
          </button>
        </div>
      </main>
      <Rodape />

      {confirmando && (
        <div className="aviso-overlay" role="dialog" aria-modal="true">
          <div className="aviso-card">
            <h2 className="aviso-titulo">Apagar tudo mesmo?</h2>
            <p className="aviso-p" style={{ textAlign: "center" }}>
              Conta, perfil e anúncios somem de vez. Essa ação não tem desfazer.
              Confirma tua senha pra continuar.
            </p>
            <label className="field" style={{ marginTop: 14 }}>
              <span className="field-label">Tua senha</span>
              <input
                type="password"
                placeholder="Senha"
                value={senhaConfirma}
                onChange={(e) => setSenhaConfirma(e.target.value)}
              />
            </label>
            {erroApagar && <p className="login-erro">{erroApagar}</p>}
            <div className="wiz-acoes">
              <button
                className="btn wiz-voltar"
                onClick={() => {
                  setConfirmando(false);
                  setSenhaConfirma("");
                  setErroApagar(null);
                }}
              >
                Cancelar
              </button>
              <button className="btn ct-apagar" style={{ flex: 1 }} onClick={apagarTudo}>
                {apagando && <span className="spinner" />}
                {apagando ? "Apagando…" : "Sim, apagar tudo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
