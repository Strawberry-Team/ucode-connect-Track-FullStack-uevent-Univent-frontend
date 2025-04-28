export interface AuthResponse {
    accessToken: string;
    refreshToken?: string;
} 

export interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export interface LoginFormProps {
    setIsForgotPassword: (value: boolean) => void;
    email: string;
    password: string;
    setEmail: (value: string) => void;
    setPassword: (value: string) => void;
    showPassword: boolean;
    togglePasswordVisibility: () => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export interface RegisterFormProps {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    setFirstName: (value: string) => void;
    setLastName: (value: string) => void;
    setEmail: (value: string) => void;
    setPassword: (value: string) => void;
    showPassword: boolean;
    togglePasswordVisibility: () => void;
    handleRegister: (e: React.FormEvent) => Promise<void>;
}

export interface ResetPasswordFormProps {
    setIsForgotPassword: (value: boolean) => void;
    setResetEmail: (value: string) => void;
    handleResetPassword: (e: React.FormEvent) => Promise<void>;
    resetEmail: string;
}