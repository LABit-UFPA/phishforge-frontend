/**
 * Conversão entre as duas noções de "posição no texto" que se encontram aqui.
 *
 * - JavaScript indexa strings em **unidades UTF-16** (`"😀".length === 2`).
 * - O backend valida `trecho == campo[start:end]` com o `len()`/fatiamento do
 *   Python, que conta **code points** (`len("😀") == 1`).
 *
 * Um emoji antes de uma anotação desloca todo offset seguinte entre os dois
 * mundos — e, se ninguém converter, o dado é gravado errado **em silêncio**.
 * Este é o ÚNICO módulo do frontend que faz essa conta: o que sai para a API é
 * sempre em code points; o que entra na renderização (`segments.ts`) e na
 * captura de seleção (`selecao.ts`) é sempre UTF-16.
 */

function ehSurrogateAlto(unidade: number): boolean {
  return unidade >= 0xd800 && unidade <= 0xdbff
}

function ehSurrogateBaixo(unidade: number): boolean {
  return unidade >= 0xdc00 && unidade <= 0xdfff
}

/**
 * Se `indice` cai NO MEIO de um par surrogate (entre as duas metades de um
 * emoji, por exemplo), devolve o limite mais próximo na direção pedida:
 * `'inicio'` recua para antes do par, `'fim'` avança para depois dele. Fora
 * desse caso devolve `indice` inalterado.
 */
export function ajustarAoLimiteDeCodePoint(texto: string, indice: number, direcao: 'inicio' | 'fim'): number {
  if (indice > 0 && indice < texto.length && ehSurrogateAlto(texto.charCodeAt(indice - 1)) && ehSurrogateBaixo(texto.charCodeAt(indice))) {
    return direcao === 'inicio' ? indice - 1 : indice + 1
  }
  return indice
}

/** UTF-16 → code points: quantos code points há antes de `indiceUtf16`. */
export function utf16ParaCodePoints(texto: string, indiceUtf16: number): number {
  const limite = Math.min(Math.max(indiceUtf16, 0), texto.length)
  const ajustado = ajustarAoLimiteDeCodePoint(texto, limite, 'inicio')
  let codePoints = 0
  for (let i = 0; i < ajustado; i += 1) {
    codePoints += 1
    if (ehSurrogateAlto(texto.charCodeAt(i)) && i + 1 < ajustado && ehSurrogateBaixo(texto.charCodeAt(i + 1))) {
      i += 1 // o par conta como UM code point
    }
  }
  return codePoints
}

/** Code points → UTF-16: a unidade UTF-16 em que começa o code point `indiceCodePoint`. */
export function codePointsParaUtf16(texto: string, indiceCodePoint: number): number {
  if (indiceCodePoint <= 0) return 0
  let restantes = indiceCodePoint
  let i = 0
  while (i < texto.length && restantes > 0) {
    i += ehSurrogateAlto(texto.charCodeAt(i)) && i + 1 < texto.length && ehSurrogateBaixo(texto.charCodeAt(i + 1)) ? 2 : 1
    restantes -= 1
  }
  return i
}

/** Tamanho em code points — o `len()` do Python. */
export function tamanhoEmCodePoints(texto: string): number {
  return utf16ParaCodePoints(texto, texto.length)
}

/** `texto[inicio:fim]` do Python: fatia por code points, não por unidades UTF-16. */
export function fatiarPorCodePoints(texto: string, inicioCp: number, fimCp: number): string {
  return texto.slice(codePointsParaUtf16(texto, inicioCp), codePointsParaUtf16(texto, fimCp))
}
