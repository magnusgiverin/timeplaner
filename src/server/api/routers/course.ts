import type { Course } from "~/interfaces/CourseData";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const courseRouter = createTRPCRouter({
    courseList: publicProcedure.query(async ({ ctx }) => {
      const courses = await ctx.db.course.findMany() as Course[];

      if (!courses || courses.length === 0) {
        throw new Error("Courses not found");
      }
      return courses;
    })
});