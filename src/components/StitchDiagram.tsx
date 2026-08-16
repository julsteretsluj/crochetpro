import { useMemo } from 'react'
import { STITCH_PALETTE, stitchAbbr, type StitchGraph } from '../types/stitch'
import './StitchDiagram.css'

type StitchDiagramProps = {
  graph: StitchGraph
  title?: string
}

export function StitchDiagram({ graph, title = 'Stitch diagram' }: StitchDiagramProps) {
  const bounds = useMemo(() => {
    if (graph.stitches.length === 0) {
      return { width: 480, height: 200 }
    }
    const maxX = Math.max(...graph.stitches.map((s) => s.x))
    const maxY = Math.max(...graph.stitches.map((s) => s.y))
    return {
      width: Math.max(480, maxX + 72),
      height: Math.max(200, maxY + 72),
    }
  }, [graph.stitches])

  const byId = useMemo(
    () => new Map(graph.stitches.map((stitch) => [stitch.id, stitch])),
    [graph.stitches],
  )

  if (graph.stitches.length === 0) return null

  return (
    <div className="stitch-diagram">
      <svg
        viewBox={`0 0 ${bounds.width} ${bounds.height}`}
        width="100%"
        role="img"
        aria-label={title}
      >
        {graph.stitches.flatMap((stitch) =>
          stitch.connectedTo.map((targetId) => {
            const target = byId.get(targetId)
            if (!target) return null
            return (
              <line
                key={`${stitch.id}-${targetId}`}
                className="stitch-diagram__link"
                x1={target.x}
                y1={target.y}
                x2={stitch.x}
                y2={stitch.y}
              />
            )
          }),
        )}

        {graph.stitches.map((stitch) => {
          const item = STITCH_PALETTE.find((p) => p.kind === stitch.kind)
          return (
            <g
              key={stitch.id}
              className="stitch-diagram__node"
              transform={`translate(${stitch.x} ${stitch.y})`}
            >
              <title>{`${stitchAbbr(stitch.kind)} ${stitch.label}`}</title>
              <circle r={20} className="stitch-diagram__disk" />
              <text className="stitch-diagram__symbol" textAnchor="middle" dy="-2">
                {item?.symbol ?? '·'}
              </text>
              <text className="stitch-diagram__label" textAnchor="middle" dy="13">
                {stitch.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
