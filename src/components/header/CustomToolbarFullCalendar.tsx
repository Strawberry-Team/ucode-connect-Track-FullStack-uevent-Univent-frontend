// /src/components/header/CustomToolbarFullCalendar.tsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import LoginModal from "@/components/auth/LoginModal";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/lib/auth";

export default function CustomToolbarFullCalendar() {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const { isAuthenticated, setAuthenticated } = useAuth();
    const pathname = usePathname();

    const handleLogout = async () => {
        try {
            await logout();
            setAuthenticated(false);
        } catch (err) {
            console.error("Ошибка выхода:", err);
        }
    };

    const showBorder = pathname !== "/";

    return (
        <header
            className={`z-30 px-custom sticky top-0 flex h-17 shrink-0 items-center gap-2 bg-background/95 backdrop-blur-md ${
                showBorder ? "border-b" : ""
            }`}
        >
            <div className="flex items-center justify-between gap-4 w-full relative">
                <Link href="/" className="flex items-center gap-2 cursor-pointer">
                    <Avatar className="h-13 w-13 rounded-lg shrink-0">
                        <AvatarImage src="/logo_favicon.png" alt="Логотип" />
                    </Avatar>
                    <span className="text-[24px] font-medium">Calendula</span>
                </Link>

                <div className="flex-1 flex justify-center">
                    <Input
                        type="text"
                        placeholder="Find events..."
                        className="text-[16px] py-5 px-5 font-medium w-full max-w-md rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <Button
                    variant="outline"
                    className="text-[16px] py-5 px-7 rounded-full font-medium"
                >
                    Create company
                </Button>

                <div>
                    {isAuthenticated ? (
                        <Button
                            variant="outline"
                            className="text-[16px] py-5 px-7 rounded-full font-medium"
                            onClick={handleLogout}
                        >
                            Выйти
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            className="text-[16px] py-5 px-7 rounded-full font-medium"
                            onClick={() => setIsLoginModalOpen(true)}
                        >
                            Sign up
                        </Button>
                    )}
                </div>
            </div>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)} // Убираем setAuthenticated(true)
            />
        </header>
    );
}