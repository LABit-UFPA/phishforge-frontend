import { ApiError } from '../../../services/http'

/** 401 no console = chave errada/expirada: o chamador volta para a tela da chave. */
export function tratarErro(err: unknown, aoNaoAutorizado: () => void): string | null {
  if (err instanceof DOMException && err.name === 'AbortError') return null
  if (err instanceof ApiError && err.status === 401) {
    aoNaoAutorizado()
    return null
  }
  return err instanceof Error ? err.message : 'Erro desconhecido'
}
