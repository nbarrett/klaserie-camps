import bcrypt from "bcryptjs";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
    checkName: publicProcedure
        .input(z.object({ name: z.string().min(1).trim() }))
        .query(async ({ ctx, input }) => {
            const existing = await ctx.db.user.findFirst({
                where: { name: { equals: input.name, mode: "insensitive" } },
            });
            return {
                available: !existing,
                existingUser: !!existing,
            };
        }),

    register: publicProcedure
        .input(
            z.object({
                name: z.string().min(1).trim(),
                password: z.string().min(4),
                lodgeId: z.string(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const existing = await ctx.db.user.findFirst({
                where: { name: { equals: input.name, mode: "insensitive" } },
            });

            if (existing) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "That name is already taken",
                });
            }

            const slug = input.name.toLowerCase().replace(/\s+/g, "-");
            const email = `${slug}@safari-track.local`;
            const hashedPassword = await bcrypt.hash(input.password, 12);

            const user = await ctx.db.user.create({
                data: {
                    name: input.name,
                    email,
                    hashedPassword,
                    role: "GUIDE",
                    lodgeId: input.lodgeId,
                },
            });

            return { id: user.id, name: user.name };
        }),

    me: protectedProcedure.query(async ({ ctx }) => {
        const user = await ctx.db.user.findUnique({
            where: { id: ctx.session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                distanceUnit: true,
                role: true,
                lodge: { select: { id: true, name: true } },
            },
        });

        if (!user) {
            throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }

        return user;
    }),

    updateProfile: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1).trim().optional(),
                email: z.string().email().optional(),
                distanceUnit: z.enum(["km", "mi"]).optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            if (input.name) {
                const existing = await ctx.db.user.findFirst({
                    where: {
                        name: { equals: input.name, mode: "insensitive" },
                        id: { not: userId },
                    },
                });
                if (existing) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "That name is already taken",
                    });
                }
            }

            if (input.email) {
                const existing = await ctx.db.user.findFirst({
                    where: {
                        email: { equals: input.email, mode: "insensitive" },
                        id: { not: userId },
                    },
                });
                if (existing) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "That email is already in use",
                    });
                }
            }

            const updated = await ctx.db.user.update({
                where: { id: userId },
                data: {
                    ...(input.name !== undefined && { name: input.name }),
                    ...(input.email !== undefined && { email: input.email }),
                    ...(input.distanceUnit !== undefined && { distanceUnit: input.distanceUnit }),
                },
                select: { id: true, name: true, email: true, distanceUnit: true },
            });

            return updated;
        }),

    changePassword: protectedProcedure
        .input(
            z.object({
                currentPassword: z.string().min(1),
                newPassword: z.string().min(4),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.db.user.findUnique({
                where: { id: ctx.session.user.id },
                select: { hashedPassword: true },
            });

            if (!user) {
                throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
            }

            const valid = await bcrypt.compare(input.currentPassword, user.hashedPassword);
            if (!valid) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Current password is incorrect",
                });
            }

            const hashedPassword = await bcrypt.hash(input.newPassword, 12);
            await ctx.db.user.update({
                where: { id: ctx.session.user.id },
                data: { hashedPassword },
            });

            return { success: true };
        }),
});
