import { z } from "zod";
import type { StudyPlan } from "~/interfaces/StudyPlanData";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const studyPlanRouter = createTRPCRouter({
    getStudyPlan: publicProcedure
        .input(z.object({ studyProgCode: z.string(), year: z.number() }))
        .query(async ({ input }) => {
            // Construct the API URL based on the input
            const apiUrl = `https://www.ntnu.no/web/studier/studieplan?p_p_id=studyprogrammeplannerportlet_WAR_studyprogrammeplannerportlet_INSTANCE_qtfMiH5FDLzu&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=studyplan&p_p_cacheability=cacheLevelPage&code=${input.studyProgCode}&year=${input.year}`;

            // Make the API call to get the study plan data
            const response = await fetch(apiUrl);
            const jsonData = await response.json() as StudyPlan;

            return { studyPlanData: jsonData };
        })
})

