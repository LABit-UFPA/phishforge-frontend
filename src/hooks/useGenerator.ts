import { useCallback, useEffect, useState } from 'react'
import { generateBatch, generatePhishing, getBatchJob } from '../services/apiService'
import { ApiError } from '../services/http'
import type { BatchJob, Difficulty, JobStatus, PhishingEmail } from '../types/phishing.types'

type Mode = 'single' | 'batch'

const JOB_KEY = 'phishforge:batch_job_id'
const TERMINAL: ReadonlySet<JobStatus> = new Set(['concluido', 'concluido_com_falhas', 'falhou'])
const POLL_INICIAL_MS = 2000
const POLL_MAXIMO_MS = 5000

function lerJobSalvo(): string | null {
  try {
    return sessionStorage.getItem(JOB_KEY)
  } catch {
    return null
  }
}

function salvarJob(jobId: string | null) {
  try {
    if (jobId) sessionStorage.setItem(JOB_KEY, jobId)
    else sessionStorage.removeItem(JOB_KEY)
  } catch {
    // sessionStorage indisponivel (modo privado, etc.): so perde a retomada apos reload.
  }
}

function mensagemDeErro(e: unknown): string {
  return e instanceof Error ? e.message : 'Erro desconhecido'
}

export function useGenerator() {
  const [mode, setMode] = useState<Mode>('single')
  const [difficulty, setDifficulty] = useState<Difficulty>('facil')
  const [batchDifficulties, setBatchDifficulties] = useState<Difficulty[]>(['facil', 'medio', 'dificil'])
  const [context, setContext] = useState('')
  const [isMalicious, setIsMalicious] = useState(true)
  const [total, setTotal] = useState(10)
  const [maliciousRatio, setMaliciousRatio] = useState(1)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [result, setResult] = useState<PhishingEmail | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<PhishingEmail | null>(null)

  // Lote assincrono: `jobId` dispara o polling; `job` e o ultimo estado visto.
  const [jobId, setJobId] = useState<string | null>(lerJobSalvo)
  const [job, setJob] = useState<BatchJob | null>(null)

  const toggleBatchDifficulty = (d: Difficulty) => {
    setBatchDifficulties((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
  }

  // Polling do job. Roda ao montar se houver um job salvo (recarregar no meio
  // de um lote retoma), e para ao chegar num estado terminal.
  useEffect(() => {
    if (!jobId) return

    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined
    let intervalo = POLL_INICIAL_MS

    const poll = async () => {
      try {
        const atual = await getBatchJob(jobId, controller.signal)
        setJob(atual)
        setError(null)
        if (TERMINAL.has(atual.status)) return
        timer = setTimeout(poll, intervalo)
        intervalo = Math.min(intervalo + 500, POLL_MAXIMO_MS)
      } catch (e) {
        if (controller.signal.aborted) return
        if (e instanceof ApiError && e.status === 404) {
          // Job de outra sessao/base: nao ha o que retomar.
          salvarJob(null)
          setJobId(null)
          return
        }
        setError(mensagemDeErro(e))
      }
    }

    void poll()
    return () => {
      controller.abort()
      if (timer) clearTimeout(timer)
    }
  }, [jobId])

  const submit = useCallback(async () => {
    setIsSubmitting(true)
    setError(null)
    setSelectedEmail(null)
    try {
      if (mode === 'single') {
        const r = await generatePhishing({ difficulty, context: context.trim(), is_malicious: isMalicious })
        setResult(r)
        salvarJob(null)
        setJobId(null)
        setJob(null)
      } else {
        const aceito = await generateBatch({
          context: context.trim(),
          difficulties: batchDifficulties,
          total,
          malicious_ratio: maliciousRatio,
        })
        setResult(null)
        setJob(null)
        salvarJob(aceito.job_id)
        setJobId(aceito.job_id)
      }
    } catch (e) {
      setError(mensagemDeErro(e))
    } finally {
      setIsSubmitting(false)
    }
  }, [mode, difficulty, context, isMalicious, batchDifficulties, total, maliciousRatio])

  const jobEmAndamento = jobId !== null && error === null && (job === null || !TERMINAL.has(job.status))

  return {
    // estado
    mode, setMode,
    difficulty, setDifficulty,
    batchDifficulties, toggleBatchDifficulty,
    context, setContext,
    isMalicious, setIsMalicious,
    total, setTotal,
    maliciousRatio, setMaliciousRatio,
    isLoading: isSubmitting || jobEmAndamento,
    error, clearError: () => setError(null),
    result,
    job,
    batchResults: job?.examples ?? [],
    selectedEmail, setSelectedEmail,
    // ação
    submit,
  }
}
