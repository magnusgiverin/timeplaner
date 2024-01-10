import type { Course } from "~/interfaces/CourseData";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { useAppContext } from "~/contexts/appContext";
import { z } from "zod";

export const courseRouter = createTRPCRouter({
  courseList: publicProcedure
    .input(z.object({
      semesterCode: z.string(),
    }))
    .query(async ({ input }) => {

      const { semesterCode } = input;

      const url = 'https://tp.educloud.no/ntnu/timeplan/emner.php?sem=' + semesterCode;

      try {
        const response = await fetch(url)

        if (response.ok) {
          const rawData = await response.text();
          const matches = /var courses = (\[.*?\]);/s.exec(rawData);

          if (matches) {
            // Extracted content of the "courses" variable
            const coursesData = matches[1];

            // Convert the string to a TypeScript object (array of objects)
            const coursesList = coursesData ? JSON.parse(coursesData) : [];

            // Assuming coursesList is an array of Course objects or can be mapped to Course
            const courses: Course[] = coursesList.map((courseData: any) => ({
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
            // Handle the case when the "courses" variable is not found in the response
            throw new Error('Variable "courses" not found in the response');
          }
        } else {
          // Handle non-OK response
          throw new Error(`Failed to fetch courses. Status code: ${response.status}`);
        }
      } catch (error) {
        // Handle fetch error
        console.error('Error fetching courses:', error);
        throw new Error('Error fetching courses');
      }
    })
});