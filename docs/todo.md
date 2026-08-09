# TODO — ajustes de UI (lote de 10 itens)

Cada item é um tópico próprio (commit separado, um de cada vez), na ordem abaixo.

## 1 + 8. Dropdown (Droplist) ficando atrás de outros elementos
- Causa: `.dl.aberto{z-index:60}` só sobe de camada dentro do stacking context
  mais próximo. `.wiz-dl`/`.an-linha` já têm a regra `:has(.dl.aberto)` pra
  empurrar o pai (funciona no wizard). Mas `.shelf-head-row` (Vitrine, dropdown
  "Ordenar por") e outros containers de card **não têm** essa regra, então o
  menu aberto fica atrás dos cards que vêm depois no DOM/têm seu próprio
  stacking context (transform/animação).
- Fix: em `app/design.css`, adicionar `.shelf-head-row:has(.dl.aberto)` (e
  qualquer outro container de Droplist fora do wizard, ex. onde o dropdown de
  curso aparece no perfil/config) na mesma regra de elevação de z-index já
  usada pro wizard. Sobe o z-index bem alto (ex. 90) pra vencer qualquer card.
- Arquivo: `app/design.css` (não mexe no `Droplist.tsx`).

## 2. Botão "Instalar app" não pode aparecer no desktop
- Causa: `TopBar.tsx` renderiza `<BotaoInstalar />` (variante desktop) dentro
  da `.utilbar`, que só é escondida em mobile (`display:none` no media query).
  O evento `beforeinstallprompt` dispara em Chrome desktop também, então o
  botão aparece lá — o que não deveria.
- Fix: remover `<BotaoInstalar />` de `components/landing/TopBar.tsx` (e o
  import). A variante mobile em `HeaderBusca.tsx` continua intacta.
- Arquivo: `components/landing/TopBar.tsx`.

## 3. Layout dos botões "Tirar foto" / "Galeria" (não podem parecer card de foto)
- Causa: `.an-foto-add` usa a mesma grade `.an-fotos` das prévias, ficando do
  mesmo tamanho/formato de um card quadrado de foto.
- Fix: sair da grade de fotos — os botões viram uma linha de botões pill
  (estilo `btn-outline`/`chip`) abaixo do grid de prévias, não dentro dele.
  Ajusta `components/anunciar/FotosUpload.tsx` (estrutura JSX: dois `<div>`
  separados) + CSS novo pros botões em `app/design.css` (mantém `.an-foto-add`
  só pra estilo, tira do grid `.an-fotos`).
- Arquivos: `components/anunciar/FotosUpload.tsx`, `app/design.css`.

## 4. Etapa "Onde ele se encaixa": scroll automático + popups centralizados
- Fix:
  - Ao abrir um Droplist nessa etapa, rolar automaticamente pra garantir que
    o menu fique visível (scroll do wrapper `.wiz-passo`/`.wiz-card`, não da
    página) — ajuste em `Droplist.tsx` (scrollIntoView no `abrir()`) ou CSS de
    `scroll-margin`.
  - Não faz sentido a etapa começar com espaço vazio grande só pra "sobrar
    espaço" pro dropdown — isso é sintoma do problema de z-index/overflow do
    item 1, que ao ser corrigido remove a necessidade de folga manual.
  - "Centralizar popups": o modal de aviso (`.aviso-overlay`) e telas
    equivalentes já usam `position:fixed;inset:0` — conferir se o conteúdo
    interno está centralizado (flex center) em todos, ajustar onde não estiver.
- Arquivos: `components/Droplist.tsx`, `app/design.css`, revisar
  `app/anunciar/novo/page.tsx` (etapa 2/3).

## 5. Indicador "Enviando foto X de Y" sai do botão
- Causa: hoje o texto substitui o conteúdo do botão `.wiz-continuar`
  (`app/anunciar/novo/page.tsx`), mudando a largura/aparência dele.
- Fix: manter o botão com o texto normal + um spinner pequeno ao lado (usa a
  classe `.spinner` que já existe no design.css), sem trocar o texto do
  botão nem redimensionar. Some sozinho quando `progressoFoto` zera.
- Arquivo: `app/anunciar/novo/page.tsx`.

## 6. Seleção ao clicar no nome do vendedor (perfil público)
- Causa: `.pd-vend-link:hover` já pinta fundo azul claro, mas o efeito visual
  que aparece "só no nome" no mobile é o tap-highlight padrão do navegador
  (não há `-webkit-tap-highlight-color` neutralizado em lugar nenhum do CSS).
- Fix: `-webkit-tap-highlight-color: transparent` no link + reforçar/alargar
  o `:active`/`:focus-visible` do `.pd-vend-link` pra cobrir avatar+nome+curso
  igual ao hover (fundo preenchido, cantos arredondados), ficando consistente
  no toque mobile.
- Arquivos: `app/design.css` (`.pd-vend-link` e vizinhos).

## 7. Ícones do card viram uma engrenagem com dropdown
- Fix: em `app/meus-anuncios/page.tsx`, trocar o bloco `.ma-icones` (3 botões
  soltos: check verde, editar, lixeira) por um único botão de engrenagem
  (`SettingsIcon` ou `MoreVertIcon`) que abre um menu com essas 3 opções —
  reaproveitando o componente `Droplist` (ou um menu simples no mesmo
  padrão, já que os itens aqui disparam ação e não trocam "valor selecionado";
  avaliar se cabe estender o `Droplist` ou criar um menu de ações mínimo
  reaproveitando o CSS `.dl-menu`/`.dl-op`).
- Arquivos: `app/meus-anuncios/page.tsx`, `app/design.css` (e possivelmente
  pequeno ajuste em `components/Droplist.tsx` só se for reaproveitado para
  ações, não apenas seleção de valor).

## 9. Seta do carrossel ativa fullscreen em vez de trocar foto (bug)
- Causa confirmada: os botões `.pd-seta` (`anterior`/`proxima`) ficam dentro
  da `.pd-foto`, que tem `onClick={() => setCheia(true)}`. O clique no botão
  borbulha (bubbling) pro pai e dispara o fullscreen junto com a troca de foto.
- Fix: `e.stopPropagation()` no `onClick` de `anterior`/`proxima` (ou nos
  botões `.pd-seta` diretamente) em `components/produto/Carrossel.tsx`.
- Arquivo: `components/produto/Carrossel.tsx`.

## 10. Layout do wizard "Anunciar" no desktop: centralizado, sem scroll de página
- Causa: `.wiz-fundo{min-height:100vh}` deixa a página crescer e rolar quando
  o conteúdo do passo é alto (ex. etapa de revisão "mostre seu item"). O
  scroll interno (`.wiz-card .wiz-passo{overflow-y:auto}`) hoje só existe
  dentro do media query mobile (`max-width` em `app/design.css` linha ~1254).
- Fix: aplicar o mesmo padrão de contenção também no desktop — `.wiz-fundo`
  com `height:100vh` (não `min-height`) e `.wiz-passo` com
  `overflow-y:auto` sempre que o conteúdo da etapa passar da altura
  disponível, sem tocar no restante do layout (card continua centralizado).
- Arquivo: `app/design.css`.

---

**Ordem de execução sugerida:** 9 (bug isolado, rápido) → 2 → 6 → 1+8 (mesma
causa) → 4 (depende do fix de z-index) → 10 → 5 → 3 → 7.

Cada item = 1 commit ao terminar e validar no `npm run dev`.
