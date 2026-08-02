/**
 * O QUE: redimensiona a foto pra no máximo 1280px e converte pra WebP
 *        (qualidade 0.82) direto no navegador, antes do upload.
 * POR QUE: foto de celular tem 5MB+; otimizada cai pra ~100-300KB, o
 *          upload voa e a vitrine carrega leve.
 * CHAMA: formulário de /anunciar.
 * QUEBRA SE: o arquivo não for imagem (retorna erro pra tela tratar).
 */
export type AreaCorte = { x: number; y: number; width: number; height: number };

/**
 * O QUE: recorta a região escolhida no editor e devolve WebP otimizado
 *        (máx 1280px no lado maior).
 * POR QUE: o corte que o usuário arrastou vira exatamente a imagem final.
 * CHAMA: EditorFoto, ao confirmar o corte.
 * QUEBRA SE: a área vier fora da imagem (canvas devolve erro).
 */
export async function recortarFoto(arquivo: File, area: AreaCorte): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo);
  const MAX = 1280;
  const escala = Math.min(1, MAX / Math.max(area.width, area.height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width * escala);
  canvas.height = Math.round(area.height * escala);
  canvas
    .getContext("2d")!
    .drawImage(bitmap, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return new Promise((resolver, rejeitar) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolver(blob) : rejeitar(new Error("falha ao recortar a foto")),
      "image/webp",
      0.82,
    );
  });
}

/**
 * O QUE: prepara a foto ANTES do editor de corte: converte SEMPRE pra WebP
 *        e limita o lado maior a 2000px.
 * POR QUE: duas coisas de uma vez. Foto de celular vem com 12MP e em HEIC
 *          ou PNG pesado; jogar isso no editor come memória e trava o
 *          arrasto. E arquivo em resolução nativa nunca deve seguir adiante,
 *          nem quando é pequeno: WebP é sempre mais leve pelo mesmo olho.
 *          Assim foto gigante é aceita numa boa, em vez de ser recusada.
 * CHAMA: quem recebe arquivo do usuário (anunciar, conta, wizard).
 * QUEBRA SE: nada; se o navegador não conseguir decodificar (formato exótico),
 *            devolve o arquivo original e o editor tenta do jeito que veio.
 */
export async function prepararFoto(arquivo: File): Promise<File> {
  const MAX = 2000;
  try {
    const bitmap = await createImageBitmap(arquivo);
    // escala 1 quando a foto já é pequena: ela continua sendo convertida.
    const escala = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((r) =>
      canvas.toBlob(r, "image/webp", 0.9),
    );
    if (!blob) return arquivo;
    return new File([blob], arquivo.name.replace(/\.\w+$/, "") + ".webp", {
      type: "image/webp",
    });
  } catch {
    return arquivo;
  }
}
