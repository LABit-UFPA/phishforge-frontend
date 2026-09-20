import { Mail } from 'lucide-react'

import { badgeClass, difficultyIcon } from '../../utils/formatters'
import type { BatchJob, PhishingEmail } from '../../types/phishing.types'
import LoadingSpinner from '../UI/LoadingSpinner'
import EmptyState from '../UI/EmptyState'
import ErrorBanner from '../UI/ErrorBanner'
import BatchProgress from './BatchProgress'
import EmailCard from './EmailCard'
import EmailDetail from './EmailDetail'

export default function Results({
  isLoading, error, clearError, result, job, batchResults, selectedEmail, setSelectedEmail
}: {
  isLoading: boolean
  error: string | null
  clearError: () => void
  result: PhishingEmail | null
  job: BatchJob | null
  batchResults: PhishingEmail[]
  selectedEmail: PhishingEmail | null
  setSelectedEmail: (e: PhishingEmail | null) => void
}) {
  const banner = error ? <ErrorBanner message={error} onDismiss={clearError} /> : null

  if (isLoading && !job) {
    return (
      <div className="space-y-4">
        {banner}
        <div className="card p-10 flex items-center justify-center"><LoadingSpinner label="Gerando exemplos…" /></div>
      </div>
    )
  }

  if (!result && !job) {
    return (
      <div className="space-y-4">
        {banner}
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {banner}

      {/* Único */}
      {result && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Mail className="size-5" />
            <h3 className="text-lg font-semibold">Item gerado</h3>
            <span className={`badge ${badgeClass(result.nivel)}`}>
              {difficultyIcon(result.nivel)}
              {result.nivel}
            </span>
          </div>
          <EmailDetail email={result} onClose={() => undefined} />
        </div>
      )}

      {/* Lote */}
      {job && (
        <>
          <BatchProgress job={job} />

          {batchResults.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Mail className="size-5" /> Lote Gerado ({batchResults.length})
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {batchResults.map((email, i) => (
                  <EmailCard
                    key={email.id}
                    email={email}
                    index={i}
                    onClick={() => setSelectedEmail(email)}
                  />
                ))}
              </div>
            </div>
          )}

          {selectedEmail && (
            <EmailDetail email={selectedEmail} onClose={() => setSelectedEmail(null)} />
          )}
        </>
      )}
    </div>
  )
}
