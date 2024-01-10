import type { Course } from "~/interfaces/CourseData";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";

interface CourseData {
  id: string;
  name: string;
  create_activity_zoom: boolean | null;
  authorized_netgroups: string;
  nofterms?: number | null;
  terminnr?: number | null;
  fullname: string;
  fullname_en?: string | null;
  fullname_nn?: string | null;
  idtermin?: string | null;
}

export const courseRouter = createTRPCRouter({
  courseList: publicProcedure
    .input(z.object({
      semesterCode: z.string(),
    }))
    .query(async ({ input }) => {
      const { semesterCode } = input;

      const url = 'https://tp.educloud.no/ntnu/timeplan/emner.php?sem=' + semesterCode;

      try {
        const response = await fetch(url);

        if (response.ok) {
          const rawData = await response.text();
          const matches = /var courses = (\[.*?\]);/s.exec(rawData);

          if (matches) {
            const coursesData: string | null = matches[1] ?? null;
            const coursesList = coursesData !== null ? JSON.parse(coursesData) as CourseData[] : [];

            const courses: Course[] = coursesList.map((courseData: CourseData) => ({
              courseid: courseData.id,
              name: courseData.name,
              create_activity_zoom: courseData.create_activity_zoom,
              authorized_netgroups: courseData.authorized_netgroups,
              nofterms: courseData.nofterms,
              terminnr: courseData.terminnr,
              fullname: courseData.fullname,
              fullname_en: courseData.fullname_en,
              fullname_nn: courseData.fullname_nn,
              idtermin: courseData.idtermin,
            }));

            if (!courses || courses.length === 0) {
              throw new Error('Courses not found');
            }

            return courses;
          } else {
            throw new Error('Variable "courses" not found in the response');
          }
        } else {
          throw new Error(`Failed to fetch courses. Status code: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        throw new Error('Error fetching courses');
      }
    }),
});
