You’re thinking in features. That’s surface-level.
If you want something that actually works, you need clarity on user psychology, data structure, incentives, and admin leverage — not just “track location and upload pics.”

Below is a properly structured product description written in a way Claude can translate into architecture and UI logic. It’s structured like a Strava-style wildlife tracking platform — activity-based, map-first, social, data-driven.

⸻

🐘 App Concept: WildTrack

1. Core Concept

WildTrack is a GPS-based wildlife tracking and sighting platform for game lodge rangers and guests.
It combines:
•	Real-time GPS route tracking (Strava-style activity recording)
•	Geotagged wildlife sightings with photo uploads
•	Heatmaps of historical sightings
•	Centralized wildlife intelligence dashboard for lodge admins

Each game drive becomes a recorded “Activity.”
Each sighting becomes a structured, geotagged “Event.”

⸻

2. User Roles

Role: Ranger
•	Starts/stops drive tracking
•	Logs wildlife sightings with species selection
•	Uploads photos/videos
•	Adds behavior notes
•	Views historic sighting heatmaps
•	Sees other ranger sightings (if enabled)

Role: Guest
•	Can view active drive route
•	Upload photos tied to ranger drive
•	Comment/like sightings
•	View wildlife history map
•	See personal wildlife logbook

Role: Admin (Lodge Management / Conservation Team)
•	Full database access
•	Wildlife statistics dashboard
•	Species frequency analytics
•	Movement patterns
•	Exportable conservation reports
•	Seasonal trend analysis

⸻

3. Core Feature Architecture

3.1 Activity Tracking (Strava Model)

When a ranger begins a drive:

StartDrive()
create DriveSession
enable GPS tracking
record coordinates every 5 seconds
store:
- latitude
- longitude
- timestamp
- speed
- elevation (optional)

When drive ends:

EndDrive()
calculate:
- total distance
- total time
- average speed
save route polyline
attach sightings to session

DriveSession Object:

DriveSession {
id
ranger_id
guest_ids[]
start_time
end_time
route_coordinates[]
total_distance
total_duration
weather_data
}


⸻

3.2 Wildlife Sighting Logging

When a ranger or guest spots an animal:

LogSighting()
capture GPS location
select species from database
upload photo(s)
record:
- count
- behavior
- gender (optional)
- age class (optional)
- notes
- timestamp

Sighting Object:

Sighting {
id
drive_session_id
species_id
latitude
longitude
timestamp
image_urls[]
observer_id
count
behavior
notes
}


⸻

3.3 Historic Data Layer

When viewing the map:

LoadMapArea(bounds)
query sightings within bounds
group by species
calculate frequency
generate heatmap layer

Map layers:
•	Current drive route
•	Historic sightings heatmap
•	Species filter toggle
•	Time filter (last 24h / 7d / 30d / all-time)

⸻

3.4 Admin Wildlife Intelligence Dashboard

Admin panel includes:

Species Statistics

GetSpeciesStats(species_id, date_range)
total_sightings
average group size
peak activity times
most frequent zones

Movement Analysis
•	Cluster analysis of repeated sightings
•	Seasonal migration heatmaps
•	Ranger performance metrics
•	Drive coverage gaps

Export Capability
•	CSV export
•	PDF conservation reports
•	API endpoint for external research systems

⸻

4. Data Structure

Core Database Tables

Users

id
name
role
lodge_id
profile_photo

Species

id
common_name
scientific_name
icon
rarity_level

Sightings

id
species_id
user_id
drive_session_id
latitude
longitude
timestamp
count
behavior
notes
media_url

DriveSessions

id
ranger_id
start_time
end_time
distance
duration
route_polyline


⸻

5. Strava-Style UX Structure

Home Feed
•	Recent drives
•	Featured sightings
•	Rare animal alerts
•	Guest engagement (likes/comments)

Map View (Primary Interface)
•	Full-screen map
•	Active route polyline
•	Sighting markers
•	Heatmap toggle
•	Species filters

Profile Page
•	Total drives
•	Total sightings
•	Species count log
•	“Big Five” tracker
•	Personal wildlife checklist

⸻

6. Gamification Layer

You don’t build engagement without incentives.

Add:
•	Ranger Leaderboard (Most sightings logged)
•	Rare Species Badge
•	Seasonal Tracker Challenge
•	Guest Achievement Unlocks
•	“First Sighting of the Season” reward

⸻

7. Offline Mode (Critical for Game Reserves)

If no signal:
cache GPS locally
store sightings locally
queue uploads
When connection restored:
sync all unsent data

