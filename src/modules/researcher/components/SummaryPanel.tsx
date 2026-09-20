import { useState } from 'react'
import ErrorBanner from '../../../components/UI/ErrorBanner'
import LoadingSpinner from '../../../components/UI/LoadingSpinner'
import { obterResumo } from '../../../services/researcherApiService'
import type { Resumo } from '../../../types/researcher.types'
import { NIVEIS } from '../utils/composicao'
import { tratarErro } from '../utils/erros'
import { decimal, percentual } from '../utils/formato'

interface Props {
  apiKey: string
  rodadaId: string
  onNaoAutorizado: () => void
}

export default function SummaryPanel({ apiKey, rodadaId, onNaoAutorizado }: Props) {
  const [resumo, setResumo] = useState<Resumo | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  const carregar = async () => {
    setCarregando(true)
    setErro(null)
    try {
      setResumo(await obterResumo(apiKey, rodadaId))
    } catch (err) {
      setErro(tratarErro(err, onNaoAutorizado))
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h3 className="font-semibold text-primary">Resumo</h3>
        <button className="btn btn-secondary ml-auto" onClick={() => void carregar()} disabled={carregando}>
          {resumo ? 'Recarregar' : 'Carregar resumo'}
        </button>
      </div>
      {erro && <ErrorBanner message={erro} onDismiss={() => setErro(null)} />}
      {carregando && <LoadingSpinner />}
      {resumo && !carregando && (
        <>
          <p className="text-sm text-gray-600">
            {resumo.total_avaliacoes} avaliações concluídas de {resumo.especialistas} especialista(s), sem revogados.
          </p>
          <table className="text-sm border border-accent/30" aria-label="Matriz de confusão">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 text-left text-xs text-gray-500">nível do sistema ↓ / percebido →</th>
                {NIVEIS.map((n) => (
                  <th key={n} className="p-2">{n}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {NIVEIS.map((real) => (
                <tr key={real} className="border-t border-accent/20">
                  <th className="p-2 text-left">{real}</th>
                  {NIVEIS.map((percebido) => (
                    <td key={percebido} className={`p-2 text-center ${real === percebido ? 'bg-green-50 font-semibold' : ''}`}>
                      {resumo.matriz_confusao[real][percebido]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <dl className="grid grid-cols-3 gap-3 text-sm">
            <div><dt className="text-xs text-gray-500">Concordância bruta</dt><dd className="font-semibold">{percentual(resumo.concordancia_bruta)}</dd></div>
            <div><dt className="text-xs text-gray-500">Qualidade média (1–5)</dt><dd className="font-semibold">{decimal(resumo.qualidade_media)}</dd></div>
            <div><dt className="text-xs text-gray-500">Adequado ao uso educacional</dt><dd className="font-semibold">{percentual(resumo.adequado_uso_educacional_pct)}</dd></div>
          </dl>
          <p className="text-xs text-gray-500">O κ de Cohen não é calculado aqui: use o export <em>avaliacoes</em> na análise estatística.</p>
          {Object.keys(resumo.frequencia_pistas).length > 0 && (
            <table className="text-sm" aria-label="Pistas anotadas">
              <thead>
                <tr className="text-left text-xs text-gray-500">
                  <th className="pr-4">Pista</th><th className="pr-4">Anotações</th><th>Também no LLM</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(resumo.frequencia_pistas).map(([codigo, f]) => (
                  <tr key={codigo}>
                    <td className="pr-4 font-mono">{codigo}</td><td className="pr-4">{f.anotacoes}</td><td>{f.tambem_no_llm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  )
}
