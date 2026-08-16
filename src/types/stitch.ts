export type StitchKind =
  | 'slknot'
  | 'mr'
  | 'ch'
  | 'slst'
  | 'sc'
  | 'hdc'
  | 'dc'
  | 'tr'

export type StitchNode = {
  id: string
  kind: StitchKind
  /** Stitches this one is worked into / attached to */
  connectedTo: string[]
  x: number
  y: number
  label: number
}

export type StitchGraph = {
  stitches: StitchNode[]
  nextLabel: number
}

export type StitchPaletteItem = {
  kind: StitchKind
  abbr: string
  name: string
  symbol: string
  /** Foundation starts — shown first when the canvas is empty */
  starter?: boolean
}

export const STITCH_PALETTE: StitchPaletteItem[] = [
  { kind: 'slknot', abbr: 'sl knot', name: 'Slip knot', symbol: '◉', starter: true },
  { kind: 'mr', abbr: 'mr', name: 'Magic ring', symbol: '○', starter: true },
  { kind: 'ch', abbr: 'ch', name: 'Chain', symbol: '⚬', starter: true },
  { kind: 'slst', abbr: 'sl st', name: 'Slip stitch', symbol: '·' },
  { kind: 'sc', abbr: 'sc', name: 'Single crochet', symbol: '×' },
  { kind: 'hdc', abbr: 'hdc', name: 'Half double', symbol: 'T' },
  { kind: 'dc', abbr: 'dc', name: 'Double crochet', symbol: '✝' },
  { kind: 'tr', abbr: 'tr', name: 'Treble', symbol: '╪' },
]

export const STARTER_KINDS: StitchKind[] = STITCH_PALETTE.filter(
  (item) => item.starter,
).map((item) => item.kind)

export function emptyStitchGraph(): StitchGraph {
  return { stitches: [], nextLabel: 1 }
}

export function stitchAbbr(kind: StitchKind): string {
  return STITCH_PALETTE.find((item) => item.kind === kind)?.abbr ?? kind
}

export function stitchName(kind: StitchKind): string {
  return STITCH_PALETTE.find((item) => item.kind === kind)?.name ?? kind
}
