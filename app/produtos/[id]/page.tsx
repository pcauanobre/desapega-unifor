"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PlaceIcon from "@mui/icons-material/Place";
import SchoolIcon from "@mui/icons-material/School";
import ScheduleIcon from "@mui/icons-material/Schedule";
import LockIcon from "@mui/icons-material/Lock";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import type { Anuncio } from "@/lib/tipos";
import { tempoRelativo } from "@/lib/tempo";
import { TopBar } from "@/components/landing/TopBar";
import { HeaderNav } from "@/components/landing/HeaderNav";
import { Rodape } from "@/components/landing/Rodape";
import { Carrossel } from "@/components/produto/Carrossel";

/**
 * O QUE: a página do produto: carrossel de fotos, descrição, preço ou
 *        doação, bloco de retirada, curso do autor e contato.
 * POR QUE: o contato só vem da API pra usuário logado; visitante vê o
 *          convite pra entrar no lugar do botão de WhatsApp.
 * CHAMA: clique em qualquer card da vitrine.
 * QUEBRA SE: a API mudar o formato { anuncio: {...} }.
 */
export default function PaginaProduto() {
  const { id } = useParams<{ id: string }>();
  const [anuncio, setAnuncio] = useState<Anuncio | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/anuncios/${id}`)
      .then(async (r) => {
        const corpo = await r.json();
        if (!r.ok) throw new Error(corpo.erro ?? "erro ao carregar");
        setAnuncio(corpo.anuncio);
      })
      .catch((e: Error) => setErro(e.message));
  }, [id]);

  const fotos = anuncio
    ? (anuncio.fotos?.length ? anuncio.fotos : [anuncio.imagem_url].filter(Boolean) as string[])
    : [];
  const contatoVisivel = anuncio !== null && "contato" in anuncio;

  return (
    <div className="pagina-1280 flex-1">
      <TopBar />
      <HeaderNav />
      {!erro && anuncio && (
        <div className="container">
          <Link className="pd-voltar" href="/produtos">← Voltar pra vitrine</Link>
        </div>
      )}

      {erro && (
        <main className="container" style={{ padding: "56px 24px" }}>
          <h1 className="shelf-title">Anúncio não encontrado</h1>
          <p className="shelf-sub">{erro}</p>
          <p style={{ marginTop: 18 }}>
            <Link className="btn btn-outline" href="/produtos">Ver a vitrine</Link>
          </p>
        </main>
      )}

      {!erro && !anuncio && (
        <main className="container pd-sk">
          <div className="sk-bar pd-sk-foto" />
          <div>
            <div className="sk-bar pd-sk-l1" />
            <div className="sk-bar pd-sk-l2" />
            <div className="sk-bar pd-sk-l3" />
          </div>
        </main>
      )}

      {!erro && anuncio && (
        <main className="container pd">
          <div>
            <Carrossel fotos={fotos} titulo={anuncio.titulo} />
          </div>

          <div>
            <div className="pd-cat-row">
              <span className="card-cat">{anuncio.categoria.toUpperCase()}</span>
              {anuncio.estado && <span className="pd-estado">{anuncio.estado}</span>}
            </div>

            <h1 className="pd-titulo">{anuncio.titulo}</h1>

            <div className="pd-preco-row">
              {anuncio.is_doacao ? (
                <span className="card-donation pd-donation-lg">DOAÇÃO</span>
              ) : (
                <span className="pd-preco">{brl(anuncio.preco)}</span>
              )}
            </div>

            <p className="pd-desc">{anuncio.descricao}</p>

            <div className="pd-infos">
              <span className="pd-info">
                <PlaceIcon sx={{ fontSize: 20 }} />
                Retirada: <b>{anuncio.bloco ?? "a combinar"}</b>
              </span>
              <span className="pd-info">
                <ScheduleIcon sx={{ fontSize: 20 }} />
                Publicado <b>{tempoRelativo(anuncio.created_at)}</b>
              </span>
            </div>

            <div className="pd-vendedor">
              <span className="pd-avatar">{anuncio.autor_nome.charAt(0)}</span>
              <span>
                <span className="pd-vend-nome">{anuncio.autor_nome}</span>
                <br />
                <span className="pd-vend-curso">
                  <SchoolIcon sx={{ fontSize: 14 }} />
                  {anuncio.autor_curso ?? "Aluno da Unifor"}
                </span>
              </span>

              {contatoVisivel ? (
                anuncio.contato ? (
                  <a
                    className="btn btn-zap"
                    href={linkWhatsApp(anuncio.contato)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsAppIcon sx={{ fontSize: 18 }} />
                    {anuncio.contato}
                  </a>
                ) : (
                  <span className="pd-lock">contato não informado</span>
                )
              ) : (
                <span className="pd-lock">
                  <LockIcon sx={{ fontSize: 16 }} />
                  <Link href="/entrar">Entre</Link>&nbsp;pra ver o contato
                </span>
              )}
            </div>
          </div>
        </main>
      )}

      <Rodape />
    </div>
  );
}

/* "R$ 1.250" sem centavos, mesmo formato dos cards. */
function brl(valor: number | null): string {
  return (
    "R$ " +
    Number(valor ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })
  );
}

/* Vira link wa.me: só dígitos, com 55 na frente se for número local. */
function linkWhatsApp(contato: string): string {
  const digitos = contato.replace(/\D/g, "");
  const completo = digitos.length <= 11 ? "55" + digitos : digitos;
  return `https://wa.me/${completo}`;
}
