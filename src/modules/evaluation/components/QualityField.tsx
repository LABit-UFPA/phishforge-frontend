import { DIMENSOES_DE_QUALIDADE } from './dimensoesDeQualidade'

interface Props {
  adequado: boolean | null
  onAdequado: (v: boolean) => void
  qualidade: number
  onQualidade: (n: number) => void
  justificativa: string
  onJustificativa: (t: string) => void
}

const botao = (ativo: boolean) =>
  `btn py-2 ${ativo ? 'bg-primary text-white' : 'bg-[oklch(98%_0.01_250)] text-gray-800 hover:brightness-95'}`

export default function QualityField({ adequado, onAdequado, qualidade, onQualidade, justificativa, onJustificativa }: Props) {
  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="text-sm font-medium mb-2">É adequado para uso educacional?</legend>
        <div className="grid grid-cols-2 gap-2" role="radiogroup">
          <button type="button" role="radio" aria-checked={adequado === true} className={botao(adequado === true)} onClick={() => onAdequado(true)}>Sim</button>
          <button type="button" role="radio" aria-checked={adequado === false} className={botao(adequado === false)} onClick={() => onAdequado(false)}>Não</button>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium mb-2">Qualidade geral (1 = muito ruim, 5 = excelente)</legend>
        <div className="grid grid-cols-5 gap-2" role="radiogroup">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={qualidade === n} className={botao(qualidade === n)} onClick={() => onQualidade(n)}>{n}</button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="justificativa" className="block text-sm font-medium mb-1">
          Justificativa <span className="text-red-600">(obrigatória)</span>
        </label>
        {DIMENSOES_DE_QUALIDADE.length > 0 && (
          <p className="text-xs text-gray-500 mb-1">Considere: {DIMENSOES_DE_QUALIDADE.join(', ')}.</p>
        )}
        <textarea
          id="justificativa"
          rows={4}
          value={justificativa}
          onChange={(e) => onJustificativa(e.target.value)}
          className="w-full rounded-lg border border-accent/40 focus:outline-none focus:ring-2 focus:ring-primary/40 p-3 text-sm"
        />
      </div>
    </div>
  )
}
