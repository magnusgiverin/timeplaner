import type { CourseGroup, JsonData, StudyDirection, StudyPeriod, StudyWayPoint, SubjectStructure, ChosenSubjectsData, StudyPlan } from "~/interfaces/StudyPlanData";
import { api } from "~/utils/api";
import { useEffect } from "react";

interface CourseLogicProps {
    year: number;
    programCode: string;
    season: string;
    onSubjectsStructureChange: (subjectStructure: SubjectStructure) => void;
}

const isAutumnSeason = () => {
    const currentMonth = new Date().getMonth() + 1;
    const autumnStartMonth = 9; // September
    return currentMonth >= autumnStartMonth;
};

const getCurrentYear = () => new Date().getFullYear();

const getStudyPlanJson = (year: number, programCode: string) => {
    const autumnSeason = isAutumnSeason();
    const studyYear = autumnSeason ? getCurrentYear() - year + 1 : getCurrentYear() - year;
    const studyPlanId = `${programCode}-${studyYear}-${getCurrentYear()}`;

    // Assuming api.studyPlan.getStudyPlanById.useQuery returns an object with data property
    const { data: studyPlan, isLoading: isStudyPlanLoading, refetch: refetchStudyPlan } =
        api.studyPlan.getStudyPlanById.useQuery<StudyPlan>(String(studyPlanId));

    const studyPlanJson: JsonData | null = studyPlan ? (JSON.parse(studyPlan?.json_data) as JsonData) : null;

    return {
        studyPlanJson,
        isStudyPlanLoading,
        refetchStudyPlan,
    };
}

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
const getAllSubjects = (jsonData: JsonData, semester: number): SubjectStructure => {
    const subjectsData: SubjectStructure = [];

    // Check if the specified semester is within the available study periods
    const period = jsonData.studyplan?.studyPeriods[semester];
    if (period) {
        subjectsData.push(...getSubjectsFromPeriod(period));
    }

    return subjectsData;
};


const CourseLogic: React.FC<CourseLogicProps> = ({ year, programCode, season, onSubjectsStructureChange }) => {
    const studyPlanQuery = getStudyPlanJson(year, programCode);
    const { studyPlanJson, isStudyPlanLoading, refetchStudyPlan } = studyPlanQuery;
    const semester = season === 'Autumn' ? year * 2 - 2 : year * 2 - 1;

    const mutation = api.studyPlan.addStudyPlan.useMutation();
    const studyYear = isAutumnSeason() ? getCurrentYear() - year + 1 : getCurrentYear() - year;

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            if ((!studyPlanJson || Object.keys(studyPlanJson).length === 0) && !isStudyPlanLoading && isMounted && !mutation.isLoading) {
                try {
                    await mutation.mutateAsync(
                        {
                            studyProgCode: programCode,
                            year: studyYear,
                        },
                        {
                            onSuccess: () => {
                                void ((isMounted && refetchStudyPlan()));
                            },
                        }
                    );
                } catch (error) {
                    console.error('Error invoking addStudyPlan mutation:', error);
                }
            }

        };

        void fetchData();

        return () => {
            isMounted = false;
        };
    }, [year, season, isStudyPlanLoading, studyPlanJson, refetchStudyPlan]);

    if (studyPlanJson !== null) {
        const subjectStructure = getAllSubjects(studyPlanJson, semester);
        // Invoke the callback to send subjectsStructure back to the caller
        onSubjectsStructureChange(subjectStructure)
    }

    return null;
}

export default CourseLogic;

// Subjectstructure is an array of either groups or courses, groups contain either groups or courses - defined previously?