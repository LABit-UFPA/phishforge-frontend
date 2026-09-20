interface Props {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

/** Substitui o `confirm()` nativo do navegador: bloqueante, sem estilo e fora do tema. */
export default function ConfirmDialog({ title, message, confirmLabel = 'Confirmar', onConfirm, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={onCancel}
    >
      <div className="card max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h3 id="confirm-title" className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button className="btn-secondary btn" onClick={onCancel}>Cancelar</button>
          <button className="btn bg-red-600 text-white hover:bg-red-700 px-4 py-2" onClick={onConfirm} autoFocus>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
