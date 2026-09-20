import { describe, expect, it } from 'vitest'
import { trimSelecao } from './selecao'

describe('trimSelecao', () => {
  const t = 'confirme seus dados agora'

  it('devolve a faixa inalterada quando nao ha espaco nas pontas', () => {
    expect(trimSelecao(t, { start: 0, end: 8 })).toEqual({ start: 0, end: 8 })
  })

  it('duplo-clique captura o espaco seguinte: encolhe a ponta final', () => {
    expect(trimSelecao(t, { start: 0, end: 9 })).toEqual({ start: 0, end: 8 })
  })

  it('encolhe as duas pontas (espaco e quebra de linha)', () => {
    expect(trimSelecao('a \n b', { start: 1, end: 4 })).toBeNull()
    expect(trimSelecao('  ola  ', { start: 0, end: 7 })).toEqual({ start: 2, end: 5 })
  })

  it('so espaco: nao sobra nada', () => {
    expect(trimSelecao('a   b', { start: 1, end: 4 })).toBeNull()
  })

  it('clamp: limita ao texto e aceita faixa invertida', () => {
    expect(trimSelecao(t, { start: -5, end: 999 })).toEqual({ start: 0, end: t.length })
    expect(trimSelecao(t, { start: 8, end: 0 })).toEqual({ start: 0, end: 8 })
  })

  it('nao corta um emoji ao meio', () => {
    const e = 'a😀b' // 😀 ocupa os indices 1..2
    expect(trimSelecao(e, { start: 2, end: 4 })).toEqual({ start: 1, end: 4 }) // inicio recua para antes do par
    expect(trimSelecao(e, { start: 0, end: 2 })).toEqual({ start: 0, end: 3 }) // fim avanca para depois do par
  })
})
