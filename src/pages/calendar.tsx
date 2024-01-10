import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import BackButton from '~/components/General/BackButton';
import BreakLine from '~/components/General/BreakLine';
import Layout from '~/components/General/Layout';
import type { Course } from '~/interfaces/CourseData';
import type { DetailedCourse } from '~/interfaces/StudyPlanData';
import { useLanguageContext } from '~/contexts/languageContext';
import { generateColor } from '~/components/Calendar/Colors';
import CalendarDisplay from '~/components/Calendar/CalendarDisplay';

const Calendar: React.FC = () => {
    const router = useRouter();
    const [selectedCourses, setSelectedCourses] = useState<Array<Course | DetailedCourse>>([]);
    const [courseColors, setCourseColors] = useState<Record<string, string>>();

    useEffect(() => {
        // Use the query parameter directly from useRouter
        const courseListString = router.query.chosenCourses as string;

        if (router.isReady) {
            const courseList = JSON.parse(decodeURIComponent(courseListString)) as Array<Course | DetailedCourse>;
            // Check if courseList is not undefined before setting the state
            if (courseList) {
                setSelectedCourses(courseList);
            }
        }

    }, [router.query.chosenCourses]);

    useEffect(() => {
        const eventColors = generateColor(selectedCourses.length);
        setCourseColors(eventColors);
    }, [selectedCourses]);

    const selectedYear = router.query.year as string;
    const selectedProgramCode = router.query.studyCode as string;
    const selectedSeason = router.query.semester as string;

    const { language } = useLanguageContext();

    const getHeaderLabel = (language: string) => {
        if(language === "no") {
            const translatedSeason = selectedSeason === 'Spring' ? 'Vår' : 'Høst';
            const norwegianLabels = ['Første', 'Andre', 'Tredje', 'Fjerde', 'Femte'];
            return `${selectedProgramCode}, ${norwegianLabels[Number(selectedYear) - 1]}, ${translatedSeason}`
        } else {
            return `${selectedProgramCode}, Year ${selectedYear}, ${selectedSeason}`
        }
    }  

    const getSelectedHeaderLabel = (language: string) => {
        return language === "no" ? "Valgte emner" : "Selected Courses:"
    }

    const getSelectedExplainationLabel = (language: string) => {
        return language === "no" ? "Trykk på et emne for å redigere timene" : "Click on a course to modify the events shown"
    }

    return (
        <Layout>
            <BackButton />
            <div className="flex flex-col items-center justify-center mt-20">
                <h2>{getHeaderLabel(language)}</h2>
            </div>
            <BreakLine />
            <CalendarDisplay subjectList={selectedCourses.map((course) => "courseid" in course ? course.courseid : course.code)} />
            <BreakLine />
            <div>
                <h2>{getSelectedHeaderLabel(language)}</h2>
                <p>{getSelectedExplainationLabel(language)}</p>
                <ul className="flex flex-wrap list-none p-0">
                    {Array.isArray(selectedCourses) ? (
                        selectedCourses.map((course, index) => (
                            <li
                                key={index}
                                className="w-full md:w-1/2 p-2" // Set full width on small screens and half width on medium screens
                            >
                                <div className="flex items-center">
                                    <div
                                        className="bg-blue-500 text-white p-2 mt-2 mb-2 rounded-md mr-2"
                                        style={{
                                            ...(courseColors && {
                                                backgroundColor: courseColors[index],
                                                border: '2px solid white', // Add this line for the white border
                                            }),
                                        }}
                                    />
                                    <a
                                        href={`https://www.ntnu.no/studier/emner/${'courseid' in course ? course.courseid : course.code}#tab=omEmnet`}
                                        className="inline-block bg-blue-500 text-white p-2 mt-2 mb-2 rounded-md text-decoration-none"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <div>
                                            {('studyChoice' in course && 'courseGroupName' in course) ? (
                                                `${course.code}: ${course.name}`
                                            ) : (
                                                `${course.courseid}: ${course.name}`
                                            )}
                                        </div>
                                    </a>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li>No selected courses</li>
                    )}
                </ul>
            </div>
        </Layout>
    );
};

export default Calendar;
