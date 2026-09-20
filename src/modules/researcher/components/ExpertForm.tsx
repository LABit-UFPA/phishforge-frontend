import { useState, type FormEvent } from 'react'
import ErrorBanner from '../../../components/UI/ErrorBanner'
import { criarEspecialista } from '../../../services/researcherApiService'
import type { CodigoEmitido, Rodada } from '../../../types/researcher.types'
import { tratarErro } from '../utils/erros'

const CAMPO = 'w-full rounded-lg border border-accent/40 focus:outline-none focus:ring-2 focus:ring-primary/40 p-2 text-sm'

interface Props {
  apiKey: string
  rodada: Rodada
  onCodigo: (nome: string, codigo: CodigoEmitido) => void
  onNaoAutorizado: () => void
}

export default function ExpertForm({ apiKey, rodada, onCodigo, onNaoAutorizado }: Props) {
  const [nome, setNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const encerrada = rodada.status === 'encerrada'

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setErro(null)
    try {
      const codigo = await criarEspecialista(apiKey, {
        nome: nome.trim(),
        sobrenome: sobrenome.trim(),
        email: email.trim(),
        rodada_id: rodada.id,
      })
      onCodigo(`${nome.trim()} ${sobrenome.trim()}`, codigo)
      setNome('')
      setSobrenome('')
      setEmail('')
    } catch (err) {
      setErro(tratarErro(err, onNaoAutorizado))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={(e) => void enviar(e)} className="space-y-3">
      <h3 className="font-semibold text-primary">Cadastrar especialista</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="e-nome" className="block text-sm font-medium mb-1">Nome</label>
          <input id="e-nome" value={nome} onChange={(e) => setNome(e.target.value)} className={CAMPO} />
        </div>
        <div>
          <label htmlFor="e-sobrenome" className="block text-sm font-medium mb-1">Sobrenome</label>
          <input id="e-sobrenome" value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} className={CAMPO} />
        </div>
      </div>
      <div>
        <label htmlFor="e-email" className="block text-sm font-medium mb-1">E-mail</label>
        <input id="e-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={CAMPO} />
      </div>
      <p className="text-xs text-gray-500">Rodada: {rodada.nome} ({rodada.status})</p>
      {encerrada && <p className="text-xs text-amber-800">Rodada encerrada: não aceita novos especialistas.</p>}
      {erro && <ErrorBanner message={erro} onDismiss={() => setErro(null)} />}
      <button className="btn btn-primary" disabled={enviando || encerrada || !nome.trim() || !sobrenome.trim() || !email.trim()}>
        {enviando ? 'Cadastrando…' : 'Cadastrar e gerar código'}
      </button>
    </form>
  )
}
