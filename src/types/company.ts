export interface Company {
    id: number;
    ownerId: number;
    email: string;
    title: string;
    description: string;
    createdAt: string;
    logoName: string;
}

export interface CompanyNews {
    id: number;
    authorId: number;
    companyId: number;
    eventId: number | null;
    title: string;
    description: string;
    createdAt: string;
}

export interface CompanySubscription {
    id: number;
    companyId: number;
    createdAt: string;
    company: Company;
} 

export interface ProfileFormProps {
    companyId: number;
};

export interface CompanyInfoCardProps {
    setEditMode: (editMode: boolean) => void;
    editMode: boolean;
    companyId: number;
};

export interface ManageCompanyModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingCompany: Company | null;
}

export interface CompanyNewsNotification {
    type: "companyNews";
    title: string;
    description: string;
    createdAt: string;
}

export interface EventNotification {
    type: "event";
    title: string;
    createdAt: string;
    avatarUrl: string;
}