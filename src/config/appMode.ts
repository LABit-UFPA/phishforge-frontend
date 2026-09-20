export type AppMode = 'full' | 'expert'

export interface RotasHabilitadas {
  curadoria: boolean
  avaliacao: boolean
  pesquisador: boolean
}

/**
 * `VITE_APP_MODE` (variável de BUILD): `full` (padrão) registra todas as rotas;
 * `expert` só `/avaliacao/*`. Qualquer outro valor cai no modo restrito: um erro
 * de digitação nunca deve ABRIR mais rotas do que o pretendido.
 *
 * Conveniência de implantação, não segurança: o cegamento e a autenticação
 * reais são do servidor.
 */
export function resolverModo(valor: string | undefined): AppMode {
  if (valor === undefined || valor === '' || valor === 'full') return 'full'
  return 'expert'
}

export function rotasDoModo(modo: AppMode): RotasHabilitadas {
  return modo === 'full'
    ? { curadoria: true, avaliacao: true, pesquisador: true }
    : { curadoria: false, avaliacao: true, pesquisador: false }
}
