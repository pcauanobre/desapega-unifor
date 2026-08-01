"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EtapaCampos, type Perfil } from "@/components/wizard/EtapaCampos";

const ETAPAS = [
  { titulo: "Bora montar teu perfil", sub: "Uma foto deixa teus anúncios muito mais confiáveis." },
  { titulo: "Teu contato", sub: "O WhatsApp que aparece pros interessados nos teus anúncios." },
  { titulo: "Tua vida no campus", sub: "Curso e semestre aparecem junto do teu nome na vitrine." },
  { titulo: "Último passo", sub: "Onde geralmente dá pra te encontrar pra entrega." },
];

/**
 * O QUE: o setup wizard pós-cadastro: foto, celular, curso, semestre e
 *        bloco, um passo por vez, com barra de progresso e popup final.
 * POR QUE: o cadastro pede o mínimo; o perfil completo vem aqui, e tudo
 *          pode ser pulado sem culpa.
 * CHAMA: /entrar redireciona pra cá após criar conta.
 * QUEBRA SE: sem sessão ativa (volta pro /entrar).
 */
export default function BemVindo() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [etapa, setEtapa] = useState(0);
  const [perfil, setPerfil] = useState<Perfil>({
    foto_url: "", celular: "", curso: "", semestre: "", bloco_padrao: "",
  });
  const [salvando, setSalvando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace("/entrar");
      else setNome(((user.user_metadata?.nome as string) ?? "").split(" ")[0]);
    });
  }, [router]);

  function mudar(campo: keyof Perfil, valor: string) {
    setPerfil({ ...perfil, [campo]: valor });
  }

  async function concluir() {
    if (salvando) return;
    setSalvando(true);
    setErro(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
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
              {etapa === 0 && nome ? `Bora montar teu perfil, ${nome}` : ETAPAS[etapa].titulo}
            </h1>
            <p className="wiz-sub">{ETAPAS[etapa].sub}</p>
            <EtapaCampos etapa={etapa} perfil={perfil} onMudar={mudar} />
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
            {!ultima && (
              <button className="wiz-pular" onClick={() => setEtapa(etapa + 1)}>
                Pular etapa
              </button>
            )}
          </div>
        </div>
      </div>

      {concluido && (
        <div className="aviso-overlay" role="dialog" aria-modal="true">
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
