import type { Program } from "~/interfaces/ProgramData";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const programRouter = createTRPCRouter({
  programList: publicProcedure.query(async ({ ctx }) => {
    const programs = await ctx.db.program.findMany() as Program[];
    return programs;
  }),

  getProgramById: publicProcedure.input(String).query(async (opts) => {
    if (!opts.input) {
      throw new Error("Input is missing.");
    }

    const program = await opts.ctx.db.program.findFirst({
      where: { studyprogcode: opts.input },
    }) as Program | null;

    if (!program) {
      throw new Error("Program not found");
    }

    return program;
  }),

  programListByLang: publicProcedure.input(String).query(async (opts) => {
    if (!opts.input) {
      throw new Error("Input is missing.");
    }
  
    const programs = await opts.ctx.db.program.findMany({
      where: { programid: { endsWith: opts.input } },
    }) as Program[];
    
    if (!programs || programs.length === 0) {
      throw new Error("Programs not found");
    }
  
    return programs;
  })  
})
