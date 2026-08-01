# Desapega Unifor

Marketplace de desapego entre estudantes do campus. Um aluno anuncia o que
não usa mais (livro de cálculo, calculadora científica, jaleco, arduino),
outro aluno acha e aproveita, comprando barato ou recebendo doação. Feito
pro desafio técnico do Laboratório VORTEX 2026.2.

## Tecnologias

- Next.js (App Router) com TypeScript
- API REST nas rotas do próprio Next (`app/api/`), tudo em JSON
- Supabase (Postgres na nuvem + autenticação)
- PWA com `manifest.json` e service worker escritos à mão
- Tailwind CSS e MUI icons
- Deploy na Vercel

## Como rodar localmente

Pré-requisito: Node 20 ou mais novo.

```bash
git clone https://github.com/pcauanobre/desapega-unifor.git
cd desapega-unifor
npm install
copy .env.example .env.local
npm run dev
```

As chaves do `.env.example` são as públicas do projeto (a segurança fica
nas policies do banco, não na chave). Abriu `http://localhost:3000`, tá
rodando: landing no desktop e app no celular ou no modo device do DevTools.

## Diário de Bordo da IA

Em construção durante os 15 dias do desafio. O material bruto do processo
tá no [diario.md](diario.md), e a seção final entra aqui no README antes
da entrega.

## Aviso legal

Projeto acadêmico, feito exclusivamente pro desafio técnico do processo
seletivo do laboratório VORTEX. Não tem vínculo oficial com a Universidade
de Fortaleza: o nome, as cores e as referências à universidade aparecem
apenas como contexto do exercício, e todos os anúncios são fictícios.
Logo, nome, domínio ou qualquer elemento associado à Unifor são removidos
de imediato mediante solicitação: pedrocauaggn@gmail.com.

## Deploy

Os links de produção entram aqui quando o deploy sair.
