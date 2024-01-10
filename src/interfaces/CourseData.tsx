export interface Course {
    courseid: string;
    name: string;
    create_activity_zoom?: boolean | null;
    authorized_netgroups?: string | null;
    nofterms?: number | null;
    terminnr?: number | null;
    fullname: string;
    fullname_en?: string | null;
    fullname_nn?: string | null;
    idtermin?: string | null;
  }