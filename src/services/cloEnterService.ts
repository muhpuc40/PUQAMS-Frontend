import axios from 'axios';
import apiClient from '@/Axios/axiosConfig';

/* ─── Types ───────────────────────────────────────────────────── */

export interface RunningCourse {
    id: number;
    tbl_session_id: number;
    sessionname: string;
    tbl_programwisedegreename_id: number;
    program: string;
    semester: number;
    tbl_course_id: number;
    coursecode: string;
    coursename: string;
    coursecredit: number;
    coursetype: string;
    sectionname: string;
    tbl_mdrulename_id: number;
    rulename: string;
    size: number;
    tbl_teacher_id: number;
    assessment_count: number;
    question_count: number;
}

export interface SectionClo {
    id: number;
    tbl_sessioncourse_id: number;
    tbl_clo_id: number;
    course_outcome: string;
    description: string;
    plosname: string;
    status: 'Active' | 'Inactive' | string;
    in_use: number;
}

export interface QuestionClo {
    id: number;
    tbl_sessioncourse_clo_id: number;
    clo_id: number;
    course_outcome: string;
    plosname: string;
    clo: string;
    max_marks: number;
}

export interface AssessmentQuestion {
    id: number;
    original_question_no: string;
    ordering: number;
    is_locked: number;
    max_marks: number;
    clos: QuestionClo[];
}

export interface Assessment {
    id: number;
    tbl_mdrdetail_id: number;
    category: string;
    exam: string;
    totalMark: number;
    question_marks: number;
    is_locked: number;
    questions: AssessmentQuestion[];
}

export interface AssessmentCategory {
    id: number;
    tbl_sessioncourse_column: string;
    display_name: string;
    max_mark: number;
    ordering: number;
    exams: Assessment[];
}

export interface SectionAssessments {
    sessioncourse_id: number;
    tbl_mdrulename_id: number;
    rulename: string;
    is_editable: number;
    categories: AssessmentCategory[];
}

export interface QuestionCloInput {
    sessioncourse_clo_id: number;
    marks: number;
}

export interface QuestionInput {
    question_no: string;
    clos: QuestionCloInput[];
}

interface ApiResponse<T> {
    messageCode: number;
    message: string;
    data: T;
}

/** A write result: the refreshed structure plus the server message (may carry a warning). */
export interface StructureResult {
    data: SectionAssessments;
    message: string;
}

/* ─── Error helper ────────────────────────────────────────────── */

// Surface the API's own message ("This question is locked…") instead of
// axios' generic "Request failed with status code 400".
const toError = (err: unknown): Error => {
    if (axios.isAxiosError(err)) {
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

/* ─── My running courses ──────────────────────────────────────── */

export const getMyRunningCourses = (teacherId: number) =>
    run(async () => {
        const { data } = await apiClient.get<ApiResponse<RunningCourse[]>>(
            'CloEnter/my_running_courses',
            { params: { teacher_id: teacherId } }
        );
        return data.data ?? [];
    });

/* ─── Section CLOs ────────────────────────────────────────────── */

export const getSectionClos = (sessionCourseId: number, teacherId: number) =>
    run(async () => {
        const { data } = await apiClient.get<ApiResponse<SectionClo[]>>(
            'CloEnter/get_sessioncoursewise_clos',
            { params: { sessioncourse_id: sessionCourseId, teacher_id: teacherId } }
        );
        return data.data ?? [];
    });

export const syncSectionClos = (sessionCourseId: number, teacherId: number) =>
    run(async () => {
        const { data } = await apiClient.put<ApiResponse<SectionClo[]>>(
            'CloEnter/fetch_clos_to_sessioncourse',
            { sessioncourse_id: sessionCourseId, teacher_id: teacherId }
        );
        return data.data ?? [];
    });

/* ─── Assessments ─────────────────────────────────────────────── */

export const getAssessments = (sessionCourseId: number, teacherId: number) =>
    run(async () => {
        const { data } = await apiClient.get<ApiResponse<SectionAssessments>>(
            'CloEnter/get_assessments',
            { params: { sessioncourse_id: sessionCourseId, teacher_id: teacherId } }
        );
        return data.data;
    });

const structure = (res: ApiResponse<SectionAssessments>): StructureResult => ({
    data: res.data,
    message: res.message,
});

export const createAssessment = (payload: {
    teacher_id: number;
    sessioncourse_id: number;
    mdr_detail_id: number;
    exam_name: string;
    total_mark: number;
    questions: QuestionInput[];
}) =>
    run(async () => {
        const { data } = await apiClient.post<ApiResponse<SectionAssessments>>(
            'CloEnter/create_assessment',
            payload
        );
        return structure(data);
    });

export const updateAssessment = (payload: {
    teacher_id: number;
    assessment_id: number;
    exam_name: string;
    total_mark: number;
}) =>
    run(async () => {
        const { data } = await apiClient.put<ApiResponse<SectionAssessments>>(
            'CloEnter/update_assessment',
            payload
        );
        return structure(data);
    });

export const deleteAssessment = (assessmentId: number, teacherId: number) =>
    run(async () => {
        const { data } = await apiClient.delete<ApiResponse<SectionAssessments>>(
            'CloEnter/delete_assessment',
            { params: { assessment_id: assessmentId, teacher_id: teacherId } }
        );
        return structure(data);
    });

/* ─── Questions ───────────────────────────────────────────────── */

export const addQuestion = (payload: {
    teacher_id: number;
    assessment_id: number;
    question_no: string;
    clos: QuestionCloInput[];
}) =>
    run(async () => {
        const { data } = await apiClient.post<ApiResponse<SectionAssessments>>(
            'CloEnter/add_question',
            payload
        );
        return structure(data);
    });

export const updateQuestion = (payload: {
    teacher_id: number;
    question_id: number;
    question_no: string;
    clos: QuestionCloInput[];
}) =>
    run(async () => {
        const { data } = await apiClient.put<ApiResponse<SectionAssessments>>(
            'CloEnter/update_question',
            payload
        );
        return structure(data);
    });

export const deleteQuestion = (questionId: number, teacherId: number) =>
    run(async () => {
        const { data } = await apiClient.delete<ApiResponse<SectionAssessments>>(
            'CloEnter/delete_question',
            { params: { question_id: questionId, teacher_id: teacherId } }
        );
        return structure(data);
    });
