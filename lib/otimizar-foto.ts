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
 * O QUE: prepara a foto ANTES do editor de corte: encolhe pra no máximo
 *        2000px no lado maior e devolve um File leve.
 * POR QUE: foto de celular vem com 12MP (4000x3000). Jogar isso direto no
 *          editor come memória, trava o arrasto e em aparelho mais fraco o
 *          navegador desiste no meio. Encolhendo antes, foto grande passa
 *          a ser aceita numa boa e o corte fica fluido.
 * CHAMA: quem recebe arquivo do usuário (anunciar, conta, wizard).
 * QUEBRA SE: nada; se o navegador não conseguir decodificar, devolve o
 *            arquivo original e o editor tenta do jeito que veio.
 */
export async function prepararFoto(arquivo: File): Promise<File> {
  const MAX = 2000;
  try {
    const bitmap = await createImageBitmap(arquivo);
    const maior = Math.max(bitmap.width, bitmap.height);
    if (maior <= MAX) {
      bitmap.close();
      return arquivo;
    }
    const escala = MAX / maior;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((r) =>
      canvas.toBlob(r, "image/jpeg", 0.92),
    );
    if (!blob) return arquivo;
    return new File([blob], arquivo.name.replace(/\.\w+$/, "") + ".jpg", {
      type: "image/jpeg",
    });
  } catch {
    return arquivo;
  }
}

export async function otimizarFoto(arquivo: File): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo);
  const MAX = 1280;
  const escala = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return new Promise((resolver, rejeitar) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolver(blob) : rejeitar(new Error("falha ao converter a foto")),
      "image/webp",
      0.82,
    );
  });
}
