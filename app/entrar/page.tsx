"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import XIcon from "@mui/icons-material/X";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { createClient } from "@/lib/supabase/client";
import { problemaDaSenha } from "@/lib/senha";
import { ErroToast } from "@/components/ErroToast";
import { useErroState } from "@/components/useErroState";
import { MedidorSenha } from "@/components/MedidorSenha";
import { PopupCodigo } from "@/components/PopupCodigo";
import { useSaidaAnimada } from "@/components/useSaidaAnimada";

const TEXTOS = {
  login: {
    title: "Acesse sua conta Desapega",
    sub: "Entre para cadastrar produtos e acompanhar seus desapegos",
    submit: "Acessar", altHint: "Não tem conta?", altLink: "Criar uma conta",
  },
  register: {
    title: "Crie sua conta Desapega Unifor",
    sub: "Apenas para alunos Unifor",
    submit: "Criar conta", altHint: "Já tem conta?", altLink: "Entrar",
  },
  recuperar: {
    title: "Recupere seu acesso",
    sub: "Receba um código no email e escolha uma senha nova",
    submit: "Enviar código", altHint: "Lembrou a senha?", altLink: "Entrar",
  },
};

/* Só aluno da Unifor cria conta: o cadastro exige o email institucional. */
const DOMINIO_UNIFOR = "@edu.unifor.br";

/* Perfis oficiais da universidade (rodapé de unifor.br). */
const REDES_UNIFOR = [
  { nome: "Facebook", url: "https://www.facebook.com/uniforoficial/", Icone: FacebookIcon, tamanho: 20 },
  { nome: "Instagram", url: "https://www.instagram.com/uniforcomunica/", Icone: InstagramIcon, tamanho: 20 },
  { nome: "YouTube", url: "https://www.youtube.com/user/uniforcomunica", Icone: YouTubeIcon, tamanho: 22 },
  { nome: "X", url: "https://twitter.com/uniforoficial", Icone: XIcon, tamanho: 17 },
  { nome: "LinkedIn", url: "https://pt.linkedin.com/school/university-of-fortaleza/", Icone: LinkedInIcon, tamanho: 20 },
];

/**
 * O QUE: a tela de acesso no layout do design (foto do campus + card),
 *        com login e cadastro REAIS no Supabase Auth por email. O cadastro
 *        só aceita email institucional da Unifor (@edu.unifor.br).
 * POR QUE: a vitrine promete itens anunciados por alunos da Unifor, então
 *          quem cria conta precisa provar o vínculo pelo email institucional.
 * CHAMA: "Entrar", "Quero anunciar" e clique nos cards levam pra cá.
 * QUEBRA SE: confirmação de email estiver LIGADA no painel do Supabase
 *            (o cadastro passa a exigir email real confirmado).
 */
