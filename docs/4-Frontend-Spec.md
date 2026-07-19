# ExamBuddy — Frontend Spec Document

## 1. Design Principles

1. **Mobile-first** — primary usage is Android phones, often on average network speed. Every screen must work well at ~360-400px width.
2. **Gujarati + English mixed audience** — UI copy currently mixes both; keep this consistent (don't switch a whole screen to pure English or pure Gujarati inconsistently).
3. **Reliability over decoration** — a broken/loading AI feature should never block the rest of the app. Every AI-backed screen must have a graceful fallback state, not a blank/crashed screen.
4. **Dark mode is first-class**, not an afterthought — every new component must read `ThemeContext` and support both `dark`/`light` color sets, following the existing pattern (`cardBg`, `textPrimary`, `textSecondary`, `borderColor`, `inputBg` variables already used across pages).

## 2. Global Layout Components

| Component | File | Behavior |
|---|---|---|
| Bottom Navigation | `components/BottomNav.jsx` | Persistent across all logged-in pages: Home / Quiz / Mock Test / Market / Profile |
| Top Navbar | `components/Navbar.jsx` | App branding, possibly theme toggle |
| Theme Toggle | `components/ThemeToggle.jsx` | Switches dark/light, persists via `ThemeContext` |

## 3. Page-by-Page Spec (Current State + Required Fixes)

### Dashboard (`/dashboard`)
- Header: time-of-day greeting, streak counter, 3-stat row (quizzes done, accuracy, rank)
- Quick Actions grid: **Practice Quiz, AI Doubt, Flashcards, Today's News, Badges, Leaderboard, Bookmarks** (AI Quiz card removed — confirm this is live)
- Today's Targets: user-editable checklist (local state, not persisted to DB — **flag: should this persist per-user in Supabase instead of resetting on reload?**)
- Exam Countdown: user-added exam list with countdown days, currently stored in `localStorage` (**flag: this means exams don't sync across devices — acceptable for V1, but note for roadmap**)

### Quiz Flow (`/quiz` → `/quiz/[subject]`)
- Subject selection page: list of subjects, pulls from `questions` table
- **Fix required:** the previously-existing "AI Quiz Generator" banner button has been removed — confirm no dangling reference remains
- Quiz-taking screen: MCQ display, bookmark toggle, score tracking to `quiz_history`

### Mock Test (`/mock-test`)
- Timed, full-subject test experience, same `questions` table source

### AI Doubt Solver (`/doubt-solver`)
- On-demand question input → Gemini response
- **Required:** loading state + clear error message (in Gujlish) if the AI call fails — must never show a raw JS error to the user

### Flashcards (`/flashcards`)
- **Recently fixed:** now has fallback flashcard content if AI generation fails — confirm UI shows *some* content rather than an empty/broken screen in all cases

### Current Affairs (`/current-affairs`)
- Reads from `daily_current_affairs` cache — should always have content (cron-populated), verify empty-state handling for the very first day before cron has run

### Admin Panel (`/admin`)
- Tabs: Bulk JSON upload, Single question add, Manage (edit/delete), PDF upload, Materials management
- **Not public-facing** — but must look functional for the founder's own daily use; no user-friendliness constraints beyond "founder can use it without confusion"

### Premium (`/premium`)
- Plan display (₹99/month, ₹799/year), Razorpay checkout trigger
- **Required:** clear success/failure state after payment attempt — user must never be left wondering if payment went through

### Marketplace / Study Materials
- Browse materials, purchase/unlock flow, PDF viewing
- **Required:** paid content must be visibly locked (with price) vs unlocked (with "open" action) — no ambiguity

### Leaderboard, Badges, Bookmarks, My Progress
- Standard list/grid views pulling from respective tables — no major spec changes, verify empty-state messaging exists (e.g., "no bookmarks yet" rather than blank space)

## 4. Error & Loading State Standard (Apply App-Wide)

Every screen that fetches data (Supabase or AI) must have three states:
1. **Loading** — a skeleton or spinner, not a blank white screen
2. **Empty** — a friendly Gujlish message (e.g., "Koi data nathi, pehla quiz start karo!") — never a blank screen with no explanation
3. **Error** — a friendly Gujlish message with a retry option — never a raw stack trace or crash

## 5. Accessibility / Polish Backlog

- [ ] Consistent button tap-target sizing (min ~44px height) across all screens for mobile usability
- [ ] Consistent loading skeletons instead of ad-hoc spinners per page
- [ ] Confirm text contrast passes basic readability in both dark and light themes
