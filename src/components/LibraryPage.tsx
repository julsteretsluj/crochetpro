import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { usePatterns } from '../hooks/usePatterns'
import './LibraryPage.css'

export function LibraryPage() {
  const { user } = useAuth()
  const { published, patterns, cloudEnabled, syncing, syncError } = usePatterns()
  const awaiting = patterns.filter((p) => p.status === 'awaiting_spec')

  return (
    <main className="library">
      <header className="library__hero">
        <p className="library__eyebrow">Pattern library</p>
        <h1>Crochet Pro shelf</h1>
        <p className="library__lede">
          Browse published patterns, or create one by hand with an optional
          YouTube walkthrough.
        </p>
        <div className="library__actions">
          <Link to="/library/new" className="btn btn--primary">
            Create a pattern
          </Link>
          {!user ? (
            <Link to="/account" className="btn btn--ghost">
              Sign in to sync
            </Link>
          ) : null}
        </div>
        {cloudEnabled ? (
          <p className="library__sync">
            {syncing ? 'Syncing your account…' : 'Synced to your account'}
          </p>
        ) : (
          <p className="library__sync">
            Guest mode saves on this browser only.{' '}
            <Link to="/account">Create an account</Link> to keep patterns
            everywhere.
          </p>
        )}
        {syncError ? <p className="library__sync-error">{syncError}</p> : null}
      </header>

      {published.length === 0 && awaiting.length === 0 ? (
        <section className="library__empty" aria-live="polite">
          <div className="library__empty-panel">
            <h2>Waiting on the first pattern</h2>
            <p>
              Use manual creation to add title, materials, steps, and a YouTube
              link — or send a specification and we’ll add it here.
            </p>
            <ul className="library__checklist">
              <li>Name & short summary</li>
              <li>Difficulty & estimated time</li>
              <li>Yarn weight & hook size</li>
              <li>Materials, abbreviations & instructions</li>
              <li>Optional YouTube embed</li>
            </ul>
            <Link to="/library/new" className="btn btn--primary">
              Create the first pattern
            </Link>
          </div>
          <div className="library__empty-aside" aria-hidden="true">
            <span className="library__stitch">ch</span>
            <span className="library__stitch library__stitch--offset">sc</span>
            <span className="library__stitch">dc</span>
          </div>
        </section>
      ) : (
        <section className="library__grid" aria-label="Patterns">
          {published.map((pattern, index) => (
            <article
              key={pattern.id}
              className="pattern-card"
              style={{ '--delay': `${index * 80}ms` } as CSSProperties}
            >
              <p className="pattern-card__meta">
                {pattern.difficulty}
                {pattern.yarnWeight ? ` · ${pattern.yarnWeight}` : ''}
                {pattern.youtubeUrl ? ' · video' : ''}
              </p>
              <h2>
                <Link to={`/library/${pattern.slug}`}>{pattern.title}</Link>
              </h2>
              <p>{pattern.summary}</p>
              <div className="pattern-card__links">
                <Link to={`/library/${pattern.slug}`} className="pattern-card__link">
                  Open
                </Link>
                <Link
                  to={`/library/${pattern.slug}/edit`}
                  className="pattern-card__link"
                >
                  Edit
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}

      <p className="library__back">
        <Link to="/">Back to Crochet Pro</Link>
      </p>
    </main>
  )
}
