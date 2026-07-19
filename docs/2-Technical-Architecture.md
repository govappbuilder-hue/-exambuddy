# ExamBuddy — Technical Architecture Document

## 1. System Overview

ExamBuddy is a Next.js 16 (App Router) monolithic web app, deployed on Vercel, backed by Supabase (Postgres + Auth), wrapped as an installable PWA/TWA for Android distribution.

```
[Android Device / Browser]
        │
        ▼
[Next.js App (Vercel)] ── App Router pages + API routes
        │
        ├──▶ [Supabase] — Auth, Postgres DB, Row Level Security
        ├──▶ [Razorpay] — Payment processing
        ├──▶ [Google Gemini API] — AI Doubt Solver, Flashcards
        └──▶ [Groq API] — Current Affairs generation (cron-based)
```

## 2. Directory Structure (Current)

```
src/app/
  admin/                  → Admin panel (bulk upload, manage, PDF, materials)
  api/
    admin-auth/           → Admin authentication
    bulk-upload/          → Bulk MCQ JSON upload
    create-order/         → Razorpay order creation
    cron-current-affairs/ → Scheduled current affairs generation
    doubt-solver/         → AI doubt solving endpoint
    generate-ca-quiz/     → Current affairs quiz generation
    generate-flashcards/  → Flashcard generation (recently fixed for error handling)
    get-current-affairs/  → Fetch cached current affairs
    upload-material/      → Study material upload
    verify-payment/       → Razorpay payment verification
  badges/ bookmarks/ current-affairs/ dashboard/ doubt-solver/
  flashcards/ leaderboard/ login/ marketplace/ mock-test/
  my-progress/ premium/ privacy-policy/ quiz/[subject]/
  register/ study-materials/[subject]/ terms/
  components/ui/, BottomNav.jsx, Navbar.jsx, ThemeToggle.jsx
  context/ThemeContext.jsx
  lib/ gemini.js, supabase.js, utils.js
```

## 3. Data Layer

**Database:** Supabase Postgres. Key tables: `profiles`, `questions`, `quiz_history`, `user_diamonds`, `bookmarks`, `user_premium`, `daily_current_affairs`, `flashcards`, `study_materials`, `unlocked_materials`.

**Access pattern:** Client components call `supabase.from(table)` directly using the Supabase JS client (`lib/supabase.js`) — protected by Row Level Security (RLS) policies at the database level, not application-level checks. **Action item: RLS policies must be audited before scale (see Security doc).**

**Critical distinction:** `/quiz/[subject]` and `/mock-test` read directly from the `questions` table — this is **manual/admin-curated content**, not live AI generation. Only `doubt-solver`, `generate-flashcards`, and current-affairs routes call external AI APIs at runtime.

## 4. AI Integration Points

| Route | Model | Failure Mode | Mitigation Status |
|---|---|---|---|
| `/api/doubt-solver` | Gemini | Quota/timeout | On-demand, low blast radius |
| `/api/generate-flashcards` | Gemini | Malformed/empty AI response crashed the route | ✅ Fixed — fallback Gujarati flashcard set + robust error handling added |
| `/api/generate-ca-quiz` | Gemini/Groq | Quota | Cached daily via `cron-current-affairs` |
| `/api/get-current-affairs` | — | Cache miss | Reads from `daily_current_affairs` table |

**Removed:** `/api/generate-quiz` (photo/PDF-based AI quiz generation) and its UI (`/ai-quiz`) — removed due to high error/inaccuracy rate. Confirm this removal is deployed (pending GitHub push resolution as of this writing).

## 5. Payments

- Razorpay integration: `create-order` (server-side order creation) → client checkout → `verify-payment` (signature verification) → `user_premium` table update.
- **Action item:** Confirm `verify-payment` validates the Razorpay signature server-side (never trust client-reported success) — this must be checked explicitly (see Security doc).

## 6. Hosting & Deployment

- **Vercel** auto-deploys on `git push` to `main`.
- **Known current blocker:** local git credentials (`replyflowai26`) lack push permission to repo owner (`govappbuilder-hue`) — must be resolved via Windows Credential Manager re-auth before any further deploys land.
- PWA config via `@ducanh2912/next-pwa`; Android distribution via TWA with `assetlinks.json` linking package `com.exambuddy.app` to a signing certificate fingerprint.

## 7. Scaling Considerations (For 5,000+ DAU Target)

| Concern | Current State | Action Needed |
|---|---|---|
| DB tier | Supabase free tier | Upgrade to Pro before ~2,000 users (storage/bandwidth limits) |
| Hosting tier | Vercel free tier | Upgrade to Pro before high bandwidth/function-invocation volume |
| AI API quota | Free tier keys | Move to paid tier before daily AI request volume exceeds free quota |
| DB indexing | Not yet audited | Add indexes on `quiz_history.user_id`, `questions.subject` for query performance at scale |
| Monitoring | None | Add error tracking (e.g., Sentry free tier) before scale — manual bug discovery won't work past a few hundred users |

## 8. Open Technical Debt

1. `.env.local` — must confirm all required keys exist and are current in Vercel's environment variable settings (not just locally)
2. No sitemap.xml / robots.txt
3. No push notification infrastructure
4. No CDN in front of study material files (Marketplace PDFs)
