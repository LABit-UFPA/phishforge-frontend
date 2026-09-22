import type { Difficulty } from '../../../types/phishing.types'
import type { ItemCorpus } from '../../../types/researcher.types'

export const NIVEIS: Difficulty[] = ['facil', 'medio', 'dificil']

/** Composição pedida pelo plano de validação: 30 itens, 10 por nível. */
export const ALVO_POR_NIVEL = 10
export const TOTAL_ESPERADO = ALVO_POR_NIVEL * NIVEIS.length
export const alvoTexto = `${TOTAL_ESPERADO} itens (${ALVO_POR_NIVEL} por nível)`

export interface ItemSelecionavel {
  nivel: Difficulty
  channel: string
  is_malicious: boolean
}

export interface AnaliseComposicao {
  total: number
  distribuicao: Record<Difficulty, number>
  /** Vazio quando a seleção bate exatamente com o alvo. */
  avisos: string[]
}

/** Só e-mail phishing entra na rodada (o backend rejeita outros canais com 422). */
export function elegivel(item: ItemSelecionavel): boolean {
  return item.channel === 'email' && item.is_malicious
}

export function analisarComposicao(itens: ItemSelecionavel[]): AnaliseComposicao {
  const distribuicao: Record<Difficulty, number> = { facil: 0, medio: 0, dificil: 0 }
  for (const item of itens) distribuicao[item.nivel] += 1

  const avisos: string[] = []
  const inelegiveis = itens.filter((i) => !elegivel(i)).length
  if (inelegiveis > 0) avisos.push(`${inelegiveis} item(ns) não são e-mail de phishing e serão recusados pelo servidor.`)
  if (itens.length !== TOTAL_ESPERADO) avisos.push(`São esperados ${TOTAL_ESPERADO} itens; há ${itens.length} selecionados.`)
  for (const nivel of NIVEIS) {
    if (distribuicao[nivel] !== ALVO_POR_NIVEL) {
      avisos.push(`Nível ${nivel}: ${distribuicao[nivel]} de ${ALVO_POR_NIVEL}.`)
    }
  }
  return { total: itens.length, distribuicao, avisos }
}

export interface ResultadoSelecaoAutomatica {
  selecionados: ItemCorpus[]
  /** Nível -> quantos itens faltam para completar `ALVO_POR_NIVEL`. Vazio quando o corpus alcança. */
  faltando: Partial<Record<Difficulty, number>>
}

/**
 * Combina os `ALVO_POR_NIVEL` primeiros itens de cada nível (já elegíveis: `/researcher/corpus`
 * só devolve canal e-mail + phishing) na ordem `NIVEIS`. Não há escolha humana aqui de propósito
 * — a seleção da rodada passou a ser inteiramente automática.
 */
export function combinarSelecaoAutomatica(porNivel: Record<Difficulty, ItemCorpus[]>): ResultadoSelecaoAutomatica {
  const selecionados: ItemCorpus[] = []
  const faltando: Partial<Record<Difficulty, number>> = {}
  for (const nivel of NIVEIS) {
    const itens = porNivel[nivel].slice(0, ALVO_POR_NIVEL)
    selecionados.push(...itens)
    if (itens.length < ALVO_POR_NIVEL) faltando[nivel] = ALVO_POR_NIVEL - itens.length
  }
  return { selecionados, faltando }
}
