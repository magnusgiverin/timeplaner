import React, { useEffect, useState } from 'react';
import GreenButton from '../General/GreenButton';
import { api } from '~/utils/api';
import type { Course } from '~/interfaces/CourseData';
import Select from 'react-select';
import type { PropsValue, SingleValue } from 'react-select';
import type { DetailedCourse } from '~/interfaces/StudyPlanData';
import { useLanguageContext } from '~/contexts/languageContext';
import BreakLine from '../General/BreakLine';
import { useRouter } from 'next/router';

interface ToolboxProps {
    onConfirm: () => void;
    onSearch: (course: Course) => void; // Add the course parameter
    onToggleShowAll: () => void;
    exclude: Array<Course | DetailedCourse>;
    state: string;
    allSelected: boolean;
}

const Toolbox: React.FC<ToolboxProps> = ({ onConfirm, onSearch, onToggleShowAll, exclude, state, allSelected }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
    const [selectedValue, setSelectedValue] = useState<PropsValue<{ value: string; label: string; }> | null>(null);
    const [showAll, setShowAll] = useState<boolean>(false); // Show all programs or only the first 20

    const router = useRouter();
    const selectedSeason = router.query.season as string;

    const getCurrentYear = () => new Date().getFullYear();

    // Determine the semester code based on the current season and month
    const getSemesterCode = () => {
        const currentYear = getCurrentYear() % 100; // Get the last two digits of the current year

        // Determine the semester code based on the season and month
        if (selectedSeason === 'Spring') {
            return `${currentYear}v`;
        } else {
            return `${currentYear}h`;
        }
    };

    // Use useQuery directly within the functional component
    const query = api.course.courseList.useQuery({
        semesterCode: getSemesterCode(),
    });

    console.log(getSemesterCode())

    useEffect(() => {
        // Check if data is available before setting the state
        if (query.data) {
            // Filter courses based on the selected
            const filteredCourses = query.data.filter((course: Course) => {
                return !exclude.includes(course); // Check if courseId is in the exclude list
            });
    
            // Sort the filtered courses array based on courseId
            const sortedCourses = filteredCourses.sort((a: Course, b: Course) => {
                // Ensure that courseId is available before comparing
                if (a.courseid && b.courseid) {
                    return a.courseid.localeCompare(b.courseid);
                }
                return 0; // Default return if courseId is not available
            });
    
            setCourses(sortedCourses);
    
            // Initialize the options array with the first 20 courses
            setOptions(sortedCourses.slice(0, 20).map((course) => ({
                value: course.courseid,
                label: course.courseid + ' - ' + course.name,
            })));
        }
    }, [query.data, exclude]); // Include exclude in the dependency array

    // useEffect to handle side effects
    useEffect(() => {
        // Check if data is available before setting the state
        if (query.data) {
            // Filter courses based on the selected
            const filteredCourses = query.data.filter((course: Course) => {
                return !exclude.includes(course); // Check if courseId is in the exclude list
            });

            // Sort the filtered courses array based on courseId
            const sortedCourses = filteredCourses.sort((a: Course, b: Course) => {
                // Ensure that courseId is available before comparing
                if (a.courseid && b.courseid) {
                    return a.courseid.localeCompare(b.courseid);
                }
                return 0; // Default return if courseId is not available
            });

            setCourses(sortedCourses);
        }
    }, [query.data, exclude]); // Include exclude in the dependency array

    const handleSelectChange = (
        selectedOption: SingleValue<{ value: string; label: string }>,
    ) => {
        // Use the selectedOption to get the course details
        if (selectedOption?.value) {
            const selectedCourse = courses.find((course) => course.courseid === selectedOption.value);

            if (selectedCourse) {
                // Callback to the onSearch
                onSearch(selectedCourse);
            }
        }

        setSelectedValue(null); // Reset the selected value state
    };

    const handleInputChange = (inputValue: string) => {
        // Use the inputValue to filter the options and update the state
        const filteredCourses = courses.filter((course) =>
            course.courseid.toLowerCase().includes(inputValue.toLowerCase()) ||
            course.name.toLowerCase().includes(inputValue.toLowerCase())
        );

        const updatedOptions = filteredCourses.slice(0, 20).map((course) => ({
            value: course.courseid,
            label: course.courseid + ' - ' + course.name,
        }));

        if (inputValue.trim() !== '') {
            setShowAll(true);
            setOptions(updatedOptions);
        } else {
            setShowAll(false);
            setOptions(updatedOptions.slice(0, 20));
        }
    };

    const getShowAllLabel = () => {
        if (language === "no") {
            return state === "non-selected" ? "Vis bare valgte" : "Vis alle"
        } else {
            return state === "non-selected" ? "Show selected only" : "Show all"
        }
    }

    const getConfirmLabel = () => {
        return language === "no" ? "Gå til kalender" : "Go to calendar";
    }

    const getPlaceholderLabel = () => {
        return language === "no" ? "Legg til et fag i studieplanen" : "Add a program to your plan"
    }

    const { language } = useLanguageContext();

    const handleMenuOpen = () => {
        setShowAll(true);
    };

    const handleMenuClose = () => {
        setShowAll(false);
    };

    return (
        <div>
            <div>
                <Select
                    className="text-black text-l rounded-full w-full md:w-3/5 xl:w-2/5"
                    options={options}
                    isSearchable
                    placeholder={getPlaceholderLabel()}
                    onChange={handleSelectChange}
                    onInputChange={handleInputChange}
                    menuIsOpen={showAll}
                    value={selectedValue} // Set the value prop to control the selected value
                    onMenuOpen={handleMenuOpen}
                    onMenuClose={handleMenuClose}
                />
            </div>
            <div className="flex w-min-max">
                {!allSelected && (
                    <GreenButton
                        onClick={onToggleShowAll}
                        text={getShowAllLabel()}
                        className='mr-2 w-40'
                    />
                )}
                <button
                    className={`flex items-center text-white rounded-md p-2 mt-2 mb-2 bg-red-500`}
                    onClick={() => onConfirm()}
                >
                    <span className="mr-2">{getConfirmLabel()}</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                </button>
            </div>
            <BreakLine />
        </div>
    );
};

export default Toolbox;
