/**
 * O QUE: transforma um timestamp em texto relativo curto ("há 2 horas").
 * POR QUE: o card mostra "quando anunciou" do jeito que gente lê, não ISO.
 * CHAMA: CardAnuncio.
 * QUEBRA SE: nada; data inválida vira string vazia.
 */
export function tempoRelativo(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "";

  const seg = Math.max(0, Math.floor((Date.now() - data.getTime()) / 1000));
  if (seg < 60) return "agora mesmo";
  const min = Math.floor(seg / 60);
  if (min < 60) return `há ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `há ${horas} hora${horas > 1 ? "s" : ""}`;
  const dias = Math.floor(horas / 24);
  return `há ${dias} dia${dias > 1 ? "s" : ""}`;
}
