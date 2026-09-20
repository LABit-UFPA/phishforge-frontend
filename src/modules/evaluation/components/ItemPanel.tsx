import type { CampoAnotavel, ItemCego } from '../../../types/expert.types'
import type { AnotacaoLocal } from '../hooks/useAnnotations'
import AnnotatableField, { type SelecaoFeita } from './AnnotatableField'
import LinkList from './LinkList'

export interface PropsItemPanel {
  item: ItemCego
  anotacoes: AnotacaoLocal[]
  focoId: string | null
  onSelecionar: (s: SelecaoFeita) => void
  onFocar: (id: string | null) => void
}

/** O item, campo a campo. `receptor` e `links` são só exibição: a API só aceita anotar remetente, assunto e conteúdo. */
export default function ItemPanel({ item, anotacoes, focoId, onSelecionar, onFocar }: PropsItemPanel) {
  const comum = { anotacoes, focoId, onSelecionar, onFocar }
  const campo = (c: CampoAnotavel, rotulo: string, texto: string | null, multilinha = false) => (
    <AnnotatableField campo={c} rotulo={rotulo} texto={texto} multilinha={multilinha} {...comum} />
  )

  return (
    <div className="card p-4 space-y-4">
      {campo('remetente', 'Remetente', item.remetente)}
      {item.receptor && (
        <div>
          <div className="text-xs text-gray-500 mb-1">Receptor</div>
          <div className="text-sm px-3 py-2">{item.receptor}</div>
        </div>
      )}
      {campo('assunto', 'Assunto', item.assunto)}
      {campo('conteudo', 'Conteúdo', item.conteudo_texto, true)}
      <LinkList links={item.links} />
    </div>
  )
}
