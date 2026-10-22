import apiClient from '@/Axios/axiosConfig';

export interface CourseType {
    id: number;
    name: string;
}

export interface MDRule {
    id: number;
    rulename: string;
}

export interface MDRuleDetail {
    id: number;
    tbl_sessioncourse_column: string;
    display_name: string;
    max_mark: number;
    inRetake: string;
    allowA: number;
    allowEXP: number;
    failifa: number;
    failifexp: number;
    ordering: number;
}

interface CourseTypeResponse {
    success: boolean;
    message: string;
    data: CourseType[];
}

interface MDRuleListResponse {
    messageCode: number;
    message: string;
    data: MDRule[];
}

interface MDRuleDetailsResponse {
    messageCode: number;
    message: string;
    data: MDRuleDetail[];
}

export const getCourseTypes = async (): Promise<CourseType[]> => {
    const { data } = await apiClient.get<CourseTypeResponse>(
        'CourseManagement/get_course_types'
    );
    return data.data ?? [];
};

export const getMDRules = async (
    departmentId: number,
    courseTypeId: number
): Promise<MDRule[]> => {
    const { data } = await apiClient.get<MDRuleListResponse>(
        `CourseManagement/mdr_list?department_id=${departmentId}&coursetype_id=${courseTypeId}`
    );
    return data.data ?? [];
};

export const getMDRuleDetails = async (
    ruleId: number,
    departmentId: number
): Promise<MDRuleDetail[]> => {
    const { data } = await apiClient.get<MDRuleDetailsResponse>(
        `CourseManagement/mdr_details?rule_id=${ruleId}&department_id=${departmentId}`
    );
    return data.data ?? [];
};