import React, { useState, useEffect } from 'react';
import Select, { SingleValue } from 'react-select';
import { Program } from '~/interfaces/ProgramData';
import { api } from "~/utils/api";
import { useRouter } from 'next/router';

const Search = () => {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [language, setLanguage] = useState<string>('no'); // Default language is English
    const router = useRouter();
  
    // Use useQuery directly within the functional component
    const result = api.program.programListByLang.useQuery(language);
  
    // useEffect to handle side effects
    useEffect(() => {
      // Check if data is available before setting the state
      if (result.data) {
        // Sort the programs array based on title
        const sortedPrograms = result.data.slice().sort((a : Program, b : Program) => a.title.localeCompare(b.title));
        setPrograms(sortedPrograms);
      }
    }, [result.data, language]);
  
    const options = programs.map((program) => ({
      value: program.programId,
      label: program.title + " - " + program.studyprogCode + " (" + program.studyprogStudyLevel + ")",
    }));
  
    const handleSelectChange = (
      selectedOption: SingleValue<{ value: string; label: string }>, 
    ) => {
      // Use the selectedOption to get the course details
      if (selectedOption && selectedOption.value) {
        const selectedProgram = programs.find((program) => program.programId === selectedOption.value);
  
        if (selectedProgram) {
          router.push({
            pathname: `/program/${selectedProgram.programId}`,
          });
        }
      }
    };

    const handleLanguageToggle = () => {
      setLanguage((prevLanguage) => (prevLanguage === 'en' ? 'no' : 'en'));
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
            className="text-black"
            options={options}
            isSearchable
            placeholder="Select a program"
            onChange={handleSelectChange}
          />
        </div>
      );      
  };
  
  export default Search;
