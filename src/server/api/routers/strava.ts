import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  fetchStravaActivities,
  fetchStravaActivity,
  fetchStravaActivityPhotos,
  fetchStravaActivityStreams,
  getStravaAccessToken,
} from "~/server/strava";

export const stravaRouter = createTRPCRouter({
  connectionStatus: protectedProcedure.query(async ({ ctx }) => {
    const account = await ctx.db.stravaAccount.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!account) {
      return { connected: false as const, athlete: null };
    }

    return {
      connected: true as const,
      athlete: {
        id: account.athleteId,
        firstName: account.firstName,
        lastName: account.lastName,
        profileImageUrl: account.profileImageUrl,
      },
    };
  }),

  activities: protectedProcedure
    .input(
      z
        .object({
          page: z.number().min(1).default(1),
          perPage: z.number().min(1).max(100).default(30),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const accessToken = await getStravaAccessToken(ctx.session.user.id);

      if (!accessToken) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "No Strava account linked. Please connect your Strava account first.",
        });
      }

      try {
        const rawActivities = await fetchStravaActivities(
          accessToken,
          input?.page ?? 1,
          input?.perPage ?? 30,
        );

        return rawActivities.map((a) => ({
          id: a.id,
          name: a.name,
          sportType: a.sport_type,
          startDate: a.start_date,
          startDateLocal: a.start_date_local,
          distance: a.distance,
          movingTime: a.moving_time,
          elapsedTime: a.elapsed_time,
          totalElevationGain: a.total_elevation_gain,
          averageSpeed: a.average_speed,
          maxSpeed: a.max_speed,
          startLatlng: a.start_latlng,
          map: {
            id: a.map.id,
            summaryPolyline: a.map.summary_polyline,
          },
        }));
      } catch (err) {
        if (err instanceof Error && err.message.includes("401")) {
          await ctx.db.stravaAccount.delete({
            where: { userId: ctx.session.user.id },
          });
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Strava session expired. Please reconnect your Strava account.",
          });
        }
        throw err;
      }
    }),

  importActivity: protectedProcedure
    .input(z.object({ activityId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const accessToken = await getStravaAccessToken(ctx.session.user.id);

      if (!accessToken) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "No Strava account linked. Please connect your Strava account first.",
        });
      }

      try {
        const [activity, streams, photos] = await Promise.all([
          fetchStravaActivity(accessToken, input.activityId),
          fetchStravaActivityStreams(accessToken, input.activityId),
          fetchStravaActivityPhotos(accessToken, input.activityId).catch(() => []),
        ]);

        const startDate = new Date(activity.start_date);
        const route = streams.latlng.map(([lat, lng], i) => ({
          lat,
          lng,
          timestamp: new Date(
            startDate.getTime() + (streams.time[i] ?? 0) * 1000,
          ).toISOString(),
        }));

        if (route.length < 2) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Activity has insufficient GPS data to create a drive.",
          });
        }

        const drivePhotos = photos.map((p) => ({
          url: p.urls["600"] ?? Object.values(p.urls)[0] ?? "",
          lat: p.location?.[0] ?? null,
          lng: p.location?.[1] ?? null,
          caption: p.caption || null,
        }));

        const firstPoint = route[0]!;
        const lastPoint = route[route.length - 1]!;

        const drive = await ctx.db.driveSession.create({
          data: {
            userId: ctx.session.user.id,
            lodgeId: ctx.session.user.lodgeId,
            route,
            photos: drivePhotos,
            startedAt: new Date(firstPoint.timestamp),
            endedAt: new Date(lastPoint.timestamp),
            notes: activity.name,
          },
        });

        return { driveId: drive.id };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        if (err instanceof Error && err.message.includes("401")) {
          await ctx.db.stravaAccount.delete({
            where: { userId: ctx.session.user.id },
          });
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Strava session expired. Please reconnect your Strava account.",
          });
        }
        throw err;
      }
    }),

  disconnect: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.stravaAccount.deleteMany({
      where: { userId: ctx.session.user.id },
    });
    return { disconnected: true };
  }),
});
