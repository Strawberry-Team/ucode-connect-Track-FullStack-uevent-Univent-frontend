import axios from "axios";
import { AxiosRequestConfig } from "axios";
import { isClientSideRendering } from "./constants";

export async function fetchCsrfToken(): Promise<string> {
    // Only fetch CSRF tokens in browser environment
    if (!isClientSideRendering) {
        throw new Error("CSRF tokens are only required in browser environment");
    }

    try {
        console.log('[CSRF] Fetching CSRF token from /api/auth/csrf-token...');
        // Use relative URL for client-side requests (goes through rewrites)
        const response = await axios.get("/api/auth/csrf-token", { withCredentials: true });
        console.log('[CSRF] Response received:', response.status);
        
        let csrfToken = response.data.csrfToken || response.headers["x-csrf-token"];
        console.log('[CSRF] Token from response data/headers:', csrfToken ? 'found' : 'not found');

        const setCookieHeader = response.headers["set-cookie"];
        if (setCookieHeader) {
            console.log('[CSRF] Set-Cookie headers found:', setCookieHeader.length);
            const csrfCookie = setCookieHeader.find((cookie: string) =>
                cookie.toLowerCase().startsWith("x-csrf-token=")
            );
            if (csrfCookie) {
                csrfToken = csrfCookie.split(";")[0].split("=")[1];
                console.log('[CSRF] Token extracted from cookie');
            }
        }

        if (!csrfToken) {
            console.error('[CSRF] No CSRF token found in response');
            throw new Error("CSRF token not provided by server");
        }

        console.log('[CSRF] Successfully obtained CSRF token');
        return csrfToken;
    } catch (error) {
        console.error('[CSRF] Error fetching CSRF token:', error);
        throw error;
    }
}
