const TOKEN_KEY = 'phishforge:expert_token'

// localStorage (e não sessionStorage): o token vale 12h e precisa sobreviver a
// fechar/reabrir o navegador no meio de uma rodada. Cada item é persistido no
// próprio PUT, então perder o token nunca perde o que já foi submetido.
export function lerToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function salvarToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // Sem storage (modo privado restrito): a sessão vale só até recarregar.
  }
}

export function limparToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // nada a fazer
  }
}
