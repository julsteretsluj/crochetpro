import type { StitchNode } from '../types/stitch'
import { groupStitchesIntoRows } from './crochetProgress'

export type CanvasViewBox = {
  x: number
  y: number
  width: number
  height: number
}

type ViewOptions = {
  minWidth?: number
  minHeight?: number
  padding?: number
}

const DEFAULTS = {
  minWidth: 520,
  minHeight: 280,
  padding: 64,
}

/** Bounding box for a set of stitch nodes. */
export function stitchBounds(stitches: StitchNode[], padding = 0) {
  if (stitches.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  }

  const xs = stitches.map((s) => s.x)
  const ys = stitches.map((s) => s.y)
  return {
    minX: Math.min(...xs) - padding,
    minY: Math.min(...ys) - padding,
    maxX: Math.max(...xs) + padding,
    maxY: Math.max(...ys) + padding,
  }
}

/**
 * Prefer selected stitches; otherwise the latest (working) row;
 * otherwise the whole pattern.
 */
export function resolveFocusStitches(
  stitches: StitchNode[],
  selectedIds: string[] = [],
): StitchNode[] {
  if (stitches.length === 0) return []

  if (selectedIds.length > 0) {
    const selected = stitches.filter((s) => selectedIds.includes(s.id))
    if (selected.length > 0) return selected
  }

  const rows = groupStitchesIntoRows({ stitches, nextLabel: 0 })
  return rows[rows.length - 1]?.stitches ?? stitches
}

/** Include focus stitches plus anything directly connected to them. */
function withNeighbors(stitches: StitchNode[], focus: StitchNode[]): StitchNode[] {
  const focusIds = new Set(focus.map((s) => s.id))
  const keep = new Set(focusIds)

  for (const stitch of stitches) {
    if (focusIds.has(stitch.id)) {
      for (const id of stitch.connectedTo) keep.add(id)
    }
    if (stitch.connectedTo.some((id) => focusIds.has(id))) {
      keep.add(stitch.id)
    }
  }

  return stitches.filter((s) => keep.has(s.id))
}

/**
 * Build a viewBox centered on the working stitches, padded to a stable
 * minimum size so the canvas doesn’t jump too tightly.
 */
export function centeredViewBox(
  stitches: StitchNode[],
  selectedIds: string[] = [],
  options: ViewOptions = {},
): CanvasViewBox {
  const minWidth = options.minWidth ?? DEFAULTS.minWidth
  const minHeight = options.minHeight ?? DEFAULTS.minHeight
  const padding = options.padding ?? DEFAULTS.padding

  if (stitches.length === 0) {
    return { x: 0, y: 0, width: minWidth, height: minHeight }
  }

  const focus = resolveFocusStitches(stitches, selectedIds)
  const subject = withNeighbors(stitches, focus)
  const box = stitchBounds(subject, padding)

  const width = Math.max(minWidth, box.maxX - box.minX)
  const height = Math.max(minHeight, box.maxY - box.minY)
  const cx = (box.minX + box.maxX) / 2
  const cy = (box.minY + box.maxY) / 2

  return {
    x: cx - width / 2,
    y: cy - height / 2,
    width,
    height,
  }
}

export function viewBoxToString(view: CanvasViewBox): string {
  return `${view.x} ${view.y} ${view.width} ${view.height}`
}
