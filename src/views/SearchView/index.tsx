
import React, { useState, useEffect } from 'react';
import Select, { type SingleValue } from 'react-select';
import type { Program } from '~/interfaces/ProgramData';
import { api } from "~/utils/api";
import { useRouter } from 'next/router';

const Search = () => {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
    const [language, setLanguage] = useState<string>('no'); // Default language is English
    const [showAll, setShowAll] = useState<boolean>(false); // Show all programs or only the first 20
    const router = useRouter();
    
    // Use useQuery directly within the functional component
    const result = api.program.programListByLang.useQuery(language);

    // useEffect to handle side effects
    useEffect(() => {
        // Check if data is available before setting the state
        if (result.data) {
            // Sort the programs array based on title
            const sortedPrograms = result.data.sort((a: Program, b: Program) => a.title.localeCompare(b.title));
            setPrograms(sortedPrograms);
            setFilteredPrograms(sortedPrograms.slice(0, 20));
        }
    }, [result.data, language]);

    const options = filteredPrograms.map((program) => ({
        value: program.programid,
        label: program.title + " - " + program.studyprogcode + " (" + program.studyprogstudylevel + ")",
    }));

    const handleSelectChange = async (
        selectedOption: SingleValue<{ value: string; label: string }>,
    ) => {
        // Use the selectedOption to get the course details
        if (selectedOption?.value) {
            const selectedProgram = programs.find((program) => program.programid === selectedOption.value);

            if (selectedProgram) {
                try {
                  await router.push({
                    pathname: `/program/${selectedProgram.studyprogcode}`,
                  });
                } catch (error) {
                  // Handle the error if needed
                  console.error('Error navigating:', error);
                }
              }
        }
    };

    const handleLanguageToggle = () => {
        setLanguage((prevLanguage) => (prevLanguage === 'en' ? 'no' : 'en'));
    };

    const handleInputChange = (inputValue: string) => {
        // If something is typed, show all programs
        if (inputValue.trim() !== '') {
            setShowAll(true);
            setFilteredPrograms(programs);
        } else {
            // If input is empty, show only the first 20 programs
            setShowAll(false);
            setFilteredPrograms(programs.slice(0, 20));
        }
    };

    return (
        <div>
            <h2 className="mb-4">Search Programs</h2>
            <div className="mb-3">
                <label className="mr-2">
                    Language Toggle:
                </label>
                <input
                    type="checkbox"
                    checked={language === 'no'}
                    onChange={handleLanguageToggle}
                />
                <span className="ml-2">Norwegian</span>
            </div>
            <Select
                className="text-black rounded-md"
                options={options}
                isSearchable
                placeholder="Select a program"
                onChange={handleSelectChange}
                onInputChange={handleInputChange}
                menuIsOpen={showAll}
            />
        </div>
    );
};

export default Search;
