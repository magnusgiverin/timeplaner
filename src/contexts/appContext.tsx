import React, { createContext, useContext, FC, ReactNode, useState } from 'react';

interface AppContextType {
    year: number;
    setYear: React.Dispatch<React.SetStateAction<number>>;
    season: string;
    setSeason: React.Dispatch<React.SetStateAction<string>>;
    index: number;
    setIndex: React.Dispatch<React.SetStateAction<number>>;
    subjectsStructure: any[]; // Adjust the type accordingly
    setSubjectsStructure: React.Dispatch<React.SetStateAction<any[]>>; // Adjust the type accordingly
}

const isAutumnSeason = () => {
  const currentMonth = new Date().getMonth() + 1; // Months are zero-indexed
  return currentMonth >= 9 && currentMonth <= 12;
};

const defaultValue: AppContextType = {
    year: new Date().getFullYear(), // Set the initial year to the current year
    setYear: () => {},
    season: isAutumnSeason() ? 'Autumn' : 'Spring',
    setSeason: () => {},
    index: -1,
    setIndex: () => {},
    subjectsStructure: [],
    setSubjectsStructure: () => {},
};

export const AppContext = createContext<AppContextType>(defaultValue);

export const useAppContext = () => {
    return useContext(AppContext);
};

export const AppContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [year, setYear] = useState<number>(defaultValue.year);
    const [season, setSeason] = useState<string>(defaultValue.season);
    const [index, setIndex] = useState<number>(defaultValue.index);
    const [subjectsStructure, setSubjectsStructure] = useState<any[]>(defaultValue.subjectsStructure); // Adjust the type accordingly

    return (
        <AppContext.Provider value={{ year, setYear, season, setSeason, index, setIndex, subjectsStructure, setSubjectsStructure }}>
            {children}
        </AppContext.Provider>
    );
};
