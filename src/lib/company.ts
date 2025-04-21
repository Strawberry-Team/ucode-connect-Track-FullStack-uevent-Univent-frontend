import api from "@/lib/api";
import { executeApiRequest } from "@/utils/api-request";
import { Company, CompanyNews, Event, ApiResponse } from "@/types";

export async function createCompany(data: { email: string; title: string; description: string; ownerId: number }): Promise<ApiResponse<Company>> {
    return executeApiRequest(() => api.post("/companies", data), "Failed to create company");
}

export async function updateCompany(companyId: number, data: { title: string; description: string }): Promise<ApiResponse<Company>> {
    return executeApiRequest(() => api.patch(`/companies/${companyId}`, data), `Failed to update company with ID ${companyId}`);
}

export async function deleteCompany(companyId: number): Promise<ApiResponse<void>> {
    return executeApiRequest(() => api.delete(`/companies/${companyId}`), `Failed to delete company with ID ${companyId}`);
}

export async function uploadCompanyLogo(companyId: number, file: File): Promise<ApiResponse<{ server_filename: string }>> {
    return executeApiRequest(() => {
            const form = new FormData();
            form.append("file", file);
            return api.post(`/companies/${companyId}/upload-logo`, form, {
                headers: { "Content-Type": "multipart/form-data" }});
            }, "Failed to upload company logo"
    );
}

export async function getCompanyById(id: number): Promise<ApiResponse<Company>> {
    return executeApiRequest(() => api.get(`/companies/${id}`), `Failed to fetch company with ID ${id}`);
}

export async function getCompanyNewsById(id: number): Promise<ApiResponse<CompanyNews[]>> {
    return executeApiRequest(() => api.get(`/companies/${id}/news`), `Failed to fetch news for company with ID ${id}`);
}

export async function getCompanyEvents(companyId: number): Promise<ApiResponse<Event[]>> {
    return executeApiRequest(() => api.get(`/companies/${companyId}/events`), `Failed to fetch events for company with ID ${companyId}`);
}

export async function createCompanyNews(companyId: number, data: { title: string; description: string }): Promise<ApiResponse<CompanyNews>> {
    return executeApiRequest(() => api.post(`/companies/${companyId}/news`, data), `Failed to create news for company with ID ${companyId}`);
}