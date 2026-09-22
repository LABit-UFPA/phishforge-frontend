import { LogOut, Shield } from 'lucide-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import ErrorBanner from '../../../components/UI/ErrorBanner'
import LoadingSpinner from '../../../components/UI/LoadingSpinner'
import { listarRodadas, obterRodada } from '../../../services/researcherApiService'
import {
  lerChave,
  lerRodadaEmFoco,
  limparChave,
  salvarChave,
  salvarRodadaEmFoco,
} from '../../../services/researcherSession'
import type { CodigoEmitido, Rodada, RodadaDetalhe } from '../../../types/researcher.types'
import CodigoEmitidoAviso from '../components/CodigoEmitidoAviso'
import ExpertForm from '../components/ExpertForm'
import ExpertTable from '../components/ExpertTable'
import ExportPanel from '../components/ExportPanel'
import RoundBuilder from '../components/RoundBuilder'
import SummaryPanel from '../components/SummaryPanel'
import { tratarErro } from '../utils/erros'

const NOVA = '__nova__'

function PedirChave({ aoAceitar, aviso }: { aoAceitar: (chave: string) => void; aviso: string | null }) {
  const [chave, setChave] = useState('')
  const [erro, setErro] = useState<string | null>(aviso)
  const [verificando, setVerificando] = useState(false)

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setVerificando(true)
    setErro(null)
    try {
      // Valida de verdade contra o servidor antes de guardar: chave errada
      // vira erro aqui, não uma tela vazia depois.
      await listarRodadas(chave.trim())
      aoAceitar(chave.trim())
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setVerificando(false)
    }
  }

  return (
    <form onSubmit={(e) => void enviar(e)} className="card p-8 space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-primary">Console do pesquisador</h2>
      <p className="text-sm text-gray-600">
        Informe a chave do pesquisador. Ela fica só nesta aba e some ao fechá-la.
      </p>
      <div>
        <label htmlFor="chave" className="block text-sm font-medium mb-1">Chave do pesquisador</label>
        <input
          id="chave"
          type="password"
          autoComplete="off"
          value={chave}
          onChange={(e) => setChave(e.target.value)}
          className="w-full rounded-lg border border-accent/40 p-3"
        />
      </div>
      {erro && <ErrorBanner message={erro} onDismiss={() => setErro(null)} />}
      <button className="btn btn-primary w-full" disabled={!chave.trim() || verificando}>
        {verificando ? 'Verificando…' : 'Entrar'}
      </button>
    </form>
  )
}

