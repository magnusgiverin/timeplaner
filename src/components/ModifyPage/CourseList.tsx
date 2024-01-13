import React from 'react';
import GreenButton from '../General/GreenButton';
import SubjectDetails from '../General/SubjectDetails';
import type { Course } from '~/interfaces/CourseData';
import type { DetailedCourse } from '~/interfaces/StudyPlanData';

type CourseListProps = {
  courses: DetailedCourse[];
  showMore?: boolean;
  toggleShowMore: () => void;
  isCourseSelected: (course: Course | DetailedCourse) => boolean;
  toggleSelection: (course: Course | DetailedCourse) => void;
};

const CourseList: React.FC<CourseListProps> = ({ courses, showMore, toggleShowMore, isCourseSelected, toggleSelection }) => {
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
        <GreenButton
          text={showMore ? 'Show Less' : 'Show More'}
          onClick={() => toggleShowMore()}
        />
      )}
    </div>
  );
};

export default CourseList;
