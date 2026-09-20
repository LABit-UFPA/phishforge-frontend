import { Check, Copy, KeyRound } from 'lucide-react'
import { useState } from 'react'

interface Props {
  nome: string
  codigo: string
  link: string
  onFechar: () => void
}

/** O código em claro só existe nesta resposta: por isso o aviso é impossível de ignorar. */
export default function CodigoEmitidoAviso({ nome, codigo, link, onFechar }: Props) {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopiado(true)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <div role="alert" className="rounded-lg border-2 border-amber-400 bg-amber-50 p-4 space-y-3">
      <div className="flex items-center gap-2 font-semibold text-amber-900">
        <KeyRound className="size-5" /> Código de acesso de {nome}
      </div>
      <p className="text-sm text-amber-900">
        <strong>Copie agora: isto não pode ser recuperado depois.</strong> O servidor guarda só um hash. Se o
        especialista perder o link, use “Novo código” na tabela.
      </p>
      <p className="font-mono text-lg tracking-wider select-all">{codigo}</p>
      <p className="text-xs break-all text-gray-700 select-all">{link}</p>
      <div className="flex gap-2">
        <button className="btn btn-primary gap-2" onClick={() => void copiar()}>
          {copiado ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copiado ? 'Link copiado' : 'Copiar link'}
        </button>
        <button className="btn btn-secondary" onClick={onFechar}>Já copiei, fechar</button>
      </div>
    </div>
  )
}
