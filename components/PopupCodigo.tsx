"use client";

import { BloquearScroll } from "@/components/BloquearScroll";

type Props = {
  email: string;
  codigo: string;
  onCodigo: (v: string) => void;
  onConfirmar: (valor: string) => void;
  onReenviar: (e: React.MouseEvent) => void;
  onFechar: () => void;
  rotuloFechar: string;
  enviando: boolean;
  erro: string | null;
  sucesso: string | null;
  saindo: boolean;
};

/**
 * O QUE: o popup de código de 6 dígitos: input gigante com foco
 *        automático, Ctrl+V confirmando sozinho, reenviar e fechar.
 * POR QUE: o mesmo popup serve a recuperação de senha E a confirmação de
 *          email do cadastro; duplicar markup é duplicar desvio.
 * CHAMA: /entrar (os dois fluxos). O estado é do pai; aqui é só a casca.
 * QUEBRA SE: as classes .aviso-* e .otp-input do design.css mudarem.
 */
export function PopupCodigo({
  email, codigo, onCodigo, onConfirmar, onReenviar, onFechar, rotuloFechar,
  enviando, erro, sucesso, saindo,
}: Props) {
  return (
    <div
      className={"aviso-overlay" + (saindo ? " is-saindo" : "")}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && !enviando) onFechar();
      }}
    >
      <BloquearScroll />
      <div className="aviso-card" style={{ textAlign: "center" }}>
        <h2 className="aviso-titulo">Digite o código</h2>
        <p className="aviso-p" style={{ textAlign: "center" }}>
          Enviamos um código de 6 dígitos para <b>{email}</b>. Informe o
          código abaixo para continuar.
        </p>
        <input
          className="otp-input"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          value={codigo}
          autoFocus
          onChange={(e) => onCodigo(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") onConfirmar(codigo);
          }}
          onPaste={(e) => {
            const dig = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            if (dig.length === 6) {
              e.preventDefault();
              onCodigo(dig);
              onConfirmar(dig);
            }
          }}
        />
        {erro && <p className="login-erro">{erro}</p>}
        {sucesso && <p className="login-ok">{sucesso}</p>}
        <button
          className="btn btn-primary btn-block"
          type="button"
          onClick={() => onConfirmar(codigo)}
        >
          {enviando && <span className="spinner" />}
          <span>{enviando ? "Conferindo…" : "Confirmar código"}</span>
        </button>
        <p className="login-alt" style={{ marginTop: 14 }}>
          <span>Não chegou?</span>{" "}
          <a href="#" onClick={onReenviar}>Enviar de novo</a>
        </p>
        <p className="login-alt">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onFechar();
            }}
          >
            {rotuloFechar}
          </a>
        </p>
      </div>
    </div>
  );
}
