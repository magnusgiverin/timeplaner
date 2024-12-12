export interface StudyPlan {
    publisedYears: number[];
    settings: Settings;
    studyplan: EmbeddedStudyPlan;
    directions: DirectionList[];
}

interface DirectionList {
    code: string;
    directionList: CourseInStudyPlan[];
    name: string;
    period: number;
    studyDirection: string;
    studyDirectionDesignationCode: string;
    studyDirectionDesignationName: string;
}

interface Settings {
    programCode: string;
    year: string;
}

interface EmbeddedStudyPlan {
    code: string;
    name: string;
    startTerm: string;
    studyPeriods: StudyPeriod[];
}

export interface StudyPeriod {
    direction: StudyDirection;
    periodNumber: number;
}

export interface StudyDirection {
    code: string;
    courseGroups: CourseGroup[] | null;
    name: string;
    studyWaypoints: StudyWayPoint[]; 
}

export interface CourseInStudyPlan {
    code: string;
    credit: string;
    name: string;
    planelement: string;
    studyChoice: StudyChoice;
}

export interface StudyChoice {
    code: string;
    description: string;
    name: string;
}

export interface CourseGroup {
    code: string;
    courses: CourseInStudyPlan[];
    name: string;
}

export interface CourseCollection {
    code: string;
    courses: CourseInStudyPlan[];
    name: string;
}

export interface StudyWayPoint {
    code: string;
    name: string;
    studyDirections: StudyDirection[];
}

export interface ChosenSubjectsData {
    code: string;
    name: string;
    courses?: Array<DetailedCourse | ChosenSubjectsData>;
}

export interface DetailedCourse {
    code: string;
    credit: string;
    name: string;
    planelement: string;
    studyChoice: StudyChoice;
    courseGroupName: string;
}

export type SubjectStructure = Array<ChosenSubjectsData>
