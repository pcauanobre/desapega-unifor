"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import XIcon from "@mui/icons-material/X";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { createClient } from "@/lib/supabase/client";
import { matriculaParaEmail, matriculaValida } from "@/lib/matricula";

const CURSOS = [
  "Engenharia Civil", "Engenharia Elétrica", "Engenharia Mecânica",
  "Ciência da Computação", "Sistemas de Informação", "Direito",
  "Medicina", "Enfermagem", "Arquitetura", "Administração",
];

const TEXTOS = {
  login: {
    title: "Acesse sua conta Unifor",
    sub: "Entre e utilize nossos serviços digitais em um só lugar",
    submit: "Acessar", altHint: "Não tem conta?", altLink: "Criar uma conta",
  },
  register: {
    title: "Crie sua conta Unifor",
    sub: "Cadastro para alunos com matrícula ativa",
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
  const [matricula, setMatricula] = useState("");
  const [curso, setCurso] = useState("");
  const [senha, setSenha] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [aceite, setAceite] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const t = TEXTOS[modo];

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    setErro(null);

    if (!matriculaValida(matricula)) {
      setErro("Matrícula inválida: use só os números, sem o dígito.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (modo === "register") {
      if (nome.trim().length < 2) return setErro("Escreve teu nome completo.");
      if (!curso) return setErro("Seleciona teu curso.");
      if (!aceite) return setErro("Precisa aceitar as regras do desapego.");
    }

    setEnviando(true);
    const supabase = createClient();
    const email = matriculaParaEmail(matricula);
    const { error } =
      modo === "login"
        ? await supabase.auth.signInWithPassword({ email, password: senha })
        : await supabase.auth.signUp({
            email,
            password: senha,
            options: { data: { nome: nome.trim(), curso, matricula } },
          });

    if (error) {
      setEnviando(false);
      setErro(
        modo === "login"
          ? "Matrícula ou senha incorretas."
          : "Não deu pra criar a conta: " + traduzir(error.message),
      );
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className={`pagina-1280 login-body flex-1 ${modo === "register" ? "is-register" : ""}`}>
      <div className="login">
        <div className="login-bg">
          <div className="login-photo">
            <div className="login-overlay" />
            <div className="login-topbrand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/mark-white.svg" alt="Desapega Unifor" className="brand-mark" />
              <span className="brand-name">
                <span className="brand-name-1">Desapega</span>
                <span className="brand-name-2">Unifor</span>
              </span>
            </div>
            <div className="login-social">
              <span className="icones">
                <FacebookIcon sx={{ fontSize: 19 }} />
                <InstagramIcon sx={{ fontSize: 19 }} />
                <YouTubeIcon sx={{ fontSize: 21 }} />
                <XIcon sx={{ fontSize: 16 }} />
                <LinkedInIcon sx={{ fontSize: 19 }} />
              </span>
              <span>Projeto Desapega | Universidade de Fortaleza</span>
            </div>
          </div>
          <div className="login-side" />
        </div>

        <div className="login-cardwrap">
          <form className="login-card" onSubmit={enviar}>
            <div className="login-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/mark-blue.svg" alt="Desapega Unifor" className="login-mark" />
            </div>

            <h1 className="login-title">{t.title}</h1>
            <p className="login-sub">{t.sub}</p>

            <div className="login-fields">
              <label className="field only-register">
                <span className="field-label">Nome completo</span>
                <input type="text" placeholder="Nome completo" value={nome}
                  onChange={(e) => setNome(e.target.value)} />
              </label>

              <label className="field">
                <span className="field-label">Matrícula</span>
                <input type="text" placeholder="Matrícula" value={matricula}
                  onChange={(e) => setMatricula(e.target.value.replace(/\D/g, ""))} />
              </label>

              <label className="field only-register">
                <span className="field-label">Curso</span>
                <select value={curso} onChange={(e) => setCurso(e.target.value)}>
                  <option value="">Selecione o curso</option>
                  {CURSOS.map((c) => (<option key={c}>{c}</option>))}
                </select>
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
                <span>Aceito as regras do desapego e a política de privacidade.</span>
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
