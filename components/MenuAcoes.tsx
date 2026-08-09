"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import SettingsIcon from "@mui/icons-material/Settings";

export type Acao = {
  rotulo: string;
  icone: React.ReactNode;
  onClick: () => void;
  perigo?: boolean;
  disabled?: boolean;
};

/**
 * O QUE: botão de engrenagem que abre um menu de ações (editar, excluir...)
 *        no lugar de vários ícones soltos no card. Painel num portal em
 *        <body>, mesmo esquema de posição do Droplist.
 * POR QUE: card com 3 ícones fixos ficava poluído; um gatilho só com o
 *          menu escondido é mais limpo e escala pra mais ações no futuro.
 * CHAMA: cards de "Meus anúncios".
 * QUEBRA SE: a lista de ações vier vazia (o botão ainda aparece, sem itens).
 */
export function MenuAcoes({ acoes, rotuloAria }: { acoes: Acao[]; rotuloAria: string }) {
  const [aberto, setAberto] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const raiz = useRef<HTMLDivElement>(null);
  const gatilho = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  function medir() {
    const r = gatilho.current?.getBoundingClientRect();
    if (!r) return;
    // coordenada de documento (soma o scroll atual): o painel rola junto
    // com a página sozinho, sem precisar recalcular a cada scroll
    setPos({
      top: r.bottom + window.scrollY + 6,
      left: Math.max(8, r.right + window.scrollX - 190),
    });
  }

  function abrir() {
    medir();
    setAberto(true);
  }

  useEffect(() => {
    if (!aberto) return;
    function cliqueFora(e: MouseEvent) {
      const alvo = e.target as Node;
      if (!raiz.current?.contains(alvo) && !menu.current?.contains(alvo)) setAberto(false);
    }
    function tecla(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
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

  return (
    <div className="ma-menu" ref={raiz}>
      <button
        type="button"
        ref={gatilho}
        className="ma-gear"
        aria-label={rotuloAria}
        aria-expanded={aberto}
        onClick={() => (aberto ? setAberto(false) : abrir())}
      >
        <SettingsIcon sx={{ fontSize: 18 }} />
      </button>
      {aberto &&
        createPortal(
          <div
            className="dl-menu-portal ma-menu-portal aberto"
            ref={menu}
            role="menu"
            style={{ top: pos.top, left: pos.left, width: 190 }}
          >
            {acoes.map((a) => (
              <button
                type="button"
                key={a.rotulo}
                role="menuitem"
                className={"dl-op" + (a.perigo ? " ma-op-perigo" : "")}
                disabled={a.disabled}
                onClick={() => {
                  setAberto(false);
                  a.onClick();
                }}
              >
                {a.rotulo}
                {a.icone}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
