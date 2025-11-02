import type { PhishingEmail } from "../../types/phishing.types";


/** simples wrapper para markdown */
function MarkdownMessage({ content }: { content: string }) {
  const ReactMarkdown = require('react-markdown').default
  const remarkGfm = require('remark-gfm').default
  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}

export default function EmailDetail({
  email, onClose
}: { email: PhishingEmail; onClose: () => void }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold text-primary">Detalhes do Email</h4>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
      </div>

      <div className="bg-[oklch(98%_0.01_250)] p-4 rounded-lg space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500">Remetente</div>
            <div className="text-sm font-medium">{email.remetente}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Receptor</div>
            <div className="text-sm font-medium">{email.receptor}</div>
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Assunto</div>
          <div className="text-sm font-semibold">{email.assunto}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Conteúdo</div>
          <MarkdownMessage content={email.conteudo} />
        </div>
        {!!email.links?.length && (
          <div>
            <div className="text-xs text-gray-500">Links Maliciosos</div>
            <ul className="mt-1 space-y-1">
              {email.links.map((l, i) => (
                <li key={i} className="text-sm text-red-700 bg-red-50 rounded px-2 py-1 font-mono break-all">{l}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-4 bg-[oklch(96%_0.02_255)] p-4 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="size-5 rounded-full bg-primary inline-block" />
          <div>
            <div className="text-sm font-semibold text-primary">Explicação</div>
            <MarkdownMessage content={email.explicacao} />
          </div>
        </div>
      </div>
    </div>
  )
}
