export function percentual(valor: number | null): string {
  return valor === null ? '—' : `${(valor * 100).toFixed(1).replace('.', ',')}%`
}

export function decimal(valor: number | null, casas = 2): string {
  return valor === null ? '—' : valor.toFixed(casas).replace('.', ',')
}

export function dataHora(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('pt-BR')
}

export function nomeDoArquivo(dataset: string, formato: string): string {
  return `${dataset}.${formato}`
}
