import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CalendarDisplay from "~/components/Calendar/CalendarDisplay";
import { setContrast } from "~/components/Calendar/Colors";
import { downloadICal, generateICal, saveIcal } from "~/components/Calendar/GenerateIcal";
import Header from "~/components/Calendar/Header";
import BackButton from "~/components/General/BackButton";
import Layout from "~/components/General/Layout";
import { useLanguageContext } from "~/contexts/languageContext";
import type { Course } from '~/interfaces/CourseData';
import type { SemesterPlan } from '~/interfaces/SemesterPlanData';
import type { DetailedCourse } from '~/interfaces/StudyPlanData';

interface SavedData {
    selectedSemesterPlans: SemesterPlan[];
    semesterPlans: SemesterPlan[];
    currentCourses: (Course | DetailedCourse)[];
    courseColors: Record<number, string>
    indexes: Record<string, number>;
    season: string;
    programCode: string;
    year: string;
}

const SavePage = () => {
    const [savedData, setSavedData] = useState<SavedData>();

    const router = useRouter();
    const username = router.query.username as string;
    const { language } = useLanguageContext();

    useEffect(() => {
        // Retrieve data from localStorage
        const storedData = localStorage.getItem(username); // Replace 'your_key' with your actual key

        if (storedData) {
            const parsedData = JSON.parse(storedData) as SavedData;
            setSavedData(parsedData);
        }

    }, [router]);

    const getHeaderLabel = () => {
        if (language === 'no' && savedData) {
            const translatedSeason = savedData.season === 'Spring' ? 'Vår' : 'Høst';
            return `${savedData.programCode}, ${savedData.year}. klasse, ${translatedSeason}`;
        } else if (savedData) {
            return `${savedData.programCode}, Year ${savedData.year}, ${savedData.season}`;
        } else {
            return "";
        }
    };

    const handleRedirect = () => {
        // Check if the pressed key is Enter (key code 13)
        void router.push({
            pathname: '/calsearch',
        });
    };

    const handleCreate = () => {
        // Check if the pressed key is Enter (key code 13)
        void router.push({
            pathname: '/',
        });
    };
    const getExportLabel = () => {
        return language === 'no' ? 'Eksporter' : 'Export';
    };

    const getDownloadLabel = () => {
        return language === 'no' ? 'Last ned' : 'Download';
    };

    const getCreateLabel = () => {
        return language === 'no' ? 'Lag ny' : 'Make new';
    };

    const handleExport = async () => {
        const translatedSeason = language === 'no'
            ? savedData?.season === 'Spring' ? 'Vår' : 'Høst'
            : savedData?.season;

        const filename = `${savedData?.programCode}-${savedData?.year}-${translatedSeason}`
        const iCalContent = generateICal(savedData?.selectedSemesterPlans ?? [], filename);

        // Use try-catch to handle potential errors
        try {
            await downloadICal(iCalContent, filename + ".ics", savedData?.season ?? "");
        } catch (error) {
            // Handle or log the error as needed
            console.error('Error downloading iCal:', error);
        }
    };

    const handleDownload = () => {
        const translatedSeason = language === 'no'
            ? savedData?.season === 'Spring' ? 'Vår' : 'Høst'
            : savedData?.season;

        const filename = `${savedData?.programCode}-${savedData?.year}-${translatedSeason}`
        const iCalContent = generateICal(savedData?.selectedSemesterPlans ?? [], filename);

        saveIcal(iCalContent, filename + ".ics");
    };

    return (
        <Layout>
            {savedData ? (
                <>
                    <Header label={getHeaderLabel()} />
                    <h3 className="flex flex-col items-center justify-center text-green-500 mb-2">{username}</h3>
                    <div className="flex flex-wrap items-center justify-center">
                        <button
                            onClick={handleExport}
                            className="m-1 bg-blue-500 text-white rounded-full p-2 flex items-center justify-center h-full"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6 mr-2"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                            </svg>
                            {getExportLabel()}
                        </button>

                        <button
                            onClick={() => { handleDownload }}
                            className="m-1 bg-blue-500 text-white rounded-full p-2 flex items-center justify-center h-full"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6 mr-2"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            {getDownloadLabel()}
                        </button>
                        <button
                            onClick={handleCreate}
                            className="m-1 bg-red-500 text-white rounded-full p-2 flex items-center justify-center h-full"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6 mr-2"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
                            </svg>
                            {getCreateLabel()}
                        </button>
                    </div>
                    <CalendarDisplay selectedSemesterPlans={savedData.selectedSemesterPlans} indexes={savedData.indexes} courseColors={savedData.courseColors} />
                    <div className="flex flex-col wrap-auto">
                        {savedData.selectedSemesterPlans.map((semesterPlan) => {
                            const index = savedData.indexes[semesterPlan.courseid ?? 0];
                            const color = index !== undefined ? savedData.courseColors[index] : undefined;

                            return (
                                <div
                                    key={semesterPlan.courseid}
                                    className="p-2 mt-2 mb-2 rounded-md"
                                    style={{
                                        ...(savedData.courseColors && index !== undefined && {
                                            backgroundColor: savedData.courseColors[index!] as string,
                                            borderColor: color ? setContrast(color) : 'defaultBorderColor',
                                        }),
                                        color: color ? setContrast(color) : 'black', // Default text color if `color` is undefined
                                        width: 'fit-content', // Ensure width is no longer than the content
                                        whiteSpace: 'nowrap', // Prevent wrapping to the next line
                                    }}
                                >
                                    <span className="ml-2 mr-2">{semesterPlan.courseid + ": " + semesterPlan.coursename}</span>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div>
                    <p className="mb-2 flex flex-col">
                        {language === "no" ? "Fant ingen kalender for brukernavn: " + username + " på din maskin" : "No calendar found for username: " + username + " on your machine"}
                    </p>
                    <BackButton redirect={handleRedirect} />
                </div>
            )
            }
        </Layout >
    );
};

export default SavePage;
