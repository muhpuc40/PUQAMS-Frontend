import apiClient from '@/Axios/axiosConfig';

export interface SessionCourse {
    id: number;
    tbl_session_id: number;
    sessionname: string;
    tbl_course_id: number;
    coursecode: string;
    coursename: string;
    coursecredit: number;
    coursetype: string;
    ex_semester: number;
    section: string;
    tbl_mdrulename_id: number;
    rulename: string;
    tbl_teacher_id: number;
    teacher_fullname: string;
    teacher_shortname: string;
    teacher_designation: string;
    teacher_department: string;
    size: number;
}

interface SessionCourseListResponse {
    messageCode: number;
    message: string;
    data: SessionCourse[];
}

interface SessionCourseResponse {
    messageCode: number;
    message: string;
    data: SessionCourse | null;
}

export interface SessionCourseFilters {
    courseId?: number;
    teacherId?: number;
}

export const getSessionCourses = async (
    programId: number,
    sessionId: number,
    filters: SessionCourseFilters = {}
): Promise<SessionCourse[]> => {
    const params = new URLSearchParams({
        program_id: String(programId),
        session_id: String(sessionId),
    });
    if (filters.courseId) params.set('course_id', String(filters.courseId));
    if (filters.teacherId) params.set('teacher_id', String(filters.teacherId));

    const { data } = await apiClient.get<SessionCourseListResponse>(
        `SessionCourse/get_session_courses?${params.toString()}`
    );
    return data.data ?? [];
};

export const getSessionCourse = async (
    sessionCourseId: number
): Promise<SessionCourse | null> => {
    const { data } = await apiClient.get<SessionCourseResponse>(
        `SessionCourse/get_session_course?sessioncourse_id=${sessionCourseId}`
    );
    return data.data ?? null;
};
