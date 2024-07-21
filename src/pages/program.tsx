import React, { useEffect, useMemo, useState } from 'react';
import Layout from "~/components/General/Layout";
import { useRouter } from 'next/router';
import YearSelect from '~/components/SelectPage/YearSelect';
import BackButton from '~/components/General/BackButton';
import CourseLogic from '~/components/SelectPage/CourseLogic';
import Display from '~/components/SelectPage/DisplayCourses';
import BreakLine from '~/components/General/BreakLine';
import { useAppContext } from '~/contexts/appContext';
import type { DetailedCourse, SubjectStructure } from '~/interfaces/StudyPlanData';
import type { Program } from '~/interfaces/ProgramData';
import { useLanguageContext } from '~/contexts/languageContext';
import { useCalendarContext } from '~/contexts/calendarContext';

const ProgramPage = () => {
    const router = useRouter();
    const { season, setSeason, index, setIndex } = useAppContext();
    const { language } = useLanguageContext();
    const { setInitialCourses, setCurrentCourses } = useCalendarContext();

    const [subjectsStructure, setSubjectsStructure] = useState<SubjectStructure>([]);
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

    useEffect(() => {
        // Assuming programString is retrieved from the query parameters
        const programString = router.query.selectedProgram as string;

        if (programString) {
            try {
                const parsedProgram = JSON.parse(decodeURIComponent(programString)) as Program;
                setSelectedProgram(parsedProgram);
            } catch (error) {
                console.error('Error parsing programString:', error);
            }
        }
    }, [router.isReady]);

    const handleSeasonToggle = () => {
        setSeason((prevSeason) => (prevSeason === 'Spring' ? 'Autumn' : 'Spring'));
    };

    const handleButtonIndexChange = (newIndex: number) => {
        setIndex(newIndex);
    };

    const handleSubjectsStructureChange = (newSubjectStructure: SubjectStructure) => {
        setSubjectsStructure(newSubjectStructure);
    };

    const handleModifyRedirect = (selectedCourses: DetailedCourse[]) => {
        setInitialCourses(selectedCourses);
        const coursesString = JSON.stringify(selectedCourses);
        const programString = JSON.stringify(selectedProgram);

        const queryParams = {
            selectedCourses: encodeURIComponent(coursesString),
            year: encodeURIComponent(index + 1),
            season: encodeURIComponent(season),
            selectedProgram: encodeURIComponent(programString),
        };

        void router.push({
            pathname: '/modify',
            query: queryParams,
        });
    };

    const handlePrevRedirect = () => {
        void router.push({
            pathname: '/',
        });
    };

    const handleCalendarRedirect = (courseList: DetailedCourse[]) => {
        if (selectedProgram) {
            const coursesString = JSON.stringify(courseList);

            setCurrentCourses(courseList)

            const queryParams = {
                chosenCourses: encodeURIComponent(coursesString),
                year: encodeURIComponent(index + 1),
                semester: encodeURIComponent(season),
                studyCode: encodeURIComponent(selectedProgram.studyprogcode),
            };

            void router.push({
                pathname: '/calendar',
                query: queryParams,
            });
        }
    };

    const yearSelectComponent = useMemo(() => {
        if (selectedProgram) {
            return (
                <YearSelect
                    selectedProgram={selectedProgram}
                    setIndex={handleButtonIndexChange}
                    selectedIndex={index}
                    setSeason={handleSeasonToggle}
                    selectedSeason={season}
                />
            );
        }
        return null;
    }, [selectedProgram, index, season]);

    const courseLogicComponent = useMemo(() => {
        if (selectedProgram && index !== -1) {
            return (
                <CourseLogic
                    year={index + 1}
                    programCode={selectedProgram.studyprogcode}
                    season={season}
                    language={language === 'en' ? 'en' : 'no'}
                    onSubjectsStructureChange={handleSubjectsStructureChange}
                />
            );
        }
        return null;
    }, [selectedProgram, index, season]);

    const displayCoursesComponent = useMemo(() => {
        if (subjectsStructure.length !== 0 && index !== -1 && selectedProgram) {
            return (
                <Display
                    chosenSubjects={subjectsStructure}
                    handleModifyRedirect={handleModifyRedirect}
                    handleCalendarRedirect={handleCalendarRedirect}
                    programCode={selectedProgram.studyprogcode}
                />
            );
        }

        return null;
    }, [subjectsStructure]);

    return (
        <Layout>
            <BackButton
                buttonText={language === "no" ? "Velg studieprogram" : "Select study program"}
                redirect={handlePrevRedirect}
            />

            {/* Year selection component */}
            <div className="flex flex-col items-center justify-center mt-10">
                {yearSelectComponent}
            </div>

            {/* Component handling course logic */}
            {courseLogicComponent}

            {/* Horizontal break line */}
            <BreakLine />

            {/* Display courses component and another break line if conditions are met */}
            {subjectsStructure.length !== 0 && index !== -1 && (
                <>
                    <div className="flex flex-col items-center justify-center mt-10">
                        {displayCoursesComponent}
                    </div>
                    <BreakLine />
                </>
            )}
        </Layout>
    );
};

export default ProgramPage;