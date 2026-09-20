const CHAVE_KEY = 'phishforge:researcher_key'
const RODADA_KEY = 'phishforge:researcher_rodada'

// sessionStorage (e não localStorage) para a chave: credencial de administração
// que deve sumir ao fechar a aba.
export function lerChave(): string | null {
  try {
    return sessionStorage.getItem(CHAVE_KEY)
  } catch {
    return null
  }
}

export function salvarChave(chave: string): void {
  try {
    sessionStorage.setItem(CHAVE_KEY, chave)
  } catch {
    // sem storage: a chave vale só até recarregar
  }
}

export function limparChave(): void {
  try {
    sessionStorage.removeItem(CHAVE_KEY)
  } catch {
    // nada a fazer
  }
}

/** Só o id da rodada em foco (não é segredo): o resto vem da API. */
export function lerRodadaEmFoco(): string | null {
  try {
    return localStorage.getItem(RODADA_KEY)
  } catch {
    return null
  }
}

export function salvarRodadaEmFoco(id: string | null): void {
  try {
    if (id) localStorage.setItem(RODADA_KEY, id)
    else localStorage.removeItem(RODADA_KEY)
  } catch {
    // nada a fazer
  }
}
