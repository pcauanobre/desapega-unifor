"use client";

import { forcaDaSenha } from "@/lib/senha";

/**
 * O QUE: o medidor de força da senha: 4 barrinhas que acendem da cor do
 *        nível (vermelho → laranja → verde) conforme a pessoa digita.
 * POR QUE: dizer "senha fraca" depois do submit irrita; mostrar a régua
 *          enquanto digita ensina sem bloquear.
 * CHAMA: campos de senha nova do /entrar (cadastro e recuperação).
 * QUEBRA SE: nada; sem senha digitada ele nem aparece.
 */
export function MedidorSenha({ senha }: { senha: string }) {
  if (!senha) return null;
  const { nivel, rotulo } = forcaDaSenha(senha);

  return (
    <div className={`ms ms-${nivel}`}>
      <div className="ms-barras">
        {[0, 1, 2, 3].map((i) => (
          <i key={i} className={i <= nivel ? "on" : ""} />
        ))}
      </div>
      <span className="ms-rotulo">Senha {rotulo}</span>
    </div>
  );
}
