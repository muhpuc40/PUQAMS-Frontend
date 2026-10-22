const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'authUser';

export interface StoredUser {
  id: number;
  fullname: string;
  username: string;
  designation?: string;
  department?: string;
  tbl_department_id?: number;
  hasimage?: number;
  mobile?: string;
  email?: string;
  address?: string;
  gender?: string;
  varsity?: string;
  acctype?: string;
  priority?: number;
  shortname?: string;
  user_role?: string;
}

export const getTokens = () => {
  try {
    return {
      token: localStorage.getItem(TOKEN_KEY),
      refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
    };
  } catch {
    return { token: null, refreshToken: null };
  }
};

export const saveTokens = (token: string, refreshToken?: string) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch { }
};

export const clearTokens = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch { }
};

export const saveUser = (user: StoredUser) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch { }
};

export const getUser = (): StoredUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
};

export const clearUser = () => {
  try {
    localStorage.removeItem(USER_KEY);
  } catch { }
};