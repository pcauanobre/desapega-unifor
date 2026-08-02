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

/**
 * O QUE: o formulário de anúncio, nos dois modos: criar (POST) e editar
 *        (?editar=id, PUT, tudo pré-preenchido, fotos antigas incluídas).
 * POR QUE: um formulário só pros dois fluxos, sem duplicar tela.
 * CHAMA: central de anúncios (novo) e meus anúncios (editar).
 * QUEBRA SE: o bucket "fotos" não existir no Storage (migration 006).
 */
export default function NovoAnuncio() {
  const router = useRouter();
  const [editandoId, setEditandoId] = useState<string | null>(null);
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
          router.replace("/entrar");
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
    setFilaCorte((fila) => [...fila, ...Array.from(lista).slice(0, espaco)]);
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

  async function publicar(e: React.FormEvent) {
    e.preventDefault();
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

  return (
    <div className="pagina-1280 flex-1">
      <TopBar />
      <HeaderNav />
      <main className="container info-wrap">
        {(!pronto || carregandoEdicao) && (
          <div>
            <div className="sk-bar pd-sk-l2" />
            <div className="sk-bar pd-sk-l1" style={{ width: "55%" }} />
            <div className="sk-bar pd-sk-l3" style={{ height: 300 }} />
          </div>
        )}
        {pronto && !carregandoEdicao && (
        <>
        <div>
          <Link className="pd-voltar" style={{ marginTop: 0 }}
            href={editandoId ? "/meus-anuncios" : "/anunciar"}>
            ← Voltar
          </Link>
        </div>
        <span className="info-kicker">
          {editandoId ? "EDITAR ANÚNCIO" : "NOVO ANÚNCIO"}
        </span>
        <h1 className="info-title">
          {editandoId ? "Ajuste e salve" : "Bora desapegar"}
        </h1>
        <p className="info-sub">
          {editandoId
            ? "Mude o que precisar; a vitrine atualiza na hora."
            : "Anúncio completo acha dono novo muito mais rápido."}
        </p>

        <form className="an-form" onSubmit={publicar}>
          <FotosUpload previews={previewsTotais} onEscolher={escolherFotos} onRemover={removerFoto} />

          <label className="field">
            <span className="field-label">Título</span>
            <input type="text" placeholder="Ex: Calculadora HP 12C Platinum" maxLength={80}
              value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </label>

          <label className="field">
            <span className="field-label">Descrição</span>
            <textarea className="an-textarea" placeholder="Estado real, tempo de uso, o que acompanha..."
              maxLength={500} rows={4} value={descricao}
              onChange={(e) => setDescricao(e.target.value)} />
          </label>

          <div className="an-linha">
            <div className="wiz-dl">
              <span className="field-label">Categoria</span>
              <Droplist rotuloAria="Categoria" valor={categoria} onMudar={setCategoria}
                opcoes={[{ valor: "", rotulo: "Escolha a categoria" },
                  ...CATEGORIAS.map((c) => ({ valor: c, rotulo: c }))]} />
            </div>
            <div className="wiz-dl">
              <span className="field-label">Estado do item</span>
              <Droplist rotuloAria="Estado do item" valor={estado} onMudar={setEstado}
                opcoes={[{ valor: "", rotulo: "Como ele está?" },
                  ...ESTADOS.map((s) => ({ valor: s, rotulo: s }))]} />
            </div>
          </div>

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

          {/* o WhatsApp não é pedido aqui: sai do celular do perfil */}
          <div className="wiz-dl">
            <span className="field-label">Local de retirada</span>
            <Droplist rotuloAria="Local de retirada" valor={bloco} onMudar={setBloco}
              opcoes={[{ valor: "", rotulo: "Onde encontrar?" },
                ...LOCAIS.map((l) => ({ valor: l, rotulo: l }))]} />
          </div>

          {erro && <p className="login-erro">{erro}</p>}

          <button className="btn btn-primary btn-block" type="submit">
            {enviando && <span className="spinner" />}
            {enviando
              ? "Salvando…"
              : editandoId ? "Salvar alterações" : "Publicar anúncio"}
          </button>
        </form>
        </>
        )}
      </main>
      <Rodape />

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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mark-blue.svg" alt="" style={{ height: 44 }} />
            <h2 className="aviso-titulo">
              {editandoId ? "Anúncio atualizado!" : "Anúncio publicado!"}
            </h2>
            <p className="aviso-p">
              {editandoId
                ? "As mudanças já estão na vitrine."
                : "Seu item já tá na vitrine pra todo mundo ver. Boa sorte no desapego!"}
            </p>
            <Link className="btn btn-primary btn-block" href={`/produtos/${publicadoId}`}>
              Ver meu anúncio
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
