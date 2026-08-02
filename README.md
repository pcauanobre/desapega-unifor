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
- MUI Icons e react-easy-crop no front, com Tailwind na base de estilos

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
scripts/        aplicar migrations e semear os dados de demonstração
docs/           documentação do modelo de segurança
middleware.ts   rate limit por IP na borda da API
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
| POST | `/api/cadastro/enviar` | Envia o código de confirmação do cadastro |
| POST | `/api/cadastro/conferir` | Confere o código e libera a conta |
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
- **Claude Design** na fase de design, antes de existir código, pra fechar
  o desenho da landing
- **ChatGPT** pra gerar imagens usadas na interface

### Estratégia de engenharia de prompts

Antes de escrever a primeira linha, e antes até do design, passei uma ou
duas horas conversando com o Claude só sobre o projeto: o que o desafio
pedia de verdade, que problema isso resolve dentro do campus, o que dava pra
entregar no prazo e por onde começar. O desenvolvimento só começou depois
dessa conversa.

A marca também nasceu antes do código. Fiz o rebranding e a vetorização da
logo no CorelDRAW, o D azul com a casinha dentro, usando a IA como apoio de
referência enquanto eu testava as versões. É dela que sai a paleta de dois
azuis que aparece no primeiro prompt.

Meu jeito de trabalhar foi sempre o mesmo. Descrevo o comportamento que eu
quero como usuário, testo na hora no navegador e volto com print do que não
ficou bom. O detalhe de implementação fica com a IA. O que entra, como fica
e quando tá pronto é decisão minha. Três prompts que destravaram partes
grandes do projeto:

**1. O design da landing, antes de existir código** (Claude Design)

> preciso do design da landing desktop de um marketplace de desapego entre
> alunos da unifor, chama Desapega Unifor. o aluno anuncia o que não usa
> mais (livro de calculo, calculadora, jaleco, arduino, movel) pra vender
> barato ou doar, e outro aluno acha. economia circular no campus, publico
> jovem, tudo em portugues.
>
> a marca é um D azul com uma casinha dentro e a paleta nasce de dois azuis,
> um vivo e um bem escuro. to mandando as logos e um print de referencia,
> segue esse estilo de barra azul no topo com busca e seletor de categoria
> acoplado, mas com cara de marketplace moderno e não de sistema academico.
>
> o minimo que não pode faltar é header com os botoes de anunciar e buscar,
> hero, faixa de estatistica com numero ficticio, chips de categoria,
> vitrine dos ultimos itens (card com foto, titulo, categoria e preço, ou
> tag verde de DOAÇÃO), como funciona em 3 passos e footer.
>
> mas não quero que vc pegue essa lista e monte ela em cima só pra me
> obedecer, quero o teu olhar de design em cima dela. pensa a pagina inteira
> comigo: se faltar seção pra ela fazer sentido, se a ordem estiver errada,
> se tiver jeito melhor de mostrar a vitrine, muda e me diz o que mudou e
> por que. tipografia, espaçamento, hierarquia e animação são teus. me
> surpreende.

Foi o único prompt longo do projeto e foi de propósito, porque eu queria o
desenho fechado antes de escrever a primeira linha. Montei ele visando fazer
a IA do Claude Design pensar, sem mandar um texto extremamente limitado com
tudo mastigado, então a lista de seções entrou como o mínimo e o resto do
prompt dá liberdade pra ela mudar o que achar melhor, com a obrigação de me
dizer o que mudou e por que. O mockup que saiu de lá virou a referência visual que o
código deste repositório segue.

**2. O PWA com service worker e cache offline** (Claude Code)

> faça agora o pwa com o icone da unifor e um botao que ja pede pra
> instalar, com cache offline (manifest completo e service worker). pode
> olhar o pwa daquele meu outro projeto aqui na desktop como referencia, mas
> la é vite com plugin e aqui é next, então adapta em vez de copiar, o
> service worker escreve à mão. quero que o app abra offline com o que ja
> foi visto, e no fim me explica quais estrategias de cache vc usou e por
> que, porque isso eu vou ter que defender depois.

