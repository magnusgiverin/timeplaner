import { z } from "zod";
import { StudyPlan } from "~/interfaces/StudyPlanData";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const studyPlanRouter = createTRPCRouter({
    getStudyPlanById: publicProcedure.input(String).query(async (opts) => {
        if (!opts.input) {
            throw new Error("Input is missing.");
        }

        const studyPlan = await opts.ctx.db.studyPlan.findUnique({
            where: { studyPlanId: opts.input },
        }) as StudyPlan | null;

        if (!studyPlan) {
            return null;
        }

        return studyPlan;
    }),

    addStudyPlan: publicProcedure
        .input(z.object({ studyProgCode: z.string(), year: z.number() }))
        .mutation(async ({ ctx, input }) => {
            // Construct the API URL based on the input
            const apiUrl = `https://www.ntnu.no/web/studier/studieplan?p_p_id=studyprogrammeplannerportlet_WAR_studyprogrammeplannerportlet_INSTANCE_qtfMiH5FDLzu&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=studyplan&p_p_cacheability=cacheLevelPage&code=${input.studyProgCode}&year=${input.year}`;

            // Make the API call to get the study plan data
            const response = await fetch(apiUrl);
            const jsonData = await response.json();

            // Convert the JSON data to a string before storing it in the database
            const jsonString = JSON.stringify(jsonData);

            // Generate a unique identifier for the study plan
            const studyPlanId = `${input.studyProgCode}-${input.year}-${new Date().getFullYear()}`;
            
            // Save the study plan in the database
            await ctx.db.studyPlan.create({
                data: {
                    studyPlanId: studyPlanId,
                    json_data: jsonString,
                },
            });

            return { success: true };
        })
})

