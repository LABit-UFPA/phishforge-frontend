import { useState, type FormEvent } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import ErrorBanner from '../../../components/UI/ErrorBanner'
import { enviarPerfil } from '../../../services/expertApiService'
import { ApiError } from '../../../services/http'
import { lerToken, limparToken } from '../../../services/expertSession'
import ExpertLayout from '../components/ExpertLayout'
import type { ExpertContext } from '../components/RequireExpertSession'
import { ROTAS } from '../utils/rotas'

const CAMPO = 'w-full rounded-lg border border-accent/40 focus:outline-none focus:ring-2 focus:ring-primary/40 p-3'

export default function ProfilePage() {
  const { atualizar } = useOutletContext<ExpertContext>()
  const navigate = useNavigate()
  const [anos, setAnos] = useState('')
  const [area, setArea] = useState('')
  const [formacao, setFormacao] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const aoEnviar = async (e: FormEvent) => {
    e.preventDefault()
    const token = lerToken()
    if (!token) return
    setEnviando(true)
    setErro(null)
    try {
      await enviarPerfil(token, { anos_experiencia: Number(anos), area_atuacao: area.trim(), formacao: formacao.trim() })
      await atualizar()
      navigate(ROTAS.raiz, { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        limparToken()
        navigate(ROTAS.entrar, { replace: true })
        return
      }
      setErro(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setEnviando(false)
    }
  }

  const completo = anos !== '' && Number(anos) >= 0 && area.trim() && formacao.trim()

  return (
    <ExpertLayout>
      <form onSubmit={(e) => void aoEnviar(e)} className="card p-8 space-y-4">
        <h2 className="text-xl font-semibold text-primary">Seu perfil</h2>
        <p className="text-sm text-gray-600">Usado só para caracterizar a amostra de especialistas na pesquisa.</p>
        <div>
          <label htmlFor="anos" className="block text-sm font-medium mb-1">Anos de experiência em segurança</label>
          <input id="anos" type="number" min={0} max={80} value={anos} onChange={(e) => setAnos(e.target.value)} className={CAMPO} />
        </div>
        <div>
          <label htmlFor="area" className="block text-sm font-medium mb-1">Área de atuação</label>
          <input id="area" value={area} onChange={(e) => setArea(e.target.value)} className={CAMPO} />
        </div>
        <div>
          <label htmlFor="formacao" className="block text-sm font-medium mb-1">Formação / certificação principal</label>
          <input id="formacao" value={formacao} onChange={(e) => setFormacao(e.target.value)} className={CAMPO} />
        </div>
        {erro && <ErrorBanner message={erro} onDismiss={() => setErro(null)} />}
        <button className="btn-primary w-full" disabled={!completo || enviando}>{enviando ? 'Salvando…' : 'Continuar'}</button>
      </form>
    </ExpertLayout>
  )
}
