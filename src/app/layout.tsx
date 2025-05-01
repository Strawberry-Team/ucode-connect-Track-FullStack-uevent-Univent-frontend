import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header/header";
import React from "react";
import ScrollToTopButton from "@/components/ui/scroll-to-top-button";
import { AuthProvider } from "@/context/auth-context";
import { cookies } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import { getUserMe } from "@/lib/users";
import { User } from "@/types/user";


export const metadata: Metadata = {
    title: "Univent",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value || null;
    const isAuthenticated = !!accessToken;

    let initialUser: User | null = null;
    if (accessToken) {
        const userResult = await getUserMe(accessToken);
        if (userResult.success && userResult.data) {
            initialUser = userResult.data;
        }
    }

    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <AuthProvider initialAuthState={isAuthenticated} initialUser={initialUser}>
                    <Header />
                    {children}
                    <ScrollToTopButton />
                    <Toaster />
                </AuthProvider>
            </body>
        </html>
    );
}
