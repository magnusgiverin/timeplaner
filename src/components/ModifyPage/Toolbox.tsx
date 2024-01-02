import React, { useEffect, useState } from 'react';
import GreenButton from '../General/GreenButton';
import { api } from '~/utils/api';
import { Course } from '~/interfaces/CourseData';
import Select, { ActionMeta, PropsValue, SingleValue } from 'react-select';

interface ToolboxProps {
    onConfirm: () => void;
    onSearch: (course: Course) => void; // Add the course parameter
    onToggleShowAll: () => void;
    season: string;
    exclude: string[];
    state: string;
    allSelected: boolean;
}

const Toolbox: React.FC<ToolboxProps> = ({ onConfirm, onSearch, onToggleShowAll, season, exclude, state, allSelected }) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [courses, setCourses] = useState<Course[]>([]);
    const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
    const [selectedValue, setSelectedValue] = useState<PropsValue<{ value: string; label: string; }> | null>(null);
    const [showAll, setShowAll] = useState<boolean>(false); // Show all programs or only the first 20

    // Use useQuery directly within the functional component
    const result = api.course.courseList.useQuery();

    // useEffect to handle side effects
    useEffect(() => {
        // Check if data is available before setting the state
        if (result.data) {
            // Filter courses based on the selected season
            const filteredCourses = result.data.filter((course: Course) => {
                // Assuming you have a property named 'season' in the Course object
                return (
                    !exclude.includes(course.courseId) // Check if courseId is in the exclude list
                );
            });

            // Sort the filtered courses array based on courseId
            const sortedCourses = filteredCourses.sort((a: Course, b: Course) => {
                // Ensure that courseId is available before comparing
                if (a.courseId && b.courseId) {
                    return a.courseId.localeCompare(b.courseId);
                }
                return 0; // Default return if courseId is not available
            });

            setCourses(sortedCourses);
        }
    }, [result.data, season, exclude]); // Include selectedSeason in the dependency array

    // useEffect to handle no input
    useEffect(() => {
        // Check if data is available before setting the state
        if (!searchQuery) {
            setOptions([]); // Clear options when searchQuery is empty
        }
    }, [searchQuery]);

    const handleSelectChange = (
        selectedOption: SingleValue<{ value: string; label: string }>,
        actionMeta: ActionMeta<{ value: string; label: string }>
      ) => {
        // Use the selectedOption to get the course details
        if (selectedOption && selectedOption.value) {
            const selectedCourse = courses.find((course) => course.courseId === selectedOption.value);

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
        const filteredCourses = courses.filter((course: Course) => {
            // Assuming you have a property named 'season' in the Course object
            return (
                course.seasonfrom_ex === season.toUpperCase() ||
                course.seasonfrom_und === season.toUpperCase()
            );
        }).filter((course) =>
            course.courseId.toLowerCase().includes(inputValue.toLowerCase()) ||
            course.name.toLowerCase().includes(inputValue.toLowerCase())
        );

        const updatedOptions = filteredCourses.slice(0, 20).map((course) => ({
            value: course.courseId,
            label: course.courseId + ' - ' + course.name,
        }));

        if (inputValue.trim() !== '') {
            setShowAll(true);
            setOptions(updatedOptions);
        } else {
            setShowAll(false);
            setOptions(updatedOptions.slice(0, 20));
        }
    };

    return (
        <div>
            <div className="flex w-min-max">
                {!allSelected && (
                    <GreenButton
                        onClick={onToggleShowAll}
                        text={state === "non-selected" ? "Show selected only" : "Show all"}
                        className='mr-2 w-60'
                    />
                )}
                <GreenButton
                    onClick={onConfirm}
                    text="Confirm"
                    className='mr-2'
                />
            </div>
            <div>
                <Select
                    className="text-black rounded-md mt-2 w-100"
                    options={options}
                    isSearchable
                    placeholder="Add a program to your plan"
                    onChange={handleSelectChange}
                    onInputChange={handleInputChange}
                    menuIsOpen={showAll}
                    value={selectedValue} // Set the value prop to control the selected value
                />
            </div>
        </div>
    );
};

export default Toolbox;
