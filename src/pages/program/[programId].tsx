import React, { useEffect, useMemo } from 'react';
import Layout from "~/components/General/Layout";
import { api } from "~/utils/api";
import { useRouter } from 'next/router';
import YearSelect from '~/components/SelectPage/YearSelect';
import BackButton from '~/components/General/BackButton';
import CourseLogic from '~/components/SelectPage/CourseLogic';
import Display, { DetailedCourse } from '~/components/SelectPage/DisplayCourses';
import BreakLine from '~/components/General/BreakLine';
import { useAppContext } from '~/contexts/appContext';

const ProgramPage = () => {
    const router = useRouter();
    const { programId } = router.query;
    const { season, setSeason, index, setIndex, subjectsStructure, setSubjectsStructure } = useAppContext();

    const selectedProgram = api.program.getProgramById.useQuery(String(programId));
    const program = selectedProgram.data ?? null;

    const handleSeasonToggle = () => {
        setSeason((prevSeason) => (prevSeason === 'Spring' ? 'Autumn' : 'Spring'));
    };

    const handleButtonIndexChange = (newIndex: number) => {
        setIndex(newIndex);
    };

    const handleSubjectsStructureChange = (newSubjectStructure: any) => {
        setSubjectsStructure(newSubjectStructure);
    };

    const handleRedirect = (selectedCourses: DetailedCourse[]) => {
        const coursesString = JSON.stringify(selectedCourses);

        const queryParams = {
            selectedCourses: encodeURIComponent(coursesString),
            year: encodeURIComponent(index + 1),
            semester: encodeURIComponent(season),
            studyCode: encodeURIComponent(program ? program.studyprogCode : "N/A"),
        };

        router.push({
            pathname: '/modify',
            query: queryParams,
        });
    };

    const yearSelectComponent = useMemo(() => (
        program && (
            <YearSelect
                selectedProgram={program}
                setIndex={handleButtonIndexChange}
                selectedIndex={index}
                setSeason={handleSeasonToggle}
                selectedSeason={season}
            />
        )
    ), [program, index, season]);

    const courseLogicComponent = useMemo(() => (
        program && index !== -1 && (
            <CourseLogic
                year={index + 1}
                programCode={program?.studyprogCode}
                season={season}
                onSubjectsStructureChange={handleSubjectsStructureChange}
            />
        )
    ), [program, index, season]);

    const displayCoursesComponent = useMemo(() => (
        subjectsStructure.length !== 0 && index !== -1 && (
            <Display 
                chosenSubjects={subjectsStructure} 
                handleRedirect={handleRedirect}
            />
        )
    ), [subjectsStructure, index]);

    return (
        <Layout>
            <BackButton/>
            <div className="flex flex-col items-center justify-center mt-10">
                {yearSelectComponent}
            </div>

            {courseLogicComponent}

            <BreakLine/>
            <div className="flex flex-col items-center justify-center mt-10">
                {displayCoursesComponent}
            </div>
            {subjectsStructure.length !== 0 && index !== -1 ? (
                <BreakLine/>
            ) : null}
        </Layout>
    );
};

export default ProgramPage;
