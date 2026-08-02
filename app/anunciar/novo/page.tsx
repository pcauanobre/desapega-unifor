"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIAS } from "@/lib/categorias";
import { LOCAIS } from "@/lib/locais";
import { ESTADOS, type Anuncio } from "@/lib/tipos";
import { TopBar } from "@/components/landing/TopBar";
import { HeaderNav } from "@/components/landing/HeaderNav";
import { Rodape } from "@/components/landing/Rodape";
import { Droplist } from "@/components/Droplist";
import { FotosUpload } from "@/components/anunciar/FotosUpload";
import { BloquearScroll } from "@/components/BloquearScroll";
import { EditorFoto } from "@/components/EditorFoto";
import { prepararFoto } from "@/lib/otimizar-foto";
import CheckIcon from "@mui/icons-material/Check";

/* As etapas do wizard de anunciar (o mesmo clima do setup de conta). */
const ETAPAS_AN = [
  { titulo: "Mostre seu item", sub: "Até 5 fotos; a primeira vira a capa na vitrine." },
  { titulo: "Conte o que é", sub: "Título direto e descrição honesta acham dono mais rápido." },
  { titulo: "Onde ele se encaixa", sub: "Categoria, estado de conservação e o ponto de retirada." },
  { titulo: "Feche o anúncio", sub: "Defina o preço ou marque como doação e publique." },
];

/**
 * O QUE: anunciar em dois modos: CRIAR vira um wizard de 4 etapas com
 *        barra de progresso (fotos → o que é → encaixe → preço), e EDITAR
 *        (?editar=id, PUT) mantém o formulário completo pré-preenchido.
 * POR QUE: criar pede mão na roda passo a passo; editar pede visão geral.
 * CHAMA: central de anúncios (novo) e meus anúncios (editar).
 * QUEBRA SE: o bucket "fotos" não existir no Storage (migration 006).
 */
