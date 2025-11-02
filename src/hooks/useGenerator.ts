import { useState } from 'react'
import { generatePhishing, generateBatch } from '../services/apiService'
import type { Difficulty, PhishingEmail } from '../types/phishing.types'

type Mode = 'single' | 'batch'

export function useGenerator() {
  const [mode, setMode] = useState<Mode>('single')
  const [difficulty, setDifficulty] = useState<Difficulty>('facil')
  const [batchDifficulties, setBatchDifficulties] = useState<Difficulty[]>(['facil','medio','dificil'])
  const [context, setContext] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [result, setResult] = useState<PhishingEmail | null>(null)
  const [batchResults, setBatchResults] = useState<PhishingEmail[]>([])
  const [selectedEmail, setSelectedEmail] = useState<PhishingEmail | null>(null)

  const toggleBatchDifficulty = (d: Difficulty) => {
    setBatchDifficulties(prev => prev.includes(d) ? prev.filter(x=>x!==d) : [...prev, d])
  }

  const submit = async () => {
    setIsLoading(true)
    setSelectedEmail(null)
    try {
      if (mode === 'single') {
        const r = await generatePhishing({ difficulty, context })
        setResult(r)
        setBatchResults([])
      } else {
        const r = await generateBatch({
          context: context.trim() || undefined,
          difficulties: batchDifficulties.length ? batchDifficulties : undefined
        })
        setBatchResults(r)
        setResult(null)
      }
    } catch (e) {
      console.error(e)
      alert('Falha ao gerar. Verifique a API.')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    // estado
    mode, setMode,
    difficulty, setDifficulty,
    batchDifficulties, toggleBatchDifficulty,
    context, setContext,
    isLoading, result, batchResults,
    selectedEmail, setSelectedEmail,
    // para exibir o badge do “único”
    difficultyForSingle: difficulty,
    // ação
    submit,
  }
}
