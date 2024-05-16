import type { SemesterPlan } from "~/interfaces/SemesterPlanData";
import type { SavedData } from "~/pages/saved";
import { setContrast } from "../CalendarPage/Colors";

const SubjectDetails = ({ savedData, semesterPlan }: { savedData: SavedData; semesterPlan: SemesterPlan }) => {
    const index = savedData.indexes[semesterPlan.courseid ?? 0];
    const color = index !== undefined ? savedData.courseColors[index] : undefined;
  
    return (
      <div key={semesterPlan.courseid} className="text-white flex items-center">
        <div
          className="p-2 mt-2 mb-2 rounded-md"
          style={{
            ...(savedData.courseColors && index !== undefined && {
              backgroundColor: savedData.courseColors[index],
              borderColor: color ? setContrast(color) : 'defaultBorderColor',
            }),
            color: color ? setContrast(color) : 'black',
          }}
        >
          {`${semesterPlan.courseid}: ${semesterPlan.coursename}`}
        </div>
        <a
          className='rounded-md transition duration-300 ease-in-out hover:bg-green-500 ml-2'
          href={`https://www.ntnu.no/studier/emner/${semesterPlan.courseid}#tab=omEmnet`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
        </a>
        <a
          className='rounded-md transition duration-300 ease-in-out hover:bg-green-500 ml-2'
          href={`https://grades.no/course/${semesterPlan.courseid}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
          </svg>
        </a>
      </div>
    );
  };
  
  export default SubjectDetails;