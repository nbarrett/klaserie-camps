import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const lodgeRouter = createTRPCRouter({
    list: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.lodge.findMany({
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        });
    }),

    mine: protectedProcedure.query(async ({ctx}) => {
        return ctx.db.lodge.findUniqueOrThrow({
            where: {id: ctx.session.user.lodgeId},
        });
    }),
});
