# ArcVault — Frontend

A modern, fully-typed banking dashboard built with **Next.js 14 (App Router)** and **TypeScript**. ArcVault lets users link bank accounts, track balances, review categorized transactions, move money between accounts, and visualize spending — all wrapped in a responsive, animated, dark-mode-ready interface.

> This is the client for the ArcVault platform. It talks to a separate [Node.js + Express + Prisma API](../backend) over a typed REST layer with JWT auth and automatic token refresh.

---

## Demo

**Live demo:** _add your deployment URL here_

**Demo credentials** (pre-seeded — no signup required):

| Email                 | Password      | What you'll see                                        |
| --------------------- | ------------- | ------------------------------------------------------ |
| `tommy@arcvault.dev`  | `Password123` | Two linked accounts (~$57k), 30 transactions, a transfer |
| `jane@arcvault.dev`   | `Password123` | A single checking account — good for the transfer flow |

Sign in as **`tommy@arcvault.dev`** for the richest walkthrough.

---

## Features

- **Account dashboard** — total balance across banks with an animated counter, a per-account breakdown, and a live recent-transactions feed.
- **Bank management** — link, view, and remove accounts; a simulated Plaid-style connection flow so the demo works without real bank credentials.
- **Money transfers** — send funds by email or shareable account ID, with client-side validation before the request ever hits the API.
- **Transaction & transfer history** — server-paginated tables with category, channel, and status badges.
- **Spending analytics** — category breakdown rendered as an interactive doughnut chart.
- **Profile & settings** — edit user details against the live API.
- **Dark mode** — system-aware theme toggle that persists across sessions.
- **Responsive by default** — dedicated desktop sidebar, mobile nav sheet, and a contextual right rail.
- **Polished loading states** — skeleton placeholders and Framer Motion transitions instead of layout-shifting spinners.

---

## Tech Stack

| Concern            | Choice                                                        |
| ------------------ | ------------------------------------------------------------- |
| Framework          | Next.js 14 (App Router, route groups, server/client split)    |
| Language           | TypeScript                                                    |
| Styling            | Tailwind CSS + `tailwind-merge` / `class-variance-authority`  |
| UI primitives      | shadcn/ui on Radix UI (dialog, select, tabs, progress, label) |
| Forms & validation | React Hook Form + Zod (shared schema types with the backend)  |
| Data viz           | Chart.js via `react-chartjs-2`                                |
| Animation          | Framer Motion, `react-countup`                                |
| Theming            | `next-themes`                                                 |
| Notifications      | `sonner` toasts                                               |
| Icons              | `lucide-react`                                                |

---

## Architecture Highlights

### Typed API client with transparent token refresh

All network calls go through a single fetch wrapper in [`lib/api.ts`](lib/api.ts). Every endpoint is a typed function (`apiLogin`, `apiGetAccounts`, `apiCreateTransfer`, …) returning a discriminated `ApiResponse<T>`, so components never touch raw `fetch` or `any`.

The wrapper handles auth invisibly: it attaches the bearer token, and on a `401` it automatically calls `/auth/refresh`, retries the original request with the rotated token, and only redirects to sign-in if the refresh itself fails. Components stay blissfully unaware of token lifecycles.

```ts
// One call. Refresh, retry, and redirect are handled underneath.
const res = await apiGetAccounts();
if (res.success) setAccounts(res.data.accounts);
```

### Route-group layouts

The App Router is split into two groups: `(auth)` for the signed-out sign-in/sign-up experience and `(root)` for the authenticated shell (sidebar + right rail + mobile nav). Each group owns its own `layout.tsx`, so the two experiences never leak styling or navigation into each other.

### Client auth state

A lightweight `useAuth` hook ([`lib/hooks/useAuth.tsx`](lib/hooks/useAuth.tsx)) exposes the current user and gates protected pages, while the httpOnly refresh cookie keeps the long-lived credential out of JavaScript's reach.

### Perceived performance

Data-loading pages render skeletons that mirror the real layout, then cross-fade to content with Framer Motion — no spinners, no layout shift.

---

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/                 # Signed-out routes
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (root)/                 # Authenticated app shell
│   │   ├── page.tsx            # Dashboard
│   │   ├── payment-transfer/
│   │   ├── transfer-history/
│   │   ├── transaction-history/
│   │   ├── analytics/
│   │   ├── my-banks/
│   │   └── settings/
│   └── layout.tsx              # Root layout + ThemeProvider
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── Sidebar.tsx / MobileNav.tsx / RightSidebar.tsx
│   ├── TotalBalanceBox.tsx / AnimatedCounter.tsx
│   ├── TransactionsTable.tsx / RecentTransactions.tsx
│   ├── PaymentTransferForm.tsx / AuthForm.tsx
│   └── DoughnutChart.tsx / ...
├── lib/
│   ├── api.ts                  # Typed API client + token refresh
│   └── hooks/useAuth.tsx       # Auth state
└── public/icons/               # SVG asset set
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- The [ArcVault backend](../backend) running locally (default: `http://localhost:5000`)

### Setup

```bash
# From the frontend/ directory
npm install

# Point the client at your API
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# Start the dev server
npm run dev
```

The app runs at **http://localhost:3000**.

> Make sure the backend is running and its database has been seeded (`npm run db:seed` in `backend/`) so the demo credentials above work.

### Scripts

| Command         | Description                     |
| --------------- | ------------------------------- |
| `npm run dev`   | Start the dev server            |
| `npm run build` | Production build                |
| `npm run start` | Serve the production build      |
| `npm run lint`  | Lint with `eslint-config-next`  |

---

## Built By

**Tommy** — Software Developer | Cybersecurity Professional
