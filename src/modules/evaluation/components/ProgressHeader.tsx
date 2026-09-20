/**
 * "Item 7 de 30" — e só isso. Nunca exibe rótulo de dificuldade nem qualquer
 * coisa que revele o rótulo verdadeiro do item: seria ancorar a avaliação.
 */
export default function ProgressHeader({ ordem, total, concluidas }: { ordem: number; total: number; concluidas: number }) {
  const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0
  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-xl font-semibold text-primary">Item {ordem} de {total}</h2>
        <span className="text-sm text-gray-600">{concluidas} de {total} avaliados</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
