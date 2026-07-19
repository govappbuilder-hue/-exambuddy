# ExamBuddy — Product Requirements Document (PRD)

**Version:** 1.1
**Prepared for:** Yuvraj (Founder & Solo Developer)
**Live App:** exambuddy-ochre.vercel.app
**Repository:** github.com/govappbuilder-hue/-exambuddy
**Document Purpose:** This is the single source of truth for what ExamBuddy is, who it's for, what it does, and what "done" looks like — so every future decision (feature add/remove, redesign, launch) gets checked against this instead of drifting.

---

## 1. Vision & Goal

**Vision:** ExamBuddy is a mobile-first exam preparation platform for Gujarat's competitive exam aspirants (GPSC, GSSSB, Talati, PSI, and similar government exams), giving them reliable practice content, progress tracking, and study tools in one place.

**Primary Goal:** Launch a **stable, production-ready** app on Google Play Store that:
1. Never gives students a wrong or broken answer (reliability over feature count)
2. Converts free users into premium subscribers
3. Builds initial traction through a real-world coaching center channel

**Growth Target:** 10,000+ total registered students, with 5,000+ daily active users — reached in phases (see §9 Roadmap), with cost scaling only after revenue justifies it at each stage.

**Non-Goal (for V1):** Being the "most AI-powered" exam app. Reliability and manual-content quality are prioritized over AI feature breadth.

---

## 2. Target User

- **Primary:** Gujarati-medium and English-medium students preparing for GPSC/GSSSB/Talati/PSI and similar state-level competitive exams
- **Secondary:** Coaching center students (via referral channel — Rajkot coaching center)
- **Device context:** Primarily Android, mobile-first, variable internet speed

---

## 3. Tech Stack (Current)

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Database/Auth | Supabase (Postgres + Auth + RLS) |
| Payments | Razorpay |
| AI Services | Google Gemini, Groq (for current affairs) |
| Hosting | Vercel |
| PWA/Android wrapper | `@ducanh2912/next-pwa` + TWA for Play Store |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |

---

## 4. Data Model (Supabase Tables)

| Table | Purpose |
|---|---|
| `profiles` | User profile data |
| `questions` | MCQ question bank — **source of truth for Quiz & Mock Test** |
| `quiz_history` | Per-user quiz attempt records — powers stats, streak, accuracy |
| `user_diamonds` | Gamification currency/points |
| `bookmarks` | Saved questions per user |
| `user_premium` | Premium subscription status per user |
| `daily_current_affairs` | Cached daily current affairs content |
| `flashcards` | Flashcard content (cached/admin) |
| `study_materials` | Marketplace/study material metadata |
| `unlocked_materials` | Tracks which paid materials a user has unlocked |

---

## 5. Feature Inventory (Status)

### ✅ Core Features (Stable, Keep As-Is)
Auth, Practice Quiz (manual DB-driven), Mock Test, Dashboard, Leaderboard, Badges, Bookmarks, My Progress, Premium Subscription (Razorpay), Admin Panel (bulk upload/manage/PDF/materials), Marketplace/Study Materials, Dark Mode, Privacy Policy & Terms, Android App (TWA/PWA).

### 🟡 AI Features
| Feature | Decision | Reasoning |
|---|---|---|
| AI Doubt Solver | **KEEP** | On-demand, low blast radius per failure |
| Current Affairs (cron + Groq) | **KEEP** | Cached daily, has fallback |
| AI Flashcards | ✅ **FIXED** | Robust error handling + fallback content added |

### ❌ Removed
AI Quiz Generator (photo/PDF-based) and its misleading "AI-powered MCQs" dashboard label — code removed locally, **live deployment pending GitHub push fix**.

### ⬜ Not Yet Built
Ad Integration (AdMob), Push Notifications, Deep linking, Sitemap/robots.txt, Leaderboard pagination.

---

## 6. Monetization Model

| Stream | Detail |
|---|---|
| Premium Subscription | ₹99/month, ₹799/year via Razorpay |
| Marketplace Commission | % cut on paid study material sales |
| Ads (planned) | AdMob for free-tier users |
| B2B / Referral | Coaching center partnership — per-referral commission |

---

## 7. Known Risks / Open Issues

1. GitHub push permission blocked (account mismatch) — blocking deployments
2. Deadline originally set for June 15, 2026 has passed — targeting nearest realistic launch window
3. Scaling costs must follow revenue, not precede it (see roadmap)

---

## 8. Definition of "Production Ready" (V1 Launch Criteria)

- [ ] AI Quiz Generator fully removed from live app
- [ ] No console/runtime errors on core flows (login, quiz, mock test, premium purchase)
- [ ] Every subject has sufficient live question count in Supabase
- [ ] Ads integrated for free-tier monetization
- [ ] Play Store listing assets ready
- [ ] App submitted and approved on Play Store
- [ ] Security & Access checklist (see doc 3) fully passed

---

## 9. Growth-Phased Roadmap

| Phase | Users | Monthly Cost | Focus |
|---|---|---|---|
| Phase 0 | 0-500 | ₹0 | Stability, free tiers |
| Phase 1 | 500-2,000 | ₹1,500-2,500 | Supabase Pro, push notifications, retention |
| Phase 2 | 2,000-5,000+ DAU | ₹5,000-10,000 | Vercel Pro, paid AI tier, DB indexing, ads, referral system |

**Rule:** revenue (premium/ads) must fund each stage before advancing cost to the next.

---

*This document should be updated whenever a feature is added, removed, or its status changes.*
