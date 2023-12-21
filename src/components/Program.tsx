// components/Program.tsx
import React, { useState } from 'react';
import { Program as ProgramType } from "~/interfaces/ProgramData";

interface ProgramProps {
  selectedProgram: ProgramType;
  onButtonIndexChange: (index: number) => void; // Callback function type
}

const Program: React.FC<ProgramProps> = ({ selectedProgram, onButtonIndexChange }) => {
  const numberOfButtons =
    selectedProgram.studyprogStudyLevelCode === 580.0 ? 2 :
    selectedProgram.studyprogStudyLevelCode === 390.0 ? 3 :
    selectedProgram.studyprogStudyLevelCode === 590.0 ? 5 :
    1;

  const [selectedButtonIndex, setSelectedButtonIndex] = useState<number>(0);

  const handleButtonClick = (index: number) => {
    setSelectedButtonIndex(index);
    onButtonIndexChange(index); // Invoke the callback function
    // Add more logic as needed when a button is clicked
  };

  const buttons = Array.from({ length: numberOfButtons }, (_, index) => (
    <button
      key={index}
      className={`px-6 py-3 m-2 rounded-xl ${
        selectedButtonIndex === index ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white'
      }`}
      onClick={() => handleButtonClick(index)}
    >
      Year {index + 1}
    </button>
  ));
  
  return (
    <div>
      <h2 className="flex justify-center mt-10">{selectedProgram.studyprogCode}</h2>
      <div className="flex-wrap">
        {buttons}
      </div>
    </div>
  );
}

export default Program;
  