import { request } from './http'
import type {
  BatchAccepted,
  BatchJob,
  BatchRequest,
  EmailFilters,
  EmailListResponse,
  EmailStatistics,
  PhishingEmail,
  QueryRequest,
} from '../types/phishing.types'

/** Geracao unica. */
export function generatePhishing(payload: QueryRequest): Promise<PhishingEmail> {
  return request<PhishingEmail>('/api/v1/generate', { method: 'POST', body: payload })
}

/** Lote assincrono: responde 202 com o `job_id`; o resultado vem por polling em `getBatchJob`. */
export function generateBatch(payload: BatchRequest): Promise<BatchAccepted> {
  return request<BatchAccepted>('/api/v1/generate/batch', { method: 'POST', body: payload })
}

export function getBatchJob(jobId: string, signal?: AbortSignal): Promise<BatchJob> {
  return request<BatchJob>(`/api/v1/generate/batch/${jobId}`, { signal })
}

/** Buscar email especifico por ID */
export function getEmailById(emailId: string): Promise<PhishingEmail> {
  return request<PhishingEmail>(`/api/v1/emails/${emailId}`)
}

/** Listar emails com filtros */
export function listEmails(filters: EmailFilters = {}): Promise<EmailListResponse> {
  const params = new URLSearchParams()

  if (filters.categoria) params.append('categoria', filters.categoria)
  if (filters.nivel) params.append('nivel', filters.nivel)
  if (filters.search) params.append('search', filters.search)
  if (filters.limit) params.append('limit', filters.limit.toString())
  if (filters.offset) params.append('offset', filters.offset.toString())

  const query = params.toString()
  return request<EmailListResponse>(query ? `/api/v1/emails?${query}` : '/api/v1/emails')
}

/** Obter estatisticas dos emails */
export function getEmailStatistics(): Promise<EmailStatistics> {
  return request<EmailStatistics>('/api/v1/emails/statistics')
}

/** Deletar email especifico */
export function deleteEmail(emailId: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/api/v1/emails/${emailId}`, { method: 'DELETE' })
}
