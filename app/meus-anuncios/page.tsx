"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import CheckIcon from "@mui/icons-material/Check";
import type { Anuncio } from "@/lib/tipos";
import { createClient } from "@/lib/supabase/client";
import { TopBar } from "@/components/landing/TopBar";
import { HeaderNav } from "@/components/landing/HeaderNav";
import { Rodape } from "@/components/landing/Rodape";
import { CardAnuncio } from "@/components/CardAnuncio";
import { BloquearScroll } from "@/components/BloquearScroll";
import { useSaidaAnimada } from "@/components/useSaidaAnimada";

/**
 * O QUE: a rota dos teus anúncios: cada um com cliques recebidos, tempo
 *        no ar, botão de editar e de excluir.
 * POR QUE: separada da conta (que virou só perfil); é o painel de quem
 *          anuncia.
 * CHAMA: central do desapego e link da conta. Sem login volta pro /entrar.
 * QUEBRA SE: a API mudar GET ?autor=me, PUT ou DELETE.
 */
export default function MeusAnuncios() {
  const router = useRouter();
  const [anuncios, setAnuncios] = useState<Anuncio[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [apagando, setApagando] = useState<string | null>(null);
  const [vendendo, setVendendo] = useState<Anuncio | null>(null);
  const [vendidoOk, setVendidoOk] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const { saindo, fecharCom } = useSaidaAnimada();

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (!user) {
          router.replace("/entrar");
          return;
        }
        fetch("/api/anuncios?autor=me")
          .then(async (r) => {
            const corpo = await r.json();
            if (!r.ok) throw new Error(corpo.erro ?? "erro ao listar");
            setAnuncios(corpo.anuncios);
          })
          .catch((e: Error) => setErro(e.message));
      });
  }, [router]);

  async function excluir(id: string) {
    if (apagando) return;
    setApagando(id);
    const r = await fetch(`/api/anuncios/${id}`, { method: "DELETE" });
    setApagando(null);
    if (r.ok) setAnuncios((atuais) => (atuais ?? []).filter((a) => a.id !== id));
  }

  /* Vendido = missão cumprida: tira da vitrine e comemora no popup. */
  async function confirmarVendido() {
    if (!vendendo || finalizando) return;
    setFinalizando(true);
    const r = await fetch(`/api/anuncios/${vendendo.id}`, { method: "DELETE" });
    setFinalizando(false);
    if (r.ok) {
      const id = vendendo.id;
      setAnuncios((atuais) => (atuais ?? []).filter((a) => a.id !== id));
      setVendidoOk(true);
    }
  }

  function fecharVendido() {
    fecharCom(() => {
      setVendendo(null);
      setVendidoOk(false);
    });
  }

  return (
    <div className="pagina-1280 flex-1">
      <TopBar />
      <HeaderNav />
      <main className="container info-wrap" style={{ maxWidth: 1240 }}>
        <div>
          <Link className="pd-voltar" style={{ marginTop: 0 }} href="/anunciar">
            ← Voltar
          </Link>
        </div>
        <span className="info-kicker">MEUS ANÚNCIOS</span>
        <h1 className="info-title">Seus desapegos no ar</h1>
        <p className="info-sub">
          Acompanhe os cliques, edite o que mudou e tire do ar o que já foi.
        </p>

        {erro && <p className="shelf-sub" style={{ marginTop: 24 }}>{erro}</p>}
        {!erro && anuncios === null && (
          <div className="grid ct-grid" style={{ marginTop: 24 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="sk" key={i}>
                <div className="sk-bar sk-photo" />
                <div className="sk-bar sk-line-1" />
                <div className="sk-bar sk-line-2" />
                <div className="sk-foot">
                  <i />
                  <i />
                </div>
              </div>
            ))}
          </div>
        )}
        {!erro && anuncios !== null && anuncios.length === 0 && (
          <div className="ma-vazio">
            <span className="ma-vazio-ico">
              <StorefrontOutlinedIcon sx={{ fontSize: 32 }} />
            </span>
            <h2 className="ma-vazio-t">Sua vitrine ainda tá vazia</h2>
            <p className="ma-vazio-p">
              Todo mundo tem alguma coisa parada na gaveta. Anuncie seu
              primeiro desapego e acompanhe por aqui os cliques que ele
              receber.
            </p>
            <Link className="btn btn-hero" href="/anunciar/novo">
              Anunciar meu primeiro item
            </Link>
          </div>
        )}

        {!erro && anuncios !== null && anuncios.length > 0 && (
          <div className="grid ct-grid">
            {anuncios.map((a) => (
              <div className="ct-item" key={a.id}>
                <div className="ma-icones">
                  <button
                    className="ma-ico ma-ico-verde"
                    onClick={() => setVendendo(a)}
                    title={a.is_doacao ? "Marcar como doado" : "Marcar como vendido"}
                    aria-label={a.is_doacao ? "Marcar como doado" : "Marcar como vendido"}
                  >
                    <CheckIcon sx={{ fontSize: 18 }} />
                  </button>
                  <Link
                    className="ma-ico"
                    href={`/anunciar/novo?editar=${a.id}`}
                    title="Editar anúncio"
                    aria-label="Editar anúncio"
                  >
                    <EditIcon sx={{ fontSize: 17 }} />
                  </Link>
                  <button
                    className="ma-ico ma-ico-vermelho"
                    onClick={() => excluir(a.id)}
                    disabled={apagando === a.id}
                    title="Excluir anúncio"
                    aria-label="Excluir anúncio"
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                  </button>
                </div>
                <CardAnuncio anuncio={a} />
                <div className="ma-stats">
                  <span>
                    <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
                    {a.cliques} clique{a.cliques === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Rodape />

      {vendendo && (
        <div
          className={"aviso-overlay" + (saindo ? " is-saindo" : "")}
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget && !finalizando) fecharVendido();
          }}
        >
          <BloquearScroll />
          <div className="aviso-card" style={{ textAlign: "center" }}>
            {!vendidoOk ? (
              <>
                <h2 className="aviso-titulo">
                  {vendendo.is_doacao ? "Já foi doado?" : "Já encontrou dono novo?"}
                </h2>
                <p className="aviso-p" style={{ textAlign: "center" }}>
                  Marcar &ldquo;{vendendo.titulo}&rdquo; como{" "}
                  {vendendo.is_doacao ? "doado" : "vendido"} encerra o anúncio
                  e tira ele da vitrine na hora.
                </p>
                <div className="wiz-acoes">
                  <button className="btn wiz-voltar" onClick={fecharVendido}>
                    Ainda não
                  </button>
                  <button className="btn wiz-continuar" onClick={confirmarVendido}>
                    {finalizando && <span className="spinner" />}
                    {finalizando
                      ? "Encerrando…"
                      : vendendo.is_doacao
                        ? "Sim, foi doado"
                        : "Sim, foi vendido"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="ma-vendido-ico">
                  <CheckIcon sx={{ fontSize: 30 }} />
                </span>
                <h2 className="aviso-titulo">Desapego concluído!</h2>
                <p className="aviso-p" style={{ textAlign: "center" }}>
                  O anúncio saiu da vitrine e o item segue vida nova por aí.
                  Bora anunciar o próximo?
                </p>
                <button className="btn btn-primary btn-block" onClick={fecharVendido}>
                  Fechar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
