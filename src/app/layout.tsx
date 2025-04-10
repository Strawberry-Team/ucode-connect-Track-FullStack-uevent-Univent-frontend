import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import Header from "@/components/header/Header";
import React from "react";
import ScrollToTopButton from "@/components/ui/scroll-to-top-button";
import {AuthProvider} from "@/context/AuthContext";
import {cookies} from "next/headers";
import {Toaster} from "@/components/ui/sonner";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Calendula",
    description: "Event management platform",
};

export default async function RootLayout({children}: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value || null;
    // const csrfToken = cookieStore.get("X-CSRF-TOKEN")?.value || null;
    const isAuthenticated = !!accessToken;

    // console.log("[RootLayout] Initial CSRF token from cookies (X-CSRF-TOKEN):", csrfToken);

    return (
        <html lang="en">
            <body>
                <AuthProvider initialAuthState={isAuthenticated}>
                    <Header/>
                    {children}
                    <ScrollToTopButton/>
                    <Toaster/>
                </AuthProvider>
            </body>
        </html>
    );
}
