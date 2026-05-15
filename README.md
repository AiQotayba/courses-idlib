# Courses monorepo

Educational / ads-course platform: **API** (Express + MongoDB), **web** (Next.js), **admin** (Next.js), **mobile** (Expo), and shared **packages**.

## Prerequisites

- Node 20+
- [pnpm](https://pnpm.io) 9
- MongoDB (local URI works)

## Setup

1. Copy `.env.example` to `apps/backend/.env` and set `MONGODB_URI` and `JWT_SECRET` (see file for other vars).
2. Copy env for frontends: `NEXT_PUBLIC_API_URL=http://localhost:4000` in `apps/web/.env.local` and `apps/admin/.env.local`. For admin, add `NEXT_PUBLIC_WEB_APP_URL=http://localhost:3000` (link “open public site”).
3. Install and seed:

```bash
pnpm install
pnpm --filter backend seed
```

4. Run everything (in separate terminals or use Turbo filters):

```bash
pnpm --filter backend dev
pnpm --filter web dev
pnpm --filter admin dev
pnpm --filter mobile start
```

- Web: http://localhost:3000  
- Admin: http://localhost:3001 (seed admin: `admin@example.com` / `Admin12345!`)  
- API: http://localhost:4000  

## Build

```bash
pnpm build
```

Mobile is included in the workspace; use `pnpm --filter mobile start` for Expo. For Android/iOS emulators, set `EXPO_PUBLIC_API_URL` to your machine’s LAN IP so the device can reach the API.
