import { useEffect, useState } from 'react'
import { getCues, getItem } from '../../../services/expertApiService'
import { ApiError } from '../../../services/http'
import { lerToken } from '../../../services/expertSession'
import type { CueTaxonomia, ExpertItem } from '../../../types/expert.types'

export type EstadoItem =
  | { estado: 'carregando' }
  | { estado: 'nao-autenticado' }
  | { estado: 'nao-encontrado' }
  | { estado: 'erro'; mensagem: string }
  | { estado: 'ok'; dados: ExpertItem; cues: CueTaxonomia[] }

/** Carrega o item `ordem` (às cegas) e a taxonomia de pistas. */
export function useEvaluationItem(ordem: number) {
  const [estado, setEstado] = useState<EstadoItem>({ estado: 'carregando' })

  useEffect(() => {
    const controller = new AbortController()
    const token = lerToken()
    if (!token) {
      setEstado({ estado: 'nao-autenticado' })
      return
    }
    setEstado({ estado: 'carregando' })
    Promise.all([getItem(token, ordem, controller.signal), getCues(token)])
      .then(([dados, cues]) => setEstado({ estado: 'ok', dados, cues }))
      .catch((e: unknown) => {
        if (controller.signal.aborted) return
        if (e instanceof ApiError && e.status === 401) setEstado({ estado: 'nao-autenticado' })
        else if (e instanceof ApiError && e.status === 404) setEstado({ estado: 'nao-encontrado' })
        else setEstado({ estado: 'erro', mensagem: e instanceof Error ? e.message : 'Erro desconhecido' })
      })
    return () => controller.abort()
  }, [ordem])

  return estado
}