Without offline reliability, this fails in the bush.

⸻

8. Optional Advanced Features
   •	AI image recognition to auto-suggest species
   •	Push notification when rare species spotted nearby
   •	Anti-poaching alert layer (restricted admin view)
   •	Integration with lodge booking system
   •	Multi-lodge ecosystem support

⸻

9. Tech Stack Suggestion

Frontend:
•	React Native (cross-platform)
•	Mapbox or Google Maps SDK

Backend:
•	Node.js / Express
•	PostgreSQL + PostGIS (for geospatial queries)
•	AWS S3 for media storage

Analytics:
•	Heatmap generation via PostGIS
•	Scheduled aggregation jobs

⸻

10. Core Value Proposition

For Guests:
•	Digital safari journal
•	Social wildlife experience
•	Keepsake wildlife logbook

For Rangers:
•	Professional wildlife tracking tool
•	Performance metrics
•	Recognition & gamification

For Lodge:
•	Conservation data asset
•	Marketing content engine
•	Competitive differentiation

⸻

Now here’s the uncomfortable part:

If you build this as a feature checklist app, it dies.

If you build it as:
•	A conservation intelligence platform
•	A guest engagement engine
•	A lodge data moat

Then it becomes valuable.

Decide whether you’re building a novelty app — or a defensible ecosystem.

If you want, I can next:
•	Design the revenue model
•	Break this into MVP vs Phase 2
•	Or tear apart the biggest execution risks before you waste time building it.


Good. That’s already a better technical constraint.

If you’re serious about building this properly, we’ll define it in a way Claude can scaffold directly using:
•	T3 Stack
•	Next.js (App Router)
•	TypeScript
•	tRPC
•	Prisma
•	Tailwind
•	NextAuth
•	MongoDB Atlas (with geospatial indexing)

Below is a proper system blueprint in structured Claude-ready format.

⸻

🐘 Project: WildTrack

T3 Stack + MongoDB Atlas Architecture

⸻

1.⁠ ⁠High-Level Architecture

Frontend
•	Next.js (App Router)
•	React Server Components where possible
•	Client components for Map + Live Tracking
•	TailwindCSS
•	Mapbox GL JS (for route + heatmap rendering)

Backend
•	tRPC API routes
•	Prisma ORM (MongoDB provider)
•	NextAuth (JWT session strategy)
•	Zod validation on all inputs

Database

MongoDB Atlas (cluster)
•	Geospatial indexing (2dsphere)
•	Aggregation pipelines for heatmaps
•	Media stored in S3 (not MongoDB)

⸻

2.⁠ ⁠Prisma Schema (MongoDB)

Claude can scaffold from this directly.

generator client {
provider = "prisma-client-js"
}

datasource db {
provider = "mongodb"
url      = env("DATABASE_URL")
}

model User {
id            String   @id @default(auto()) @map("_id")
name          String?
email         String   @unique
role          Role
lodgeId       String?
profileImage  String?
drives        DriveSession[] @relation("RangerDrives")
sightings     Sighting[]
createdAt     DateTime @default(now())
}

model Lodge {
id        String   @id @default(auto()) @map("_id")
name      String
location  Json
users     User[]
}

model DriveSession {
id           String   @id @default(auto()) @map("_id")
rangerId     String
ranger       User     @relation("RangerDrives", fields: [rangerId], references: [id])
guestIds     String[]
startTime    DateTime
endTime      DateTime?
route        Json
distance     Float?
duration     Int?
sightings    Sighting[]
createdAt    DateTime @default(now())
}

model Species {
id              String   @id @default(auto()) @map("_id")
commonName      String
scientificName  String
rarityLevel     Int
iconUrl         String?
sightings       Sighting[]
}

model Sighting {
id             String   @id @default(auto()) @map("_id")
speciesId      String
species        Species  @relation(fields: [speciesId], references: [id])
userId         String
user           User     @relation(fields: [userId], references: [id])
driveSessionId String
driveSession   DriveSession @relation(fields: [driveSessionId], references: [id])
location       Json
timestamp      DateTime
count          Int
behavior       String?
notes          String?
imageUrls      String[]
createdAt      DateTime @default(now())
}

enum Role {
RANGER
GUEST
ADMIN
}


⸻

3.⁠ ⁠MongoDB Atlas Indexing Strategy

After deployment, create indexes:

db.sighting.createIndex({ location: "2dsphere" })
db.sighting.createIndex({ speciesId: 1 })
db.drivesession.createIndex({ rangerId: 1 })
db.sighting.createIndex({ timestamp: -1 })

