/**
 * O QUE: rodapé navy com a marca em branco e uma linha sobre o projeto.
 * POR QUE: fecha a landing conforme o design (fundo navy, marca branca).
 * CHAMA: landing (app/page.tsx).
 * QUEBRA SE: mark-white.svg sumir de public/.
 */
export function Rodape() {
  return (
    <footer className="bg-[#071C3D] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mark-white.svg" alt="" className="h-9" />
          <p className="font-[family-name:var(--font-sora)] font-bold text-white">
            Desapega <span className="font-medium text-[#BFD5FF]">Unifor</span>
          </p>
        </div>
        <p className="text-sm text-[#BFD5FF]">
          Marketplace de economia circular do campus · feito de aluno pra aluno
        </p>
      </div>
    </footer>
  );
}
