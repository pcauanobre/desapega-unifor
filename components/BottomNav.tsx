"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AddIcon from "@mui/icons-material/Add";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
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
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [puloFab, setPuloFab] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data }) => setUid(data.session?.user.id ?? null));
  }, [pathname]);

  if (SEM_NAV.some((rota) => pathname.startsWith(rota))) return null;

  /* Aba que precisa de conta manda o visitante pro /entrar, avisando pra
     onde ele queria ir: depois de entrar (e do setup, se for conta nova)
     ele cai na aba que clicou, não na home. */
  const logado = (rota: string) =>
    uid ? rota : `/entrar?voltar=${encodeURIComponent(rota)}`;
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
          {/* o toque toca a animação inteira; a navegação espera ela acabar */}
          <Link
            className={"bnav-btn" + (puloFab ? " is-pulo" : "")}
            href={logado("/anunciar/novo")}
            aria-label="Anunciar"
            onClick={(e) => {
              e.preventDefault();
              if (puloFab) return;
              setPuloFab(true);
              const destino = logado("/anunciar/novo");
              setTimeout(() => {
                router.push(destino);
                setPuloFab(false);
              }, 260);
            }}
          >
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
          <PersonOutlinedIcon sx={{ fontSize: 23 }} />
          Conta
        </Link>
      </nav>
    </>
  );
}
