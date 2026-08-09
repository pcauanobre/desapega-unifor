"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import CloseIcon from "@mui/icons-material/Close";
import type { ErroToque } from "@/components/useErroState";

const DURACAO_VISIVEL = 3000;
const DURACAO_SAIDA = 200;

/**
 * O QUE: mensagem de erro flutuando logo abaixo do header (portal em
 *        <body>), com entrada/saída animada. Some sozinha depois de 3s.
 *        Erra a mesma coisa de novo (mesmo tique novo) e a animação e o
 *        temporizador resetam do zero (troca o `key` do nó, força remount).
 * POR QUE: erro preso dentro do card passava despercebido; flutuando por
 *          cima, sob o header, fica visível na hora sem cobrir a marca.
 *          Usa useErroState em vez de useState puro: repetir o mesmo texto
 *          não muda o valor pro React (bailout), então sem o tique o toast
 *          não notava a tentativa nova.
 * CHAMA: qualquer form com estado de erro (wizard, entrar, conta...).
 * QUEBRA SE: nada; sem <header> na página usa o respiro padrão.
 */
export function ErroToast({ erro }: { erro: ErroToque }) {
  const [texto, setTexto] = useState(erro?.texto ?? null);
  const [tique, setTique] = useState(erro?.tique ?? null);
  const [saindo, setSaindo] = useState(false);
  const [top, setTop] = useState(20);

  // ajusta o estado local quando a prop muda, durante o render (padrão
  // recomendado do React pra isso, sem precisar de efeito)
  if (erro && erro.tique !== tique) {
    setTique(erro.tique);
    setTexto(erro.texto);
    setSaindo(false);
  } else if (!erro && tique !== null) {
    setTique(null);
    setSaindo(true);
  }

  useEffect(() => {
    if (!texto || saindo) return;
    const id = setTimeout(() => setSaindo(true), DURACAO_VISIVEL);
    return () => clearTimeout(id);
  }, [texto, tique, saindo]);

  useEffect(() => {
    if (!saindo) return;
    const id = setTimeout(() => setTexto(null), DURACAO_SAIDA);
    return () => clearTimeout(id);
  }, [saindo]);

  useEffect(() => {
    if (!texto) return;
    const id = requestAnimationFrame(() => {
      const header = document.querySelector(".header");
      setTop(header ? header.getBoundingClientRect().bottom + 12 : 20);
    });
    return () => cancelAnimationFrame(id);
  }, [texto]);

  if (!texto) return null;

  return createPortal(
    <div
      key={tique}
      className={"erro-toast" + (saindo ? " is-saindo" : "")}
      style={{ top }}
      role="alert"
    >
      <ReportProblemRoundedIcon sx={{ fontSize: 20 }} />
      <span>{texto}</span>
      <button
        type="button"
        className="erro-toast-x"
        aria-label="Fechar aviso"
        onClick={() => setSaindo(true)}
      >
        <CloseIcon sx={{ fontSize: 17 }} />
      </button>
    </div>,
    document.body
  );
}
