import React from 'react';
import { DetailedCourse } from '../SelectPage/DisplayCourses';
import { Course } from '~/interfaces/CourseData';

interface SubjectDetailsProps {
    subject: DetailedCourse | Course;
}

const SubjectDetails: React.FC<SubjectDetailsProps> = ({ subject }) => {
    // Check the type of the subject prop
    if ('studyChoice' in subject && 'courseGroupName' in subject) {
        // DetailedCourse type
        return (
            <a
                key={subject.code}
                href={`https://www.ntnu.no/studier/emner/${subject.code}#tab=omEmnet`}
                className="inline-block bg-blue-500 text-white p-2 mt-2 mb-2 rounded-md text-decoration-none"
                target="_blank"
                rel="noopener noreferrer"
            >
                <div>
                    {`${subject.code}: ${subject.name} (${subject.studyChoice.code}, ${subject.credit})`}
                </div>
            </a>
        );
    } else {
        // Course type
        return (
            <a
                key={subject.courseId}
                href={`https://www.ntnu.no/studier/emner/${subject.courseId}#tab=omEmnet`}
                className="inline-block bg-blue-500 text-white p-2 mt-2 mb-2 rounded-md text-decoration-none"
                target="_blank"
                rel="noopener noreferrer"
            >
                <div>
                    {`${subject.courseId}: ${subject.name}`}
                </div>
            </a>
        );
    }
};

export default SubjectDetails;

