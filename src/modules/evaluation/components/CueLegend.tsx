import type { CueTaxonomia } from '../../../types/expert.types'

/** Consulta rápida das 10 pistas e suas definições, sem precisar selecionar nada. */
export default function CueLegend({ cues }: { cues: CueTaxonomia[] }) {
  return (
    <details className="card p-4">
      <summary className="cursor-pointer text-sm font-semibold text-primary">Legenda das pistas</summary>
      <ul className="mt-3 space-y-2">
        {cues.map((c) => (
          <li key={c.code} className="text-sm">
            <span className="font-medium">{c.label_pt}</span>
            <span className="block text-xs text-gray-600">{c.descricao_pt}</span>
          </li>
        ))}
      </ul>
    </details>
  )
}
