import { badgeClass, difficultyIcon } from '../../utils/formatters'
import type { PhishingEmail } from '../../types/phishing.types'
import MarkdownMessage from './MarkdownMessage'

export default function EmailDetail({
  email, onClose
}: { email: PhishingEmail; onClose: () => void }) {
  const ehEmail = email.channel === 'email'

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold text-primary">
          {ehEmail ? 'Detalhes do Email' : `Detalhes — ${email.channel}`}
        </h4>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`badge ${badgeClass(email.nivel)}`}>
          {difficultyIcon(email.nivel)}
          {email.nivel}
        </span>
        <span className={`badge ${email.is_malicious ? 'badge-hard' : 'badge-easy'}`}>
          {email.is_malicious ? 'Phishing' : 'Legítimo'}
        </span>
      </div>

      <div className="bg-[oklch(98%_0.01_250)] p-4 rounded-lg space-y-4">
        {ehEmail ? (
          <>
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
              <MarkdownMessage content={email.conteudo ?? ''} />
            </div>
          </>
        ) : (
          <div>
            <div className="text-xs text-gray-500">Conteúdo ({email.channel})</div>
            <pre className="mt-1 text-sm whitespace-pre-wrap break-words">
              {JSON.stringify(email.content_json, null, 2)}
            </pre>
          </div>
        )}

        {email.links.length > 0 && (
          <div>
            <div className="text-xs text-gray-500">{email.is_malicious ? 'Links Maliciosos' : 'Links'}</div>
            <ul className="mt-1 space-y-1">
              {email.links.map((l, i) => (
                <li
                  key={i}
                  className={`text-sm rounded px-2 py-1 break-all ${
                    email.is_malicious ? 'text-red-700 bg-red-50' : 'text-gray-800 bg-gray-100'
                  }`}
                >
                  <span className="font-medium">{l.text}</span>
                  <span className="mx-1 text-gray-400">→</span>
                  <span className="font-mono">{l.href}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {email.cues.length > 0 && (
        <div className="mt-4">
          <div className="text-xs text-gray-500 mb-1">Pistas anotadas</div>
          <ul className="flex flex-wrap gap-2">
            {email.cues.map((c, i) => (
              <li key={i} className="badge bg-gray-50 text-gray-700 border-gray-200" title={c.evidencia}>
                {c.code}
              </li>
            ))}
          </ul>
        </div>
      )}

      {email.phish_scale && (
        <p className="mt-3 text-xs text-gray-600">
          Phish Scale: {email.phish_scale.cue_count} pista(s) · premissa {email.phish_scale.premise_alignment} · dificuldade
          estimada <strong>{email.phish_scale.difficulty_estimated}</strong>
        </p>
      )}

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
