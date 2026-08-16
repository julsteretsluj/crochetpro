import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { usePatterns } from '../hooks/usePatterns'
import './AccountPage.css'

type Mode = 'signin' | 'signup'

export function AccountPage() {
  const navigate = useNavigate()
  const { configured, loading, user, signIn, signUp, signOut } = useAuth()
  const { saveLocalToAccount, syncing, syncError, published } = usePatterns()

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [savedCount, setSavedCount] = useState<number | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setBusy(true)

    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password)
        setMessage('Signed in. Your patterns will sync across devices.')
        navigate('/library')
      } else {
        const result = await signUp(email.trim(), password)
        if (result.needsEmailConfirm) {
          setMessage(
            'Account created. Check your email to confirm, then sign in.',
          )
          setMode('signin')
        } else {
          setMessage('Account created and signed in.')
          navigate('/library')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  async function handleSaveToAccount() {
    setError(null)
    setSavedCount(null)
    setBusy(true)
    try {
      const count = await saveLocalToAccount()
      setSavedCount(count)
      setMessage(
        count === 0
          ? 'No local patterns to upload.'
          : `Saved ${count} pattern${count === 1 ? '' : 's'} to your account.`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save to account.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <main className="account">
        <p className="account__status">Checking account…</p>
      </main>
    )
  }

  if (!configured) {
    return (
      <main className="account">
        <header className="account__header">
          <p className="account__eyebrow">Accounts</p>
          <h1>Connect Supabase to enable sign-in</h1>
          <p>
            Crochet Pro uses Supabase for email/password accounts and cloud
            pattern storage. GitHub + Vercel stay as they are — you only add a
            free Supabase project.
          </p>
        </header>
        <ol className="account__steps">
          <li>
            Create a project at{' '}
            <a href="https://supabase.com" target="_blank" rel="noreferrer">
              supabase.com
            </a>
          </li>
          <li>
            Run <code>supabase/schema.sql</code> in the SQL Editor
          </li>
          <li>
            Copy Project URL + anon key into <code>.env.local</code> (and Vercel
            env vars)
          </li>
          <li>Redeploy on Vercel</li>
        </ol>
        <p className="account__back">
          <Link to="/">Back home</Link>
        </p>
      </main>
    )
  }

  if (user) {
    return (
      <main className="account">
        <header className="account__header">
          <p className="account__eyebrow">Your account</p>
          <h1>Signed in</h1>
          <p>
            Patterns you create while signed in sync to this account. Use save
            to account if you already made patterns on this browser as a guest.
          </p>
        </header>

        <section className="account__panel">
          <p>
            <strong>Email</strong>
            <br />
            {user.email}
          </p>
          <p>
            <strong>Library</strong>
            <br />
            {published.length} pattern{published.length === 1 ? '' : 's'}
            {syncing ? ' · syncing…' : ''}
          </p>

          {syncError ? <p className="account__error">{syncError}</p> : null}
          {message ? <p className="account__message">{message}</p> : null}
          {savedCount !== null && savedCount > 0 ? (
            <p className="account__message">Upload complete.</p>
          ) : null}

          <div className="account__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleSaveToAccount}
              disabled={busy || syncing}
            >
              Save local patterns to account
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => signOut()}
              disabled={busy}
            >
              Sign out
            </button>
            <Link to="/library" className="btn btn--ghost">
              Open library
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="account">
      <header className="account__header">
        <p className="account__eyebrow">Account</p>
        <h1>{mode === 'signin' ? 'Sign in' : 'Create account'}</h1>
        <p>
          Email and password keep your patterns available on any browser or
          device.
        </p>
      </header>

      <form className="account__panel" onSubmit={handleSubmit}>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>

        {error ? <p className="account__error">{error}</p> : null}
        {message ? <p className="account__message">{message}</p> : null}

        <div className="account__actions">
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy
              ? 'Please wait…'
              : mode === 'signin'
                ? 'Sign in'
                : 'Create account'}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError(null)
              setMessage(null)
            }}
          >
            {mode === 'signin' ? 'Need an account?' : 'Already have an account?'}
          </button>
        </div>
      </form>
    </main>
  )
}
