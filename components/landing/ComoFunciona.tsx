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
 * O QUE: a seção "como funciona" da LP, 3 passos com ícones Material,
 *        no visual do design (cards com borda e hover suave).
 * POR QUE: o edital pede que a landing explique a proposta de economia
 *          circular; três passos contam o ciclo inteiro.
 * CHAMA: LP (app/page.tsx). Âncora #como-funciona vem da TopBar.
 * QUEBRA SE: as classes .como-* do design.css mudarem.
 */
export function ComoFunciona() {
  return (
    <section id="como-funciona" className="como">
      <div className="container como-inner">
        <h2 className="shelf-title">Como funciona</h2>
        <p className="shelf-sub">Economia circular no campus, sem burocracia.</p>
        <div className="como-grid">
          {PASSOS.map(({ Icone, titulo, texto }) => (
            <div key={titulo} className="como-card">
              <span className="como-ico">
                <Icone />
              </span>
              <h3 className="como-t">{titulo}</h3>
              <p className="como-p">{texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
