import { AlertTriangle, X } from 'lucide-react'

export default function ErrorBanner({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
      <AlertTriangle className="size-5 shrink-0 mt-0.5" />
      <p className="flex-1 text-sm break-words">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-600 hover:text-red-800" aria-label="Fechar">
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