function Console({ apiKey, aoSair }: { apiKey: string; aoSair: (aviso: string | null) => void }) {
  const [rodadas, setRodadas] = useState<Rodada[] | null>(null)
  const [emFoco, setEmFoco] = useState<string | null>(lerRodadaEmFoco())
  const [detalhe, setDetalhe] = useState<RodadaDetalhe | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [codigo, setCodigo] = useState<{ nome: string; dados: CodigoEmitido } | null>(null)
  const [versaoEspecialistas, setVersaoEspecialistas] = useState(0)
  const [recarga, setRecarga] = useState(0)

  const naoAutorizado = useCallback(() => aoSair('Chave inválida ou expirada. Informe-a novamente.'), [aoSair])

  useEffect(() => {
    const ctrl = new AbortController()
    listarRodadas(apiKey, ctrl.signal)
      .then((r) => {
        setRodadas(r)
        // Sem rodada salva (ou a salva já não existe mais), cai na mais recente --
        // não em "+ Nova rodada": senão a seção de cadastro de especialista (onde
        // fica o botão de gerar código) some da tela na primeira visita, mesmo
        // com rodadas já existentes.
        setEmFoco((atual) => (atual && r.some((x) => x.id === atual) ? atual : (r[0]?.id ?? null)))
      })
      .catch((e: unknown) => {
        const msg = tratarErro(e, naoAutorizado)
        if (msg) setErro(msg)
      })
    return () => ctrl.abort()
  }, [apiKey, recarga, naoAutorizado])

  useEffect(() => {
    salvarRodadaEmFoco(emFoco)
    if (!emFoco) {
      setDetalhe(null)
      return
    }
    const ctrl = new AbortController()
    obterRodada(apiKey, emFoco, ctrl.signal)
      .then(setDetalhe)
      .catch((e: unknown) => {
        const msg = tratarErro(e, naoAutorizado)
        if (msg) setErro(msg)
      })
    return () => ctrl.abort()
  }, [apiKey, emFoco, recarga, naoAutorizado])

  const aoMudar = (id: string) => {
    setEmFoco(id)
    setRecarga((r) => r + 1)
  }

  const mostrarCodigo = (nome: string, dados: CodigoEmitido) => {
    setCodigo({ nome, dados })
    setVersaoEspecialistas((v) => v + 1)
  }

  if (rodadas === null) return erro ? <ErrorBanner message={erro} /> : <LoadingSpinner label="Carregando…" />

  return (
    <div className="space-y-6">
      {erro && <ErrorBanner message={erro} onDismiss={() => setErro(null)} />}
      <div className="card p-4 flex items-center gap-3">
        <label htmlFor="rodada" className="text-sm font-medium">Rodada</label>
        <select
          id="rodada"
          value={emFoco ?? NOVA}
          onChange={(e) => setEmFoco(e.target.value === NOVA ? null : e.target.value)}
          className="flex-1 rounded-lg border border-accent/40 p-2 text-sm"
        >
          <option value={NOVA}>+ Nova rodada</option>
          {rodadas.map((r) => (
            <option key={r.id} value={r.id}>{r.nome} — {r.status} ({r.total_itens} itens)</option>
          ))}
        </select>
      </div>

      <section className="card p-6">
        <RoundBuilder apiKey={apiKey} rodada={emFoco ? detalhe : null} onMudou={aoMudar} onNaoAutorizado={naoAutorizado} />
      </section>

      {detalhe && emFoco && (
        <>
          {codigo && (
            <CodigoEmitidoAviso nome={codigo.nome} codigo={codigo.dados.codigo_acesso} link={codigo.dados.link} onFechar={() => setCodigo(null)} />
          )}
          <section className="card p-6">
            <ExpertForm apiKey={apiKey} rodada={detalhe} onCodigo={mostrarCodigo} onNaoAutorizado={naoAutorizado} />
          </section>
          <section className="card p-6">
            <ExpertTable apiKey={apiKey} rodada={detalhe} versao={versaoEspecialistas} onCodigo={mostrarCodigo} onNaoAutorizado={naoAutorizado} />
          </section>
          <section className="card p-6">
            <SummaryPanel key={emFoco} apiKey={apiKey} rodadaId={emFoco} onNaoAutorizado={naoAutorizado} />
          </section>
          <section className="card p-6">
            <ExportPanel key={emFoco} apiKey={apiKey} rodadaId={emFoco} onNaoAutorizado={naoAutorizado} />
          </section>
        </>
      )}
    </div>
  )
}

export default function ResearcherPage() {
  const [chave, setChave] = useState<string | null>(lerChave())
  const [aviso, setAviso] = useState<string | null>(null)

  const sair = useCallback((motivo: string | null) => {
    limparChave()
    setChave(null)
    setAviso(motivo)
  }, [])

  return (
    <div className="min-h-screen">
      <header className="bg-white/80 backdrop-blur border-b border-accent/30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="bg-primary text-white p-2 rounded-lg"><Shield className="size-5" /></div>
          <h1 className="text-lg font-semibold text-primary">PhishForge — Console do pesquisador</h1>
          {chave && (
            <button className="btn btn-secondary gap-2 ml-auto" onClick={() => sair(null)}>
              <LogOut className="size-4" /> Sair
            </button>
          )}
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {chave ? (
          <Console apiKey={chave} aoSair={sair} />
        ) : (
          <PedirChave
            aviso={aviso}
            aoAceitar={(c) => {
              salvarChave(c)
              setAviso(null)
              setChave(c)
            }}
          />
        )}
      </main>
    </div>
  )
}