Eu já tinha feito PWA num projeto anterior, então mandei usar aquele como
ponto de partida, avisando que a arquitetura era outra. Saiu o
`public/sw.js` com as três estratégias que estão nele hoje: o casco do app
pré-cacheado na instalação, arquivo estático servido do cache primeiro, e
navegação e API indo na rede primeiro com o cache de reserva quando a rede
falha. A explicação de cada escolha eu pedi junto, porque eu ia ter que
defender isso depois.

**3. A auditoria de segurança** (Claude Code)

> preciso de uma verificação completa de segurança antes de botar isso no
> ar. ve se tem coisa exposta que não devia (chave, dado de usuario,
> telefone), poe rate limit na api, e testa se um invasor logado numa conta
> consegue pegar ou alterar dado de outra. e não me responde só que ta
> seguro, quero prova: cria duas contas de verdade, ataca uma pela outra,
> roda a mesma bateria como visitante deslogado e me mostra o resultado de
> cada tentativa. o que passar, corrige e roda de novo.

Aqui eu pedi prova em vez de código. Saiu um script que cria duas contas de
verdade e ataca uma pela outra (editar anúncio alheio, apagar, forjar o
autor, ler tabela que não devia), repetindo a bateria inteira como visitante
deslogado. As 19 tentativas voltaram negadas pelo banco. Entrou rate limit
por IP e os headers de segurança, e apareceu um furo que eu não tinha visto:
o telefone dos anunciantes era coluna pública da tabela, então uma
requisição só baixava a agenda inteira do site. Hoje o contato sai um por
vez, por uma função do banco. O teste completo está em
[docs/seguranca.md](docs/seguranca.md).

### Reflexão crítica

**Erro 1. A IA me disse que o email tinha sido enviado, e não tinha.**

1. **O que ela fez:** montou a recuperação de senha por código, testou e me
   avisou que estava funcionando. A tela mostrava a confirmação verde e a
   rota respondia sucesso mesmo quando o envio falhava.
2. **Como percebi:** esperei, olhei a caixa de entrada e o spam, e nada
   chegou. Voltei com o que eu tinha visto, sem chutar a causa:

   > o email não chegou. testei com o meu proprio email, esperei uns minutos
   > e olhei spam e lixeira, não veio nada. so que a tela mostrou a mensagem
   > verde de enviado normal, então a rota ta respondendo sucesso sem o
   > email sair. da uma olhada no log do servidor em vez de olhar so o
   > status da resposta, quero saber o que o serviço de email devolveu de
   > verdade

3. **Como guiei:** o log tinha a resposta. O serviço de email recusava com
   401, porque minha conta lá bloqueia envio partindo de IP desconhecido, e
   o erro da IA foi a rota engolir essa falha e responder 200 do mesmo
   jeito. Liberei o IP no painel e a rota passou a devolver erro de verdade
   quando o envio falha. Se eu tivesse aceitado o "testei e passou", o fluxo
   ia pro ar quebrado e quem esquecesse a senha ficava sem conta.

**Erro 2. O cache offline guardou tudo menos as fotos.**

1. **O que ela fez:** entregou o service worker com o cache offline
   funcionando. Ele guardava a página e os textos, e descartava todas as
   fotos dos anúncios sem avisar.
2. **Como percebi:** liguei o modo avião pra testar e a vitrine abriu
   offline com todos os quadros de imagem vazios. Descrevi o que apareceu e
   o que não apareceu:

   > o cache offline funcionou mas guardou só uma parte. liguei o modo aviao
   > depois de navegar e a vitrine abriu certinho com os textos, so que
   > todos os quadros de foto ficaram vazios. as fotos ficam no storage do
   > supabase, que é outro dominio, então ve se o service worker ta jogando
   > fora a resposta delas na hora de guardar

3. **Como guiei:** a causa era um detalhe do service worker que eu não
   conhecia. Foto que vem de outro domínio chega como resposta "opaca", com
   o campo `ok` valendo `false` mesmo estando perfeita, porque o navegador
   esconde o conteúdo dela por segurança. O código só guardava resposta com
   `ok` verdadeiro, então descartava justo as fotos. Passou a aceitar
   resposta opaca também, e o offline ficou completo.

Nem sempre eu percebo lendo o código. Percebo rodando, porque eu sei o que o
sistema tem que fazer e vejo na hora quando ele não faz. Aí eu isolo onde
quebrou e volto descrevendo o comportamento errado, em vez de só mandar
consertar.