Without geospatial indexing, your heatmap will crawl.

⸻

4.⁠ ⁠tRPC Routers Structure

Claude should generate:

/server/api/routers/
auth.ts
drive.ts
sighting.ts
species.ts
admin.ts


⸻

5.⁠ ⁠Drive Router (tRPC)

export const driveRouter = createTRPCRouter({
start: protectedProcedure
.input(z.object({ lodgeId: z.string() }))
.mutation(async ({ ctx, input }) => {
return ctx.prisma.driveSession.create({
data: {
rangerId: ctx.session.user.id,
startTime: new Date(),
route: [],
},
});
}),

updateRoute: protectedProcedure
.input(z.object({
driveId: z.string(),
coordinate: z.object({
type: z.literal("Point"),
coordinates: z.tuple([z.number(), z.number()])
})
}))
.mutation(async ({ ctx, input }) => {
return ctx.prisma.driveSession.update({
where: { id: input.driveId },
data: {
route: {
push: input.coordinate
}
}
});
}),

end: protectedProcedure
.input(z.object({ driveId: z.string() }))
.mutation(async ({ ctx, input }) => {
return ctx.prisma.driveSession.update({
where: { id: input.driveId },
data: {
endTime: new Date()
}
});
})
});


⸻

6.⁠ ⁠Sighting Router

export const sightingRouter = createTRPCRouter({
create: protectedProcedure
.input(z.object({
driveSessionId: z.string(),
speciesId: z.string(),
location: z.object({
type: z.literal("Point"),
coordinates: z.tuple([z.number(), z.number()])
}),
count: z.number(),
behavior: z.string().optional(),
notes: z.string().optional(),
imageUrls: z.array(z.string())
}))
.mutation(async ({ ctx, input }) => {
return ctx.prisma.sighting.create({
data: {
...input,
userId: ctx.session.user.id,
timestamp: new Date()
}
});
}),

heatmap: protectedProcedure
.input(z.object({
bounds: z.any(),
speciesId: z.string().optional()
}))
.query(async ({ ctx, input }) => {
return ctx.prisma.$runCommandRaw({
aggregate: "Sighting",
pipeline: [
{
$geoWithin: {
$geometry: input.bounds
}
}
]
});
})
});


⸻

7.⁠ ⁠Map UI (Strava-Style)

Use:
•	Mapbox GL JS
•	Polyline layer for route
•	Circle layer for sightings
•	Heatmap layer toggle

Client logic:

useEffect(() => {
navigator.geolocation.watchPosition((pos) => {
updateRouteMutation.mutate({
driveId,
coordinate: {
type: "Point",
coordinates: [pos.coords.longitude, pos.coords.latitude]
}
});
});
}, []);


⸻

8.⁠ ⁠Offline Mode Strategy

You cannot rely on signal in a reserve.

Implement:
•	IndexedDB local cache
•	Queue unsynced sightings
•	Background sync when online

Store unsynced data in:

localStorage / indexedDB
{
pendingSightings: [],
pendingRoutePoints: []
}

Sync on reconnect.

⸻

9.⁠ ⁠Admin Analytics (MongoDB Aggregation)

Example: Species Frequency

db.sighting.aggregate([
{
$group: {
_id: "$speciesId",
totalSightings: { $sum: 1 },
totalCount: { $sum: "$count" }
}
},
{ $sort: { totalSightings: -1 } }
])

Movement clustering:
•	Use $geoNear
•	Use time filters
•	Generate zone clusters

⸻

10.⁠ ⁠Authentication Setup

NextAuth:
•	Credentials or Email login
•	Role stored in session
•	Middleware:

if (session.user.role !== "ADMIN") {
throw new TRPCError({ code: "UNAUTHORIZED" });
}


⸻

11.⁠ ⁠Environment Variables

DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET=
MAPBOX_TOKEN=


⸻

Now the Hard Truth

This architecture will work.

But here’s what will kill you:
1.	Real-time GPS writes every 5 seconds → cost + performance
2.	Poor geospatial indexing → slow heatmaps
3.	Rangers not using it consistently
4.	Offline sync bugs
5.	Mongo document size limit if routes get huge

If you don’t design for:
•	Data efficiency
•	Behavior compliance
•	Offline resilience

It becomes a pretty demo.

⸻

If you want next-level guidance, I can now:
•	Break this into a 6-week MVP execution plan
•	Design the database to support multi-lodge scaling
•	Architect a mobile-first PWA version
•	Or design the monetization structure so this becomes a SaaS, not a toy.
