// service/companyService.ts
import { getUserCompany, Company } from "@/lib/user";
import { createCompany, updateCompany, uploadCompanyLogo, deleteCompany } from "@/lib/company";

// Тип для ошибок
interface ServiceError {
    errors: string[];
}

export const companyService = {
    fetchCompanies: async (userId: number): Promise<Company[]> => {
        const result = await getUserCompany(userId);
        console.log("dsads")
        if (result.data !== undefined && result.data !== null) {
            return result.data;
        }
        return [];
    },

    createCompany: async (
        companyData: { email: string; title: string; description: string; ownerId: number },
        logoFile: File | null
    ): Promise<Company> => {
        const createResult = await createCompany(companyData);
        if (!createResult.success || !createResult.data) {
            throw { errors: createResult.errors } as ServiceError;
        }
        let newCompany = createResult.data;

        if (logoFile) {
            const uploadResult = await uploadCompanyLogo(newCompany.id, logoFile);
            if (!uploadResult.success || !uploadResult.data) {
                throw { errors: uploadResult.errors } as ServiceError;
            }
            newCompany.logoName = uploadResult.data.server_filename;
        }

        return newCompany;
    },

    updateCompany: async (
        companyId: number,
        companyData: { title: string; description: string },
        logoFile: File | null
    ): Promise<Company> => {
        const updateResult = await updateCompany(companyId, companyData);
        if (!updateResult.success || !updateResult.data) {
            throw { errors: updateResult.errors } as ServiceError;
        }
        let updatedCompany = updateResult.data;

        if (logoFile) {
            const uploadResult = await uploadCompanyLogo(updatedCompany.id, logoFile);
            if (!uploadResult.success || !uploadResult.data) {
                throw { errors: uploadResult.errors } as ServiceError;
            }
            updatedCompany.logoName = uploadResult.data.server_filename;
        }

        return updatedCompany;
    },

    deleteCompany: async (companyId: number): Promise<void> => {
        const result = await deleteCompany(companyId);
        if (!result.success) {
            throw { errors: result.errors } as ServiceError;
        }
    },
};