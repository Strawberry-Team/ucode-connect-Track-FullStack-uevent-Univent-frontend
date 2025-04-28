export interface User {
    id: number;
    firstName: string;
    lastName: string | null;
    email: string;
    profilePictureName: string;
    role: string;
    createdAt: string;
}

export interface NavUserProps {
    user: User;
} 