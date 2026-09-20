import { describe, expect, it } from 'vitest'
import { dataHora, decimal, nomeDoArquivo, percentual } from './formato'

describe('formato', () => {
  it('percentual usa vírgula e trata ausência', () => {
    expect(percentual(0.6666)).toBe('66,7%')
    expect(percentual(0)).toBe('0,0%')
    expect(percentual(null)).toBe('—')
  })
  it('decimal usa vírgula', () => {
    expect(decimal(3.6667)).toBe('3,67')
    expect(decimal(null)).toBe('—')
  })
  it('dataHora tolera nulo e lixo', () => {
    expect(dataHora(null)).toBe('—')
    expect(dataHora('não é data')).toBe('—')
    expect(dataHora('2026-09-20T15:00:00Z')).not.toBe('—')
  })
  it('nome do arquivo baixado', () => {
    expect(nomeDoArquivo('avaliacoes', 'csv')).toBe('avaliacoes.csv')
  })
})
