import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { fetchCsrfToken } from "./csrf";
import { refreshAccessToken } from "./auth";
import { isProduction, isClientSideRendering } from "./constants";

// Configure different URLs for server and client
const getApiUrl = () => {
    if (isProduction) {
        // In production, server components use direct backend URL
        // Client components use relative URLs (which go through rewrites)
        return isClientSideRendering ? '/api' : 'https://univent-platform.onrender.com/api';
    } else {
        // In development, both use the backend URL
        return `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`;
    }
};

const api: AxiosInstance = axios.create({
    baseURL: getApiUrl(),
    withCredentials: isClientSideRendering, // Only set withCredentials in browser
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    async (config) => {
        // Only handle CSRF tokens in browser environment
        if (isClientSideRendering) {
            console.log(`[API] Making ${config.method?.toUpperCase()} request to:`, (config.baseURL || '') + (config.url || ''));
            
            const requiresCsrf = ["POST", "PATCH", "DELETE", "PUT"].includes(
                config.method?.toUpperCase() || ""
            );
            if (requiresCsrf) {
                console.log('[API] CSRF token required for this request');
                let csrfToken = Cookies.get("X-CSRF-TOKEN");
                console.log('[API] Existing CSRF token from cookies:', csrfToken ? 'found' : 'not found');
                
                if (!csrfToken) {
                    console.log('[API] Fetching new CSRF token...');
                    csrfToken = await fetchCsrfToken();
                    console.log('[API] New CSRF token fetched:', csrfToken ? 'success' : 'failed');
                }
                config.headers = config.headers || {};
                config.headers["X-CSRF-TOKEN"] = csrfToken;
                console.log('[API] CSRF token set in headers');
            }

            const accessToken = Cookies.get("accessToken");
            if (accessToken) {
                config.headers = config.headers || {};
                config.headers["Authorization"] = `Bearer ${accessToken}`;
                console.log('[API] Authorization token set');
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<{ message?: string | string[] }>) => {
        // Only handle auth errors in browser environment
        if (!isClientSideRendering) {
            return Promise.reject(error);
        }

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