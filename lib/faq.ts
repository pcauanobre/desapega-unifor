/**
 * O QUE: as perguntas frequentes do Desapega, num lugar só.
 * POR QUE: o mesmo conteúdo aparece na central de ajuda (/ajuda) e na
 *          seção de FAQ do fim da LP; duplicar texto é duplicar desvio.
 * CHAMA: app/ajuda/page.tsx e components/landing/FaqSecao.tsx.
 * QUEBRA SE: nada; é conteúdo estático.
 */
export const PERGUNTAS = [
  {
    q: "Como eu anuncio um item?",
    a: "Crie sua conta com o email institucional e uma senha, clique em Quero anunciar e preencha o formulário: título, descrição, categoria, preço (ou marque como doação) e as fotos. O anúncio entra na vitrine na hora.",
  },
  {
    q: "Precisa pagar alguma coisa?",
    a: "Nada. O Desapega Unifor é um projeto de economia circular entre alunos, sem taxa e sem comissão. O valor combinado é 100% entre quem anuncia e quem compra.",
  },
  {
    q: "Como falo com quem anunciou?",
    a: "Na página do produto tem o botão de WhatsApp de quem anunciou. É clicar e combinar a entrega.",
  },
  {
    q: "Onde a entrega acontece?",
    a: "Dentro do campus, de preferência no bloco indicado no anúncio. Combine o horário pelo WhatsApp e priorize lugares movimentados.",
  },
  {
    q: "Quem pode usar?",
    a: "Alunos da Unifor. O cadastro pede nome, email institucional (@edu.unifor.br) e senha; curso e semestre entram no perfil depois.",
  },
  {
    q: "Vendi ou doei meu item, e agora?",
    a: "Entre em Meus anúncios e exclua o item, assim a vitrine fica sempre atual pra quem tá procurando.",
  },
];
