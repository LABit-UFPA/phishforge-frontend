import { Download } from 'lucide-react'
import { useState } from 'react'
import ErrorBanner from '../../../components/UI/ErrorBanner'
import { baixarExport } from '../../../services/researcherApiService'
import type { DatasetExport, FormatoExport } from '../../../types/researcher.types'
import { tratarErro } from '../utils/erros'
import { nomeDoArquivo } from '../utils/formato'

const DATASETS: DatasetExport[] = ['avaliacoes', 'anotacoes', 'itens', 'especialistas']

interface Props {
  apiKey: string
  rodadaId: string
  onNaoAutorizado: () => void
}

export default function ExportPanel({ apiKey, rodadaId, onNaoAutorizado }: Props) {
  const [dataset, setDataset] = useState<DatasetExport>('avaliacoes')
  const [formato, setFormato] = useState<FormatoExport>('csv')
  const [pii, setPii] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [baixando, setBaixando] = useState(false)

  const escolherDataset = (d: DatasetExport) => {
    setDataset(d)
    setPii(false)
  }

  const baixar = async () => {
    setBaixando(true)
    setErro(null)
    try {
      const blob = await baixarExport(apiKey, rodadaId, dataset, formato, pii && dataset === 'especialistas')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nomeDoArquivo(dataset, formato)
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setErro(tratarErro(err, onNaoAutorizado))
    } finally {
      setBaixando(false)
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-primary">Exportar dados</h3>
      <div className="flex flex-wrap gap-3">
        <div>
          <label htmlFor="x-dataset" className="block text-sm font-medium mb-1">Dataset</label>
          <select id="x-dataset" value={dataset} onChange={(e) => escolherDataset(e.target.value as DatasetExport)} className="rounded-lg border border-accent/40 p-2 text-sm">
            {DATASETS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="x-formato" className="block text-sm font-medium mb-1">Formato</label>
          <select id="x-formato" value={formato} onChange={(e) => setFormato(e.target.value as FormatoExport)} className="rounded-lg border border-accent/40 p-2 text-sm">
            <option value="csv">CSV (UTF-8 com BOM, abre no Excel)</option>
            <option value="json">JSON</option>
          </select>
        </div>
      </div>
      {dataset === 'especialistas' && (
        <label className="flex items-start gap-2 text-sm rounded-lg border border-amber-300 bg-amber-50 p-3">
          <input type="checkbox" checked={pii} onChange={(e) => setPii(e.target.checked)} className="mt-1" />
          <span>
            Incluir dados pessoais (nome, sobrenome, e-mail). <strong>Isso fica registrado no log do servidor.</strong>
          </span>
        </label>
      )}
      {erro && <ErrorBanner message={erro} onDismiss={() => setErro(null)} />}
      <button className="btn btn-primary gap-2" onClick={() => void baixar()} disabled={baixando}>
        <Download className="size-4" /> {baixando ? 'Baixando…' : 'Baixar'}
      </button>
    </div>
  )
}
