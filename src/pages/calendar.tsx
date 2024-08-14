import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import BreakLine from '~/components/General/BreakLine';
import Layout from '~/components/General/Layout';
import type { Course } from '~/interfaces/CourseData';
import type { DetailedCourse } from '~/interfaces/StudyPlanData';
import { useLanguageContext } from '~/contexts/languageContext';
import { generateColor } from '~/components/CalendarPage/Colors';
import CalendarDisplay from '~/components/CalendarPage/CalendarDisplay';
import { downloadICal, generateICal, saveIcal } from '~/components/CalendarPage/GenerateIcal';
import { api } from '~/utils/api';
import { useCalendarContext } from '~/contexts/calendarContext';
import ModifyCourses from '~/components/CalendarPage/ModifyCourses';
import BackButton from '~/components/General/BackButton';
import ActionButtons from '~/components/CalendarPage/ActionButtons';
import Header from '~/components/General/Header';

// Main Calendar component
const CalendarPage: React.FC = () => {
    const router = useRouter();

    const { language } = useLanguageContext();

    const {
        selectedSemesterPlans,
        setSelectedSemesterPlans,
        semesterPlans,
        setSemesterPlans,
        currentCourses,
        setCurrentCourses,
        courseColors,
        setCourseColors,
        indexes,
        setIndexes,
    } = useCalendarContext();

    useEffect(() => {
        // Use the query parameter directly from useRouter
        if (router.isReady && currentCourses.length === 0) {
            const courseListString = router.query.chosenCourses as string;

            const courseList = JSON.parse(decodeURIComponent(courseListString)) as Array<Course | DetailedCourse>;

            // Check if courseList is not undefined before setting the state
            if (courseList) {
                setCurrentCourses(courseList);
            }
        }
    }, [router.query.chosenCourses]);

    const selectedYear = router.query.year as string;
    const selectedProgramCode = decodeURIComponent(router.query.studyCode as string);
    const selectedSeason = router.query.semester as string;

    const currentYearLastDigits = new Date().getFullYear().toString().slice(-2);
    const currentSemester = `${currentYearLastDigits}${selectedSeason === 'Spring' ? 'v' : 'h'}`;
    const subjectList = currentCourses.map((course) => ('courseid' in course ? course.courseid : course.code));

    const query = api.semesterPlan.getSemesterPlan.useQuery({
        subjectCodes: subjectList.map(subjectCode => subjectCode ?? ''),
        semester: currentSemester,
    });

    const [isSaved, setIsSaved] = useState<boolean>(false);
    const [key, setKey] = useState<string>();

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const response = await query.refetch();

                if (isMounted && response?.data) {
                    setSemesterPlans(response.data);
                    setSelectedSemesterPlans(response.data
                        .filter((line) => line.hasOwnProperty("name"))
                        .map((semesterPlan) =>
                    ({
                        ...semesterPlan,
                        events: semesterPlan.events.filter((event) =>
                            event.studentgroups.some((studentgroup) =>
                                studentgroup.split("_")[0] === selectedProgramCode
                            )
                        )
                    })
                    ));

                    // Generate indexes based on subjectList
                    const generatedIndexes: Record<string, number> = {};
                    subjectList.forEach((subjectCode, index) => {
                        if (subjectCode) {
                            generatedIndexes[subjectCode] = index;
                        }
                    });
                    setIndexes(generatedIndexes);
                    const courseColors = generateColor(currentCourses.length);
                    setCourseColors(courseColors);
                }
            } catch (error) {
                console.error('Error fetching semester plans:', error);
            }
        };

        void fetchData();

        return () => {
            isMounted = false;
        };
    }, [currentCourses]);

    const getHeaderLabel = () => {
        if (language === 'no') {
            const translatedSeason = selectedSeason === 'Spring' ? 'Vår' : 'Høst';
            return `${selectedProgramCode}, ${selectedYear}. klasse, ${translatedSeason}`;
        } else {
            return `${selectedProgramCode}, Year ${selectedYear}, ${selectedSeason}`;
        }
    };

    const getExportLabel = () => {
        return language === 'no' ? 'Eksporter' : 'Export';
    };

    const getDownloadLabel = () => {
        return language === 'no' ? 'Last ned' : 'Download';
    };

    const getModifyLabel = () => {
        return language === 'no' ? 'Rediger' : 'Edit';
    };

    const handleModify = () => {
        // Scroll to the ModifyCourses component
        const modifyCoursesElement = document.getElementById('modifyCourses');
        if (modifyCoursesElement) {
            modifyCoursesElement.scrollIntoView({
                behavior: 'smooth',
            });
        }
    };

    const getSaveLabel = () => {
        return language === 'no' ? 'Lagre' : 'Save';
    };

    const handleExport = async () => {
        const translatedSeason = language === 'no'
            ? selectedSeason === 'Spring' ? 'Vår' : 'Høst'
            : selectedSeason;

        const filename = `${selectedProgramCode}-${selectedYear}-${translatedSeason}`
        const iCalContent = generateICal(selectedSemesterPlans);

        // Use try-catch to handle potential errors
        try {
            await downloadICal(iCalContent, filename + ".ics", selectedSeason);
        } catch (error) {
            // Handle or log the error as needed
            console.error('Error downloading iCal:', error);
        }
    };

    const handleDownload = () => {
        const translatedSeason = language === 'no'
            ? selectedSeason === 'Spring' ? 'Vår' : 'Høst'
            : selectedSeason;

        const filename = `${selectedProgramCode}-${selectedYear}-${translatedSeason}`
        const iCalContent = generateICal(selectedSemesterPlans);

        saveIcal(iCalContent, filename + ".ics");
    };

    const handleSaveRedirect = (key: string) => {
        const queryParam = {
            key: key,
        }

        void router.push({
            pathname: '/saved',
            query: queryParam,
        });
    };

    const handleSave = () => {
        const promptMessage =
            language === "no"
                ? "Skriv inn et navn for kalenderen for å gjenhente den senere:"
                : "Enter a name for the calendar to retrieve it at a later date:";

        const key = window.prompt(promptMessage)?.toLowerCase();

        if (key) {
            setIsSaved(true);
            setKey(key);

            const programCode = selectedProgramCode;
            const season = selectedSeason;
            const year = selectedYear;

            // Prepare data for storage
            const storageData = {
                selectedSemesterPlans,
                semesterPlans,
                currentCourses,
                courseColors,
                indexes,
                season,
                programCode,
                year,
            };

            // Convert the data to JSON format
            const jsonData = JSON.stringify(storageData);
            localStorage.setItem(key, jsonData);
            handleSaveRedirect(key);
        }
    };

    const handleExplaination = () => {
        const norweiganDetails = [
            // "Eksporter: Eksporter kalender til Google Calendar",
            "Last ned: Last ned kalender fil, for deling/import i kalendertjenester",
            "Rediger: Rediger innhold i kalender - paraleller, øvingstimer, etc.",
            isSaved !== undefined && !isSaved
                ? "Lagre: Lagre kalender på siden med et gjenkjennelig navn"
                : ""
        ]

        const englishDetails = [
            // "Export: Export the calendar to Google Calendar",
            "Download: Download the calendar file to your device",
            "Edit: Edit what events are shown in your calendar",
            isSaved !== undefined && !isSaved
                ? "Save: Save the calendar on our website with a recognisable name"
                : ""
        ]

        const explaination = (language === "no" ? norweiganDetails : englishDetails).filter(Boolean).join('\n\n');
        alert(explaination)
    };

    const handleModification = () => {
        // This function will be called when any modification occurs in ModifyCourses
        // You can toggle the isSaved state or perform any other actions here
        setIsSaved(false);
    };

    return (
        <Layout>
            <BackButton buttonText={language === "no" ? "Rediger emner" : "Edit subjects"} />
            <Header label={getHeaderLabel()} />
            <BreakLine />
            {selectedSemesterPlans.length > 0 && (
                <ActionButtons
                    onExport={handleExport}
                    onSave={handleSave}
                    onModify={handleModify}
                    onExplaination={handleExplaination}
                    onDownload={handleDownload}
                    labels={{
                        export: getExportLabel(),
                        download: getDownloadLabel(),
                        modify: getModifyLabel(),
                        save: getSaveLabel(),
                    }}
                    isSaved={isSaved}
                />
            )}
            <CalendarDisplay selectedSemesterPlans={selectedSemesterPlans} indexes={indexes} courseColors={courseColors} />
            {isSaved && (
                <>
                    <BreakLine />
                    <div>
                        <p>
                            {language === "no"
                                ? "Denne kalenderen er lagret under navnet: "
                                : "This calendar is saved under the the name: "}
                            <strong>{key}</strong>
                        </p>
                    </div>
                </>
            )}
            {selectedSemesterPlans.length > 0 && (
                <BreakLine />
            )}
            <ModifyCourses
                onModification={handleModification}
            />
        </Layout>
    );
};

export default CalendarPage;
