import { Mail } from 'lucide-react'

import MarkdownMessage from './MarkdownMessage'
import { badgeClass, difficultyIcon } from '../../utils/formatters'
import type { Difficulty, PhishingEmail } from '../../types/phishing.types'
import LoadingSpinner from '../UI/LoadingSpinner'
import EmptyState from '../UI/EmptyState'
import EmailCard from './EmailCard'
import EmailDetail from './EmailDetail'

type Mode = 'single' | 'batch'

export default function Results({
  isLoading, result, batchResults, selectedEmail, setSelectedEmail, difficultyForSingle
}: {
  isLoading: boolean
  mode: Mode
  result: PhishingEmail | null
  batchResults: PhishingEmail[]
  selectedEmail: PhishingEmail | null
  setSelectedEmail: (e: PhishingEmail | null) => void
  difficultyForSingle: Difficulty
}) {
  if (isLoading) {
    return <div className="card p-10 flex items-center justify-center"><LoadingSpinner label="Gerando exemplos…" /></div>
  }

  if (!result && batchResults.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="space-y-6">
      {/* Único */}
      {result && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
              <Mail className="size-5" /> Email Gerado
            </h3>
            <span className={`badge ${badgeClass(difficultyForSingle)}`}>
              {difficultyIcon(difficultyForSingle)}
              {difficultyForSingle}
            </span>
          </div>

          <div className="space-y-4">
            <div className="bg-[oklch(98%_0.01_250)] p-4 rounded-lg">
              <div className="grid md:grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-xs text-gray-500">Remetente</div>
                  <div className="text-sm font-medium">{result.remetente}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Receptor</div>
                  <div className="text-sm font-medium">{result.receptor}</div>
                </div>
              </div>
              <div className="mb-3">
                <div className="text-xs text-gray-500">Assunto</div>
                <div className="text-sm font-semibold">{result.assunto}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Conteúdo</div>
                <MarkdownMessage content={result.conteudo} />
              </div>
              {!!result.links?.length && (
                <div className="mt-3">
                  <div className="text-xs text-gray-500">Links Maliciosos</div>
                  <ul className="mt-1 space-y-1">
                    {result.links.map((l, i) => (
                      <li key={i} className="text-sm text-red-700 bg-red-50 rounded px-2 py-1 font-mono break-all">{l}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-[oklch(96%_0.02_255)] p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="size-5 rounded-full bg-primary inline-block" />
                <div>
                  <div className="text-sm font-semibold text-primary">Explicação</div>
                  <MarkdownMessage content={result.explicacao} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lote */}
      {batchResults.length > 0 && (
        <>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <Mail className="size-5" /> Lote Gerado ({batchResults.length})
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {batchResults.map((email, i) => {
                const diff: Difficulty = (['facil','medio','dificil'][i % 3] as Difficulty)
                return (
                  <EmailCard
                    key={i}
                    email={email}
                    index={i}
                    difficulty={diff}
                    onClick={() => setSelectedEmail(email)}
                  />
                )
              })}
            </div>
          </div>

          {selectedEmail && (
            <EmailDetail email={selectedEmail} onClose={() => setSelectedEmail(null)} />
          )}
        </>
      )}
    </div>
  )
}
