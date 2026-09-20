import { useEffect, useState } from 'react'

/** Devolve `value` só depois de ele ficar estável por `delayMs` (ex.: busca digitada). */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
