import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ErrorBanner from '../../../components/UI/ErrorBanner'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import { putItem } from '../../../services/expertApiService'
import { ApiError } from '../../../services/http'
import { lerToken, limparToken } from '../../../services/expertSession'
import type { CampoAnotavel, CueTaxonomia, ExpertItem } from '../../../types/expert.types'
import type { Difficulty } from '../../../types/phishing.types'
import { paraApi, useAnnotations } from '../hooks/useAnnotations'
import { fatiarPorCodePoints, utf16ParaCodePoints } from '../utils/offsets'
import { limparRascunho, lerRascunho, salvarRascunho, type Rascunho } from '../utils/rascunho'
import { proximoDestino, ROTAS } from '../utils/rotas'
import AnnotationList from './AnnotationList'
import CommentField from './CommentField'
import CuePopover from './CuePopover'
import CueLegend from './CueLegend'
import EvaluationFooter from './EvaluationFooter'
import ItemPanel from './ItemPanel'
import PerceivedDifficultyField from './PerceivedDifficultyField'
import QualityField from './QualityField'
import type { SelecaoFeita } from './AnnotatableField'
import type { ExpertContext } from './RequireExpertSession'

/** Estado inicial: o que o especialista já enviou > o rascunho local > vazio. */
function estadoInicial(dados: ExpertItem): Rascunho {
  const enviada = dados.avaliacao
  if (enviada) {
    return {
      dificuldade: enviada.dificuldade_percebida,
      adequado: enviada.adequado_uso_educacional,
      qualidade: enviada.qualidade_geral ?? 0,
      justificativa: enviada.justificativa ?? '',
      comentario: enviada.comentario ?? '',
      anotacoes: enviada.anotacoes,
    }
  }
  return (
    lerRascunho(dados.ordem) ?? {
      dificuldade: null, adequado: null, qualidade: 0, justificativa: '', comentario: '', anotacoes: [],
    }
  )
}

