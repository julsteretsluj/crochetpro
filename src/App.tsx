import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SiteHeader } from './components/SiteHeader'
import { HomePage } from './components/HomePage'
import { LibraryPage } from './components/LibraryPage'
import { PatternDetailPage } from './components/PatternDetailPage'
import { CreatePatternPage } from './components/CreatePatternPage'
import { PatternProvider } from './hooks/usePatterns'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <PatternProvider>
        <div className="app-shell">
          <SiteHeader />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/library/new" element={<CreatePatternPage />} />
            <Route path="/library/:slug" element={<PatternDetailPage />} />
          </Routes>
        </div>
      </PatternProvider>
    </BrowserRouter>
  )
}

export default App
