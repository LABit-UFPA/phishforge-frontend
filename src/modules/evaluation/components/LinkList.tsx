import type { ItemCego } from '../../../types/expert.types'

/** Links do e-mail como o destinatário os veria: texto exibido e destino real, lado a lado. */
export default function LinkList({ links }: { links: ItemCego['links'] }) {
  if (links.length === 0) return null
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">Links</div>
      <ul className="space-y-1">
        {links.map((l, i) => (
          <li key={i} className="text-sm bg-gray-50 rounded px-2 py-1 break-all">
            <span className="font-medium">{l.text}</span>
            <span className="mx-1 text-gray-400">→</span>
            <span className="font-mono text-gray-700">{l.href}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
