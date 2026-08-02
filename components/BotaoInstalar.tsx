"use client";

import { useEffect, useState } from "react";
import InstallMobileIcon from "@mui/icons-material/InstallMobile";

/* O evento beforeinstallprompt ainda não tem tipo no TS padrão. */
type EventoInstalar = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * O QUE: o botão "Instalar app": aparece só quando o navegador avisa que
 *        o PWA é instalável (beforeinstallprompt) e dispara o prompt
 *        nativo de instalação no clique.
 * POR QUE: sem o botão o convite de instalar fica escondido no menu do
 *          navegador; com ele a instalação vira um clique visível.
 * CHAMA: TopBar. Some sozinho depois de instalado (appinstalled).
 * QUEBRA SE: nada; navegador sem suporte (iOS) simplesmente não mostra.
 */
export function BotaoInstalar({ mobile = false }: { mobile?: boolean }) {
  const [evento, setEvento] = useState<EventoInstalar | null>(null);

  useEffect(() => {
    function guardar(e: Event) {
      e.preventDefault();
      setEvento(e as EventoInstalar);
    }
    function instalado() {
      setEvento(null);
    }
    window.addEventListener("beforeinstallprompt", guardar);
    window.addEventListener("appinstalled", instalado);
    return () => {
      window.removeEventListener("beforeinstallprompt", guardar);
      window.removeEventListener("appinstalled", instalado);
    };
  }, []);

  if (!evento) return null;

  async function instalar() {
    if (!evento) return;
    await evento.prompt();
    const { outcome } = await evento.userChoice;
    if (outcome === "accepted") setEvento(null);
  }

  return (
    <button
      className={"btn-instalar" + (mobile ? " btn-instalar-mobile" : "")}
      onClick={instalar}
    >
      <InstallMobileIcon sx={{ fontSize: 15 }} />
      Instalar app
    </button>
  );
}
