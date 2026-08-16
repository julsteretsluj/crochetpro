import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  createPatternFromDraft,
  loadStoredPatterns,
  saveStoredPatterns,
  seedPatterns,
  updatePatternFromDraft,
} from '../data/patterns'
import {
  fetchCloudPatterns,
  upsertCloudPattern,
  upsertCloudPatterns,
} from '../lib/patternApi'
import type { Pattern, PatternDraft } from '../types/pattern'
import { useAuth } from './useAuth'

type PatternStore = {
  patterns: Pattern[]
  getBySlug: (slug: string) => Pattern | undefined
  published: Pattern[]
  addPattern: (draft: PatternDraft) => Promise<Pattern>
  updatePattern: (id: string, draft: PatternDraft) => Promise<Pattern>
  syncing: boolean
  cloudEnabled: boolean
  syncError: string | null
  saveLocalToAccount: () => Promise<number>
}

const PatternContext = createContext<PatternStore | null>(null)

function mergeById(local: Pattern[], cloud: Pattern[]): Pattern[] {
  const map = new Map<string, Pattern>()
  for (const pattern of cloud) map.set(pattern.id, pattern)
  for (const pattern of local) {
    if (!map.has(pattern.id)) map.set(pattern.id, pattern)
  }
  return [...map.values()]
}

export function PatternProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [manualPatterns, setManualPatterns] = useState<Pattern[]>(() =>
    loadStoredPatterns(),
  )
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const hydratedUser = useRef<string | null>(null)

  // Always keep a local backup
  useEffect(() => {
    saveStoredPatterns(manualPatterns)
  }, [manualPatterns])

  // Load / merge cloud library when signed in
  useEffect(() => {
    if (!user) {
      hydratedUser.current = null
      setManualPatterns(loadStoredPatterns())
      return
    }

    if (hydratedUser.current === user.id) return
    hydratedUser.current = user.id

    let cancelled = false
    setSyncing(true)
    setSyncError(null)

    ;(async () => {
      try {
        const cloud = await fetchCloudPatterns(user.id)
        if (cancelled) return

        const local = loadStoredPatterns()
        const merged = mergeById(local, cloud)
        setManualPatterns(merged)

        const missingOnCloud = local.filter(
          (pattern) => !cloud.some((item) => item.id === pattern.id),
        )
        if (missingOnCloud.length > 0) {
          await upsertCloudPatterns(
            user.id,
            missingOnCloud,
            cloud.map((pattern) => pattern.slug),
          )
        }
      } catch (error) {
        if (!cancelled) {
          setSyncError(
            error instanceof Error ? error.message : 'Could not sync patterns.',
          )
        }
      } finally {
        if (!cancelled) setSyncing(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user])

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

  const addPattern = useCallback(
    async (draft: PatternDraft) => {
      const next = createPatternFromDraft(
        draft,
        [...seedPatterns, ...manualPatterns].map((p) => p.slug),
      )
      setManualPatterns((current) => [...current, next])

      if (user) {
        try {
          setSyncError(null)
          await upsertCloudPattern(user.id, next)
        } catch (error) {
          setSyncError(
            error instanceof Error
              ? error.message
              : 'Pattern saved locally, but cloud sync failed.',
          )
        }
      }

      return next
    },
    [manualPatterns, user],
  )

  const updatePattern = useCallback(
    async (id: string, draft: PatternDraft) => {
      const existing = manualPatterns.find((pattern) => pattern.id === id)
      if (!existing) {
        throw new Error('Pattern not found.')
      }

      const next = updatePatternFromDraft(existing, draft)
      setManualPatterns((current) =>
        current.map((pattern) => (pattern.id === id ? next : pattern)),
      )

      if (user) {
        try {
          setSyncError(null)
          await upsertCloudPattern(user.id, next)
        } catch (error) {
          setSyncError(
            error instanceof Error
              ? error.message
              : 'Edits saved locally, but cloud sync failed.',
          )
        }
      }

      return next
    },
    [manualPatterns, user],
  )

  const saveLocalToAccount = useCallback(async () => {
    if (!user) throw new Error('Sign in to save patterns to your account.')
    const local = loadStoredPatterns()
    if (local.length === 0) return 0
    await upsertCloudPatterns(user.id, local)
    const cloud = await fetchCloudPatterns(user.id)
    setManualPatterns(mergeById(local, cloud))
    return local.length
  }, [user])

  const value = useMemo(
    () => ({
      patterns,
      getBySlug,
      published,
      addPattern,
      updatePattern,
      syncing,
      cloudEnabled: Boolean(user),
      syncError,
      saveLocalToAccount,
    }),
    [
      patterns,
      getBySlug,
      published,
      addPattern,
      updatePattern,
      syncing,
      user,
      syncError,
      saveLocalToAccount,
    ],
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
