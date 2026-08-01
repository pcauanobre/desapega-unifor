"use client";

import { useEffect, useRef, useState } from "react";
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
 *        chevron que gira, painel animado e check na opção marcada.
 * POR QUE: o painel nativo do select não acompanha o visual do design.
 * CHAMA: ordenação da vitrine e seletor de categoria da busca.
 * QUEBRA SE: nada; fecha em clique fora e na tecla Escape.
 */
export function Droplist({ opcoes, valor, onMudar, rotuloAria, variante = "normal" }: Props) {
  const [aberto, setAberto] = useState(false);
  // fechando = janela entre tirar o .aberto e o fim do dlOut no CSS;
  // sem ela o menu sumia seco antes da animação de saída rodar
  const [fechando, setFechando] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);

  function abrir() {
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
      if (!raiz.current?.contains(e.target as Node)) fechar();
    }
    function tecla(e: KeyboardEvent) {
      if (e.key === "Escape") fechar();
    }
    document.addEventListener("mousedown", cliqueFora);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", cliqueFora);
      document.removeEventListener("keydown", tecla);
    };
  }, [aberto]);

  const atual = opcoes.find((o) => o.valor === valor) ?? opcoes[0];

  return (
    <div className={"dl" + (aberto ? " aberto" : "") + (fechando ? " fechando" : "")} ref={raiz}>
      <button
        type="button"
        className={variante === "busca" ? "dl-gatilho-busca" : "dl-gatilho"}
        aria-label={rotuloAria}
        aria-expanded={aberto}
        onClick={aberto ? fechar : abrir}
      >
        {atual.rotulo}
        <KeyboardArrowDownIcon className="dl-chevron" sx={{ fontSize: 18 }} />
      </button>
      {/* montado sempre: se desmontasse ao fechar, a transição de saída
          do CSS não rodava; visibility:hidden tira do tab e do leitor de tela */}
      <div
        className="dl-menu"
        role="listbox"
        aria-hidden={!aberto}
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
    </div>
  );
}
