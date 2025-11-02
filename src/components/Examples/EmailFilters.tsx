import { Search, Filter, X } from 'lucide-react'
import type { Difficulty, EmailFilters } from '../../types/phishing.types'

interface Props {
  filters: EmailFilters
  onFiltersChange: (filters: EmailFilters) => void
  onClear: () => void
  hasActiveFilters: boolean
}

export default function EmailFilters({ filters, onFiltersChange, onClear, hasActiveFilters }: Props) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="size-4 text-gray-600" />
        <h4 className="font-medium">Filtros</h4>
        {hasActiveFilters && (
          <button 
            onClick={onClear}
            className="ml-auto text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <X className="size-3" /> Limpar
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {/* Busca */}
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por assunto ou conteúdo..."
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-accent/40 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            />
          </div>
        </div>
        
        {/* Dificuldade */}
        <div>
          <label className="block text-sm font-medium mb-1">Nível</label>
          <select
            className="w-full rounded-lg border border-accent/40 focus:outline-none focus:ring-2 focus:ring-primary/40 px-3 py-2 text-sm"
            value={filters.nivel || ''}
            onChange={(e) => onFiltersChange({ ...filters, nivel: e.target.value as Difficulty || undefined })}
          >
            <option value="">Todos</option>
            <option value="facil">Fácil</option>
            <option value="medio">Médio</option>
            <option value="dificil">Difícil</option>
          </select>
        </div>
        
        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium mb-1">Categoria</label>
          <input
            type="text"
            placeholder="Ex: bancário, social, trabalho..."
            className="w-full rounded-lg border border-accent/40 focus:outline-none focus:ring-2 focus:ring-primary/40 px-3 py-2 text-sm"
            value={filters.categoria || ''}
            onChange={(e) => onFiltersChange({ ...filters, categoria: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}