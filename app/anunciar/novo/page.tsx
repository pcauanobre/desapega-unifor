"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { otimizarFoto } from "@/lib/otimizar-foto";
import { CATEGORIAS } from "@/lib/categorias";
import type { Anuncio } from "@/lib/tipos";
import { TopBar } from "@/components/landing/TopBar";
import { HeaderNav } from "@/components/landing/HeaderNav";
import { Rodape } from "@/components/landing/Rodape";
import { Droplist } from "@/components/Droplist";
import { FotosUpload } from "@/components/anunciar/FotosUpload";
import { BloquearScroll } from "@/components/BloquearScroll";

const ESTADOS = ["Como novo", "Bom estado", "Usado", "Funcionando"];

/* Pontos de retirada do campus (blocos + lugares de encontro comuns). */
const LOCAIS = [
  "Praça central", "Biblioteca central", "Cantina central", "Ginásio",
  "Estacionamento norte", "Estacionamento sul",
  ..."ABCDEFGHIJKLMNPQRS".split("").map((letra) => `Bloco ${letra}`),
  "Outro ponto (a combinar)",
];

/**
 * O QUE: o formulário de anúncio, nos dois modos: criar (POST) e editar
 *        (?editar=id, PUT, tudo pré-preenchido, fotos antigas incluídas).
 * POR QUE: um formulário só pros dois fluxos, sem duplicar tela.
 * CHAMA: central do desapego (novo) e meus anúncios (editar).
 * QUEBRA SE: o bucket "fotos" não existir no Storage (migration 006).
 */
export default function NovoAnuncio() {
  const router = useRouter();
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [fotosExistentes, setFotosExistentes] = useState<string[]>([]);
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [doacao, setDoacao] = useState(false);
  const [preco, setPreco] = useState("");
  const [estado, setEstado] = useState("");
  const [bloco, setBloco] = useState("");
  const [contato, setContato] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [publicadoId, setPublicadoId] = useState<string | null>(null);
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
        const meta = user.user_metadata ?? {};
        if (meta.celular) setContato(meta.celular as string);

        // Modo edição: carrega o anúncio e pré-preenche tudo.
        const idEditar = new URLSearchParams(window.location.search).get("editar");
        if (!idEditar) return;
        fetch(`/api/anuncios/${idEditar}`)
          .then(async (r) => {
            const corpo = await r.json();
            if (!r.ok) throw new Error(corpo.erro);
            const a = corpo.anuncio as Anuncio;
            setEditandoId(a.id);
            setTitulo(a.titulo);
            setDescricao(a.descricao);
            setCategoria(a.categoria);
            setDoacao(a.is_doacao);
            setPreco(a.preco === null ? "" : String(a.preco));
            setEstado(a.estado ?? "");
            setBloco(a.bloco ?? "");
            setContato(a.contato ?? "");
            setFotosExistentes(
              a.fotos?.length ? a.fotos : a.imagem_url ? [a.imagem_url] : [],
            );
          })
          .catch(() => setErro("Não deu pra carregar o anúncio pra edição."));
      });
  }, [router]);

  const previewsTotais = [...fotosExistentes, ...previews];

  function escolherFotos(lista: FileList | null) {
    if (!lista) return;
    const espaco = 5 - fotosExistentes.length;
    const novos = [...arquivos, ...Array.from(lista)].slice(0, Math.max(0, espaco));
    setArquivos(novos);
    setPreviews(novos.map((f) => URL.createObjectURL(f)));
  }

  function removerFoto(i: number) {
    if (i < fotosExistentes.length) {
      setFotosExistentes(fotosExistentes.filter((_, j) => j !== i));
      return;
    }
    const idx = i - fotosExistentes.length;
    const novos = arquivos.filter((_, j) => j !== idx);
    setArquivos(novos);
    setPreviews(novos.map((f) => URL.createObjectURL(f)));
  }

  async function publicar(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    setErro(null);

    if (titulo.trim().length < 3) return setErro("Capricha no título (mínimo 3 letras).");
    if (descricao.trim().length < 10) return setErro("Descreve um pouco mais o item.");
    if (!categoria) return setErro("Escolhe a categoria.");
    if (!doacao && (!preco || Number(preco) <= 0)) return setErro("Diz o preço, ou marca como doação.");
    if (previewsTotais.length === 0) return setErro("Coloca pelo menos uma foto.");

    setEnviando(true);
    try {
      const supabase = createClient();
      const novasUrls: string[] = [];
      for (const [i, arquivo] of arquivos.entries()) {
        const blob = await otimizarFoto(arquivo);
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
            contato: contato || null,
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
          {editandoId ? "Ajusta e salva" : "Bora desapegar"}
        </h1>
        <p className="info-sub">
          {editandoId
            ? "Muda o que precisar; a vitrine atualiza na hora."
            : "Preenche com carinho: anúncio completo acha dono novo muito mais rápido."}
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
                opcoes={[{ valor: "", rotulo: "Escolhe a categoria" },
                  ...CATEGORIAS.map((c) => ({ valor: c, rotulo: c }))]} />
            </div>
            <div className="wiz-dl">
              <span className="field-label">Estado do item</span>
              <Droplist rotuloAria="Estado do item" valor={estado} onMudar={setEstado}
                opcoes={[{ valor: "", rotulo: "Como ele tá?" },
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

          <div className="an-linha">
            <div className="wiz-dl">
              <span className="field-label">Local de retirada</span>
              <Droplist rotuloAria="Local de retirada" valor={bloco} onMudar={setBloco}
                opcoes={[{ valor: "", rotulo: "Onde encontrar?" },
                  ...LOCAIS.map((l) => ({ valor: l, rotulo: l }))]} />
            </div>
            <label className="field">
              <span className="field-label">WhatsApp de contato</span>
              <input type="tel" placeholder="(85) 90000-0000" maxLength={20}
                value={contato} onChange={(e) => setContato(e.target.value)} />
            </label>
          </div>

          {erro && <p className="login-erro">{erro}</p>}

          <button className="btn btn-primary btn-block" type="submit">
            {enviando && <span className="spinner" />}
            {enviando
              ? "Salvando…"
              : editandoId ? "Salvar alterações" : "Publicar anúncio"}
          </button>
        </form>
      </main>
      <Rodape />

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
                : "Teu item já tá na vitrine pra todo mundo ver. Boa sorte no desapego!"}
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
