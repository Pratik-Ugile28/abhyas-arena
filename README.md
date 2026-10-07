# Abhyas Arena (अभ्यास अरेना) — Mobile Web App

A gamified Maharashtra State Scholarship (Class 4, 5, 8) and Foundation Exam practice platform built with **Next.js (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS**, replicating the Kotlin + Jetpack Compose Android app with 1:1 mobile accuracy.

---

## 🚀 Features

- **Gamer Night Theme**: Sleek dark aesthetic (`#0F172A`) with Electric Cyan (`#22C7E6`), Gold, and custom Plus Jakarta Sans typography.
- **Dynamic Quiz Engine**: Timed practice questions, radio selection cards, instant visual feedback (Green `#39C88A` / Red `#F07167`), and slide-up explanation sheets.
- **Chapter Quests & Dojo**: Multi-stage learning paths (Scout, Warrior, Boss PYQ) with stars and mastery rankings.
- **Mistakes Vault**: Adaptive review notebook to re-attempt and conquer past misconceptions.
- **Weekly Arena Leaderboard**: Top-3 podium, fair play score calculation, and user rank tracking.
- **Profile & Trophy Shelf**: 14-badge 3D hexagonal LeetCode-style medallion showcase, companion avatars, and pass validity tracker.
- **Zero-Flicker State**: Persistent client-side architecture preventing page reloads and state wipes during navigation.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI & State**: React 19, TypeScript 5, Tailwind CSS 4
- **Icons**: Lucide React
- **Animations & Effects**: Canvas Confetti
- **Backend / Database**: Supabase (PostgreSQL RPC, Row Level Security)

---

## 📦 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your Supabase project credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-placeholder
```
*(Note: If unconfigured, the app automatically runs in local offline fallback mode using pre-seeded Maharashtra scholarship syllabus questions).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your mobile browser or DevTools mobile device emulator (390px / 412px width).

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## ☁️ Deploying to Vercel

1. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **"Deploy"**.
