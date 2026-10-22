import apiClient from '@/Axios/axiosConfig';

export interface Program {
    id: number;
    departmentId: number;
    code: string;
    name: string;
    shortName: string;
}

export interface Department {
    id: number;
    code: string;
    name: string;
}

interface ProgramsResponse {
    success: boolean;
    message: string;
    department: Department;
    data: Program[];
}

export const getPrograms = async (
    departmentId: number
): Promise<{ department: Department; programs: Program[] }> => {
    const { data } = await apiClient.get<ProgramsResponse>(
        `v1/departments/${departmentId}/programs`
    );
    return {
        department: data.department,
        programs: data.data ?? [],
    };
};

// ─── Course Versions ────────────────────────────────────────────

export interface CourseVersion {
    id: number;
    versionname: string;
    department: string;
    department_fullname: string;
    program: string;
    degreefullname: string;
    program_admitcard: string;
}

interface CourseVersionsResponse {
    messageCode: number;
    message: string;
    data: CourseVersion[];
}

export const getCourseVersions = async (
    programId: number
): Promise<CourseVersion[]> => {
    const { data } = await apiClient.get<CourseVersionsResponse>(
        `Course/get_programwise_course_version?program_id=${programId}`
    );
    return data.data ?? [];
};