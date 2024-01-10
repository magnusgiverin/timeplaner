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

const ProgramPage = () => {
    const router = useRouter();
    const { season, setSeason, index, setIndex } = useAppContext();

    const [subjectsStructure, setSubjectsStructure] = useState<SubjectStructure>([]);
    const [program, setProgram] = useState<Program | null>(null);

    useEffect(() => {
        // Assuming programString is retrieved from the query parameters
        const programString = router.query.selectedProgram as string;

        if (programString) {
            try {
                const parsedProgram = JSON.parse(decodeURIComponent(programString)) as Program;
                setProgram(parsedProgram);
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

    const handleRedirect = (selectedCourses: DetailedCourse[]) => {
        const coursesString = JSON.stringify(selectedCourses);

        const queryParams = {
            selectedCourses: encodeURIComponent(coursesString),
            year: encodeURIComponent(index + 1),
            season: encodeURIComponent(season),
            studyCode: encodeURIComponent(program ? program.studyprogcode : "N/A"),
        };

        void router.push({
            pathname: '/modify',
            query: queryParams,
        });
    };

    const yearSelectComponent = useMemo(() => {
        if (program) {
            return (
                <YearSelect
                    selectedProgram={program}
                    setIndex={handleButtonIndexChange}
                    selectedIndex={index}
                    setSeason={handleSeasonToggle}
                    selectedSeason={season}
                />
            );
        }
        return null;
    }, [program, index, season]);

    const courseLogicComponent = useMemo(() => {
        if (program && index !== -1) {
            return (
                <CourseLogic
                    year={index + 1}
                    programCode={program.studyprogcode}
                    season={season}
                    onSubjectsStructureChange={handleSubjectsStructureChange}
                />
            );
        }
        return null;
    }, [program, index, season]);

    const displayCoursesComponent = useMemo(() => {
        if (subjectsStructure.length !== 0 && index !== -1 && program) {
            return (
                <Display
                    chosenSubjects={subjectsStructure}
                    handleModifyRedirect={handleRedirect}
                    programCode={program.studyprogcode}
                />
            );
        }

        return null;
    }, [subjectsStructure]);

    return (
        <Layout>
          {/* Back button for navigation */}
          <BackButton />
      
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