import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  groupStitchesIntoRows,
  loadProgress,
  saveProgress,
} from '../lib/crochetProgress'
import { fetchCloudProgress, saveCloudProgress } from '../lib/patternApi'
import { stitchAbbr, stitchName, type StitchGraph } from '../types/stitch'
import './CrochetProgress.css'

type CrochetProgressProps = {
  patternId: string
  graph: StitchGraph
}

export function CrochetProgress({ patternId, graph }: CrochetProgressProps) {
  const { user } = useAuth()
  const rows = useMemo(() => groupStitchesIntoRows(graph), [graph])
  const stitchIds = useMemo(
    () => new Set(graph.stitches.map((stitch) => stitch.id)),
    [graph.stitches],
  )

  const [completed, setCompleted] = useState<Set<string>>(() => {
    const saved = loadProgress(patternId).filter((id) => stitchIds.has(id))
    return new Set(saved)
  })
  const [progressReady, setProgressReady] = useState(!user)
  const skipNextCloudSave = useRef(true)

  useEffect(() => {
    let cancelled = false

    async function hydrate() {
      const local = loadProgress(patternId).filter((id) => stitchIds.has(id))

      if (!user) {
        setCompleted(new Set(local))
        setProgressReady(true)
        skipNextCloudSave.current = true
        return
      }

      setProgressReady(false)
      try {
        const cloud = await fetchCloudProgress(user.id, patternId)
        if (cancelled) return
        const merged = new Set([
          ...local,
          ...cloud.filter((id) => stitchIds.has(id)),
        ])
        setCompleted(merged)
        skipNextCloudSave.current = true
      } catch {
        if (!cancelled) setCompleted(new Set(local))
      } finally {
        if (!cancelled) setProgressReady(true)
      }
    }

    void hydrate()
    return () => {
      cancelled = true
    }
  }, [patternId, stitchIds, user])

  useEffect(() => {
    if (!progressReady) return
    const ids = [...completed]
    saveProgress(patternId, ids)

    if (!user) return
    if (skipNextCloudSave.current) {
      skipNextCloudSave.current = false
      return
    }

    const timer = window.setTimeout(() => {
      void saveCloudProgress(user.id, patternId, ids).catch(() => {
        // Keep local progress if cloud save fails.
      })
    }, 400)

    return () => window.clearTimeout(timer)
  }, [completed, patternId, progressReady, user])

  const activeRowIndex = useMemo(() => {
    const firstOpen = rows.findIndex((row) =>
      row.stitches.some((stitch) => !completed.has(stitch.id)),
    )
    return firstOpen === -1 ? rows.length - 1 : firstOpen
  }, [rows, completed])

  const total = graph.stitches.length
  const done = [...completed].filter((id) => stitchIds.has(id)).length

  function toggleStitch(id: string) {
    setCompleted((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleRow(stitchIdsInRow: string[], markDone: boolean) {
    setCompleted((current) => {
      const next = new Set(current)
      for (const id of stitchIdsInRow) {
        if (markDone) next.add(id)
        else next.delete(id)
      }
      return next
    })
  }

  function resetProgress() {
    setCompleted(new Set())
  }

  if (rows.length === 0) return null

  return (
    <section className="crochet-progress" aria-label="Crochet row by row">
      <div className="crochet-progress__header">
        <div>
          <h2>Crochet row by row</h2>
          <p>
            Work one row at a time and tick each stitch as you finish it.
            {user
              ? ' Progress syncs to your account.'
              : ' '}
            {!user ? (
              <>
                {' '}
                <Link to="/account">Sign in</Link> to sync across devices.
              </>
            ) : null}
          </p>
        </div>
        <div className="crochet-progress__stats">
          <p>
            {done} / {total} stitches
          </p>
          <div
            className="crochet-progress__bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={done}
          >
            <span style={{ width: `${total === 0 ? 0 : (done / total) * 100}%` }} />
          </div>
          <button type="button" className="btn btn--ghost" onClick={resetProgress}>
            Reset ticks
          </button>
        </div>
      </div>

      <div className="crochet-progress__rows">
        {rows.map((row, index) => {
          const rowDone = row.stitches.every((stitch) => completed.has(stitch.id))
          const isActive = index === activeRowIndex && !rowDone
          const isUpcoming = index > activeRowIndex

          return (
            <article
              key={row.id}
              className={[
                'crochet-row',
                isActive ? 'crochet-row--active' : '',
                rowDone ? 'crochet-row--done' : '',
                isUpcoming ? 'crochet-row--upcoming' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <header className="crochet-row__head">
                <div>
                  <p className="crochet-row__label">
                    Row {row.index}
                    {isActive ? ' · current' : ''}
                    {rowDone ? ' · done' : ''}
                  </p>
                  <p className="crochet-row__count">
                    {row.stitches.length} stitch
                    {row.stitches.length === 1 ? '' : 'es'}
                  </p>
                </div>
                <button
                  type="button"
                  className="crochet-row__toggle-all"
                  onClick={() =>
                    toggleRow(
                      row.stitches.map((s) => s.id),
                      !rowDone,
                    )
                  }
                >
                  {rowDone ? 'Untick row' : 'Tick whole row'}
                </button>
              </header>

              <ul className="crochet-row__stitches">
                {row.stitches.map((stitch) => {
                  const checked = completed.has(stitch.id)
                  const targets =
                    stitch.connectedTo.length > 0
                      ? stitch.connectedTo
                          .map(
                            (id) =>
                              graph.stitches.find((item) => item.id === id)?.label,
                          )
                          .filter((n): n is number => typeof n === 'number')
                      : []

                  return (
                    <li key={stitch.id}>
                      <label
                        className={
                          checked
                            ? 'crochet-stitch crochet-stitch--done'
                            : 'crochet-stitch'
                        }
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleStitch(stitch.id)}
                        />
                        <span className="crochet-stitch__mark" aria-hidden="true" />
                        <span className="crochet-stitch__body">
                          <strong>
                            #{stitch.label} {stitchAbbr(stitch.kind)}
                          </strong>
                          <em>{stitchName(stitch.kind)}</em>
                          {targets.length > 0 ? (
                            <small>into {targets.join(', ')}</small>
                          ) : (
                            <small>foundation</small>
                          )}
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </article>
          )
        })}
      </div>
    </section>
  )
}
