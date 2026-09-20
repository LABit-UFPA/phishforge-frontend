import { trimSelecao, type Faixa } from './selecao'

/** Offset UTF-16, dentro de `container`, do ponto (node, offset) de uma seleção. */
function offsetAbsoluto(container: HTMLElement, node: Node, offset: number): number {
  // Mede o texto que vem ANTES do ponto. Funciona qualquer que seja o
  // aninhamento de <span>s (os segmentos só carregam texto, então a soma dos
  // comprimentos é exatamente o offset na string) e cobre de graça o caso em
  // que a seleção cai numa fronteira entre elementos em vez de dentro de um
  // segmento. O texto é curto (um e-mail), então o custo não importa.
  const antes = document.createRange()
  antes.selectNodeContents(container)
  antes.setEnd(node, offset)
  return antes.toString().length
}

/**
 * Lê a seleção atual do navegador como uma faixa UTF-16 sobre `texto`
 * (o conteúdo do `container`), já aparada. `null` se não há seleção
 * utilizável dentro do container.
 */
export function capturarSelecao(container: HTMLElement, texto: string): Faixa | null {
  const selecao = window.getSelection()
  if (!selecao || selecao.rangeCount === 0 || selecao.isCollapsed) return null

  const range = selecao.getRangeAt(0)
  if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) return null

  const bruta: Faixa = {
    start: offsetAbsoluto(container, range.startContainer, range.startOffset),
    end: offsetAbsoluto(container, range.endContainer, range.endOffset),
  }
  return trimSelecao(texto, bruta)
}
