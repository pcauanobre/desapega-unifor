"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { otimizarFoto } from "@/lib/otimizar-foto";
import { BloquearScroll } from "@/components/BloquearScroll";
import { EtapaCampos, type Perfil } from "@/components/wizard/EtapaCampos";

const ETAPAS = [
  { titulo: "Vamos montar seu perfil", sub: "Uma foto deixa teus anúncios muito mais confiáveis." },
  { titulo: "Seu contato", sub: "O WhatsApp que aparece pros interessados nos teus anúncios." },
  { titulo: "Sua vida no campus", sub: "Curso e semestre aparecem junto do teu nome na vitrine." },
];

/**
 * O QUE: o setup pós-cadastro em 3 etapas: foto (galeria ou Ctrl+V),
 *        celular e curso/semestre, com barra de progresso e popup final.
 * POR QUE: o cadastro pede o mínimo; o perfil completo vem aqui. A foto
 *          sobe otimizada pro bucket na hora que chega.
 * CHAMA: /entrar redireciona pra cá após criar conta ou login incompleto.
 * QUEBRA SE: sem sessão ativa (volta pro /entrar).
 */
export default function BemVindo() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [etapa, setEtapa] = useState(0);
  const [perfil, setPerfil] = useState<Perfil>({
    foto_url: "", celular: "", curso: "", semestre: "",
  });
  const [salvando, setSalvando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const uid = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/entrar");
        return;
      }
      uid.current = user.id;
      setNome(((user.user_metadata?.nome as string) ?? "").split(" ")[0]);
    });
  }, [router]);

  function mudar(campo: keyof Perfil, valor: string) {
    setPerfil((atual) => ({ ...atual, [campo]: valor }));
  }

  /* Foto chegou (galeria ou Ctrl+V): otimiza, sobe pro bucket e mostra. */
  async function receberFoto(arquivo: File) {
    setErro(null);
    try {
      const blob = await otimizarFoto(arquivo);
      const caminho = `${uid.current}/perfil-${Date.now()}.webp`;
      const supabase = createClient();
      const { error } = await supabase.storage
        .from("fotos")
        .upload(caminho, blob, { contentType: "image/webp" });
      if (error) throw new Error(error.message);
      const url = supabase.storage.from("fotos").getPublicUrl(caminho).data.publicUrl;
      mudar("foto_url", url);
    } catch {
      setErro("Não deu pra usar essa imagem. Tenta outra.");
    }
  }

  async function concluir() {
    if (salvando) return;
    setSalvando(true);
    setErro(null);
    const { error } = await createClient().auth.updateUser({
      data: { ...perfil, perfil_completo: true },
    });
    setSalvando(false);
    if (error) {
      setErro("Não deu pra salvar agora. Tenta de novo em instantes.");
      return;
    }
    setConcluido(true);
  }

  function avancar() {
    if (etapa < ETAPAS.length - 1) setEtapa(etapa + 1);
    else concluir();
  }

  const ultima = etapa === ETAPAS.length - 1;

  return (
    <div className="pagina-1280 flex-1">
      <div className="wiz-fundo">
        <div className="wiz-card">
          <div className="wiz-topo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mark-blue.svg" alt="Desapega Unifor" className="wiz-marca" />
            <span className="wiz-conta">
              {etapa + 1} / {ETAPAS.length}
            </span>
          </div>
          <div className="wiz-barra">
            <i style={{ width: `${((etapa + 1) / ETAPAS.length) * 100}%` }} />
          </div>

          <div className="wiz-passo" key={etapa}>
            <h1 className="wiz-titulo">
              {etapa === 0 && nome
                ? `Vamos montar seu perfil, ${nome}`
                : ETAPAS[etapa].titulo}
            </h1>
            <p className="wiz-sub">{ETAPAS[etapa].sub}</p>
            <EtapaCampos etapa={etapa} perfil={perfil} onMudar={mudar} onFoto={receberFoto} />
          </div>

          {erro && <p className="login-erro">{erro}</p>}

          <div className="wiz-acoes">
            {etapa > 0 && (
              <button className="btn wiz-voltar" onClick={() => setEtapa(etapa - 1)}>
                Voltar
              </button>
            )}
            <button className="btn wiz-continuar" onClick={avancar}>
              {salvando && <span className="spinner" />}
              {ultima ? (salvando ? "Salvando…" : "Concluir") : "Continuar"}
            </button>
          </div>
        </div>
      </div>

      {concluido && (
        <div className="aviso-overlay" role="dialog" aria-modal="true">
          <BloquearScroll />
          <div className="aviso-card" style={{ textAlign: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mark-blue.svg" alt="" style={{ height: 44 }} />
            <h2 className="aviso-titulo">Perfil completo!</h2>
            <p className="aviso-p">
              Teu cadastro tá pronto e o botão de anunciar já tá liberado.
              Agora é desapegar do que tá parado e garimpar o que tu precisa.
            </p>
            <Link className="btn btn-primary btn-block" href="/produtos">
              Ir pra vitrine
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
