import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const checklistRouter = createTRPCRouter({
  myChecklist: protectedProcedure
    .input(
      z
        .object({
          category: z.string().optional(),
          spottedOnly: z.boolean().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const speciesFilter: Record<string, unknown> = {};
      if (input?.category) {
        speciesFilter.category = input.category;
      }

      const species = await ctx.db.species.findMany({
        where: speciesFilter,
        orderBy: { commonName: "asc" },
        include: {
          checklistItems: {
            where: { userId: ctx.session.user.id },
            take: 1,
          },
        },
      });

      const items = species.map((s) => {
        const item = s.checklistItems[0];
        return {
          speciesId: s.id,
          commonName: s.commonName,
          scientificName: s.scientificName,
          category: s.category,
          family: s.family,
          spotted: item?.spotted ?? false,
          sightingCount: item?.sightingCount ?? 0,
          firstSpottedAt: item?.firstSpottedAt ?? null,
        };
      });

      if (input?.spottedOnly) {
        return items.filter((i) => i.spotted);
      }

      return items;
    }),

  toggleSpotted: protectedProcedure
    .input(
      z.object({
        speciesId: z.string(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.checklistItem.findUnique({
        where: {
          userId_speciesId: {
            userId: ctx.session.user.id,
            speciesId: input.speciesId,
          },
        },
      });

      if (existing) {
        return ctx.db.checklistItem.update({
          where: { id: existing.id },
          data: {
            spotted: !existing.spotted,
            sightingCount: existing.spotted
              ? existing.sightingCount
              : existing.sightingCount + 1,
            firstSpottedAt: existing.spotted ? null : existing.firstSpottedAt ?? new Date(),
            lastLatitude: input.latitude ?? existing.lastLatitude,
            lastLongitude: input.longitude ?? existing.lastLongitude,
          },
        });
      }

      return ctx.db.checklistItem.create({
        data: {
          userId: ctx.session.user.id,
          speciesId: input.speciesId,
          spotted: true,
          sightingCount: 1,
          firstSpottedAt: new Date(),
          lastLatitude: input.latitude,
          lastLongitude: input.longitude,
        },
      });
    }),

  markFromSighting: protectedProcedure
    .input(
      z.object({
        speciesId: z.string(),
        latitude: z.number(),
        longitude: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.checklistItem.upsert({
        where: {
          userId_speciesId: {
            userId: ctx.session.user.id,
            speciesId: input.speciesId,
          },
        },
        update: {
          spotted: true,
          sightingCount: { increment: 1 },
          lastLatitude: input.latitude,
          lastLongitude: input.longitude,
        },
        create: {
          userId: ctx.session.user.id,
          speciesId: input.speciesId,
          spotted: true,
          sightingCount: 1,
          firstSpottedAt: new Date(),
          lastLatitude: input.latitude,
          lastLongitude: input.longitude,
        },
      });
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const total = await ctx.db.species.count();
    const spotted = await ctx.db.checklistItem.count({
      where: { userId: ctx.session.user.id, spotted: true },
    });

    const byCategory = await ctx.db.species.groupBy({
      by: ["category"],
      _count: true,
    });

    const spottedByCategory = await ctx.db.checklistItem.findMany({
      where: { userId: ctx.session.user.id, spotted: true },
      include: { species: { select: { category: true } } },
    });

    const spottedCounts = spottedByCategory.reduce(
      (acc, item) => {
        const cat = item.species.category;
        acc[cat] = (acc[cat] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const categories = byCategory.map((c) => ({
      category: c.category,
      total: c._count,
      spotted: spottedCounts[c.category] ?? 0,
    }));

    return { total, spotted, categories };
  }),
});
