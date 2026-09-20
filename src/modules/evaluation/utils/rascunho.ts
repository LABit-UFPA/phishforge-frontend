import type { Difficulty } from '../../../types/phishing.types'
import type { AnotacaoApi } from '../../../types/expert.types'

/** Rascunho local de UM item (chave por `ordem`, não por id: o id nunca chega ao cliente). */
export interface Rascunho {
  dificuldade: Difficulty | null
  adequado: boolean | null
  qualidade: number
  justificativa: string
  comentario: string
  anotacoes: AnotacaoApi[]
}

const chave = (ordem: number) => `phishforge:avaliacao:rascunho:${ordem}`

// sessionStorage: some ao fechar a aba. Recarregar no meio de um item não
// perde o que foi digitado/marcado; o que vale de verdade é o PUT.
export function lerRascunho(ordem: number): Rascunho | null {
  try {
    const bruto = sessionStorage.getItem(chave(ordem))
    return bruto ? (JSON.parse(bruto) as Rascunho) : null
  } catch {
    return null
  }
}

export function salvarRascunho(ordem: number, r: Rascunho): void {
  try {
    sessionStorage.setItem(chave(ordem), JSON.stringify(r))
  } catch {
    // sem storage: só perde a proteção contra reload
  }
}

/** Chamado só depois de um PUT bem-sucedido. */
export function limparRascunho(ordem: number): void {
  try {
    sessionStorage.removeItem(chave(ordem))
  } catch {
    // nada a fazer
  }
}
