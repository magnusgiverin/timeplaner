import { useEffect } from "react";
import type { CourseGroup, StudyDirection, StudyPeriod, StudyWayPoint, SubjectStructure, ChosenSubjectsData, StudyPlan } from "~/interfaces/StudyPlanData";
import { api } from "~/utils/api";

interface CourseLogicProps {
    year: number;
    programCode: string;
    season: string;
    onSubjectsStructureChange: (subjectStructure: SubjectStructure) => void;
}

const isAutumnSeason = () => {
    const currentMonth = new Date().getMonth() + 1;
    const autumnStartMonth = 8;
    return currentMonth >= autumnStartMonth;
};

const getCurrentYear = () => new Date().getFullYear();

// Function to get all subjects from StudyDirection
const getSubjectsFromDirection = (direction: StudyDirection): ChosenSubjectsData[] => {
    const subjects: ChosenSubjectsData[] = [];
    const courseGroups: CourseGroup[] = [];

    if (direction.courseGroups) {
        direction.courseGroups.forEach((group) => {
            const coursesWithCode = group.courses.map(course => ({
                code: course.code,
                name: course.name,
                credit: course.credit,
                planelement: course.planelement,
                studyChoice: course.studyChoice,
                courseGroupName: group.name,
            }));

            if (coursesWithCode.length > 0) {
                // Add CourseGroup only if courses is not empty
                courseGroups.push({ code: group.code, courses: coursesWithCode, name: group.name });
            }
        });

        // Push both groups and individual courses into the subjects array
        subjects.push(...courseGroups.flatMap(group => group.courses));
    }

    direction.studyWaypoints.forEach((waypoint) => {
        if (waypoint) {
            subjects.push(...getSubjectsFromWaypoint(waypoint));
        }
    });

    return subjects;
};


// Function to get all subjects from StudyWayPoint
const getSubjectsFromWaypoint = (waypoint: StudyWayPoint): ChosenSubjectsData[] => {
    const subjects: ChosenSubjectsData[] = [];

    waypoint.studyDirections.forEach((direction) => {
        const waypointName = `${direction.name}`; // Combine direction name and waypoint name
        const subjectsFromDirection = getSubjectsFromDirection(direction);

        // Add the waypoint information to each course
        const subjectsWithWaypointInfo = subjectsFromDirection.map(course => ({
            ...course,
        }));

        // Add the subjects to a group with the waypoint name
        const groupedSubjects: ChosenSubjectsData | null = subjectsWithWaypointInfo.length !== 0 ? {
            code: direction.code,
            courses: [...subjectsWithWaypointInfo], // Create a new array for each direction
            name: waypointName,
        } : null;

        // Push groupedSubjects into subjects after casting it to Course
        if (groupedSubjects) { subjects.push(groupedSubjects) };
    });

    return subjects;
};

// Function to get all subjects from StudyPeriod
const getSubjectsFromPeriod = (period: StudyPeriod | undefined): ChosenSubjectsData[] => {
    if (!period) {
        return [];
    }
    return getSubjectsFromDirection(period.direction);
};

// Function to get all subjects from JsonData for a specific semester
const getAllSubjects = (jsonData: StudyPlan, semester: number): SubjectStructure => {
    const subjectsData: SubjectStructure = [];

    // Check if the specified semester is within the available study periods
    const period = jsonData.studyplan?.studyPeriods[semester];
    if (period) {
        subjectsData.push(...getSubjectsFromPeriod(period));
    }

    return subjectsData;
};

const CourseLogic: React.FC<CourseLogicProps> = ({ year, programCode, season, onSubjectsStructureChange }) => {
  const semester = season === 'Autumn' ? year * 2 - 2 : year * 2 - 1;
  const autumnSeason = isAutumnSeason();
  const studyYear = autumnSeason ? getCurrentYear() - year + 1 : getCurrentYear() - year;

  const query = api.studyPlan.getStudyPlan.useQuery({
    studyProgCode: programCode,
    year: studyYear,
  });

  const { data: studyPlan } = query;

  // Move the refetch logic directly into the useEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        await query.refetch();

        // Handle the response if needed
        if (studyPlan) {
          // Fetch additional data or update state if necessary
          // Example: setSemesterPlans(response);
          const subjectStructure = getAllSubjects(studyPlan.studyPlanData, semester);
          onSubjectsStructureChange(subjectStructure);
        }
      } catch (error) {
        console.error('Error refetching study plan:', error);
      }
    };

    void fetchData(); // Invoke the fetchData function within useEffect
  }, [query.refetch, studyPlan, semester, onSubjectsStructureChange]);

  return null;
};

export default CourseLogic;