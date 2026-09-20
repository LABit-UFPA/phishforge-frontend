import type { Difficulty } from '../../../types/phishing.types'

const OPCOES: ReadonlyArray<{ valor: Difficulty; rotulo: string }> = [
  { valor: 'facil', rotulo: 'Fácil' },
  { valor: 'medio', rotulo: 'Médio' },
  { valor: 'dificil', rotulo: 'Difícil' },
]

export default function PerceivedDifficultyField({ valor, onChange }: { valor: Difficulty | null; onChange: (d: Difficulty) => void }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium mb-2">Quão difícil seria perceber que este e-mail é um golpe?</legend>
      <div className="grid grid-cols-3 gap-2" role="radiogroup">
        {OPCOES.map((o) => (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={valor === o.valor}
            onClick={() => onChange(o.valor)}
            className={`btn py-2 ${valor === o.valor ? 'bg-primary text-white' : 'bg-[oklch(98%_0.01_250)] text-gray-800 hover:brightness-95'}`}
          >
            {o.rotulo}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
