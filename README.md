# Desapega Unifor

**No ar em [www.desapegaunifor.com.br](https://www.desapegaunifor.com.br)**
(espelho: [desapega-unifor-alpha.vercel.app](https://desapega-unifor-alpha.vercel.app))

Marketplace de economia circular do campus, feito pro desafio técnico do
Laboratório VORTEX 2026.2. Um aluno anuncia o que não usa mais (livro de
cálculo, calculadora científica, jaleco, arduino), outro aluno acha e
aproveita, comprando barato ou recebendo doação. A vitrine é pública e
anunciar pede conta com email institucional.

O projeto é uma aplicação única. O backend é uma API REST em JSON dentro
das rotas do próprio Next (`app/api/`), e o frontend é a landing rica no
desktop que vira app de bolso no celular, instalável como PWA.

## O que tem funcionando

- Landing page com estatísticas, vitrine com filtro por categoria, busca,
  filtro por faixa de preço e FAQ
- Conta real (cadastro com email institucional, login, recuperação de senha
  com código por email, perfil editável, apagar conta com confirmação)
- Anunciar com até 5 fotos (recorte interativo, compressão pra WebP no
  navegador antes do upload), editar, excluir e marcar como vendido
- Página de produto com carrossel e contato direto por WhatsApp
- Perfil público do vendedor com histórico de vendas e estatísticas reais
- Contador de cliques por anúncio
- PWA com manifest, service worker escrito à mão, cache offline e botão de
  instalar

## Tecnologias

- Next.js 16 (App Router) com React 19 e TypeScript
- API REST nas rotas do próprio Next (`app/api/`), tudo em JSON
- Supabase (Postgres na nuvem, autenticação e storage de fotos), com Row
  Level Security e privilégio por coluna no banco
- `pg` pra conexão direta do servidor nos fluxos que a anon key não alcança
- Brevo pro email transacional do "esqueci minha senha"
- PWA com `manifest.json` e `public/sw.js` escritos à mão, sem lib
- MUI Icons, react-easy-crop e Tailwind na base de estilos

## Como rodar localmente

Pré-requisito: Node 20 ou mais novo.

```bash
git clone https://github.com/pcauanobre/desapega-unifor.git
cd desapega-unifor
npm install
```

Copie o arquivo de ambiente (as chaves dele são as públicas do projeto, a
segurança fica nas policies do banco e não no segredo da chave):

```bash
# Windows
copy .env.example .env.local

# Linux / Mac
cp .env.example .env.local
```

Suba o projeto (backend e frontend juntos, é uma aplicação só):

```bash
npm run dev
```

Abriu `http://localhost:3000`, tá rodando. Landing no desktop e, no modo
device do DevTools (ou no celular), a experiência de app com bottom nav.

A API responde em `http://localhost:3000/api/anuncios` pra testar direto.

### Rodando como PWA (instalação e modo offline)

O service worker fica desligado no modo dev de propósito (cache atrapalha o
hot reload). Pra testar o PWA de verdade use o build de produção:

```bash
npm run build
npm start
```

Aí é só abrir `http://localhost:3000` e clicar em "Instalar app" na barra
do topo (no celular o botão fica no header azul). Pra ver o offline
funcionando, abra o app instalado, navegue na vitrine, ative o modo Offline
no DevTools (aba Network) e recarregue. A última vitrine vista continua lá,
servida do cache do service worker.

## Estrutura de pastas

```
app/            páginas (landing, produtos, conta, perfil, anunciar...)
app/api/        a API REST (anuncios, perfil, senha)
components/     componentes de interface
lib/            utilidades puras (tipos, validação, regras de senha...)
public/         manifest.json, sw.js, ícones e imagens
sql/            migrations numeradas do banco (com RLS e grants)
scripts/        aplicar migrations pelo terminal
```

## Rotas da API

| Método | Rota | O que faz |
|---|---|---|
| GET | `/api/anuncios` | Lista anúncios (filtros `?categoria=`, `?autor=`, `?vendidos=1`) |
| POST | `/api/anuncios` | Cria anúncio (exige login) |
| GET | `/api/anuncios/[id]` | Um anúncio + conta o clique |
| PUT | `/api/anuncios/[id]` | Edita (só o dono, garantido pela RLS) |
| PATCH | `/api/anuncios/[id]` | Marca como vendido (vira histórico) |
| DELETE | `/api/anuncios/[id]` | Exclui (só o dono) |
| GET | `/api/perfil/[id]` | Perfil público do vendedor com estatísticas |
| POST | `/api/senha/enviar` | Envia código de redefinição por email |
| POST | `/api/senha/conferir` | Confere o código sem queimar ele |
| POST | `/api/senha/confirmar` | Troca a senha com o código válido |

## Variáveis de ambiente

As duas do `.env.example` são públicas e suficientes pra rodar tudo. Existem
duas privadas (`DATABASE_URL` e `BREVO_API_KEY`) que só o dono do projeto
usa, pra rodar migrations e pro envio de email do "esqueci minha senha". Sem
elas o app funciona normal, só esse fluxo de email fica de fora.

## Segurança

A chave `anon` do Supabase é pública por design (ela vai no bundle do
navegador), então a segurança mora no banco e na borda da API, nunca no
React. Row Level Security em todas as tabelas, privilégio por coluna,
funções `SECURITY DEFINER` de propósito único, rate limit por IP e headers
(CSP, HSTS, frame-ancestors). O modelo inteiro, junto do teste de invasão
que valida cada camada, está em [docs/seguranca.md](docs/seguranca.md).

## Deploy

- **Produção:** [www.desapegaunifor.com.br](https://www.desapegaunifor.com.br)
- **Hospedagem:** Vercel (frontend e API juntos, deploy automático a cada
  push na `main`) com Supabase na nuvem pro banco, autenticação e storage
- **Domínio:** registrado no Registro.br, DNS apontando pra Vercel, HTTPS
  emitido automaticamente
