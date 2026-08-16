import { Link } from 'react-router-dom'
import './HomePage.css'

export function HomePage() {
  return (
    <main className="home">
      <section className="hero" aria-label="Crochet Pro">
        <p className="hero__brand">Crochet Pro</p>
        <h1 className="hero__headline">Make. Tick. Done.</h1>
        <p className="hero__lede">Patterns. Stitches. No fluff.</p>
        <div className="hero__actions">
          <Link to="/library" className="btn btn--primary">
            Library
          </Link>
          <Link to="/library/new" className="btn btn--ghost">
            New pattern
          </Link>
        </div>
      </section>

      <section className="strip strip--pink">
        <p>Click stitches. Set a number. Connect them.</p>
      </section>

      <section className="strip strip--mint">
        <p>Row by row checkboxes while you crochet.</p>
        <Link to="/account" className="btn">
          Sign in
        </Link>
      </section>
    </main>
  )
}
