import { useMemo, useState } from 'react'
import { centeredViewBox, viewBoxToString } from '../lib/canvasView'
import {
  canPlaceSlipStitch,
  describePlacement,
  graphToAbbreviationLines,
  graphToInstructions,
  placeStitches,
  removeStitches,
} from '../lib/stitchGraph'
import {
  STITCH_PALETTE,
  emptyStitchGraph,
  stitchAbbr,
  type StitchGraph,
  type StitchKind,
} from '../types/stitch'
import './StitchBuilder.css'

type StitchBuilderProps = {
  value: StitchGraph
  onChange: (graph: StitchGraph) => void
}

export function StitchBuilder({ value, onChange }: StitchBuilderProps) {
  const [kind, setKind] = useState<StitchKind>('slknot')
  const [count, setCount] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const starters = useMemo(
    () => STITCH_PALETTE.filter((item) => item.starter),
    [],
  )
  const stitches = useMemo(
    () => STITCH_PALETTE.filter((item) => !item.starter),
    [],
  )

  const viewBox = useMemo(
    () =>
      viewBoxToString(
        centeredViewBox(value.stitches, selectedIds, {
          minWidth: 560,
          minHeight: 300,
          padding: 72,
        }),
      ),
    [value.stitches, selectedIds],
  )

  const byId = useMemo(
    () => new Map(value.stitches.map((stitch) => [stitch.id, stitch])),
    [value.stitches],
  )

  const placeCount = kind === 'slknot' || kind === 'slst' ? 1 : count
  const slstStart = kind === 'slst' ? selectedIds[0] : undefined
  const slstEnd = kind === 'slst' ? selectedIds[1] : undefined
  const preview = describePlacement(kind, placeCount, selectedIds.length, {
    start: slstStart ? byId.get(slstStart)?.label : undefined,
    end: slstEnd ? byId.get(slstEnd)?.label : undefined,
  })
  const liveInstructions = graphToInstructions(value)
  const canvasEmpty = value.stitches.length === 0
  const placeDisabled = kind === 'slst' ? !canPlaceSlipStitch(selectedIds) : false

  function selectKind(next: StitchKind) {
    setKind(next)
    if (next === 'slknot' || next === 'slst') setCount(1)
    if (next === 'slst') setSelectedIds([])
  }

  function toggleSelect(id: string) {
    if (kind === 'slst') {
      setSelectedIds((current) => {
        if (current[0] === id) return current.slice(1)
        if (current[1] === id) return [current[0]]
        if (current.length === 0) return [id]
        if (current.length === 1) return [current[0], id]
        return [current[0], id]
      })
      return
    }

    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  function handlePlace() {
    if (kind === 'slst' && !canPlaceSlipStitch(selectedIds)) return

    const next = placeStitches(value, kind, placeCount, selectedIds)
    onChange(next)

    if (kind === 'slst') {
      const added = next.stitches[next.stitches.length - 1]
      setSelectedIds(added ? [added.id] : [])
      return
    }

    if (selectedIds.length === 0) {
      const added = next.stitches.slice(value.stitches.length)
      setSelectedIds(added.map((s) => s.id))
    }
    if (kind === 'slknot' || kind === 'mr') {
      setKind('sc')
      setCount(1)
    }
  }

  function handleDeleteSelected() {
    if (selectedIds.length === 0) return
    onChange(removeStitches(value, selectedIds))
    setSelectedIds([])
  }

  function handleClear() {
    onChange(emptyStitchGraph())
    setSelectedIds([])
    setKind('slknot')
    setCount(1)
  }

  function renderChip(item: (typeof STITCH_PALETTE)[number]) {
    return (
      <button
        key={item.kind}
        type="button"
        role="option"
        aria-selected={kind === item.kind}
        className={
          kind === item.kind
            ? 'stitch-chip stitch-chip--active'
            : 'stitch-chip'
        }
        onClick={() => selectKind(item.kind)}
      >
        <span className="stitch-chip__symbol" aria-hidden="true">
          {item.symbol}
        </span>
        <span className="stitch-chip__abbr">{item.abbr}</span>
        <span className="stitch-chip__name">{item.name}</span>
      </button>
    )
  }

  function roleForStitch(id: string): 'start' | 'end' | null {
    if (kind !== 'slst') return null
    if (id === slstStart) return 'start'
    if (id === slstEnd) return 'end'
    return null
  }

  return (
    <section className="stitch-builder" aria-label="Stitch builder">
      <div className="stitch-builder__intro">
        <h2>Build with stitches</h2>
        <p>
          Start with a slip knot, magic ring, or chain. Slip stitches need a
          start and an end stitch.
        </p>
      </div>

      <div className="stitch-builder__group">
        <p className="stitch-builder__group-label">Start with</p>
        <div
          className="stitch-builder__palette"
          role="listbox"
          aria-label="Starting options"
        >
          {starters.map(renderChip)}
        </div>
      </div>

      <div className="stitch-builder__group">
        <p className="stitch-builder__group-label">Stitches</p>
        <div
          className="stitch-builder__palette"
          role="listbox"
          aria-label="Stitch types"
        >
          {stitches.map(renderChip)}
        </div>
      </div>

      <div className="stitch-builder__controls">
        <label className="stitch-builder__count">
          <span>Number</span>
          <input
            type="number"
            min={1}
            max={48}
            value={placeCount}
            disabled={kind === 'slknot' || kind === 'slst'}
            onChange={(e) => setCount(Number(e.target.value) || 1)}
          />
        </label>

        {kind === 'slst' ? (
          <div className="stitch-builder__endpoints" aria-live="polite">
            <span className={slstStart ? 'is-set' : ''}>
              Start {slstStart ? `#${byId.get(slstStart)?.label}` : '—'}
            </span>
            <span aria-hidden="true">→</span>
            <span className={slstEnd ? 'is-set' : ''}>
              End {slstEnd ? `#${byId.get(slstEnd)?.label}` : '—'}
            </span>
          </div>
        ) : null}

        <p className="stitch-builder__preview">{preview}</p>

        <div className="stitch-builder__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={handlePlace}
            disabled={placeDisabled}
          >
            {kind === 'slst'
              ? 'Place slip stitch'
              : `Place ${placeCount} ${stitchAbbr(kind)}`}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => setSelectedIds([])}
            disabled={selectedIds.length === 0}
          >
            Clear selection
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
          >
            Delete selected
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={handleClear}
            disabled={canvasEmpty}
          >
            Reset canvas
          </button>
        </div>
      </div>

      <div className="stitch-builder__canvas-wrap">
        {canvasEmpty ? (
          <p className="stitch-builder__empty">
            Empty canvas — start with a slip knot, magic ring, or chain.
          </p>
        ) : null}
        <svg
          className="stitch-builder__canvas"
          viewBox={viewBox}
          width="100%"
          height="300"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Stitch canvas. Click stitches to select connection targets."
        >
          {value.stitches.flatMap((stitch) =>
            stitch.connectedTo.map((targetId) => {
              const target = byId.get(targetId)
              if (!target) return null
              return (
                <line
                  key={`${stitch.id}-${targetId}`}
                  className="stitch-builder__link"
                  x1={target.x}
                  y1={target.y}
                  x2={stitch.x}
                  y2={stitch.y}
                />
              )
            }),
          )}

          {kind === 'slst' && slstStart && slstEnd ? (
            <line
              className="stitch-builder__link stitch-builder__link--preview"
              x1={byId.get(slstStart)?.x ?? 0}
              y1={byId.get(slstStart)?.y ?? 0}
              x2={byId.get(slstEnd)?.x ?? 0}
              y2={byId.get(slstEnd)?.y ?? 0}
            />
          ) : null}

          {value.stitches.map((stitch) => {
            const selected = selectedIds.includes(stitch.id)
            const role = roleForStitch(stitch.id)
            const item = STITCH_PALETTE.find((p) => p.kind === stitch.kind)
            return (
              <g
                key={stitch.id}
                className={[
                  'stitch-node',
                  selected ? 'stitch-node--selected' : '',
                  role === 'start' ? 'stitch-node--start' : '',
                  role === 'end' ? 'stitch-node--end' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                transform={`translate(${stitch.x} ${stitch.y})`}
                onClick={() => toggleSelect(stitch.id)}
                role="button"
                tabIndex={0}
                aria-pressed={selected}
                aria-label={`${stitchAbbr(stitch.kind)} ${stitch.label}${
                  role ? `, ${role}` : ''
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleSelect(stitch.id)
                  }
                }}
              >
                <circle r={22} className="stitch-node__disk" />
                <text className="stitch-node__symbol" textAnchor="middle" dy="-2">
                  {item?.symbol ?? '·'}
                </text>
                <text className="stitch-node__label" textAnchor="middle" dy="14">
                  {role === 'start' ? 'S' : role === 'end' ? 'E' : stitch.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {liveInstructions.length > 0 ? (
        <div className="stitch-builder__readout">
          <h3>Generated steps</h3>
          <ol>
            {liveInstructions.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
          <p className="stitch-builder__abbr-note">
            Abbreviations used:{' '}
            {graphToAbbreviationLines(value).join(' · ') || '—'}
          </p>
        </div>
      ) : null}
    </section>
  )
}
