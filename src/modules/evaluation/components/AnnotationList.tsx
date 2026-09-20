import { Trash2 } from 'lucide-react'
import type { CueTaxonomia } from '../../../types/expert.types'
import type { AnotacaoLocal } from '../hooks/useAnnotations'

const ROTULO_CAMPO = { conteudo: 'Conteúdo', assunto: 'Assunto', remetente: 'Remetente' } as const

export default function AnnotationList({
  anotacoes,
  cues,
  focoId,
  onFocar,
  onRemover,
}: {
  anotacoes: AnotacaoLocal[]
  cues: CueTaxonomia[]
  focoId: string | null
  onFocar: (id: string | null) => void
  onRemover: (id: string) => void
}) {
  if (anotacoes.length === 0) {
    return <p className="text-sm text-gray-500">Nenhum trecho marcado. Selecione um trecho suspeito no texto ao lado para marcá-lo.</p>
  }
  return (
    <ul className="space-y-2">
      {anotacoes.map((a) => {
        const cue = cues.find((c) => c.code === a.cue_code)
        return (
          <li
            key={a.id}
            className={`rounded-lg border p-2 text-sm ${a.id === focoId ? 'border-primary bg-primary/5' : 'border-accent/30'}`}
            onMouseEnter={() => onFocar(a.id)}
            onMouseLeave={() => onFocar(null)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium">{cue?.label_pt ?? a.cue_code}</div>
                <div className="text-xs text-gray-500">{ROTULO_CAMPO[a.campo]}</div>
                <div className="mt-1 text-gray-700 break-words">“{a.trecho.length > 100 ? `${a.trecho.slice(0, 100)}…` : a.trecho}”</div>
              </div>
              <button
                className="p-1 text-gray-400 hover:text-red-600 shrink-0"
                title="Remover esta marcação"
                aria-label={`Remover marcação: ${a.trecho.slice(0, 30)}`}
                onClick={() => onRemover(a.id)}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
