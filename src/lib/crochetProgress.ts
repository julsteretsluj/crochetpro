import type { StitchGraph, StitchNode } from '../types/stitch'

export type StitchRow = {
  id: string
  index: number
  y: number
  stitches: StitchNode[]
}

/** Group stitches into crochet rows by vertical band, left-to-right within each row. */
export function groupStitchesIntoRows(graph: StitchGraph): StitchRow[] {
  if (graph.stitches.length === 0) return []

  const sorted = [...graph.stitches].sort((a, b) => {
    if (Math.abs(a.y - b.y) > 20) return a.y - b.y
    return a.x - b.x || a.label - b.label
  })

  const rows: StitchRow[] = []
  for (const stitch of sorted) {
    const current = rows[rows.length - 1]
    if (!current || Math.abs(current.y - stitch.y) > 20) {
      rows.push({
        id: `row-${rows.length + 1}`,
        index: rows.length + 1,
        y: stitch.y,
        stitches: [stitch],
      })
    } else {
      current.stitches.push(stitch)
    }
  }

  return rows.map((row) => ({
    ...row,
    stitches: [...row.stitches].sort((a, b) => a.x - b.x || a.label - b.label),
  }))
}

export function progressStorageKey(patternId: string): string {
  return `crochet-pro-progress:${patternId}`
}

export function loadProgress(patternId: string): string[] {
  try {
    const raw = localStorage.getItem(progressStorageKey(patternId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as string[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveProgress(patternId: string, completedIds: string[]): void {
  localStorage.setItem(progressStorageKey(patternId), JSON.stringify(completedIds))
}
