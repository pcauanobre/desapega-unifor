"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import PlaceIcon from "@mui/icons-material/Place";

/**
 * O QUE: o endereço da Unifor na coluna CONTATO do footer. Mouse por cima:
 *        uma linha branca varre o texto e ~1s depois um mini Google Maps
 *        abre abaixo, por cima dos outros links (o footer não estica).
 * POR QUE: mostrar onde as trocas acontecem sem sair da página. O iframe
 *          só monta no primeiro hover (lazy) e no touch o endereço vira
 *          só um link pro Maps, sem mapa embutido.
 * CHAMA: Rodape, coluna CONTATO (os outros links entram como children).
 * QUEBRA SE: as classes .loc-* do design.css mudarem, ou se um ancestral
 *            do iframe ganhar transform/filter (mata o arrasto no Chrome).
 */
const ABRIR_MS = 950; // espera a linha varrer o endereço antes de abrir

const ENDERECO = "Av. Washington Soares, 1321 - Edson Queiroz";
const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Universidade+de+Fortaleza";
const EMBED_URL =
  "https://maps.google.com/maps?q=Universidade+de+Fortaleza&z=16&output=embed";

export function LocalizacaoMapa({ children }: { children?: ReactNode }) {
  const [aberto, setAberto] = useState(false);
  const [montado, setMontado] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function entrar() {
    if (window.matchMedia("(hover: none)").matches) return;
    if (aberto || timer.current) return;
    timer.current = setTimeout(() => {
      setMontado(true);
      setAberto(true);
      timer.current = null;
    }, ABRIR_MS);
  }

  function sair() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setAberto(false);
  }

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return (
    <div className={"loc" + (aberto ? " is-open" : "")}>
      {/* hover só no endereço (e no mapa, filho do head) abre/fecha;
          passar nos outros links não ativa nada */}
      <div className="loc-head" onPointerEnter={entrar} onPointerLeave={sair}>
        <a
          className="loc-link"
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <PlaceIcon sx={{ fontSize: 16 }} />
          <span className="loc-texto">{ENDERECO}</span>
        </a>
        <div className="loc-mapa" aria-hidden="true">
          {montado && (
            <iframe
              src={EMBED_URL}
              title="Google Maps"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          )}
        </div>
      </div>
      <div className="loc-resto">{children}</div>
    </div>
  );
}
