export type StitchKind =
  | 'ch'
  | 'slst'
  | 'sc'
  | 'hdc'
  | 'dc'
  | 'tr'
  | 'mr'

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
}

export const STITCH_PALETTE: StitchPaletteItem[] = [
  { kind: 'mr', abbr: 'mr', name: 'Magic ring', symbol: '○' },
  { kind: 'ch', abbr: 'ch', name: 'Chain', symbol: '⚬' },
  { kind: 'slst', abbr: 'sl st', name: 'Slip stitch', symbol: '·' },
  { kind: 'sc', abbr: 'sc', name: 'Single crochet', symbol: '×' },
  { kind: 'hdc', abbr: 'hdc', name: 'Half double', symbol: 'T' },
  { kind: 'dc', abbr: 'dc', name: 'Double crochet', symbol: '✝' },
  { kind: 'tr', abbr: 'tr', name: 'Treble', symbol: '╪' },
]

export function emptyStitchGraph(): StitchGraph {
  return { stitches: [], nextLabel: 1 }
}

export function stitchAbbr(kind: StitchKind): string {
  return STITCH_PALETTE.find((item) => item.kind === kind)?.abbr ?? kind
}

export function stitchName(kind: StitchKind): string {
  return STITCH_PALETTE.find((item) => item.kind === kind)?.name ?? kind
}
