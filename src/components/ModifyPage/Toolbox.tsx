import React, { useEffect, useState } from 'react';
import GreenButton from '../General/GreenButton';
import { api } from '~/utils/api';
import type { Course } from '~/interfaces/CourseData';
import Select from 'react-select';
import type { PropsValue, SingleValue } from 'react-select';
import type { DetailedCourse } from '~/interfaces/StudyPlanData';
import { useLanguageContext } from '~/contexts/languageContext';
import { useAppContext } from '~/contexts/appContext';
import BreakLine from '../General/BreakLine';

interface ToolboxProps {
    onConfirm: () => void;
    onSearch: (course: Course) => void; // Add the course parameter
    onToggleShowAll: () => void;
    exclude: Array<Course | DetailedCourse>;
    state: string;
    allSelected: boolean;
}

const Toolbox: React.FC<ToolboxProps> = ({ onConfirm, onSearch, onToggleShowAll, exclude, state, allSelected }) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [courses, setCourses] = useState<Course[]>([]);
    const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
    const [selectedValue, setSelectedValue] = useState<PropsValue<{ value: string; label: string; }> | null>(null);
    const [showAll, setShowAll] = useState<boolean>(false); // Show all programs or only the first 20

    const { season } = useAppContext();

    const getCurrentYear = () => new Date().getFullYear();
    const getCurrentMonth = () => new Date().getMonth() + 1; // Month is zero-indexed, so add 1

    // Determine the semester code based on the current season and month
    const getSemesterCode = () => {
        const currentYear = getCurrentYear() % 100; // Get the last two digits of the current year
        const currentMonth = getCurrentMonth();

        // Determine the semester code based on the season and month
        if (season === 'Spring' || (season === 'Autumn' && currentMonth >= 1 && currentMonth <= 6)) {
            return `${currentYear}v`;
        } else {
            return `${currentYear}h`;
        }
    };

    // Use useQuery directly within the functional component
    const query = api.course.courseList.useQuery({
        semesterCode: getSemesterCode(),
    });

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


    // useEffect to handle no input
    useEffect(() => {
        // Check if data is available before setting the state
        if (!searchQuery) {
            setOptions([]); // Clear options when searchQuery is empty
        }
    }, [searchQuery]);

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
        setSearchQuery(inputValue); // Update searchQuery state

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

    return (
        <div>
            <div>
                <Select
                    className="text-black rounded-full mt-2 w-1/3"
                    options={options}
                    isSearchable
                    placeholder={getPlaceholderLabel()}
                    onChange={handleSelectChange}
                    onInputChange={handleInputChange}
                    menuIsOpen={showAll}
                    value={selectedValue} // Set the value prop to control the selected value
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
                <GreenButton
                    onClick={onConfirm}
                    text={getConfirmLabel()}
                    className='bg-red-500'
                />
            </div>
            <BreakLine/>
        </div>
    );
};

export default Toolbox;
