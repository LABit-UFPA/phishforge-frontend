import { useCallback, useEffect, useRef, useState } from 'react'
import { deleteEmail, getEmailById, getEmailStatistics, listEmails } from '../services/apiService'
import type { EmailFilters, EmailStatistics, PhishingEmail } from '../types/phishing.types'

export const PAGE_SIZE = 20
const FILTROS_INICIAIS: EmailFilters = { limit: PAGE_SIZE, offset: 0 }

function mensagem(e: unknown): string {
  return e instanceof Error ? e.message : 'Erro desconhecido'
}

function foiCancelada(e: unknown): boolean {
  return e instanceof DOMException && e.name === 'AbortError'
}

export function useExamples() {
  const [emails, setEmails] = useState<PhishingEmail[]>([])
  const [statistics, setStatistics] = useState<EmailStatistics | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<PhishingEmail | null>(null)
  const [filters, setFilters] = useState<EmailFilters>(FILTROS_INICIAIS)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)

  // Uma requisição de lista por vez: trocar de filtro rápido cancela a anterior,
  // senão a resposta mais lenta poderia sobrescrever a mais recente.
  const emailsAbort = useRef<AbortController | null>(null)
  const statsAbort = useRef<AbortController | null>(null)

  const fetchEmails = useCallback(async (f: EmailFilters) => {
    emailsAbort.current?.abort()
    const controller = new AbortController()
    emailsAbort.current = controller

    setIsLoading(true)
    setError(null)
    try {
      const response = await listEmails(f, controller.signal)
      setEmails(response.emails ?? [])
    } catch (e) {
      if (foiCancelada(e)) return
      setError(`Erro ao carregar emails: ${mensagem(e)}`)
      setEmails([])
    } finally {
      if (emailsAbort.current === controller) setIsLoading(false)
    }
  }, [])

  const loadStatistics = useCallback(async () => {
    statsAbort.current?.abort()
    const controller = new AbortController()
    statsAbort.current = controller

    setIsLoadingStats(true)
    setStatsError(null)
    try {
      setStatistics(await getEmailStatistics(controller.signal))
    } catch (e) {
      if (foiCancelada(e)) return
      // Sem estatística "zerada" de fallback: zero fingiria um banco vazio.
      setStatistics(null)
      setStatsError(`Erro ao carregar estatísticas: ${mensagem(e)}`)
    } finally {
      if (statsAbort.current === controller) setIsLoadingStats(false)
    }
  }, [])

  const updateFilters = useCallback(
    (novos: EmailFilters) => {
      setFilters(novos)
      void fetchEmails(novos)
    },
    [fetchEmails],
  )

  const clearFilters = useCallback(() => updateFilters(FILTROS_INICIAIS), [updateFilters])

  const limit = filters.limit ?? PAGE_SIZE
  const offset = filters.offset ?? 0
  const page = Math.floor(offset / limit) + 1
  // A API não devolve o total: só dá para saber que acabou quando vem menos que uma página.
  const hasNextPage = emails.length >= limit

  const nextPage = () => updateFilters({ ...filters, offset: offset + limit })
  const prevPage = () => updateFilters({ ...filters, offset: Math.max(0, offset - limit) })

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchEmails(filters), loadStatistics()])
  }, [fetchEmails, loadStatistics, filters])

  const clearErrors = () => {
    setError(null)
    setStatsError(null)
  }

  const handleDeleteEmail = async (emailId: string) => {
    try {
      await deleteEmail(emailId)
      if (selectedEmail?.id === emailId) setSelectedEmail(null)
      await Promise.all([fetchEmails(filters), loadStatistics()])
    } catch (e) {
      setError(`Erro ao deletar email: ${mensagem(e)}`)
    }
  }

  const handleViewEmail = async (email: PhishingEmail) => {
    try {
      setSelectedEmail(await getEmailById(email.id))
    } catch {
      // Sem a versão completa, o item da lista já basta para exibir.
      setSelectedEmail(email)
    }
  }

  // Carga inicial. Cancelar no cleanup evita setState após desmontar (e o
  // duplo disparo do StrictMode em desenvolvimento).
  useEffect(() => {
    void fetchEmails(FILTROS_INICIAIS)
    void loadStatistics()
    return () => {
      emailsAbort.current?.abort()
      statsAbort.current?.abort()
    }
  }, [fetchEmails, loadStatistics])

  const hasActiveFilters = !!(filters.search || filters.categoria || filters.nivel)

  return {
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
  }
}
