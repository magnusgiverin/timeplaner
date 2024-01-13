interface Semester {
    id: string;
    publish_timetable: boolean;
    href: string;
}

export interface Room {
    id: string;
    roomid: string;
    roomurl: string;
    campusid: string;
    roomname: string;
    videolink: boolean;
    buildingid: string;
    buildingurl: string;
    roomacronym: string;
    buildingname: string;
    showforstudent: boolean;
    buildingacronym: string;
    equipment_function: null;
}

export interface Event {
    semesterid: string;
    courseid: string;
    courseversion: string;
    actid: string;
    id: string;
    weeknr: number;
    dtstart: string;
    dtend: string;
    lopenr: number;
    'teaching-method': string;
    'teaching-method-name': string;
    'teaching-title': string;
    summary: string;
    status_plenary: boolean;
    studentgroups: string[];
    room?: Room[];
    terminnr: number;
    aid: string;
    active: boolean;
    compulsory: boolean;
    coursetype: string;
    editurl: string;
    curr: null;
    status: string;
    weekday: number;
    eventid: string;
    multiday: boolean;
    staffNames?: string[];
    staffs?: Staff[];
}

interface Staff {
    firstname: string;
    id: string;
    lastname: string;
    shortname: string;
    url: string;
}

interface TimetableData {
    name: string;
    version: string;
    courseid: string;
    coursename: string;
    title: string;
    'interval-start': null;
    'interval-end': null;
    semester: string;
    semesters: Semester[];
    typename: string;
    'detail-type': string;
    lastchanged: string;
    timestamp: string;
    recording_folder: null;
    events: Event[];
}

export type SemesterPlan = TimetableData;

export interface MazemapResponse {
    result: Result[]
}

interface Result {
    bldId: number;
    buildingId: number;
    buildingName: string | null;
    campusId: number;
    campusName: string;
    deleted: boolean;
    description: string | null;
    dispBldNames: string[];
    dispPoiNames: string[];
    dispTypeNames: string[];
    floorId: number;
    floorName: string | null;
    geometry: {
        type: string;
        coordinates: number[];
    };
    identifier: string;
    identifierId: number | null;
    infoUrl: string | null;
    infoUrlText: string | null;
    kind: string;
    nodeId: number | null;
    peopleCapacity: number | null;
    poiId: number;
    poiNames: string[];
    point: {
        type: string;
        coordinates: number[];
    };
    priorityTypeIds: number[];
    priorityTypeNames: string[];
    score: number;
    solrId: string;
    title: string;
    typeIds: number[];
    typeNames: string[];
    z: number | null;
    zName: string;
    zValue?: number;
}