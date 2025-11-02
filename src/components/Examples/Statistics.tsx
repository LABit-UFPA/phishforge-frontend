import { BarChart3, Calendar, Mail, PieChart, Shield, Target, TrendingUp, Zap } from 'lucide-react'
import type { EmailStatistics } from '../../types/phishing.types'

interface Props {
  stats: EmailStatistics | null;
  isLoading: boolean;
}

export default function Statistics({ stats, isLoading }: Props) {
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" /> 
          Estatísticas
        </h3>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-4">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-gray-100 rounded-lg"></div>
            <div className="h-32 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error/No data state
  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" /> 
          Estatísticas
        </h3>
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Não foi possível carregar as estatísticas.</p>
        </div>
      </div>
    );
  }

  // Calculate percentages for difficulty
  const totalDifficulty = stats.by_difficulty.facil + stats.by_difficulty.medio + stats.by_difficulty.dificil;
  const difficultyPercentages = {
    facil: totalDifficulty > 0 ? Math.round((stats.by_difficulty.facil / totalDifficulty) * 100) : 0,
    medio: totalDifficulty > 0 ? Math.round((stats.by_difficulty.medio / totalDifficulty) * 100) : 0,
    dificil: totalDifficulty > 0 ? Math.round((stats.by_difficulty.dificil / totalDifficulty) * 100) : 0
  };

  // Get top categories
  const topCategories = Object.entries(stats.by_category)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" /> 
        Estatísticas dos Emails
      </h3>
      
      {/* Cards principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Mail className="w-6 h-6 text-blue-600" />
            <span className="text-xs font-medium text-blue-600 bg-blue-200 px-2 py-1 rounded-full">
              TOTAL
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{stats.total.toLocaleString()}</div>
          <div className="text-sm text-blue-700">Emails cadastrados</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-6 h-6 text-green-600" />
            <span className="text-xs font-medium text-green-600 bg-green-200 px-2 py-1 rounded-full">
              {difficultyPercentages.facil}%
            </span>
          </div>
          <div className="text-2xl font-bold text-green-900">{stats.by_difficulty.facil}</div>
          <div className="text-sm text-green-700">Nível Fácil</div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-6 h-6 text-yellow-600" />
            <span className="text-xs font-medium text-yellow-600 bg-yellow-200 px-2 py-1 rounded-full">
              {difficultyPercentages.medio}%
            </span>
          </div>
          <div className="text-2xl font-bold text-yellow-900">{stats.by_difficulty.medio}</div>
          <div className="text-sm text-yellow-700">Nível Médio</div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-6 h-6 text-red-600" />
            <span className="text-xs font-medium text-red-600 bg-red-200 px-2 py-1 rounded-full">
              {difficultyPercentages.dificil}%
            </span>
          </div>
          <div className="text-2xl font-bold text-red-900">{stats.by_difficulty.dificil}</div>
          <div className="text-sm text-red-700">Nível Difícil</div>
        </div>
      </div>

      {/* Seção inferior com categorias e atividade recente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Categorias */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Top Categorias
          </h4>
          
          {topCategories.length > 0 ? (
            <div className="space-y-3">
              {topCategories.map(([category, count], index) => {
                const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-yellow-500' :
                        index === 3 ? 'bg-purple-500' : 'bg-gray-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                      <span className="text-xs text-gray-500">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <PieChart className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma categoria encontrada</p>
            </div>
          )}
        </div>

        {/* Atividade Recente */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Atividade Recente
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">Últimos 7 dias</div>
                  <div className="text-sm text-gray-600">Emails criados</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">{stats.recent_count}</div>
                {stats.total > 0 && (
                  <div className="text-sm text-gray-500">
                    {Math.round((stats.recent_count / stats.total) * 100)}% do total
                  </div>
                )}
              </div>
            </div>

            {stats.recent_count === 0 && (
              <div className="text-center py-4 text-gray-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum email criado recentemente</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra de progresso da distribuição por dificuldade */}
      {totalDifficulty > 0 && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h4 className="font-semibold text-gray-800 mb-3">Distribuição por Dificuldade</h4>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div className="h-full flex">
              <div 
                className="bg-green-500 transition-all duration-300" 
                style={{ width: `${difficultyPercentages.facil}%` }}
                title={`Fácil: ${stats.by_difficulty.facil} (${difficultyPercentages.facil}%)`}
              ></div>
              <div 
                className="bg-yellow-500 transition-all duration-300" 
                style={{ width: `${difficultyPercentages.medio}%` }}
                title={`Médio: ${stats.by_difficulty.medio} (${difficultyPercentages.medio}%)`}
              ></div>
              <div 
                className="bg-red-500 transition-all duration-300" 
                style={{ width: `${difficultyPercentages.dificil}%` }}
                title={`Difícil: ${stats.by_difficulty.dificil} (${difficultyPercentages.dificil}%)`}
              ></div>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Fácil ({difficultyPercentages.facil}%)</span>
            <span>Médio ({difficultyPercentages.medio}%)</span>
            <span>Difícil ({difficultyPercentages.dificil}%)</span>
          </div>
        </div>
      )}
    </div>
  );
}