import React, { useState, useEffect } from 'react';
import Select, { ActionMeta, SingleValue } from 'react-select';
import { Program } from '~/interfaces/Program';
import { api } from "~/utils/api";
import { NextRouter, useRouter } from 'next/router';

const Search = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const router = useRouter();

  // Use useQuery directly within the functional component
  const result = api.program.programList.useQuery();

  // useEffect to handle side effects
  useEffect(() => {
    // Check if data is available before setting the state
    if (result.data) {
      setPrograms(result.data);
    }
  }, [result.data]);

  const options = programs.map((program) => ({
    value: program.programId,
    label: program.disp_name,
  }));

  const handleSelectChange = (
    selectedOption: SingleValue<{ value: string; label: string }>, 
    actionMeta: ActionMeta<{ value: string; label: string }>
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

  return (
    <div>
      <h2>Search Programs</h2>
      <Select
        className="text-black"
        options={options}
        isSearchable
        placeholder="Select a program"
        onChange={handleSelectChange} // Call handleSelectChange on select change
      />
    </div>
  );
};

export default Search;
