import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CalendarDisplay from "~/components/CalendarPage/CalendarDisplay";
import Header from "~/components/General/Header";
import BackButton from "~/components/General/BackButton";
import Layout from "~/components/General/Layout";
import ActionButtons from "~/components/SavePage/SaveActionButtons";
import { useLanguageContext } from "~/contexts/languageContext";
import type { Course } from '~/interfaces/CourseData';
import type { SemesterPlan } from '~/interfaces/SemesterPlanData';
import type { DetailedCourse } from '~/interfaces/StudyPlanData';
import ModifyCourses from '~/components/CalendarPage/ModifyCourses';
import { useCalendarContext } from '~/contexts/calendarContext';

export interface SavedData {
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
    const key = router.query.key as string;
    const { language } = useLanguageContext();

    const {
        setSemesterPlans,
        setSelectedSemesterPlans,
        selectedSemesterPlans,
        setCourseColors,
        setIndexes,
    } = useCalendarContext();

    useEffect(() => {
        // Retrieve data from localStorage
        const storedData = localStorage.getItem(key); // Replace 'your_key' with your actual key
        if (storedData) {
            const parsedData = JSON.parse(storedData) as SavedData;
            console.log(parsedData.selectedSemesterPlans)
            setSavedData(parsedData);
            setSemesterPlans(parsedData.semesterPlans);
            setSelectedSemesterPlans(parsedData.selectedSemesterPlans);
            setCourseColors(parsedData.courseColors)
            setIndexes(parsedData.indexes)
        }
    }, [router]);

    console.log(selectedSemesterPlans);

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
            pathname: '/retrieve',
        });
    };

    useEffect(() => {
        const storedData = localStorage.getItem(key);

        if (storedData && selectedSemesterPlans) {
            try {
                const parsedData = JSON.parse(storedData) as SavedData;

                // Perform the replacement in the parsed data
                parsedData.selectedSemesterPlans = selectedSemesterPlans;

                // Convert the modified data back to a JSON string
                const updatedData = JSON.stringify(parsedData);

                // Update the local storage with the modified content
                localStorage.setItem(key, updatedData);
            } catch (error) {
                console.error("Error parsing or modifying data:", error);
            }
        }
    }, [selectedSemesterPlans]);
    
    return (
        <Layout>
            <BackButton redirect={handleRedirect} />
            {savedData && (
                <>
                    <Header label={getHeaderLabel()} />
                    <h3 className="flex flex-col items-center justify-center text-green-500 mb-2">{key}</h3>
                    <ActionButtons itemKey={key} savedData={savedData} />
                    <CalendarDisplay selectedSemesterPlans={selectedSemesterPlans} indexes={savedData.indexes} courseColors={savedData.courseColors} />
                    <ModifyCourses/>
                </>
            )}
        </Layout>
    );
}

export default SavePage;
