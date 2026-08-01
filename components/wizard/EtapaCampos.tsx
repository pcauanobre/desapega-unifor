"use client";

import PersonIcon from "@mui/icons-material/Person";
import { Droplist } from "@/components/Droplist";

export const CURSOS = [
  "Engenharia Civil", "Engenharia Elétrica", "Engenharia Mecânica",
  "Ciência da Computação", "Sistemas de Informação", "Análise e Des. de Sistemas",
  "Direito", "Medicina", "Enfermagem", "Arquitetura", "Administração",
  "Design", "Publicidade e Propaganda", "Nutrição", "Outro",
];

export const SEMESTRES = ["1º", "2º", "3º", "4º", "5º", "6º", "7º", "8º", "9º", "10º"];

export type Perfil = {
  foto_url: string;
  celular: string;
  curso: string;
  semestre: string;
  bloco_padrao: string;
};

type Props = {
  etapa: number;
  perfil: Perfil;
  onMudar: (campo: keyof Perfil, valor: string) => void;
};

/* "(85) 98888-7777" enquanto digita, só com números por baixo. */
export function formatarCelular(bruto: string): string {
  const d = bruto.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/**
 * O QUE: os campos de cada etapa do setup wizard: foto com preview,
 *        celular com máscara, curso e semestre em droplist, bloco.
 * POR QUE: separa o formulário do fluxo; a página cuida do passo a passo.
 * CHAMA: /bem-vindo.
 * QUEBRA SE: os números das etapas mudarem lá sem mudar aqui.
 */
export function EtapaCampos({ etapa, perfil, onMudar }: Props) {
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
          <label className="field" style={{ flex: 1 }}>
            <span className="field-label">Link da tua foto</span>
            <input
              type="url"
              placeholder="https://..."
              value={perfil.foto_url}
              onChange={(e) => onMudar("foto_url", e.target.value)}
            />
          </label>
        </div>
        <p className="wiz-sub">
          Pode ser a foto do LinkedIn, do GitHub ou de qualquer lugar público.
        </p>
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

  if (etapa === 2) {
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

  return (
    <div className="wiz-corpo">
      <label className="field">
        <span className="field-label">Bloco onde tu mais fica</span>
        <input
          type="text"
          placeholder="Ex: Bloco J"
          value={perfil.bloco_padrao}
          onChange={(e) => onMudar("bloco_padrao", e.target.value)}
        />
      </label>
      <p className="wiz-sub">
        Vira a sugestão de local de retirada quando tu for anunciar.
      </p>
    </div>
  );
}
