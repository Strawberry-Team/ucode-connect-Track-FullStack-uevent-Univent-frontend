import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import CustomToolbarFullCalendar from "@/components/header/CustomToolbarFullCalendar";
import React from "react";
import ScrollToTopButton from "@/components/ui/scroll-to-top-button";
import {AuthProvider} from "@/context/AuthContext";
import {cookies} from "next/headers";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = cookies() as any; // TODO НЕ льзя писать мне any, но пусть пока что так будет
    const accessToken = cookieStore.get("accessToken")?.value || null;
    const isAuthenticated = !!accessToken;

    return (
        <html lang="en">
            <body>
                <AuthProvider initialAuthState={isAuthenticated}>
                    <CustomToolbarFullCalendar />
                    {children}
                    <ScrollToTopButton/>
                </AuthProvider>
            </body>
        </html>
    );
}

// export default function RootLayout({
//                                        children,
//                                    }: Readonly<{
//     children: React.ReactNode;
// }>) {
//     return (
//         <html lang="en">
//             <body>
//                 <AuthProvider>
//                     <CustomToolbarFullCalendar/>
//                     <main>{children}</main>
//                     <ScrollToTopButton/>
//                 </AuthProvider>
//             </body>
//         </html>
//     );
// }
