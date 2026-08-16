import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createPatternFromDraft,
  loadStoredPatterns,
  saveStoredPatterns,
  seedPatterns,
} from '../data/patterns'
import type { Pattern, PatternDraft } from '../types/pattern'

type PatternStore = {
  patterns: Pattern[]
  getBySlug: (slug: string) => Pattern | undefined
  published: Pattern[]
  addPattern: (draft: PatternDraft) => Pattern
}

const PatternContext = createContext<PatternStore | null>(null)

export function PatternProvider({ children }: { children: ReactNode }) {
  const [manualPatterns, setManualPatterns] = useState<Pattern[]>(() =>
    loadStoredPatterns(),
  )

  useEffect(() => {
    saveStoredPatterns(manualPatterns)
  }, [manualPatterns])

  const patterns = useMemo(
    () => [...seedPatterns, ...manualPatterns],
    [manualPatterns],
  )

  const published = useMemo(
    () => patterns.filter((pattern) => pattern.status === 'published'),
    [patterns],
  )

  const getBySlug = useCallback(
    (slug: string) => patterns.find((pattern) => pattern.slug === slug),
    [patterns],
  )

  const addPattern = useCallback((draft: PatternDraft) => {
    const next = createPatternFromDraft(
      draft,
      [...seedPatterns, ...loadStoredPatterns()].map((p) => p.slug),
    )
    setManualPatterns((current) => [...current, next])
    return next
  }, [])

  const value = useMemo(
    () => ({ patterns, getBySlug, published, addPattern }),
    [patterns, getBySlug, published, addPattern],
  )

  return (
    <PatternContext.Provider value={value}>{children}</PatternContext.Provider>
  )
}

export function usePatterns(): PatternStore {
  const store = useContext(PatternContext)
  if (!store) {
    throw new Error('usePatterns must be used within PatternProvider')
  }
  return store
}
