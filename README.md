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

## Diário de Bordo da IA

### Ferramentas utilizadas

- **Claude Code** no desenvolvimento inteiro: código, banco, migrations e
  caça a bug
- **Claude no navegador** na fase de design, antes de existir código, pra
  fechar o desenho da landing
- **ChatGPT** pra gerar imagens usadas na interface

### Estratégia de engenharia de prompts

Meu jeito de trabalhar foi sempre o mesmo. Descrevo o comportamento que eu
quero como usuário, testo na hora no navegador e volto com print do que não
ficou bom. O detalhe de implementação fica com a IA. O que entra, como fica
e quando tá pronto é decisão minha, e quando a resposta não me convence eu
mando refazer. Três prompts que destravaram partes grandes do projeto:

**1. O design da landing, antes de existir código** (Claude no navegador)

> Preciso do design (só UI, sem backend) da landing page desktop de um app
> chamado Desapega Unifor. É um marketplace de desapego entre estudantes do
> campus: aluno anuncia o que não usa mais (livro, calculadora científica,
> jaleco, componente eletrônico, móvel) pra vender barato ou doar, e outro
> aluno acha. Vibe de economia circular universitária, público jovem, tudo
> em português.
>
> A marca: o logo é um D azul com uma casinha dentro, nome "Desapega
> Unifor". Paleta construída em cima de dois azuis (um vivo e um bem
> escuro), o resto da paleta é por sua conta.
>
> A landing é pública e precisa ter: header com logo e botões fortes de
> "Quero anunciar" e "Quero buscar"; hero apresentando a proposta (desapego
> no campus, economia circular); faixa de estatísticas do sistema (números
> fictícios tipo "347 itens circulando"); filtro por categoria em chips
> (Livros, Computação, Engenharia, Eletrônicos, Vestuário, Móveis, Outros);
> vitrine com os últimos itens anunciados (card com imagem, título,
> categoria e preço, ou tag verde de DOAÇÃO no lugar do preço); seção
> "como funciona" em 3 passos; footer.
>
> Capricha em: visual moderno e polido, estados de carregamento, transições
> suaves, cards bonitos com foto de produto. Dados fictícios realistas de
> universidade (livro de cálculo, calculadora HP, jaleco M, arduino usado).
>
> Referência visual: tô anexando as logos e um print de header pra você se
> inspirar. Segue esse estilo: barra azul forte no topo, busca com seletor
> de categoria acoplado, inputs claros de fundo branco com cantos
> arredondados de uns 8px, visual limpo de portal universitário. Mas com
> cara de marketplace moderno, não de sistema acadêmico.
>
> Layout, tipografia, espaçamento e estilo geral são por tua conta, me
> surpreende.

Foi o prompt mais longo do projeto, e foi de propósito. Eu queria o desenho
fechado antes de escrever a primeira linha, então dei o contexto do campus,
a marca, a lista fechada do que a tela precisava ter e uma referência visual
anexada, e deixei explícito onde a IA podia decidir sozinha. O mockup que
saiu de lá virou a referência visual que o código deste repositório segue.

**2. O PWA com service worker e cache offline** (Claude Code)

> faça agora o pwa com o icoen da unifor, botao q ja pede pra instalar.
> tambem faça o sismtea de cache ofiline, pode copiar o pwa do [outro
> projeto meu] na desktop, o manifest ne, faça ai de um jeito legal e bem
> profissional e completo

Eu já tinha feito PWA num projeto anterior, então mandei usar aquele como
ponto de partida em vez de começar do zero. A arquitetura era diferente (lá
o service worker vinha pronto de um plugin, aqui é Next e o arquivo é
escrito à mão), então o que veio de lá foi a estrutura do manifest e a ideia
de separar as estratégias de cache. Desse prompt saiu o `public/sw.js` com
as três estratégias que estão nele hoje: o casco do app pré-cacheado na
instalação, arquivo estático servido do cache primeiro, e navegação e API
indo na rede primeiro com o cache de reserva quando a rede falha. Junto veio
o botão de instalar, que só aparece quando o navegador libera o evento.

**3. A auditoria de segurança** (Claude Code)

> preciso q vc faça uma verificacao completa de segurança se tem coisa
> exposta, defina rate limit pra requisicoes, verifique se invsaro n tem
> como pegar dados de outras contar estando logado em uma e toda a
> segurança base.

Esse é o prompt que eu mais gosto de ter escrito, porque nele eu pedi prova
em vez de pedir código. A IA montou um script que cria duas contas de
verdade, loga numa e tenta atacar a outra de todo jeito possível (editar
anúncio alheio, apagar, forjar o autor, ler a tabela de códigos de senha,
alcançar a tabela de usuários do Auth), e repete a bateria inteira como
visitante anônimo. As 19 tentativas voltaram negadas pelo banco. Do que
faltava entrou rate limit por IP e os headers de segurança. E apareceu um
furo real que eu não tinha visto: o telefone dos anunciantes era coluna
pública da tabela, então uma requisição só baixava a agenda inteira do site.
Hoje o contato sai um por vez, por uma função do banco que devolve o
telefone só daquele anúncio. O teste completo está em
[docs/seguranca.md](docs/seguranca.md).

### Reflexão crítica

**Quando a IA me disse que o email tinha sido enviado, e não tinha.**

Ela montou a recuperação de senha por código, testou e me avisou que estava
funcionando. Esperei, olhei a caixa de entrada, olhei o spam, nada chegou.
Voltei com o comportamento em vez de um palpite ("o email n chegou") e mandei
ela olhar o log do servidor em vez de confiar no status da resposta. O log
tinha a resposta. O serviço de email recusava com 401, porque minha conta lá
bloqueia envio partindo de IP desconhecido, e a minha rota respondia 200 do
mesmo jeito. Saíram duas correções de uma vez, liberar o IP no painel do
serviço e fazer a rota devolver erro de verdade quando o envio falha. Essa
me marcou porque o código estava quase certo e a conclusão estava
completamente errada. Se eu tivesse aceitado o "testei e passou", o fluxo ia
pro ar quebrado e quem esquecesse a senha ficava sem conta.

**Quando o cache offline guardou tudo menos as fotos.**

Com o service worker pronto eu liguei o modo avião pra testar. A vitrine
carregou offline, com todos os quadros de imagem vazios. Descrevi exatamente
isso pra IA, o que apareceu e o que não apareceu. A causa estava num detalhe
do service worker que eu não conhecia. Foto que vem de outro domínio (as
minhas ficam no Storage do Supabase) chega como resposta "opaca", com o
campo `ok` valendo `false` mesmo estando perfeita, porque o navegador esconde
o conteúdo dela por segurança. O código só guardava no cache resposta com
`ok` verdadeiro, então descartava justo as fotos. Passou a aceitar resposta
opaca também, e o offline ficou completo.

As duas seguem o mesmo padrão, e é assim que eu acho erro no projeto
inteiro. Nem sempre eu percebo lendo o código. Percebo rodando, porque eu sei
o que o sistema tem que fazer e vejo na hora quando ele não faz. Aí eu isolo
onde quebrou e volto descrevendo o comportamento errado, em vez de só mandar
consertar. Foi assim com o hero que encolhia por uma regra de CSS, com o
dropdown que abria e ficava invisível, e com o visualizador de foto que
abria preso dentro do card em vez de cobrir a tela.
