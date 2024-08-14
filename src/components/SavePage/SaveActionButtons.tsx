import { downloadICal, generateICal, saveIcal } from "~/components/CalendarPage/GenerateIcal";
import { useRouter } from "next/router";
import { useLanguageContext } from "~/contexts/languageContext";
import type { SavedData } from "~/pages/saved";

type ActionButtonProps = {
    savedData: SavedData;
    itemKey: string;
};

const ActionButtons = ({ savedData, itemKey }: ActionButtonProps) => {
    const router = useRouter(); // Ensure you initialize the router
    const { language } = useLanguageContext();

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

    const getChangeNameLabel = () => {
        return language === 'no' ? 'Bytt navn' : 'Change name';
    };

    const handleNameChange = async () => {
        // Use prompt to get new name from user
        const newName = prompt("Enter a new name:");
      
        if (newName) {
          // Assuming your data is stored in the 'currentKey' key
          const iCalContent = localStorage.getItem(itemKey);
            
          // Check if iCalContent is not null before proceeding
          if (iCalContent !== null) {
            // Save the data with the new key
            localStorage.setItem(newName, iCalContent);
      
            // Remove the data from the old key
            localStorage.removeItem(itemKey);
      
            void router.push({
                pathname: '/saved',
                query: { key: newName },
              });
          } else {
            // Handle the case when iCalContent is null
            console.error('Error: iCalContent is null');
          }
        }
      };
      
    const handleExport = async () => {
        const translatedSeason = language === 'no'
            ? savedData?.season === 'Spring' ? 'Vår' : 'Høst'
            : savedData?.season;

        const filename = `${savedData?.programCode}-${savedData?.year}-${translatedSeason}`
        const iCalContent = generateICal(savedData?.selectedSemesterPlans ?? []);

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
        const iCalContent = generateICal(savedData?.selectedSemesterPlans ?? []);

        saveIcal(iCalContent, filename + ".ics");
    };

    const handleExplaination = () => {
        const norweiganDetails = [
            // "Eksporter: Eksporter kalender til Google Calendar",
            "Last ned: Last ned kalender fil, for deling/import i kalendertjenester",
            "Lag ny: Lag en ny kalender",
            "Bytt navn: Bytt navn på kalenderen din"
        ]

        const englishDetails = [
            // "Export: Export the calendar to Google Calendar",
            "Download: Download the calendar file to your device",
            "Make new: Make a new calendar",
            "Change name: Change the name of the calendar on your device"
        ]

        const explaination = (language === "no" ? norweiganDetails : englishDetails).filter(Boolean).join('\n\n');
        alert(explaination)
    };

    return (
        <div className="flex flex-wrap items-center justify-center">
            {/* <button
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
            </button> */}

            <button
                onClick={handleDownload} // Ensure you call the function here
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
                onClick={handleCreate} // Removed the extra parentheses here
                className="m-1 bg-green-500 text-white rounded-full p-2 flex items-center justify-center h-full"
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
            <button
                onClick={handleNameChange} // Removed the extra parentheses here
                className="m-1 bg-green-500 text-white rounded-full p-2 flex items-center justify-center h-full"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 mr-2"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                </svg>
                {getChangeNameLabel()}
            </button>
            <button
            onClick={handleExplaination}
            className="p-2 m-1 flex items-center justify-center h-full"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-7 h-7"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
            </svg>
        </button>
        </div>
    );
};

export default ActionButtons;
