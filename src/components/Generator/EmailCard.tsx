import { Eye } from 'lucide-react'
import { badgeClass, difficultyIcon } from '../../utils/formatters'
import type { Difficulty, PhishingEmail } from '../../types/phishing.types'

export default function EmailCard({
  email, index, difficulty, onClick
}: {
  email: PhishingEmail
  index: number
  difficulty: Difficulty
  onClick: () => void
}) {
  return (
    <button
      className="text-left p-4 rounded-lg border hover:shadow-md hover:border-primary transition"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">Exemplo {index + 1}</span>
        <span className={`badge ${badgeClass(difficulty)}`}>
          {difficultyIcon(difficulty)}
          {difficulty}
        </span>
      </div>
      <div className="font-medium truncate">{email.assunto}</div>
      <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
        <Eye className="size-3" /> Clique para visualizar
      </div>
    </button>
  )
}
