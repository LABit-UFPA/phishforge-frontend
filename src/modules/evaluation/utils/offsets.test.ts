import { describe, expect, it } from 'vitest'
import {
  ajustarAoLimiteDeCodePoint,
  codePointsParaUtf16,
  fatiarPorCodePoints,
  tamanhoEmCodePoints,
  utf16ParaCodePoints,
} from './offsets'

describe('offsets: UTF-16 <-> code points', () => {
  it('texto ASCII puro: os dois mundos coincidem (identidade)', () => {
    const t = 'Clique aqui agora'
    for (let i = 0; i <= t.length; i += 1) {
      expect(utf16ParaCodePoints(t, i)).toBe(i)
      expect(codePointsParaUtf16(t, i)).toBe(i)
    }
    expect(tamanhoEmCodePoints(t)).toBe(t.length)
  })

  it('emoji ANTES do span desloca o offset em 1 (o emoji e 2 unidades UTF-16, 1 code point)', () => {
    const t = '😀 Clique aqui'
    const inicioUtf16 = t.indexOf('Clique')
    expect(inicioUtf16).toBe(3) // 😀 = 2 unidades + 1 espaco
    expect(utf16ParaCodePoints(t, inicioUtf16)).toBe(2) // em Python: t.index('Clique') == 2
    expect(codePointsParaUtf16(t, 2)).toBe(3)
    expect(tamanhoEmCodePoints(t)).toBe(t.length - 1)
  })

  it('emoji DENTRO do trecho: o tamanho em code points e menor que o em UTF-16', () => {
    const t = 'a😀b'
    expect(t.length).toBe(4)
    expect(tamanhoEmCodePoints(t)).toBe(3)
    expect(fatiarPorCodePoints(t, 1, 3)).toBe('😀b')
  })

  it('varios emojis e emoji composto (ZWJ) contam como varios code points, como no Python', () => {
    const familia = '👨‍👩‍👧' // 3 emojis + 2 ZWJ = 5 code points
    expect(tamanhoEmCodePoints(familia)).toBe(5)
    expect(familia.length).toBe(8)
    expect(tamanhoEmCodePoints('😀😀😀')).toBe(3)
  })

  it('acentos: NFC (1 code point) vs NFD (2) — a contagem segue o texto como ele esta', () => {
    const nfc = 'á'.normalize('NFC')
    const nfd = 'á'.normalize('NFD')
    expect(tamanhoEmCodePoints(nfc)).toBe(1)
    expect(tamanhoEmCodePoints(nfd)).toBe(2)
    expect(utf16ParaCodePoints(`${nfd}bc`, 3)).toBe(3)
  })

  it('ida e volta: code points -> UTF-16 -> code points preserva o valor', () => {
    const t = 'ola 😀 mundo 👨‍👩‍👧 fim\r\nlinha 2 é ção'
    const n = tamanhoEmCodePoints(t)
    for (let cp = 0; cp <= n; cp += 1) {
      expect(utf16ParaCodePoints(t, codePointsParaUtf16(t, cp))).toBe(cp)
    }
  })

  it('indice no MEIO de um par surrogate e ajustado para o limite mais proximo, sem cortar o emoji', () => {
    const t = 'a😀b' // indices UTF-16: a=0, 😀=1..2, b=3
    expect(ajustarAoLimiteDeCodePoint(t, 2, 'inicio')).toBe(1)
    expect(ajustarAoLimiteDeCodePoint(t, 2, 'fim')).toBe(3)
    expect(ajustarAoLimiteDeCodePoint(t, 1, 'inicio')).toBe(1) // ja e limite
    expect(utf16ParaCodePoints(t, 2)).toBe(1) // meio do par conta como antes do emoji
  })

  it('valores fora do intervalo sao limitados, nao lancam', () => {
    expect(utf16ParaCodePoints('abc', -5)).toBe(0)
    expect(utf16ParaCodePoints('abc', 99)).toBe(3)
    expect(codePointsParaUtf16('abc', 99)).toBe(3)
    expect(codePointsParaUtf16('abc', -1)).toBe(0)
  })

  it('fatiar por code points reproduz o texto[inicio:fim] do Python', () => {
    // Caso do backend: "😀 Clique aqui agora ..."[2:19] == "Clique aqui agora"
    const t = '😀 Clique aqui agora para confirmar seus dados.'
    expect(fatiarPorCodePoints(t, 2, 19)).toBe('Clique aqui agora')
    // O mesmo intervalo lido como UTF-16 (o erro classico) daria outro trecho:
    expect(t.slice(2, 19)).not.toBe('Clique aqui agora')
  })
})
