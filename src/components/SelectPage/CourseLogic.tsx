import { CourseInStudyPlan, CourseGroup, JsonData, StudyDirection, StudyPeriod, StudyWayPoint } from "~/interfaces/StudyPlanData";
import BackButton from "../General/BackButton";
import { StudyPlan } from "@prisma/client";
import { api } from "~/utils/api";
import { useEffect, useState } from "react";

interface CourseLogicProps {
    year: number;
    programCode: string;
    season: string;
    onSubjectsStructureChange: (subjectsStructure: any) => void;
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

    const studyPlanJson: JsonData = studyPlan ? JSON.parse(studyPlan?.json_data) : null

    return {
        studyPlanJson,
        isStudyPlanLoading,
        refetchStudyPlan,
    };
}

// Function to get all subjects from StudyDirection
const getSubjectsFromDirection = (direction: StudyDirection): CourseInStudyPlan[] => {
    const subjects: CourseInStudyPlan[] = [];
    const courseGroups: CourseGroup[] = [];

    if (direction.courseGroups) {
        direction.courseGroups.forEach((group) => {
            const coursesWithCode = group.courses.map(course => ({
                courseGroupName: group.name,
                ...course,
            }));

            if (coursesWithCode.length > 0) { // Add CourseGroup only if courses is not empty
                courseGroups.push({ code: group.code, courses: coursesWithCode, name: group.name });
            }
        });

        courseGroups.forEach(group => {
            subjects.push(...group.courses);
        });
    }

    direction.studyWaypoints.forEach((waypoint) => {
        if (waypoint) {
            subjects.push(...getSubjectsFromWaypoint(waypoint)); // Pass direction name
        }
    });

    return subjects;
};

// Function to get all subjects from StudyWayPoint
const getSubjectsFromWaypoint = (waypoint: StudyWayPoint): CourseInStudyPlan[] => {
    const subjects: CourseInStudyPlan[] = [];

    waypoint.studyDirections.forEach((direction) => {
        const waypointName = `${direction.name}`; // Combine direction name and waypoint name
        const subjectsFromDirection = getSubjectsFromDirection(direction);

        // Add the waypoint information to each course
        const subjectsWithWaypointInfo = subjectsFromDirection.map(course => ({
            ...course,
        }));

        // Add the subjects to a group with the waypoint name
        const groupedSubjects: CourseGroup | null =  subjectsWithWaypointInfo.length !== 0 ? 
        {
            code: direction.code,
            courses: [...subjectsWithWaypointInfo], // Create a new array for each direction
            name: waypointName,
        } : null;

        // Push groupedSubjects into subjects after casting it to Course
        if(groupedSubjects) {subjects.push(groupedSubjects as unknown as CourseInStudyPlan)};
    });

    return subjects;
};

// Function to get all subjects from StudyPeriod
const getSubjectsFromPeriod = (period: StudyPeriod | undefined): CourseInStudyPlan[] => {
    if (!period) {
        return [];
    }
    return getSubjectsFromDirection(period.direction);
};

// Function to get all subjects from JsonData for a specific semester
const getAllSubjects = (jsonData: JsonData, semester: number): any => {
    const subjectsData: any = [];

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
                                isMounted && refetchStudyPlan();
                            },
                        }
                    );
                } catch (error) {
                    console.error('Error invoking addStudyPlan mutation:', error);
                }
            }

        };
    
        fetchData();
        
        return () => {
            isMounted = false;
        };
    }, [year, season, isStudyPlanLoading, studyPlanJson, refetchStudyPlan]);
    
    if (studyPlanJson !== null) {
        const subjectsStructure = getAllSubjects(studyPlanJson, semester);
        // Invoke the callback to send subjectsStructure back to the caller
        onSubjectsStructureChange(subjectsStructure)
    }

    return null;
}

export default CourseLogic;