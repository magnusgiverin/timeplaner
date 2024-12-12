import { useEffect, useState } from "react";
import SubjectDetails from "../General/SubjectDetails";
import GreenButton from "../General/GreenButton";
import type { ChosenSubjectsData, DetailedCourse } from "~/interfaces/StudyPlanData";
import { useLanguageContext } from "~/contexts/languageContext";

interface DisplayProps {
    chosenSubjects: ChosenSubjectsData[];
    handleModifyRedirect: (selectedCourses: DetailedCourse[]) => void;
    programCode: string;
    handleCalendarRedirect: (selectedCourses: DetailedCourse[]) => void;
}

const Display: React.FC<DisplayProps> = ({ chosenSubjects, handleModifyRedirect, handleCalendarRedirect }) => {
    const [selectedPath, setSelectedPath] = useState<(string | null)[]>(Array(chosenSubjects.length).fill(null));
    const [selectedCourses, setSelectedCourses] = useState<DetailedCourse[]>([]);

    // State to track showMore for each group
    const [showMoreMap, setShowMoreMap] = useState<Record<string, boolean>>({});

    const { language } = useLanguageContext();

    useEffect(() => {
        resetSelectedSubjects();
        setShowMoreMap({});

    }, [chosenSubjects]);

    const resetSelectedSubjects = () => {
        setSelectedPath([]);

        // If courses are at the top level, add them to selectedCourses
        const topCourses: DetailedCourse[] = chosenSubjects.filter(isCourse).map(course => course as unknown as DetailedCourse);
        setSelectedCourses(topCourses);
    };

    const isCourse = (subject: DetailedCourse | ChosenSubjectsData): subject is DetailedCourse => 'credit' in subject;

    const handleRadioChange = (subject: DetailedCourse | ChosenSubjectsData, level: number) => {
        setSelectedPath((prevSelectedPath) => {
            const updatedSelectedPath = [...prevSelectedPath];

            // Disselect all radio buttons beneath the current level
            for (let i = level + 1; i < updatedSelectedPath.length; i++) {
                updatedSelectedPath[i] = null;
            }

            // Toggle the radio button for the current level
            updatedSelectedPath[level] = updatedSelectedPath[level] === subject.name ? null : subject.name;

            // Clear selectedCourses if the top-level radio button is deselected
            if (level === 0 && !updatedSelectedPath[level]) {
                setSelectedCourses([]);
            } else if ('courses' in subject && subject.courses) {
                // If there are courses, update the selectedCourses array
                const validCourses = subject.courses.filter(isCourse);
                setSelectedCourses(validCourses);
            }

            // Use the functional form to ensure state consistency
            return [...updatedSelectedPath];
        });
    };

    const renderRadioInput = (subject: DetailedCourse | ChosenSubjectsData, parentIndex: number, index: number, level: number) => {
        const handleClick = () => {
            handleRadioChange(subject as DetailedCourse, level);
        };

        return (
            <div key={index}>
                <label className="flex items-center space-x-2">
                    <input
                        type="radio"
                        name={`radio_${parentIndex}_${index}`}
                        value={subject.name}
                        checked={selectedPath[level] === subject.name}
                        onChange={handleClick}
                        className="w-3 h-3 flex-shrink-0"
                        style={{ marginRight: '16px', transform: 'scale(1.5)' }}
                    />
                    <span className="text-lg">{subject.name}</span>
                </label>
                {selectedPath[level] === subject.name && 'courses' in subject && (
                    <div className="ml-4">{renderSubjects(subject.courses, index, level + 1)}</div>
                )}
            </div>
        );
    };

    const renderNextButtons = () => {
        if (selectedCourses.length > 0) {
            const studyChoices: Record<string, string> = {};
            selectedCourses.forEach((course) => {
                studyChoices[course.studyChoice.code] = course.studyChoice.name;
            });

            const explanationText = Object.entries(studyChoices)
                .map(([code, name]) => `${code}: ${name}`)
                .join('\n');

            const explainLabel = language === "no" ? "Symbolforklaring" : "Symbol Key";
            const modifyLabel = language === "no" ? "Rediger emner" : "Modify courses";
            const calendarLabel = language === "no" ? "Gå til kalender" : "Go to calendar";

            const initiallyChosenCourses = selectedCourses.filter(course => course.studyChoice.code === 'O');

            const pointSum = initiallyChosenCourses.reduce((sum, course) => sum + Number(course.credit), 0);

            return (
                <div className="flex flex-column justify-center">
                    <GreenButton
                        text={explainLabel}
                        onClick={() => alert(explanationText)}
                    />

                    {/* Custom red button with arrow */}
                    {pointSum >= 30 ? (
                        <>
                            <GreenButton
                                text={modifyLabel}
                                onClick={() => handleModifyRedirect(selectedCourses)}
                                className="ml-2"
                            />
                            <button
                                className={`flex items-center text-white rounded-md p-2 mt-2 mb-2 ml-2 bg-red-500`}
                                onClick={() => handleCalendarRedirect(selectedCourses)}
                            >
                                <span className="mr-2">{calendarLabel}</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </button>
                        </>
                    ) : (
                        <button
                                className={`flex items-center text-white rounded-md p-2 mt-2 mb-2 ml-2 bg-red-500`}
                                onClick={() => handleModifyRedirect(selectedCourses)}
                            >
                                <span className="mr-2">{modifyLabel}</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                </svg>
                            </button>
                    )}
                </div>
            );
        }
    };

    const renderSubjects = (subjects: (DetailedCourse | ChosenSubjectsData)[] | undefined, parentIndex: number, level: number) => {
        const messageLabel = language === "no" ? "Ingen fag funnet for dette kurset." : "No subjects found for this course."

        // Check if subjects is undefined or empty
        if (!subjects || subjects.length === 0) {
            return (
                <p className="text-red-500">{messageLabel}</p>
            ); // Display a message when there are no subjects
        }

        // Group subjects by studyChoice.code
        const groupedSubjects: Record<string, (DetailedCourse)[]> = {}

        subjects.forEach((subject) => {
            const key =
                'courses' in subject && !Object.values(groupedSubjects).flat().includes(subject as DetailedCourse)
                    ? 'Uncategorized'
                    : (subject as DetailedCourse).courseGroupName;

            if (!groupedSubjects[key]) {
                groupedSubjects[key] = [];
            }

            groupedSubjects[key]?.push(subject as DetailedCourse);
        });

        // Function to toggle showMore for a specific group
        const toggleShowMore = (group: string) => {
            setShowMoreMap((prev) => ({ ...prev, [group]: !prev[group] }));
        };

        // Render the grouped subjects
        return (
            <div>
                {Object.entries(groupedSubjects).map(([group, groupSubjects], index) => (
                    <>
                    <div key={index}>
                        {group !== 'Uncategorized' && (
                            <h2 className="text-2xl font-bold mt-2 mb-2">{group}</h2>
                        )}
                        {groupSubjects.map((subject, subIndex) => {
                            const isRadioInput = 'courses' in subject;
                            return (
                                <div key={subIndex}>
                                    {isRadioInput
                                        ? renderRadioInput(subject, parentIndex, subIndex, level)
                                        : <SubjectDetails subject={subject} />}
                                </div>
                            );
                        }).slice(0, (showMoreMap[group] ?? groupSubjects.some(subject => 'courses' in subject)) ? groupSubjects.length : 5)}
                        {groupSubjects.length > 5 && !groupSubjects.some(subject => 'courses' in subject) && (
                            <button
                                className='flex items-center px-4 py-2 mt-2 mb-2 rounded-full bg-green-500 text-white hidden sm:inline-flex'
                                onClick={() => toggleShowMore(group)}
                            >
                                {showMoreMap[group] ? (language === "no" ? "Vis mindre" : "Show Less") : (language === "no" ? "Vis mer" : "Show More")}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-6 h-6 ml-2"
                                >
                                    {showMoreMap[group] ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    )}
                                </svg>
                            </button>
                        )}
                    </div>
                    </>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full flex flex-col items-left">
            {renderNextButtons()} {/* Render the explanation button once */}
            <div className="pt-4">{renderSubjects(chosenSubjects, -1, 0)}</div>
        </div>
    );
};

export default Display;