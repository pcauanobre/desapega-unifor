import type { NextConfig } from "next";

/* Headers de segurança em toda resposta. A sessão do Supabase mora no
   navegador, então XSS aqui significaria roubo de conta: a CSP corta
   script de fora, o frame-ancestors corta clickjacking e o HSTS trava
   tudo em HTTPS. As liberações são as que o app realmente usa: imagens
   e API do Supabase, e o iframe do Google Maps no rodapé. */
const CSP = [
  "default-src 'self'",
  // 'unsafe-inline' segue necessário pros scripts de hidratação do Next;
  // o ganho real da regra é bloquear script de domínio externo.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  // loremflickr e picsum servem as fotos dos itens de demonstração
  "img-src 'self' data: blob: https://*.supabase.co https://loremflickr.com https://*.staticflickr.com https://picsum.photos https://*.picsum.photos https://fastly.picsum.photos",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co",
  "frame-src https://www.google.com https://maps.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
      {
        // Resposta de API nunca fica em cache compartilhado.
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default nextConfig;
