// components/Program.tsx
import React, { useEffect, useState } from 'react';
import type { Program, } from "~/interfaces/ProgramData";

interface YearSelectProps {
  setIndex: (index: number) => void;
  selectedProgram: Program; // Add this prop to access the selected season
  setSeason: (season: string) => void; // Add this prop to update the selected season
  selectedSeason: string;
  selectedIndex: number;
}

const YearSelect: React.FC<YearSelectProps> = ({
  selectedProgram,
  setIndex,
  setSeason,
  selectedSeason,
  selectedIndex,
}) => {
  const numberOfButtons =
    selectedProgram.studyprogStudyLevelCode === 580.0 ? 2
      : selectedProgram.studyprogStudyLevelCode === 390.0 ? 3
      : selectedProgram.studyprogStudyLevelCode === 590.0? 5
      : 1;

  const [selectedButtonIndex, setSelectedButtonIndex] = useState<number>(selectedIndex);
  
  const handleButtonClick = (index: number) => {
    if(index === selectedIndex) {
      setIndex(-1);
    } else {
      setIndex(index);
    }
  };

  useEffect(() => {
    setSelectedButtonIndex(selectedIndex);
  }, [selectedIndex]);

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
    <div className="text-center">
      <h2 className="flex justify-center mt-10">{selectedProgram.studyprogCode}</h2>
      <div className="flex-wrap">{buttons}</div>
      <button
        onClick={() => setSeason(selectedSeason === 'Spring' ? 'Autumn' : 'Spring')}
        className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
      >
        Chosen Season: {selectedSeason}
      </button>
    </div>
  );
};

export default YearSelect;