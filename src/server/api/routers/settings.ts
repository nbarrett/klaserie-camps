import { z } from "zod";
import { createTRPCRouter, adminProcedure, protectedProcedure } from "~/server/api/trpc";

export const settingsRouter = createTRPCRouter({
  getStrava: adminProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.appSettings.findMany({
      where: { key: { in: ["strava_client_id", "strava_client_secret"] } },
    });
    const clientId = rows.find((r) => r.key === "strava_client_id")?.value ?? "";
    const clientSecret = rows.find((r) => r.key === "strava_client_secret")?.value ?? "";
    return {
      clientId,
      clientSecret,
      configured: clientId.length > 0 && clientSecret.length > 0,
    };
  }),

  setStrava: adminProcedure
    .input(
      z.object({
        clientId: z.string().min(1),
        clientSecret: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.appSettings.upsert({
        where: { key: "strava_client_id" },
        update: { value: input.clientId },
        create: { key: "strava_client_id", value: input.clientId },
      });
      await ctx.db.appSettings.upsert({
        where: { key: "strava_client_secret" },
        update: { value: input.clientSecret },
        create: { key: "strava_client_secret", value: input.clientSecret },
      });
      return { success: true };
    }),

  stravaConfigured: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.appSettings.findMany({
      where: { key: { in: ["strava_client_id", "strava_client_secret"] } },
    });
    const clientId = rows.find((r) => r.key === "strava_client_id")?.value ?? "";
    const clientSecret = rows.find((r) => r.key === "strava_client_secret")?.value ?? "";
    return { configured: clientId.length > 0 && clientSecret.length > 0 };
  }),
});
