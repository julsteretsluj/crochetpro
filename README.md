# Crochet Pro

A calm website and pattern library for crochet makers.

## Develop

```bash
npm install
cp .env.example .env.local
# fill in Supabase values (optional for local guest mode)
npm run dev
```

## Accounts + cloud patterns (Supabase)

You already have **GitHub** (code) and **Vercel** (hosting). For email/password accounts and syncing patterns across devices you need one extra free service:

### [Supabase](https://supabase.com) (required for accounts)

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** → New query → paste and run `supabase/migrations/20260816180000_patterns_and_progress.sql`
   (or from the CLI: `supabase db push` after linking)
3. Open **Project Settings → API** and copy:
   - Project URL → `VITE_SUPABASE_URL`
   - `anon` `public` key → `VITE_SUPABASE_ANON_KEY`
4. Locally: put them in `.env.local` (see `.env.example`)
5. On **Vercel**: Project → Settings → Environment Variables → add the same two names, then redeploy
6. (Recommended for testing) Authentication → Providers → Email → turn off “Confirm email” until you’re ready for real confirmations
7. Authentication → URL configuration → add your Vercel URL (and `http://127.0.0.1:5173` for local)

### What stays the same

| Platform | Role |
| --- | --- |
| GitHub | Source code |
| Vercel | Frontend hosting / deploy |
| Supabase | Auth + database for patterns & stitch progress |

No Firebase, Clerk, or custom backend is required for this setup.

### App behaviour

- **Guest**: patterns + ticks stay in the browser (`localStorage`)
- **Signed in**: patterns and row progress sync to your Supabase account
- **Account page** (`/account`): sign up / sign in / sign out, plus **Save local patterns to account** to upload guest patterns after you create an account

## Patterns

- Create patterns at `/library/new` (stitch builder + optional YouTube)
- Seed/spec patterns can still be added in `src/data/patterns.ts` as `seedPatterns`
