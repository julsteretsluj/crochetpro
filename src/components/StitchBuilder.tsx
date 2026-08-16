import { useMemo, useState } from 'react'
import {
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
  const [kind, setKind] = useState<StitchKind>('sc')
  const [count, setCount] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const bounds = useMemo(() => {
    if (value.stitches.length === 0) {
      return { width: 640, height: 280 }
    }
    const maxX = Math.max(...value.stitches.map((s) => s.x))
    const maxY = Math.max(...value.stitches.map((s) => s.y))
    return {
      width: Math.max(640, maxX + 72),
      height: Math.max(280, maxY + 72),
    }
  }, [value.stitches])

  const byId = useMemo(
    () => new Map(value.stitches.map((stitch) => [stitch.id, stitch])),
    [value.stitches],
  )

  const preview = describePlacement(kind, count, selectedIds.length)
  const liveInstructions = graphToInstructions(value)

  function toggleSelect(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  function handlePlace() {
    const next = placeStitches(value, kind, count, selectedIds)
    onChange(next)
    // keep selection on targets so you can stack more into them,
    // unless foundation placement with no selection — select the new run
    if (selectedIds.length === 0) {
      const added = next.stitches.slice(value.stitches.length)
      setSelectedIds(added.map((s) => s.id))
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
  }

  return (
    <section className="stitch-builder" aria-label="Stitch builder">
      <div className="stitch-builder__intro">
        <h2>Build with stitches</h2>
        <p>
          Click a stitch type, set how many, select stitches on the canvas, then
          place — new stitches connect to your selection.
        </p>
      </div>

      <div className="stitch-builder__palette" role="listbox" aria-label="Stitch types">
        {STITCH_PALETTE.map((item) => (
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
            onClick={() => setKind(item.kind)}
          >
            <span className="stitch-chip__symbol" aria-hidden="true">
              {item.symbol}
            </span>
            <span className="stitch-chip__abbr">{item.abbr}</span>
            <span className="stitch-chip__name">{item.name}</span>
          </button>
        ))}
      </div>

      <div className="stitch-builder__controls">
        <label className="stitch-builder__count">
          <span>Number</span>
          <input
            type="number"
            min={1}
            max={48}
            value={count}
            onChange={(e) => setCount(Number(e.target.value) || 1)}
          />
        </label>

        <p className="stitch-builder__preview">{preview}</p>

        <div className="stitch-builder__actions">
          <button type="button" className="btn btn--primary" onClick={handlePlace}>
            Place {count} {stitchAbbr(kind)}
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
            disabled={value.stitches.length === 0}
          >
            Reset canvas
          </button>
        </div>
      </div>

      <div className="stitch-builder__canvas-wrap">
        {value.stitches.length === 0 ? (
          <p className="stitch-builder__empty">
            No stitches yet — pick a type and place a foundation chain or magic
            ring to begin.
          </p>
        ) : null}
        <svg
          className="stitch-builder__canvas"
          viewBox={`0 0 ${bounds.width} ${bounds.height}`}
          width="100%"
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

          {value.stitches.map((stitch) => {
            const selected = selectedIds.includes(stitch.id)
            const item = STITCH_PALETTE.find((p) => p.kind === stitch.kind)
            return (
              <g
                key={stitch.id}
                className={
                  selected
                    ? 'stitch-node stitch-node--selected'
                    : 'stitch-node'
                }
                transform={`translate(${stitch.x} ${stitch.y})`}
                onClick={() => toggleSelect(stitch.id)}
                role="button"
                tabIndex={0}
                aria-pressed={selected}
                aria-label={`${stitchAbbr(stitch.kind)} ${stitch.label}`}
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
                  {stitch.label}
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
