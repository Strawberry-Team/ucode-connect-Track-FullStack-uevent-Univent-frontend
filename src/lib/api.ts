import axios, { AxiosInstance} from "axios";
import Cookies from "js-cookie";
import { fetchCsrfToken } from "./csrf";

const backendUrl = "http://localhost:8080/api";

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
            config.headers["X-CSRF-Token"] = csrfToken;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 403 && error.response?.data?.message === "Invalid CSRF token") {
            const newCsrfToken = await fetchCsrfToken();
            error.config.headers["X-CSRF-Token"] = newCsrfToken;
            return api.request(error.config);
        }
        return Promise.reject(error);
    }
);

export default api;