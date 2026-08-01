"use client";

import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { BloquearScroll } from "@/components/BloquearScroll";
import type { EstadoDoItem } from "@/lib/tipos";

const ESTADOS: EstadoDoItem[] = ["Como novo", "Bom estado", "Usado", "Funcionando"];
const PASSO = 5;

export type Filtros = {
  min: number;
  max: number;
  estados: EstadoDoItem[];
  doacoes: boolean;
};

type Props = {
  teto: number;
  atual: Filtros | null;
  onFechar: () => void;
  onAplicar: (f: Filtros | null) => void;
};

/**
 * O QUE: o popup de filtros da vitrine: faixa de preço num slider de duas
 *        bolinhas, estado do item em chips e a opção de esconder doações.
 * POR QUE: a ordenação sozinha não recorta a vitrine por preço.
 * CHAMA: botão "Filtros" da Vitrine; quem aplica de fato é /produtos.
 * QUEBRA SE: os valores de EstadoDoItem mudarem no banco e aqui não.
 */
export function FiltrosPopup({ teto, atual, onFechar, onAplicar }: Props) {
  const [min, setMin] = useState(atual?.min ?? 0);
  const [max, setMax] = useState(atual?.max ?? teto);
  const [estados, setEstados] = useState<EstadoDoItem[]>(atual?.estados ?? []);
  const [doacoes, setDoacoes] = useState(atual?.doacoes ?? true);

  const pct = (v: number) => `${(v / teto) * 100}%`;
  const padrao = min === 0 && max === teto && estados.length === 0 && doacoes;

  function alternarEstado(e: EstadoDoItem) {
    setEstados((atuais) =>
      atuais.includes(e) ? atuais.filter((x) => x !== e) : [...atuais, e],
    );
  }

  return (
    <div
      className="aviso-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      <BloquearScroll />
      <div className="aviso-card fx-card">
        <div className="fx-cabeca">
          <h2 className="aviso-titulo" style={{ margin: 0 }}>Filtros</h2>
          <button className="fx-fechar" onClick={onFechar} aria-label="Fechar">
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        <div className="fx-sec">
          <span className="field-label">Faixa de preço</span>
          <div className="fx-valores">
            <strong>R$ {min}</strong>
            <strong>
              R$ {max}
              {max === teto ? "+" : ""}
            </strong>
          </div>
          <div className="fx-slider">
            <div className="fx-trilho" />
            <div
              className="fx-faixa"
              style={{ left: pct(min), right: `${100 - (max / teto) * 100}%` }}
            />
            {/* dois ranges sobrepostos: só as bolinhas recebem clique */}
            <input
              type="range"
              min={0}
              max={teto}
              step={PASSO}
              value={min}
              aria-label="Preço mínimo"
              style={{ zIndex: min >= max - PASSO ? 5 : 3 }}
              onChange={(e) => setMin(Math.min(Number(e.target.value), max - PASSO))}
            />
            <input
              type="range"
              min={0}
              max={teto}
              step={PASSO}
              value={max}
              aria-label="Preço máximo"
              style={{ zIndex: 4 }}
              onChange={(e) => setMax(Math.max(Number(e.target.value), min + PASSO))}
            />
          </div>
        </div>

        <div className="fx-sec">
          <span className="field-label">Estado do item</span>
          <div className="fx-chips">
            {ESTADOS.map((e) => (
              <button
                key={e}
                type="button"
                className={"chip" + (estados.includes(e) ? " is-active" : "")}
                onClick={() => alternarEstado(e)}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <label className="fx-check">
          <input
            type="checkbox"
            checked={doacoes}
            onChange={(e) => setDoacoes(e.target.checked)}
          />
          Mostrar doações junto
        </label>

        <div className="wiz-acoes">
          <button className="btn wiz-voltar" onClick={() => onAplicar(null)}>
            Limpar
          </button>
          <button
            className="btn wiz-continuar"
            onClick={() => onAplicar(padrao ? null : { min, max, estados, doacoes })}
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  );
}
