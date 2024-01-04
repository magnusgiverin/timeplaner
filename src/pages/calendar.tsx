import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import CalendarDisplay from '~/views/Calendar/CalendarDisplay';
import BackButton from '~/components/General/BackButton';
import BreakLine from '~/components/General/BreakLine';
import Layout from '~/components/General/Layout';
import { DetailedCourse } from '~/components/SelectPage/DisplayCourses';
import { Course } from '~/interfaces/CourseData';
import { generateColor } from '~/views/Calendar/IcsCalendar';

const Calendar: React.FC = () => {
    const router = useRouter();
    const [selectedCourses, setSelectedCourses] = useState<Array<Course | DetailedCourse>>([]);

    useEffect(() => {
        // Use the query parameter directly from useRouter
        const courseListString = router.query.chosenCourses as string;

        if(router.isReady) {
            const courseList = JSON.parse(decodeURIComponent(courseListString)) as Array<Course | DetailedCourse>;
            // Check if courseList is not undefined before setting the state
            if (courseList) {
                setSelectedCourses(courseList);
            }
        }

    }, [router.query.chosenCourses]);

    const selectedYear = router.query.year as string;
    const selectedProgramCode = router.query.studyCode as string;
    const selectedSeason = router.query.semester as string;

    return (
        <Layout>
            <BackButton />
            <div className="flex flex-col items-center justify-center mt-20">
                <h2>{`${selectedProgramCode}, Year ${selectedYear}, ${selectedSeason}`}</h2>
            </div>
            <BreakLine />
            <CalendarDisplay subjectList={selectedCourses.map((course) => "courseId" in course ? course.courseId : course.code)} />
            <BreakLine />
            <div>
                <h2>Selected Courses:</h2>
                <ul>
                    {Array.isArray(selectedCourses) ? (
                        selectedCourses.map((course, index) => (
                            <li key={index}>
                                <div className="flex items-center">
                                    <div
                                        className="bg-blue-500 text-white p-2 mt-2 mb-2 rounded-md mr-2"
                                        style={{ backgroundColor: generateColor(
                                                'courseId' in course
                                                ? course.courseId + ' - ' + course.name
                                                : course.code + ' - ' + course.name
                                        ),}}
                                    />
                                    <a
                                        href={`https://www.ntnu.no/studier/emner/${('courseId' in course) ? course.courseId : course.code}#tab=omEmnet`}
                                        className="inline-block bg-blue-500 text-white p-2 mt-2 mb-2 rounded-md text-decoration-none"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <div>
                                            {('studyChoice' in course && 'courseGroupName' in course) ? (
                                                `${course.code}: ${course.name}`
                                            ) : (
                                                `${course.courseId}: ${course.name}`
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
