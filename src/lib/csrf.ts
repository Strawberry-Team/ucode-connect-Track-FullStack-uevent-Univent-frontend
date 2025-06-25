import api from "./api";
import { AxiosRequestConfig } from "axios";

export async function fetchCsrfToken(): Promise<string> {
    // Only fetch CSRF tokens in browser environment
    if (typeof window === 'undefined') {
        throw new Error("CSRF tokens are only required in browser environment");
    }

    try {
        const response = await api.get("/auth/csrf-token", { withCredentials: true });
        let csrfToken = response.data.csrfToken || response.headers["x-csrf-token"];

        const setCookieHeader = response.headers["set-cookie"];
        if (setCookieHeader) {
            const csrfCookie = setCookieHeader.find((cookie: string) =>
                cookie.toLowerCase().startsWith("x-csrf-token=")
            );
            if (csrfCookie) {
                csrfToken = csrfCookie.split(";")[0].split("=")[1];
            }
        }

        if (!csrfToken) {
            throw new Error("CSRF token not provided by server");
        }

        return csrfToken;
    } catch (error) {
        throw error;
    }
}
