import { Mail } from 'lucide-react'

export default function EmptyState() {
  return (
    <div className="card p-12 text-center">
      <Mail className="size-14 text-accent mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum exemplo gerado ainda</h3>
      <p className="text-gray-600">Selecione o modo, configure as opções e clique em “Gerar”.</p>
    </div>
  )
}
