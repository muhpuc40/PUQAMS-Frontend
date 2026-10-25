import apiClient from '@/Axios/axiosConfig';

export type SessionStatus = 'All' | 'Running' | 'Completed';

export interface Session {
    id: number;
    sessionname: string;
    startdate: string;
    enddate: string;
    isenrollmentopen: number;
    isenrollmentopen_stu: number;
    examname: string;
    exam_held_in: string;
    isroutinepublished: number;
    status: string;
    iscredit_transfer: string | number;
}

interface SessionResponse {
    messageCode: number;
    message: string;
    data: Session[];
}

export const getSessions = async (
    programId: number,
    status: SessionStatus = 'All'
): Promise<Session[]> => {
    const { data } = await apiClient.get<SessionResponse>(
        `Session/get_session?program_id=${programId}&status=${status}`
    );
    return data.data ?? [];
};