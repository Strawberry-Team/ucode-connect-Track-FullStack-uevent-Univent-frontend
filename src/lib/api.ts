import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { fetchCsrfToken } from "./csrf";
import { refreshAccessToken } from "./auth";

// Define the environment
const isProduction = process.env.NODE_ENV === 'production';

// Configure the API URL based on the environment
const backendUrl = isProduction 
  ? '/api' // For production, use relative path
  : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`; // For development

const api: AxiosInstance = axios.create({
    baseURL: backendUrl,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    async (config) => {
        const requiresCsrf = ["POST", "PATCH", "DELETE", "PUT"].includes(
            config.method?.toUpperCase() || ""
        );
        if (requiresCsrf) {
            let csrfToken = Cookies.get("X-CSRF-TOKEN");
            if (!csrfToken) {
                csrfToken = await fetchCsrfToken();
            }
            config.headers = config.headers || {};
            config.headers["X-CSRF-TOKEN"] = csrfToken;
        }

        const accessToken = Cookies.get("accessToken");
        if (accessToken) {
            config.headers = config.headers || {};
            config.headers["Authorization"] = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<{ message?: string | string[] }>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Обработка ошибки "Invalid CSRF token" (403)
        if (error.response?.data?.message === "Invalid CSRF token" && error.response?.status === 403) {
            const newCsrfToken = await fetchCsrfToken();
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers["X-CSRF-TOKEN"] = newCsrfToken;
            return api.request(originalRequest);
        }

        // Обработка ошибки 401 (истекший accessToken)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshResult = await refreshAccessToken();
                if (refreshResult.success) {
                    const newAccessToken = Cookies.get("accessToken");
                    if (newAccessToken) {
                        originalRequest.headers = originalRequest.headers || {};
                        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                    }
                    return api.request(originalRequest);
                } else {
                    Cookies.remove("accessToken");
                    Cookies.remove("refreshToken");
                    return Promise.reject(new Error("Failed to refresh access token"));
                }
            } catch (refreshError) {
                Cookies.remove("accessToken");
                Cookies.remove("refreshToken");
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;