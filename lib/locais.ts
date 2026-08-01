/**
 * O QUE: os pontos de retirada do campus e a versão curta de cada um.
 * POR QUE: o formulário mostra o nome completo, mas o rodapé do card tem
 *          pouco espaço; nome comprido quebrava a linha do preço.
 * CHAMA: formulário de anúncio (droplist) e CardAnuncio (versão curta).
 * QUEBRA SE: nada; nome fora do mapa aparece como veio do banco.
 */
export const LOCAIS = [
  "Centro de Convivência (CC)",
  "Biblioteca",
  "Cantina central",
  "Ginásio",
  "Estacionamento norte",
  "Estacionamento sul",
  ..."ABCDEFGHIJKLMNPQRS".split("").map((letra) => `Bloco ${letra}`),
  "Outro ponto (a combinar)",
];

/* Apelidos de card; inclui nomes antigos que já estão em anúncio salvo. */
const CURTOS: Record<string, string> = {
  "Centro de Convivência (CC)": "CC",
  "Praça central": "CC",
  "Biblioteca central": "Biblioteca",
  "Cantina central": "Cantina",
  "Estacionamento norte": "Estac. norte",
  "Estacionamento sul": "Estac. sul",
  "Outro ponto (a combinar)": "A combinar",
};

export function encurtarLocal(nome: string | null): string {
  if (!nome) return "Campus";
  return CURTOS[nome] ?? nome;
}
