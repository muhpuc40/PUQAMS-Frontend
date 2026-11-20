import axios from 'axios';
import apiClient from '@/Axios/axiosConfig';

/* ─── Types ───────────────────────────────────────────────────── */

export type ExamType = 'Mid_Term' | 'Final';

export const EXAM_TYPES: { value: ExamType; label: string }[] = [
    { value: 'Mid_Term', label: 'Mid Term' },
    { value: 'Final', label: 'Final' },
];

export interface ExamSetting {
    id: number;
    tbl_programwisedegreename_id: number;
    program: string;
    sessionname: string;
    examname: string;
    exam_held_in: string;
    isroutinepublished: number;
    startdate: string;
    enddate: string;
    status: string;
}

export interface ExamRoutine {
    id: number;
    tbl_session_id: number;
    sessionname: string;
    department: string;
    exam_type: ExamType;
    exam_type_name: string;
    aexamdate: string;
    exam_date: string;
    texamdate: string;
    examDayName: string;
    start_time: string;
    end_time: string;
    examtime: string;
    tbl_course_id: number;
    coursecode: string;
    coursename: string;
    coursecredit: number;
    coursetype: string;
    semester: number;
    noofsection: number;
    noofstudent: number;
}

export interface ExamAvailableCourse {
    id: number;
    coursecode: string;
    coursename: string;
    coursecredit: number;
    coursetype: string;
    semester: number;
    noofsection: number;
    noofstudent: number;
}

export type CommitteeRole = 'Chairman' | 'Member';

export interface ExamCommitteeMember {
    id: number;
    tbl_teacher_id: number;
    fullname: string;
    shortname: string;
    designation: string;
    department: string;
    role: CommitteeRole;
}

export interface ExamCommittee {
    id: number; // 0 = not created yet
    tbl_session_id: number;
    semester: number;
    course_count: number;
    chairpersons: string;
    member_names: string;
    members: ExamCommitteeMember[];
}

export interface MyExamCommittee {
    id: number;
    tbl_session_id: number;
    sessionname: string;
    examname: string;
    exam_held_in: string;
    tbl_programwisedegreename_id: number;
    program: string;
    department: string;
    semester: number;
    role: CommitteeRole;
    course_count: number;
    chairpersons: string;
    member_count: number;
}

export interface TeacherOption {
    id: number;
    fullname: string;
    username: string;
    shortname: string;
    designation: string;
    tbl_department_id: number;
    department: string;
}

interface ApiResponse<T> {
    messageCode: number;
    message: string;
    data: T;
}

/** Write result: refreshed data plus the server message. */
export interface Result<T> {
    data: T;
    message: string;
}

/* ─── Error helper ────────────────────────────────────────────── */

const toError = (err: unknown): Error => {
    if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
            return new Error('Only Administrators can set up exams and committees.');
        }
        const apiMessage = (err.response?.data as { message?: string } | undefined)?.message;
        return new Error(apiMessage || err.message);
    }
    return err instanceof Error ? err : new Error('Request failed');
};

const run = async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
        return await fn();
    } catch (err) {
        throw toError(err);
    }
};

const result = <T>(res: ApiResponse<T>): Result<T> => ({ data: res.data, message: res.message });

/* ─── Exam settings ───────────────────────────────────────────── */

export const getExamSetting = (programId: number, sessionId: number) =>
    run(async () => {
        const { data } = await apiClient.get<ApiResponse<ExamSetting>>('Exam/get_exam_setting', {
            params: { program_id: programId, session_id: sessionId },
        });
        return data.data;
    });

export const updateExamGeneralSetting = (payload: {
    program_id: number;
    session_id: number;
    examName: string;
    exam_held_in: string;
    isroutinepublished: number;
}) =>
    run(async () => {
        const { data } = await apiClient.put<ApiResponse<ExamSetting>>('Exam/exam_general_setting', payload);
        return result(data);
    });

/* ─── Schedule ────────────────────────────────────────────────── */

