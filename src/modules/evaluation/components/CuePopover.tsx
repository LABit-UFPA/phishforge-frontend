import { useEffect } from 'react'
import type { CueTaxonomia } from '../../../types/expert.types'

export interface PosicaoPopover {
  top: number
  left: number
}

const GRUPOS: ReadonlyArray<{ categoria: CueTaxonomia['category']; titulo: string }> = [
  { categoria: 'technical', titulo: 'Técnicas' },
  { categoria: 'psychological', titulo: 'Psicológicas' },
]

/**
 * Seletor de pista, posicionado junto à seleção. `descricao_pt` vai no
 * tooltip e abaixo do rótulo: o código técnico (`typosquat`) sozinho não
 * orienta quem nunca viu a taxonomia.
 */
export default function CuePopover({
  cues,
  posicao,
  trecho,
  onEscolher,
  onCancelar,
}: {
  cues: CueTaxonomia[]
  posicao: PosicaoPopover
  trecho: string
  onEscolher: (code: string) => void
  onCancelar: () => void
}) {
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancelar()
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [onCancelar])

  // Mantém dentro da janela: abre para cima se não couber embaixo.
  const largura = 340
  const left = Math.max(8, Math.min(posicao.left, window.innerWidth - largura - 8))

  return (
    <>
      <div className="fixed inset-0 z-40" onMouseDown={onCancelar} aria-hidden="true" />
      <div
        role="dialog"
        aria-label="Escolher a pista"
        className="fixed z-50 card p-3 max-h-[70vh] overflow-y-auto"
        style={{ top: posicao.top, left, width: largura }}
        // Não deixar o clique no popover desfazer a seleção de texto.
        onMouseDown={(e) => e.preventDefault()}
      >
        <p className="text-xs text-gray-500 mb-2 break-words">
          Marcar “<span className="font-medium text-gray-800">{trecho.length > 80 ? `${trecho.slice(0, 80)}…` : trecho}</span>” como:
        </p>
        {GRUPOS.map((g) => (
          <div key={g.categoria} className="mb-2">
            <div className="text-xs font-semibold text-primary mb-1">{g.titulo}</div>
            <ul className="space-y-1">
              {cues.filter((c) => c.category === g.categoria).map((c) => (
                <li key={c.code}>
                  <button
                    className="w-full text-left rounded-md border border-accent/30 hover:border-primary hover:bg-primary/5 px-2 py-1.5"
                    title={c.descricao_pt}
                    onClick={() => onEscolher(c.code)}
                  >
                    <span className="block text-sm font-medium">{c.label_pt}</span>
                    <span className="block text-xs text-gray-500">{c.descricao_pt}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <button className="text-xs text-gray-500 hover:text-gray-800" onClick={onCancelar}>Cancelar (Esc)</button>
      </div>
    </>
  )
}
