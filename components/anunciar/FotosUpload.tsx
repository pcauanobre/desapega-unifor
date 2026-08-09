"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CollectionsIcon from "@mui/icons-material/Collections";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { BloquearScroll } from "@/components/BloquearScroll";
import { useSaidaAnimada } from "@/components/useSaidaAnimada";

type Props = {
  previews: string[];
  onEscolher: (arquivos: FileList | null) => void;
  onRemover: (indice: number) => void;
};

/**
 * O QUE: a área de fotos do formulário de anúncio: botão de adicionar,
 *        prévias em grade e X pra remover cada uma. Máximo 5. No celular
 *        o botão é só um "+"; ele abre um popup perguntando câmera ou
 *        galeria em vez de dois botões fixos. O popup vai num portal em
 *        <body> porque a animação de entrada do .wiz-card quebra o
 *        position:fixed do overlay se ele ficar aninhado ali dentro.
 * POR QUE: separa o visual do upload da lógica da página.
 * CHAMA: /anunciar.
 * QUEBRA SE: as classes .an-fotos do design.css mudarem.
 */
export function FotosUpload({ previews, onEscolher, onRemover }: Props) {
  const [escolhendo, setEscolhendo] = useState(false);
  const { saindo, fecharCom } = useSaidaAnimada();
  const inputCamera = useRef<HTMLInputElement>(null);
  const inputGaleria = useRef<HTMLInputElement>(null);

  function receber(e: React.ChangeEvent<HTMLInputElement>) {
    onEscolher(e.target.files);
    e.target.value = "";
  }

  return (
    <div>
      <span className="field-label">Fotos (até 5)</span>
      {previews.length > 0 && (
        <div className="an-fotos">
          {previews.map((p, i) => (
            <span className="an-foto" key={p}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p} alt={`Foto ${i + 1}`} />
              <button
                type="button"
                className="an-foto-x"
                aria-label="Remover foto"
                onClick={() => onRemover(i)}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </button>
              {i === 0 && <span className="an-foto-capa mono">CAPA</span>}
            </span>
          ))}
        </div>
      )}
      {previews.length < 5 && (
        <div className="an-foto-botoes">
          {/* desktop: um botão só (lá não existe câmera do celular) */}
          <label className="btn btn-outline an-foto-btn so-desktop">
            <AddAPhotoIcon sx={{ fontSize: 18 }} />
            Adicionar foto
            <input type="file" accept="image/*" multiple hidden onChange={receber} />
          </label>

          {/* celular: um "+" só, que abre o popup de câmera ou galeria */}
          <button
            type="button"
            className="btn btn-outline an-foto-btn an-foto-mais so-mobile"
            onClick={() => setEscolhendo(true)}
          >
            <AddAPhotoIcon sx={{ fontSize: 18 }} />
            Adicionar foto
          </button>
          {/* capture="environment" abre a câmera traseira direto, e o
              próprio sistema pede a permissão */}
          <input ref={inputCamera} type="file" accept="image/*" capture="environment" hidden onChange={receber} />
          <input ref={inputGaleria} type="file" accept="image/*" multiple hidden onChange={receber} />
        </div>
      )}
      <p className="wiz-sub">A primeira foto vira a capa.</p>

      {escolhendo &&
        createPortal(
          <div
            className={"aviso-overlay" + (saindo ? " is-saindo" : "")}
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
              if (e.target === e.currentTarget) fecharCom(() => setEscolhendo(false));
            }}
          >
            <BloquearScroll />
            <div className="aviso-card fx-card">
              <div className="fx-cabeca">
                <h2 className="aviso-titulo" style={{ margin: 0 }}>Adicionar foto</h2>
                <button
                  className="fx-fechar"
                  onClick={() => fecharCom(() => setEscolhendo(false))}
                  aria-label="Fechar"
                >
                  <CloseIcon sx={{ fontSize: 20 }} />
                </button>
              </div>
              <div className="escolha-lista">
                <button
                  type="button"
                  className="escolha-op"
                  onClick={() =>
                    fecharCom(() => {
                      setEscolhendo(false);
                      inputCamera.current?.click();
                    })
                  }
                >
                  <PhotoCameraIcon sx={{ fontSize: 20 }} />
                  <span>Tirar foto</span>
                  <ChevronRightIcon sx={{ fontSize: 18 }} />
                </button>
                <button
                  type="button"
                  className="escolha-op"
                  onClick={() =>
                    fecharCom(() => {
                      setEscolhendo(false);
                      inputGaleria.current?.click();
                    })
                  }
                >
                  <CollectionsIcon sx={{ fontSize: 20 }} />
                  <span>Galeria</span>
                  <ChevronRightIcon sx={{ fontSize: 18 }} />
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
