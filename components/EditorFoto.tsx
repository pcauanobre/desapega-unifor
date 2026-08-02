"use client";

import { useState } from "react";
import Cropper from "react-easy-crop";
import { recortarFoto, type AreaCorte } from "@/lib/otimizar-foto";
import { BloquearScroll } from "@/components/BloquearScroll";
import { useSaidaAnimada } from "@/components/useSaidaAnimada";

type Props = {
  arquivo: File;
  aspecto: number;
  circular?: boolean;
  onCancelar: () => void;
  onCortar: (blob: Blob) => void;
};

/**
 * O QUE: o editor de foto: arrasta com o mouse ou o dedo pra posicionar,
 *        pinça ou slider pra dar zoom, e corta na proporção pedida.
 * POR QUE: foto de perfil sai redonda certinha e foto de anúncio sai no
 *          enquadramento que o dono escolheu, não num corte automático.
 * CHAMA: conta, wizard e formulário de anúncio, antes de todo upload.
 * QUEBRA SE: o arquivo não for imagem (o chamador trata o erro do corte).
 */
export function EditorFoto({ arquivo, aspecto, circular = false, onCancelar, onCortar }: Props) {
  const [url] = useState(() => URL.createObjectURL(arquivo));
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<AreaCorte | null>(null);
  const [cortando, setCortando] = useState(false);
  const { saindo, fecharCom } = useSaidaAnimada();

  async function confirmar() {
    if (!area || cortando) return;
    setCortando(true);
    try {
      const blob = await recortarFoto(arquivo, area);
      /* revoga a URL só no fim, senão a prévia apaga durante a saída */
      fecharCom(() => {
        URL.revokeObjectURL(url);
        onCortar(blob);
      });
    } catch {
      setCortando(false);
    }
  }

  return (
    <div
      className={"aviso-overlay" + (saindo ? " is-saindo" : "")}
      role="dialog"
      aria-modal="true"
      aria-label="Ajustar foto"
    >
      <BloquearScroll />
      <div className="aviso-card ef-card">
        <h2 className="aviso-titulo">Ajusta a foto</h2>
        <p className="aviso-p" style={{ textAlign: "center", marginTop: 6 }}>
          Arrasta pra posicionar e usa o zoom pra enquadrar.
        </p>

        <div className="ef-area">
          <Cropper
            image={url}
            crop={crop}
            zoom={zoom}
            aspect={aspecto}
            cropShape={circular ? "round" : "rect"}
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, areaPx) => setArea(areaPx)}
          />
        </div>

        <input
          className="ef-zoom"
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          aria-label="Zoom"
          onChange={(e) => setZoom(Number(e.target.value))}
        />

        <div className="wiz-acoes" style={{ marginTop: 14 }}>
          <button className="btn wiz-voltar" onClick={() => fecharCom(onCancelar)}>
            Cancelar
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={confirmar}>
            {cortando && <span className="spinner" />}
            {cortando ? "Cortando…" : "Usar foto"}
          </button>
        </div>
      </div>
    </div>
  );
}
