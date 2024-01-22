import React from 'react';
import SubjectDetails from '../General/SubjectDetails';
import type { Course } from '~/interfaces/CourseData';
import type { DetailedCourse } from '~/interfaces/StudyPlanData';
import { useLanguageContext } from '~/contexts/languageContext';

type CourseListProps = {
  courses: DetailedCourse[];
  showMore?: boolean;
  toggleShowMore: () => void;
  isCourseSelected: (course: Course | DetailedCourse) => boolean;
  toggleSelection: (course: Course | DetailedCourse) => void;
};

const CourseList: React.FC<CourseListProps> = ({ courses, showMore, toggleShowMore, isCourseSelected, toggleSelection }) => {

  const { language } = useLanguageContext();

  return (
    <div>
      <ul>
        {courses.slice(0, showMore ? courses.length : 5).map((course, index) => (
          <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id={course.code}
              name={`subjectGroup_${course.courseGroupName}_${course.code}`}
              checked={isCourseSelected(course)}
              onChange={() => toggleSelection(course)}
              style={{ marginRight: '16px', transform: 'scale(1.5)' }}
            />
            <SubjectDetails subject={course} />
          </li>
        ))}
      </ul>
      {courses.length > 5 && (
        <button
        className='flex items-center px-4 py-2 mt-2 mb-2 rounded-full bg-green-500 text-white hidden sm:inline-flex'
        onClick={toggleShowMore}
    >
        {showMore ? (language === "no" ? "Vis mindre" : "Show Less") : (language === "no" ? "Vis mer" : "Show More")}
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 ml-2"
        >
            {showMore ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
            ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            )}
        </svg>
    </button>
      )}
    </div>
  );
};

export default CourseList;
