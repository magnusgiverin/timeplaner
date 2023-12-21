export interface StudyPlan {
    studyPlanId: string;
    json_data: string;
}

export interface Subject {
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

export interface StudyDirection {
    code: string;
    courseGroups: CourseGroup[];
    name: string;
}

export interface CourseGroup {
    code: string;
    courses: Subject[];
}