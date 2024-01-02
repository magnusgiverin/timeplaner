import React from 'react';
import GreenButton from '../General/GreenButton';
import SubjectDetails from '../General/SubjectDetails';
import { DetailedCourse } from '../SelectPage/DisplayCourses';

type CourseListProps = {
  courses: DetailedCourse[];
  showMore?: boolean;
  toggleShowMore: () => void;
  isCourseSelected: (courseCode: string) => boolean;
  toggleSelection: (courseCode: string) => void;
};

const CourseList: React.FC<CourseListProps> = ({ courses, showMore, toggleShowMore, isCourseSelected, toggleSelection }) => {
  return (
    <div>
      <ul>
        {courses.slice(0, showMore ? courses.length : 5).map((course, index) => (
          <li key={index}>
            <input
              type="checkbox"
              id={course.code}
              name={`subjectGroup_${course.courseGroupName}_${course.code}`}
              checked={isCourseSelected(course.code)}
              onChange={() => toggleSelection(course.code)}
              style={{ marginRight: '8px', transform: 'scale(1.5)' }} // Add this style for larger checkboxes
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
