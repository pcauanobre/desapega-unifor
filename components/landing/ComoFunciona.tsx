import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import ForumIcon from "@mui/icons-material/Forum";
import RecyclingIcon from "@mui/icons-material/Recycling";

const PASSOS = [
  {
    Icone: AddAPhotoIcon,
    titulo: "1. Anuncia em um minuto",
    texto:
      "Título, foto e preço, ou marca como doação. O item entra na vitrine na hora.",
  },
  {
    Icone: ForumIcon,
    titulo: "2. Combina com quem quer",
    texto:
      "Quem se interessar fala contigo e vocês combinam a entrega dentro do campus.",
  },
  {
    Icone: RecyclingIcon,
    titulo: "3. Desapega e circula",
    texto:
      "O que tava parado na tua gaveta vira útil pra quem tá chegando agora.",
  },
];

/**
 * O QUE: a seção "como funciona" em 3 passos, com ícones Material.
 * POR QUE: o edital pede que a landing explique a proposta de economia
 *          circular; três passos contam o ciclo inteiro.
 * CHAMA: landing (app/page.tsx). Âncora #como-funciona vem da TopBar.
 * QUEBRA SE: nada; é estática.
 */
export function ComoFunciona() {
  return (
    <section id="como-funciona" className="bg-white px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-[family-name:var(--font-sora)] text-3xl font-bold text-[#071C3D]">
          Como funciona
        </h2>
        <p className="mt-2 text-center text-[#5A6480]">
          Economia circular no campus, sem burocracia.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PASSOS.map(({ Icone, titulo, texto }) => (
            <div key={titulo} className="rounded-2xl border border-[#EDF1F8] p-6">
              <span className="inline-flex rounded-xl bg-[#E9F0FF] p-3 text-[#0A5CFF]">
                <Icone />
              </span>
              <h3 className="mt-4 font-[family-name:var(--font-sora)] text-lg font-bold text-[#071C3D]">
                {titulo}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5A6480]">{texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
