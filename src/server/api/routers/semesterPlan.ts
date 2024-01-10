import { z } from "zod";
import type { SemesterPlan } from "~/interfaces/SemesterPlanData";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const semesterPlanRouter = createTRPCRouter({
    getSemesterPlan: publicProcedure
        .input(z.object({
            subjectCodes: z.array(z.string()),
            semester: z.string(),
        }))
        .query(async ({ input }) => {
            // Destructure the input
            const { subjectCodes, semester } = input;

            // Create an array to store the results
            const resultArray: SemesterPlan[] = [];

            // Define the API key
            const apiKey = '277312d4-95ba-4b24-b486-b3ca70e80da3';

            // Loop through each subjectCode in the input array
            for (const subjectCode of subjectCodes) {
                // Construct the API URL based on the subjectCode and semester
                const apiUrl = `https://gw-ntnu.intark.uh-it.no/tp/prod/ws/1.4/course.php?id=${subjectCode}&sem=${semester}&lang=no&split_intervals=true&exam=true`;

                // Make the API call with the API key
                const response = await fetch(apiUrl, {
                    headers: new Headers({
                        'X-Gravitee-Api-Key': apiKey,
                    }),
                });

                // Structure the result according to the SemesterPlan interface
                const semesterPlan: SemesterPlan = await response.json() as SemesterPlan;
        
                // Push the result to the array
                resultArray.push(semesterPlan);
            }

            // Return the array of JSON data
            return resultArray;
        })
});
