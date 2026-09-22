import { useMemo, useState, type FormEvent } from 'react'
import ConfirmDialog from '../../../components/UI/ConfirmDialog'
import ErrorBanner from '../../../components/UI/ErrorBanner'
import LoadingSpinner from '../../../components/UI/LoadingSpinner'
import { abrirRodada, criarRodada, definirItens, encerrarRodada, listarCorpus } from '../../../services/researcherApiService'
import type { Difficulty } from '../../../types/phishing.types'
import type { ItemCorpus, Rodada, RodadaDetalhe } from '../../../types/researcher.types'
import { ALVO_POR_NIVEL, alvoTexto, analisarComposicao, combinarSelecaoAutomatica, NIVEIS } from '../utils/composicao'
import { tratarErro } from '../utils/erros'

const CAMPO = 'w-full rounded-lg border border-accent/40 focus:outline-none focus:ring-2 focus:ring-primary/40 p-2 text-sm'

interface Props {
  apiKey: string
  rodada: RodadaDetalhe | null
  /** Avisa que algo mudou no servidor (a página recarrega a rodada; `id` = a que ficará em foco). */
  onMudou: (id: string) => void
  onNaoAutorizado: () => void
}

function NovaRodadaForm({ apiKey, onMudou, onNaoAutorizado }: Omit<Props, 'rodada'>) {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [versao, setVersao] = useState('')
  const [tcle, setTcle] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setErro(null)
    try {
      const r: Rodada = await criarRodada(apiKey, {
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        tcle_versao: versao.trim(),
        tcle_texto_md: tcle,
      })
      onMudou(r.id)
    } catch (err) {
      setErro(tratarErro(err, onNaoAutorizado))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={(e) => void enviar(e)} className="space-y-3">
      <h3 className="font-semibold text-primary">Nova rodada</h3>
      <div>
        <label htmlFor="r-nome" className="block text-sm font-medium mb-1">Nome</label>
        <input id="r-nome" value={nome} onChange={(e) => setNome(e.target.value)} className={CAMPO} maxLength={120} />
      </div>
      <div>
        <label htmlFor="r-desc" className="block text-sm font-medium mb-1">Descrição (opcional)</label>
        <input id="r-desc" value={descricao} onChange={(e) => setDescricao(e.target.value)} className={CAMPO} />
      </div>
      <div>
        <label htmlFor="r-versao" className="block text-sm font-medium mb-1">Versão do TCLE</label>
        <input id="r-versao" value={versao} onChange={(e) => setVersao(e.target.value)} className={CAMPO} maxLength={32} placeholder="v1" />
      </div>
      <div>
        <label htmlFor="r-tcle" className="block text-sm font-medium mb-1">Texto do TCLE (Markdown)</label>
        <textarea id="r-tcle" value={tcle} onChange={(e) => setTcle(e.target.value)} rows={8} className={`${CAMPO} font-mono`} />
      </div>
      {erro && <ErrorBanner message={erro} onDismiss={() => setErro(null)} />}
      <button className="btn btn-primary" disabled={enviando || !nome.trim() || !versao.trim() || !tcle.trim()}>
        {enviando ? 'Criando…' : 'Criar rodada (rascunho)'}
      </button>
    </form>
  )
}

