/**
 * O QUE: transforma um timestamp em texto relativo curto ("há 2 horas").
 * POR QUE: o card mostra "quando anunciou" do jeito que gente lê, não ISO.
 * CHAMA: CardAnuncio.
 * QUEBRA SE: nada; data inválida vira string vazia.
 */
/**
 * O QUE: "Hoje, 14:18" / "Ontem, 09:40" / "Anteontem, 21:05", e mais velho
 *        que isso vira "15/03, 21:05".
 * POR QUE: formato de classificados que o Pedro pediu pros cards.
 * CHAMA: CardAnuncio.
 * QUEBRA SE: nada; data inválida vira string vazia.
 */
export function quandoPublicado(iso: string): string {
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "";

  const hora = data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const inicioDoDia = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dias = Math.round(
    (inicioDoDia(new Date()) - inicioDoDia(data)) / 86_400_000,
  );

  if (dias <= 0) return `Hoje, ${hora}`;
  if (dias === 1) return `Ontem, ${hora}`;
  if (dias === 2) return `Anteontem, ${hora}`;
  const diaMes = data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
  return `${diaMes}, ${hora}`;
}

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
