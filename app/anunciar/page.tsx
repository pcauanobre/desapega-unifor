"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { otimizarFoto } from "@/lib/otimizar-foto";
import { CATEGORIAS } from "@/lib/categorias";
import { TopBar } from "@/components/landing/TopBar";
import { HeaderNav } from "@/components/landing/HeaderNav";
import { Rodape } from "@/components/landing/Rodape";
import { Droplist } from "@/components/Droplist";
import { FotosUpload } from "@/components/anunciar/FotosUpload";

const ESTADOS = ["Como novo", "Bom estado", "Usado", "Funcionando"];

/**
 * O QUE: o formulário de anunciar: fotos com upload otimizado, título,
 *        descrição, categoria, preço ou doação, estado, local e contato.
 * POR QUE: é o outro lado do marketplace; sem login redireciona pro
 *          /entrar, e o perfil do wizard preenche local e contato.
 * CHAMA: botões "Quero anunciar" do site inteiro.
 * QUEBRA SE: o bucket "fotos" não existir no Storage (migration 006).
 */
export default function Anunciar() {
  const router = useRouter();
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
        if (meta.bloco_padrao) setBloco(meta.bloco_padrao as string);
        if (meta.celular) setContato(meta.celular as string);
      });
  }, [router]);

  function escolherFotos(lista: FileList | null) {
    if (!lista) return;
    const novos = [...arquivos, ...Array.from(lista)].slice(0, 5);
    setArquivos(novos);
    setPreviews(novos.map((f) => URL.createObjectURL(f)));
  }

  function removerFoto(i: number) {
    const novos = arquivos.filter((_, j) => j !== i);
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
    if (arquivos.length === 0) return setErro("Coloca pelo menos uma foto.");

    setEnviando(true);
    try {
      const supabase = createClient();
      const urls: string[] = [];
      for (const [i, arquivo] of arquivos.entries()) {
        const blob = await otimizarFoto(arquivo);
        const caminho = `${usuario.current}/${Date.now()}-${i}.webp`;
        const { error } = await supabase.storage
          .from("fotos")
          .upload(caminho, blob, { contentType: "image/webp" });
        if (error) throw new Error("upload falhou: " + error.message);
        urls.push(supabase.storage.from("fotos").getPublicUrl(caminho).data.publicUrl);
      }

      const resposta = await fetch("/api/anuncios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo, descricao, categoria,
          preco: doacao ? null : Number(preco),
          is_doacao: doacao,
          estado: estado || null,
          bloco: bloco || null,
          contato: contato || null,
          fotos: urls,
        }),
      });
      const corpo = await resposta.json();
      if (!resposta.ok) throw new Error(corpo.erro ?? "não deu pra publicar");
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
        <span className="info-kicker">NOVO ANÚNCIO</span>
        <h1 className="info-title">Bora desapegar</h1>
        <p className="info-sub">
          Preenche com carinho: anúncio completo acha dono novo muito mais rápido.
        </p>

        <form className="an-form" onSubmit={publicar}>
          <FotosUpload previews={previews} onEscolher={escolherFotos} onRemover={removerFoto} />

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
            <label className="field">
              <span className="field-label">Local de retirada</span>
              <input type="text" placeholder="Ex: Bloco J" maxLength={40}
                value={bloco} onChange={(e) => setBloco(e.target.value)} />
            </label>
            <label className="field">
              <span className="field-label">WhatsApp de contato</span>
              <input type="tel" placeholder="(85) 90000-0000" maxLength={20}
                value={contato} onChange={(e) => setContato(e.target.value)} />
            </label>
          </div>

          {erro && <p className="login-erro">{erro}</p>}

          <button className="btn btn-primary btn-block" type="submit">
            {enviando && <span className="spinner" />}
            {enviando ? "Publicando…" : "Publicar anúncio"}
          </button>
        </form>
      </main>
      <Rodape />

      {publicadoId && (
        <div className="aviso-overlay" role="dialog" aria-modal="true">
          <div className="aviso-card" style={{ textAlign: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mark-blue.svg" alt="" style={{ height: 44 }} />
            <h2 className="aviso-titulo">Anúncio publicado!</h2>
            <p className="aviso-p">
              Teu item já tá na vitrine pra todo mundo ver. Boa sorte no desapego!
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
