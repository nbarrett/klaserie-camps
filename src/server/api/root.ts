import { checklistRouter } from "~/server/api/routers/checklist";
import { driveRouter } from "~/server/api/routers/drive";
import { lodgeRouter } from "~/server/api/routers/lodge";
import { sightingRouter } from "~/server/api/routers/sighting";
import { speciesRouter } from "~/server/api/routers/species";
import { stravaRouter } from "~/server/api/routers/strava";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  checklist: checklistRouter,
  drive: driveRouter,
  lodge: lodgeRouter,
  sighting: sightingRouter,
  species: speciesRouter,
  strava: stravaRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
