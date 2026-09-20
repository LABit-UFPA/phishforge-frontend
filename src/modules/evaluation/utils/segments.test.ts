import { describe, expect, it } from 'vitest'
import { segmentar, type AnotacaoUtf16 } from './segments'

const juntar = (texto: string, anotacoes: AnotacaoUtf16[]) =>
  segmentar(texto, anotacoes).map((s) => s.texto).join('')

const ann = (id: string, start: number, end: number): AnotacaoUtf16 => ({ id, start, end })

describe('segmentar', () => {
  const texto = 'Prezado cliente, confirme seus dados agora.'

  it('sem anotacao: um unico segmento com o texto inteiro', () => {
    const s = segmentar(texto, [])
    expect(s).toEqual([{ start: 0, end: texto.length, texto, annIds: [] }])
  })

  it('texto vazio nao gera segmentos', () => {
    expect(segmentar('', [ann('a', 0, 3)])).toEqual([])
  })

  it('duas anotacoes disjuntas', () => {
    const s = segmentar(texto, [ann('a', 0, 7), ann('b', 17, 25)])
    expect(s.map((x) => x.annIds)).toEqual([['a'], [], ['b'], []])
    expect(s[0].texto).toBe('Prezado')
    expect(s[2].texto).toBe('confirme')
  })

  it('duas anotacoes sobrepostas: o miolo tem as duas', () => {
    const fimA = texto.indexOf(' confirme') // 'a' cobre "Prezado cliente,"
    const inicioB = texto.indexOf('cliente')
    const fimB = texto.indexOf(' seus') // 'b' cobre "cliente, confirme"
    const s = segmentar(texto, [ann('a', 0, fimA), ann('b', inicioB, fimB)])
    expect(s.map((x) => [x.texto, x.annIds])).toEqual([
      ['Prezado ', ['a']],
      ['cliente,', ['a', 'b']],
      [' confirme', ['b']],
      [' seus dados agora.', []],
    ])
  })

  it('uma anotacao aninhada dentro de outra', () => {
    const fimExterna = texto.indexOf(' seus')
    const s = segmentar(texto, [ann('externa', 0, fimExterna), ann('interna', texto.indexOf('cliente'), texto.indexOf(','))])
    expect(s.map((x) => x.annIds)).toEqual([['externa'], ['externa', 'interna'], ['externa'], []])
  })

  it('anotacao na posicao 0', () => {
    const s = segmentar(texto, [ann('a', 0, 4)])
    expect(s[0]).toMatchObject({ start: 0, texto: 'Prez', annIds: ['a'] })
  })

  it('anotacao terminando exatamente no fim do texto', () => {
    const s = segmentar(texto, [ann('a', 38, texto.length)])
    expect(s[s.length - 1]).toMatchObject({ end: texto.length, annIds: ['a'] })
    expect(s.map((x) => x.texto).join('')).toBe(texto)
  })

  it('a mesma faixa anotada duas vezes empilha as duas no mesmo segmento', () => {
    const s = segmentar(texto, [ann('a', 0, 7), ann('b', 0, 7)])
    expect(s[0].annIds).toEqual(['a', 'b'])
  })

  it('anotacao invalida (vazia, invertida ou fora do texto) e ignorada sem quebrar a invariante', () => {
    const s = segmentar(texto, [ann('vazia', 5, 5), ann('invertida', 9, 3), ann('fora', 500, 600), ann('estoura', 30, 999)])
    expect(s.map((x) => x.texto).join('')).toBe(texto)
    expect(s.flatMap((x) => x.annIds)).toEqual(['estoura']) // so a parte valida da que estoura o fim
  })

  it('cada segmento comeca onde o anterior termina (sem buraco nem sobreposicao)', () => {
    const s = segmentar(texto, [ann('a', 3, 20), ann('b', 10, 30)])
    expect(s[0].start).toBe(0)
    for (let i = 1; i < s.length; i += 1) expect(s[i].start).toBe(s[i - 1].end)
    expect(s[s.length - 1].end).toBe(texto.length)
  })
})

describe('segmentar — propriedade invariante (aleatoria, com semente fixa)', () => {
  // Gerador pseudo-aleatorio deterministico (mulberry32): mesmo resultado em toda execucao.
  function aleatorio(semente: number) {
    let a = semente
    return () => {
      a = (a + 0x6d2b79f5) | 0
      let t = Math.imul(a ^ (a >>> 15), 1 | a)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  const ALFABETO = ['a', 'b', ' ', '\n', '\r\n', 'é', 'ç', '😀', '👨‍👩‍👧', '中', '.', 'Z']

  it('a concatenacao dos segmentos e SEMPRE o texto original, com qualquer configuracao de anotacoes', () => {
    const rnd = aleatorio(20260920)
    for (let rodada = 0; rodada < 300; rodada += 1) {
      const tamanho = Math.floor(rnd() * 40)
      const texto = Array.from({ length: tamanho }, () => ALFABETO[Math.floor(rnd() * ALFABETO.length)]).join('')
      const anotacoes = Array.from({ length: Math.floor(rnd() * 8) }, (_, i) =>
        ann(`a${i}`, Math.floor(rnd() * (texto.length + 6)) - 3, Math.floor(rnd() * (texto.length + 6)) - 3),
      )

      const segmentos = segmentar(texto, anotacoes)

      expect(juntar(texto, anotacoes)).toBe(texto)
      // sem buraco nem sobreposicao entre segmentos consecutivos
      segmentos.forEach((s, i) => {
        expect(s.texto).toBe(texto.slice(s.start, s.end))
        if (i > 0) expect(s.start).toBe(segmentos[i - 1].end)
      })
      // cada anotacao valida cobre exatamente os segmentos que dizem que ela cobre
      for (const a of anotacoes) {
        const start = Math.max(0, a.start)
        const end = Math.min(texto.length, a.end)
        if (end <= start) continue
        const cobertos = segmentos.filter((s) => s.annIds.includes(a.id))
        expect(cobertos.map((s) => s.texto).join('')).toBe(texto.slice(start, end))
      }
    }
  })
})
