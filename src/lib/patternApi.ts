import type { Pattern } from '../types/pattern'
import { supabase } from './supabase'

type PatternRow = {
  id: string
  slug: string
  data: Pattern
}

function withUniqueSlugs(
  patterns: Pattern[],
  reservedSlugs: string[] = [],
): Pattern[] {
  const seen = new Set(reservedSlugs)
  return patterns.map((pattern) => {
    let slug = pattern.slug
    if (seen.has(slug)) {
      slug = `${slug}-${pattern.id.slice(0, 8)}`
    }
    seen.add(slug)
    return slug === pattern.slug ? pattern : { ...pattern, slug }
  })
}

export async function fetchCloudPatterns(userId: string): Promise<Pattern[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('patterns')
    .select('id, slug, data')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error

  return ((data ?? []) as PatternRow[]).map((row) => ({
    ...row.data,
    id: row.id,
    slug: row.slug,
  }))
}

export async function upsertCloudPattern(
  userId: string,
  pattern: Pattern,
): Promise<void> {
  if (!supabase) return

  const { error } = await supabase.from('patterns').upsert(
    {
      id: pattern.id,
      user_id: userId,
      slug: pattern.slug,
      data: pattern,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )

  if (error) throw error
}

export async function upsertCloudPatterns(
  userId: string,
  patterns: Pattern[],
  reservedSlugs: string[] = [],
): Promise<void> {
  if (!supabase || patterns.length === 0) return

  const unique = withUniqueSlugs(patterns, reservedSlugs)
  const rows = unique.map((pattern) => ({
    id: pattern.id,
    user_id: userId,
    slug: pattern.slug,
    data: pattern,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from('patterns').upsert(rows, {
    onConflict: 'id',
  })

  if (error) throw error
}

export async function fetchCloudProgress(
  userId: string,
  patternId: string,
): Promise<string[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('pattern_progress')
    .select('completed_ids')
    .eq('user_id', userId)
    .eq('pattern_id', patternId)
    .maybeSingle()

  if (error) throw error
  const ids = data?.completed_ids
  return Array.isArray(ids) ? (ids as string[]) : []
}

export async function saveCloudProgress(
  userId: string,
  patternId: string,
  completedIds: string[],
): Promise<void> {
  if (!supabase) return

  const { error } = await supabase.from('pattern_progress').upsert(
    {
      pattern_id: patternId,
      user_id: userId,
      completed_ids: completedIds,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'pattern_id,user_id' },
  )

  if (error) throw error
}