export default function NovoAnuncio() {
  const router = useRouter();
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [etapa, setEtapa] = useState(0);
  /* Direção da troca de etapa: o passo entra do lado certo (avançando
     vem da direita, voltando vem da esquerda). */
  const [voltandoEtapa, setVoltandoEtapa] = useState(false);
  const [fotosExistentes, setFotosExistentes] = useState<string[]>([]);
  const [arquivos, setArquivos] = useState<Blob[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [filaCorte, setFilaCorte] = useState<File[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [doacao, setDoacao] = useState(false);
  const [preco, setPreco] = useState("");
  const [estado, setEstado] = useState("");
  const [bloco, setBloco] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [publicadoId, setPublicadoId] = useState<string | null>(null);
  const [pronto, setPronto] = useState(false);
  const [carregandoEdicao, setCarregandoEdicao] = useState(false);
  const usuario = useRef<string | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (!user) {
          router.replace("/entrar?voltar=" + encodeURIComponent(window.location.pathname));
          return;
        }
        usuario.current = user.id;

        // O modo (novo ou edição) é decidido AQUI, antes de qualquer
        // título aparecer; a tela nunca pisca "Bora desapegar" na edição.
        const idEditar = new URLSearchParams(window.location.search).get("editar");
        if (idEditar) {
          setEditandoId(idEditar);
          setCarregandoEdicao(true);
          fetch(`/api/anuncios/${idEditar}`)
            .then(async (r) => {
              const corpo = await r.json();
              if (!r.ok) throw new Error(corpo.erro);
              const a = corpo.anuncio as Anuncio;
              setTitulo(a.titulo);
              setDescricao(a.descricao);
              setCategoria(a.categoria);
              setDoacao(a.is_doacao);
              setPreco(a.preco === null ? "" : String(a.preco));
              setEstado(a.estado ?? "");
              setBloco(a.bloco ?? "");
              setFotosExistentes(
                a.fotos?.length ? a.fotos : a.imagem_url ? [a.imagem_url] : [],
              );
              setCarregandoEdicao(false);
            })
            .catch(() => setErro("Não deu pra carregar o anúncio pra edição."));
        }
        setPronto(true);
      });
  }, [router]);

  const previewsTotais = [...fotosExistentes, ...previews];

  /* Cada foto escolhida passa pelo editor de corte (4:3) antes de entrar. */
  function escolherFotos(lista: FileList | null) {
    if (!lista) return;
    const espaco = 5 - previewsTotais.length - filaCorte.length;
    if (espaco <= 0) return;
    // Encolhe antes de entrar na fila: foto de 12MP do celular trava o
    // editor de corte, e assim foto grande passa a ser bem-vinda.
    Promise.all(Array.from(lista).slice(0, espaco).map(prepararFoto)).then((prontas) =>
      setFilaCorte((fila) => [...fila, ...prontas]),
    );
  }

  function fotoCortada(blob: Blob) {
    setArquivos((atuais) => [...atuais, blob]);
    setPreviews((atuais) => [...atuais, URL.createObjectURL(blob)]);
    setFilaCorte((fila) => fila.slice(1));
  }

  function removerFoto(i: number) {
    if (i < fotosExistentes.length) {
      setFotosExistentes(fotosExistentes.filter((_, j) => j !== i));
      return;
    }
    const idx = i - fotosExistentes.length;
    setArquivos(arquivos.filter((_, j) => j !== idx));
    setPreviews(previews.filter((_, j) => j !== idx));
  }

  /* No wizard cada etapa valida só a parte dela antes de seguir. */
  function avancar() {
    setErro(null);
    if (etapa === 0 && previewsTotais.length === 0) {
      return setErro("Coloque pelo menos uma foto.");
    }
    if (etapa === 1) {
      if (titulo.trim().length < 3) return setErro("Capriche no título (mínimo 3 letras).");
      if (descricao.trim().length < 10) return setErro("Descreva um pouco mais o item.");
    }
    if (etapa === 2 && !categoria) return setErro("Escolha a categoria.");
    if (etapa < ETAPAS_AN.length - 1) {
      setVoltandoEtapa(false);
      return setEtapa(etapa + 1);
    }
    publicar();
  }

  async function publicar(e?: React.FormEvent) {
    e?.preventDefault();
    if (enviando) return;
    setErro(null);

    if (titulo.trim().length < 3) return setErro("Capriche no título (mínimo 3 letras).");
    if (descricao.trim().length < 10) return setErro("Descreva um pouco mais o item.");
    if (!categoria) return setErro("Escolha a categoria.");
    if (!doacao && (!preco || Number(preco) <= 0)) return setErro("Informe o preço ou marque como doação.");
    if (previewsTotais.length === 0) return setErro("Coloque pelo menos uma foto.");

    setEnviando(true);
    try {
      const supabase = createClient();
      const novasUrls: string[] = [];
      for (const [i, blob] of arquivos.entries()) {
        // Já saiu do editor cortada e otimizada; é só subir.
        const caminho = `${usuario.current}/${Date.now()}-${i}.webp`;
        const { error } = await supabase.storage
          .from("fotos")
          .upload(caminho, blob, { contentType: "image/webp" });
        if (error) throw new Error("upload falhou: " + error.message);
        novasUrls.push(supabase.storage.from("fotos").getPublicUrl(caminho).data.publicUrl);
      }
      const fotos = [...fotosExistentes, ...novasUrls];

      const resposta = await fetch(
        editandoId ? `/api/anuncios/${editandoId}` : "/api/anuncios",
        {
          method: editandoId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titulo, descricao, categoria,
            preco: doacao ? null : Number(preco),
            is_doacao: doacao,
            estado: estado || null,
            bloco: bloco || null,
            fotos,
          }),
        },
      );
      const corpo = await resposta.json();
      if (!resposta.ok) throw new Error(corpo.erro ?? "não deu pra salvar");
      setPublicadoId(corpo.anuncio.id);
    } catch (excecao) {
      setErro((excecao as Error).message);
      setEnviando(false);
    }
  }

  /* Campos compartilhados entre o wizard (uma etapa por vez) e a edição. */
  const campoTitulo = (
    <label className="field">
      <span className="field-label">Título</span>
      <input type="text" placeholder="Ex: Calculadora HP 12C Platinum" maxLength={80}
        value={titulo} onChange={(e) => setTitulo(e.target.value)} />
    </label>
  );
  const campoDescricao = (
    <label className="field">
      <span className="field-label">Descrição</span>
      <textarea className="an-textarea" placeholder="Estado real, tempo de uso, o que acompanha..."
        maxLength={500} rows={4} value={descricao}
        onChange={(e) => setDescricao(e.target.value)} />
    </label>
  );
  const campoCategoria = (
    <div className="wiz-dl">
      <span className="field-label">Categoria</span>
      <Droplist rotuloAria="Categoria" valor={categoria} onMudar={setCategoria}
        opcoes={[{ valor: "", rotulo: "Escolha a categoria" },
          ...CATEGORIAS.map((c) => ({ valor: c, rotulo: c }))]} />
    </div>
  );
  const campoEstado = (
    <div className="wiz-dl">
      <span className="field-label">Estado do item</span>
      <Droplist rotuloAria="Estado do item" valor={estado} onMudar={setEstado}
        opcoes={[{ valor: "", rotulo: "Como ele está?" },
          ...ESTADOS.map((s) => ({ valor: s, rotulo: s }))]} />
    </div>
  );
  const campoLocal = (
    <div className="wiz-dl">
      <span className="field-label">Local de retirada</span>
      <Droplist rotuloAria="Local de retirada" valor={bloco} onMudar={setBloco}
        opcoes={[{ valor: "", rotulo: "Onde encontrar?" },
          ...LOCAIS.map((l) => ({ valor: l, rotulo: l }))]} />
    </div>
  );
  const campoPreco = (
    <div className="an-linha">
      <label className="field">
        <span className="field-label">Preço (R$)</span>
        <input type="number" min="1" step="1" placeholder="Ex: 45" disabled={doacao}
          value={doacao ? "" : preco} onChange={(e) => setPreco(e.target.value)} />
      </label>
      <label className="an-switch">
        <input type="checkbox" checked={doacao} onChange={(e) => setDoacao(e.target.checked)} />
        <span className="an-switch-pista"><span className="an-switch-bola" /></span>
        É doação
      </label>
    </div>
  );
  const campoFotos = (
    <FotosUpload previews={previewsTotais} onEscolher={escolherFotos} onRemover={removerFoto} />
  );

  return (
    <div className="pagina-1280 flex-1">
      <TopBar />
      <HeaderNav />

      {(!pronto || carregandoEdicao) && (
        <main className="container info-wrap">
          <div>
            <div className="sk-bar pd-sk-l2" />
            <div className="sk-bar pd-sk-l1" style={{ width: "55%" }} />
            <div className="sk-bar pd-sk-l3" style={{ height: 300 }} />
          </div>
        </main>
      )}

      {/* CRIAR: wizard de etapas, mesmo clima do setup de conta */}
      {pronto && !carregandoEdicao && !editandoId && (
        <div className="wiz-fundo">
          <div className="wiz-card wiz-card-anuncio">
            <div className="wiz-topo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/mark-blue.svg" alt="Desapega Unifor" className="wiz-marca" />
              <span className="wiz-conta">
                {etapa + 1} / {ETAPAS_AN.length}
              </span>
            </div>
            <div className="wiz-barra">
              <i style={{ width: `${((etapa + 1) / ETAPAS_AN.length) * 100}%` }} />
            </div>

            <div
              className={"wiz-passo" + (voltandoEtapa ? " voltando" : "")}
              key={etapa}
            >
              <h1 className="wiz-titulo">{ETAPAS_AN[etapa].titulo}</h1>
              <p className="wiz-sub">{ETAPAS_AN[etapa].sub}</p>
              <div className="wiz-corpo">
                {etapa === 0 && campoFotos}
                {etapa === 1 && (
                  <>
                    {campoTitulo}
                    {campoDescricao}
                  </>
                )}
                {etapa === 2 && (
                  <>
                    <div className="an-linha">
                      {campoCategoria}
                      {campoEstado}
                    </div>
                    {campoLocal}
                  </>
                )}
                {etapa === 3 && campoPreco}
              </div>
            </div>

            {erro && <p className="login-erro">{erro}</p>}

            <div className="wiz-acoes">
              {etapa === 0 ? (
                <Link className="btn wiz-voltar" href="/anunciar">
                  Cancelar
                </Link>
              ) : (
                <button
                  className="btn wiz-voltar"
                  onClick={() => {
                    setErro(null);
                    setVoltandoEtapa(true);
                    setEtapa(etapa - 1);
                  }}
                >
                  Voltar
                </button>
              )}
              <button className="btn wiz-continuar" onClick={avancar}>
                {enviando && <span className="spinner" />}
                {etapa === ETAPAS_AN.length - 1
                  ? enviando ? "Publicando…" : "Publicar anúncio"
                  : "Continuar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDITAR: formulário completo, visão geral de tudo */}
      {pronto && !carregandoEdicao && editandoId && (
        <main className="container info-wrap">
          <div>
            <Link className="pd-voltar" style={{ marginTop: 0 }} href="/meus-anuncios">
              ← Voltar
            </Link>
          </div>
          <span className="info-kicker">EDITAR ANÚNCIO</span>
          <h1 className="info-title">Ajuste e salve</h1>
          <p className="info-sub">Mude o que precisar; a vitrine atualiza na hora.</p>

          <form className="an-form" onSubmit={publicar}>
            {campoFotos}
            {campoTitulo}
            {campoDescricao}
            <div className="an-linha">
              {campoCategoria}
              {campoEstado}
            </div>
            {campoPreco}
            {campoLocal}

            {erro && <p className="login-erro">{erro}</p>}

            <button className="btn btn-primary btn-block" type="submit">
              {enviando && <span className="spinner" />}
              {enviando ? "Salvando…" : "Salvar alterações"}
            </button>
          </form>
        </main>
      )}

      {editandoId && <Rodape />}

      {filaCorte.length > 0 && (
        <EditorFoto
          arquivo={filaCorte[0]}
          aspecto={4 / 3}
          onCancelar={() => setFilaCorte((fila) => fila.slice(1))}
          onCortar={fotoCortada}
        />
      )}

      {publicadoId && (
        <div className="aviso-overlay" role="dialog" aria-modal="true">
          <BloquearScroll />
          <div className="aviso-card" style={{ textAlign: "center" }}>
            {/* o check dá o "deu certo" antes do texto, e o resto entra
                logo atrás, escalonado */}
            <span className="ok-selo">
              <CheckIcon sx={{ fontSize: 34 }} />
            </span>
            <h2 className="aviso-titulo ok-entra">
              {editandoId ? "Anúncio atualizado!" : "Anúncio publicado!"}
            </h2>
            <p className="aviso-p ok-entra ok-atraso-1">
              {editandoId
                ? "As mudanças já estão na vitrine."
                : "Seu item já tá na vitrine pra todo mundo ver. Boa sorte no desapego!"}
            </p>
            <Link
              className="btn btn-primary btn-block ok-entra ok-atraso-2"
              href={`/produtos/${publicadoId}`}
            >
              Ver meu anúncio
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
