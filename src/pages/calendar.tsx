import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import BreakLine from '~/components/General/BreakLine';
import Layout from '~/components/General/Layout';
import type { Course } from '~/interfaces/CourseData';
import type { DetailedCourse } from '~/interfaces/StudyPlanData';
import { useLanguageContext } from '~/contexts/languageContext';
import { generateColor } from '~/components/Calendar/Colors';
import CalendarDisplay from '~/components/Calendar/CalendarDisplay';
import GreenButton from '~/components/General/GreenButton';
import { downloadICal, generateICal } from '~/components/Calendar/GenerateIcal';
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
        download: string;
        save: string;
        modify: string;
    };
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onDownload, onSave, onModify, labels }) => (
    <div className="flex flex-column items-center justify-center">
        <GreenButton onClick={onDownload} text={labels.download} className='rounded-full'/>
        <GreenButton className="ml-2" onClick={onSave} text={labels.save} />
        <button
            onClick={onModify}
            className="bg-blue-500 text-white rounded-md p-2 ml-2 mt-2 mb-2"
        >
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
                    setSelectedSemesterPlans(response.data)

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
            const norwegianLabels = ['Første', 'Andre', 'Tredje', 'Fjerde', 'Femte'];
            return `${selectedProgramCode}, ${norwegianLabels[Number(selectedYear) - 1]}, ${translatedSeason}`;
        } else {
            return `${selectedProgramCode}, Year ${selectedYear}, ${selectedSeason}`;
        }
    };

    const getDownloadLabel = () => {
        return language === 'no' ? 'Last ned ICS' : 'Download ICS';
    };

    const getSaveLabel = () => {
        return language === 'no' ? 'Lagre på siden' : 'Save on site';
    };

    const getModifyLabel = () => {
        return language === 'no' ? 'Rediger Timeplan' : 'Edit Calendar';
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

    const handleDownload = () => {
        const iCalContent = generateICal(selectedSemesterPlans);

        const translatedSeason = language === 'no'
            ? selectedSeason === 'Spring' ? 'Vår' : 'Høst'
            : selectedSeason;

        downloadICal(iCalContent, `${selectedProgramCode}-${selectedYear}-${translatedSeason}.ics`);
    };

    return (
        <Layout>
            <BackButton buttonText={language === "no" ? "< Rediger emner" : "< Edit subjects"}/>
            <Header label={getHeaderLabel()} />
            <BreakLine />
            <ActionButtons
                onDownload={handleDownload}
                onSave={handleDownload}
                onModify={handleModify}
                labels={{
                    download: getDownloadLabel(),
                    save: getSaveLabel(),
                    modify: getModifyLabel(),
                }}
            />
            <CalendarDisplay/>
            <div id="modifyCourses">
                <BreakLine />
                <ModifyCourses/>
            </div>
        </Layout>
    );
};

export default Calendar;
