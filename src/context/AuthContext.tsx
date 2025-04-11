"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import {getUserMe, User} from "@/lib/user";

interface AuthContextType {
    isAuthenticated: boolean;
    setAuthenticated: (value: boolean) => void;
    user: User | null;
    setUser: (user: User | null) => void;
    checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
                                 children,
                                 initialAuthState,
                             }: {
    children: ReactNode;
    initialAuthState?: boolean;
}) {
    const [isAuthenticated, setAuthenticated] = useState(() => {
        if (typeof initialAuthState !== "undefined") return initialAuthState;
        const accessToken = Cookies.get("accessToken");
        return !!accessToken;
    });

    const [user, setUser] = useState<User | null>(null);

    const checkAuth = async () => {
        const accessToken = Cookies.get("accessToken");
        const isAuth = !!accessToken;
        setAuthenticated(isAuth);

        if (isAuth) {
            // Если пользователь авторизован, запрашиваем его данные
            const result = await getUserMe();
            if (result.success && result.data) {
                setUser(result.data);
            } else {
                // Если не удалось получить данные, сбрасываем авторизацию
                setAuthenticated(false);
                setUser(null);
            }
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, setAuthenticated, user, setUser, checkAuth }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}