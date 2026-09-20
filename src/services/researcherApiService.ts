import { request, requestBlob } from './http'
import type {
  CodigoEmitido,
  DatasetExport,
  EspecialistaLinha,
  EspecialistaNovo,
  FormatoExport,
  ItensResultado,
  NovaRodada,
  Resumo,
  Rodada,
  RodadaDetalhe,
} from '../types/researcher.types'

const com = (apiKey: string, signal?: AbortSignal) => ({ escopo: 'pesquisador' as const, apiKey, signal })
const P = '/api/v1/researcher'

export const listarRodadas = (k: string, signal?: AbortSignal) => request<Rodada[]>(`${P}/rodadas`, com(k, signal))

export const obterRodada = (k: string, id: string, signal?: AbortSignal) =>
  request<RodadaDetalhe>(`${P}/rodadas/${id}`, com(k, signal))

export const criarRodada = (k: string, body: NovaRodada) =>
  request<Rodada>(`${P}/rodadas`, { ...com(k), method: 'POST', body })

export const definirItens = (k: string, id: string, emailIds: string[]) =>
  request<ItensResultado>(`${P}/rodadas/${id}/itens`, { ...com(k), method: 'PUT', body: { email_ids: emailIds } })

export const abrirRodada = (k: string, id: string) =>
  request<Rodada>(`${P}/rodadas/${id}/abrir`, { ...com(k), method: 'POST' })

export const encerrarRodada = (k: string, id: string) =>
  request<Rodada>(`${P}/rodadas/${id}/encerrar`, { ...com(k), method: 'POST' })

export const criarEspecialista = (k: string, body: EspecialistaNovo) =>
  request<CodigoEmitido>(`${P}/especialistas`, { ...com(k), method: 'POST', body })

export const recodificarEspecialista = (k: string, id: string) =>
  request<CodigoEmitido>(`${P}/especialistas/${id}/recodificar`, { ...com(k), method: 'POST' })

export const listarEspecialistas = (k: string, rodadaId: string, signal?: AbortSignal) =>
  request<EspecialistaLinha[]>(`${P}/especialistas?rodada_id=${rodadaId}`, com(k, signal))

export const obterResumo = (k: string, id: string, signal?: AbortSignal) =>
  request<Resumo>(`${P}/rodadas/${id}/resumo`, com(k, signal))

export function baixarExport(
  k: string,
  id: string,
  dataset: DatasetExport,
  formato: FormatoExport,
  incluirPii: boolean,
): Promise<Blob> {
  const params = new URLSearchParams({ dataset, format: formato })
  if (incluirPii) params.set('incluir_pii', 'true')
  return requestBlob(`${P}/rodadas/${id}/export?${params.toString()}`, com(k))
}
