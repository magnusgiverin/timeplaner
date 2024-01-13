import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import BackButton from '~/components/General/BackButton';
import BreakLine from '~/components/General/BreakLine';
import CourseList from '~/components/ModifyPage/CourseList';
import Layout from '~/components/General/Layout';
import SubjectDetails from '~/components/General/SubjectDetails';
import Toolbox from '~/components/ModifyPage/Toolbox';
import type { Course } from '~/interfaces/CourseData';
import type { DetailedCourse } from '~/interfaces/StudyPlanData';
import { useLanguageContext } from '~/contexts/languageContext';
import { useCalendarContext } from '~/contexts/calendarContext';
import type { Program } from '~/interfaces/ProgramData';

const ModifyPage = () => {
    const router = useRouter();
    const [shownCourses, setShownCourses] = useState<DetailedCourse[]>([]);
    const [courseList, setCourseList] = useState<Array<Course | DetailedCourse>>([]); // Updated type
    const [selectedFromToolbox, setSelectedFromToolbox] = useState<Course[]>([]);
    const [showMoreMap, setShowMoreMap] = useState<Record<string, boolean>>({});
    const [displayMode, setDisplayMode] = useState('non-selected'); // 'selected' or 'non-selected'
    const [selectedProgram, setSelectedProgram] = useState<Program>();

    const selectedYear = router.query.year as string;
    const selectedSeason = router.query.season as string;

    const { language } = useLanguageContext();
    const { setSelectedSemesterPlans, setSemesterPlans, setCurrentCourses, setInitialCourses, initialCourses } = useCalendarContext();

    useEffect(() => {
        // Combine shownCourses and selectedFromToolbox into a single array
        setCurrentCourses(courseList);
    }, [courseList]);

    useEffect(() => {
        // Retrieve the selectedCourses parameter from the URL
        const coursesString = router.query.selectedCourses as string;
        const programString = router.query.selectedProgram as string;

        // Parse the string back into an array of Course objects
        if (coursesString && programString) {
            const parsedCourses = JSON.parse(decodeURIComponent(coursesString)) as DetailedCourse[];
            const parsedProgram = JSON.parse(decodeURIComponent(programString)) as Program;

            setSelectedProgram(parsedProgram)

            // Filter out courses with study choice code 'O' initially
            const initiallyChosenCourses = parsedCourses.filter(course => course.studyChoice.code === 'O');
            
            resetSemesterPlan();

            setInitialCourses(parsedCourses);
            setShownCourses(parsedCourses);
            setCourseList(initiallyChosenCourses)
        }
    }, [router.query.selectedCourses]);

    const selectedProgramCode = selectedProgram?.studyprogcode;

    const resetSemesterPlan = () => {
        setSelectedSemesterPlans([])
        setSemesterPlans([])
    }
    
    // Function to toggle the selection of a subject
    const toggleSelection = (course: Course | DetailedCourse) => {
        setCourseList((prevCourseList) => {
            const isCourseSelected = prevCourseList.includes(course);

            if (isCourseSelected) {
                // Remove the course from courseList
                return prevCourseList.filter((courseInLisst) => courseInLisst !== course);
            } else {
                // Add the course to courseList
                return [...prevCourseList, course];
            }
        });
    };
    
    // Group selectedCourses by courseGroupName
    const groupedCoursesByGroup: Record<string, DetailedCourse[]> = {};
    shownCourses.forEach((course) => {
        const groupName = course.courseGroupName ?? 'Other'; // Use 'Other' if courseGroupName is falsy
        if (!groupedCoursesByGroup[groupName]) {
            groupedCoursesByGroup[groupName] = [];
        }
        groupedCoursesByGroup[groupName]?.push(course);
    });

    // Function to determine if a subject is selected based on its presence in chosenCourses
    const isCourseSelected = (course: Course | DetailedCourse) => {
        return courseList.includes(course);
    }

    // Function to toggle showMore for a specific group
    const toggleShowMore = (group: string) => {
        setShowMoreMap((prevShowMoreMap) => ({ ...prevShowMoreMap, [group]: !prevShowMoreMap[group] }));
    };

    useEffect(() => {
        if (displayMode === 'selected') {
            setShownCourses(() => {
                // Filter initialCourses based on whether their codes are in courseList
                const updatedShownCourses = initialCourses.filter((course) => courseList.includes(course));
                return updatedShownCourses;
            });
        };

    }, [courseList]);

    const renderSymbolExplanation = () => {
        const explanationLabel = language === "no" ? "Symbolforklaring" : "Symbol Explanation"
        if (shownCourses.length > 0) {
            const studyChoices: Record<string, string> = {};
            shownCourses.forEach((course) => {
                studyChoices[course.studyChoice.code] = course.studyChoice.name;
            });

            const explanationText = Object.entries(studyChoices)
                .map(([code, name]) => `${code}: ${name}`)
                .join('\n');

            return (
                <div>
                    <BreakLine />
                    <h3>{explanationLabel}</h3>
                    <p>{explanationText}</p>
                </div>
            );
        }

        return null; // Return null if no courses are selected
    };

    const handleRedirect = () => {
        setCurrentCourses(courseList);
        const courseListString = JSON.stringify(courseList);

        const queryParams = {
            chosenCourses: encodeURIComponent(courseListString),
            year: encodeURIComponent(selectedYear),
            semester: encodeURIComponent(selectedSeason),
            studyCode: encodeURIComponent(selectedProgram?.studyprogcode ?? ""),
        };

        void router.push({
            pathname: '/calendar',
            query: queryParams,
        });
    };

    const renderToolbox = () => {
        return (
            <div>
                <BreakLine />
                <Toolbox
                    exclude={courseList}
                    onConfirm={handleRedirect}
                    onSearch={(selectedCourse) => {
                        // Find the course with the same code in allCourses
                        const foundCourse = shownCourses.find(course => course.code === selectedCourse.courseid);

                        if (foundCourse) {
                            // Check if the course is not already in shownCourses
                            if (!shownCourses.some(course => course.code === selectedCourse.courseid)) {
                                // Append the found course to shownCourses
                                setShownCourses((prevShownCourses) => [...prevShownCourses, foundCourse]);
                            }
                        }

                        if (!courseList.some(course => course === selectedCourse)) {
                            // Update the courseList
                            setCourseList((prevCourseList) => [...prevCourseList, selectedCourse])
                        };

                        if (!selectedFromToolbox.some(course => course === selectedCourse)
                            && !courseList.some(course => course === selectedCourse)) {
                            // Add the selected course from toolbox to state
                            setSelectedFromToolbox((prevSelected) => [
                                ...prevSelected, selectedCourse
                            ]);
                        };
                    }}
                    onToggleShowAll={() => {
                        setShownCourses((prevShownCourses) => {
                            if (displayMode === 'non-selected') {
                                setDisplayMode('selected');
                                // Filter out courses that are not in courseList
                                const updatedShownCourses = prevShownCourses.filter((course) => courseList.includes(course));
                                return updatedShownCourses;
                            } else {
                                setDisplayMode('non-selected');
                                // Add back courses that are in courseList but not in shownCourses
                                return initialCourses;
                            }
                        });
                    }}
                    state={displayMode}
                    allSelected={initialCourses.every(course => courseList.includes(course))}
                />
            </div>
        );
    }

    const getHeaderLabel = () => {
        if(language === "no") {
            const translatedSeason = selectedSeason === 'Spring' ? 'Vår' : 'Høst';
            const norwegianLabels = ['Første', 'Andre', 'Tredje', 'Fjerde', 'Femte'];
            return `${selectedProgramCode}, ${norwegianLabels[Number(selectedYear) - 1]}, ${translatedSeason}`
        } else {
            return `${selectedProgramCode}, Year ${selectedYear}, ${selectedSeason}`
        }
    }

    const handlePrevRedirect = () => {
        const programString = JSON.stringify(selectedProgram);

        const queryParams = {
            selectedProgram: encodeURIComponent(programString),
        };

        void router.push({
            pathname: '/program',
            query: queryParams
        });
    };

    const backButtonLabel = language === "no" ? "Velg år" : "Select year"
    const addedFromToolboxLabel = language === "no" ? "Emner lagt til via søk" : "Added Courses from Search"

    return (
        <Layout>
            <BackButton 
                buttonText={backButtonLabel}
                redirect={handlePrevRedirect}
            />
            <div className="flex flex-col items-center justify-center mt-20">
                <h2>{getHeaderLabel() }</h2>
            </div>
            <div>
                {renderToolbox()}
                {Object.entries(groupedCoursesByGroup).map(([group, coursesInGroup]) => (
                    <div key={group}>
                        <h3 className='text-2xl font-bold mt-2 mb-2'>{group}</h3>
                        <CourseList
                            courses={coursesInGroup}
                            showMore={showMoreMap[group]}
                            toggleShowMore={() => toggleShowMore(group)}
                            isCourseSelected={isCourseSelected}
                            toggleSelection={toggleSelection}
                            />
                    </div>
                ))}
                {/* Display selected courses from the toolbox */}
                {selectedFromToolbox.length !== 0 && (
                    <div>
                        <h3 className='text-2xl font-bold mt-2 mb-2'>{addedFromToolboxLabel}</h3>
                        <ul>
                            {selectedFromToolbox.map((course, index) => (
                                <li key={index}>
                                    <input
                                        type="checkbox"
                                        id={course.courseid}
                                        name={`subjectGroup_${"search"}_${course.courseid}`}
                                        checked={isCourseSelected(course)}
                                        onChange={() => {
                                            toggleSelection(course);
                                            setSelectedFromToolbox((prevSelectedFromToolbox) => {
                                                return prevSelectedFromToolbox.filter((selected) => selected.courseid !== course.courseid);
                                            });
                                        }}
                                        style={{ marginRight: '8px', transform: 'scale(1.5)' }} // Add this style for larger checkboxes
                                    />
                                    <SubjectDetails subject={course} />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {renderSymbolExplanation()}
            </div>
        </Layout>
    );
};

export default ModifyPage;
