import { useState, useEffect, useCallback } from 'react'
import { 
  listEmails, 
  getEmailStatistics, 
  deleteEmail, 
  getEmailById 
} from '../services/apiService'
import type { 
  PhishingEmail, 
  EmailFilters, 
  EmailStatistics 
} from '../types/phishing.types'

export function useExamples() {
  const [emails, setEmails] = useState<PhishingEmail[]>([])
  const [statistics, setStatistics] = useState<EmailStatistics | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<PhishingEmail | null>(null)
  const [filters, setFilters] = useState<EmailFilters>({ limit: 20, offset: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)

  // Carregar emails com tratamento de erro melhorado
  const loadEmails = useCallback(async (newFilters?: EmailFilters) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const currentFilters = newFilters || filters
      console.log('Carregando emails com filtros:', currentFilters)
      
      const response = await listEmails(currentFilters)
      console.log('Resposta da API:', response)
      
      setEmails(response.emails || [])
    } catch (error) {
      console.error('Erro ao carregar emails:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setError(`Erro ao carregar emails: ${errorMessage}`)
      setEmails([])
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  // Carregar estatísticas com tratamento de erro robusto e retry
  const loadStatistics = useCallback(async (retryCount = 0) => {
    setIsLoadingStats(true)
    setStatsError(null)
    
    try {
      console.log('Carregando estatísticas... (tentativa', retryCount + 1, ')')
      const stats = await getEmailStatistics()
      console.log('Estatísticas recebidas:', stats)
      
      // Validar estrutura dos dados mais rigorosamente
      if (!stats || typeof stats !== 'object') {
        throw new Error('Dados de estatísticas inválidos - não é um objeto')
      }

      // Validar propriedades obrigatórias
      if (typeof stats.total !== 'number') {
        throw new Error('Total deve ser um número')
      }

      if (!stats.by_difficulty || typeof stats.by_difficulty !== 'object') {
        throw new Error('by_difficulty deve ser um objeto')
      }

      if (!stats.by_category || typeof stats.by_category !== 'object') {
        throw new Error('by_category deve ser um objeto')
      }

      if (typeof stats.recent_count !== 'number') {
        throw new Error('recent_count deve ser um número')
      }

      // Garantir estrutura correta com valores padrão e validação
      const validatedStats: EmailStatistics = {
        total: Math.max(0, Number(stats.total) || 0),
        by_difficulty: {
          facil: Math.max(0, Number(stats.by_difficulty?.facil) || 0),
          medio: Math.max(0, Number(stats.by_difficulty?.medio) || 0),
          dificil: Math.max(0, Number(stats.by_difficulty?.dificil) || 0)
        },
        by_category: {},
        recent_count: Math.max(0, Number(stats.recent_count) || 0)
      }

      // Validar e limpar categorias
      if (stats.by_category && typeof stats.by_category === 'object') {
        for (const [key, value] of Object.entries(stats.by_category)) {
          if (typeof key === 'string' && key.length > 0 && 
              typeof value === 'number' && value >= 0) {
            validatedStats.by_category[key] = Math.max(0, Number(value))
          }
        }
      }

      console.log('Estatísticas validadas:', validatedStats)
      setStatistics(validatedStats)
      
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      
      // Retry logic para erros de rede
      if (retryCount < 2 && (
        errorMessage.includes('fetch') || 
        errorMessage.includes('network') ||
        errorMessage.includes('HTTP 5')
      )) {
        console.log('Tentando novamente em 1 segundo...')
        setTimeout(() => loadStatistics(retryCount + 1), 1000)
        return
      }
      
      setStatsError(`Erro ao carregar estatísticas: ${errorMessage}`)
      
      // Definir estatísticas padrão em caso de erro
      const defaultStats: EmailStatistics = {
        total: 0,
        by_difficulty: { facil: 0, medio: 0, dificil: 0 },
        by_category: {},
        recent_count: 0
      }
      
      console.log('Definindo estatísticas padrão devido ao erro')
      setStatistics(defaultStats)
    } finally {
      setIsLoadingStats(false)
    }
  }, [])

  // Deletar email com feedback melhorado
  const handleDeleteEmail = async (emailId: string) => {
    try {
      console.log('Deletando email:', emailId)
      await deleteEmail(emailId)
      
      // Recarregar dados após deletar
      await Promise.all([loadEmails(), loadStatistics()])
      
      // Fechar modal se o email deletado estava sendo visualizado
      if (selectedEmail?.id === emailId) {
        setSelectedEmail(null)
      }
      
      console.log('Email deletado com sucesso')
    } catch (error) {
      console.error('Erro ao deletar email:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao deletar email: ${errorMessage}`)
    }
  }

  // Visualizar email específico
  const handleViewEmail = async (email: PhishingEmail) => {
    try {
      console.log('Carregando email completo:', email.id)
      // Buscar dados completos do email se necessário
      const fullEmail = await getEmailById(email.id)
      setSelectedEmail(fullEmail)
    } catch (error) {
      console.error('Erro ao carregar email:', error)
      // Fallback para o email já carregado
      setSelectedEmail(email)
    }
  }

  // Atualizar filtros
  const updateFilters = (newFilters: EmailFilters) => {
    console.log('Atualizando filtros:', newFilters)
    setFilters(newFilters)
    loadEmails(newFilters)
  }

  // Limpar filtros
  const clearFilters = () => {
    const clearedFilters: EmailFilters = { limit: 20, offset: 0 }
    console.log('Limpando filtros')
    setFilters(clearedFilters)
    loadEmails(clearedFilters)
  }

  // Verificar se há filtros ativos
  const hasActiveFilters = !!(
    filters.search || 
    filters.categoria || 
    filters.nivel
  )

  // Recarregar todos os dados
  const refreshAll = useCallback(async () => {
    console.log('Recarregando todos os dados...')
    await Promise.all([loadEmails(), loadStatistics()])
  }, [loadEmails, loadStatistics])

  // Limpar erros
  const clearErrors = () => {
    setError(null)
    setStatsError(null)
  }

  // Carregar dados iniciais com delay para evitar race conditions
  useEffect(() => {
    console.log('Carregando dados iniciais...')
    
    // Pequeno delay para garantir que o backend esteja pronto
    const timer = setTimeout(() => {
      loadEmails()
      loadStatistics()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  // Debug: log do estado atual
  useEffect(() => {
    console.log('Estado atual:', {
      emailsCount: emails.length,
      statistics,
      isLoading,
      isLoadingStats,
      error,
      statsError,
      hasActiveFilters
    })
  }, [emails.length, statistics, isLoading, isLoadingStats, error, statsError, hasActiveFilters])

  return {
    // Estado
    emails,
    statistics,
    selectedEmail,
    filters,
    isLoading,
    isLoadingStats,
    hasActiveFilters,
    error,
    statsError,
    
    // Ações
    loadEmails,
    loadStatistics,
    handleDeleteEmail,
    handleViewEmail,
    updateFilters,
    clearFilters,
    setSelectedEmail,
    refreshAll,
    clearErrors
  }
}