// Base da API — use .env (VITE_API_BASE_URL) quando nao houver proxy reverso
const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

// Chave servidor-a-servidor exigida pela API em TODA rota /api/v1 (issue #7
// do backend). Variavel VITE_* vai para o bundle e, portanto, e publica:
// aceitavel so em desenvolvimento local. Em producao o proxy same-origin
// injeta a chave no servidor (ver README).
const API_KEY: string | undefined = import.meta.env.VITE_API_KEY

export class ApiError extends Error {
  status: number
  detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

interface ValidationIssue {
  loc?: Array<string | number>
  msg?: string
}

/** Extrai uma mensagem legivel do corpo de erro do FastAPI (`detail` string ou lista de 422). */
function formatDetail(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object' || !('detail' in body)) return fallback
  const detail = (body as { detail: unknown }).detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return (detail as ValidationIssue[])
      .map((issue) => {
        const campo = (issue.loc ?? []).filter((p) => p !== 'body').join('.')
        return campo ? `${campo}: ${issue.msg ?? 'valor invalido'}` : (issue.msg ?? 'valor invalido')
      })
      .join('; ')
  }
  return fallback
}

export async function request<T>(
  path: string,
  init: { method?: string; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  const headers: Record<string, string> = {}
  if (API_KEY) headers['X-API-Key'] = API_KEY
  if (init.body !== undefined) headers['Content-Type'] = 'application/json'

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: init.method ?? 'GET',
      headers,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      signal: init.signal,
    })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new ApiError(
      0,
      'Nao foi possivel conectar a API. Verifique se ela esta no ar e, em desenvolvimento, se CORS_ALLOWED_ORIGINS inclui esta origem.',
    )
  }

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null)
    let detail = formatDetail(body, `HTTP ${res.status} ${res.statusText}`)
    if (res.status === 401) detail += ' (verifique VITE_API_KEY)'
    throw new ApiError(res.status, detail)
  }
  return res.json() as Promise<T>
}
