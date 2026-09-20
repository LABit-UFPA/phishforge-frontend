import { Navigate, useOutletContext, useParams } from 'react-router-dom'
import ErrorBanner from '../../../components/UI/ErrorBanner'
import LoadingSpinner from '../../../components/UI/LoadingSpinner'
import EvaluationForm from '../components/EvaluationForm'
import ExpertLayout from '../components/ExpertLayout'
import ProgressHeader from '../components/ProgressHeader'
import type { ExpertContext } from '../components/RequireExpertSession'
import { useEvaluationItem } from '../hooks/useEvaluationItem'
import { ROTAS } from '../utils/rotas'

export default function EvaluationPage() {
  const contexto = useOutletContext<ExpertContext>()
  const { ordem: ordemParam } = useParams()
  const ordem = Number(ordemParam)
  const valida = Number.isInteger(ordem) && ordem >= 1

  // O hook roda sempre (regra dos hooks); com `ordem` inválida a rota redireciona logo abaixo.
  const item = useEvaluationItem(valida ? ordem : 1)

  if (!valida) return <Navigate to={ROTAS.raiz} replace />
  if (item.estado === 'nao-autenticado') return <Navigate to={ROTAS.entrar} replace />
  if (item.estado === 'nao-encontrado') {
    return (
      <ExpertLayout>
        <ErrorBanner message={`O item ${ordem} não existe nesta rodada (são ${contexto.me.progresso.total}).`} />
      </ExpertLayout>
    )
  }

  return (
    <ExpertLayout largo>
      <ProgressHeader
        ordem={ordem}
        total={contexto.me.progresso.total}
        concluidas={contexto.me.progresso.concluidas}
      />
      {item.estado === 'carregando' && (
        <div className="card p-10 flex justify-center"><LoadingSpinner label="Carregando item…" /></div>
      )}
      {item.estado === 'erro' && <ErrorBanner message={item.mensagem} />}
      {item.estado === 'ok' && (
        <EvaluationForm key={ordem} dados={item.dados} cues={item.cues} contexto={contexto} />
      )}
    </ExpertLayout>
  )
}
