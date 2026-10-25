import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { clearTokens, getTokens, saveTokens } from '@/Utils/tokenStorage';

const apiUrl = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedRequestsQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedRequestsQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedRequestsQueue = [];
};

// Request interceptor to include token
apiClient.interceptors.request.use(
  (config) => {
    const { token } = getTokens();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    // Network error / no config: nothing to retry
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Don't handle 401 for login requests
    if (originalRequest.url?.includes('/Auth/login')) {
      return Promise.reject(error);
    }

    const { refreshToken } = getTokens();

    if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call your refresh token endpoint
        const response = await axios.post(`${apiUrl}/Auth/refresh`, {
          refresh_token: refreshToken,
          device: 'Application',
        });
        const { token: newToken, refresh_token: newRefreshToken } = response.data;
        saveTokens(newToken, newRefreshToken);

        // Update the original request header
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Process queued requests
        processQueue(null, newToken);

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh token failed - clear tokens but don't redirect automatically
        processQueue(refreshError, null);
        clearTokens();
        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For other 401 errors, clear tokens but don't redirect automatically
    if (error.response?.status === 401) {
      clearTokens();
      // Let the component handle redirect / toast
    }

    return Promise.reject(error);
  }
);

export default apiClient;
