import type { StitchGraph } from './stitch'

export type PatternDifficulty = 'beginner' | 'easy' | 'intermediate' | 'advanced'

export type Pattern = {
  id: string
  slug: string
  title: string
  summary: string
  difficulty: PatternDifficulty
  yarnWeight?: string
  hookSize?: string
  estimatedTime?: string
  tags: string[]
  materials: string[]
  abbreviations: { abbr: string; meaning: string }[]
  instructions: string[]
  notes?: string
  imageUrl?: string
  /** Full YouTube URL or share link — rendered as an embed on the pattern page */
  youtubeUrl?: string
  /** Visual stitch graph from the manual stitch builder */
  stitchGraph?: StitchGraph
  status: 'published' | 'awaiting_spec'
}

export type PatternDraft = {
  title: string
  summary: string
  difficulty: PatternDifficulty
  yarnWeight: string
  hookSize: string
  estimatedTime: string
  tags: string
  materials: string
  abbreviations: string
  instructions: string
  notes: string
  youtubeUrl: string
  stitchGraph: StitchGraph
}
