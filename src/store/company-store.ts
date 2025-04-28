// store/companyStore.ts
import { create } from "zustand";
import { Company } from "@/lib/users";

type CompanyStore = {
    companies: Company[];
    setCompanies: (companies: Company[]) => void;
    addCompany: (newCompany: Company) => void;
    updateCompany: (updatedCompany: Company) => void;
    deleteCompany: (companyId: number) => void;
    clearCompanies: () => void;
};

export const useCompanyStore = create<CompanyStore>((set) => ({
    companies: [],

    setCompanies: (companies: Company[]) => {
        set({ companies });
    },

    addCompany: (newCompany: Company) => {
        set((state) => ({
            companies: [...state.companies, newCompany],
        }));
    },

    updateCompany: (updatedCompany: Company) => {
        set((state) => ({
            companies: state.companies.map((company) =>
                company.id === updatedCompany.id ? updatedCompany : company
            ),
        }));
    },

    deleteCompany: (companyId: number) => {
        set((state) => ({
            companies: state.companies.filter((company) => company.id !== companyId),
        }));
    },

    clearCompanies: () => {
        set({ companies: [] });
    },
}));