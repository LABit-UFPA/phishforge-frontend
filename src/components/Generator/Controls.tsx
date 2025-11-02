import { Send } from 'lucide-react'
import type { Difficulty } from '../../types/phishing.types'
type Mode = 'single' | 'batch'

interface Props {
  mode: Mode
  setMode: (m: Mode) => void

  difficulty: Difficulty
  setDifficulty: (d: Difficulty) => void

  batchDifficulties: Difficulty[]
  toggleBatchDifficulty: (d: Difficulty) => void

  context: string
  setContext: (v: string) => void

  isLoading: boolean
  submit: () => void
}

export default function Controls({
  mode, setMode,
  difficulty, setDifficulty,
  batchDifficulties, toggleBatchDifficulty,
  context, setContext,
  isLoading, submit
}: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-primary mb-4">Configurações</h2>

      <div className="space-y-5">
        {/* Modo */}
        <div>
          <label className="block text-sm font-medium mb-2">Modo de geração</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              className={`btn py-2 ${mode==='single'
                ? 'bg-primary text-white' : 'bg-[oklch(98%_0.01_250)] text-gray-800 hover:brightness-95'}`}
              onClick={() => setMode('single')}
            >Único</button>
            <button
              className={`btn py-2 ${mode==='batch'
                ? 'bg-primary text-white' : 'bg-[oklch(98%_0.01_250)] text-gray-800 hover:brightness-95'}`}
              onClick={() => setMode('batch')}
            >Lote (10x)</button>
          </div>
        </div>

        {/* Dificuldade */}
        {mode === 'single' ? (
          <div>
            <label className="block text-sm font-medium mb-2">Dificuldade</label>
            <select
              className="w-full rounded-lg border border-accent/40 focus:outline-none focus:ring-2 focus:ring-primary/40 p-2.5"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            >
              <option value="facil">Fácil</option>
              <option value="medio">Médio</option>
              <option value="dificil">Difícil</option>
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-2">Dificuldades (opcional)</label>
            <div className="flex flex-wrap gap-2">
              {(['facil','medio','dificil'] as const).map((d) => {
                const active = batchDifficulties.includes(d)
                return (
                  <button
                    key={d}
                    onClick={() => toggleBatchDifficulty(d)}
                    className={`btn px-3 py-1.5 text-sm border ${active
                      ? 'bg-primary text-white border-primary'
                      : 'bg-[oklch(98%_0.01_250)] text-gray-800 border-accent/40 hover:brightness-95'}`}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Contexto */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Contexto {mode==='single' ? '(obrigatório)' : '(opcional)'}
          </label>
          <textarea
            className="w-full rounded-lg border border-accent/40 focus:outline-none focus:ring-2 focus:ring-primary/40 p-3"
            rows={4}
            placeholder="Ex.: email bancário pedindo confirmação, rede social, matrícula UFPA…"
            value={context}
            onChange={(e)=>setContext(e.target.value)}
          />
        </div>

        <button
          className="btn-primary w-full"
          disabled={isLoading || (mode==='single' && !context.trim())}
          onClick={submit}
        >
          {isLoading ? 'Gerando…' : (<span className="inline-flex items-center gap-2"><Send className="size-4" /> Gerar</span>)}
        </button>
      </div>
    </div>
  )
}
