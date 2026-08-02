"use client";

import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import CloseIcon from "@mui/icons-material/Close";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CollectionsIcon from "@mui/icons-material/Collections";

type Props = {
  previews: string[];
  onEscolher: (arquivos: FileList | null) => void;
  onRemover: (indice: number) => void;
};

/**
 * O QUE: a área de fotos do formulário de anúncio: botão de adicionar,
 *        prévias em grade e X pra remover cada uma. Máximo 5.
 * POR QUE: separa o visual do upload da lógica da página.
 * CHAMA: /anunciar.
 * QUEBRA SE: as classes .an-fotos do design.css mudarem.
 */
export function FotosUpload({ previews, onEscolher, onRemover }: Props) {
  return (
    <div>
      <span className="field-label">Fotos (até 5)</span>
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
        {previews.length < 5 && (
          <>
            {/* desktop: um botão só (lá não existe câmera do celular) */}
            <label className="an-foto-add so-desktop">
              <AddAPhotoIcon sx={{ fontSize: 22 }} />
              <span>Adicionar</span>
              <input type="file" accept="image/*" multiple hidden
                onChange={(e) => {
                  onEscolher(e.target.files);
                  e.target.value = "";
                }} />
            </label>

            {/* celular: capture="environment" abre a câmera traseira
                direto, e o próprio sistema pede a permissão */}
            <label className="an-foto-add so-mobile">
              <PhotoCameraIcon sx={{ fontSize: 22 }} />
              <span>Tirar foto</span>
              <input type="file" accept="image/*" capture="environment" hidden
                onChange={(e) => {
                  onEscolher(e.target.files);
                  e.target.value = "";
                }} />
            </label>
            <label className="an-foto-add so-mobile">
              <CollectionsIcon sx={{ fontSize: 22 }} />
              <span>Galeria</span>
              <input type="file" accept="image/*" multiple hidden
                onChange={(e) => {
                  onEscolher(e.target.files);
                  e.target.value = "";
                }} />
            </label>
          </>
        )}
      </div>
      <p className="wiz-sub">A primeira foto vira a capa.</p>
    </div>
  );
}
