// components/Program.
import React from 'react';
import { Program as ProgramType } from "~/interfaces/Program";

// Define the type for the selectedCourse object
interface ProgramProps {
  selectedProgram: ProgramType;
}

const Program: React.FC<ProgramProps> = ({ selectedProgram }) => {
  // Determine the number of buttons based on the "study_level" attribute
  const numberOfButtons =
    selectedProgram.study_level === 'Mastergrad 2 år' ? 2 :
    selectedProgram.study_level === 'Bachelor' ? 3 :
    selectedProgram.study_level === 'Master - 5 år' ? 5 :
    1;

  // Create an array of button elements based on the determined number
  const buttons = Array.from({ length: numberOfButtons }, (_, index) => (
    <button key={index} className="bg-blue-500 text-white px-10 py-3 m-5 rounded-xl">
      Year {index + 1}
    </button>
  ));

  return (
    <div>
      <h2 className="flex font-bold text-5xl">{selectedProgram.programId}</h2>
      {/* Render the buttons */}
      <div className="flex">{buttons}</div>
      {/* Add more properties as needed */}
    </div>
  );
};

export default Program;
