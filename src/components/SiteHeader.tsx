import { NavLink } from 'react-router-dom'
import './SiteHeader.css'

export function SiteHeader() {
  return (
    <header className="site-header">
      <NavLink to="/" className="site-header__brand" end>
        Crochet Pro
      </NavLink>
      <nav className="site-header__nav" aria-label="Primary">
        <NavLink to="/library" className="site-header__link" end>
          Pattern library
        </NavLink>
        <NavLink to="/library/new" className="site-header__link">
          Create pattern
        </NavLink>
      </nav>
    </header>
  )
}
