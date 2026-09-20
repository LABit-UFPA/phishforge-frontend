import { Eye, Trash2, Calendar } from 'lucide-react'
import { badgeClass, difficultyIcon, itemTitulo } from '../../utils/formatters'
import type { PhishingEmail } from '../../types/phishing.types'

interface Props {
  emails: PhishingEmail[]
  onView: (email: PhishingEmail) => void
  onDelete: (emailId: string) => void
  isLoading: boolean
}

export default function EmailList({ emails, onView, onDelete, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-accent/10 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (emails.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="text-gray-400 mb-4">📧</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum email encontrado</h3>
        <p className="text-gray-600">Tente ajustar os filtros ou gere novos exemplos.</p>
      </div>
    )
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Data não disponível'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="card p-6">
      <div className="space-y-4">
        {emails.map((email) => (
          <div
            key={email.id}
            className="border border-accent/20 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`badge ${badgeClass(email.nivel)}`}>
                    {difficultyIcon(email.nivel)}
                    {email.nivel}
                  </span>
                  {email.categoria && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {email.categoria}
                    </span>
                  )}
                </div>
                
                <h4 className="font-medium text-gray-900 truncate mb-1">
                  {itemTitulo(email)}
                </h4>
                
                {email.remetente && (
                  <p className="text-sm text-gray-600 mb-2">
                    De: {email.remetente} → Para: {email.receptor}
                  </p>
                )}
                
                {email.created_at && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="size-3" />
                    {formatDate(email.created_at)}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => onView(email)}
                  className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  title="Visualizar email"
                >
                  <Eye className="size-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Tem certeza que deseja deletar este email?')) {
                      onDelete(email.id)
                    }
                  }}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Deletar email"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
