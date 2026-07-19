# ExamBuddy — Security & Access Document

## 1. Purpose

This document lists every security/access item that must be verified or fixed before ExamBuddy is considered production-ready for 5,000+ daily users. Copilot/Claude Code should treat every unchecked item as an open ticket.

## 2. Authentication

- [ ] Confirm Supabase Auth session handling is correct on all protected routes (dashboard, quiz, premium, admin) — unauthenticated users must be redirected to `/login`, not shown a broken/empty page
- [ ] Confirm password reset flow exists and works (if not present, this is a missing feature, not just a bug)
- [ ] Confirm no auth tokens or Supabase service-role keys are ever exposed to the client bundle (only the anon/public key should be client-side)

## 3. Admin Panel Access Control

- [ ] Confirm `/admin` route is NOT reachable by a regular logged-in user — verify `admin-auth` route actually gates access server-side, not just hides a UI link
- [ ] Confirm bulk-upload, single-question-add, and materials-management API routes reject requests from non-admin sessions
- [ ] Rotate/verify the admin password or admin-check mechanism is not hardcoded in client-visible code

## 4. Row Level Security (RLS) — Supabase

- [ ] Audit RLS policy on `questions` table — regular users should have **read-only** access, never write/delete
- [ ] Audit RLS on `quiz_history`, `bookmarks`, `user_diamonds` — a user must only be able to read/write **their own** rows (`user_id = auth.uid()`), never another user's
- [ ] Audit RLS on `user_premium` — a user must never be able to set their own premium status directly (this must only be set server-side, after Razorpay payment verification)
- [ ] Audit RLS on `study_materials` / `unlocked_materials` — a user must not be able to mark a paid material as "unlocked" without a verified purchase

## 5. Payment Security (Razorpay)

- [ ] Confirm `/api/verify-payment` verifies the Razorpay signature **server-side** using the secret key — never trust a client-side "payment successful" flag alone
- [ ] Confirm Razorpay secret key exists only in server environment variables, never in any client-bundled file
- [ ] Confirm there's no way to call an internal "grant premium" endpoint directly without a valid, verified payment reference

## 6. API Route Hardening

- [ ] Every API route that writes to the database should validate input (e.g., `subject` must be one of an allowed list, not arbitrary user text passed into a query)
- [ ] Confirm rate limiting or reasonable abuse protection exists on AI-calling routes (`doubt-solver`, `generate-flashcards`) — an unauthenticated or single user should not be able to exhaust the AI API quota for everyone
- [ ] Confirm the removed `/api/generate-quiz` route is fully gone (not just unlinked from UI) — a dangling, unlinked-but-reachable API route is still a live attack surface

## 7. Environment Variables & Secrets

- [ ] Confirm `.env.local` is in `.gitignore` and was never committed to git history (check with `git log --all --full-history -- .env.local`)
- [ ] Confirm all required secrets (Supabase URL/keys, Razorpay keys, Gemini/Groq API keys) are set correctly in **Vercel's** environment variables, not just locally
- [ ] If any key was ever accidentally exposed (e.g., pasted in a screenshot or chat), rotate it immediately

## 8. Android App / assetlinks

- [ ] Confirm `assetlinks.json` SHA-256 fingerprint matches the **release** signing key (not a debug key) before Play Store submission — a mismatch breaks the TWA "installed app" experience and falls back to browser chrome

## 9. Data Privacy

- [ ] Confirm Privacy Policy and Terms pages accurately describe actual data practices (third-party services listed: Supabase, Razorpay, Gemini/Groq — already documented)
- [ ] Confirm children's-data language matches actual target audience (competitive exam aspirants are typically 18+, but verify no under-13 data collection risk exists if marketing broadens)

## 10. GitHub / Repository Access

- [ ] Confirm repository collaborator list on `govappbuilder-hue/-exambuddy` is accurate — only trusted accounts should have write access
- [ ] Once push access is restored, confirm no secrets exist anywhere in committed files or commit history