/** Montado com `key={ordem}`: cada item começa do zero, sem estado vazando do anterior. */
export default function EvaluationForm({
  dados,
  cues,
  contexto,
}: {
  dados: ExpertItem
  cues: CueTaxonomia[]
  contexto: ExpertContext
}) {
  const navigate = useNavigate()
  const inicial = useMemo(() => estadoInicial(dados), [dados])

  const [dificuldade, setDificuldade] = useState<Difficulty | null>(inicial.dificuldade)
  const [adequado, setAdequado] = useState<boolean | null>(inicial.adequado)
  const [qualidade, setQualidade] = useState(inicial.qualidade)
  const [justificativa, setJustificativa] = useState(inicial.justificativa)
  const [comentario, setComentario] = useState(inicial.comentario)
  const { anotacoes, adicionar, remover } = useAnnotations(inicial.anotacoes)

  const [pendente, setPendente] = useState<SelecaoFeita | null>(null)
  const [focoId, setFocoId] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const inicioDoItem = useRef(Date.now())

  // Rascunho local com debounce de 500ms.
  const rascunho = useMemo<Rascunho>(
    () => ({ dificuldade, adequado, qualidade, justificativa, comentario, anotacoes: paraApi(anotacoes) }),
    [dificuldade, adequado, qualidade, justificativa, comentario, anotacoes],
  )
  const rascunhoDebounced = useDebouncedValue(rascunho, 500)
  useEffect(() => {
    salvarRascunho(dados.ordem, rascunhoDebounced)
  }, [dados.ordem, rascunhoDebounced])

  const textoDoCampo = (campo: CampoAnotavel): string | null =>
    campo === 'conteudo' ? dados.item.conteudo_texto : dados.item[campo]

  const escolherPista = (cueCode: string) => {
    if (!pendente) return
    const texto = textoDoCampo(pendente.campo)
    if (texto === null) return

    // UTF-16 (o que o navegador mediu) -> code points (o que a API valida).
    const span_start = utf16ParaCodePoints(texto, pendente.faixa.start)
    const span_end = utf16ParaCodePoints(texto, pendente.faixa.end)
    const trecho = texto.slice(pendente.faixa.start, pendente.faixa.end)

    // Trava de seguranca: o que vai ser gravado tem que reproduzir o trecho
    // pela regra do backend (fatiar por code points). Se nao reproduzir,
    // melhor recusar aqui do que gravar um offset errado em silencio.
    if (span_end <= span_start || fatiarPorCodePoints(texto, span_start, span_end) !== trecho) {
      setErro('Não foi possível registrar esta seleção com segurança. Tente selecionar o trecho de novo.')
      setPendente(null)
      return
    }
    adicionar({ campo: pendente.campo, cue_code: cueCode, span_start, span_end, trecho })
    setErro(null)
    setPendente(null)
    window.getSelection()?.removeAllRanges()
  }

  const faltando = [
    dificuldade === null && 'dificuldade percebida',
    adequado === null && 'adequação educacional',
    qualidade < 1 && 'qualidade geral',
    !justificativa.trim() && 'justificativa',
  ].filter((x): x is string => Boolean(x))

  const enviar = async () => {
    const token = lerToken()
    if (!token || dificuldade === null || adequado === null) return
    setEnviando(true)
    setErro(null)
    try {
      await putItem(token, dados.ordem, {
        dificuldade_percebida: dificuldade,
        adequado_uso_educacional: adequado,
        qualidade_geral: qualidade,
        justificativa: justificativa.trim(),
        comentario: comentario.trim() || null,
        tempo_ms: Date.now() - inicioDoItem.current,
        anotacoes: paraApi(anotacoes),
      })
      limparRascunho(dados.ordem) // só depois de o servidor aceitar
      const me = await contexto.atualizar()
      navigate(me ? proximoDestino(me) : ROTAS.raiz)
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        limparToken()
        navigate(ROTAS.entrar, { replace: true })
        return
      }
      setErro(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-6">
      <div className="space-y-4">
        <ItemPanel
          item={dados.item}
          anotacoes={anotacoes}
          focoId={focoId}
          onSelecionar={setPendente}
          onFocar={setFocoId}
        />
        <p className="text-xs text-gray-500">
          Para marcar um golpe, selecione o trecho suspeito no texto e escolha a pista. Pode marcar vários trechos, e o mesmo
          trecho com mais de uma pista.
        </p>
      </div>

      <aside className="space-y-5">
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-primary mb-3">Trechos marcados ({anotacoes.length})</h3>
          <AnnotationList anotacoes={anotacoes} cues={cues} focoId={focoId} onFocar={setFocoId} onRemover={remover} />
        </div>
        <CueLegend cues={cues} />
        <div className="card p-4 space-y-5">
          <PerceivedDifficultyField valor={dificuldade} onChange={setDificuldade} />
          <QualityField
            adequado={adequado} onAdequado={setAdequado}
            qualidade={qualidade} onQualidade={setQualidade}
            justificativa={justificativa} onJustificativa={setJustificativa}
          />
          <CommentField valor={comentario} onChange={setComentario} />
        </div>
        {erro && <ErrorBanner message={erro} onDismiss={() => setErro(null)} />}
        <EvaluationFooter
          ordem={dados.ordem}
          podeEnviar={faltando.length === 0}
          enviando={enviando}
          jaAvaliado={dados.avaliacao !== null}
          faltando={faltando}
          onEnviar={() => void enviar()}
        />
      </aside>

      {pendente && (
        <CuePopover
          cues={cues}
          posicao={{ top: pendente.rect.bottom + 8, left: pendente.rect.left }}
          trecho={textoDoCampo(pendente.campo)?.slice(pendente.faixa.start, pendente.faixa.end) ?? ''}
          onEscolher={escolherPista}
          onCancelar={() => setPendente(null)}
        />
      )}
    </div>
  )
}
