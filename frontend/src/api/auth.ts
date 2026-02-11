import axios, { AxiosError } from "axios";
import type { AuthResponse, SignInPayload, SignUpPayload } from "@/types/auth";

const BASE_URL = import.meta.env.API_URL ?? "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach token to every request if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ↓ ADD: Auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for the refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<{ accessToken: string }>(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        localStorage.setItem("accessToken", data.accessToken);
        processQueue();
        isRefreshing = false;
        
        // Retry original request
        originalRequest.headers!.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;
        
        // Refresh failed, logout user
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/signin";
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper to extract error message
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const msg = error.response?.data?.message;
    if (typeof msg === "string") return msg;
    if (Array.isArray(msg)) return msg[0];
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}

export const authApi = {
  signUp: async (payload: SignUpPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>("/auth/signup", payload);
    return data;
  },

  signIn: async (payload: SignInPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>("/auth/signin", payload);
    return data;
  },

  getProfile: async (): Promise<AuthResponse["user"]> => {
    const { data } = await apiClient.get<AuthResponse["user"]>("/auth/profile");
    return data;
  },

  // refresh method
  refresh: async (): Promise<{ accessToken: string }> => {
    const { data } = await apiClient.post<{ accessToken: string }>("/auth/refresh");
    return data;
  },

  // logout method
  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  // logout all devices
  logoutAll: async (): Promise<void> => {
    await apiClient.post("/auth/logout-all");
  },
};