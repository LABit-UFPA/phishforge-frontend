import { useCallback, useEffect, useState } from 'react'
import { getMe } from '../../../services/expertApiService'
import { ApiError } from '../../../services/http'
import { limparToken, lerToken } from '../../../services/expertSession'
import type { ExpertMe } from '../../../types/expert.types'

export type EstadoSessao =
  | { estado: 'carregando' }
  | { estado: 'sem-sessao' } // sem token, ou 401 (expirado/revogado)
  | { estado: 'erro'; mensagem: string }
  | { estado: 'ok'; me: ExpertMe }

/** Carrega `GET /expert/me` com o token guardado e expõe `atualizar` (após consentimento/perfil/submissão). */
export function useExpertSession() {
  const [sessao, setSessao] = useState<EstadoSessao>({ estado: 'carregando' })

  const carregar = useCallback(async (signal?: AbortSignal): Promise<ExpertMe | null> => {
    const token = lerToken()
    if (!token) {
      setSessao({ estado: 'sem-sessao' })
      return null
    }
    try {
      const me = await getMe(token, signal)
      setSessao({ estado: 'ok', me })
      return me
    } catch (e) {
      if (signal?.aborted) return null
      if (e instanceof ApiError && e.status === 401) {
        limparToken()
        setSessao({ estado: 'sem-sessao' })
        return null
      }
      setSessao({ estado: 'erro', mensagem: e instanceof Error ? e.message : 'Erro desconhecido' })
      return null
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void carregar(controller.signal)
    return () => controller.abort()
  }, [carregar])

  return { sessao, atualizar: () => carregar() }
}
