import { useCallback, useRef, useState } from 'react'
import type { AnotacaoApi } from '../../../types/expert.types'

/** Anotação no estado da tela: o formato da API (offsets em CODE POINTS) + um id local estável. */
export interface AnotacaoLocal extends AnotacaoApi {
  id: string
}

export function useAnnotations(inicial: AnotacaoApi[]) {
  const proximoId = useRef(0)
  const novoId = () => `anot-${(proximoId.current += 1)}`

  const [anotacoes, setAnotacoes] = useState<AnotacaoLocal[]>(() => inicial.map((a) => ({ ...a, id: novoId() })))

  const adicionar = useCallback((a: AnotacaoApi) => {
    setAnotacoes((atuais) => [...atuais, { ...a, id: `anot-${(proximoId.current += 1)}` }])
  }, [])

  const remover = useCallback((id: string) => {
    setAnotacoes((atuais) => atuais.filter((a) => a.id !== id))
  }, [])

  return { anotacoes, adicionar, remover }
}

/** O que vai para a API: sem o id local. */
export function paraApi(anotacoes: AnotacaoLocal[]): AnotacaoApi[] {
  return anotacoes.map(({ campo, cue_code, span_start, span_end, trecho }) => ({ campo, cue_code, span_start, span_end, trecho }))
}
