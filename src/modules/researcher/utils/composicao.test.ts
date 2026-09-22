import { describe, expect, it } from 'vitest'
import type { ItemCorpus } from '../../../types/researcher.types'
import { analisarComposicao, combinarSelecaoAutomatica, elegivel, type ItemSelecionavel } from './composicao'

const item = (nivel: ItemSelecionavel['nivel'], extra: Partial<ItemSelecionavel> = {}): ItemSelecionavel => ({
  nivel,
  channel: 'email',
  is_malicious: true,
  ...extra,
})
const varios = (nivel: ItemSelecionavel['nivel'], n: number) => Array.from({ length: n }, () => item(nivel))

const itemCorpus = (nivel: ItemCorpus['nivel'], id: string): ItemCorpus => ({
  id,
  assunto: `Assunto ${id}`,
  remetente: 'x@example.com',
  categoria: 'financeiro',
  nivel,
  channel: 'email',
  is_malicious: true,
})
const variosCorpus = (nivel: ItemCorpus['nivel'], n: number) =>
  Array.from({ length: n }, (_, i) => itemCorpus(nivel, `${nivel}-${i}`))

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

describe('combinarSelecaoAutomatica', () => {
  it('corpus suficiente: 10 de cada nível, na ordem facil/medio/dificil, sem faltantes', () => {
    const r = combinarSelecaoAutomatica({
      facil: variosCorpus('facil', 14),
      medio: variosCorpus('medio', 10),
      dificil: variosCorpus('dificil', 20),
    })
    expect(r.faltando).toEqual({})
    expect(r.selecionados).toHaveLength(30)
    expect(r.selecionados.map((i) => i.nivel)).toEqual([
      ...Array(10).fill('facil'),
      ...Array(10).fill('medio'),
      ...Array(10).fill('dificil'),
    ])
    // so os 10 primeiros de cada nivel entram, nunca mais
    expect(r.selecionados.filter((i) => i.nivel === 'facil').map((i) => i.id)).toEqual(
      variosCorpus('facil', 10).map((i) => i.id),
    )
  })

  it('corpus insuficiente: reporta quanto falta por nivel e devolve so o que ha', () => {
    const r = combinarSelecaoAutomatica({
      facil: variosCorpus('facil', 3),
      medio: variosCorpus('medio', 10),
      dificil: variosCorpus('dificil', 0),
    })
    expect(r.faltando).toEqual({ facil: 7, dificil: 10 })
    expect(r.selecionados).toHaveLength(13)
  })
})
