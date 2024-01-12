
import React, { useState, useEffect } from 'react';
import Select, { type SingleValue } from 'react-select';
import type { Program } from '~/interfaces/ProgramData';
import { api } from "~/utils/api";
import { useRouter } from 'next/router';
import { useLanguageContext } from '~/contexts/languageContext';

const Search = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [showAll, setShowAll] = useState<boolean>(false); // Show all programs or only the first 20
  const router = useRouter();
  const { language } = useLanguageContext();

  // Use useQuery directly within the functional component
  const query = api.program.getProgramListByLang.useQuery({
    language: language,
  });

  // useEffect to handle side effects
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if data is already available
        if (!query.isLoading && query.data) {
          // Access the data and handle loading/error states as needed
          const { data: response } = query;
  
          // Sort the programs array based on title
          const sortedPrograms = response.sort((a: Program, b: Program) => a.title.localeCompare(b.title));
          setPrograms(sortedPrograms);
          setFilteredPrograms(sortedPrograms.slice(0, 20));
        } else {
          // Fetch data using the query
          await query.refetch();
        }
      } catch (error) {
        // Handle error
        console.error('Error fetching data:', error);
      }
    };
  
    void fetchData();
  }, [language, query.isLoading, query.data]);
  

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
      const jsonString = JSON.stringify(selectedProgram);

      const queryParams = {
        selectedProgram: encodeURIComponent(jsonString),
      };

      if (selectedProgram) {
        try {
          void router.push({
            pathname: '/program',
            query: queryParams,
          });
        } catch (error) {
          // Handle the error if needed
          console.error('Error navigating:', error);
        }
      }
    }
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

  const titleText = language == "no" ? "Søk etter ditt studieprogram" : "Search for your study program"
  const placeHolderText = language == "no" ? "Skriv her" : "Type here"

  return (
    <div className='flex flex-col items-center'>
      <div className="mb-4">
        <h3>{titleText}</h3>
      </div>
      <div className='w-full flex flex-col items-center'>
        <Select
          className="text-black text-l rounded-full w-1/3"
          options={options}
          isSearchable
          placeholder={placeHolderText}
          onChange={handleSelectChange}
          onInputChange={handleInputChange}
          menuIsOpen={showAll}
        />
      </div>
    </div>
  );  
};

export default Search;
