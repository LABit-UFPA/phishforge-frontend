import type { BatchJob, JobStatus } from '../../types/phishing.types'
import LoadingSpinner from '../UI/LoadingSpinner'

const ROTULO: Record<JobStatus, string> = {
  pendente: 'Na fila…',
  em_progresso: 'Gerando exemplos…',
  concluido: 'Lote concluído',
  concluido_com_falhas: 'Lote concluído com falhas',
  falhou: 'Lote falhou',
}

export default function BatchProgress({ job }: { job: BatchJob }) {
  const emAndamento = job.status === 'pendente' || job.status === 'em_progresso'
  const feitos = job.total_generated + job.total_failed + job.total_discarded
  const pct = job.total_requested > 0 ? Math.min(100, Math.round((feitos / job.total_requested) * 100)) : 0

  return (
    <div className="card p-6 space-y-3">
      <div className="flex items-center justify-between">
        {emAndamento ? (
          <LoadingSpinner label={ROTULO[job.status]} />
        ) : (
          <span className="text-sm font-medium text-gray-800">{ROTULO[job.status]}</span>
        )}
        <span className="text-sm text-gray-600">
          {job.total_generated}/{job.total_requested} gerados
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>

      {(job.total_failed > 0 || job.total_discarded > 0) && (
        <p className="text-xs text-gray-600">
          {job.total_failed > 0 && <span>{job.total_failed} falha(s). </span>}
          {job.total_discarded > 0 && <span>{job.total_discarded} descartado(s) por serem quase idênticos a outro item.</span>}
        </p>
      )}
      {job.error_message && <p className="text-xs text-red-700 break-words">{job.error_message}</p>}
    </div>
  )
}
