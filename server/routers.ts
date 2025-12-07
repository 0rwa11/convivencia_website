import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  evaluations: router({
    list: publicProcedure.query(() => db.getEvaluations()),
    create: publicProcedure.input(z.object({
      sessionNumber: z.number(),
      date: z.string(),
      groupName: z.string(),
      facilitator: z.string(),
      beforeGrouping: z.string().optional(),
      beforeIsolation: z.string().optional(),
      beforeTensions: z.string().optional(),
      beforeCommunication: z.string().optional(),
      beforeMixedInteractions: z.number().optional(),
      duringParticipation: z.string().optional(),
      duringRespect: z.string().optional(),
      duringOpenness: z.string().optional(),
      duringLaughter: z.string().optional(),
      duringMixedInteractions: z.string().optional(),
      afterGrouping: z.string().optional(),
      afterMixedInteractions: z.number().optional(),
      afterStereotypes: z.string().optional(),
      notes: z.string().optional(),
    })).mutation(({ input }) => db.createEvaluation(input)),
    update: publicProcedure.input(z.object({
      id: z.number(),
      data: z.any(),
    })).mutation(({ input }) => db.updateEvaluation(input.id, input.data)),
    delete: publicProcedure.input(z.number()).mutation(({ input }) => db.deleteEvaluation(input)),
  }),
  
  sessions: router({
    list: publicProcedure.query(() => db.getSessions()),
    create: publicProcedure.input(z.object({
      sessionNumber: z.number(),
      date: z.string(),
      groupName: z.string(),
      facilitator: z.string(),
      location: z.string().optional(),
    })).mutation(({ input }) => db.createSession(input)),
    update: publicProcedure.input(z.object({
      id: z.number(),
      data: z.any(),
    })).mutation(({ input }) => db.updateSession(input.id, input.data)),
    delete: publicProcedure.input(z.number()).mutation(({ input }) => db.deleteSession(input)),
  }),
});

export type AppRouter = typeof appRouter;
