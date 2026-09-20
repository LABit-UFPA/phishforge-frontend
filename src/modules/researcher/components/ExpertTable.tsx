import { RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import ConfirmDialog from '../../../components/UI/ConfirmDialog'
import ErrorBanner from '../../../components/UI/ErrorBanner'
import LoadingSpinner from '../../../components/UI/LoadingSpinner'
import { listarEspecialistas, recodificarEspecialista } from '../../../services/researcherApiService'
import type { CodigoEmitido, EspecialistaLinha, Rodada } from '../../../types/researcher.types'
import { tratarErro } from '../utils/erros'
import { dataHora } from '../utils/formato'

interface Props {
  apiKey: string
  rodada: Rodada
  /** Muda quando um especialista é cadastrado, para recarregar a lista. */
  versao: number
  onCodigo: (nome: string, codigo: CodigoEmitido) => void
  onNaoAutorizado: () => void
}

export default function ExpertTable({ apiKey, rodada, versao, onCodigo, onNaoAutorizado }: Props) {
  const [linhas, setLinhas] = useState<EspecialistaLinha[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [recodificar, setRecodificar] = useState<EspecialistaLinha | null>(null)
  const [tick, setTick] = useState(0)

  const rodadaId = rodada.id
  const recarregar = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    const ctrl = new AbortController()
    setCarregando(true)
    listarEspecialistas(apiKey, rodadaId, ctrl.signal)
      .then((r) => {
        setLinhas(r)
        setErro(null)
      })
      .catch((e: unknown) => {
        const msg = tratarErro(e, onNaoAutorizado)
        if (msg) setErro(msg)
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setCarregando(false)
      })
    return () => ctrl.abort()
  }, [apiKey, rodadaId, versao, tick, onNaoAutorizado])

  const confirmarRecodificar = async () => {
    if (!recodificar) return
    const alvo = recodificar
    setRecodificar(null)
    try {
      const codigo = await recodificarEspecialista(apiKey, alvo.id)
      onCodigo(`${alvo.nome} ${alvo.sobrenome}`, codigo)
    } catch (err) {
      setErro(tratarErro(err, onNaoAutorizado))
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h3 className="font-semibold text-primary">Especialistas</h3>
        <button className="btn btn-secondary gap-2 ml-auto" onClick={recarregar} disabled={carregando}>
          <RefreshCw className={`size-4 ${carregando ? 'animate-spin' : ''}`} /> Atualizar
        </button>
      </div>
      {erro && <ErrorBanner message={erro} onDismiss={() => setErro(null)} />}
      {linhas === null ? (
        <LoadingSpinner />
      ) : linhas.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum especialista cadastrado nesta rodada.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-accent/30">
                <th className="py-2 pr-3">Especialista</th>
                <th className="pr-3">Progresso</th>
                <th className="pr-3">Consentimento</th>
                <th className="pr-3">Último acesso</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => {
                const pct = rodada.total_itens > 0 ? Math.min(100, (l.concluidas / rodada.total_itens) * 100) : 0
                return (
                  <tr key={l.id} className="border-b border-accent/20 align-top">
                    <td className="py-2 pr-3">
                      {l.nome} {l.sobrenome}
                      <span className="block text-xs text-gray-500">{l.email}</span>
                    </td>
                    <td className="pr-3 min-w-32">
                      <span>{l.concluidas}/{rodada.total_itens}</span>
                      <div className="h-1.5 bg-gray-200 rounded" role="progressbar" aria-valuenow={l.concluidas} aria-valuemax={rodada.total_itens}>
                        <div className="h-1.5 bg-primary rounded" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                    <td className="pr-3">
                      {l.revogado_em ? (
                        <span className="badge badge-hard" title={dataHora(l.revogado_em)}>revogado</span>
                      ) : l.consentimento_em ? (
                        <span className="badge badge-easy">aceito ({l.consentimento_versao})</span>
                      ) : (
                        <span className="badge badge-medium">pendente</span>
                      )}
                    </td>
                    <td className="pr-3">{dataHora(l.ultimo_acesso_em)}</td>
                    <td>
                      <button className="btn btn-secondary text-xs" disabled={!!l.revogado_em} onClick={() => setRecodificar(l)}>
                        Novo código
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {recodificar && (
        <ConfirmDialog
          title="Emitir novo código"
          message={`O código atual de ${recodificar.nome} deixa de funcionar imediatamente. O novo aparece uma única vez.`}
          confirmLabel="Emitir novo código"
          onConfirm={() => void confirmarRecodificar()}
          onCancel={() => setRecodificar(null)}
        />
      )}
    </div>
  )
}
