"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PersonIcon from "@mui/icons-material/Person";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { createClient } from "@/lib/supabase/client";
import { otimizarFoto } from "@/lib/otimizar-foto";
import { TopBar } from "@/components/landing/TopBar";
import { HeaderNav } from "@/components/landing/HeaderNav";
import { Rodape } from "@/components/landing/Rodape";
import { Droplist } from "@/components/Droplist";
import { CURSOS, SEMESTRES, formatarCelular } from "@/components/wizard/EtapaCampos";

/**
 * O QUE: a edição completa do perfil numa tela só, tudo pré-preenchido:
 *        nome, foto (galeria ou Ctrl+V), celular, curso e semestre.
 * POR QUE: quem já passou pelo setup edita direto, sem wizard.
 * CHAMA: botão "Editar perfil" da conta.
 * QUEBRA SE: sem sessão (volta pro /entrar).
 */
export default function EditarPerfil() {
  const router = useRouter();
  const [pronto, setPronto] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [foto, setFoto] = useState("");
  const [celular, setCelular] = useState("");
  const [curso, setCurso] = useState("");
  const [semestre, setSemestre] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

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
        setNome((m.nome as string) ?? "");
        setFoto((m.foto_url as string) ?? "");
        setCelular((m.celular as string) ?? "");
        setCurso((m.curso as string) ?? "");
        setSemestre((m.semestre as string) ?? "");
        setPronto(true);
      });
  }, [router]);

  // Ctrl+V com imagem copiada troca a foto direto, sem campo nenhum.
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
    setTimeout(() => router.push("/conta"), 900);
  }

  return (
    <div className="pagina-1280 flex-1">
      <TopBar />
      <HeaderNav />
      <main className="container info-wrap" style={{ maxWidth: 720 }}>
        <div>
          <Link className="pd-voltar" style={{ marginTop: 0 }} href="/conta">
            ← Voltar
          </Link>
        </div>
        <span className="info-kicker">MINHA CONTA</span>
        <h1 className="info-title">Editar perfil</h1>

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
      </main>
      <Rodape />
    </div>
  );
}
