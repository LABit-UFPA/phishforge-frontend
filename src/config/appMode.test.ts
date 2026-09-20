import { describe, expect, it } from 'vitest'
import { resolverModo, rotasDoModo } from './appMode'

describe('resolverModo', () => {
  it('ausente ou vazio = full', () => {
    expect(resolverModo(undefined)).toBe('full')
    expect(resolverModo('')).toBe('full')
  })
  it('valores explícitos', () => {
    expect(resolverModo('full')).toBe('full')
    expect(resolverModo('expert')).toBe('expert')
  })
  it('valor desconhecido cai no modo restrito', () => {
    expect(resolverModo('Full')).toBe('expert')
    expect(resolverModo('experts')).toBe('expert')
  })
})

describe('rotasDoModo', () => {
  it('full registra tudo', () => {
    expect(rotasDoModo('full')).toEqual({ curadoria: true, avaliacao: true, pesquisador: true })
  })
  it('expert só avaliação', () => {
    expect(rotasDoModo('expert')).toEqual({ curadoria: false, avaliacao: true, pesquisador: false })
  })
})
