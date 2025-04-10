"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

interface AuthContextType {
    isAuthenticated: boolean;
    setAuthenticated: (value: boolean) => void;
    checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
                                 children,
                                 initialAuthState,
                             }: {
    children: React.ReactNode;
    initialAuthState?: boolean;
}) {
    const [isAuthenticated, setAuthenticated] = useState(() => {
        if (typeof initialAuthState !== "undefined") return initialAuthState;
        const accessToken = Cookies.get("accessToken");
        return !!accessToken;
    });

    const checkAuth = () => {
        const accessToken = Cookies.get("accessToken");
        setAuthenticated(!!accessToken);
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, setAuthenticated, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}