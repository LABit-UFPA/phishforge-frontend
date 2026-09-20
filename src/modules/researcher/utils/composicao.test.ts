import { describe, expect, it } from 'vitest'
import { analisarComposicao, elegivel, type ItemSelecionavel } from './composicao'

const item = (nivel: ItemSelecionavel['nivel'], extra: Partial<ItemSelecionavel> = {}): ItemSelecionavel => ({
  nivel,
  channel: 'email',
  is_malicious: true,
  ...extra,
})
const varios = (nivel: ItemSelecionavel['nivel'], n: number) => Array.from({ length: n }, () => item(nivel))

describe('analisarComposicao', () => {
  it('10/10/10 não tem avisos', () => {
    const r = analisarComposicao([...varios('facil', 10), ...varios('medio', 10), ...varios('dificil', 10)])
    expect(r.total).toBe(30)
    expect(r.distribuicao).toEqual({ facil: 10, medio: 10, dificil: 10 })
    expect(r.avisos).toEqual([])
  })

  it('seleção vazia avisa total e cada nível', () => {
    const r = analisarComposicao([])
    expect(r.avisos).toHaveLength(4)
    expect(r.avisos[0]).toContain('30')
  })

  it('30 itens mal distribuídos: só os níveis errados são apontados', () => {
    const r = analisarComposicao([...varios('facil', 12), ...varios('medio', 10), ...varios('dificil', 8)])
    expect(r.avisos).toEqual(['Nível facil: 12 de 10.', 'Nível dificil: 8 de 10.'])
  })

  it('item que não é e-mail phishing gera aviso', () => {
    const base = [...varios('facil', 10), ...varios('medio', 10), ...varios('dificil', 9)]
    const r = analisarComposicao([...base, item('dificil', { channel: 'sms' })])
    expect(r.distribuicao.dificil).toBe(10)
    expect(r.avisos).toHaveLength(1)
    expect(r.avisos[0]).toContain('recusados')
  })
})

describe('elegivel', () => {
  it('exige canal email e is_malicious', () => {
    expect(elegivel(item('facil'))).toBe(true)
    expect(elegivel(item('facil', { channel: 'website' }))).toBe(false)
    expect(elegivel(item('facil', { is_malicious: false }))).toBe(false)
  })
})
