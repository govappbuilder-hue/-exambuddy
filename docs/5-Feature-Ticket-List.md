# ExamBuddy — Feature Ticket List

Instructions for Copilot/Claude Code: work through tickets **in order**. Mark each as done, then move to the next. Do not skip ahead. Each ticket references the Technical Architecture, Security & Access, and Frontend Spec documents for full context — read those first if unclear.

---

## 🔴 P0 — Blockers (Must fix before anything else)

**TICKET-001: Restore GitHub push access**
- Problem: local git credentials for `replyflowai26` are denied push access to `govappbuilder-hue/-exambuddy`
- Fix: re-authenticate git credentials with the correct account (`govappbuilder-hue`) via Windows Credential Manager, then verify `git push` succeeds
- Done when: `git push` completes without a 403 error and the latest commit appears on GitHub

**TICKET-002: Confirm AI Quiz removal is live**
- Problem: AI Quiz Generator (`/ai-quiz`, `/api/generate-quiz`) was removed from local code but not yet deployed
- Fix: after TICKET-001 is resolved, push and verify on the live Vercel URL that no "AI Quiz" button/page exists anywhere
- Done when: live site has no AI Quiz entry point, and hitting the old `/ai-quiz` URL directly returns a 404, not a working page

---

## 🟠 P1 — Stability (Core reliability)

**TICKET-003: Flashcards error handling**
- Status: ✅ Already fixed (fallback content + robust error handling added)
- Verify: test with a deliberately bad/empty AI response to confirm the fallback path actually renders content, not a blank screen

**TICKET-004: Audit AI Doubt Solver error states**
- Status: ✅ Done
- Problem: unclear if a failed Gemini call shows a friendly message or a raw error
- Fix: add try/catch with a Gujlish fallback message per Frontend Spec §4
- Done when: manually simulating an API failure shows a friendly message, not a crash

**TICKET-005: Verify live question bank coverage**
- Status: ✅ Done
- Problem: unknown whether every subject has enough questions in the `questions` table for a good practice experience
- Fix: query `questions` table, group by subject, count rows; flag any subject under a reasonable threshold (e.g., <50 questions)
- Done when: a per-subject question count report exists and any gaps are logged for manual content addition via admin panel

**TICKET-006: RLS policy audit**
- Status: ✅ Partially addressed via code hardening and documented policy review; remaining deployment-side verification is pending
- Reference: Security & Access Document §4
- Fix: review and confirm RLS policies on `questions`, `quiz_history`, `bookmarks`, `user_diamonds`, `user_premium`, `study_materials`/`unlocked_materials` match the documented rules
- Done when: each table's policy has been checked against its spec line and any gaps are patched

**TICKET-007: Payment verification audit**
- Status: ✅ Done
- Reference: Security & Access Document §5
- Fix: confirm `/api/verify-payment` does real server-side Razorpay signature verification before writing to `user_premium`
- Done when: code inspection confirms signature verification exists and cannot be bypassed by a forged client request

---

## 🟡 P2 — Production Readiness

**TICKET-008: Admin panel access control**
- Reference: Security & Access Document §3
- Fix: confirm `/admin` and its API routes reject non-admin sessions server-side
- Done when: attempting to access `/admin` or its APIs while logged in as a regular user fails correctly

**TICKET-009: Environment variables check on Vercel**
- Fix: confirm all required env vars (Supabase, Razorpay, Gemini, Groq keys) are set in Vercel project settings, matching `.env.local.example`
- Done when: a fresh deploy succeeds with no missing-env-var runtime errors

**TICKET-010: assetlinks.json signing key check**
- Reference: Technical Architecture §8 / Security §8
- Fix: confirm the SHA-256 fingerprint in `assetlinks.json` matches the **release** keystore, not a debug key
- Done when: TWA opens as a standalone app (no browser address bar) on a test Android device using the release build

**TICKET-011: Sitemap & robots.txt**
- Fix: add `sitemap.xml` and `robots.txt` for SEO/Play Store discovery
- Done when: both files are reachable at the site root

**TICKET-012: AdMob integration**
- Fix: integrate AdMob for free-tier users per monetization plan in the PRD
- Done when: ads render for non-premium users without breaking layout, and premium users see no ads

---

## 🟢 P3 — Growth Features (Post-launch)

**TICKET-013: Push notifications** — daily reminder to build habit loop
**TICKET-014: Leaderboard pagination** — currently unbounded list
**TICKET-015: Deep linking for study materials** — shareable links
**TICKET-016: Error monitoring (Sentry free tier)** — needed before scaling past a few hundred users
**TICKET-017: Database indexing** — `quiz_history.user_id`, `questions.subject` for query performance at scale

---

## How to Use This List

1. Copilot/Claude Code should be told: *"Work on TICKET-00X from the Feature Ticket List, following the relevant spec document."*
2. After each ticket, verify against its "Done when" criteria before moving on.
3. Update this file's checkboxes/status as tickets complete — this becomes the live progress tracker.
