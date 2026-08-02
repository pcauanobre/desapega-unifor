"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BloquearScroll } from "@/components/BloquearScroll";
import { EditorFoto } from "@/components/EditorFoto";
import { prepararFoto } from "@/lib/otimizar-foto";
import { EtapaCampos, type Perfil } from "@/components/wizard/EtapaCampos";

const ETAPAS = [
  { titulo: "Vamos montar seu perfil", sub: "Uma foto deixa seus anúncios muito mais confiáveis." },
  { titulo: "Seu contato", sub: "O WhatsApp que aparece pros interessados nos seus anúncios." },
  { titulo: "Sua vida no campus", sub: "Curso e semestre aparecem junto do seu nome na vitrine." },
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
  const [paraCortar, setParaCortar] = useState<File | null>(null);
  /* Aba que a pessoa tentou abrir antes de ter conta; o fim do setup
     leva ela pra lá em vez de despejar na vitrine. */
  const [destino, setDestino] = useState("/produtos");
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
      // Só caminho interno vira destino (o parâmetro é do usuário).
      const bruto = new URLSearchParams(window.location.search).get("voltar") ?? "";
      if (/^\/[a-z0-9/-]*$/i.test(bruto) && bruto) setDestino(bruto);
    });
  }, [router]);

  function mudar(campo: keyof Perfil, valor: string) {
    setPerfil((atual) => ({ ...atual, [campo]: valor }));
  }

  /* Foto chegou (galeria ou Ctrl+V): abre o editor de corte primeiro. */
  function receberFoto(arquivo: File) {
    setErro(null);
    // foto grande do celular encolhe antes de abrir o editor
    prepararFoto(arquivo).then(setParaCortar);
  }

  async function subirFotoCortada(blob: Blob) {
    setParaCortar(null);
    try {
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

      {paraCortar && (
        <EditorFoto
          arquivo={paraCortar}
          aspecto={1}
          circular
          onCancelar={() => setParaCortar(null)}
          onCortar={subirFotoCortada}
        />
      )}

      {concluido && (
        <div className="aviso-overlay" role="dialog" aria-modal="true">
          <BloquearScroll />
          <div className="aviso-card" style={{ textAlign: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mark-blue.svg" alt="" style={{ height: 44 }} />
            <h2 className="aviso-titulo">Perfil completo!</h2>
            <p className="aviso-p">
              Seu cadastro tá pronto e o botão de anunciar já tá liberado.
              Agora é desapegar do que tá parado e garimpar o que você precisa.
            </p>
            <Link className="btn btn-primary btn-block" href={destino}>
              {destino === "/produtos" ? "Ir pra vitrine" : "Continuar"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
