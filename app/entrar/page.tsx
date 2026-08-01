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

const TEXTOS = {
  login: {
    title: "Acesse sua conta Unifor",
    sub: "Entre para cadastrar produtos e acompanhar seus desapegos",
    submit: "Acessar", altHint: "Não tem conta?", altLink: "Criar uma conta",
  },
  register: {
    title: "Crie sua conta Desapega Unifor",
    sub: "Cadastro rápido para alunos da Unifor",
    submit: "Criar conta", altHint: "Já tem conta?", altLink: "Entrar",
  },
};

/**
 * O QUE: a tela de acesso no layout do design (foto do campus + card),
 *        com login e cadastro REAIS no Supabase Auth por matrícula.
 * POR QUE: o design simulava a validação; aqui o mesmo visual autentica
 *          de verdade (matrícula vira email sintético por baixo).
 * CHAMA: "Entrar", "Quero anunciar" e clique nos cards levam pra cá.
 * QUEBRA SE: confirmação de email estiver LIGADA no painel do Supabase
 *            (o cadastro passa a exigir email real confirmado).
 */
export default function Entrar() {
  const router = useRouter();
  const [modo, setModo] = useState<"login" | "register">("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [aceite, setAceite] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const t = TEXTOS[modo];

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    setErro(null);
    setSucesso(null);

    if (!/.+@.+\..+/.test(email.trim())) {
      setErro("Escreve um email válido.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (modo === "register") {
      if (nome.trim().length < 2) return setErro("Escreve teu nome completo.");
      if (!aceite) return setErro("Precisa aceitar as regras do desapego.");
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
      const completo = data.user?.user_metadata?.perfil_completo === true;
      router.push(completo ? "/produtos" : "/bem-vindo");
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
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
      // Conta criada e logada: segue pro setup do perfil.
      router.push("/bem-vindo");
      router.refresh();
    } else {
      setEnviando(false);
      setModo("login");
      setSucesso("Conta criada! Entre com seu email e senha.");
    }
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
              <span className="icones">
                <span className="ico"><FacebookIcon sx={{ fontSize: 20 }} /></span>
                <span className="ico"><InstagramIcon sx={{ fontSize: 20 }} /></span>
                <span className="ico"><YouTubeIcon sx={{ fontSize: 22 }} /></span>
                <span className="ico"><XIcon sx={{ fontSize: 17 }} /></span>
                <span className="ico"><LinkedInIcon sx={{ fontSize: 20 }} /></span>
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
              <label className="field only-register">
                <span className="field-label">Nome completo</span>
                <input type="text" placeholder="Nome completo" value={nome}
                  onChange={(e) => setNome(e.target.value)} />
              </label>

              <label className="field">
                <span className="field-label">Email</span>
                <input type="email" placeholder="Email" value={email}
                  onChange={(e) => setEmail(e.target.value)} />
              </label>

              <label className="field">
                <span className="field-label">Senha</span>
                <span className="field-pwd">
                  <input type={verSenha ? "text" : "password"} placeholder="Senha"
                    value={senha} onChange={(e) => setSenha(e.target.value)} />
                  <button type="button" className="pwd-toggle" title="Mostrar senha"
                    onClick={() => setVerSenha(!verSenha)}>
                    {verSenha
                      ? <VisibilityOffIcon sx={{ fontSize: 19 }} />
                      : <VisibilityIcon sx={{ fontSize: 19 }} />}
                  </button>
                </span>
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
                <a href="#">Esqueci minha senha</a>
              </div>

              {erro && <p className="login-erro">{erro}</p>}

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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* Erros comuns do Auth em português simples. */
function traduzir(msg: string): string {
  if (msg.includes("already registered")) return "essa matrícula já tem conta.";
  if (msg.includes("Password")) return "senha muito fraca.";
  return "tenta de novo em instantes.";
}
