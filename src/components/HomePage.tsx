import { Link } from 'react-router-dom'
import './HomePage.css'

export function HomePage() {
  return (
    <main className="home">
      <section className="hero" aria-label="Crochet Pro">
        <div className="hero__media" role="img" aria-label="Soft yarn and crochet hooks on a table" />
        <div className="hero__veil" />
        <div className="hero__content">
          <p className="hero__brand">Crochet Pro</p>
          <h1 className="hero__headline">Patterns you can actually finish</h1>
          <p className="hero__lede">
            A calm library of clear crochet patterns — built one project at a time.
          </p>
          <div className="hero__actions">
            <Link to="/library" className="btn btn--primary">
              Browse the library
            </Link>
            <a href="#about" className="btn btn--ghost">
              How it works
            </a>
          </div>
        </div>
        <div className="hero__doodle" aria-hidden="true" />
      </section>

      <section id="about" className="about">
        <div className="about__copy">
          <h2>Written for makers who like fewer surprises</h2>
          <p>
            Each pattern will list yarn, hook, stitches, and step-by-step rounds —
            no mystery math, no missing abbreviations.
          </p>
        </div>
        <aside className="about__note">
          <p className="about__note-label">Coming soon</p>
          <p>
            The library is ready. Pattern details arrive as you send them —
            title, materials, and instructions.
          </p>
        </aside>
      </section>

      <section className="invite">
        <h2>Ready when you are</h2>
        <p>
          Share a pattern spec whenever you like — we’ll add it to the shelf.
        </p>
        <Link to="/library" className="btn btn--primary">
          Open pattern library
        </Link>
      </section>
    </main>
  )
}
