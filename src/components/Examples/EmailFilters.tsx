import { useEffect, useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import type { Difficulty, EmailFilters as Filters } from '../../types/phishing.types'

type Modo = 'search' | 'categoria' | 'nivel'

const ROTULOS: Record<Modo, string> = { search: 'Busca', categoria: 'Categoria', nivel: 'Nível' }

interface Props {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  onClear: () => void
  hasActiveFilters: boolean
}

function modoInicial(f: Filters): Modo {
  if (f.categoria) return 'categoria'
  if (f.nivel) return 'nivel'
  return 'search'
}

/**
 * A API aplica UM filtro por vez (precedência `search > categoria > nivel`, os
 * demais são ignorados sem aviso). Por isso a escolha é única: mostrar três
 * campos independentes sugeriria uma composição que não existe.
 */
export default function EmailFilters({ filters, onFiltersChange, onClear, hasActiveFilters }: Props) {
  const [modo, setModo] = useState<Modo>(() => modoInicial(filters))
  const [texto, setTexto] = useState(() => filters.search ?? filters.categoria ?? '')
  const debounced = useDebouncedValue(texto, 400)

  // Envia a busca/categoria digitada só depois de 400ms parado. Compara com o
  // filtro atual para não refazer a requisição (e não entrar em laço) quando
  // o valor já foi aplicado.
  useEffect(() => {
    if (modo === 'nivel') return
    const valor = debounced.trim()
    // `debounced` fica defasado por 400ms: logo após trocar de modo ele ainda
    // guarda o texto do modo anterior. Só age quando já alcançou o que está digitado.
    if (valor !== texto.trim()) return
    if (valor === (filters[modo] ?? '')) return
    onFiltersChange({ limit: filters.limit, offset: 0, [modo]: valor || undefined })
  }, [debounced, texto, modo, filters, onFiltersChange])

  const trocarModo = (novo: Modo) => {
    if (novo === modo) return
    setModo(novo)
    setTexto('')
    if (hasActiveFilters) onFiltersChange({ limit: filters.limit, offset: 0 })
  }

  const limpar = () => {
    setTexto('')
    onClear()
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="size-4 text-gray-600" />
        <h4 className="font-medium">Filtro</h4>
        {hasActiveFilters && (
          <button onClick={limpar} className="ml-auto text-xs text-red-600 hover:text-red-700 flex items-center gap-1">
            <X className="size-3" /> Limpar
          </button>
        )}
      </div>

      <div role="radiogroup" aria-label="Filtrar por" className="grid grid-cols-3 gap-1 mb-3">
        {(Object.keys(ROTULOS) as Modo[]).map((m) => (
          <button
            key={m}
            role="radio"
            aria-checked={modo === m}
            onClick={() => trocarModo(m)}
            className={`btn text-xs py-1.5 ${modo === m ? 'bg-primary text-white' : 'bg-[oklch(98%_0.01_250)] text-gray-700 hover:brightness-95'}`}
          >
            {ROTULOS[m]}
          </button>
        ))}
      </div>

      {modo === 'nivel' ? (
        <select
          aria-label="Nível"
          className="w-full rounded-lg border border-accent/40 focus:outline-none focus:ring-2 focus:ring-primary/40 px-3 py-2 text-sm"
          value={filters.nivel ?? ''}
          onChange={(e) =>
            onFiltersChange({ limit: filters.limit, offset: 0, nivel: (e.target.value as Difficulty) || undefined })
          }
        >
          <option value="">Todos</option>
          <option value="facil">Fácil</option>
          <option value="medio">Médio</option>
          <option value="dificil">Difícil</option>
        </select>
      ) : (
        <div className="relative">
          {modo === 'search' && (
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
          )}
          <input
            type="text"
            aria-label={ROTULOS[modo]}
            placeholder={modo === 'search' ? 'Buscar por assunto ou conteúdo...' : 'Ex: bancário, social, trabalho...'}
            className={`w-full ${modo === 'search' ? 'pl-10' : 'pl-3'} pr-3 py-2 rounded-lg border border-accent/40 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm`}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </div>
      )}
    </div>
  )
}