export default function RoundBuilder({ apiKey, rodada, onMudou, onNaoAutorizado }: Props) {
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [confirmar, setConfirmar] = useState<'abrir' | 'encerrar' | null>(null)

  const lista = useMemo<ItemCorpus[]>(() => rodada?.itens ?? [], [rodada])
  const analise = useMemo(() => analisarComposicao(lista), [lista])

  if (!rodada) return <NovaRodadaForm apiKey={apiKey} onMudou={onMudou} onNaoAutorizado={onNaoAutorizado} />

  const congelada = rodada.status !== 'rascunho'
  const podeAbrir = !congelada && !ocupado && rodada.total_itens > 0 && analise.avisos.length === 0

  const executar = async (acao: () => Promise<unknown>) => {
    setOcupado(true)
    setErro(null)
    try {
      await acao()
      onMudou(rodada.id)
    } catch (err) {
      setErro(tratarErro(err, onNaoAutorizado))
    } finally {
      setOcupado(false)
      setConfirmar(null)
    }
  }

  const selecionarAutomaticamente = () =>
    executar(async () => {
      // A seleção não é mais manual: o sistema busca os ALVO_POR_NIVEL itens
      // mais recentes de cada nível no corpus elegível (/researcher/corpus já
      // só devolve e-mail + phishing) e grava direto, sem passo intermediário.
      const entradas = await Promise.all(
        NIVEIS.map(
          async (nivel): Promise<[Difficulty, ItemCorpus[]]> => [
            nivel,
            await listarCorpus(apiKey, { nivel, limit: ALVO_POR_NIVEL, offset: 0 }),
          ],
        ),
      )
      const porNivel = Object.fromEntries(entradas) as Record<Difficulty, ItemCorpus[]>
      const { selecionados, faltando } = combinarSelecaoAutomatica(porNivel)
      if (Object.keys(faltando).length > 0) {
        const detalhe = Object.entries(faltando)
          .map(([nivel, qtd]) => `faltam ${qtd} do nível ${nivel}`)
          .join('; ')
        throw new Error(`Corpus insuficiente para selecionar automaticamente: ${detalhe}. Gere mais itens no Gerador antes de continuar.`)
      }
      await definirItens(apiKey, rodada.id, selecionados.map((i) => i.id))
    })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-semibold text-primary">{rodada.nome}</h3>
        <span className="badge">{rodada.status}</span>
        <span className="text-xs text-gray-500">TCLE {rodada.tcle_versao}</span>
        <div className="ml-auto flex gap-2">
          {rodada.status === 'rascunho' && (
            <button className="btn btn-primary" disabled={!podeAbrir} onClick={() => setConfirmar('abrir')}>
              Abrir rodada
            </button>
          )}
          {rodada.status === 'aberta' && (
            <button className="btn btn-secondary" disabled={ocupado} onClick={() => setConfirmar('encerrar')}>
              Encerrar rodada
            </button>
          )}
        </div>
      </div>

      {erro && <ErrorBanner message={erro} onDismiss={() => setErro(null)} />}

      <div className="rounded-lg border border-accent/30 p-3 text-sm space-y-1" aria-live="polite">
        <div className="flex flex-wrap gap-4">
          <span><strong>{analise.total}</strong> itens</span>
          {NIVEIS.map((n) => (
            <span key={n}>{n}: <strong>{analise.distribuicao[n]}</strong></span>
          ))}
          <span className="text-gray-500">alvo: {alvoTexto}</span>
        </div>
        {analise.avisos.length > 0 && !congelada && (
          <ul className="text-amber-800 list-disc pl-5">
            {analise.avisos.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        )}
      </div>

      {congelada ? (
        <p className="text-sm text-gray-700">
          A composição está congelada ({rodada.status}): mudar os itens no meio da coleta invalidaria a comparação entre
          especialistas.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Os itens são escolhidos pelo sistema, automaticamente: {ALVO_POR_NIVEL} por nível, a partir do corpus já
            gerado (canal e-mail, phishing). Se faltar corpus, gere mais itens no Gerador e selecione de novo.
          </p>
          <button className="btn btn-primary" disabled={ocupado} onClick={() => void selecionarAutomaticamente()}>
            {ocupado ? 'Selecionando…' : rodada.total_itens > 0 ? 'Selecionar novamente' : `Selecionar automaticamente (${alvoTexto})`}
          </button>
          {ocupado && <LoadingSpinner label="Consultando o corpus e gravando a seleção…" />}
          {lista.length > 0 && (
            <ul className="divide-y divide-accent/20 border border-accent/30 rounded-lg text-sm">
              {lista.map((item) => (
                <li key={item.id} className="p-2 flex items-center gap-3">
                  <span className="badge shrink-0">{item.nivel}</span>
                  <span className="flex-1 truncate">{item.assunto ?? '(sem assunto)'}</span>
                  <span className="text-xs text-gray-500 shrink-0">{item.categoria}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {confirmar === 'abrir' && (
        <ConfirmDialog
          title="Abrir rodada"
          message={`Ao abrir, a composição (${rodada.total_itens} itens) congela e os especialistas já podem avaliar. Isso não pode ser desfeito.`}
          confirmLabel="Abrir"
          onConfirm={() => void executar(() => abrirRodada(apiKey, rodada.id))}
          onCancel={() => setConfirmar(null)}
        />
      )}
      {confirmar === 'encerrar' && (
        <ConfirmDialog
          title="Encerrar rodada"
          message="Encerrar impede novas avaliações. Isso não pode ser desfeito."
          confirmLabel="Encerrar"
          onConfirm={() => void executar(() => encerrarRodada(apiKey, rodada.id))}
          onCancel={() => setConfirmar(null)}
        />
      )}
    </div>
  )
}
