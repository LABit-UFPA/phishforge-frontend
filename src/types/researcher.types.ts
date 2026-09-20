import type { Difficulty } from './phishing.types'

/** Campos mínimos para selecionar um item (sem conteúdo nem explicação). */
export interface ItemCorpus {
  id: string
  assunto: string | null
  remetente: string | null
  categoria: string
  nivel: Difficulty
  channel: string
  is_malicious: boolean
}

export type StatusRodada = 'rascunho' | 'aberta' | 'encerrada'

export interface Rodada {
  id: string
  nome: string
  descricao: string | null
  status: StatusRodada
  tcle_versao: string
  created_at: string | null
  total_itens: number
}

export interface RodadaDetalhe extends Rodada {
  email_ids: string[]
  itens: ItemCorpus[]
}

export interface NovaRodada {
  nome: string
  descricao: string | null
  tcle_versao: string
  tcle_texto_md: string
}

export interface ItensResultado {
  total: number
  distribuicao: Record<Difficulty, number>
}

export interface EspecialistaNovo {
  nome: string
  sobrenome: string
  email: string
  rodada_id: string
}

/** O `codigo_acesso` (e o `link` que o contém) só existe nesta resposta. */
export interface CodigoEmitido {
  id: string
  codigo_acesso: string
  link: string
}

export interface EspecialistaLinha {
  id: string
  nome: string
  sobrenome: string
  email: string
  rodada_id: string | null
  concluidas: number
  total: number
  consentimento_versao: string | null
  consentimento_em: string | null
  revogado_em: string | null
  ultimo_acesso_em: string | null
}

export interface Resumo {
  total_avaliacoes: number
  especialistas: number
  matriz_confusao: Record<Difficulty, Record<Difficulty, number>>
  concordancia_bruta: number | null
  qualidade_media: number | null
  adequado_uso_educacional_pct: number | null
  frequencia_pistas: Record<string, { anotacoes: number; tambem_no_llm: number }>
}

export type DatasetExport = 'avaliacoes' | 'anotacoes' | 'itens' | 'especialistas'
export type FormatoExport = 'csv' | 'json'
