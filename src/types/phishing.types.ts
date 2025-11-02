export type Difficulty = 'facil' | 'medio' | 'dificil'

export interface QueryRequest {
  difficulty: Difficulty
  context: string
}

export interface PhishingEmail {
  receptor: string
  remetente: string
  assunto: string
  conteudo: string
  explicacao: string
  links: string[]
}

export interface BatchRequest {
  context?: string
  difficulties?: Difficulty[]
}

export interface PhishingEmailWithId extends PhishingEmail {
  id: string;
  created_at?: string;
  categoria?: string;
  nivel?: Difficulty;
}

export interface EmailListResponse {
  emails: PhishingEmailWithId[];
  count: number;
}

export interface EmailStatistics {
  total: number;
  by_difficulty: {
    facil: number;
    medio: number;
    dificil: number;
  };
  by_category: Record<string, number>;
  recent_count: number;
}

export interface EmailFilters {
  categoria?: string;
  nivel?: Difficulty;
  search?: string;
  limit?: number;
  offset?: number;
}