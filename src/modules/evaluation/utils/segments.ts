/** Uma anotação já convertida para UTF-16, relativa ao texto do campo. */
export interface AnotacaoUtf16 {
  id: string
  start: number
  end: number
}

export interface Segmento {
  /** Offset UTF-16 em que este segmento começa (vai em `data-start`). */
  start: number
  end: number
  texto: string
  /** Ids das anotações que cobrem TODO este segmento, na ordem em que foram dadas. */
  annIds: string[]
}

/**
 * Quebra `texto` nas fronteiras das anotações, para renderizar cada pedaço
 * num `<span>`.
 *
 * Invariante (a que os testes verificam): a concatenação dos `texto` de todos
 * os segmentos, em ordem, é **exatamente** o texto original — nenhum caractere
 * é inserido, removido ou substituído. É isso que faz o offset lido do DOM
 * bater com o offset da string.
 *
 * Sobreposição e aninhamento saem de graça: um trecho coberto por N anotações
 * vira UM segmento com `annIds.length === N`, estilizado com N sublinhados
 * empilhados — sem `<mark>` aninhado, sem DOM inválido em overlap parcial.
 */
export function segmentar(texto: string, anotacoes: readonly AnotacaoUtf16[]): Segmento[] {
  if (texto.length === 0) return []

  const validas = anotacoes
    .map((a) => ({ ...a, start: Math.max(0, a.start), end: Math.min(texto.length, a.end) }))
    .filter((a) => a.end > a.start)

  const fronteiras = new Set<number>([0, texto.length])
  for (const a of validas) {
    fronteiras.add(a.start)
    fronteiras.add(a.end)
  }
  const pontos = [...fronteiras].sort((x, y) => x - y)

  const segmentos: Segmento[] = []
  for (let i = 0; i < pontos.length - 1; i += 1) {
    const start = pontos[i]
    const end = pontos[i + 1]
    segmentos.push({
      start,
      end,
      texto: texto.slice(start, end),
      annIds: validas.filter((a) => a.start <= start && a.end >= end).map((a) => a.id),
    })
  }
  return segmentos
}
