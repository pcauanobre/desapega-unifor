# Regras pra IA (Desapega Unifor)

## Como trabalhar comigo

- **Um tópico por vez.** Não abre frente nova enquanto a atual não
  estiver funcionando e commitada. Se eu tentar pular pra outra coisa
  no meio, me lembra do que ficou aberto e pergunta se é pra abandonar.
- **Fecha o assunto antes de seguir.** No fim de cada tópico, diz
  em uma linha: o que ficou pronto, o que falta, e qual é o commit.
- Se eu pedir feature que não está no escopo obrigatório, avisa que
  é bônus antes de começar.

## Commits (me cobra isso)

- Todo tópico fechado vira **um commit** local, na hora, com mensagem
  que descreve o passo: `feat: filtro por categoria na vitrine`.
  Nunca `update`, `ajustes`, `wip`.
- Se um dia de trabalho terminar sem commit, me avisa.
- Push pro repositório remoto só quando eu mandar.

## Código

- Simples e funcional. Sem camada, abstração ou padrão que o
  requisito não pediu.
- SEMPRE verificar se já existe função, componente ou helper antes
  de criar coisa nova. Reaproveitar em vez de duplicar.
- Um arquivo faz uma coisa. Máximo 150 linhas.
- Não instala dependência nova sem perguntar e justificar.
- Não mexe em arquivo que eu não pedi.
- Sem código morto e sem comentário genérico.
- Comentário padrão em toda função: O QUE / POR QUE / CHAMA / QUEBRA SE.
- Depois de gerar cada arquivo: 3 frases dizendo o que faz, por que
  fez assim, e o que quebra se eu mudar.

## Proibido

- Commitar `.env` ou qualquer chave. Só a anon key vai pro front.
- Rodar build ou deploy por conta própria.

## Escopo obrigatório (nada além disso sem eu pedir)

CRUD de anúncio (criar, listar, filtrar, deletar) em JSON · landing
desktop com vitrine e filtro · PWA mobile com formulário e "meus
anúncios" · manifest.json · service worker instalável · responsivo.
