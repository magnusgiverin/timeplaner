import { z } from "zod";
import type { Program } from "~/interfaces/ProgramData";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

interface ProgramData {
  studyprogCode: string;
  title: string;
  studyprogName: string;
  studyprogStudyLevel: string;
  studyprogStudyLevelCode: number;
}

export const programRouter = createTRPCRouter({
  getProgramListByLang: publicProcedure
    .input(z.object({
      language: z.string(),
    }))
    .query(async ({ input }) => {
      // Destructure the input
      const { language } = input;

      // Create an array to store the results
      const resultArray: Program[] = [];

      const apiUrl = language === 'en'
        ? "https://www.ntnu.edu/web/studies/allstudies?p_p_id=studyprogrammelistportlet_WAR_studyprogrammelistportlet&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=searchStudies&p_p_cacheability=cacheLevelPage"
        : "https://www.ntnu.no/web/studier/alle?p_p_id=studyprogrammelistportlet_WAR_studyprogrammelistportlet&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=searchStudies&p_p_cacheability=cacheLevelPage";

      try {
        const response = await fetch(apiUrl);

        if (response.ok) {
          // Parse and map the result to the Program interface
          const data = (await response.json()) as { docs: ProgramData[] };
          if (data.docs && Array.isArray(data.docs)) {
            resultArray.push(
              ...data.docs.map((programData: ProgramData) => ({
                programid: programData.studyprogCode,
                title: programData.title,
                studyprogcode: programData.studyprogCode,
                studyprogname: programData.studyprogName,
                studyprogstudylevel: programData.studyprogStudyLevel,
                studyprogstudylevelcode: programData.studyprogStudyLevelCode,
              }))
            );
          }
          return resultArray;

        } else {
          // Handle non-OK response
          throw new Error(`Failed to fetch program list. Status code: ${response.status}`);
        }

      } catch (error) {
        // Handle fetch error
        console.error('Error fetching program list:', error);
        throw new Error('Error fetching program list');
      }
    }),
});
