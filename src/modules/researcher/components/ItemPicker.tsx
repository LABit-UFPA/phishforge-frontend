import { useEffect, useState } from 'react'
import ErrorBanner from '../../../components/UI/ErrorBanner'
import LoadingSpinner from '../../../components/UI/LoadingSpinner'
import Pagination from '../../../components/UI/Pagination'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import { listEmails } from '../../../services/apiService'
import type { Difficulty, PhishingEmail } from '../../../types/phishing.types'
import { elegivel, NIVEIS } from '../utils/composicao'

const POR_PAGINA = 20

interface Props {
  selecionados: Map<string, PhishingEmail>
  onAlternar: (email: PhishingEmail) => void
  desabilitado: boolean
}

/** Seleção múltipla sobre o corpus (`GET /api/v1/emails`, a mesma listagem da curadoria). */
export default function ItemPicker({ selecionados, onAlternar, desabilitado }: Props) {
  const [nivel, setNivel] = useState<Difficulty | ''>('')
  const [busca, setBusca] = useState('')
  const buscaEstavel = useDebouncedValue(busca.trim(), 400)
  const [pagina, setPagina] = useState(1)
  const [emails, setEmails] = useState<PhishingEmail[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => setPagina(1), [nivel, buscaEstavel])

  useEffect(() => {
    const ctrl = new AbortController()
    setCarregando(true)
    setErro(null)
    // O backend aplica UM filtro por vez (busca > nível); a busca, se houver, vence.
    listEmails(
      {
        limit: POR_PAGINA,
        offset: (pagina - 1) * POR_PAGINA,
        ...(buscaEstavel ? { search: buscaEstavel } : nivel ? { nivel } : {}),
      },
      ctrl.signal,
    )
      .then((r) => setEmails(r.emails))
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setErro(e instanceof Error ? e.message : 'Erro desconhecido')
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setCarregando(false)
      })
    return () => ctrl.abort()
  }, [pagina, nivel, buscaEstavel])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar no corpus…"
          aria-label="Buscar no corpus"
          className="flex-1 min-w-48 rounded-lg border border-accent/40 p-2 text-sm"
        />
        <select
          value={nivel}
          onChange={(e) => setNivel(e.target.value as Difficulty | '')}
          aria-label="Filtrar por nível"
          disabled={buscaEstavel !== ''}
          className="rounded-lg border border-accent/40 p-2 text-sm"
        >
          <option value="">Todos os níveis</option>
          {NIVEIS.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      {buscaEstavel !== '' && <p className="text-xs text-gray-500">Com busca ativa o filtro de nível é ignorado (regra do servidor).</p>}
      {erro && <ErrorBanner message={erro} />}
      {carregando ? (
        <LoadingSpinner />
      ) : (
        <ul className="divide-y divide-accent/20 border border-accent/30 rounded-lg">
          {emails.length === 0 && <li className="p-3 text-sm text-gray-500">Nenhum item encontrado.</li>}
          {emails.map((email) => {
            const ok = elegivel(email)
            const marcado = selecionados.has(email.id)
            return (
              <li key={email.id} className={`p-3 flex items-start gap-3 ${ok ? '' : 'opacity-50'}`}>
                <input
                  type="checkbox"
                  id={`item-${email.id}`}
                  checked={marcado}
                  disabled={desabilitado || (!ok && !marcado)}
                  onChange={() => onAlternar(email)}
                  className="mt-1"
                />
                <label htmlFor={`item-${email.id}`} className="flex-1 text-sm">
                  <span className="font-medium">{email.assunto ?? '(sem assunto)'}</span>
                  <span className="block text-xs text-gray-500">
                    {email.remetente ?? '—'} · {email.categoria} · nível {email.nivel}
                    {!ok && ' · não elegível (precisa ser e-mail de phishing)'}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      )}
      <Pagination
        page={pagina}
        hasNext={emails.length === POR_PAGINA}
        onPrev={() => setPagina((p) => Math.max(1, p - 1))}
        onNext={() => setPagina((p) => p + 1)}
        disabled={carregando}
      />
    </div>
  )
}
