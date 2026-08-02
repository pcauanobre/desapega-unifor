/**
 * O QUE: as regras de senha do projeto num lugar só: o mínimo aceitável
 *        (8+ caracteres, letra e número) e a régua de força de 4 níveis.
 * POR QUE: senha nova passa por aqui no cliente (feedback na hora) E no
 *          servidor (rota de redefinição), com o mesmo critério; regra
 *          duplicada diverge.
 * CHAMA: /entrar (cadastro e recuperação) e /api/senha/confirmar.
 * QUEBRA SE: nada; é função pura.
 */
export function problemaDaSenha(senha: string): string | null {
  if (senha.length < 8) return "A senha precisa de pelo menos 8 caracteres.";
  if (senha.length > 72) return "A senha pode ter no máximo 72 caracteres.";
  if (!/[a-zA-Z]/.test(senha)) return "A senha precisa de pelo menos uma letra.";
  if (!/\d/.test(senha)) return "A senha precisa de pelo menos um número.";
  return null;
}

/* Régua de força: comprimento, maiúscula+minúscula, número e símbolo
   somam pontos; o nível (0 a 3) vira cor e rótulo no medidor. */
export function forcaDaSenha(senha: string): { nivel: 0 | 1 | 2 | 3; rotulo: string } {
  let pontos = 0;
  if (senha.length >= 8) pontos++;
  if (senha.length >= 12) pontos++;
  if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) pontos++;
  if (/\d/.test(senha)) pontos++;
  if (/[^a-zA-Z0-9]/.test(senha)) pontos++;

  const nivel = (pontos <= 1 ? 0 : pontos <= 3 ? 1 : pontos === 4 ? 2 : 3) as 0 | 1 | 2 | 3;
  return { nivel, rotulo: ["fraca", "média", "boa", "forte"][nivel] };
}
