"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckIcon from "@mui/icons-material/Check";

type Opcao = { valor: string; rotulo: string };

type Props = {
  opcoes: Opcao[];
  valor: string;
  onMudar: (v: string) => void;
  rotuloAria: string;
  variante?: "normal" | "busca";
};

/**
 * O QUE: droplist customizado no lugar do <select> nativo: gatilho com
 *        chevron que gira, painel animado e check na opção marcada. O
 *        painel é renderizado num portal em <body> e posicionado via
 *        getBoundingClientRect do gatilho.
 * POR QUE: o painel nativo do select não acompanha o visual do design; o
 *          portal existe pra o painel nunca ficar atrás de card/dropdown
 *          vizinho, já que z-index só resolve dentro do mesmo contexto de
 *          empilhamento e cards com animação/transform criam o deles.
 * CHAMA: ordenação da vitrine, seletor de categoria da busca e os campos
 *        do wizard de anúncio/perfil.
 * QUEBRA SE: o gatilho sair da tela por completo (aí o painel também sai).
 */
export function Droplist({ opcoes, valor, onMudar, rotuloAria, variante = "normal" }: Props) {
  const [aberto, setAberto] = useState(false);
  // fechando = janela entre tirar o .aberto e o fim do dlOut no CSS;
  // sem ela o menu sumia seco antes da animação de saída rodar
  const [fechando, setFechando] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 210 });
  const raiz = useRef<HTMLDivElement>(null);
  const gatilho = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  function medir() {
    const r = gatilho.current?.getBoundingClientRect();
    if (!r) return;
    // coordenada de documento (soma o scroll atual), não de viewport: assim
    // o painel rola junto com a página sozinho, sem precisar recalcular a
    // cada evento de scroll (isso deixava o painel "atrasado" do gatilho)
    const width = Math.max(r.width, 210);
    // nunca deixa passar da borda direita da tela (senão o painel
    // "vazava" pra fora do card em campo estreito)
    const maxLeft = window.scrollX + document.documentElement.clientWidth - width - 8;
    const left = Math.min(r.left + window.scrollX, Math.max(window.scrollX + 8, maxLeft));
    setPos({ top: r.bottom + window.scrollY + 4, left, width });
  }

  function abrir() {
    // rola sozinho até o gatilho ficar visível antes de medir: sem isso,
    // abrir um campo perto do fim de um container com scroll (ex. o card
    // do wizard) deixava o painel encostado na borda
    gatilho.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    medir();
    setFechando(false);
    setAberto(true);
  }

  function fechar() {
    setAberto(false);
    setFechando(true);
  }

  useEffect(() => {
    if (!aberto) return;
    function cliqueFora(e: MouseEvent) {
      const alvo = e.target as Node;
      if (!raiz.current?.contains(alvo) && !menu.current?.contains(alvo)) fechar();
    }
    function tecla(e: KeyboardEvent) {
      if (e.key === "Escape") fechar();
    }
    document.addEventListener("mousedown", cliqueFora);
    document.addEventListener("keydown", tecla);
    window.addEventListener("resize", medir);
    return () => {
      document.removeEventListener("mousedown", cliqueFora);
      document.removeEventListener("keydown", tecla);
      window.removeEventListener("resize", medir);
    };
  }, [aberto]);

  const atual = opcoes.find((o) => o.valor === valor) ?? opcoes[0];

  const painel = (
    <div
      className={"dl-menu dl-menu-portal" + (aberto ? " aberto" : "") + (fechando ? " fechando" : "")}
      ref={menu}
      role="listbox"
      aria-hidden={!aberto}
      style={{ top: pos.top, left: pos.left, width: pos.width }}
      onAnimationEnd={(e) => {
        if (e.animationName === "dlOut") setFechando(false);
      }}
    >
      {opcoes.map((o) => (
        <button
          type="button"
          key={o.valor || "todos"}
          role="option"
          aria-selected={o.valor === valor}
          tabIndex={aberto ? 0 : -1}
          className={"dl-op" + (o.valor === valor ? " marcada" : "")}
          onClick={() => {
            onMudar(o.valor);
            fechar();
          }}
        >
          {o.rotulo}
          {o.valor === valor && <CheckIcon sx={{ fontSize: 16 }} />}
        </button>
      ))}
    </div>
  );

  return (
    <div className={"dl" + (aberto ? " aberto" : "") + (fechando ? " fechando" : "")} ref={raiz}>
      <button
        type="button"
        ref={gatilho}
        className={variante === "busca" ? "dl-gatilho-busca" : "dl-gatilho"}
        aria-label={rotuloAria}
        aria-expanded={aberto}
        onClick={aberto ? fechar : abrir}
      >
        {atual.rotulo}
        <KeyboardArrowDownIcon className="dl-chevron" sx={{ fontSize: 18 }} />
      </button>
      {/* montado sempre que aberto/fechando: se desmontasse na hora, a
          transição de saída do CSS não rodava */}
      {(aberto || fechando) && createPortal(painel, document.body)}
    </div>
  );
}
