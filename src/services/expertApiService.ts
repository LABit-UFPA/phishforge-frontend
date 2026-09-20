import { request } from './http'
import type {
  AvaliacaoPayload,
  CueTaxonomia,
  ExpertItem,
  ExpertMe,
  ExpertSession,
  PerfilEspecialista,
  Tcle,
} from '../types/expert.types'

// Todas as chamadas do módulo de avaliação usam `escopo: 'especialista'`:
// JWT no `Authorization`, sem a `X-API-Key` do backend Go.
const comToken = (token: string, signal?: AbortSignal) => ({ escopo: 'especialista' as const, token, signal })

export function criarSessao(codigoAcesso: string): Promise<ExpertSession> {
  return request<ExpertSession>('/api/v1/expert/session', {
    method: 'POST',
    escopo: 'especialista',
    body: { codigo_acesso: codigoAcesso },
  })
}

export function getMe(token: string, signal?: AbortSignal): Promise<ExpertMe> {
  return request<ExpertMe>('/api/v1/expert/me', comToken(token, signal))
}

export function getTcle(token: string): Promise<Tcle> {
  return request<Tcle>('/api/v1/expert/tcle', comToken(token))
}

export function enviarConsentimento(token: string, versao: string): Promise<ExpertMe> {
  return request<ExpertMe>('/api/v1/expert/consentimento', {
    ...comToken(token),
    method: 'POST',
    body: { versao, aceito: true },
  })
}

export function enviarPerfil(token: string, perfil: PerfilEspecialista): Promise<ExpertMe> {
  return request<ExpertMe>('/api/v1/expert/perfil', { ...comToken(token), method: 'POST', body: perfil })
}

export function getCues(token: string): Promise<CueTaxonomia[]> {
  return request<CueTaxonomia[]>('/api/v1/expert/cues', comToken(token))
}

export function getItem(token: string, ordem: number, signal?: AbortSignal): Promise<ExpertItem> {
  return request<ExpertItem>(`/api/v1/expert/itens/${ordem}`, comToken(token, signal))
}

export function putItem(token: string, ordem: number, avaliacao: AvaliacaoPayload): Promise<ExpertItem> {
  return request<ExpertItem>(`/api/v1/expert/itens/${ordem}`, { ...comToken(token), method: 'PUT', body: avaliacao })
}
