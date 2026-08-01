/**
 * O QUE: converte a matrícula do aluno no email sintético que o Supabase
 *        Auth usa por baixo (matricula vira alias: base+matricula@gmail).
 * POR QUE: o login do produto é por MATRÍCULA (como o portal da Unifor),
 *          mas o Auth trabalha com email. Mesmo padrão de telefone-vira-
 *          email que já uso em produção em outro projeto.
 * CHAMA: tela /entrar (login e cadastro).
 * QUEBRA SE: mudar a base depois de já existirem contas (quebra o login
 *            de quem cadastrou com a base antiga).
 */
const BASE = "desapega.unifor.demo";

export function matriculaParaEmail(matricula: string): string {
  return `${BASE}+${matricula}@gmail.com`;
}

export function matriculaValida(matricula: string): boolean {
  return /^\d{5,10}$/.test(matricula);
}
