# ExamBuddy v1.0 — Setup Guide (Step by Step)

## Step 0 — Joiyatu check karo

- Node.js version **20.9 ya tena thi upar** joiye (Next.js 16 nu requirement che). Terminal ma check karo:
  ```bash
  node -v
  ```
  Jo 20.9 thi nano hoy to [nodejs.org](https://nodejs.org) parthi LTS version install karo.
- Supabase account (already che ✅)
- Groq API key (already che ✅)
- Gemini API key (already che ✅)
- Razorpay account (test mode mate free signup)

---

## STEP 1 — Supabase Database Setup

1. Supabase Dashboard kholo → tamaru project select karo.
2. Left sidebar ma **SQL Editor** kholo.
3. `supabase_schema.sql` file (aa zip ma che) khol o, full content copy karo.
4. SQL Editor ma paste karo → **Run** dabao.
   - Aa 10 tables banashe: `profiles, questions, quiz_history, user_diamonds, bookmarks, user_premium, daily_current_affairs, flashcards, study_materials, unlocked_materials`.
   - Already koi table existing hoy to skip thai jashe (nuksan nahi thay), `if not exists` use karyu che.
5. **Storage bucket banavo:**
   - Left sidebar ma **Storage** kholo.
   - "New bucket" → name: `study-materials` → **Public bucket** ON karo → Create.
6. **Keys lo:**
   - Project Settings (gear icon) → **API**.
   - `Project URL`, `anon public` key, ane `service_role` key — trane copy karo, Step 3 ma joishe.

---

## STEP 2 — AI Keys lo (Groq + Gemini)

- **Groq**: [console.groq.com](https://console.groq.com) → API Keys → naya key generate karo (`gsk_...` thi start thase).
- **Gemini**: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) → naya key generate karo (`AIza...` thi start thase).

(Tamara pase already che kahyu, etle just copy ready rakho.)

---

## STEP 3 — `.env.local` file banavo

1. Project ni root folder ma (`package.json` ni same level) ek navi file banavo: **`.env.local`**
2. `.env.local.example` file ma template che — copy karo, navi file ma paste karo, pachi badha `xxxxx` placeholders ne actual values thi replace karo:

```
NEXT_PUBLIC_SUPABASE_URL=<Supabase Project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase anon key>
SUPABASE_SERVICE_ROLE_KEY=<Supabase service_role key>

GROQ_API_KEY=<Groq key>
NEXT_PUBLIC_GEMINI_API_KEY=<Gemini key>

NEXT_PUBLIC_RAZORPAY_KEY_ID=<Razorpay test key id>
RAZORPAY_KEY_ID=<same Razorpay key id>
RAZORPAY_KEY_SECRET=<Razorpay secret>

ADMIN_PASSWORD=<tame nakki karo>
ADMIN_SECRET_TOKEN=<tame nakki karo>
CRON_SECRET=<tame nakki karo>
```

⚠️ **Important**: `.env.local` ne kayareya GitHub par push na karta — already `.gitignore` ma ee excluded che, etle automatic safe che.

---

## STEP 4 — Razorpay test keys lo

1. [dashboard.razorpay.com](https://dashboard.razorpay.com) → signup/login.
2. **Test Mode** ON rakho (top-right toggle) — real paisa nahi katse.
3. Settings → **API Keys** → "Generate Test Key" → `Key Id` ane `Key Secret` male.
4. Aa banne `.env.local` ma nakho (Step 3 ma batavyu).

---

## STEP 5 — Local Install ane Run

Terminal ma project folder kholo:

```bash
cd exambuddy
npm install
npm run dev
```

- `npm install` thoda time leshe (pehli vaar).
- Pachi terminal ma `http://localhost:3000` link aavshe — browser ma kholo.

### Test karva mate:
1. **Register** karo ek naya account.
2. **Admin Panel** kholo: `http://localhost:3000/admin` → `ADMIN_PASSWORD` thi login karo.
3. Admin ma jaine 2-4 sample questions ek subject mate add karo (e.g. "maths") — form thi manually, ya bulk JSON paste karo.
4. App ma pachi `Quiz` → "ગણિત" select karo → quiz aapo → submit karo.
5. **Check karo**: score sahi dekhay che ke nahi (sachha jawab par green highlight, score barabar).
6. Leaderboard, My Progress, Badges pages pan check karo — data have sahi dekhashe.

---

## STEP 6 — Production Deploy (Vercel)

1. [vercel.com](https://vercel.com) → GitHub/GitLab thi project import karo (ya `vercel` CLI thi).
2. Deploy thati vakhte Vercel **Environment Variables** mangshe — Step 3 ni badhi keys ekek add karo (Project Settings → Environment Variables).
3. **Cron Job** automatic chalu thai jashe — `vercel.json` ma already configured che (`/api/cron-current-affairs` daily 6 AM UTC). Vercel free plan ma cron jobs included che, pan **Vercel automatically `CRON_SECRET` header nathi moklatu** — etle aa rite check karo:
   - Vercel Cron jobs default e `Authorization: Bearer <CRON_SECRET>` header automatically add kare che JO tame Vercel dashboard ma e environment variable set karyu hoy.
   - Etle `CRON_SECRET` env variable Vercel ma set karvanu na chuko.
4. Deploy dabao. Pehli build 2-3 minute leshe.
5. Deploy pachi live URL par jaine same testing repeat karo (Step 5 ni jem).

---

## Troubleshooting (common issues)

| Problem | Solution |
|---|---|
| `npm install` ma error | Node version check karo (`node -v`) — 20.9+ joiye |
| Quiz ma "સવાલ મળ્યા નહીં" | Admin panel thi e subject mate questions add karya nathi — pehla add karo |
| Login/Register kaam nathi karto | Supabase URL/anon key `.env.local` ma sahi che ke nahi check karo |
| AI features (doubt solver, ai-quiz) error | `GROQ_API_KEY` sahi che ke nahi, ane Groq dashboard ma credit/limit check karo |
| Current affairs MCQ na aave | `NEXT_PUBLIC_GEMINI_API_KEY` check karo |
| Payment fail | Razorpay Test Mode ON che ke nahi, ane test card use karo (Razorpay docs ma test cards che) |
| Admin login na thay | `.env.local` ma `ADMIN_PASSWORD` set karyu che ke nahi, server restart karyo ke nahi (env change pachi `npm run dev` re-start karvu padshe) |

---

## File Reference

- `supabase_schema.sql` — Database tables + security policies, Supabase SQL Editor ma run karvanu.
- `.env.local.example` — Environment variables template, `.env.local` banavva mate.
