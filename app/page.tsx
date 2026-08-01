import Link from "next/link";
import { Logo } from "@/components/Logo";

/**
 * O QUE: landing base do Desapega Unifor: marca, uma linha de pitch e o CTA
 *        que leva pro app em /app.
 * POR QUE: versão de fundação enquanto o design final da landing não chega.
 *          A estrutura completa (hero, estatísticas, vitrine, como funciona)
 *          entra em cima desta rota.
 * CHAMA: é a rota raiz do site.
 * QUEBRA SE: os SVGs da marca sumirem de public/.
 */
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-white px-6 py-16">
      <Logo fundo="branco" simboloAltura={72} />
      <p className="max-w-md text-center text-lg text-[#071C3D]">
        O desapego dos estudantes da Unifor num app. Anuncia o que você não
        usa mais, acha o que precisa, tudo dentro do campus.
      </p>
      <Link
        href="/app"
        className="rounded-lg bg-[#0A5CFF] px-8 py-3 font-semibold text-white transition-colors hover:bg-[#0847CC]"
      >
        Entrar no app
      </Link>
      <p className="text-sm text-neutral-400">
        Landing completa em construção
      </p>
    </main>
  );
}
