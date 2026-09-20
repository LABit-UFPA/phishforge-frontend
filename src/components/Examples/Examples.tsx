import { Database, RefreshCw } from 'lucide-react'
import { useExamples } from '../../hooks/useExamples'
import Statistics from './Statistics'
import EmailFilters from './EmailFilters'
import EmailList from './EmailList'
import EmailDetail from '../Generator/EmailDetail'
import ErrorBanner from '../UI/ErrorBanner'
import Pagination from '../UI/Pagination'

export default function Examples() {
  const {
    emails,
    statistics,
    selectedEmail,
    filters,
    isLoading,
    isLoadingStats,
    hasActiveFilters,
    error,
    statsError,
    page,
    hasNextPage,
    nextPage,
    prevPage,
    handleDeleteEmail,
    handleViewEmail,
    updateFilters,
    clearFilters,
    setSelectedEmail,
    refreshAll,
    clearErrors,
  } = useExamples()

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Database className="size-7" />
            Exemplos Salvos
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie os emails de phishing gerados anteriormente
          </p>
        </div>

        <button
          onClick={() => void refreshAll()}
          disabled={isLoading || isLoadingStats}
          className="btn btn-secondary gap-2"
        >
          <RefreshCw className={`size-4 ${(isLoading || isLoadingStats) ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {statsError && <ErrorBanner message={statsError} onDismiss={clearErrors} />}

      {/* Estatísticas */}
      <Statistics
        stats={statistics}
        isLoading={isLoadingStats}
      />

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filtros */}
        <div className="lg:col-span-1">
          <EmailFilters
            filters={filters}
            onFiltersChange={updateFilters}
            onClear={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* Lista de emails */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-primary">
              Emails nesta página ({emails.length})
            </h3>
            {hasActiveFilters && (
              <span className="text-sm text-gray-500">
                Filtro aplicado
              </span>
            )}
          </div>

          <EmailList
            emails={emails}
            onView={handleViewEmail}
            onDelete={handleDeleteEmail}
            isLoading={isLoading}
            error={error}
            onDismissError={clearErrors}
          />

          <Pagination
            page={page}
            hasNext={hasNextPage}
            onPrev={prevPage}
            onNext={nextPage}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Modal de detalhes */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <EmailDetail
              email={selectedEmail}
              onClose={() => setSelectedEmail(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
