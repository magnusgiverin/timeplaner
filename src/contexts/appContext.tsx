
import React, { createContext, useContext, useState } from 'react';
import type { FC, ReactNode } from 'react';
import type { SubjectStructure } from '~/interfaces/StudyPlanData';

interface AppContextType {
    year: number;
    setYear: React.Dispatch<React.SetStateAction<number>>;
    season: string;
    setSeason: React.Dispatch<React.SetStateAction<string>>;
    index: number;
    setIndex: React.Dispatch<React.SetStateAction<number>>;
    subjectsStructure: SubjectStructure;
    setSubjectsStructure: React.Dispatch<React.SetStateAction<SubjectStructure>>; 
}

const isAutumnSeason = () => {
  const currentMonth = new Date().getMonth() + 1; // Months are zero-indexed
  return currentMonth >= 9 && currentMonth <= 12;
};

const defaultValue: AppContextType = {
    year: new Date().getFullYear(), // Set the initial year to the current year
    setYear: () => {
        console.log("Setting year")
    },
    season: isAutumnSeason() ? 'Autumn' : 'Spring',
    setSeason: () => {
        console.log("Setting season")
    },
    index: -1,
    setIndex: () => {
        console.log("Setting index")
    },
    subjectsStructure: [],
    setSubjectsStructure: () => {
        console.log("Setting subject structure")
    },
};

export const AppContext = createContext<AppContextType>(defaultValue);

export const useAppContext = () => {
    return useContext(AppContext);
};

export const AppContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [year, setYear] = useState<number>(defaultValue.year);
    const [season, setSeason] = useState<string>(defaultValue.season);
    const [index, setIndex] = useState<number>(defaultValue.index);
    const [subjectsStructure, setSubjectsStructure] = useState<SubjectStructure>(defaultValue.subjectsStructure); // Adjust the type accordingly

    return (
        <AppContext.Provider value={{ year, setYear, season, setSeason, index, setIndex, subjectsStructure, setSubjectsStructure }}>
            {children}
        </AppContext.Provider>
    );
};
