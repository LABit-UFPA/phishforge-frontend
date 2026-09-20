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

  isMalicious: boolean
  setIsMalicious: (v: boolean) => void

  total: number
  setTotal: (n: number) => void

  maliciousRatio: number
  setMaliciousRatio: (n: number) => void

  isLoading: boolean
  submit: () => void
}

export default function Controls({
  mode, setMode,
  difficulty, setDifficulty,
  batchDifficulties, toggleBatchDifficulty,
  context, setContext,
  isMalicious, setIsMalicious,
  total, setTotal,
  maliciousRatio, setMaliciousRatio,
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
            >Lote</button>
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
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isMalicious}
                onChange={(e) => setIsMalicious(e.target.checked)}
              />
              Gerar phishing (desmarque para um item legítimo)
            </label>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-2">Dificuldades</label>
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

            <label className="block text-sm font-medium mt-4 mb-2" htmlFor="total">
              Total de itens (1–100)
            </label>
            <input
              id="total"
              type="number"
              min={1}
              max={100}
              value={total}
              onChange={(e) => setTotal(Math.min(100, Math.max(1, Number(e.target.value) || 1)))}
              className="w-full rounded-lg border border-accent/40 focus:outline-none focus:ring-2 focus:ring-primary/40 p-2.5"
            />

            <label className="block text-sm font-medium mt-4 mb-2" htmlFor="ratio">
              Proporção de phishing: {Math.round(maliciousRatio * 100)}%
              <span className="text-gray-500 font-normal"> (o restante são itens legítimos)</span>
            </label>
            <input
              id="ratio"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={maliciousRatio}
              onChange={(e) => setMaliciousRatio(Number(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        {/* Contexto */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Contexto (obrigatório)
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
          disabled={isLoading || !context.trim() || (mode==='batch' && batchDifficulties.length===0)}
          onClick={submit}
        >
          {isLoading ? 'Gerando…' : (<span className="inline-flex items-center gap-2"><Send className="size-4" /> Gerar</span>)}
        </button>
      </div>
    </div>
  )
}
