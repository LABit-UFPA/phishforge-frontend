import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { ExpertMe } from '../../../types/expert.types'
import ErrorBanner from '../../../components/UI/ErrorBanner'
import LoadingSpinner from '../../../components/UI/LoadingSpinner'
import { useExpertSession } from '../hooks/useExpertSession'
import { destinoPara, ROTAS } from '../utils/rotas'
import ExpertLayout from './ExpertLayout'

export interface ExpertContext {
  me: ExpertMe
  /** Recarrega `GET /expert/me` (após consentimento, perfil ou submissão) e devolve o estado novo. */
  atualizar: () => Promise<ExpertMe | null>
}

/**
 * Rota-layout do módulo: garante sessão válida e manda o especialista para a
 * etapa certa (consentimento → perfil → itens). O servidor faz a mesma
 * exigência; aqui é só para ele nunca chegar a ver um erro por isso.
 */
export default function RequireExpertSession() {
  const { sessao, atualizar } = useExpertSession()
  const { pathname } = useLocation()

  if (sessao.estado === 'carregando') {
    return (
      <ExpertLayout>
        <div className="card p-10 flex justify-center"><LoadingSpinner label="Carregando…" /></div>
      </ExpertLayout>
    )
  }
  if (sessao.estado === 'sem-sessao') return <Navigate to={ROTAS.entrar} replace />
  if (sessao.estado === 'erro') {
    return (
      <ExpertLayout>
        <div className="space-y-4">
          <ErrorBanner message={sessao.mensagem} />
          <button className="btn-primary" onClick={() => void atualizar()}>Tentar de novo</button>
        </div>
      </ExpertLayout>
    )
  }

  const destino = destinoPara(pathname, sessao.me)
  if (destino) return <Navigate to={destino} replace />

  const contexto: ExpertContext = { me: sessao.me, atualizar }
  return <Outlet context={contexto} />
}