export default function Entrar() {
  const router = useRouter();
  const [modo, setModo] = useState<"login" | "register" | "recuperar">("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [aceite, setAceite] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useErroState();
  const [sucesso, setSucesso] = useState<string | null>(null);
  /* Recuperação em TRÊS etapas (estrutura reaproveitada de outro projeto
     meu): email → popup do
     código → e só quem confirma o código chega na tela de nova senha. */
  const [etapaRec, setEtapaRec] = useState<"email" | "codigo" | "senha">("email");
  const [codigo, setCodigo] = useState("");
  const { saindo: saindoOtp, fecharCom: fecharOtpCom } = useSaidaAnimada();
  /* Cadastro também confirma o email por código, no mesmo popup. */
  const [confirmandoCadastro, setConfirmandoCadastro] = useState(false);
  const { saindo: saindoCad, fecharCom: fecharCadCom } = useSaidaAnimada();
  const t = TEXTOS[modo];

  function irPraRecuperar(e: React.MouseEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    setCodigo("");
    setSenha("");
    setSenha2("");
    setEtapaRec("email");
    setModo("recuperar");
  }

  function voltarPraLogin(e: React.MouseEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    setCodigo("");
    setSenha("");
    setSenha2("");
    setModo("login");
  }

  /* Confere o código no servidor. Fora do submit porque o Ctrl+V no campo
     chama direto, sem precisar de Enter. */
  async function conferirCodigo(valor: string) {
    if (enviando) return;
    setErro(null);
    setSucesso(null);
    if (!/^\d{6}$/.test(valor)) return setErro("Digite o código de 6 dígitos do email.");
    setEnviando(true);
    const r = await fetch("/api/senha/conferir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), otp: valor }),
    });
    const corpo = await r.json();
    setEnviando(false);
    if (!r.ok) return setErro(corpo.erro ?? "Não deu pra conferir agora.");
    // Código certo: o popup desce animado e a tela de nova senha assume.
    fecharOtpCom(() => {
      setSucesso("Código confirmado! Escolha a nova senha.");
      setEtapaRec("senha");
    });
  }

  function fecharPopupCodigo() {
    fecharOtpCom(() => {
      setCodigo("");
      setErro(null);
      setEtapaRec("email");
    });
  }

  async function reenviarCodigo(e: React.MouseEvent) {
    e.preventDefault();
    if (enviando) return;
    setErro(null);
    setEnviando(true);
    const r = await fetch("/api/senha/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    setEnviando(false);
    if (!r.ok) {
      const corpo = await r.json();
      return setErro(corpo.erro ?? "Não deu pra reenviar agora.");
    }
    setCodigo("");
    setSucesso("Código novo enviado!");
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    setErro(null);
    setSucesso(null);

    if (!/.+@.+\..+/.test(email.trim())) {
      setErro("Escreve um email válido.");
      return;
    }

    if (modo === "recuperar") {
      if (etapaRec === "email") {
        setEnviando(true);
        const r = await fetch("/api/senha/enviar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });
        const corpo = await r.json();
        setEnviando(false);
        if (!r.ok) return setErro(corpo.erro ?? "Não deu pra enviar o código agora.");
        // Email sem conta não avança: typo se resolve aqui, não no código.
        if (!corpo.existe) {
          return setErro("Não achamos conta com esse email. Confere se digitou certo.");
        }
        setSucesso("Código enviado! Olha seu email.");
        setEtapaRec("codigo");
        return;
      }

      if (etapaRec === "codigo") {
        await conferirCodigo(codigo);
        return;
      }

      const problema = problemaDaSenha(senha);
      if (problema) return setErro(problema);
      if (senha !== senha2) return setErro("As senhas não conferem.");
      setEnviando(true);
      const r = await fetch("/api/senha/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: codigo, senha }),
      });
      const corpo = await r.json();
      setEnviando(false);
      if (!r.ok) return setErro(corpo.erro ?? "Não deu pra redefinir agora.");
      setCodigo("");
      setSenha("");
      setEtapaRec("email");
      setModo("login");
      setSucesso("Senha redefinida! Entre com a nova senha.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (modo === "register") {
      if (nome.trim().length < 2) return setErro("Escreva seu nome completo.");
      if (!email.trim().toLowerCase().endsWith(DOMINIO_UNIFOR)) {
        return setErro(
          `Só dá pra criar conta com o email institucional da Unifor (nome${DOMINIO_UNIFOR}).`,
        );
      }
      // Senha nova segue a régua do projeto (8+, letra e número).
      const problema = problemaDaSenha(senha);
      if (problema) return setErro(problema);
      if (senha !== senha2) return setErro("As senhas não conferem.");
      if (!aceite) return setErro("Precisa aceitar as regras do desapego.");

      // A conta só nasce depois do código: prova de posse do email.
      setEnviando(true);
      const r = await fetch("/api/cadastro/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), nome: nome.trim() }),
      });
      const corpo = await r.json();
      setEnviando(false);
      if (!r.ok) return setErro(corpo.erro ?? "Não deu pra enviar o código agora.");
      setCodigo("");
      setConfirmandoCadastro(true);
      return;
    }

    setEnviando(true);
    const supabase = createClient();

    if (modo === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });
      if (error) {
        setEnviando(false);
        setErro(
          error.message.includes("not confirmed")
            ? "Essa conta ainda não foi ativada. Tenta de novo em instantes."
            : "Email ou senha incorretos.",
        );
        return;
      }
      // Perfil que nunca passou pelo setup cai no wizard antes da vitrine.
      // O destino pedido (?voltar=) atravessa o wizard e é honrado no fim.
      const completo = data.user?.user_metadata?.perfil_completo === true;
      const alvo = destinoDeVolta();
      router.push(
        completo ? alvo : `/bem-vindo?voltar=${encodeURIComponent(alvo)}`,
      );
      router.refresh();
      return;
    }

  }

  /* Só roda depois do código confirmado: cria a conta de verdade. */
  async function criarConta() {
    setEnviando(true);
    const { data, error } = await createClient().auth.signUp({
      email: email.trim(),
      password: senha,
      options: { data: { nome: nome.trim() } },
    });
    if (error) {
      setEnviando(false);
      setErro("Não deu pra criar a conta: " + traduzir(error.message));
      return;
    }
    if (data.session) {
      // Conta criada e logada: setup do perfil, levando o destino junto.
      router.push(`/bem-vindo?voltar=${encodeURIComponent(destinoDeVolta())}`);
      router.refresh();
    } else {
      setEnviando(false);
      setModo("login");
      setSucesso("Conta criada! Entre com seu email e senha.");
    }
  }

  async function concluirCadastro(valor: string) {
    if (enviando) return;
    setErro(null);
    setSucesso(null);
    if (!/^\d{6}$/.test(valor)) return setErro("Digite o código de 6 dígitos do email.");
    setEnviando(true);
    const r = await fetch("/api/cadastro/conferir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), otp: valor }),
    });
    const corpo = await r.json();
    if (!r.ok) {
      setEnviando(false);
      return setErro(corpo.erro ?? "Não deu pra conferir agora.");
    }
    fecharCadCom(() => setConfirmandoCadastro(false));
    await criarConta();
  }

  function fecharPopupCadastro() {
    fecharCadCom(() => {
      setConfirmandoCadastro(false);
      setCodigo("");
      setErro(null);
    });
  }

  async function reenviarCadastro(e: React.MouseEvent) {
    e.preventDefault();
    if (enviando) return;
    setErro(null);
    setEnviando(true);
    const r = await fetch("/api/cadastro/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), nome: nome.trim() }),
    });
    const corpo = await r.json();
    setEnviando(false);
    if (!r.ok) return setErro(corpo.erro ?? "Não deu pra reenviar agora.");
    setCodigo("");
    setSucesso("Código novo enviado!");
  }

  return (
    <div className={`pagina-1280 login-body flex-1 ${modo === "register" ? "is-register" : ""}`}>
      <div className="login">
        <div className="login-bg">
          <div className="login-photo">
            <div className="login-overlay" />
            <div className="login-topbrand">
              <a href="https://www.unifor.br" target="_blank" rel="noopener noreferrer"
                title="Site oficial da Unifor">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/unifor-h-negativa.svg"
                  alt="Universidade de Fortaleza"
                  style={{ height: 56, width: "auto", display: "block" }}
                />
              </a>
            </div>
            <div className="login-social">
              {/* perfis oficiais, tirados do rodapé do site da Unifor */}
              <span className="icones">
                {REDES_UNIFOR.map(({ nome, url, Icone, tamanho }) => (
                  <a key={nome} className="ico" href={url} title={`${nome} da Unifor`}
                    target="_blank" rel="noopener noreferrer" aria-label={nome}>
                    <Icone sx={{ fontSize: tamanho }} />
                  </a>
                ))}
              </span>
              <span>Projeto Desapega Unifor | Universidade de Fortaleza</span>
            </div>
          </div>
          <div className="login-side" />
        </div>

        <div className="login-cardwrap">
          {/* key={modo}: trocar de modo remonta o card e a cascata de
              entrada roda inteira de novo, idêntica à da chegada. */}
          <form key={modo} className="login-card com-entrada" onSubmit={enviar}>
            <Link className="login-voltar" href="/produtos">
              ← Voltar
            </Link>
            <div className="login-brand">
              <Link href="/produtos" title="Ir pra vitrine">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mark-blue.svg" alt="Desapega Unifor" className="login-mark" />
              </Link>
            </div>

            <h1 className="login-title">{t.title}</h1>
            <p className="login-sub">{t.sub}</p>
            {sucesso && <p className="login-ok">{sucesso}</p>}

            <div className="login-fields">
              {modo === "recuperar" ? (
                <>
                  {etapaRec !== "senha" && (
                    <label className="field">
                      <span className="field-label">Email</span>
                      <input type="email" value={email} placeholder="Email da sua conta"
                        onChange={(e) => setEmail(e.target.value)} />
                    </label>
                  )}

                  {etapaRec === "senha" && (
                    <label className="field">
                      <span className="field-label">Nova senha</span>
                      <span className="field-pwd">
                        <input type={verSenha ? "text" : "password"} autoFocus
                          placeholder="Mínimo 8, com letra e número"
                          value={senha} onChange={(e) => setSenha(e.target.value)} />
                        <button type="button" className="pwd-toggle" title="Mostrar senha"
                          onClick={() => setVerSenha(!verSenha)}>
                          {verSenha
                            ? <VisibilityOffIcon sx={{ fontSize: 19 }} />
                            : <VisibilityIcon sx={{ fontSize: 19 }} />}
                        </button>
                      </span>
                      <MedidorSenha senha={senha} />
                    </label>
                  )}

                  {etapaRec === "senha" && (
                    <label className="field">
                      <span className="field-label">Confirmar nova senha</span>
                      <input type={verSenha ? "text" : "password"} placeholder="Repita a senha"
                        value={senha2} onChange={(e) => setSenha2(e.target.value)} />
                    </label>
                  )}

                  <ErroToast erro={erro} />

                  <button className="btn btn-primary btn-block" type="submit">
                    {enviando && <span className="spinner" />}
                    <span>
                      {enviando
                        ? "Enviando…"
                        : etapaRec === "senha"
                          ? "Redefinir senha"
                          : "Enviar código"}
                    </span>
                  </button>

                  <p className="login-alt">
                    <span>{t.altHint}</span>{" "}
                    <a href="#" onClick={voltarPraLogin}>{t.altLink}</a>
                  </p>
                </>
              ) : (
                <>
              <label className="field only-register">
                <span className="field-label">Nome completo</span>
                <input type="text" placeholder="Nome completo" value={nome}
                  onChange={(e) => setNome(e.target.value)} />
              </label>

              <label className="field">
                <span className="field-label">Email institucional</span>
                <input type="email" value={email}
                  placeholder={`nome${DOMINIO_UNIFOR}`}
                  onChange={(e) => setEmail(e.target.value)} />
              </label>

              <label className="field">
                <span className="field-label">Senha</span>
                <span className="field-pwd">
                  <input type={verSenha ? "text" : "password"}
                    placeholder={modo === "register" ? "Mínimo 8, com letra e número" : "Senha"}
                    value={senha} onChange={(e) => setSenha(e.target.value)} />
                  <button type="button" className="pwd-toggle" title="Mostrar senha"
                    onClick={() => setVerSenha(!verSenha)}>
                    {verSenha
                      ? <VisibilityOffIcon sx={{ fontSize: 19 }} />
                      : <VisibilityIcon sx={{ fontSize: 19 }} />}
                  </button>
                </span>
                {modo === "register" && <MedidorSenha senha={senha} />}
              </label>

              <label className="field only-register">
                <span className="field-label">Confirmar senha</span>
                <input type={verSenha ? "text" : "password"} placeholder="Repita a senha"
                  value={senha2} onChange={(e) => setSenha2(e.target.value)} />
              </label>

              <label className="check only-register">
                <input type="checkbox" checked={aceite}
                  onChange={(e) => setAceite(e.target.checked)} />
                <span>
                  Aceito as{" "}
                  <a href="/regras" target="_blank" rel="noopener noreferrer">
                    regras do desapego
                  </a>{" "}
                  e a{" "}
                  <a href="/privacidade" target="_blank" rel="noopener noreferrer">
                    política de privacidade
                  </a>
                  .
                </span>
              </label>

              <div className="login-row only-login">
                <label className="check inline"><input type="checkbox" /><span>Continuar conectado</span></label>
                <a href="#" onClick={irPraRecuperar}>Esqueci minha senha</a>
              </div>

              <ErroToast erro={erro} />

              <button className="btn btn-primary btn-block" type="submit">
                {enviando && <span className="spinner" />}
                <span>{enviando ? "Validando…" : t.submit}</span>
              </button>

              <p className="login-alt">
                <span>{t.altHint}</span>{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); setErro(null); setModo(modo === "login" ? "register" : "login"); }}>
                  {t.altLink}
                </a>
              </p>
                </>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Popup do código: uma tela só, com Ctrl+V confirmando sozinho.
          O mesmo componente serve a recuperação e o cadastro. */}
      {modo === "recuperar" && etapaRec === "codigo" && (
        <PopupCodigo
          email={email.trim()}
          codigo={codigo}
          onCodigo={setCodigo}
          onConfirmar={conferirCodigo}
          onReenviar={reenviarCodigo}
          onFechar={fecharPopupCodigo}
          rotuloFechar="Trocar o email"
          enviando={enviando}
          erro={erro}
          sucesso={sucesso}
          saindo={saindoOtp}
        />
      )}

      {confirmandoCadastro && (
        <PopupCodigo
          email={email.trim()}
          codigo={codigo}
          onCodigo={setCodigo}
          onConfirmar={concluirCadastro}
          onReenviar={reenviarCadastro}
          onFechar={fecharPopupCadastro}
          rotuloFechar="Corrigir email"
          enviando={enviando}
          erro={erro}
          sucesso={sucesso}
          saindo={saindoCad}
        />
      )}
    </div>
  );
}

/**
 * Pra onde ir depois de entrar: o ?voltar= da URL (a aba que a pessoa
 * tentou abrir sem conta) ou a vitrine. Só aceita caminho interno, pra
 * ninguém usar o parâmetro como trampolim pra site de fora.
 */
function destinoDeVolta(): string {
  const bruto = new URLSearchParams(window.location.search).get("voltar") ?? "";
  return /^\/[a-z0-9/-]*$/i.test(bruto) ? bruto : "/produtos";
}

/* Erros comuns do Auth em português simples. */
function traduzir(msg: string): string {
  if (msg.includes("already registered")) return "esse email já tem conta.";
  if (msg.includes("Password")) return "senha muito fraca.";
  return "tenta de novo em instantes.";
}
