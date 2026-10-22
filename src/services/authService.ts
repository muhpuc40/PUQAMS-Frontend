import apiClient from '@/Axios/axiosConfig';
import { saveTokens, saveUser, clearTokens, type StoredUser } from '@/Utils/tokenStorage';

export interface LoginPayload {
    username: string;
    password: string;
    department_id: number;
}

export interface LoginResponse {
    token: string;
    refresh_token: string;
}

export interface AuthUserResponse {
    messageCode: number;
    message: string;
    data: StoredUser;
}

const DEVICE = 'Application';

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
    const body = {
        username: payload.username,
        password: payload.password,
        device: DEVICE,
        department_id: payload.department_id,
    };
    const { data } = await apiClient.post<LoginResponse>('Auth/login', body);
    saveTokens(data.token, data.refresh_token);
    return data;
};

export const getAuth = async (): Promise<StoredUser> => {
    const { data } = await apiClient.get<AuthUserResponse>('Auth/get_auth');
    if (!data?.data) throw new Error(data?.message || 'Failed to load user');
    saveUser(data.data);
    return data.data;
};

export const refresh = async (refreshToken: string) => {
    const { data } = await apiClient.post<LoginResponse>('Auth/refresh', {
        refresh_token: refreshToken,
        device: DEVICE,
    });
    saveTokens(data.token, data.refresh_token);
    return data;
};

export const logout = () => {
    clearTokens();
};