import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const Calendar: React.FC = () => {
    const router = useRouter();
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

    useEffect(() => {
        // Use the query parameter directly from useRouter
        const courseList = router.query.chosenCourses as string[] | undefined;

        // Check if courseList is not undefined before setting the state
        if (courseList) {
            setSelectedCourses(courseList);
        }
    }, [router.query.chosenCourses]);

    return (
        <div>
            <h1>Selected Courses:</h1>
            <ul>
                {selectedCourses.map((course, index) => (
                    <li key={index}>{course}</li>
                ))}
            </ul>
        </div>
    );
};

export default Calendar;