export const getRoutineCourses = (programId: number, sessionId: number) =>
    run(async () => {
        const { data } = await apiClient.get<ApiResponse<ExamRoutine[]>>('Exam/get_routine_courses', {
            params: { program_id: programId, session_id: sessionId },
        });
        return data.data ?? [];
    });

export const getAvailableCourses = (programId: number, sessionId: number, examType: ExamType) =>
    run(async () => {
        const { data } = await apiClient.get<ApiResponse<ExamAvailableCourse[]>>('Exam/available_courses', {
            params: { program_id: programId, session_id: sessionId, exam_type: examType },
        });
        return data.data ?? [];
    });

export const addExamDate = (payload: {
    program_id: number;
    session_id: number;
    course_id: number;
    exam_type: ExamType;
    exam_date: string;
    start_time: string;
    end_time: string;
}) =>
    run(async () => {
        const { data } = await apiClient.post<ApiResponse<ExamRoutine[]>>('Exam/manual_exam_routine', payload);
        return result(data);
    });

export const updateExamDate = (payload: {
    program_id: number;
    id: number;
    exam_date: string;
    start_time: string;
    end_time: string;
}) =>
    run(async () => {
        const { data } = await apiClient.put<ApiResponse<ExamRoutine[]>>('Exam/update_exam_date', payload);
        return result(data);
    });

export const deleteExamDate = (programId: number, id: number) =>
    run(async () => {
        const { data } = await apiClient.delete<ApiResponse<ExamRoutine[]>>('Exam/delete_exam_date', {
            params: { program_id: programId, id },
        });
        return result(data);
    });

/* ─── Committees ──────────────────────────────────────────────── */

export const getTeacherList = (departmentId?: number) =>
    run(async () => {
        const { data } = await apiClient.get<ApiResponse<TeacherOption[]>>('Exam/teacher_list', {
            params: departmentId ? { department_id: departmentId } : undefined,
        });
        return data.data ?? [];
    });

export const getCommittees = (programId: number, sessionId: number) =>
    run(async () => {
        const { data } = await apiClient.get<ApiResponse<ExamCommittee[]>>('Exam/get_committees', {
            params: { program_id: programId, session_id: sessionId },
        });
        return data.data ?? [];
    });

export const createCommittee = (payload: {
    program_id: number;
    session_id: number;
    semester: number;
    members?: { teacher_id: number; role: CommitteeRole }[];
}) =>
    run(async () => {
        const { data } = await apiClient.post<ApiResponse<ExamCommittee[]>>('Exam/create_committee', payload);
        return result(data);
    });

export const deleteCommittee = (programId: number, committeeId: number) =>
    run(async () => {
        const { data } = await apiClient.delete<ApiResponse<ExamCommittee[]>>('Exam/delete_committee', {
            params: { program_id: programId, committee_id: committeeId },
        });
        return result(data);
    });

export const addCommitteeMember = (payload: {
    program_id: number;
    committee_id: number;
    teacher_id: number;
    role: CommitteeRole;
}) =>
    run(async () => {
        const { data } = await apiClient.post<ApiResponse<ExamCommittee[]>>('Exam/add_committee_member', payload);
        return result(data);
    });

export const updateCommitteeMember = (payload: {
    program_id: number;
    member_id: number;
    role: CommitteeRole;
}) =>
    run(async () => {
        const { data } = await apiClient.put<ApiResponse<ExamCommittee[]>>('Exam/update_committee_member', payload);
        return result(data);
    });

export const deleteCommitteeMember = (programId: number, memberId: number) =>
    run(async () => {
        const { data } = await apiClient.delete<ApiResponse<ExamCommittee[]>>('Exam/delete_committee_member', {
            params: { program_id: programId, member_id: memberId },
        });
        return result(data);
    });

export const getMyCommittees = (teacherId: number) =>
    run(async () => {
        const { data } = await apiClient.get<ApiResponse<MyExamCommittee[]>>('Exam/my_committees', {
            params: { teacher_id: teacherId },
        });
        return data.data ?? [];
    });
