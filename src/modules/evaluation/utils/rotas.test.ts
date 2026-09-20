import { describe, expect, it } from 'vitest'
import type { ExpertMe } from '../../../types/expert.types'
import { destinoPara, proximoDestino } from './rotas'

const me = (parcial: {
  consentimento?: boolean
  perfil?: boolean
  total?: number
  concluidas?: number
  proxima?: number
}): ExpertMe => ({
  especialista: { id: 'e', nome: 'Ana', sobrenome: 'Souza' },
  rodada: { id: 'r', nome: 'Piloto', status: 'aberta', tcle_versao: 'v1' },
  consentimento: { necessario: parcial.consentimento ?? false, versao: 'v1' },
  perfil: { necessario: parcial.perfil ?? false },
  progresso: { total: parcial.total ?? 30, concluidas: parcial.concluidas ?? 0, proxima_ordem: parcial.proxima ?? 1 },
})

describe('destinoPara', () => {
  it('sem consentimento: qualquer rota vai para o consentimento, e ele mesmo fica', () => {
    const m = me({ consentimento: true, perfil: true })
    expect(destinoPara('/avaliacao/7', m)).toBe('/avaliacao/consentimento')
    expect(destinoPara('/avaliacao/perfil', m)).toBe('/avaliacao/consentimento')
    expect(destinoPara('/avaliacao/consentimento', m)).toBeNull()
  })

  it('consentiu mas falta o perfil: vai para o perfil', () => {
    const m = me({ perfil: true })
    expect(destinoPara('/avaliacao/7', m)).toBe('/avaliacao/perfil')
    expect(destinoPara('/avaliacao/perfil', m)).toBeNull()
  })

  it('novo TCLE no meio da coleta (consentimento volta a ser necessario) barra ate um item ja aberto', () => {
    expect(destinoPara('/avaliacao/12', me({ consentimento: true }))).toBe('/avaliacao/consentimento')
  })

  it('tudo em dia: um item pedido direto (deep link) fica onde esta', () => {
    expect(destinoPara('/avaliacao/7', me({}))).toBeNull()
    expect(destinoPara('/avaliacao/concluido', me({}))).toBeNull()
  })

  it('tudo em dia: consentimento/perfil/raiz encaminham para o proximo item', () => {
    const m = me({ concluidas: 4, proxima: 5 })
    for (const rota of ['/avaliacao/consentimento', '/avaliacao/perfil', '/avaliacao', '/avaliacao/']) {
      expect(destinoPara(rota, m)).toBe('/avaliacao/5')
    }
  })

  it('tudo concluido: a raiz encaminha para a tela final', () => {
    expect(destinoPara('/avaliacao', me({ total: 30, concluidas: 30, proxima: 30 }))).toBe('/avaliacao/concluido')
  })
})

describe('proximoDestino', () => {
  it('aponta para o proximo pendente enquanto houver', () => {
    expect(proximoDestino(me({ total: 3, concluidas: 1, proxima: 2 }))).toBe('/avaliacao/2')
  })

  it('so vai para a tela final quando concluidas alcanca o total', () => {
    expect(proximoDestino(me({ total: 3, concluidas: 3, proxima: 3 }))).toBe('/avaliacao/concluido')
    expect(proximoDestino(me({ total: 3, concluidas: 2, proxima: 3 }))).toBe('/avaliacao/3')
  })

  it('rodada sem itens nao fica preso tentando abrir o item 1', () => {
    expect(proximoDestino(me({ total: 0, concluidas: 0, proxima: 1 }))).toBe('/avaliacao/1')
  })
})
