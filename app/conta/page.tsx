"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PersonIcon from "@mui/icons-material/Person";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import LogoutIcon from "@mui/icons-material/Logout";
import { createClient } from "@/lib/supabase/client";
import { otimizarFoto } from "@/lib/otimizar-foto";
import { TopBar } from "@/components/landing/TopBar";
import { HeaderNav } from "@/components/landing/HeaderNav";
import { Rodape } from "@/components/landing/Rodape";
import { Droplist } from "@/components/Droplist";
import { CURSOS, SEMESTRES, formatarCelular } from "@/components/wizard/EtapaCampos";
import { BloquearScroll } from "@/components/BloquearScroll";

/**
 * O QUE: a conta como formulário vivo: clicou em Minha conta, os dados já
 *        chegam editáveis (nome, foto, celular, curso, semestre) com um
 *        Salvar. Embaixo, atalho pros anúncios, sair e a zona de perigo.
 * POR QUE: sem tela intermediária de leitura; editar É a página.
 * CHAMA: link "Minha conta" do topo. Sem sessão volta pro /entrar.
 * QUEBRA SE: a função deletar_minha_conta sumir do banco.
 */
export default function Conta() {
  const router = useRouter();
  const [pronto, setPronto] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [foto, setFoto] = useState("");
  const [celular, setCelular] = useState("");
  const [curso, setCurso] = useState("");
  const [semestre, setSemestre] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
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
        setUid(user.id);
        setEmail(user.email ?? "");
        setNome((m.nome as string) ?? "");
        setFoto((m.foto_url as string) ?? "");
        setCelular((m.celular as string) ?? "");
        setCurso((m.curso as string) ?? "");
        setSemestre((m.semestre as string) ?? "");
        setPronto(true);
      });
  }, [router]);

  // Ctrl+V com imagem copiada troca a foto de perfil na hora.
  useEffect(() => {
    function colar(e: ClipboardEvent) {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith("image/"),
      );
      const arquivo = item?.getAsFile();
      if (arquivo) receberFoto(arquivo);
    }
    window.addEventListener("paste", colar);
    return () => window.removeEventListener("paste", colar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  async function receberFoto(arquivo: File) {
    if (!uid) return;
    setErro(null);
    try {
      const blob = await otimizarFoto(arquivo);
      const caminho = `${uid}/perfil-${Date.now()}.webp`;
      const supabase = createClient();
      const { error } = await supabase.storage
        .from("fotos")
        .upload(caminho, blob, { contentType: "image/webp" });
      if (error) throw new Error(error.message);
      setFoto(supabase.storage.from("fotos").getPublicUrl(caminho).data.publicUrl);
    } catch {
      setErro("Não deu pra usar essa imagem. Tenta outra.");
    }
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (salvando) return;
    if (nome.trim().length < 2) return setErro("Escreve teu nome completo.");
    setSalvando(true);
    setErro(null);
    setSalvo(false);
    const { error } = await createClient().auth.updateUser({
      data: {
        nome: nome.trim(), foto_url: foto, celular, curso, semestre,
        perfil_completo: true,
      },
    });
    setSalvando(false);
    if (error) {
      setErro("Não deu pra salvar agora. Tenta de novo.");
      return;
    }
    setSalvo(true);
  }

  async function sair() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function apagarTudo() {
    if (apagando) return;
    if (senhaConfirma.length < 6) {
      setErroApagar("Digite tua senha pra confirmar.");
      return;
    }
    setApagando(true);
    setErroApagar(null);
    const supabase = createClient();
    const { error: senhaErrada } = await supabase.auth.signInWithPassword({
      email,
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
      <main className="container info-wrap" style={{ maxWidth: 760 }}>
        <div className="ct-topo">
          <div>
            <span className="info-kicker">MINHA CONTA</span>
            <h1 className="info-title">Meu perfil</h1>
            <p className="info-sub">{email}</p>
          </div>
          <button className="btn wiz-voltar ct-sair" onClick={sair}>
            <LogoutIcon sx={{ fontSize: 16 }} /> Sair
          </button>
        </div>

        {pronto && (
          <form className="an-form" onSubmit={salvar}>
            <div className="wiz-avatar-area">
              <span className="wiz-avatar">
                {foto ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={foto} alt="Foto de perfil" />
                ) : (
                  <PersonIcon sx={{ fontSize: 40 }} />
                )}
              </span>
              <div className="wiz-foto-acoes">
                <label className="btn btn-outline wiz-foto-btn">
                  <AddAPhotoIcon sx={{ fontSize: 18 }} />
                  Trocar foto
                  <input type="file" accept="image/*" hidden
                    onChange={(e) => {
                      const arquivo = e.target.files?.[0];
                      if (arquivo) receberFoto(arquivo);
                      e.target.value = "";
                    }} />
                </label>
                <p className="wiz-sub">Ou copia uma imagem e dá Ctrl+V aqui na tela.</p>
              </div>
            </div>

            <label className="field">
              <span className="field-label">Nome completo</span>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
            </label>

            <label className="field">
              <span className="field-label">Celular (WhatsApp)</span>
              <input type="tel" placeholder="(85) 90000-0000" value={celular}
                onChange={(e) => setCelular(formatarCelular(e.target.value))} />
            </label>

            <div className="an-linha">
              <div className="wiz-dl">
                <span className="field-label">Curso</span>
                <Droplist rotuloAria="Curso" valor={curso} onMudar={setCurso}
                  opcoes={[{ valor: "", rotulo: "Selecione o curso" },
                    ...CURSOS.map((c) => ({ valor: c, rotulo: c }))]} />
              </div>
              <div className="wiz-dl">
                <span className="field-label">Semestre</span>
                <Droplist rotuloAria="Semestre" valor={semestre} onMudar={setSemestre}
                  opcoes={[{ valor: "", rotulo: "Selecione o semestre" },
                    ...SEMESTRES.map((s) => ({ valor: s, rotulo: s }))]} />
              </div>
            </div>

            {erro && <p className="login-erro">{erro}</p>}
            {salvo && <p className="login-ok">Perfil salvo!</p>}

            <button className="btn btn-primary btn-block" type="submit">
              {salvando && <span className="spinner" />}
              {salvando ? "Salvando…" : "Salvar alterações"}
            </button>
          </form>
        )}

        <div className="info-bloco">
          <h2 className="info-h">Meus anúncios</h2>
          <p className="info-p">
            Cliques recebidos, edição e exclusão moram na página dos teus anúncios.
          </p>
          <div className="info-cta" style={{ marginTop: 16 }}>
            <Link className="btn btn-hero" href="/meus-anuncios">
              Abrir meus anúncios
            </Link>
          </div>
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
          <BloquearScroll />
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
              <button className="btn ct-apagar" onClick={apagarTudo}>
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
