import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import ErrorBanner from '../../../components/UI/ErrorBanner'
import LoadingSpinner from '../../../components/UI/LoadingSpinner'
import MarkdownMessage from '../../../components/Generator/MarkdownMessage'
import { enviarConsentimento, getTcle } from '../../../services/expertApiService'
import { ApiError } from '../../../services/http'
import { lerToken, limparToken } from '../../../services/expertSession'
import type { Tcle } from '../../../types/expert.types'
import ExpertLayout from '../components/ExpertLayout'
import type { ExpertContext } from '../components/RequireExpertSession'
import { ROTAS } from '../utils/rotas'

export default function ConsentPage() {
  const { atualizar } = useOutletContext<ExpertContext>()
  const navigate = useNavigate()
  const [tcle, setTcle] = useState<Tcle | null>(null)
  const [aceito, setAceito] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    const token = lerToken()
    if (!token) return
    let vivo = true
    getTcle(token)
      .then((t) => vivo && setTcle(t))
      .catch((e: unknown) => vivo && setErro(e instanceof Error ? e.message : 'Erro desconhecido'))
    return () => {
      vivo = false
    }
  }, [])

  const consentir = async () => {
    const token = lerToken()
    if (!token || !tcle) return
    setEnviando(true)
    setErro(null)
    try {
      // Consente com a versão que ESTÁ SENDO EXIBIDA: se o TCLE mudou no meio, o servidor recusa (409).
      await enviarConsentimento(token, tcle.versao)
      await atualizar()
      navigate(ROTAS.raiz, { replace: true })
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        limparToken()
        navigate(ROTAS.entrar, { replace: true })
        return
      }
      setErro(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <ExpertLayout>
      <div className="card p-8 space-y-6">
        <h2 className="text-xl font-semibold text-primary">Termo de Consentimento Livre e Esclarecido</h2>
        {!tcle && !erro && <LoadingSpinner label="Carregando o termo…" />}
        {tcle && (
          <>
            <div className="max-h-[50vh] overflow-y-auto rounded-lg border border-accent/30 p-4 bg-white">
              <MarkdownMessage content={tcle.texto_md} />
            </div>
            <p className="text-xs text-gray-500">Versão do termo: {tcle.versao}</p>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1" checked={aceito} onChange={(e) => setAceito(e.target.checked)} />
              Li o termo e concordo em participar desta avaliação.
            </label>
          </>
        )}
        {erro && <ErrorBanner message={erro} onDismiss={() => setErro(null)} />}
        <button className="btn-primary w-full" disabled={!tcle || !aceito || enviando} onClick={() => void consentir()}>
          {enviando ? 'Registrando…' : 'Concordo e quero continuar'}
        </button>
      </div>
    </ExpertLayout>
  )
}
