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

const ModifyPage = () => {
    const router = useRouter();
    const [shownCourses, setShownCourses] = useState<DetailedCourse[]>([]);
    const [courseList, setCourseList] = useState<Array<Course | DetailedCourse>>([]); // Updated type
    const [selectedFromToolbox, setSelectedFromToolbox] = useState<Course[]>([]);
    const [showMoreMap, setShowMoreMap] = useState<Record<string, boolean>>({});
    const [initialCourses, setInitialCourses] = useState<DetailedCourse[]>([]);
    const [displayMode, setDisplayMode] = useState('non-selected'); // 'selected' or 'non-selected'

    const selectedYear = router.query.year as string;
    const selectedProgramCode = router.query.studyCode as string;
    const selectedSeason = router.query.semester as string;

    useEffect(() => {
        // Retrieve the selectedCourses parameter from the URL
        const coursesString = router.query.selectedCourses as string;
        // Parse the string back into an array of Course objects
        if (coursesString) {
            const parsedCourses = JSON.parse(decodeURIComponent(coursesString)) as DetailedCourse[];

            // Filter out courses with study choice code 'O' initially
            const initiallyChosenCourses = parsedCourses.filter(course => course.studyChoice.code === 'O');

            setInitialCourses(parsedCourses);
            setShownCourses(parsedCourses);
            setCourseList(initiallyChosenCourses);
        }
    }, [router.query.selectedCourses]);

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
                    <h3>Symbol Explanation</h3>
                    <p>{explanationText}</p>
                    <BreakLine />
                </div>
            );
        }

        return null; // Return null if no courses are selected
    };

    const handleRedirect = () => {
        const coursesString = JSON.stringify(courseList);

        const queryParams = {
            chosenCourses: encodeURIComponent(coursesString),
            year: encodeURIComponent(selectedYear),
            semester: encodeURIComponent(selectedSeason),
            studyCode: encodeURIComponent(selectedProgramCode),
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

    return (
        <Layout>
            <BackButton buttonText="< Select year" />
            <div className="flex flex-col items-center justify-center mt-20">
                <h2>{`${selectedProgramCode}, Year ${selectedYear}, ${selectedSeason}`}</h2>
            </div>
            <div>
                {renderToolbox()}
                {renderSymbolExplanation()}
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
                        <h3 className='text-2xl font-bold mt-2 mb-2'>Added Courses from Search</h3>
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
            </div>
        </Layout>
    );
};

export default ModifyPage;
