import React from 'react';
import type { Course } from '~/interfaces/CourseData';
import type { DetailedCourse } from '~/interfaces/StudyPlanData';

interface SubjectDetailsProps {
    subject: DetailedCourse | Course;
}

const SubjectDetails: React.FC<SubjectDetailsProps> = ({ subject }) => {
    // Check the type of the subject prop
    if ('studyChoice' in subject) {
        // DetailedCourse type
        return (
            <div className="text-white text-decoration-none flex items-center">
                <div className="bg-blue-500 p-2 mt-2 mb-2 rounded-md ">
                    {`${subject.code}: ${subject.name} (${subject.studyChoice.code}, ${subject.credit})`}
                </div>
                <a
                    className='rounded-md ml-2'
                    href={`https://www.ntnu.no/studier/emner/${subject.code}#tab=omEmnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                    </svg>
                </a>
            </div>
        );
    } else {
        // Course type
        return (
            <div className="text-white  text-decoration-none flex items-center">
                <div className="bg-blue-500 p-2 mt-2 mb-2 rounded-md ">
                {`${subject.courseid}: ${subject.name}`}                </div>
                <a
                    className='rounded-md transition duration-300 ease-in-out hover:bg-green-500 ml-2'
                    href={`https://www.ntnu.no/studier/emner/${subject.courseid}#tab=omEmnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                    </svg>
                </a>
            </div>
        );
    }
};

export default SubjectDetails;

