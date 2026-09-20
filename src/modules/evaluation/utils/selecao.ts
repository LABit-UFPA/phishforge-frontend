import { ajustarAoLimiteDeCodePoint } from './offsets'

export interface Faixa {
  start: number
  end: number
}

const ESPACO = /\s/

/**
 * Encolhe as pontas da seleção sobre espaço/quebra de linha (um duplo-clique
 * costuma capturar o espaço seguinte à palavra) e garante
 * `0 <= start < end <= texto.length`, sem cortar um par surrogate ao meio.
 * Devolve `null` se não sobrar nada.
 */
export function trimSelecao(texto: string, faixa: Faixa): Faixa | null {
  let start = Math.max(0, Math.min(faixa.start, texto.length))
  let end = Math.max(0, Math.min(faixa.end, texto.length))
  if (end < start) [start, end] = [end, start]

  while (start < end && ESPACO.test(texto[start])) start += 1
  while (end > start && ESPACO.test(texto[end - 1])) end -= 1

  start = ajustarAoLimiteDeCodePoint(texto, start, 'inicio')
  end = ajustarAoLimiteDeCodePoint(texto, end, 'fim')
  return end > start ? { start, end } : null
}
