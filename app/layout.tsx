import type { Metadata, Viewport } from "next";
import { Sora, Plus_Jakarta_Sans, JetBrains_Mono, Open_Sans } from "next/font/google";
import "./globals.css";
import "./design.css";
import { AvisoLegal } from "@/components/AvisoLegal";
import { BottomNav } from "@/components/BottomNav";
import { PwaRegistro } from "@/components/PwaRegistro";
import { BarraConexao } from "@/components/BarraConexao";

// As três fontes do código fonte do design: Sora (títulos, preços, marca),
// Plus Jakarta Sans (corpo) e JetBrains Mono (microlabels).
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// Open Sans é a fonte do portal oficial; usada só na tela de acesso,
// medida com DevTools na página real de login da universidade.
const openSans = Open_Sans({
  variable: "--font-opensans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Desapega Unifor",
  description:
    "Marketplace de desapego entre estudantes do campus: anuncie o que você não usa mais e ache o que precisa, de aluno pra aluno.",
  manifest: "/manifest.json",
  icons: { icon: "/icone-192.png", apple: "/icone-192.png" },
  appleWebApp: { capable: true, title: "Desapega Unifor" },
};

/* maximumScale/userScalable travam o pinch zoom (o iOS respeita isso no
   app instalado); o pull-to-refresh morre no CSS via overscroll-behavior. */
export const viewport: Viewport = {
  themeColor: "#0A5CFF",
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${sora.variable} ${jakarta.variable} ${jetbrains.variable} ${openSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PwaRegistro />
        <BarraConexao />
        <AvisoLegal />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
