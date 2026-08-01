/**
 * O QUE: redimensiona a foto pra no máximo 1280px e converte pra WebP
 *        (qualidade 0.82) direto no navegador, antes do upload.
 * POR QUE: foto de celular tem 5MB+; otimizada cai pra ~100-300KB, o
 *          upload voa e a vitrine carrega leve.
 * CHAMA: formulário de /anunciar.
 * QUEBRA SE: o arquivo não for imagem (retorna erro pra tela tratar).
 */
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
