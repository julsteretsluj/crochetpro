import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { emptyDraft } from '../data/patterns'
import { usePatterns } from '../hooks/usePatterns'
import { getYouTubeEmbedUrl } from '../lib/youtube'
import type { PatternDifficulty, PatternDraft } from '../types/pattern'
import type { StitchGraph } from '../types/stitch'
import { StitchBuilder } from './StitchBuilder'
import { YouTubeEmbed } from './YouTubeEmbed'
import './CreatePatternPage.css'

const difficulties: PatternDifficulty[] = [
  'beginner',
  'easy',
  'intermediate',
  'advanced',
]

export function CreatePatternPage() {
  const navigate = useNavigate()
  const { addPattern } = usePatterns()
  const [draft, setDraft] = useState<PatternDraft>(emptyDraft)
  const [error, setError] = useState<string | null>(null)

  const hasStitchGraph = draft.stitchGraph.stitches.length > 0

  const summaryHint = useMemo(() => {
    if (!hasStitchGraph) return null
    return `${draft.stitchGraph.stitches.length} stitches on the canvas`
  }, [draft.stitchGraph.stitches.length, hasStitchGraph])

  function update<K extends keyof PatternDraft>(key: K, value: PatternDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function handleGraphChange(stitchGraph: StitchGraph) {
    setDraft((current) => ({ ...current, stitchGraph }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!draft.title.trim()) {
      setError('Give the pattern a title.')
      return
    }
    if (!draft.summary.trim()) {
      setError('Add a short summary.')
      return
    }
    if (!hasStitchGraph && !draft.instructions.trim()) {
      setError('Build stitches on the canvas, or write instructions manually.')
      return
    }
    if (draft.youtubeUrl.trim() && !getYouTubeEmbedUrl(draft.youtubeUrl)) {
      setError('That YouTube link doesn’t look valid.')
      return
    }

    const pattern = addPattern(draft)
    navigate(`/library/${pattern.slug}`)
  }

  return (
    <main className="create-pattern">
      <header className="create-pattern__header">
        <p className="create-pattern__eyebrow">Manual creation</p>
        <h1>Add a crochet pattern</h1>
        <p>
          Click a stitch type, set a number, select stitches to connect into,
          then place. You can still add materials and a YouTube walkthrough.
        </p>
      </header>

      <form className="create-pattern__form" onSubmit={handleSubmit} noValidate>
        <div className="create-pattern__grid">
          <label className="field field--wide">
            <span>Title</span>
            <input
              value={draft.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Cozy mug cozy"
              required
            />
          </label>

          <label className="field field--wide">
            <span>Summary</span>
            <textarea
              value={draft.summary}
              onChange={(e) => update('summary', e.target.value)}
              placeholder="A quick weekend project for leftover DK yarn."
              rows={3}
              required
            />
            {summaryHint ? (
              <em className="field__hint">{summaryHint}</em>
            ) : null}
          </label>

          <label className="field">
            <span>Difficulty</span>
            <select
              value={draft.difficulty}
              onChange={(e) =>
                update('difficulty', e.target.value as PatternDifficulty)
              }
            >
              {difficulties.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Estimated time</span>
            <input
              value={draft.estimatedTime}
              onChange={(e) => update('estimatedTime', e.target.value)}
              placeholder="2–3 hours"
            />
          </label>

          <label className="field">
            <span>Yarn weight</span>
            <input
              value={draft.yarnWeight}
              onChange={(e) => update('yarnWeight', e.target.value)}
              placeholder="DK / light worsted"
            />
          </label>

          <label className="field">
            <span>Hook size</span>
            <input
              value={draft.hookSize}
              onChange={(e) => update('hookSize', e.target.value)}
              placeholder="4.0 mm (G)"
            />
          </label>

          <StitchBuilder value={draft.stitchGraph} onChange={handleGraphChange} />

          <label className="field field--wide">
            <span>YouTube URL</span>
            <input
              type="url"
              value={draft.youtubeUrl}
              onChange={(e) => update('youtubeUrl', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=…"
            />
            <em className="field__hint">
              Optional. Paste a watch, share, or shorts link — it embeds on the
              pattern page.
            </em>
          </label>

          {draft.youtubeUrl.trim() && getYouTubeEmbedUrl(draft.youtubeUrl) ? (
            <div className="create-pattern__preview field--wide">
              <p className="create-pattern__preview-label">Video preview</p>
              <YouTubeEmbed
                url={draft.youtubeUrl}
                title={`${draft.title || 'Pattern'} preview`}
              />
            </div>
          ) : null}

          <label className="field field--wide">
            <span>Tags</span>
            <input
              value={draft.tags}
              onChange={(e) => update('tags', e.target.value)}
              placeholder="home, scrap yarn, beginner (comma-separated)"
            />
          </label>

          <label className="field field--wide">
            <span>Materials</span>
            <textarea
              value={draft.materials}
              onChange={(e) => update('materials', e.target.value)}
              placeholder={
                'One item per line\n50g DK cotton\n4.0 mm hook\nYarn needle'
              }
              rows={4}
            />
          </label>

          {!hasStitchGraph ? (
            <>
              <label className="field field--wide">
                <span>Abbreviations</span>
                <textarea
                  value={draft.abbreviations}
                  onChange={(e) => update('abbreviations', e.target.value)}
                  placeholder={
                    'ch: chain\nsc: single crochet\ndc: double crochet'
                  }
                  rows={4}
                />
                <em className="field__hint">
                  Only needed if you skip the stitch canvas
                </em>
              </label>

              <label className="field field--wide">
                <span>Instructions</span>
                <textarea
                  value={draft.instructions}
                  onChange={(e) => update('instructions', e.target.value)}
                  placeholder={
                    'One step per line\nR1: ch 30, join with sl st\nR2: ch 1, sc in each st around'
                  }
                  rows={8}
                />
              </label>
            </>
          ) : (
            <p className="create-pattern__graph-note field--wide">
              Steps and abbreviations will be generated from your stitch canvas
              when you save.
            </p>
          )}

          <label className="field field--wide">
            <span>Notes</span>
            <textarea
              value={draft.notes}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Gauge notes, color tips, sizing…"
              rows={3}
            />
          </label>
        </div>

        {error ? <p className="create-pattern__error">{error}</p> : null}

        <div className="create-pattern__actions">
          <button type="submit" className="btn btn--primary">
            Save pattern to library
          </button>
          <Link to="/library" className="btn btn--ghost">
            Cancel
          </Link>
        </div>
      </form>
    </main>
  )
}
