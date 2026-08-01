"use client";

import { useEffect } from "react";
import PersonIcon from "@mui/icons-material/Person";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { Droplist } from "@/components/Droplist";

/* Lista oficial de graduações da Unifor (unifor.br/web/graduacao). */
export const CURSOS = [
  "Administração", "Análise e Desenv. de Sistemas", "Arquitetura e Urbanismo",
  "Biomedicina", "Cinema e Audiovisual", "Ciência da Computação",
  "Ciências Contábeis", "Ciências Econômicas", "Comércio Exterior",
  "Design", "Design de Interiores", "Design de Moda", "Direito",
  "Educação Física", "Enfermagem", "Energias Renováveis",
  "Engenharia Ambiental e Sanitária", "Engenharia Civil",
  "Engenharia da Computação", "Engenharia de Controle e Automação",
  "Engenharia de Produção", "Engenharia Elétrica", "Engenharia Mecânica",
  "Estética e Cosmética", "Farmácia", "Finanças", "Fisioterapia",
  "Fonoaudiologia", "Jornalismo", "Marketing", "Medicina",
  "Medicina Veterinária", "Moda", "Negócios", "Nutrição", "Odontologia",
  "Psicologia", "Publicidade e Propaganda", "Terapia Ocupacional",
];

export const SEMESTRES = ["1º", "2º", "3º", "4º", "5º", "6º", "7º", "8º", "9º", "10º"];

export type Perfil = {
  foto_url: string;
  celular: string;
  curso: string;
  semestre: string;
};

type Props = {
  etapa: number;
  perfil: Perfil;
  onMudar: (campo: keyof Perfil, valor: string) => void;
  onFoto: (arquivo: File) => void;
};

/* "(85) 98888-7777" enquanto digita, só com números por baixo. */
export function formatarCelular(bruto: string): string {
  const d = bruto.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/**
 * O QUE: os campos de cada etapa do setup: foto (galeria ou Ctrl+V em
 *        qualquer lugar da tela), celular com máscara, curso e semestre
 *        com a lista oficial da Unifor.
 * POR QUE: separa o formulário do fluxo; a página cuida do passo a passo
 *          e do upload em si.
 * CHAMA: /bem-vindo.
 * QUEBRA SE: os números das etapas mudarem lá sem mudar aqui.
 */
export function EtapaCampos({ etapa, perfil, onMudar, onFoto }: Props) {
  // Na etapa da foto, Ctrl+V com uma imagem copiada funciona na tela
  // inteira, sem precisar de campo nenhum.
  useEffect(() => {
    if (etapa !== 0) return;
    function colar(e: ClipboardEvent) {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith("image/"),
      );
      const arquivo = item?.getAsFile();
      if (arquivo) onFoto(arquivo);
    }
    window.addEventListener("paste", colar);
    return () => window.removeEventListener("paste", colar);
  }, [etapa, onFoto]);

  if (etapa === 0) {
    return (
      <div className="wiz-corpo">
        <div className="wiz-avatar-area">
          <span className="wiz-avatar">
            {perfil.foto_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={perfil.foto_url} alt="Prévia da foto de perfil" />
            ) : (
              <PersonIcon sx={{ fontSize: 40 }} />
            )}
          </span>
          <div className="wiz-foto-acoes">
            <label className="btn btn-outline wiz-foto-btn">
              <AddAPhotoIcon sx={{ fontSize: 18 }} />
              Escolher da galeria
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const arquivo = e.target.files?.[0];
                  if (arquivo) onFoto(arquivo);
                  e.target.value = "";
                }}
              />
            </label>
            <p className="wiz-sub">
              Ou copia uma imagem de qualquer lugar e dá Ctrl+V aqui na tela.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (etapa === 1) {
    return (
      <div className="wiz-corpo">
        <label className="field">
          <span className="field-label">Celular (WhatsApp)</span>
          <input
            type="tel"
            placeholder="(85) 90000-0000"
            value={perfil.celular}
            onChange={(e) => onMudar("celular", formatarCelular(e.target.value))}
          />
        </label>
        <p className="wiz-sub">
          É por ele que os interessados vão combinar a entrega contigo. Ele
          aparece na página dos teus anúncios.
        </p>
      </div>
    );
  }

  return (
    <div className="wiz-corpo">
      <div className="wiz-dl">
        <span className="field-label">Curso</span>
        <Droplist
          rotuloAria="Curso"
          valor={perfil.curso}
          onMudar={(v) => onMudar("curso", v)}
          opcoes={[
            { valor: "", rotulo: "Selecione o curso" },
            ...CURSOS.map((c) => ({ valor: c, rotulo: c })),
          ]}
        />
      </div>
      <div className="wiz-dl">
        <span className="field-label">Semestre</span>
        <Droplist
          rotuloAria="Semestre"
          valor={perfil.semestre}
          onMudar={(v) => onMudar("semestre", v)}
          opcoes={[
            { valor: "", rotulo: "Selecione o semestre" },
            ...SEMESTRES.map((s) => ({ valor: s, rotulo: s })),
          ]}
        />
      </div>
    </div>
  );
}
