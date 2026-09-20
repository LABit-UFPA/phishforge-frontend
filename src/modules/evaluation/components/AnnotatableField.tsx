import { useMemo, useRef } from 'react'
import type { CampoAnotavel } from '../../../types/expert.types'
import type { AnotacaoLocal } from '../hooks/useAnnotations'
import { codePointsParaUtf16 } from '../utils/offsets'
import { capturarSelecao } from '../utils/capturarSelecao'
import { segmentar } from '../utils/segments'
import type { Faixa } from '../utils/selecao'

// Um sublinhado por anotação, empilhados quando há sobreposição.
const CORES = ['#4C72DD', '#e11d48', '#059669', '#d97706', '#7c3aed', '#0891b2']

export interface SelecaoFeita {
  campo: CampoAnotavel
  /** Faixa em UTF-16, já aparada, relativa ao texto do campo. */
  faixa: Faixa
  rect: DOMRect
}

/**
 * Renderiza UM campo do item como TEXTO PURO (nunca markdown: o
 * react-markdown consome a sintaxe e colapsa espaços, então offsets lidos do
 * DOM jamais bateriam com os da string que o backend valida). Cada segmento
 * vira um `<span data-start>`; nenhum caractere é inserido nem removido.
 */
export default function AnnotatableField({
  campo,
  rotulo,
  texto,
  anotacoes,
  focoId,
  onSelecionar,
  onFocar,
  multilinha = false,
}: {
  campo: CampoAnotavel
  rotulo: string
  texto: string | null
  anotacoes: AnotacaoLocal[]
  focoId: string | null
  onSelecionar: (s: SelecaoFeita) => void
  onFocar: (id: string | null) => void
  multilinha?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  const segmentos = useMemo(() => {
    if (texto === null) return []
    // As anotações vivem em code points (unidade da API); a renderização é UTF-16.
    const emUtf16 = anotacoes
      .filter((a) => a.campo === campo)
      .map((a) => ({ id: a.id, start: codePointsParaUtf16(texto, a.span_start), end: codePointsParaUtf16(texto, a.span_end) }))
    return segmentar(texto, emUtf16)
  }, [texto, anotacoes, campo])

  if (texto === null) return null

  const aoSoltar = () => {
    if (!ref.current) return
    const faixa = capturarSelecao(ref.current, texto)
    const selecao = window.getSelection()
    if (!faixa || !selecao || selecao.rangeCount === 0) return
    onSelecionar({ campo, faixa, rect: selecao.getRangeAt(0).getBoundingClientRect() })
  }

  const idsNaOrdem = anotacoes.map((a) => a.id)

  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{rotulo}</div>
      <div
        ref={ref}
        data-campo={campo}
        onMouseUp={aoSoltar}
        onKeyUp={aoSoltar}
        className={`whitespace-pre-wrap break-words select-text rounded-md bg-white border border-accent/30 px-3 py-2 text-sm ${multilinha ? 'min-h-32' : ''}`}
      >
        {segmentos.map((s) => {
          const sombras = s.annIds.map((id, k) => `inset 0 -${2 + k * 3}px 0 ${CORES[idsNaOrdem.indexOf(id) % CORES.length]}`)
          const emFoco = focoId !== null && s.annIds.includes(focoId)
          return (
            <span
              key={s.start}
              data-start={s.start}
              style={sombras.length ? { boxShadow: sombras.join(', ') } : undefined}
              className={emFoco ? 'bg-yellow-100' : undefined}
              onMouseEnter={s.annIds.length ? () => onFocar(s.annIds[s.annIds.length - 1]) : undefined}
              onMouseLeave={s.annIds.length ? () => onFocar(null) : undefined}
            >
              {s.texto}
            </span>
          )
        })}
      </div>
    </div>
  )
}
