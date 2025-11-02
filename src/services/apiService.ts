import type { BatchRequest, EmailFilters, EmailListResponse, EmailStatistics, PhishingEmail, PhishingEmailWithId, QueryRequest } from "../types/phishing.types"


// Base da API — use .env (VITE_API_BASE_URL) quando não houver proxy reverso
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

async function postJSON<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) {
    const text = await res.text().catch(()=>'')
    throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`)
  }
  return res.json() as Promise<T>
}

/** Único — endpoint informado */
export async function generatePhishing(payload: QueryRequest): Promise<PhishingEmail> {
  return postJSON<PhishingEmail>('/api/v1/generate', payload)
}

/** Lote — ajuste a rota se sua API usar outro caminho (ex.: /api/v1/generate/batch) */
export async function generateBatch(payload: BatchRequest): Promise<PhishingEmail[]> {
  return postJSON<PhishingEmail[]>('/api/v1/generate-batch', payload)
}

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`)
  }
  return res.json() as Promise<T>
}

async function deleteJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE'
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`)
  }
  return res.json() as Promise<T>
}

/** Buscar email específico por ID */
export async function getEmailById(emailId: string): Promise<PhishingEmailWithId> {
  return getJSON<PhishingEmailWithId>(`/api/v1/emails/${emailId}`)
}

/** Listar emails com filtros */
export async function listEmails(filters: EmailFilters = {}): Promise<EmailListResponse> {
  const params = new URLSearchParams()
  
  if (filters.categoria) params.append('categoria', filters.categoria)
  if (filters.nivel) params.append('nivel', filters.nivel)
  if (filters.search) params.append('search', filters.search)
  if (filters.limit) params.append('limit', filters.limit.toString())
  if (filters.offset) params.append('offset', filters.offset.toString())
  
  const query = params.toString()
  const url = query ? `/api/v1/emails?${query}` : '/api/v1/emails'
  
  return getJSON<EmailListResponse>(url)
}

/** Obter estatísticas dos emails */
export async function getEmailStatistics(): Promise<EmailStatistics> {
  return getJSON<EmailStatistics>('/api/v1/emails/statistics')
}

/** Deletar email específico */
export async function deleteEmail(emailId: string): Promise<{message: string}> {
  return deleteJSON<{message: string}>(`/api/v1/emails/${emailId}`)
}