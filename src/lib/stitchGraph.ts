import type { StitchGraph, StitchKind, StitchNode } from '../types/stitch'
import { stitchAbbr } from '../types/stitch'

const COL_GAP = 56
const ROW_GAP = 64
const START_X = 48
const START_Y = 56

function avg(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, n) => sum + n, 0) / values.length
}

function layoutTargets(graph: StitchGraph, targetIds: string[]): StitchNode[] {
  return targetIds
    .map((id) => graph.stitches.find((s) => s.id === id))
    .filter((node): node is StitchNode => Boolean(node))
}

/**
 * Decide how new stitches attach to selected targets.
 * - no targets: foundation sequence (each joins the previous)
 * - 1 target: all new stitches into that stitch
 * - count === targets: one-to-one
 * - 1 new + many targets: one stitch into all (decrease)
 * - otherwise: round-robin across targets
 */
export function resolveConnections(
  count: number,
  targetIds: string[],
  previousId: string | null,
): string[][] {
  if (count < 1) return []

  if (targetIds.length === 0) {
    const links: string[][] = []
    for (let i = 0; i < count; i += 1) {
      if (i === 0) {
        links.push(previousId ? [previousId] : [])
      } else {
        links.push(['__prev__'])
      }
    }
    return links
  }

  if (targetIds.length === 1) {
    return Array.from({ length: count }, () => [...targetIds])
  }

  if (count === 1) {
    return [[...targetIds]]
  }

  if (count === targetIds.length) {
    return targetIds.map((id) => [id])
  }

  return Array.from({ length: count }, (_, i) => [targetIds[i % targetIds.length]])
}

export function placeStitches(
  graph: StitchGraph,
  kind: StitchKind,
  count: number,
  selectedIds: string[],
): StitchGraph {
  // Slip knot is a single starting loop
  const requested = kind === 'slknot' ? 1 : count
  const safeCount = Math.max(1, Math.min(48, Math.floor(requested)))
  const targets = layoutTargets(graph, selectedIds)
  const last = graph.stitches[graph.stitches.length - 1] ?? null
  const connectionPlan = resolveConnections(
    safeCount,
    targets.map((t) => t.id),
    last?.id ?? null,
  )

  const baseX =
    targets.length > 0
      ? avg(targets.map((t) => t.x))
      : last
        ? last.x + COL_GAP
        : START_X
  const baseY =
    targets.length > 0
      ? avg(targets.map((t) => t.y)) + ROW_GAP
      : last
        ? last.y
        : START_Y

  const created: StitchNode[] = []
  let nextLabel = graph.nextLabel

  for (let i = 0; i < safeCount; i += 1) {
    const planned = connectionPlan[i] ?? []
    const connectedTo = planned.map((id) => {
      if (id === '__prev__') {
        return created[i - 1]?.id ?? last?.id ?? ''
      }
      return id
    }).filter(Boolean)

    const spread = (i - (safeCount - 1) / 2) * COL_GAP
    const node: StitchNode = {
      id: crypto.randomUUID(),
      kind,
      connectedTo,
      x: targets.length > 0 ? baseX + spread : baseX + i * COL_GAP,
      y: targets.length > 0 ? baseY : baseY,
      label: nextLabel,
    }
    nextLabel += 1
    created.push(node)
  }

  return {
    stitches: [...graph.stitches, ...created],
    nextLabel,
  }
}

export function removeStitches(graph: StitchGraph, ids: string[]): StitchGraph {
  const remove = new Set(ids)
  return {
    ...graph,
    stitches: graph.stitches
      .filter((stitch) => !remove.has(stitch.id))
      .map((stitch) => ({
        ...stitch,
        connectedTo: stitch.connectedTo.filter((id) => !remove.has(id)),
      })),
  }
}

export function describePlacement(
  kind: StitchKind,
  count: number,
  selectedCount: number,
): string {
  const abbr = stitchAbbr(kind)

  if (kind === 'slknot') {
    if (count === 1 && selectedCount === 0) {
      return 'Place a slip knot to start'
    }
    return `Place ${count} slip knot${count === 1 ? '' : 's'}`
  }

  if (kind === 'mr' && selectedCount === 0) {
    return count === 1
      ? 'Place a magic ring to start'
      : `Place ${count} magic rings`
  }

  if (selectedCount === 0) {
    return kind === 'ch'
      ? `Place ${count} ${abbr} as a starting chain`
      : `Place ${count} ${abbr} as a new sequence`
  }
  if (selectedCount === 1) {
    return `Place ${count} ${abbr} into the selected stitch`
  }
  if (count === 1) {
    return `Place 1 ${abbr} into all ${selectedCount} selected stitches`
  }
  if (count === selectedCount) {
    return `Place one ${abbr} into each selected stitch`
  }
  return `Place ${count} ${abbr} across ${selectedCount} selected stitches`
}

export function graphToInstructions(graph: StitchGraph): string[] {
  if (graph.stitches.length === 0) return []

  const byId = new Map(graph.stitches.map((s) => [s.id, s]))
  const lines: string[] = []

  // Group consecutive same-kind stitches that share the same connection signature
  let i = 0
  while (i < graph.stitches.length) {
    const start = graph.stitches[i]
    const sig = connectionSignature(start, byId)
    let j = i + 1
    while (j < graph.stitches.length) {
      const next = graph.stitches[j]
      if (next.kind !== start.kind) break
      if (connectionSignature(next, byId) !== sig) break
      // foundation run: each connects only to previous in group
      if (sig === 'sequence' && next.connectedTo[0] !== graph.stitches[j - 1].id) break
      j += 1
    }

    const count = j - i
    const abbr = stitchAbbr(start.kind)
    const targets = start.connectedTo
      .map((id) => byId.get(id)?.label)
      .filter((n): n is number => typeof n === 'number')

    if (targets.length === 0) {
      lines.push(`${count} ${abbr}`)
    } else if (sig === 'sequence') {
      lines.push(`${count} ${abbr}, joined in sequence`)
    } else if (targets.length === 1) {
      lines.push(
        count === 1
          ? `${abbr} into stitch ${targets[0]}`
          : `${count} ${abbr} into stitch ${targets[0]}`,
      )
    } else {
      lines.push(
        `${count} ${abbr} into stitches ${targets.join(', ')}`,
      )
    }

    i = j
  }

  return lines
}

function connectionSignature(
  stitch: StitchNode,
  byId: Map<string, StitchNode>,
): string {
  if (stitch.connectedTo.length === 0) return 'loose'
  if (stitch.connectedTo.length === 1) {
    const parent = byId.get(stitch.connectedTo[0])
    if (parent && parent.label === stitch.label - 1) return 'sequence'
    return `into:${stitch.connectedTo[0]}`
  }
  return `into:${[...stitch.connectedTo].sort().join('|')}`
}

export function graphToAbbreviationLines(graph: StitchGraph): string[] {
  const used = new Set(graph.stitches.map((s) => s.kind))
  const dictionary: Record<StitchKind, string> = {
    slknot: 'slip knot',
    mr: 'magic ring',
    ch: 'chain',
    slst: 'slip stitch',
    sc: 'single crochet',
    hdc: 'half double crochet',
    dc: 'double crochet',
    tr: 'treble crochet',
  }

  return [...used].map((kind) => `${stitchAbbr(kind)}: ${dictionary[kind]}`)
}
