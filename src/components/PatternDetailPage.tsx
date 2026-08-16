import { Link, useParams } from 'react-router-dom'
import { usePatterns } from '../hooks/usePatterns'
import { CrochetProgress } from './CrochetProgress'
import { StitchDiagram } from './StitchDiagram'
import { YouTubeEmbed } from './YouTubeEmbed'
import './PatternDetailPage.css'

export function PatternDetailPage() {
  const { slug } = useParams()
  const { getBySlug } = usePatterns()
  const pattern = slug ? getBySlug(slug) : undefined

  if (!pattern || pattern.status !== 'published') {
    return (
      <main className="pattern-detail pattern-detail--missing">
        <h1>Pattern not ready yet</h1>
        <p>
          This pattern isn’t in the library, or it’s still waiting on a full
          specification.
        </p>
        <Link to="/library">Back to library</Link>
      </main>
    )
  }

  return (
    <main className="pattern-detail">
      <header className="pattern-detail__header">
        <p className="pattern-detail__meta">
          {pattern.difficulty}
          {pattern.estimatedTime ? ` · ${pattern.estimatedTime}` : ''}
        </p>
        <h1>{pattern.title}</h1>
        <p className="pattern-detail__summary">{pattern.summary}</p>
        <div className="pattern-detail__actions">
          <Link to={`/library/${pattern.slug}/edit`} className="btn btn--primary">
            Edit pattern
          </Link>
          <Link to="/library" className="btn btn--ghost">
            Library
          </Link>
        </div>
        <dl className="pattern-detail__facts">
          {pattern.yarnWeight ? (
            <>
              <dt>Yarn</dt>
              <dd>{pattern.yarnWeight}</dd>
            </>
          ) : null}
          {pattern.hookSize ? (
            <>
              <dt>Hook</dt>
              <dd>{pattern.hookSize}</dd>
            </>
          ) : null}
        </dl>
      </header>

      {pattern.youtubeUrl ? (
        <section className="pattern-detail__video">
          <h2>Video walkthrough</h2>
          <YouTubeEmbed url={pattern.youtubeUrl} title={`${pattern.title} video`} />
        </section>
      ) : null}

      {pattern.stitchGraph && pattern.stitchGraph.stitches.length > 0 ? (
        <>
          <section>
            <h2>Stitch diagram</h2>
            <StitchDiagram
              graph={pattern.stitchGraph}
              title={`${pattern.title} stitch diagram`}
            />
          </section>

          <CrochetProgress patternId={pattern.id} graph={pattern.stitchGraph} />
        </>
      ) : null}

      {pattern.materials.length > 0 ? (
        <section>
          <h2>Materials</h2>
          <ul>
            {pattern.materials.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {pattern.abbreviations.length > 0 ? (
        <section>
          <h2>Abbreviations</h2>
          <dl className="pattern-detail__abbr">
            {pattern.abbreviations.map((entry) => (
              <div key={entry.abbr}>
                <dt>{entry.abbr}</dt>
                <dd>{entry.meaning}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {pattern.instructions.length > 0 ? (
        <section>
          <h2>Instructions</h2>
          <ol className="pattern-detail__steps">
            {pattern.instructions.map((step, index) => (
              <li key={`${index}-${step.slice(0, 24)}`}>{step}</li>
            ))}
          </ol>
        </section>
      ) : null}

      {pattern.notes ? (
        <section>
          <h2>Notes</h2>
          <p>{pattern.notes}</p>
        </section>
      ) : null}

      <p className="pattern-detail__back">
        <Link to="/library">Back to library</Link>
      </p>
    </main>
  )
}
