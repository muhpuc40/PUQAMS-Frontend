import apiClient from '@/Axios/axiosConfig';

export interface Department {
    id: number;
    code: string;
    name: string;
}

export interface Program {
    id: number;
    code?: string;
    name: string;
    department_id?: number;
}

interface ApiListResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const getDepartments = async (): Promise<Department[]> => {
    const { data } = await apiClient.get<ApiListResponse<Department[]>>(
        'v1/departments'
    );
    return data.data ?? [];
};

export const getPrograms = async (departmentId: number): Promise<Program[]> => {
    const { data } = await apiClient.get<ApiListResponse<Program[]>>(
        `v1/departments/${departmentId}/programs`
    );
    return data.data ?? [];
};

export const getDepartmentTree = async (): Promise<unknown> => {
    const { data } = await apiClient.get<ApiListResponse<unknown>>(
        'v1/departments/tree'
    );
    return data.data;
};