# GPKarta

A custom web-based map application for creating and managing interactive maps, similar to uMap. Built with Leaflet.js + OpenStreetMap, React + TypeScript, and Node.js + SQLite.

## Features

- **Interactive maps** — full-screen Leaflet.js interface powered by OpenStreetMap tiles
- **Click to place markers** — click anywhere on the map to drop a pin
- **Rich marker info** — title, description, date, images, and category
- **Categories** — organise markers with custom names and colours
- **Filters** — filter markers by category and/or date range
- **User authentication** — each user manages their own maps with JWT auth
- **Embed support** — share any map as a read-only iframe with configurable zoom, centre, visible categories, and UI options
- **Responsive** — works on desktop and mobile
- **Zero Google** — no Google Maps, no Google APIs, no Google fonts

## Project Structure

```
GPKarta/
├── shared/          # Shared TypeScript types (no runtime)
├── server/          # Express + Prisma (SQLite) API
└── client/          # React + Vite + Leaflet frontend
```

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example server/.env
# Edit server/.env — set JWT_SECRET to something strong
```

### 3. Run database migration

```bash
cd server
npx prisma migrate dev
```

### 4. Start development servers

```bash
cd ..         # back to repo root
npm run dev   # starts both server (3001) and client (5173)
```

Open [http://localhost:5173](http://localhost:5173), register an account, and start mapping.

## API Overview

All authenticated endpoints require `Authorization: Bearer <token>`.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, get JWT |
| GET  | `/api/auth/me` | Current user |
| GET  | `/api/maps` | List my maps |
| POST | `/api/maps` | Create map |
| PATCH | `/api/maps/:id` | Update map |
| DELETE | `/api/maps/:id` | Delete map |
| POST | `/api/maps/:id/embed-token` | Generate embed token |
| DELETE | `/api/maps/:id/embed-token` | Revoke embed token |
| GET  | `/api/maps/:id/markers` | List markers (supports `?categoryId=&from=&to=`) |
| POST | `/api/maps/:id/markers` | Create marker |
| PATCH | `/api/maps/:id/markers/:mid` | Update marker |
| DELETE | `/api/maps/:id/markers/:mid` | Delete marker |
| GET  | `/api/maps/:id/categories` | List categories |
| POST | `/api/maps/:id/categories` | Create category |
| PATCH | `/api/maps/:id/categories/:cid` | Update category |
| DELETE | `/api/maps/:id/categories/:cid` | Delete category |
| POST | `/api/images/marker/:markerId` | Upload image |
| DELETE | `/api/images/:imageId` | Delete image |
| GET  | `/api/embed/:embedToken` | **Public** — embed data |

## Embedding

1. Open a map → click the `</>` button in the sidebar header
2. Click **Generate embed token**
3. Copy the iframe snippet and paste it into any CMS

```html
<iframe
  src="https://your-domain.com/embed/TOKEN"
  width="800" height="500"
  frameborder="0" allowfullscreen>
</iframe>
```

### Embed URL parameters

| Param | Description |
|-------|-------------|
| `zoom` | Override initial zoom (1–20) |
| `lat` / `lng` | Override initial centre |
| `category` | Comma-separated category IDs to show |
| `hideControls=true` | Hide zoom controls |
| `hideAttribution=true` | Hide attribution bar |

## Production Deployment

1. Change `JWT_SECRET` and `NODE_ENV=production` in `server/.env`
2. Build: `npm run build`
3. Serve `server/dist/index.js` with Node (or PM2)
4. Serve `client/dist/` as static files behind a reverse proxy (nginx/Caddy)
5. Point the proxy at `http://localhost:3001` for `/api` and `/uploads`
6. For production image storage, swap `server/src/controllers/images.controller.ts` to use S3/R2 — only the upload/delete service needs to change

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Leaflet.js, react-leaflet, Zustand, Axios
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: SQLite (dev) — swap to PostgreSQL by changing `provider` in `prisma/schema.prisma`
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Map tiles**: OpenStreetMap (no API key required)
