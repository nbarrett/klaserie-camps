import { createTRPCRouter, protectedProcedure, } from "~/server/api/trpc";

export const lodgeRouter = createTRPCRouter({
    mine: protectedProcedure.query(async ({ctx}) => {
        return ctx.db.lodge.findUniqueOrThrow({
            where: {id: ctx.session.user.lodgeId},
        });
    }),
});
