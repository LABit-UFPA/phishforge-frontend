import type { Difficulty } from './phishing.types'

export interface EspecialistaResumo {
  id: string
  nome: string
  sobrenome: string
}

export interface RodadaResumo {
  id: string
  nome: string
  status: string
  tcle_versao: string
}

export interface Progresso {
  total: number
  concluidas: number
  proxima_ordem: number
}

/** Corpo de `GET /expert/me` (e de `POST /expert/session`, sem o `token`). */
export interface ExpertMe {
  especialista: EspecialistaResumo
  rodada: RodadaResumo
  consentimento: { necessario: boolean; versao: string }
  perfil: { necessario: boolean }
  progresso: Progresso
}

export interface ExpertSession extends ExpertMe {
  token: string
  expires_at: string
}

export interface Tcle {
  versao: string
  texto_md: string
}

export interface PerfilEspecialista {
  anos_experiencia: number
  area_atuacao: string
  formacao: string
}

export type CategoriaPista = 'technical' | 'psychological'

export interface CueTaxonomia {
  id: string
  code: string
  label_pt: string
  descricao_pt: string
  category: CategoriaPista
}

export type CampoAnotavel = 'conteudo' | 'assunto' | 'remetente'

/** Anotação no formato da API: offsets em CODE POINTS. */
export interface AnotacaoApi {
  campo: CampoAnotavel
  cue_code: string
  span_start: number
  span_end: number
  trecho: string
}

export interface ItemCego {
  remetente: string | null
  receptor: string | null
  assunto: string | null
  conteudo_texto: string | null
  links: Array<{ text: string; href: string }>
}

export interface AvaliacaoEnviada {
  status: string
  dificuldade_percebida: Difficulty | null
  adequado_uso_educacional: boolean | null
  qualidade_geral: number | null
  justificativa: string | null
  comentario: string | null
  tempo_ms: number | null
  anotacoes: AnotacaoApi[]
}

/** Corpo de `GET/PUT /expert/itens/{ordem}`. */
export interface ExpertItem {
  ordem: number
  total: number
  item: ItemCego
  /** `null` enquanto o especialista não respondeu este item. */
  avaliacao: AvaliacaoEnviada | null
}

export interface AvaliacaoPayload {
  dificuldade_percebida: Difficulty
  adequado_uso_educacional: boolean
  qualidade_geral: number
  justificativa: string
  comentario: string | null
  tempo_ms: number | null
  anotacoes: AnotacaoApi[]
}
