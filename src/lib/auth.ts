import api from "@/lib/api";
import Cookies from "js-cookie";
import {executeApiRequest} from "@/utils/api-request";
import {ApiResponse} from "@/types/common";
import {AuthResponse} from "@/types/auth";

export async function login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const result = await executeApiRequest<AuthResponse>(() => api.post("/auth/login", {email, password}), "Login failed");
    if (result.success && result.data) {
        if (!result.data.accessToken) {
            return {success: false, errors: ["Access token not provided by server"]};
        }
        Cookies.set("accessToken", result.data.accessToken, {sameSite: "strict"});
        Cookies.set("refreshToken", result.data.refreshToken || "", {sameSite: "strict"});
    }
    return result;
}

export async function register(firstName: string, lastName: string, email: string, password: string): Promise<ApiResponse<void>> {
    return executeApiRequest(() => api.post("/auth/register", {firstName, lastName, email, password}), "Registration failed");
}

export async function confirmEmail(confirmToken: string): Promise<ApiResponse<void>> {
    return executeApiRequest(() => api.post(`/auth/confirm-email/${confirmToken}`), "Email confirmation failed");
}

export async function resetPassword(email: string): Promise<ApiResponse<void>> {
    return executeApiRequest(() => api.post("/auth/reset-password", {email}), "Failed to send password reset link");
}

export async function changePassword(confirmToken: string, newPassword: string): Promise<ApiResponse<void>> {
    return executeApiRequest(() => api.post(`/auth/reset-password/${confirmToken}`, {newPassword}), "Failed to change password");
}

export async function logout(): Promise<ApiResponse<void>> {
    const refreshToken = Cookies.get("refreshToken");
    const result = await executeApiRequest<void>(() => api.post("/auth/logout", { refreshToken }), "Logout failed");
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    return result;
}

export async function refreshAccessToken(): Promise<ApiResponse<AuthResponse>> {
    const refreshToken = Cookies.get("refreshToken");
    if (!refreshToken) {
        return {success: false, errors: ["No refresh token available"]};
    }
    const result = await executeApiRequest<AuthResponse>(() => api.post("/auth/access-token/refresh", {refreshToken}), "Failed to refresh access token");
    if (result.success && result.data) {
        if (!result.data.accessToken) {
            return {success: false, errors: ["Access token not provided by server"]};
        }
        Cookies.set("accessToken", result.data.accessToken, {sameSite: "strict"});
        if (result.data.refreshToken) {
            Cookies.set("refreshToken", result.data.refreshToken, {sameSite: "strict"});
        }
    }
    return result;
}
