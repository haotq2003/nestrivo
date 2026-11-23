import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token automatically
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("nestrivo_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Centralized error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Đã xảy ra lỗi";

      // 401 Unauthorized: Session expired
      if (status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("nestrivo_token");
        localStorage.removeItem("nestrivo_user");
        window.dispatchEvent(new Event("nestrivo_auth_change"));
      }

      console.error(`[API Error ${status}]:`, message);
    } else if (error.request) {
      console.error("[API Network Error]: Không thể kết nối tới server");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
