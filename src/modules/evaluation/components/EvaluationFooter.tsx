import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { rotaDoItem } from '../utils/rotas'

export default function EvaluationFooter({
  ordem,
  podeEnviar,
  enviando,
  jaAvaliado,
  faltando,
  onEnviar,
}: {
  ordem: number
  podeEnviar: boolean
  enviando: boolean
  jaAvaliado: boolean
  faltando: string[]
  onEnviar: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      {ordem > 1 ? (
        <Link to={rotaDoItem(ordem - 1)} className="btn btn-secondary gap-1 px-3 py-2">
          <ChevronLeft className="size-4" /> Anterior
        </Link>
      ) : <span />}
      <div className="text-right">
        <button className="btn-primary" disabled={!podeEnviar || enviando} onClick={onEnviar}>
          {enviando ? 'Enviando…' : jaAvaliado ? 'Atualizar avaliação' : 'Enviar e ir para o próximo'}
        </button>
        {!podeEnviar && faltando.length > 0 && (
          <p className="mt-1 text-xs text-gray-500">Falta: {faltando.join(', ')}.</p>
        )}
      </div>
    </div>
  )
}
