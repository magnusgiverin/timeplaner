import { z } from "zod";
import type { StudyPlan } from "~/interfaces/StudyPlanData";
import { subjectCodesEnglish } from "~/localization/subjectCodes";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const studyPlanRouter = createTRPCRouter({
    getStudyPlan: publicProcedure
        .input(z.object({ studyProgCode: z.string(), year: z.number(), language: z.enum(['no', 'en']) }))
        .query(async ({ input }) => {
            const apiUrl = `https://www.ntnu.no/web/studier/studieplan?p_p_id=studyprogrammeplannerportlet_WAR_studyprogrammeplannerportlet_INSTANCE_qtfMiH5FDLzu&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=studyplan&p_p_cacheability=cacheLevelPage&code=${input.studyProgCode}&year=${input.year}`;

            const response = await fetch(apiUrl);
            const jsonData = await response.json() as StudyPlan;
            
            const fetchCourseName = async (courseCode: string, defaultValue: string): Promise<string> => {
                const { decode } = require('html-entities');
                const courseUrl = input.language === 'en'
                    ? `https://www.ntnu.edu/studies/courses/${courseCode}`
                    : `https://www.ntnu.no/studier/emner/${courseCode}`;
                const courseResponse = await fetch(courseUrl);
                const courseText = await courseResponse.text();
            
                const courseNameMatches = Array.from(courseText.matchAll(/<h1[^>]*>(.*?)<\/h1>/g));
                const fourthMatch = courseNameMatches.length >= 3 ? courseNameMatches[2] : undefined;
                let courseName = fourthMatch && fourthMatch[1] ? decode(fourthMatch[1].trim()) : defaultValue;
            
                // Remove "Course - " prefix and " - <code>" suffix
                const prefix = input.language === 'en' ? 'Course - ' : 'Emne - ';
                if (courseName.startsWith(prefix)) {
                    courseName = courseName.slice(prefix.length);
                }
                const suffix = ` - ${courseCode}`;
                if (courseName.endsWith(suffix)) {
                    courseName = courseName.slice(0, -suffix.length);
                }
            
                return courseName;
            };

            const fetchAllCourseNames = async () => {
                const fetchPromises: Promise<void>[] = [];
                for (const period of jsonData.studyplan.studyPeriods) {
                    if (!period.direction.courseGroups) continue;
                    for (const courseGroup of period.direction.courseGroups) {
                        for (const course of courseGroup.courses) {
                            fetchPromises.push((async () => {
                                course.name = await fetchCourseName(course.code, course.name);

                                const studyChoiceName = input.language === 'en' ? subjectCodesEnglish[course.studyChoice.code] : course.studyChoice.name;
                                course.studyChoice.name = studyChoiceName ?? course.studyChoice.name;
                            })());
                        }
                    }
                }
                await Promise.all(fetchPromises);
            };

            let _ = await fetchAllCourseNames();
            return { studyPlanData: jsonData };
        })
});