# WildTrack - Klaserie Camps

A real-time wildlife tracking application for game guides at Klaserie Private Nature Reserve. Guides log into their lodge, start a game drive, and the app tracks their GPS route while they record wildlife sightings along the way. Each guide maintains a personal species checklist that updates automatically as they log sightings.

## Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Language:** TypeScript (strict mode, zero JS)
- **Styling:** Tailwind CSS 4
- **API:** tRPC 11 (end-to-end type safety)
- **Database:** MongoDB Atlas via Prisma ORM
- **Auth:** NextAuth 5 (credentials provider, bcrypt)
- **Maps:** Leaflet + React-Leaflet (OpenStreetMap & Esri satellite imagery)
- **Package Manager:** pnpm

## Features

### Game Drive Tracking
- Start/end drive sessions with real-time GPS recording
- Route tracked every 10 seconds via browser Geolocation API
- Interactive map showing live position, route polyline, and sighting markers
- Tap the map to log a sighting at any location

### Wildlife Sighting Log
- Search species by name with autocomplete
- Record count, notes, and GPS coordinates per sighting
- Sightings linked to the active drive session and guide

### Personal Species Checklist
- 400+ pre-loaded species (mammals, birds, reptiles)
- Progress tracking: percentage complete, breakdown by category
- Auto-updates when sightings are logged
- Filter by category, search, or spotted-only view

### Drive History
- Browse past drives for the entire lodge
- View full route playback with all sightings on the map
- See guide name, duration, sighting count, and notes

### Authentication & Roles
- Email/password login per guide
- Roles: ADMIN, GUIDE, VIEWER
- Each user belongs to a lodge

## Project Structure

```
src/
  app/                        # Next.js App Router pages
    _components/              # Shared UI components
      gps-tracker.tsx         # GPS tracking hook (Geolocation API)
      home-content.tsx        # Landing page content
      map.tsx                 # Leaflet map with route/sighting layers
      nav.tsx                 # Bottom navigation bar
      session-provider.tsx    # NextAuth session wrapper
      sighting-form.tsx       # Modal form for logging sightings
    api/                      # API route handlers
      auth/[...nextauth]/     # NextAuth endpoints
      trpc/[trpc]/            # tRPC endpoint
    auth/signin/              # Sign-in page
    checklist/                # Species checklist page
    drive/                    # Active drive session page
    drives/                   # Drive history list
    drives/[id]/              # Drive detail/review page
    layout.tsx                # Root layout
    page.tsx                  # Home page
  server/
    api/
      root.ts                 # tRPC router aggregation
      routers/
        checklist.ts          # Checklist CRUD + stats
        drive.ts              # Drive session management + GPS points
        sighting.ts           # Sighting CRUD
        species.ts            # Species catalogue + search
    auth/
      config.ts               # NextAuth config (credentials, JWT, roles)
      index.ts                # Auth utility exports
    db.ts                     # Prisma client singleton
    trpc.ts                   # tRPC context + middleware
  trpc/                       # tRPC client setup
  styles/globals.css          # Tailwind global styles
  env.ts                      # Environment variable validation (Zod)
prisma/
  schema.prisma               # Database schema (6 models)
  seed.ts                     # Seed data (400+ species, default admin)
```

## Data Models

| Model | Purpose |
|-------|---------|
| **User** | Guide account with role and lodge assignment |
| **Lodge** | Base location with GPS coordinates |
| **Species** | Wildlife catalogue (common name, scientific name, category, family) |
| **DriveSession** | Game drive with route (JSON array of GPS points), start/end times |
| **Sighting** | Individual wildlife observation linked to drive, species, and location |
| **ChecklistItem** | Per-user species tracking (spotted, count, first sighted date) |

## Getting Started

### Prerequisites

- Node.js >= 22
- pnpm (installed automatically by dev scripts if missing)
- A MongoDB Atlas cluster (or any MongoDB instance)

### Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your values:

```
AUTH_SECRET="<generate with: npx auth secret>"
DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority"
```

### Quick Start

The dev scripts handle dependency installation, Prisma client generation, schema push, and server startup in one command.

**macOS / Linux:**
```bash
./run-dev.sh
```

**Windows (PowerShell):**
```powershell
.\run-dev.ps1
```

**Windows (Command Prompt):**
```cmd
run-dev.bat
```

The server starts at **http://localhost:3000**.

### Stopping

**macOS / Linux:**
```bash
./kill-dev.sh
```

**Windows:**
```powershell
.\kill-dev.ps1
```

### Seeding the Database

After the schema is pushed, seed with species data and a default admin user:

```bash
pnpm db:seed
```

Default admin credentials:
- Email: `admin@klaserie.co.za`
- Password: `admin123`

### Manual Setup (Alternative)

```bash
pnpm install
pnpm exec prisma generate
pnpm exec prisma db push
pnpm db:seed
pnpm dev
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start Next.js dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm typecheck` | Run TypeScript type checker |
| `pnpm db:push` | Push Prisma schema to database |
| `pnpm db:generate` | Generate Prisma migrations |
| `pnpm db:migrate` | Deploy Prisma migrations |
| `pnpm db:studio` | Open Prisma Studio (database GUI) |
| `pnpm db:seed` | Seed species and default admin user |

## Cross-Platform Dev Scripts

The project includes dev scripts for macOS, Linux, and Windows that:

- Detect and validate Node.js version (>=22) via nvm or system install
- Install pnpm if not present
- Verify `.env` exists
- Check port availability (default 3000, override with `DEV_PORT`)
- Install dependencies and generate Prisma client
- Push schema to MongoDB
- Clear Next.js cache and start dev server
- Clean shutdown on Ctrl+C
