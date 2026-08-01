"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AddIcon from "@mui/icons-material/Add";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { createClient } from "@/lib/supabase/client";

/* Telas que já são um fluxo próprio, sem barra por baixo. */
const SEM_NAV = ["/entrar", "/bem-vindo"];

/**
 * O QUE: a bottom nav do app mobile: Início (a landing), Vitrine, o botão
 *        saltado de Anunciar, Anúncios e Conta. Só aparece até 760px
 *        (CSS); no desktop a navegação segue no topo.
 * POR QUE: no celular o polegar mora embaixo; é o desenho do protótipo
 *          mobile do design.
 * CHAMA: layout raiz, em todas as páginas fora de SEM_NAV.
 * QUEBRA SE: as rotas mudarem de nome ou as classes .bnav-* sumirem.
 */
export function BottomNav() {
  const pathname = usePathname();
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data }) => setUid(data.session?.user.id ?? null));
  }, [pathname]);

  if (SEM_NAV.some((rota) => pathname.startsWith(rota))) return null;

  /* Aba que precisa de conta manda o visitante pro /entrar. */
  const logado = (rota: string) => (uid ? rota : "/entrar");
  const classe = (ativo: boolean) => "bnav-item" + (ativo ? " is-on" : "");

  return (
    <>
      <div className="bnav-espaco" />
      <nav className="bnav" aria-label="Navegação do app">
        <Link className={classe(pathname === "/")} href="/">
          <HomeOutlinedIcon sx={{ fontSize: 23 }} />
          Início
        </Link>
        <Link
          className={classe(pathname.startsWith("/produtos"))}
          href="/produtos"
        >
          <StorefrontOutlinedIcon sx={{ fontSize: 23 }} />
          Vitrine
        </Link>
        <span className="bnav-fab">
          <Link className="bnav-btn" href={logado("/anunciar/novo")} aria-label="Anunciar">
            <AddIcon sx={{ fontSize: 28 }} />
          </Link>
          <i>Anunciar</i>
        </span>
        <Link
          className={classe(pathname.startsWith("/meus-anuncios"))}
          href={logado("/meus-anuncios")}
        >
          <Inventory2OutlinedIcon sx={{ fontSize: 23 }} />
          Anúncios
        </Link>
        <Link className={classe(pathname.startsWith("/conta"))} href={logado("/conta")}>
          <SettingsOutlinedIcon sx={{ fontSize: 23 }} />
          Conta
        </Link>
      </nav>
    </>
  );
}
