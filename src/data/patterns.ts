import type { Pattern, PatternDraft } from '../types/pattern'
import { emptyStitchGraph } from '../types/stitch'
import {
  graphToAbbreviationLines,
  graphToInstructions,
} from '../lib/stitchGraph'

/** Seed patterns from the repo — still empty until you send specs. */
export const seedPatterns: Pattern[] = []

const STORAGE_KEY = 'crochet-pro-patterns'

export function loadStoredPatterns(): Pattern[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Pattern[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveStoredPatterns(patterns: Pattern[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns))
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function parseAbbreviations(value: string): Pattern['abbreviations'] {
  return splitLines(value).map((line) => {
    const [abbr, ...rest] = line.split(/[:–—-]/)
    const meaning = rest.join(':').trim() || abbr.trim()
    return { abbr: abbr.trim(), meaning }
  })
}

export function createPatternFromDraft(
  draft: PatternDraft,
  existingSlugs: string[],
): Pattern {
  let slug = slugify(draft.title) || `pattern-${Date.now()}`
  if (existingSlugs.includes(slug)) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  return buildPatternFields(draft, {
    id: crypto.randomUUID(),
    slug,
  })
}

export function updatePatternFromDraft(
  existing: Pattern,
  draft: PatternDraft,
): Pattern {
  return buildPatternFields(draft, {
    id: existing.id,
    slug: existing.slug,
  })
}

export function patternToDraft(pattern: Pattern): PatternDraft {
  return {
    title: pattern.title,
    summary: pattern.summary,
    difficulty: pattern.difficulty,
    yarnWeight: pattern.yarnWeight ?? '',
    hookSize: pattern.hookSize ?? '',
    estimatedTime: pattern.estimatedTime ?? '',
    tags: pattern.tags.join(', '),
    materials: pattern.materials.join('\n'),
    abbreviations: pattern.abbreviations
      .map((entry) => `${entry.abbr}: ${entry.meaning}`)
      .join('\n'),
    instructions: pattern.instructions.join('\n'),
    notes: pattern.notes ?? '',
    youtubeUrl: pattern.youtubeUrl ?? '',
    stitchGraph: pattern.stitchGraph
      ? {
          stitches: pattern.stitchGraph.stitches.map((stitch) => ({ ...stitch })),
          nextLabel: pattern.stitchGraph.nextLabel,
        }
      : emptyStitchGraph(),
  }
}

function buildPatternFields(
  draft: PatternDraft,
  identity: { id: string; slug: string },
): Pattern {
  const fromGraph = graphToInstructions(draft.stitchGraph)
  const instructions =
    fromGraph.length > 0 ? fromGraph : splitLines(draft.instructions)

  const fromGraphAbbr = graphToAbbreviationLines(draft.stitchGraph)
  const abbreviations =
    fromGraphAbbr.length > 0
      ? fromGraphAbbr.map((line) => {
          const [abbr, ...rest] = line.split(':')
          return { abbr: abbr.trim(), meaning: rest.join(':').trim() }
        })
      : parseAbbreviations(draft.abbreviations)

  return {
    id: identity.id,
    slug: identity.slug,
    title: draft.title.trim(),
    summary: draft.summary.trim(),
    difficulty: draft.difficulty,
    yarnWeight: draft.yarnWeight.trim() || undefined,
    hookSize: draft.hookSize.trim() || undefined,
    estimatedTime: draft.estimatedTime.trim() || undefined,
    tags: draft.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    materials: splitLines(draft.materials),
    abbreviations,
    instructions,
    notes: draft.notes.trim() || undefined,
    youtubeUrl: draft.youtubeUrl.trim() || undefined,
    stitchGraph:
      draft.stitchGraph.stitches.length > 0 ? draft.stitchGraph : undefined,
    status: 'published',
  }
}

export const emptyDraft: PatternDraft = {
  title: '',
  summary: '',
  difficulty: 'beginner',
  yarnWeight: '',
  hookSize: '',
  estimatedTime: '',
  tags: '',
  materials: '',
  abbreviations: '',
  instructions: '',
  notes: '',
  youtubeUrl: '',
  stitchGraph: emptyStitchGraph(),
}
