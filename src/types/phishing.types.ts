export type Difficulty = 'facil' | 'medio' | 'dificil'

export type Channel = 'email' | 'sms' | 'whatsapp' | 'website' | 'phone_call' | 'pix_qr'

/** Formato real e definitivo de `links` na API (issue #5 do backend): sempre objeto. */
export interface LinkRef {
  text: string
  href: string
}

/** Pista de phishing anotada pelo LLM, com codigo da taxonomia compartilhada com o backend Go. */
export interface Cue {
  code: string
  evidencia: string
  span_start: number | null
  span_end: number | null
}

export type PremiseAlignment = 'baixo' | 'medio' | 'alto'

/** Eixos objetivos do NIST Phish Scale (issue #9 do backend). `null` em item legitimo. */
export interface PhishScale {
  cue_count: number
  premise_alignment: PremiseAlignment
  difficulty_estimated: Difficulty
}

/**
 * Item devolvido pela API. Um tipo so, para geracao e listagem.
 *
 * Os quatro campos de e-mail sao `null` quando `channel !== 'email'`: os
 * outros canais guardam o conteudo em `content_json`.
 */
export interface PhishingEmail {
  id: string
  receptor: string | null
  remetente: string | null
  assunto: string | null
  conteudo: string | null
  explicacao: string
  nivel: Difficulty
  categoria: string
  links: LinkRef[]
  is_malicious: boolean
  channel: Channel
  content_json: Record<string, unknown> | null
  cues: Cue[]
  phish_scale: PhishScale | null
  created_at: string | null
  updated_at: string | null
}

export interface QueryRequest {
  difficulty: Difficulty
  context: string
  /** Default da API: true (gera phishing). */
  is_malicious?: boolean
  channel?: Channel
}

export interface BatchRequest {
  context: string
  difficulties: Difficulty[]
  /** 1..100 */
  total: number
  /** 0..1 — 1.0 = todos phishing, 0.0 = todos legitimos. */
  malicious_ratio: number
  channel?: Channel
}

export type JobStatus = 'pendente' | 'em_progresso' | 'concluido' | 'concluido_com_falhas' | 'falhou'

/** Resposta 202 de `POST /generate/batch`. */
export interface BatchAccepted {
  job_id: string
  status: JobStatus
}

export interface BatchFailure {
  difficulty: Difficulty
  is_malicious: boolean
  error: string
}

export interface BatchJob {
  job_id: string
  status: JobStatus
  channel: Channel
  total_requested: number
  total_generated: number
  total_failed: number
  total_discarded: number
  distribution: Record<string, number> | null
  examples: PhishingEmail[]
  failures: BatchFailure[]
  error_message: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

export interface EmailListResponse {
  emails: PhishingEmail[]
  count: number
}

export interface EmailStatistics {
  total: number
  by_difficulty: {
    facil: number
    medio: number
    dificil: number
  }
  by_category: Record<string, number>
  recent_count: number
}

export interface EmailFilters {
  categoria?: string
  nivel?: Difficulty
  search?: string
  limit?: number
  offset?: number
}
