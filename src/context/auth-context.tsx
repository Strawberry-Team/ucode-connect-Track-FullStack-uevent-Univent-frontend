"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import { getUserMe } from "@/lib/user";
import { User } from "@/types";

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
                                 initialAuthState = false,
                                 initialUser = null,
                             }: {
    children: ReactNode;
    initialAuthState?: boolean;
    initialUser?: User | null;
}) {
    const [isAuthenticated, setAuthenticated] = useState(initialAuthState);
    const [user, setUser] = useState<User | null>(initialUser);

    const checkAuth = async () => {
        const accessToken = Cookies.get("accessToken");
        const isAuth = !!accessToken;
        setAuthenticated(isAuth);

        if (isAuth) {
            const result = await getUserMe(accessToken);
            if (result.success && result.data) {
                setUser(result.data);
            } else {
                setAuthenticated(false);
                setUser(null);
            }
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        const accessToken = Cookies.get("accessToken");
        const isAuth = !!accessToken;
        if (isAuth !== isAuthenticated || (isAuth && !user)) {
            checkAuth();
        }
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