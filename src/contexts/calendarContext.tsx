import React, { createContext, useContext, useState } from 'react';
import type { FC, ReactNode } from 'react';
import type { Course } from '~/interfaces/CourseData';
import type { SemesterPlan } from '~/interfaces/SemesterPlanData';
import type { DetailedCourse } from '~/interfaces/StudyPlanData';

interface CalendarContextType {
    semesterPlans: SemesterPlan[];
    setSemesterPlans: React.Dispatch<React.SetStateAction<SemesterPlan[]>>;
    courseColors: Record<number, string>;
    setCourseColors: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    currentCourses: Array<Course | DetailedCourse>;
    setCurrentCourses: React.Dispatch<React.SetStateAction<Array<Course | DetailedCourse>>>;
    initialCourses: DetailedCourse[];
    setInitialCourses: React.Dispatch<React.SetStateAction<DetailedCourse[]>>;
    indexes: Record<string, number>;
    setIndexes: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    selectedSemesterPlans: SemesterPlan[];
    setSelectedSemesterPlans: React.Dispatch<React.SetStateAction<SemesterPlan[]>>;
}

const defaultValue: CalendarContextType = {
    semesterPlans: [],
    setSemesterPlans: () => {
        console.log("Setting semesterplans")
    },
    courseColors: {},
    setCourseColors: () => {
        console.log("Setting colors")
    },
    currentCourses: [],
    setCurrentCourses: () => {
        console.log("Setting chosen courses")
    },
    initialCourses: [],
    setInitialCourses: () => {
        console.log("Setting courses for the current program")
    },
    indexes: {},
    setIndexes: () => {
        console.log("Setting indexes for courses")
    },
    selectedSemesterPlans: [],
    setSelectedSemesterPlans: () => {
        console.log("Setting semesterplans")
    },
};

const CalendarContext = createContext<CalendarContextType>(defaultValue);

export const useCalendarContext = () => {
    const context = useContext(CalendarContext);
    if (!context) { 
        throw new Error('useLanguageContext must be used within a LanguageProvider');
    }
    return context;
};

export const CalendarContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [semesterPlans, setSemesterPlans] = useState<SemesterPlan[]>((defaultValue.semesterPlans));
    const [courseColors, setCourseColors] = useState<Record<number, string>>((defaultValue.courseColors));
    const [currentCourses, setCurrentCourses] = useState<Array<Course | DetailedCourse>>(defaultValue.currentCourses);
    const [initialCourses, setInitialCourses] = useState<DetailedCourse[]>(defaultValue.initialCourses)
    const [indexes, setIndexes] = useState<Record<string, number>>(defaultValue.indexes);
    const [selectedSemesterPlans, setSelectedSemesterPlans] = useState<SemesterPlan[]>((defaultValue.selectedSemesterPlans));

    return (
        <CalendarContext.Provider value={{ 
            semesterPlans, setSemesterPlans, 
            courseColors, setCourseColors,
            currentCourses, setCurrentCourses,
            initialCourses, setInitialCourses,
            indexes, setIndexes,
            selectedSemesterPlans, setSelectedSemesterPlans,
        }}>
            {children}
        </CalendarContext.Provider>
    );
};
