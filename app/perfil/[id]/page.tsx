"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import type { Anuncio, PerfilPublico } from "@/lib/tipos";
import { tempoRelativo } from "@/lib/tempo";
import { TopBar } from "@/components/landing/TopBar";
import { HeaderNav } from "@/components/landing/HeaderNav";
import { Rodape } from "@/components/landing/Rodape";
import { CardAnuncio } from "@/components/CardAnuncio";

/**
 * O QUE: o perfil público do vendedor: foto, curso, estatísticas reais
 *        (membro desde, último acesso, vendas, doações) e o histórico:
 *        itens no ar + desapegos concluídos com selo.
 * POR QUE: quem vai negociar quer saber com quem tá falando; histórico
 *          e tempo de casa são a reputação da plataforma.
 * CHAMA: clique no card do vendedor na página do produto.
 * QUEBRA SE: a API mudar /api/perfil/[id] ou ?autor=&vendidos=1.
 */
export default function PerfilVendedor() {
  const { id } = useParams<{ id: string }>();
  const [perfil, setPerfil] = useState<PerfilPublico | null>(null);
  const [ativos, setAtivos] = useState<Anuncio[] | null>(null);
  const [vendidos, setVendidos] = useState<Anuncio[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/perfil/${id}`),
      fetch(`/api/anuncios?autor=${id}`),
      fetch(`/api/anuncios?autor=${id}&vendidos=1`),
    ])
      .then(async ([rPerfil, rAtivos, rVendidos]) => {
        const p = await rPerfil.json();
        if (!rPerfil.ok) throw new Error(p.erro ?? "perfil não encontrado");
        const a = await rAtivos.json();
        const v = await rVendidos.json();
        setPerfil(p.perfil);
        setAtivos(rAtivos.ok ? a.anuncios : []);
        setVendidos(rVendidos.ok ? v.anuncios : []);
      })
      .catch((e: Error) => setErro(e.message));
  }, [id]);

  const carregando = !erro && (!perfil || ativos === null || vendidos === null);

  return (
    <div className="pagina-1280 flex-1">
      <TopBar />
      <HeaderNav />
      <main className="container info-wrap" style={{ maxWidth: 1240 }}>
        <div>
          <Link className="pd-voltar" style={{ marginTop: 0 }} href="/produtos">
            ← Voltar
          </Link>
        </div>

        {erro && (
          <>
            <h1 className="shelf-title">Perfil não encontrado</h1>
            <p className="shelf-sub">{erro}</p>
          </>
        )}

        {carregando && (
          <div>
            <div className="sk-bar pd-sk-l2" />
            <div className="sk-bar pd-sk-l1" style={{ width: "45%" }} />
            <div className="sk-bar pd-sk-l3" style={{ height: 120 }} />
          </div>
        )}

        {!erro && !carregando && perfil && (
          <>
            <div className="pf-cabeca">
              <span className="pf-avatar">
                {perfil.foto ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={perfil.foto} alt={`Foto de ${perfil.nome}`} />
                ) : (
                  <PersonIcon sx={{ fontSize: 42 }} />
                )}
              </span>
              <div>
                <span className="info-kicker">PERFIL DO VENDEDOR</span>
                <h1 className="info-title" style={{ marginTop: 4 }}>{perfil.nome}</h1>
                <p className="pf-curso">
                  <SchoolIcon sx={{ fontSize: 16 }} />
                  {perfil.curso ?? "Aluno da Unifor"}
                  {perfil.semestre ? ` · ${perfil.semestre}` : ""}
                </p>
              </div>
            </div>

            <div className="pf-stats">
              <div className="pf-stat">
                <CalendarMonthIcon sx={{ fontSize: 20 }} />
                <strong>{mesAno(perfil.desde)}</strong>
                <span>no Desapega desde</span>
              </div>
              <div className="pf-stat">
                <ScheduleIcon sx={{ fontSize: 20 }} />
                <strong>
                  {perfil.ultimo_acesso ? tempoRelativo(perfil.ultimo_acesso) : "sem registro"}
                </strong>
                <span>última vez online</span>
              </div>
              <div className="pf-stat">
                <SellOutlinedIcon sx={{ fontSize: 20 }} />
                <strong>{perfil.vendas}</strong>
                <span>venda{perfil.vendas === 1 ? "" : "s"} concluída{perfil.vendas === 1 ? "" : "s"}</span>
              </div>
              <div className="pf-stat pf-stat-verde">
                <VolunteerActivismIcon sx={{ fontSize: 20 }} />
                <strong>{perfil.doacoes}</strong>
                <span>doaç{perfil.doacoes === 1 ? "ão feita" : "ões feitas"}</span>
              </div>
            </div>

            <h2 className="pf-secao">
              No ar agora <span className="pf-conta">{ativos!.length}</span>
            </h2>
            {ativos!.length === 0 ? (
              <p className="shelf-sub">Nenhum item no ar neste momento.</p>
            ) : (
              <div className="grid ct-grid">
                {ativos!.map((a) => (
                  <CardAnuncio key={a.id} anuncio={a} />
                ))}
              </div>
            )}

            <h2 className="pf-secao">
              Histórico de desapegos <span className="pf-conta">{vendidos!.length}</span>
            </h2>
            {vendidos!.length === 0 ? (
              <p className="shelf-sub">Ainda sem desapegos concluídos por aqui.</p>
            ) : (
              <div className="grid ct-grid">
                {vendidos!.map((a) => (
                  <div className="pf-vendido" key={a.id}>
                    <span className={"pf-selo" + (a.is_doacao ? " verde" : "")}>
                      {a.is_doacao ? "DOADO" : "VENDIDO"}
                    </span>
                    <CardAnuncio anuncio={a} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Rodape />
    </div>
  );
}

/* "março de 2026", direto do Intl, sem lib de data. */
function mesAno(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "";
  return data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}
