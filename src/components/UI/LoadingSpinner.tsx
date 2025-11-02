export default function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-block size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </div>
  )
}
