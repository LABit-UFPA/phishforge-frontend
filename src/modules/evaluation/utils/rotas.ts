import type { ExpertMe } from '../../../types/expert.types'

export const ROTAS = {
  entrar: '/avaliacao/entrar',
  consentimento: '/avaliacao/consentimento',
  perfil: '/avaliacao/perfil',
  concluido: '/avaliacao/concluido',
  raiz: '/avaliacao',
} as const

export const rotaDoItem = (ordem: number) => `${ROTAS.raiz}/${ordem}`

/** Para onde ir agora: o próximo item pendente, ou a tela final se acabou. */
export function proximoDestino(me: ExpertMe): string {
  const { total, concluidas, proxima_ordem } = me.progresso
  return total > 0 && concluidas >= total ? ROTAS.concluido : rotaDoItem(proxima_ordem)
}

function normalizar(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
}

/**
 * Decide se a rota atual precisa ser trocada, dado o estado do especialista.
 * Devolve `null` quando pode ficar onde está.
 *
 * Ordem das exigências: consentimento (na versão vigente do TCLE) → perfil →
 * avaliação. O servidor também recusa itens sem consentimento (403); isto
 * evita que o especialista chegue a ver um erro por isso.
 */
export function destinoPara(pathname: string, me: ExpertMe): string | null {
  const atual = normalizar(pathname)

  if (me.consentimento.necessario) return atual === ROTAS.consentimento ? null : ROTAS.consentimento
  if (me.perfil.necessario) return atual === ROTAS.perfil ? null : ROTAS.perfil

  // Consentimento e perfil em dia: essas telas não fazem mais sentido, e a
  // raiz do módulo só existe para encaminhar ao lugar certo.
  if (atual === ROTAS.consentimento || atual === ROTAS.perfil || atual === ROTAS.raiz) {
    return proximoDestino(me)
  }
  return null
}
