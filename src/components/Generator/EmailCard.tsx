import { Eye } from 'lucide-react'
import { badgeClass, difficultyIcon, itemTitulo } from '../../utils/formatters'
import type { PhishingEmail } from '../../types/phishing.types'

export default function EmailCard({
  email, index, onClick
}: {
  email: PhishingEmail
  index: number
  onClick: () => void
}) {
  return (
    <button
      className="text-left p-4 rounded-lg border hover:shadow-md hover:border-primary transition"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">Exemplo {index + 1}</span>
        <span className={`badge ${badgeClass(email.nivel)}`}>
          {difficultyIcon(email.nivel)}
          {email.nivel}
        </span>
      </div>
      <div className="font-medium truncate">{itemTitulo(email)}</div>
      <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
        <Eye className="size-3" /> Clique para visualizar
      </div>
    </button>
  )
}
