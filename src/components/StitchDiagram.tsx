import { useMemo } from 'react'
import { centeredViewBox, viewBoxToString } from '../lib/canvasView'
import { STITCH_PALETTE, stitchAbbr, type StitchGraph } from '../types/stitch'
import './StitchDiagram.css'

type StitchDiagramProps = {
  graph: StitchGraph
  title?: string
}

export function StitchDiagram({ graph, title = 'Stitch diagram' }: StitchDiagramProps) {
  const viewBox = useMemo(
    () =>
      viewBoxToString(
        centeredViewBox(graph.stitches, [], {
          minWidth: 480,
          minHeight: 220,
          padding: 64,
        }),
      ),
    [graph.stitches],
  )

  const byId = useMemo(
    () => new Map(graph.stitches.map((stitch) => [stitch.id, stitch])),
    [graph.stitches],
  )

  if (graph.stitches.length === 0) return null

  return (
    <div className="stitch-diagram">
      <svg
        viewBox={viewBox}
        width="100%"
        height="260"
        preserveAspectRatio="xMidYMid meet"
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
