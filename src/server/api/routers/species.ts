import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const speciesRouter = createTRPCRouter({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.species.findMany({
      orderBy: { commonName: "asc" },
    });
  }),

  byCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.species.findMany({
        where: { category: input.category },
        orderBy: { commonName: "asc" },
      });
    }),

  categories: publicProcedure.query(async ({ ctx }) => {
    const species = await ctx.db.species.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });
    return species.map((s) => s.category);
  }),

  create: protectedProcedure
    .input(
      z.object({
        commonName: z.string().min(1),
        scientificName: z.string().optional(),
        category: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.species.create({ data: input });
    }),

  search: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.species.findMany({
        where: {
          commonName: { contains: input.query, mode: "insensitive" },
        },
        orderBy: { commonName: "asc" },
        take: 20,
      });
    }),
});
