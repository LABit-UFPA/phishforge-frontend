import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  /** Página atual, a partir de 1. */
  page: number
  hasNext: boolean
  onPrev: () => void
  onNext: () => void
  disabled?: boolean
}

/**
 * Próxima/anterior, não numerada: a API devolve `count` = itens DESTA página,
 * não o total do banco, então não há como saber quantas páginas existem.
 */
export default function Pagination({ page, hasNext, onPrev, onNext, disabled }: Props) {
  return (
    <nav className="flex items-center justify-between" aria-label="Paginação">
      <button className="btn btn-secondary gap-1" onClick={onPrev} disabled={disabled || page <= 1}>
        <ChevronLeft className="size-4" /> Anterior
      </button>
      <span className="text-sm text-gray-600">Página {page}</span>
      <button className="btn btn-secondary gap-1" onClick={onNext} disabled={disabled || !hasNext}>
        Próxima <ChevronRight className="size-4" />
      </button>
    </nav>
  )
}
