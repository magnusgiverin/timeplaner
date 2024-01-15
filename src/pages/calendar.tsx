import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import BreakLine from '~/components/General/BreakLine';
import Layout from '~/components/General/Layout';
import type { Course } from '~/interfaces/CourseData';
import type { DetailedCourse } from '~/interfaces/StudyPlanData';
import { useLanguageContext } from '~/contexts/languageContext';
import { generateColor } from '~/components/Calendar/Colors';
import CalendarDisplay from '~/components/Calendar/CalendarDisplay';
import { downloadICal, generateICal, saveIcal } from '~/components/Calendar/GenerateIcal';
import { api } from '~/utils/api';
import { useCalendarContext } from '~/contexts/calendarContext';
import ModifyCourses from '~/components/Calendar/ModifyCourses';
import BackButton from '~/components/General/BackButton';

// Header component
interface HeaderProps {
    label: string;
}

const Header: React.FC<HeaderProps> = ({ label }) => (
    <div className="flex flex-col items-center justify-center mt-20">
        <h2>{label}</h2>
    </div>
);

// ActionButtons component
interface ActionButtonsProps {
    onDownload: () => void;
    onSave: () => void;
    onModify: () => void;
    labels: {
        export: string;
        save: string;
        modify: string;
    };
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onDownload, onSave, onModify, labels }) => (
    <div className="flex flex-row items-center justify-center">
        <button
            onClick={onDownload}
            className="bg-green-500 text-white rounded-full p-2 flex items-center justify-center h-full"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 mr-2"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            {labels.export}
        </button>

        <button
            onClick={onSave}
            className="ml-2 bg-green-500 text-white rounded-full p-2 flex items-center justify-center h-full"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 mr-2"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {labels.save}
        </button>

        <button
            onClick={onModify}
            className="bg-blue-500 text-white rounded-full p-2 ml-2 mt-2 mb-2 flex items-center justify-center h-full"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 mr-2"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a4.5 4.5 0 0 1-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 1 1-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.867 19.125h.008v.008h-.008v-.008Z" />
            </svg>
            {labels.modify}
        </button>
    </div>

);

// Main Calendar component
const Calendar: React.FC = () => {
    const router = useRouter();

    const { language } = useLanguageContext();
    const {
        selectedSemesterPlans,
        setSemesterPlans,
        setSelectedSemesterPlans,
        setCourseColors,
        currentCourses,
        setCurrentCourses,
        setIndexes,
    } = useCalendarContext();

    useEffect(() => {
        // Use the query parameter directly from useRouter
        if (router.isReady && currentCourses.length === 0) {
            const courseListString = router.query.chosenCourses as string;

            const courseList = JSON.parse(decodeURIComponent(courseListString)) as Array<Course | DetailedCourse>;

            // Check if courseList is not undefined before setting the state
            if (courseList) {
                setCurrentCourses(courseList);
            }
        }
    }, [router.query.chosenCourses]);

    const selectedYear = router.query.year as string;
    const selectedProgramCode = router.query.studyCode as string;
    const selectedSeason = router.query.semester as string;

    const currentYearLastDigits = new Date().getFullYear().toString().slice(-2);
    const currentSemester = `${currentYearLastDigits}${selectedSeason === 'Spring' ? 'v' : 'h'}`;
    const subjectList = currentCourses.map((course) => ('courseid' in course ? course.courseid : course.code));

    const query = api.semesterPlan.getSemesterPlan.useQuery({
        subjectCodes: subjectList.map(subjectCode => subjectCode ?? ''),
        semester: currentSemester,
    });

    useEffect(() => {

        let isMounted = true;
        const fetchData = async () => {
            try {
                const response = await query.refetch();

                if (isMounted && response?.data) {
                    setSemesterPlans(response.data);
                    setSelectedSemesterPlans(response.data.map((semesterPlan) =>
                    ({
                        ...semesterPlan,
                        events: semesterPlan.events.filter((event) =>
                            event.studentgroups.some((studentgroup) =>
                                studentgroup.split("_")[0] === selectedProgramCode
                            )
                        )
                    })
                    ));

                    // Generate indexes based on subjectList
                    const generatedIndexes: Record<string, number> = {};
                    subjectList.forEach((subjectCode, index) => {
                        if (subjectCode) {
                            generatedIndexes[subjectCode] = index;
                        }
                    });
                    setIndexes(generatedIndexes);
                    const courseColors = generateColor(currentCourses.length);
                    setCourseColors(courseColors);
                }
            } catch (error) {
                console.error('Error fetching semester plans:', error);
            }
        };

        void fetchData();

        return () => {
            isMounted = false;
        };
    }, [currentCourses]);

    const getHeaderLabel = () => {
        if (language === 'no') {
            const translatedSeason = selectedSeason === 'Spring' ? 'Vår' : 'Høst';
            return `${selectedProgramCode}, ${selectedYear}. klasse, ${translatedSeason}`;
        } else {
            return `${selectedProgramCode}, Year ${selectedYear}, ${selectedSeason}`;
        }
    };

    const getExportLabel = () => {
        return language === 'no' ? 'Eksporter' : 'Export';
    };

    const getSaveLabel = () => {
        return language === 'no' ? 'Lagre' : 'Save';
    };

    const getModifyLabel = () => {
        return language === 'no' ? 'Rediger' : 'Edit';
    };

    const handleModify = () => {
        // Scroll to the ModifyCourses component
        const modifyCoursesElement = document.getElementById('modifyCourses');
        if (modifyCoursesElement) {
            modifyCoursesElement.scrollIntoView({
                behavior: 'smooth',
            });
        }
    };

    const handleDownload = async () => {
        const translatedSeason = language === 'no'
          ? selectedSeason === 'Spring' ? 'Vår' : 'Høst'
          : selectedSeason;
      
        const filename = `${selectedProgramCode}-${selectedYear}-${translatedSeason}`
        const iCalContent = generateICal(selectedSemesterPlans, filename);
      
        // Use try-catch to handle potential errors
        try {
          await downloadICal(iCalContent, filename + ".ics", selectedSeason);
        } catch (error) {
          // Handle or log the error as needed
          console.error('Error downloading iCal:', error);
        }
      };

    const handleSave = () => {
        const translatedSeason = language === 'no'
            ? selectedSeason === 'Spring' ? 'Vår' : 'Høst'
            : selectedSeason;

        const filename = `${selectedProgramCode}-${selectedYear}-${translatedSeason}`
        const iCalContent = generateICal(selectedSemesterPlans, filename);

        saveIcal(iCalContent, filename + ".ics");
    };

    return (
        <Layout>
            <BackButton buttonText={language === "no" ? "Rediger emner" : "Edit subjects"} />
            <Header label={getHeaderLabel()} />
            <BreakLine />
            <ActionButtons
                onDownload={handleDownload}
                onSave={handleSave}
                onModify={handleModify}
                labels={{
                    export: getExportLabel(),
                    save: getSaveLabel(),
                    modify: getModifyLabel(),
                }}
            />
            <CalendarDisplay />
            <div id="modifyCourses">
                <BreakLine />
                <ModifyCourses />
            </div>
        </Layout>
    );
};

export default Calendar;
