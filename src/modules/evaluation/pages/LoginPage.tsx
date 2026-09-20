import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ErrorBanner from '../../../components/UI/ErrorBanner'
import { criarSessao } from '../../../services/expertApiService'
import { salvarToken } from '../../../services/expertSession'
import ExpertLayout from '../components/ExpertLayout'
import { ROTAS } from '../utils/rotas'

export default function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [codigo, setCodigo] = useState(() => params.get('codigo') ?? '')
  const [erro, setErro] = useState<string | null>(null)
  const [entrando, setEntrando] = useState(false)
  const tentouAuto = useRef(false)

  const entrar = async (valor: string) => {
    setEntrando(true)
    setErro(null)
    try {
      const sessao = await criarSessao(valor.trim())
      salvarToken(sessao.token)
      // Vai para a raiz do módulo: `RequireExpertSession` decide a etapa certa
      // (consentimento → perfil → próximo item).
      navigate(ROTAS.raiz, { replace: true })
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setEntrando(false)
    }
  }

  // Link do pesquisador: /avaliacao/entrar?codigo=XXXX-XXXX-XXXX-XXXX. O código
  // sai da URL logo de cara: não deve ficar no histórico do navegador nem
  // aparecer numa captura de tela de "como cheguei aqui".
  useEffect(() => {
    const doLink = params.get('codigo')
    if (!doLink || tentouAuto.current) return
    tentouAuto.current = true
    window.history.replaceState(window.history.state, '', window.location.pathname)
    void entrar(doLink)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- roda uma vez, com o código do link
  }, [])

  const aoEnviar = (e: FormEvent) => {
    e.preventDefault()
    if (codigo.trim()) void entrar(codigo)
  }

  return (
    <ExpertLayout>
      <div className="card p-8">
        <h2 className="text-xl font-semibold text-primary mb-2">Entrar</h2>
        <p className="text-sm text-gray-600 mb-6">
          Informe o código de acesso que você recebeu do pesquisador (formato <span className="font-mono">XXXX-XXXX-XXXX-XXXX</span>).
        </p>
        <form onSubmit={aoEnviar} className="space-y-4">
          <label htmlFor="codigo" className="block text-sm font-medium">Código de acesso</label>
          <input
            id="codigo"
            autoComplete="off"
            spellCheck={false}
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="XXXX-XXXX-XXXX-XXXX"
            className="w-full rounded-lg border border-accent/40 focus:outline-none focus:ring-2 focus:ring-primary/40 p-3 font-mono uppercase"
          />
          {erro && <ErrorBanner message={erro} onDismiss={() => setErro(null)} />}
          <button className="btn-primary w-full" disabled={entrando || !codigo.trim()}>
            {entrando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </ExpertLayout>
  )
}
