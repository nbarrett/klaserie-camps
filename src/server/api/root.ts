import { checklistRouter } from "~/server/api/routers/checklist";
import { driveRouter } from "~/server/api/routers/drive";
import { sightingRouter } from "~/server/api/routers/sighting";
import { speciesRouter } from "~/server/api/routers/species";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  checklist: checklistRouter,
  drive: driveRouter,
  sighting: sightingRouter,
  species: speciesRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
