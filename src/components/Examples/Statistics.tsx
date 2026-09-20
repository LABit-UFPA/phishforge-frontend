import { BarChart3, Calendar, Mail, PieChart, TrendingUp } from 'lucide-react'
import { difficultyIcon } from '../../utils/formatters'
import type { Difficulty, EmailStatistics } from '../../types/phishing.types'

interface Props {
  stats: EmailStatistics | null
  isLoading: boolean
}

const NIVEIS: ReadonlyArray<{ id: Difficulty; rotulo: string; badge: string; barra: string }> = [
  { id: 'facil', rotulo: 'Nível Fácil', badge: 'badge-easy', barra: 'bg-green-500' },
  { id: 'medio', rotulo: 'Nível Médio', badge: 'badge-medium', barra: 'bg-yellow-500' },
  { id: 'dificil', rotulo: 'Nível Difícil', badge: 'badge-hard', barra: 'bg-red-500' },
]

function Titulo({ children }: { children: string }) {
  return (
    <h3 className="text-lg font-semibold text-primary mb-6 flex items-center gap-2">
      <BarChart3 className="size-5" />
      {children}
    </h3>
  )
}

export default function Statistics({ stats, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="card p-6">
        <Titulo>Estatísticas</Titulo>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-accent/10 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-accent/10 rounded-lg" />
            <div className="h-32 bg-accent/10 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="card p-6">
        <Titulo>Estatísticas</Titulo>
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="size-12 mx-auto mb-4 opacity-50" />
          <p>Não foi possível carregar as estatísticas.</p>
        </div>
      </div>
    )
  }

  const totalNiveis = NIVEIS.reduce((soma, n) => soma + stats.by_difficulty[n.id], 0)
  const pct = (valor: number, total: number) => (total > 0 ? Math.round((valor / total) * 100) : 0)
  const topCategorias = Object.entries(stats.by_category)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="card p-6">
      <Titulo>Estatísticas dos Emails</Titulo>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <Mail className="size-6 text-primary" />
            <span className="badge bg-accent/20 text-primary border-accent/40">TOTAL</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Emails cadastrados</div>
        </div>

        {NIVEIS.map((n) => (
          <div key={n.id} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              {difficultyIcon(n.id)}
              <span className={`badge ${n.badge}`}>{pct(stats.by_difficulty[n.id], totalNiveis)}%</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.by_difficulty[n.id]}</div>
            <div className="text-sm text-gray-600">{n.rotulo}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-accent/30 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PieChart className="size-4 text-primary" />
            Top Categorias
          </h4>

          {topCategorias.length > 0 ? (
            <div className="space-y-3">
              {topCategorias.map(([categoria, quantidade]) => (
                <div key={categoria} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">{categoria}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{quantidade}</span>
                    <span className="text-xs text-gray-500">({pct(quantidade, stats.total)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <PieChart className="size-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma categoria encontrada</p>
            </div>
          )}
        </div>

        <div className="border border-accent/30 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            Atividade Recente
          </h4>

          <div className="flex items-center justify-between p-3 rounded-lg border border-accent/30">
            <div className="flex items-center gap-3">
              <Calendar className="size-5 text-primary" />
              <div>
                <div className="font-medium text-gray-900">Últimos 7 dias</div>
                <div className="text-sm text-gray-600">Emails criados</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{stats.recent_count}</div>
              {stats.total > 0 && (
                <div className="text-sm text-gray-500">{pct(stats.recent_count, stats.total)}% do total</div>
              )}
            </div>
          </div>

          {stats.recent_count === 0 && (
            <p className="mt-4 text-center text-sm text-gray-500">Nenhum email criado recentemente</p>
          )}
        </div>
      </div>

      {totalNiveis > 0 && (
        <div className="mt-6 p-4 border border-accent/30 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3">Distribuição por Dificuldade</h4>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden flex">
            {NIVEIS.map((n) => (
              <div
                key={n.id}
                className={`${n.barra} transition-all duration-300`}
                style={{ width: `${pct(stats.by_difficulty[n.id], totalNiveis)}%` }}
                title={`${n.rotulo}: ${stats.by_difficulty[n.id]} (${pct(stats.by_difficulty[n.id], totalNiveis)}%)`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            {NIVEIS.map((n) => (
              <span key={n.id}>
                {n.rotulo.replace('Nível ', '')} ({pct(stats.by_difficulty[n.id], totalNiveis)}%)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
