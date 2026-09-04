<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:0a0a0a,50:4F46E5,100:0a0a0a&height=220&section=header&text=MT%20WEB%20STUDIO&fontSize=55&fontColor=E8C878&fontAlignY=38&desc=Professional%20Websites%20That%20Grow%20Your%20Business%20%F0%9F%9A%80&descAlignY=58&descSize=20&animation=fadeIn"/>

<br/>

[![Live Repo](https://img.shields.io/badge/🌐%20GitHub-MT--Web--Studio-4F46E5?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Nayeem131136/mt-web-studio)
&nbsp;
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
&nbsp;
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
&nbsp;
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
&nbsp;
[![License](https://img.shields.io/badge/License-MIT-4F46E5?style=for-the-badge)](LICENSE)

<br/>

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=18&pause=1000&color=E8C878&center=true&vCenter=true&width=650&lines=Client+Onboarding+%2B+Order+CRM+%F0%9F%92%BC;6-Step+Animated+Wizard+%E2%9C%A8;Real-Time+Admin+Dashboard+%E2%9A%A1;Bilingual+PDF+%2B+WhatsApp+Powered+%F0%9F%92%AC" alt="Typing SVG"/>

</div>

---

## 📖 About

**MT Web Studio CRM** is the client onboarding and lead management system for **MT Web Studio**, a Bangladesh-based web development agency. Instead of a plain contact form, clients go through a premium 6-step animated wizard — business info, package selection, requirements, design preferences, file uploads, and a final review — before a branded, bilingual (English/Bangla) PDF and a collision-proof reference ID are generated automatically. Admins get a full CRM: real-time lead management, a live quotation calculator, notes, and one-click WhatsApp/call/email actions. Clients can track their own project status anytime, without needing an account.

> *"Not a Google Form. A professional onboarding experience."*

---

## ✨ Key Features

<div align="center">

| Feature | Description |
|---|---|
| 🧙 **6-Step Animated Wizard** | Business → Package → Features → Design → Content → Review, with autosave (resumes if the browser closes mid-form) |
| 📦 **3-Tier Package Selector** | Starter / Business / Premium pricing cards with a feature comparison table, domain & hosting kept clearly separate |
| 📁 **Real File Uploads** | Logo, photos, menu/price list — uploaded live to Supabase Storage with animated progress |
| 🔢 **Collision-Proof Reference IDs** | `MT-YYYY-XXXX` generated via an atomic Postgres function — no duplicates, ever |
| 📄 **Branded Bilingual PDF** | Auto-generated project requirement document, renders English *and* Bangla correctly (Noto Sans Bengali embedded) |
| 📬 **Automatic Confirmation Email** | Sent on submission via EmailJS — free tier, no backend server needed |
| 📍 **Client Status Tracker** | `/track` — clients check project progress by reference ID, with zero PII exposed |
| 🖥️ **Admin CRM Dashboard** | Paginated leads, search/filter, notes, priority & status pipeline, live quotation calculator |
| 💬 **WhatsApp-First Contact** | Floating WhatsApp button + one-click chat/call/email from every lead |
| 🔐 **Admin Allowlist Auth** | Email/password sign-in (Supabase Auth), gated by an explicit email allowlist enforced in Postgres Row Level Security — not just the UI |

</div>

---

## 🛠️ Tech Stack

<div align="center">

![React](https://img.shields.io/badge/React%2019-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind%20CSS%204-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-0055FF?style=flat-square&logo=framer&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![EmailJS](https://img.shields.io/badge/EmailJS-FF6C37?style=flat-square&logo=maildotru&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

</div>

---

## 🏗️ Project Structure

```
mt-web-studio/
├── 🎨 src/
│   ├── pages/                # Landing, 6-step wizard, /track, /admin
│   ├── components/
│   │   ├── ui/                # Magic UI-style blocks — border-beam, shimmer-button,
│   │   │                       marquee, spotlight-card, number-ticker, file-drop, save-toast
│   │   └── WhatsAppFloatingButton.tsx
│   ├── lib/
│   │   ├── pdf.tsx             # Bilingual branded PDF generator
│   │   ├── phone.ts            # +880 phone/WhatsApp normalization
│   │   ├── refId.ts            # Reference ID generation (calls Postgres RPC)
│   │   ├── leadMapper.ts       # camelCase (app) <-> snake_case (Postgres) conversion
│   │   ├── email.ts            # EmailJS confirmation email
│   │   └── translations.ts     # English/Bangla UI toggle
│   ├── assets/fonts/           # Noto Sans Bengali (for the PDF)
│   └── supabase.ts             # Supabase client
├── 🗄️ supabase-schema.sql       # Tables, RPC functions, triggers, RLS policies, storage bucket
├── seed.ts                     # Demo lead seeding script
├── vercel.json                 # SPA rewrite config
└── package.json
```

---

## 🔄 How It Works

```mermaid
graph LR
    A[🧙 Client fills 6-step wizard] -->|Submit| B[🔢 generate_reference_id RPC]
    B --> C[💾 Lead inserted into Postgres]
    C -->|DB trigger| D[📍 public_status auto-synced]
    C --> E[📄 Branded PDF generated]
    C --> F[📬 Confirmation email sent]
    C --> G[🔔 Admin dashboard updated live]
    G -->|Review + Quotation| H[📦 Status updated]
    D -->|Client checks| I[📍 /track]
```

---

## ⚙️ Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/Nayeem131136/mt-web-studio.git
cd mt-web-studio

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local
# then fill in the values (see "Setting up Supabase" below)

# 4. Run locally
npm run dev

# 5. Type-check before shipping
npm run lint
```

---

## 🗄️ Setting up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Open the **SQL Editor** → New Query → paste the **entire contents** of
   [`supabase-schema.sql`](./supabase-schema.sql) → **Run**. This creates the
   `leads` / `public_status` / `ref_counters` tables, the atomic reference-ID
   function, the auto-sync trigger, all Row Level Security policies, and the
   `uploads` storage bucket.
3. In the SQL you just ran, find `is_admin()` and replace
   `'admin@mtwebstudio.com'` with your real admin email — this is the actual
   security boundary (the app's client-side check is just a UX convenience).
4. **Authentication → Providers** → make sure **Email** is enabled.
5. **Authentication → Users → Add user** → create your admin login with the
   *same* email as in `is_admin()` and a password you'll remember.
6. **Project Settings → API** → copy your **Project URL** and **anon/publishable key**
   into `.env.local` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

Unlike Firebase, there's no separate "authorized domains" step for email/password
login — it works from any domain out of the box, so this alone fixes the
`auth/unauthorized-domain`-style headaches for good.

---

## 🚀 Deploy Your Own (Vercel)

```bash
git init
git add .
git commit -m "Initial commit: MT Web Studio CRM"
git branch -M main
git remote add origin https://github.com/Nayeem131136/mt-web-studio.git
git push -u origin main
```

Then on **[vercel.com/new](https://vercel.com/new)**:

1. Import the `mt-web-studio` repo
2. Add these environment variables under **Project Settings → Environment Variables**:

   | Variable | Value |
   |---|---|
   | `VITE_ADMIN_EMAILS` | your real admin email (comma-separated, no spaces) |
   | `VITE_SUPABASE_URL` | from Supabase → Project Settings → API |
   | `VITE_SUPABASE_ANON_KEY` | from Supabase → Project Settings → API |
   | `VITE_EMAILJS_SERVICE_ID` | your EmailJS service ID |
   | `VITE_EMAILJS_TEMPLATE_ID` | your EmailJS template ID |
   | `VITE_EMAILJS_PUBLIC_KEY` | your EmailJS public key |

3. Click **Deploy** 🚀

`vercel.json` already handles SPA routing (`/start`, `/track`, `/admin` won't 404 on
refresh). Every push to `main` auto-redeploys.

---

## 🧭 Usage

| Step | Action |
|---|---|
| 1️⃣ | Client opens `/start`, fills business info, picks a package |
| 2️⃣ | Selects requirements, design preferences, uploads logo/photos |
| 3️⃣ | Reviews everything on the final step, confirms, and submits |
| 4️⃣ | Gets a reference ID + PDF instantly, and a confirmation email shortly after |
| 5️⃣ | Admin logs in at `/admin` (email/password), prepares a quotation, updates status |
| 6️⃣ | Client checks progress anytime at `/track` using their reference ID |

---

## 🗺️ Roadmap

- [ ] Payment gateway integration (bKash/Nagad) for advance payments
- [ ] Multi-admin roles (staff accounts with limited permissions)
- [ ] Code-split `/admin` from the public `/start` bundle for faster mobile loads
- [ ] SMS confirmation as a fallback alongside email

---

## 👤 Developer

<div align="center">

| Name | Role | GitHub |
|---|---|---|
| **Md. Mahdi Hasan Nayeem** | 🏆 Creator & Developer | [@Nayeem131136](https://github.com/Nayeem131136) |

**Portfolio:** [mahdi-hasan-nayeem-portfolio.vercel.app](https://mahdi-hasan-nayeem-portfolio.vercel.app/)

</div>

---

<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:0a0a0a,50:4F46E5,100:0a0a0a&height=120&section=footer"/>

**⭐ Star this repo if it helped you! | 🍴 Fork to build your own**

[![GitHub stars](https://img.shields.io/github/stars/Nayeem131136/mt-web-studio?style=social)](https://github.com/Nayeem131136/mt-web-studio/stargazers)
&nbsp;
[![GitHub forks](https://img.shields.io/github/forks/Nayeem131136/mt-web-studio?style=social)](https://github.com/Nayeem131136/mt-web-studio/network/members)

*Built with 🖤 by Md. Mahdi Hasan Nayeem*

</div>
